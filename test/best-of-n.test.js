'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { runBestOfN, verifyBestOfNReport } = require('../lib/evaluation/best-of-n');
const { runDemo } = require('../scripts/best-of-n-demo');

function harness() {
  const executor = { model: 'test-model', harnessVersion: 'v1', toolsHash: 'a'.repeat(64) };
  const options = {
    schemaVersion: 1, executor, n: 3, timeoutMs: 100,
    budget: { tokens: 100, toolCalls: 10 },
    limits: { baseline: { tokens: 10, toolCalls: 1 }, candidate: { tokens: 20, toolCalls: 1 },
      select: { tokens: 5, toolCalls: 0 }, evaluate: { tokens: 10, toolCalls: 0 } },
    task: { id: 'public', input: 'Public task' }, suiteHash: 'b'.repeat(64), oracleHash: 'c'.repeat(64),
    selectionMetric: 'visible', evaluationMetric: 'heldout',
  };
  const calls = [];
  const reply = fields => ({ executor, usage: { tokens: 2, toolCalls: 0 }, ...fields });
  const adapters = {
    baseline: async request => { calls.push(['baseline', request]); return reply({ artifact: `baseline-${request.index}` }); },
    candidate: async request => { calls.push(['candidate', request]); return reply({ artifact: 'candidate' }); },
    select: async request => { calls.push(['select', request]); return reply({ score: request.arm === 'candidate' ? 0.8 : [0.3, 0.9, 0.1][request.index] }); },
    evaluate: async request => { calls.push(['evaluate', request]); return reply({ score: request.artifact === 'candidate' ? 0.9 : 0.5,
      suiteHash: request.suiteHash, oracleHash: request.oracleHash, metric: request.metric, split: request.split,
      knownGoodPreserved: true, noOpCompared: true,
      faults: [{ id: 'bad', expectedDetected: true, observedDetected: true }, { id: 'good', expectedDetected: false, observedDetected: false }] }); },
  };
  return { options, calls, adapters, reply };
}

test('selects best visible baseline before held-out evaluation under equal whole-arm limits', async () => {
  const h = harness(); const report = await runBestOfN(h.options, h.adapters);
  assert.equal(report.status, 'COMPLETED');
  assert.equal(report.assessment.verdict, 'PASS');
  assert.equal(report.selected.baselineIndex, 1);
  assert.deepEqual(h.calls.filter(([phase]) => phase === 'evaluate').map(([, request]) => request.artifact), ['baseline-1', 'candidate']);
  assert.equal(report.arms.baseline.consumed.tokens, 14); // 3 generations + 3 selectors + evaluator
  assert.equal(report.arms.candidate.consumed.tokens, 6);
  assert.deepEqual(report.arms.baseline.budget, report.arms.candidate.budget);
  const firstEval = h.calls.findIndex(([phase]) => phase === 'evaluate');
  assert.ok(h.calls.slice(firstEval).every(([phase]) => phase === 'evaluate'));
  assert.ok(h.calls.slice(firstEval).every(([, request]) => !('arm' in request) && !('index' in request)));
  assert.ok(h.calls.filter(([phase]) => phase !== 'evaluate').every(([, request]) => !('suiteHash' in request) && !('oracleHash' in request)));
  assert.equal(Object.isFrozen(report), true);
});

test('ties select the first candidate and later held-out scores never select a different one', async () => {
  const h = harness(); h.adapters.select = async () => h.reply({ score: 0.5 });
  assert.equal((await runBestOfN(h.options, h.adapters)).selected.baselineIndex, 0);
});

test('stops before a reservation would exceed the arm budget and emits no comparison', async () => {
  const h = harness(); h.options.budget.tokens = 10;
  const report = await runBestOfN(h.options, h.adapters);
  assert.equal(report.status, 'BUDGET_STOP');
  assert.equal(h.calls.length, 0);
  assert.equal(report.comparison, null);
  assert.equal(report.assessment.verdict, 'UNRESOLVED');
});

test('all baseline attempts and selection costs count towards exhaustion', async () => {
  const h = harness(); h.options.budget.tokens = 20;
  h.adapters.baseline = async request => { h.calls.push(['baseline', request]); return h.reply({ artifact: 'baseline', usage: { tokens: 10, toolCalls: 1 } }); };
  const report = await runBestOfN(h.options, h.adapters);
  assert.equal(report.status, 'BUDGET_STOP');
  assert.equal(report.arms.baseline.consumed.tokens, 12);
  assert.equal(report.arms.baseline.calls, 2);
  assert.equal(report.comparison, null);
});

