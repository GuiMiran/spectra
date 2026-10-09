'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { assessStage2 } = require('../lib/verification/stage2');

function fixture() {
  return {
    schemaVersion: 1,
    agentId: 'builder', candidateCommit: 'abc123', integratedCommit: 'merge456', critical: true,
    integration: { verifiedCommit: 'merge456', includesCandidate: true },
    policies: [
      { id: 'P-trajectory', surface: 'trajectory', applicable: true, outcome: 'PASS', evaluatorId: 'harness' },
      { id: 'P-result', surface: 'result', applicable: true, outcome: 'PASS', evaluatorId: 'harness' },
    ],
    checks: ['functional', 'supported', 'traceable', 'honestCompletion']
      .map(name => ({ name, outcome: 'PASS', evaluatorId: 'harness' })),
    coordination: { tasks: [
      { id: 'producer', writeScope: ['src/a.js'], consumes: [], produces: ['API-v1'] },
      { id: 'consumer', writeScope: ['src/b.js'], consumes: ['API-v1'], produces: [] },
    ] },
    repetitions: Array.from({ length: 3 }, (_, index) =>
      ({ runId: `run-${index}`, commit: 'merge456', outcome: 'PASS', evaluatorId: 'harness' })),
  };
}

test('passes a policy-compliant, supported and stable integrated result', () => {
  assert.deepEqual(assessStage2(fixture()), { valid: true, errors: [], verdict: 'PASS', reasons: [] });
});

test('fails a trajectory policy even when functional checks pass', () => {
  const record = fixture();
  record.policies[0].outcome = 'FAIL';
  assert.equal(assessStage2(record).verdict, 'FAIL');
});

test('holds incomplete evidence unresolved rather than granting a pass', () => {
  const record = fixture();
  record.checks.pop();
  record.repetitions.pop();
  record.integration.includesCandidate = false;
  const result = assessStage2(record);
  assert.equal(result.verdict, 'UNRESOLVED');
  assert.ok(result.reasons.some(reason => reason.code === 'CHECK_MISSING'));
  assert.ok(result.reasons.some(reason => reason.code === 'MERGE_NOT_VERIFIED'));
});

test('rejects overlapping writes and duplicate check names', () => {
  const record = fixture();
  record.coordination.tasks[1].writeScope = ['src/a.js'];
  record.checks[1].name = 'functional';
  assert.equal(assessStage2(record).valid, false);
});

test('flags an unstable critical rerun and a missing producer contract', () => {
  const record = fixture();
  record.repetitions[2].outcome = 'FAIL';
  record.coordination.tasks[1].consumes = ['API-v2'];
  const result = assessStage2(record);
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.reasons.some(reason => reason.code === 'UNRESOLVED_CONTRACT'));
});
