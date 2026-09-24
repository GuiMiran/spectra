'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { deepFreeze, ensureDir, readJson, sha256, writeJsonAtomic } = require('./utils');

const GENESIS = '0'.repeat(64);
const DEFAULT_PROMPT_POLICY = deepFreeze({
  schemaVersion: 1,
  minimumImprovement: 0.1,
  requireCriticalPass: true,
  requireHeldoutNonRegression: true,
  autoPromote: false,
  maxCases: 100,
  maxPromptBytes: 100000,
});

function requireValid(condition, message) {
  if (!condition) throw new Error(message);
}

function validatePolicy(policy) {
  requireValid(policy && Object.keys(policy).sort().join(',') === Object.keys(DEFAULT_PROMPT_POLICY).sort().join(','),
    'Prompt policy fields must match the trusted policy contract.');
  requireValid(policy.schemaVersion === 1
    && Number.isFinite(policy.minimumImprovement) && policy.minimumImprovement > 0 && policy.minimumImprovement <= 1
    && typeof policy.requireCriticalPass === 'boolean'
    && typeof policy.requireHeldoutNonRegression === 'boolean'
    && typeof policy.autoPromote === 'boolean'
    && Number.isInteger(policy.maxCases) && policy.maxCases > 0 && policy.maxCases <= 100
    && Number.isInteger(policy.maxPromptBytes) && policy.maxPromptBytes > 0 && policy.maxPromptBytes <= 100000,
  'Invalid trusted prompt policy.');
  return deepFreeze({ ...policy });
}

function validatePrompt(value, policy) {
  requireValid(typeof value === 'string' && value.trim().length > 0
    && Buffer.byteLength(value, 'utf8') <= policy.maxPromptBytes,
  'Prompt instructions must be non-empty and within the configured size limit.');
  return value;
}

function validateSuite(suite, policy) {
  requireValid(suite?.schemaVersion === 1 && Array.isArray(suite.cases)
    && suite.cases.length >= 2 && suite.cases.length <= policy.maxCases,
  'Evaluation suite must contain bounded known and heldout cases.');
  const ids = new Set();
  for (const item of suite.cases) {
    requireValid(item && typeof item.id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(item.id)
      && !ids.has(item.id), 'Evaluation case IDs must be unique and valid.');
    ids.add(item.id);
    requireValid(['known', 'heldout'].includes(item.tier)
      && typeof item.input === 'string' && item.input.length > 0
      && item.expected && typeof item.expected === 'object' && !Array.isArray(item.expected)
      && Object.keys(item.expected).length > 0
      && typeof item.critical === 'boolean',
    `Invalid evaluation case: ${item.id}.`);
    for (const [key, value] of Object.entries(item.expected)) {
      requireValid(/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(key)
        && (typeof value === 'string' || typeof value === 'boolean' || Number.isFinite(value)),
      `Case ${item.id} has an unsupported expected value.`);
    }
  }
  requireValid(suite.cases.some(item => item.tier === 'known')
    && suite.cases.some(item => item.tier === 'heldout'),
  'Evaluation suite needs both known and heldout cases.');
  return suite;
}

function matchesExpected(response, expected) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) return false;
  return Object.entries(expected).every(([key, value]) =>
    Object.prototype.hasOwnProperty.call(response, key) && response[key] === value);
}

class PromptVersionStore {
  constructor(projectRoot, clock = () => new Date().toISOString()) {
    this.root = path.join(path.resolve(projectRoot), '.spectra', 'prompt-evolution');
    this.stateFile = path.join(this.root, 'state.json');
    this.auditFile = path.join(this.root, 'audit.jsonl');
    this.clock = clock;
  }

  read() {
    const state = readJson(this.stateFile);
    requireValid(state && state.schemaVersion === 1 && Number.isInteger(state.activeVersion),
      'Prompt registry is not initialized.');
    this.verify(state);
    return state;
  }

