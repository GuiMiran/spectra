'use strict';

const path = require('node:path');
const {
  AuthorizedPromptAdapter,
  PromptEvaluationHost,
  loadPolicy,
  readTextFile,
  sha256,
} = require('../lib/evolution');

function env(name, fallback = undefined) {
  return process.env[name] || fallback;
}

function intEnv(name, fallback) {
  const value = env(name, fallback);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) throw new Error(`${name} must be an integer.`);
  return parsed;
}

function floatEnv(name, fallback) {
  const value = env(name, fallback);
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number.`);
  return parsed;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const candidateFileSetting = env('SPECTRA_PROMPT_CANDIDATE_FILE');
  const candidateFile = candidateFileSetting && path.resolve(projectRoot, candidateFileSetting);
  const candidateInstructions = candidateFile
    ? readTextFile(candidateFile, 'Candidate prompt')
    : env('SPECTRA_PROMPT_CANDIDATE');
  if (!candidateInstructions) {
    process.stdout.write(`${JSON.stringify({
      skipped: true,
      reason: 'candidate-not-configured',
    }, null, 2)}\n`);
    return;
  }
  const adapterEndpoint = env('SPECTRA_PROMPT_ADAPTER_URL');
  if (!adapterEndpoint) throw new Error('SPECTRA_PROMPT_ADAPTER_URL is required when a candidate exists.');
  const governanceFile = path.resolve(projectRoot,
    env('SPECTRA_PROMPT_GOVERNANCE_FILE', 'evals/prompt-evolution/game-04-pilot/governance.txt'));
  const baselineFile = path.resolve(projectRoot,
    env('SPECTRA_PROMPT_BASELINE_FILE', 'docs/prompts/maestro-es.md'));
  const suiteManifestFile = path.resolve(projectRoot,
    env('SPECTRA_PROMPT_SUITE_FILE', 'evals/prompt-evolution/game-04-pilot/suite.manifest.json'));
  const policyFile = path.resolve(projectRoot,
    env('SPECTRA_PROMPT_POLICY_FILE', 'evals/prompt-evolution/game-04-pilot/policy.json'));
  const baselineInstructions = readTextFile(baselineFile, 'Baseline prompt');
  const governance = readTextFile(governanceFile, 'Governance');
  const policy = loadPolicy(policyFile);
  const adapter = new AuthorizedPromptAdapter({
    endpoint: adapterEndpoint,
    token: env('SPECTRA_PROMPT_ADAPTER_TOKEN', null),
    timeoutMs: intEnv('SPECTRA_PROMPT_TIMEOUT_MS', '30000'),
  });
  const host = new PromptEvaluationHost(projectRoot, { governance, policy, adapter });
  const suiteManifestJson = env('SPECTRA_PROMPT_SUITE_JSON');
  const invocationConfig = {
    model: env('SPECTRA_PROMPT_MODEL', 'gpt-5-mini'),
    toolsHash: env('SPECTRA_PROMPT_TOOLS_HASH', sha256([])),
    tokenBudget: intEnv('SPECTRA_PROMPT_TOKEN_BUDGET', '2000'),
    sampling: {
      temperature: floatEnv('SPECTRA_PROMPT_TEMPERATURE', '0'),
      topP: floatEnv('SPECTRA_PROMPT_TOP_P', '1'),
      maxOutputTokens: intEnv('SPECTRA_PROMPT_MAX_OUTPUT_TOKENS', '512'),
      seed: intEnv('SPECTRA_PROMPT_SEED', '11'),
    },
    costBudget: {
      currency: env('SPECTRA_PROMPT_COST_CURRENCY', 'USD'),
      maxMicros: intEnv('SPECTRA_PROMPT_COST_BUDGET_MICROS', '5000000'),
    },
  };
  const result = await host.run({
    baselineInstructions,
    candidateInstructions,
    ...(suiteManifestJson
      ? { suiteManifest: JSON.parse(suiteManifestJson) }
      : { suiteManifestPath: suiteManifestFile }),
    invocationConfig,
    metadata: {
      baselineFile: path.relative(projectRoot, baselineFile),
      ...(candidateFile ? { candidateFile: path.relative(projectRoot, candidateFile) } : {}),
      governanceFile: path.relative(projectRoot, governanceFile),
      policyFile: path.relative(projectRoot, policyFile),
      adapterEndpointSha256: sha256(adapterEndpoint),
    },
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
