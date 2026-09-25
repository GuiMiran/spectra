'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DEFAULT_PROMPT_POLICY, PromptEvolutionRunner, PromptVersionStore } = require('./prompt-evolution');
const { ensureDir, readJson, sha256, writeJsonAtomic } = require('./utils');

function requireValid(condition, message) {
  if (!condition) throw new Error(message);
}

function resolveBoundedFile(root, relativePath, label) {
  requireValid(typeof relativePath === 'string' && relativePath.trim().length > 0,
    `${label} file is required.`);
  const resolved = path.resolve(root, relativePath);
  const bounded = path.relative(root, resolved);
  requireValid(bounded && !bounded.startsWith('..') && !path.isAbsolute(bounded),
    `${label} file escaped the evaluator-owned suite root.`);
  requireValid(fs.existsSync(resolved) && fs.lstatSync(resolved).isFile(),
    `${label} file is missing: ${relativePath}.`);
  return resolved;
}

function loadSuiteManifest(manifestFile) {
  const file = path.resolve(manifestFile);
  const manifest = readJson(file);
  requireValid(manifest?.schemaVersion === 1
    && typeof manifest.suiteId === 'string' && manifest.suiteId.trim()
    && typeof manifest.suiteVersion === 'string' && manifest.suiteVersion.trim()
    && Array.isArray(manifest.cases) && manifest.cases.length >= 2,
  'Prompt evaluation suite manifest is invalid.');
  const suiteRoot = path.dirname(file);
  const cases = manifest.cases.map(item => {
    requireValid(item && typeof item.id === 'string' && item.id.trim()
      && ['known', 'heldout'].includes(item.tier)
      && typeof item.critical === 'boolean'
      && typeof item.inputFile === 'string' && typeof item.inputSha256 === 'string'
      && typeof item.expectedFile === 'string' && typeof item.expectedSha256 === 'string',
    'Prompt evaluation suite case metadata is invalid.');
    const inputFile = resolveBoundedFile(suiteRoot, item.inputFile, `${item.id} input`);
    const expectedFile = resolveBoundedFile(suiteRoot, item.expectedFile, `${item.id} expected`);
    const input = fs.readFileSync(inputFile, 'utf8');
    const expected = readJson(expectedFile);
    requireValid(sha256(input) === item.inputSha256, `Input evidence hash mismatch for ${item.id}.`);
    requireValid(sha256(expected) === item.expectedSha256, `Expected evidence hash mismatch for ${item.id}.`);
    return {
      id: item.id,
      tier: item.tier,
      critical: item.critical,
      input,
      expected,
      inputFile: path.relative(suiteRoot, inputFile),
      inputSha256: item.inputSha256,
      expectedFile: path.relative(suiteRoot, expectedFile),
      expectedSha256: item.expectedSha256,
    };
  });
  const suite = {
    schemaVersion: 1,
    cases: cases.map(item => ({
      id: item.id,
      tier: item.tier,
      critical: item.critical,
      input: item.input,
      expected: item.expected,
    })),
  };
  return {
    manifestFile: file,
    manifestHash: sha256(manifest),
    suiteId: manifest.suiteId,
    suiteVersion: manifest.suiteVersion,
    cases: cases.map(item => ({
      id: item.id,
      tier: item.tier,
      critical: item.critical,
      inputFile: item.inputFile,
      inputSha256: item.inputSha256,
      expectedFile: item.expectedFile,
      expectedSha256: item.expectedSha256,
    })),
    suite,
  };
}

class AuthorizedPromptAdapter {
  constructor({ endpoint, token = null, timeoutMs = 30000, headers = {}, fetchImpl = globalThis.fetch } = {}) {
    requireValid(typeof endpoint === 'string' && endpoint.trim().length > 0,
      'Authorized prompt adapter endpoint is required.');
    requireValid(typeof fetchImpl === 'function', 'A fetch implementation is required.');
    requireValid(Number.isInteger(timeoutMs) && timeoutMs > 0, 'Adapter timeout must be a positive integer.');
    this.endpoint = endpoint;
    this.token = token;
    this.timeoutMs = timeoutMs;
    this.headers = headers;
    this.fetch = fetchImpl;
  }

