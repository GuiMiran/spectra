'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { assessComparison } = require('../lib/verification/comparison');
const { assessTrajectory } = require('../lib/verification/trajectory');
const load = file => JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));

test('budget-matched best-of-n comparison passes only held-out discriminating evidence', () => {
  const fixture = load('evals/comparison-pass.json');
  assert.equal(assessComparison(fixture).verdict, 'PASS');
  const faults = [
    record => { record.baseline.strategy = 'single'; },
    record => { record.baseline.budget.tokens++; },
    record => { record.candidate.consumed.tokens = record.candidate.budget.tokens + 1; },
    record => { record.candidate.executor.model = 'another'; },
    record => { record.candidate.oracleHash = 'd'.repeat(64); },
    record => { record.optimizedMetrics.push(record.evaluationMetric); },
    record => { record.faults[0].observedDetected = !record.faults[0].expectedDetected; },
    record => { record.knownGoodPreserved = false; },
    record => { record.candidate.score = record.baseline.score; },
  ];
  for (const mutate of faults) { const record = structuredClone(fixture); mutate(record);
    assert.equal(assessComparison(record).verdict, 'FAIL'); }
});
test('missing experiment evidence is unresolved, never a passing comparison', () => {
  assert.equal(assessComparison({}).verdict, 'UNRESOLVED');
  const record = load('evals/comparison-pass.json'); delete record.baseline.consumed;
  assert.equal(assessComparison(record).verdict, 'UNRESOLVED');
});
test('late success cannot hide an invalid prefix or stale dependency', () => {
  const controls = load('evals/trajectory-controls.json');
  const record = load('evals/trajectory-pass.json');
  record.events[0].tool = 'unauthorized';
  const result = assessTrajectory(record, controls);
  assert.equal(result.metrics.first_invalid_step, 1);
  assert.equal(result.metrics.valid_prefix_ratio, 0);
  assert.equal(result.metrics.successful_result_after_invalid_step, true);
  assert.equal(result.verdict, 'FAIL');
  const stale = load('evals/trajectory-pass.json');
  stale.events[1].callId = 'missing-call';
  assert.equal(assessTrajectory(stale, controls).metrics.first_invalid_step, 2);
  const late = load('evals/trajectory-pass.json');
  late.events[4].networkCalls = 1;
  const invalidLate = assessTrajectory(late, controls);
  assert.equal(invalidLate.metrics.first_invalid_step, 5);
  assert.equal(invalidLate.metrics.valid_prefix_ratio, 4 / 6);
});
test('coupled Stage 2 designs explicitly bind two requirements and an opposite control', () => {
  const catalogue = load('evals/stage2-coupled-cases.json');
  assert.equal(catalogue.status, 'proposed-experiment-not-results');
  assert.equal(catalogue.cases.length, 4);
  for (const item of catalogue.cases) {
    assert.equal(item.requirements.length, 2);
    assert.ok(item.fault && item.control);
  }
});
test('instruction owner and conflict controls remain discoverable', () => {
  const owners = fs.readFileSync(path.join(__dirname, '../.github/CODEOWNERS'), 'utf8');
  const agents = fs.readFileSync(path.join(__dirname, '../AGENTS.md'), 'utf8');
  for (const name of ['AGENTS.md', 'CLAUDE.md', '/.github/', '/evals/']) assert.ok(owners.includes(name));
  assert.ok(agents.includes('report a governance gap'));
});
