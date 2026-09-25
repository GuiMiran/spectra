'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  AuthorizedPromptAdapter,
  DEFAULT_PROMPT_POLICY,
  PromptEvaluationHost,
  PromptVersionStore,
  sha256,
} = require('../lib/evolution');

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-prompt-host-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function writeSuite(root) {
  const suiteRoot = path.join(root, 'suite');
  fs.mkdirSync(path.join(suiteRoot, 'inputs'), { recursive: true });
  fs.mkdirSync(path.join(suiteRoot, 'expected'), { recursive: true });
  const files = {
    knownInput: path.join(suiteRoot, 'inputs', 'known-release.txt'),
    heldoutInput: path.join(suiteRoot, 'inputs', 'heldout-game-04.txt'),
    knownExpected: path.join(suiteRoot, 'expected', 'known-release.json'),
    heldoutExpected: path.join(suiteRoot, 'expected', 'heldout-game-04.json'),
  };
  fs.writeFileSync(files.knownInput, 'No test evidence for release', 'utf8');
  fs.writeFileSync(files.heldoutInput, 'GAME-04 has only a proposal', 'utf8');
  fs.writeFileSync(files.knownExpected, `${JSON.stringify({ decision: 'reject' }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(files.heldoutExpected, `${JSON.stringify({ decision: 'reject' }, null, 2)}\n`, 'utf8');
  const manifest = {
    schemaVersion: 1,
    suiteId: 'mother-prompt-game-04-pilot',
    suiteVersion: '2026-09-25',
    cases: [
      {
        id: 'known-release',
        tier: 'known',
        critical: true,
        inputFile: 'inputs/known-release.txt',
        inputSha256: sha256(fs.readFileSync(files.knownInput, 'utf8')),
        expectedFile: 'expected/known-release.json',
        expectedSha256: sha256(JSON.parse(fs.readFileSync(files.knownExpected, 'utf8'))),
      },
      {
        id: 'heldout-game-04',
        tier: 'heldout',
        critical: true,
        inputFile: 'inputs/heldout-game-04.txt',
        inputSha256: sha256(fs.readFileSync(files.heldoutInput, 'utf8')),
        expectedFile: 'expected/heldout-game-04.json',
        expectedSha256: sha256(JSON.parse(fs.readFileSync(files.heldoutExpected, 'utf8'))),
      },
    ],
  };
  const manifestFile = path.join(suiteRoot, 'suite.manifest.json');
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { manifestFile, files };
}

async function createAdapterServer(t, handler) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    requests.push(body);
    const payload = await handler(body);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(`${JSON.stringify({ schemaVersion: 1, ...payload })}\n`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  return { endpoint: `http://127.0.0.1:${server.address().port}`, requests };
}

function invocationConfig(costBudget = 5000) {
  return {
    model: 'fixture-model-v1',
    toolsHash: 'a'.repeat(64),
    tokenBudget: 2000,
    sampling: { temperature: 0, topP: 1, maxOutputTokens: 128, seed: 7 },
    costBudget: { currency: 'USD', maxMicros: costBudget },
  };
}

test('authorized prompt host records a GAME-04 pilot run without exposing expected answers', async t => {
  const root = project(t);
  const suite = writeSuite(root);
  const { endpoint, requests } = await createAdapterServer(t, body => {
    const candidate = body.instructions === 'candidate v2';
    return {
      response: { decision: candidate || body.caseId === 'known-release' ? 'reject' : 'approve' },
      usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
      cost: { currency: 'USD', inputMicros: 400, outputMicros: 100, totalMicros: 500 },
      latencyMs: candidate ? 25 : 20,
      finishReason: 'stop',
    };
  });
  const host = new PromptEvaluationHost(root, {
    governance: 'Trusted governance.',
    policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true },
    adapter: new AuthorizedPromptAdapter({ endpoint }),
    clock: () => '2026-09-25T03:29:40.000Z',
  });

  const result = await host.run({
    baselineInstructions: 'baseline v1',
    candidateInstructions: 'candidate v2',
    suiteManifestPath: suite.manifestFile,
    invocationConfig: invocationConfig(),
    metadata: { pilot: 'GAME-04' },
  });

  assert.equal(result.decision, 'active');
  assert.equal(result.decisionReason, 'candidate-promoted-for-next-run');
  assert.equal(result.baselineBefore.version, 1);
  assert.equal(result.activeAfter.version, 2);
  assert.equal(result.evaluation.improvement, 0.5);
  assert.equal(result.evaluation.telemetry.baseline.usage.totalTokens, 24);
  assert.equal(result.evaluation.telemetry.candidate.usage.totalTokens, 24);
  assert.equal(result.evaluation.telemetry.candidate.cost.totalMicros, 1000);
  assert.equal(result.suite.suiteVersion, '2026-09-25');
  assert.ok(fs.existsSync(result.artifactFile));
  const artifact = JSON.parse(fs.readFileSync(result.artifactFile, 'utf8'));
  assert.equal(artifact.metadata.pilot, 'GAME-04');
  assert.equal(artifact.evaluation.observations.length, 2);
  assert.deepEqual(requests.map(body => body.instructions),
    ['baseline v1', 'candidate v2', 'baseline v1', 'candidate v2']);
  assert.ok(requests.every(body => !('expected' in body)));
  assert.ok(requests.every(body => Object.keys(body).sort().join(',') ===
    'caseId,config,governance,input,instructions,schemaVersion'));
});

