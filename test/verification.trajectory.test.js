'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { assessTrajectory } = require('../lib/verification/trajectory');

function controls() {
  return {
    schemaVersion: 1,
    tools: [
      { name: 'repository.read', requiredArgs: ['path'], effects: ['read'] },
      { name: 'evidence.inspect', requiredArgs: ['evidenceId'], effects: ['read'] },
    ],
  };
}

function fixture() {
  return {
    schemaVersion: 1,
    agentId: 'planner',
    spec: { id: 'SPEC-001', version: '1.0.0' },
    evidence: [{ id: 'E-001', status: 'available' }],
    events: [
      { id: 'call-1', type: 'tool', tool: 'repository.read', args: { path: 'README.md' } },
      { id: 'result-1', type: 'result', callId: 'call-1', status: 'success' },
      { id: 'decision-1', type: 'decision', resultId: 'result-1', outcome: 'propose' },
      { id: 'test-1', type: 'test', evidenceId: 'E-001', status: 'PASS' },
      { id: 'execution-1', type: 'execution', decisionId: 'decision-1', testId: 'test-1', mode: 'dry-run', sourceWrites: 0, networkCalls: 0, credentialReads: 0, shellCommands: 0 },
      { id: 'pr-1', type: 'pr', executionId: 'execution-1', opened: false, humanApproval: true },
    ],
  };
}

test('passes an ordered read-only trajectory with human-gated promotion', () => {
  assert.deepEqual(assessTrajectory(fixture(), controls()), { valid: true, errors: [], verdict: 'PASS', reasons: [] });
});

test('rejects a tool absent from the independently supplied controls', () => {
  const record = fixture();
  record.events[0].tool = 'repository.write';
  const result = assessTrajectory(record, controls());
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.reasons.some(reason => reason.code === 'UNKNOWN_TOOL'));
});

test('rejects missing tool arguments and out-of-order events', () => {
  const record = fixture();
  record.events[0].args = {};
  record.events.splice(2, 0, { id: 'test-before-decision', type: 'test', evidenceId: 'E-001', status: 'PASS' });
  const result = assessTrajectory(record, controls());
  assert.ok(result.reasons.some(reason => reason.code === 'TOOL_ARGUMENTS_INCOMPLETE'));
  assert.ok(result.reasons.some(reason => reason.code === 'ORDER_VIOLATION'));
});

test('allows an observed failure only when it is retried before a successful decision', () => {
  const record = fixture();
  record.events.splice(2, 0,
    { id: 'retry-1', type: 'retry', resultId: 'result-1', attempt: 1 },
    { id: 'call-2', type: 'tool', tool: 'evidence.inspect', args: { evidenceId: 'E-001' } },
    { id: 'result-2', type: 'result', callId: 'call-2', status: 'success' });
  record.events[1].status = 'failure';
  record.events[5].resultId = 'result-2';
  assert.equal(assessTrajectory(record, controls()).verdict, 'PASS');
});

test('fails any attempt to cross the dry-run execution boundary', () => {
  const record = fixture();
  record.events[4].networkCalls = 1;
  record.events[5].opened = true;
  const result = assessTrajectory(record, controls());
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.reasons.some(reason => reason.code === 'EXECUTION_BOUNDARY_VIOLATION'));
  assert.ok(result.reasons.some(reason => reason.code === 'PR_PROMOTION_NOT_HUMAN_GATED'));
});

test('keeps malformed controls unresolved rather than trusting them', () => {
  const result = assessTrajectory(fixture(), { schemaVersion: 1, tools: [{ name: 'repository.read', requiredArgs: [], effects: ['network'] }] });
  assert.equal(result.valid, false);
  assert.equal(result.verdict, 'UNRESOLVED');
});