  verify(state) {
    const events = fs.existsSync(this.auditFile)
      ? fs.readFileSync(this.auditFile, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
    let head = GENESIS;
    const versions = [];
    let activeVersion = null;
    for (const [index, event] of events.entries()) {
      const { hash, ...body } = event;
      requireValid(event.sequence === index + 1 && event.previousHash === head
        && hash === sha256(body), 'Prompt audit chain is invalid.');
      const payload = event.payload;
      if (index === 0 && event.type === 'prompt.initialized'
        && payload?.version === 1 && typeof payload.sha256 === 'string') {
        versions.push({ version: 1, sha256: payload.sha256, status: 'active' });
        activeVersion = 1;
        requireValid(state.governanceHash === payload.governanceHash
          && state.policyHash === payload.policyHash, 'Prompt governance or policy digest changed.');
      } else if (index > 0 && event.type === 'prompt.evaluated'
        && payload?.version === versions.length + 1
        && ['active', 'proposed', 'rejected'].includes(payload.decision)) {
        if (payload.decision === 'active') {
          versions.find(item => item.version === activeVersion).status = 'retired';
          activeVersion = payload.version;
        }
        versions.push({ version: payload.version, sha256: payload.sha256, status: payload.decision });
      } else if (index > 0 && event.type === 'prompt.rolled_back'
        && Number.isInteger(payload?.targetVersion) && payload.targetVersion !== activeVersion
        && payload.priorVersion === activeVersion
        && typeof payload.reason === 'string' && payload.reason.trim()
        && versions.some(item => item.version === payload.targetVersion && item.status === 'retired')) {
        versions.find(item => item.version === activeVersion).status = 'retired';
        versions.find(item => item.version === payload.targetVersion).status = 'active';
        activeVersion = payload.targetVersion;
      } else {
        throw new Error('Prompt audit lifecycle is invalid.');
      }
      head = hash;
    }
    requireValid(events.length > 0 && state.auditHead === head, 'Prompt registry audit head is invalid.');
    requireValid(state.activeVersion === activeVersion && sha256(state.versions) === sha256(versions),
      'Prompt registry does not match its audited lifecycle.');
    for (const entry of state.versions) {
      const file = path.join(this.root, 'versions', `v${entry.version}.txt`);
      requireValid(fs.existsSync(file) && fs.lstatSync(file).isFile()
        && sha256(fs.readFileSync(file, 'utf8')) === entry.sha256,
      `Prompt version ${entry.version} has changed.`);
    }
    requireValid(state.versions.some(entry => entry.version === state.activeVersion
      && entry.status === 'active'), 'Active prompt pointer is invalid.');
    return { valid: true, events: events.length, head };
  }

  append(state, type, payload) {
    const events = fs.existsSync(this.auditFile)
      ? fs.readFileSync(this.auditFile, 'utf8').trim().split('\n').filter(Boolean).length : 0;
    const event = { schemaVersion: 1, sequence: events + 1, timestamp: this.clock(),
      previousHash: state.auditHead, type, payload };
    event.hash = sha256(event);
    fs.appendFileSync(this.auditFile, `${JSON.stringify(event)}\n`, 'utf8');
    state.auditHead = event.hash;
  }

  initialize(instructions, governanceHash, policyHash) {
    requireValid(!fs.existsSync(this.stateFile) && !fs.existsSync(this.auditFile),
      'Prompt registry already exists.');
    ensureDir(path.join(this.root, 'versions'));
    const sha = sha256(instructions);
    fs.writeFileSync(path.join(this.root, 'versions', 'v1.txt'), instructions, { flag: 'wx' });
    const state = { schemaVersion: 1, activeVersion: 1, governanceHash, policyHash,
      versions: [{ version: 1, sha256: sha, status: 'active' }], auditHead: GENESIS };
    this.append(state, 'prompt.initialized', { version: 1, sha256: sha, governanceHash, policyHash });
    writeJsonAtomic(this.stateFile, state);
    return this.read();
  }

  active() {
    const state = this.read();
    const entry = state.versions.find(item => item.version === state.activeVersion);
    return { version: entry.version, sha256: entry.sha256,
      instructions: fs.readFileSync(path.join(this.root, 'versions', `v${entry.version}.txt`), 'utf8'),
      governanceHash: state.governanceHash, policyHash: state.policyHash };
  }

  record(instructions, evaluation, decision) {
    const state = this.read();
    const version = Math.max(...state.versions.map(item => item.version)) + 1;
    const sha = sha256(instructions);
    fs.writeFileSync(path.join(this.root, 'versions', `v${version}.txt`), instructions, { flag: 'wx' });
    state.versions.push({ version, sha256: sha, status: decision });
    if (decision === 'active') {
      state.versions.find(item => item.version === state.activeVersion).status = 'retired';
      state.activeVersion = version;
    }
    this.append(state, 'prompt.evaluated', { version, sha256: sha, evaluation, decision });
    writeJsonAtomic(this.stateFile, state);
    return { version, sha256: sha, decision, activeVersion: state.activeVersion, audit: this.verify(state) };
  }

  rollback(targetVersion, reason) {
    const state = this.read();
    requireValid(typeof reason === 'string' && reason.trim(), 'Rollback requires an audited reason.');
    const target = state.versions.find(item => item.version === targetVersion && item.status === 'retired');
    requireValid(target, 'Rollback target must be a previously active version.');
    const priorVersion = state.activeVersion;
    state.versions.find(item => item.version === priorVersion).status = 'retired';
    target.status = 'active';
    state.activeVersion = targetVersion;
    this.append(state, 'prompt.rolled_back', { targetVersion, priorVersion, reason });
    writeJsonAtomic(this.stateFile, state);
    return { activeVersion: targetVersion, audit: this.verify(state) };
  }
}

class PromptEvolutionRunner {
  constructor(projectRoot, { governance, policy = DEFAULT_PROMPT_POLICY, invoke, clock } = {}) {
    this.policy = validatePolicy(policy);
    requireValid(typeof governance === 'string' && governance.trim(), 'Trusted governance text is required.');
    requireValid(typeof invoke === 'function', 'An independent invocation adapter is required.');
    this.governance = governance;
    this.invoke = invoke;
    this.store = new PromptVersionStore(projectRoot, clock);
  }