test('suite evidence hash mismatches fail before any model invocation', async t => {
  const root = project(t);
  const suite = writeSuite(root);
  fs.writeFileSync(suite.files.heldoutInput, 'tampered heldout input', 'utf8');
  let invoked = false;
  const host = new PromptEvaluationHost(root, {
    governance: 'Trusted governance.',
    adapter: { invoke: async () => { invoked = true; return { response: { decision: 'reject' } }; } },
  });

  await assert.rejects(host.run({
    baselineInstructions: 'baseline v1',
    candidateInstructions: 'candidate v2',
    suiteManifestPath: suite.manifestFile,
    invocationConfig: invocationConfig(),
  }), /Input evidence hash mismatch/);
  assert.equal(invoked, false);
});

test('a heldout regression is rejected, keeps the active prompt, and still allows audited rollback', async t => {
  const root = project(t);
  const suite = writeSuite(root);
  const { endpoint } = await createAdapterServer(t, body => {
    let decision = 'reject';
    if (body.instructions === 'baseline v1') decision = body.caseId === 'known-release' ? 'reject' : 'approve';
    if (body.instructions === 'candidate v2') decision = 'reject';
    if (body.instructions === 'candidate v3') decision = body.caseId === 'known-release' ? 'reject' : 'approve';
    return {
      response: { decision },
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      cost: { currency: 'USD', inputMicros: 10, outputMicros: 10, totalMicros: 20 },
      latencyMs: 5,
      finishReason: 'stop',
    };
  });
  const host = new PromptEvaluationHost(root, {
    governance: 'Trusted governance.',
    policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true },
    adapter: new AuthorizedPromptAdapter({ endpoint }),
    clock: () => '2026-09-25T03:29:40.000Z',
  });

  const promoted = await host.run({
    baselineInstructions: 'baseline v1',
    candidateInstructions: 'candidate v2',
    suiteManifestPath: suite.manifestFile,
    invocationConfig: invocationConfig(),
  });
  assert.equal(promoted.activeAfter.version, 2);

  const regressed = await host.run({
    baselineInstructions: 'baseline v1',
    candidateInstructions: 'candidate v3',
    suiteManifestPath: suite.manifestFile,
    invocationConfig: invocationConfig(),
  });
  assert.equal(regressed.decision, 'rejected');
  assert.equal(regressed.decisionReason, 'candidate-regressed-heldout');
  assert.equal(regressed.activeAfter.version, 2);

  const store = new PromptVersionStore(root);
  const rollback = store.rollback(1, 'Regression detected by the trusted evaluator');
  assert.equal(rollback.activeVersion, 1);
  assert.equal(store.active().version, 1);
});

test('changing the policy hash fails closed on the next host run', async t => {
  const root = project(t);
  const suite = writeSuite(root);
  const { endpoint } = await createAdapterServer(t, body => ({
    response: { decision: body.instructions === 'candidate v2' || body.caseId === 'known-release' ? 'reject' : 'approve' },
    usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    cost: { currency: 'USD', inputMicros: 1, outputMicros: 1, totalMicros: 2 },
    latencyMs: 1,
    finishReason: 'stop',
  }));
  const adapter = new AuthorizedPromptAdapter({ endpoint });
  const firstHost = new PromptEvaluationHost(root, {
    governance: 'Trusted governance.',
    policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true },
    adapter,
  });
  await firstHost.run({
    baselineInstructions: 'baseline v1',
    candidateInstructions: 'candidate v2',
    suiteManifestPath: suite.manifestFile,
    invocationConfig: invocationConfig(),
  });

  const changedPolicyHost = new PromptEvaluationHost(root, {
    governance: 'Trusted governance.',
    policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true, minimumImprovement: 0.2 },
    adapter,
  });
  await assert.rejects(changedPolicyHost.run({
    baselineInstructions: 'baseline v1',
    candidateInstructions: 'candidate v3',
    suiteManifestPath: suite.manifestFile,
    invocationConfig: invocationConfig(),
  }), /Trusted governance or policy changed/);
});