  async invoke({ governance, instructions, input, caseId, config }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...this.headers,
          ...(this.token ? { authorization: ['Bearer', this.token].join(' ') } : {}),
        },
        body: JSON.stringify({
          schemaVersion: 1,
          governance,
          instructions,
          input,
          caseId,
          config,
        }),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      requireValid(response.ok && body && body.schemaVersion === 1,
        `Authorized prompt adapter rejected ${caseId}.`);
      return body;
    } finally {
      clearTimeout(timer);
    }
  }
}

function loadPolicy(policyFile) {
  if (!policyFile) return DEFAULT_PROMPT_POLICY;
  return readJson(path.resolve(policyFile));
}

function promptRunId(timestamp, suiteId, candidate) {
  return `prompt-run-${timestamp.replace(/[^0-9]/g, '').slice(0, 17)}-${sha256(`${suiteId}:${candidate}`).slice(0, 8)}`;
}

class PromptEvaluationHost {
  constructor(projectRoot, { governance, policy = DEFAULT_PROMPT_POLICY, adapter, clock } = {}) {
    requireValid(typeof governance === 'string' && governance.trim().length > 0,
      'Trusted governance text is required.');
    requireValid(adapter && typeof adapter.invoke === 'function',
      'An authorized prompt adapter is required.');
    this.projectRoot = path.resolve(projectRoot);
    this.policy = policy;
    this.governance = governance;
    this.adapter = adapter;
    this.clock = clock || (() => new Date().toISOString());
    this.runner = new PromptEvolutionRunner(this.projectRoot, {
      governance: this.governance,
      policy: this.policy,
      invoke: args => this.adapter.invoke(args),
      clock: this.clock,
    });
  }

  ensureInitialized(baselineInstructions) {
    try {
      return this.runner.active();
    } catch (error) {
      requireValid(/not initialized/.test(error.message),
        error.message);
      requireValid(typeof baselineInstructions === 'string' && baselineInstructions.trim().length > 0,
        'Baseline prompt instructions are required to initialize the prompt registry.');
      this.runner.initialize(baselineInstructions);
      return this.runner.active();
    }
  }

  runArtifactFile(runId) {
    return path.join(this.projectRoot, '.spectra', 'prompt-evolution', 'runs', `${runId}.json`);
  }

  async run({ baselineInstructions, candidateInstructions, suiteManifestPath, invocationConfig, metadata = null }) {
    requireValid(typeof candidateInstructions === 'string' && candidateInstructions.trim().length > 0,
      'Candidate prompt instructions are required.');
    const baselineBefore = this.ensureInitialized(baselineInstructions);
    const suite = loadSuiteManifest(suiteManifestPath);
    const result = await this.runner.run({
      candidate: candidateInstructions,
      suite: suite.suite,
      invocationConfig,
    });
    const activeAfter = this.runner.active();
    const runId = promptRunId(this.clock(), suite.suiteId, candidateInstructions);
    const artifact = {
      schemaVersion: 1,
      runId,
      generatedAt: this.clock(),
      baselineBefore: { version: baselineBefore.version, sha256: baselineBefore.sha256 },
      activeAfter: { version: activeAfter.version, sha256: activeAfter.sha256 },
      candidateSha256: sha256(candidateInstructions),
      suite: {
        suiteId: suite.suiteId,
        suiteVersion: suite.suiteVersion,
        manifestHash: suite.manifestHash,
        cases: suite.cases,
      },
      decision: result.decision,
      decisionReason: result.decisionReason,
      evaluation: result.evaluation,
      metadata,
    };
    const artifactFile = this.runArtifactFile(runId);
    ensureDir(path.dirname(artifactFile));
    writeJsonAtomic(artifactFile, artifact);
    return { ...artifact, artifactFile };
  }
}

function readTextFile(file, label) {
  const resolved = path.resolve(file);
  requireValid(fs.existsSync(resolved) && fs.lstatSync(resolved).isFile(),
    `${label} file is missing.`);
  return fs.readFileSync(resolved, 'utf8');
}

module.exports = {
  AuthorizedPromptAdapter,
  PromptEvaluationHost,
  PromptVersionStore,
  loadPolicy,
  loadSuiteManifest,
  readTextFile,
};