  initialize(instructions) {
    return this.store.initialize(validatePrompt(instructions, this.policy),
      sha256(this.governance), sha256(this.policy));
  }

  active() {
    const active = this.store.active();
    requireValid(active.governanceHash === sha256(this.governance)
      && active.policyHash === sha256(this.policy), 'Trusted governance or policy changed.');
    return active;
  }

  rollback(targetVersion, reason) {
    this.active();
    return this.store.rollback(targetVersion, reason);
  }

  async run({ candidate, suite, invocationConfig }) {
    const baseline = this.active();
    validatePrompt(candidate, this.policy);
    validateSuite(suite, this.policy);
    requireValid(typeof invocationConfig?.model === 'string' && invocationConfig.model
      && typeof invocationConfig?.toolsHash === 'string' && /^[a-f0-9]{64}$/.test(invocationConfig.toolsHash)
      && Number.isInteger(invocationConfig?.tokenBudget) && invocationConfig.tokenBudget > 0,
    'Pinned model, tool hash and token budget are required.');
    requireValid(sha256(candidate) !== baseline.sha256, 'Candidate is identical to the active prompt.');
    const config = deepFreeze({ model: invocationConfig.model,
      toolsHash: invocationConfig.toolsHash, tokenBudget: invocationConfig.tokenBudget });
    const observations = [];
    for (const item of suite.cases) {
      const replies = [];
      for (const instructions of [baseline.instructions, candidate]) {
        // The adapter receives no expected answer. The trusted host must keep
        // governance in a higher-priority context than mutable instructions.
        const reply = await this.invoke({ governance: this.governance, instructions,
          input: item.input, caseId: item.id, config });
        requireValid(reply && typeof reply === 'object' && !Array.isArray(reply),
          `Invocation returned no structured response for ${item.id}.`);
        replies.push(reply);
      }
      observations.push({ id: item.id, tier: item.tier, critical: item.critical,
        baselinePassed: matchesExpected(replies[0], item.expected),
        candidatePassed: matchesExpected(replies[1], item.expected),
        baselineResponseHash: sha256(replies[0]), candidateResponseHash: sha256(replies[1]) });
    }
    const score = side => observations.filter(item => item[`${side}Passed`]).length / observations.length;
    const baselineScore = score('baseline');
    const candidateScore = score('candidate');
    const criticalFailures = observations.filter(item => item.critical && !item.candidatePassed).map(item => item.id);
    const heldout = observations.filter(item => item.tier === 'heldout');
    const heldoutRegressions = heldout.filter(item => item.baselinePassed && !item.candidatePassed).map(item => item.id);
    const improvement = Number((candidateScore - baselineScore).toFixed(6));
    const eligible = improvement >= this.policy.minimumImprovement
      && (!this.policy.requireCriticalPass || criticalFailures.length === 0)
      && (!this.policy.requireHeldoutNonRegression || heldoutRegressions.length === 0);
    const decision = !eligible ? 'rejected' : this.policy.autoPromote ? 'active' : 'proposed';
    const evaluation = { schemaVersion: 1, suiteHash: sha256(suite), governanceHash: baseline.governanceHash,
      policyHash: baseline.policyHash, invocationConfig: config, baselineVersion: baseline.version,
      baselineScore, candidateScore, improvement, criticalFailures, heldoutRegressions,
      observations, eligible };
    return { ...this.store.record(candidate, evaluation, decision), evaluation };
  }
}

module.exports = { DEFAULT_PROMPT_POLICY, PromptEvolutionRunner, PromptVersionStore };
