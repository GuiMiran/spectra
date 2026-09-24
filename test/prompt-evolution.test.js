'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { DEFAULT_PROMPT_POLICY, PromptEvolutionRunner } = require('../lib/evolution');

const config = { model: 'fixture-model-v1', toolsHash: 'a'.repeat(64), tokenBudget: 2000 };
const suite = {
  schemaVersion: 1,
  cases: [
    { id: 'known-release', tier: 'known', critical: true,
      input: 'No test evidence for release', expected: { decision: 'reject' } },
    { id: 'heldout-game', tier: 'heldout', critical: true,
      input: 'GAME-04 has only a proposal', expected: { decision: 'reject' } },
  ],
};

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-prompt-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('promotes an evaluated prompt for the next run, with a pinned configuration', async t => {
  const root = project(t);
  const calls = [];
  const policy = { ...DEFAULT_PROMPT_POLICY, autoPromote: true };
  const runner = new PromptEvolutionRunner(root, {
    governance: 'The host owns permissions and the release gate.',
    policy,
    invoke: async args => {
      calls.push(args);
      return { decision: args.instructions === 'candidate v2' ? 'reject'
        : args.caseId === 'known-release' ? 'reject' : 'approve' };
    },
  });
  runner.initialize('baseline v1');
  const result = await runner.run({ candidate: 'candidate v2', suite, invocationConfig: config });
  assert.equal(result.decision, 'active');
  assert.equal(result.activeVersion, 2);
  assert.equal(result.evaluation.improvement, 0.5);
  assert.equal(result.evaluation.criticalFailures.length, 0);
  assert.equal(result.audit.valid, true);
  assert.equal(runner.active().instructions, 'candidate v2');
  assert.equal(calls.length, 4);
  assert.ok(calls.every(call => call.governance === 'The host owns permissions and the release gate.'
    && call.config.model === config.model && call.config.toolsHash === config.toolsHash
    && call.config.tokenBudget === config.tokenBudget && !('expected' in call)));
  assert.deepEqual(calls.map(call => call.instructions),
    ['baseline v1', 'candidate v2', 'baseline v1', 'candidate v2']);
  const rollback = runner.rollback(1, 'Post-promotion regression detected by the trusted host');
  assert.equal(rollback.activeVersion, 1);
  assert.equal(rollback.audit.valid, true);
  assert.equal(runner.active().instructions, 'baseline v1');
});

test('a passing candidate stays a proposal when automatic promotion is not authorized', async t => {
  const root = project(t);
  const runner = new PromptEvolutionRunner(root, {
    governance: 'Immutable policy',
    invoke: async ({ instructions, caseId }) => ({
      decision: instructions === 'candidate v2' || caseId === 'known-release' ? 'reject' : 'approve',
    }),
  });
  runner.initialize('baseline v1');
  const result = await runner.run({ candidate: 'candidate v2', suite, invocationConfig: config });
  assert.equal(result.decision, 'proposed');
  assert.equal(result.activeVersion, 1);
  assert.equal(runner.active().instructions, 'baseline v1');
});

test('an improvement in known cases cannot hide a heldout regression', async t => {
  const root = project(t);
  const expanded = { schemaVersion: 1, cases: [
    { id: 'known-1', tier: 'known', critical: false, input: 'one', expected: { decision: 'reject' } },
    { id: 'known-2', tier: 'known', critical: false, input: 'two', expected: { decision: 'reject' } },
    { id: 'known-3', tier: 'known', critical: false, input: 'three', expected: { decision: 'reject' } },
    { id: 'heldout-1', tier: 'heldout', critical: false, input: 'secret', expected: { decision: 'reject' } },
  ] };
  const runner = new PromptEvolutionRunner(root, {
    governance: 'Immutable policy',
    policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true },
    invoke: async ({ instructions, caseId }) => ({
      decision: instructions === 'candidate v2'
        ? caseId === 'heldout-1' ? 'approve' : 'reject'
        : ['known-1', 'heldout-1'].includes(caseId) ? 'reject' : 'approve',
    }),
  });
  runner.initialize('baseline v1');
  const result = await runner.run({ candidate: 'candidate v2', suite: expanded, invocationConfig: config });
  assert.equal(result.evaluation.improvement, 0.25);
  assert.deepEqual(result.evaluation.heldoutRegressions, ['heldout-1']);
  assert.equal(result.decision, 'rejected');
  assert.equal(runner.active().version, 1);
});

test('missing evidence and corrupted history fail before promotion', async t => {
  const root = project(t);
  const runner = new PromptEvolutionRunner(root, {
    governance: 'Immutable policy',
    policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true },
    invoke: async () => ({ decision: 'reject' }),
  });
  runner.initialize('baseline v1');
  await assert.rejects(runner.run({ candidate: 'candidate v2',
    suite: { schemaVersion: 1, cases: [suite.cases[0]] }, invocationConfig: config }), /known and heldout/);
  assert.equal(runner.active().version, 1);
  const audit = path.join(root, '.spectra', 'prompt-evolution', 'audit.jsonl');
  const first = JSON.parse(fs.readFileSync(audit, 'utf8').trim());
  first.payload.sha256 = 'tampered';
  fs.writeFileSync(audit, `${JSON.stringify(first)}\n`);
  assert.throws(() => runner.active(), /audit chain is invalid/);
});

test('changing the active pointer without an audit event fails closed', t => {
  const root = project(t);
  const runner = new PromptEvolutionRunner(root, {
    governance: 'Immutable policy', invoke: async () => ({ decision: 'reject' }),
  });
  runner.initialize('baseline v1');
  const stateFile = path.join(root, '.spectra', 'prompt-evolution', 'state.json');
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.versions[0].status = 'rejected';
  fs.writeFileSync(stateFile, JSON.stringify(state));
  assert.throws(() => runner.active(), /audited lifecycle/);
});

test('prompt-status exposes only the audited active version', t => {
  const root = project(t);
  const runner = new PromptEvolutionRunner(root, {
    governance: 'Immutable policy', invoke: async () => ({ decision: 'reject' }),
  });
  runner.initialize('baseline v1');
  const command = spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'spectra.js'),
    'prompt-status', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(command.status, 0);
  const result = JSON.parse(command.stdout);
  assert.equal(result.activeVersion, 1);
  assert.equal(result.audit.valid, true);
  assert.equal(result.versions[0].status, 'active');
});