test('missing, oversized or decorated telemetry and mismatched executors fail closed', async () => {
  for (const fields of [ { usage: null }, { usage: { tokens: 21, toolCalls: 0 } },
    { usage: { tokens: 1, toolCalls: 0, secret: 'sensitive' } }, { executor: { model: 'different' } } ]) {
    const h = harness(); h.adapters.candidate = async () => h.reply({ artifact: 'candidate', ...fields });
    const report = await runBestOfN(h.options, h.adapters);
    assert.equal(report.status, 'INFRA_ERROR');
    assert.equal(report.comparison, null);
    assert.equal(report.events.at(-1).usageUnresolved, true);
    assert.ok(!JSON.stringify(report).includes('sensitive'));
  }
});

test('timeouts abort cooperatively and do not authorize another call', async () => {
  const h = harness(); h.options.timeoutMs = 10;
  let aborted = false;
  h.adapters.candidate = ({ signal }) => new Promise(() => { signal.addEventListener('abort', () => { aborted = true; }); });
  const report = await runBestOfN(h.options, h.adapters);
  assert.equal(report.status, 'INFRA_ERROR'); assert.equal(aborted, true);
  assert.equal(report.arms.candidate.calls, 1);
});

test('synchronous callbacks that finish after the timeout fail closed', async () => {
  const h = harness(); h.options.timeoutMs = 10;
  h.adapters.candidate = () => {
    const deadline = process.hrtime.bigint() + 30_000_000n;
    while (process.hrtime.bigint() < deadline) {}
    return h.reply({ artifact: 'candidate' });
  };
  const report = await runBestOfN(h.options, h.adapters);
  assert.equal(report.status, 'INFRA_ERROR');
  assert.equal(report.arms.candidate.calls, 1);
});

test('invalid configuration and public-task leakage fail before callbacks', async () => {
  for (const mutate of [h => { h.options.n = 1; }, h => { h.options.task.expected = 'private'; },
    h => { h.options.evaluationMetric = 'visible'; }, h => { h.options.executor.token = 'secret'; },
    h => { h.options.suiteHash = ['b'.repeat(64)]; }, h => { h.options.oracleHash = ['c'.repeat(64)]; }]) {
    const h = harness(); mutate(h);
    await assert.rejects(runBestOfN(h.options, h.adapters)); assert.equal(h.calls.length, 0);
  }
});

test('reports hashes instead of artifact text or private adapter exceptions', async () => {
  const h = harness(); h.adapters.candidate = async () => { throw new Error('private-token-and-url'); };
  const report = await runBestOfN(h.options, h.adapters);
  assert.ok(!JSON.stringify(report).includes('private-token-and-url'));
  const completed = await runDemo();
  assert.ok(!JSON.stringify(completed).includes('Compare deterministic fixture artifacts.'));
});

test('deterministic demo replays identically and completion alone is not improvement', async () => {
  const first = await runDemo(), second = await runDemo();
  assert.equal(first.reportHash, second.reportHash);
  assert.equal(verifyBestOfNReport(first).valid, true);
  const tampered = structuredClone(first); tampered.events[0].allowance.tokens++;
  assert.equal(verifyBestOfNReport(tampered).valid, false);
  first.events.forEach((event, index) => {
    assert.equal(event.sequence, index + 1);
    assert.equal(event.previousHash, index ? first.events[index - 1].hash : '0'.repeat(64));
  });
  const h = harness(); const original = h.adapters.evaluate;
  h.adapters.evaluate = async request => ({ ...await original(request), score: 0.5 });
  const report = await runBestOfN(h.options, h.adapters);
  assert.equal(report.status, 'COMPLETED'); assert.equal(report.assessment.verdict, 'FAIL');
  assert.ok(report.assessment.reasons.includes('NO_MEASURED_IMPROVEMENT'));
});

test('bad controls and malformed artifacts cannot become passing measurements', async () => {
  const h = harness(); h.adapters.evaluate = async () => h.reply({ score: 1, knownGoodPreserved: true });
  assert.equal((await runBestOfN(h.options, h.adapters)).status, 'INFRA_ERROR');
  h.adapters.candidate = async () => h.reply({ artifact: '' });
  assert.equal((await runBestOfN(h.options, h.adapters)).status, 'INFRA_ERROR');
});

test('an evaluator using a different oracle or one-sided controls fails closed', async () => {
  for (const mutate of [reply => { reply.oracleHash = 'd'.repeat(64); },
    reply => { reply.faults.forEach(fault => { fault.expectedDetected = true; }); }]) {
    const h = harness(); const original = h.adapters.evaluate;
    h.adapters.evaluate = async request => { const reply = await original(request); mutate(reply); return reply; };
    assert.equal((await runBestOfN(h.options, h.adapters)).status, 'INFRA_ERROR');
  }
});
