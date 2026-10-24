'use strict';

// Assess externally captured evidence. This module never runs a model, tool or pipeline.
const crypto = require('node:crypto');

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const verdicts = new Set(['PASS', 'FAIL']);
const unresolved = message => ({ valid: false, verdict: 'UNRESOLVED', errors: [message], reasons: [] });
const result = reasons => ({ valid: true, verdict: reasons.length ? 'FAIL' : 'PASS', errors: [], reasons });

// Canonical hashes allow a host to snapshot JSON state without order-dependent keys.
function stateHash(value) {
  function canonical(item) {
    if (Array.isArray(item)) return item.map(canonical);
    if (isObject(item)) return Object.fromEntries(Object.keys(item).sort().map(key => [key, canonical(item[key])]));
    return item;
  }
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function assessOracleIntegrity(record) {
  if (!isObject(record) || record.schemaVersion !== 1 || !nonempty(record.caseId) ||
      !isObject(record.baseline) || !isObject(record.replay) ||
      !Array.isArray(record.controls) || record.controls.length < 2 ||
      !Array.isArray(record.metamorphic) || record.metamorphic.length === 0) {
    return unresolved('Expected a versioned case, baseline, replay, two known-answer controls and metamorphic checks.');
  }
  const runs = [record.baseline, record.replay];
  if (runs.some(run => !nonempty(run.runId) || !nonempty(run.beforeHash) || !nonempty(run.afterHash) ||
      !verdicts.has(run.expected) || !verdicts.has(run.actual)) ||
      record.baseline.runId === record.replay.runId ||
      record.controls.some(control => !isObject(control) || !nonempty(control.id) ||
        !verdicts.has(control.expected) || !verdicts.has(control.actual)) ||
      new Set(record.controls.map(control => control.id)).size !== record.controls.length ||
      !new Set(record.controls.map(control => control.expected)).has('PASS') ||
      !new Set(record.controls.map(control => control.expected)).has('FAIL') ||
      record.metamorphic.some(check => !isObject(check) || !nonempty(check.id) ||
        !['invariant', 'no-improvement', 'no-decrease'].includes(check.relation) ||
        !Number.isFinite(check.baselineScore) || !Number.isFinite(check.transformedScore) ||
        check.baselineScore < 0 || check.baselineScore > 1 ||
        check.transformedScore < 0 || check.transformedScore > 1) ||
      new Set(record.metamorphic.map(check => check.id)).size !== record.metamorphic.length) {
    return unresolved('Invalid or ambiguous run, control or metamorphic evidence.');
  }
  const reasons = [];
  for (const run of runs) {
    if (run.beforeHash !== run.afterHash) reasons.push({ code: 'ORACLE_MUTATED_STATE', id: run.runId });
    if (run.expected !== run.actual) reasons.push({ code: 'ORACLE_WRONG_ANSWER', id: run.runId });
  }
  if (record.baseline.beforeHash !== record.replay.beforeHash ||
      record.baseline.actual !== record.replay.actual) reasons.push({ code: 'REPLAY_DIVERGED' });
  for (const control of record.controls) {
    if (control.actual !== control.expected) reasons.push({ code: 'KNOWN_ANSWER_FAILED', id: control.id });
  }
  for (const check of record.metamorphic) {
    const { baselineScore: before, transformedScore: after, relation } = check;
    const holds = relation === 'invariant' ? Math.abs(before - after) <= 1e-9 :
      relation === 'no-improvement' ? after <= before + 1e-9 : after + 1e-9 >= before;
    if (!holds) reasons.push({ code: 'METAMORPHIC_RELATION_FAILED', id: check.id });
  }
  return result(reasons);
}

const STAGES = ['detected', 'correlated', 'policy', 'action', 'audit'];
function assessSignalPath(record) {
  if (!isObject(record) || record.schemaVersion !== 1 || !nonempty(record.traceId) ||
      !nonempty(record.evidenceId) || !Array.isArray(record.events) ||
      record.events.length !== STAGES.length || record.events.some((event, index) =>
        !isObject(event) || event.stage !== STAGES[index] || !nonempty(event.traceId) ||
        !nonempty(event.evidenceId))) {
    return unresolved('Expected five ordered evidence-path events with trace and evidence IDs.');
  }
  const reasons = [];
  for (const event of record.events) {
    if (event.traceId !== record.traceId || event.evidenceId !== record.evidenceId) {
      reasons.push({ code: 'SIGNAL_LINK_BROKEN', id: event.stage });
    }
  }
  if (record.events[0].violation !== true || record.events[1].matched !== true) {
    reasons.push({ code: 'SIGNAL_NOT_CONFIRMED' });
  }
  const policy = record.events[2];
  const action = record.events[3];
  const audit = record.events[4];
  if (!['block', 'alert'].includes(policy.decision) || action.kind !== policy.decision ||
      action.executed !== true) reasons.push({ code: 'POLICY_NOT_ENFORCED' });
  if (audit.actionId !== action.id || !nonempty(action.id) || audit.recorded !== true) {
    reasons.push({ code: 'ACTION_NOT_AUDITED' });
  }
  return result(reasons);
}

module.exports = { stateHash, assessOracleIntegrity, assessSignalPath };
