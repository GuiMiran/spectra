'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { stateHash, assessOracleIntegrity, assessSignalPath } = require('../lib/verification');

const load = filename => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evals', filename), 'utf8'));

test('canonical state hash does not depend on object key order', () => {
  assert.equal(stateHash({ b: 2, a: { d: 4, c: 3 } }), stateHash({ a: { c: 3, d: 4 }, b: 2 }));
});

test('known-answer, replay, state and metamorphic controls pass as a group', () => {
  assert.equal(assessOracleIntegrity(load('oracle-integrity-pass.json')).verdict, 'PASS');
});

test('oracle gate catches mutation, incorrect label, replay drift and judge insensitivity', () => {
  const record = load('oracle-integrity-pass.json');
  record.baseline.afterHash = 'altered';
  record.baseline.actual = 'FAIL';
  record.controls[1].actual = 'PASS';
  record.metamorphic[1].transformedScore = 0.9;
  assert.deepEqual(new Set(assessOracleIntegrity(record).reasons.map(item => item.code)), new Set([
    'ORACLE_MUTATED_STATE', 'ORACLE_WRONG_ANSWER', 'REPLAY_DIVERGED',
    'KNOWN_ANSWER_FAILED', 'METAMORPHIC_RELATION_FAILED',
  ]));
});

test('malformed oracle inputs fail closed instead of producing a score', () => {
  const record = load('oracle-integrity-pass.json');
  record.controls[1].expected = 'PASS';
  assert.equal(assessOracleIntegrity(record).verdict, 'UNRESOLVED');
});

test('a synthetic signal requires correlation, enforcement and audit linkage', () => {
  assert.equal(assessSignalPath(load('signal-path-pass.json')).verdict, 'PASS');
  const record = load('signal-path-pass.json');
  record.events[1].evidenceId = 'other-evidence';
  record.events[3].executed = false;
  record.events[4].actionId = 'wrong-action';
  assert.deepEqual(assessSignalPath(record).reasons.map(item => item.code), [
    'SIGNAL_LINK_BROKEN', 'POLICY_NOT_ENFORCED', 'ACTION_NOT_AUDITED',
  ]);
});

test('out-of-order or missing signal stages are unresolved', () => {
  const record = load('signal-path-pass.json');
  record.events.splice(1, 1);
  assert.equal(assessSignalPath(record).verdict, 'UNRESOLVED');
});
