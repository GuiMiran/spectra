'use strict';

// A read-only assessment of an externally produced Stage 2 run record.
// This module does not execute tests or attest that the supplied record is genuine.
const CHECKS = Object.freeze(['functional', 'supported', 'traceable', 'honestCompletion']);
const OUTCOMES = Object.freeze(['PASS', 'FAIL', 'UNRESOLVED']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function assessStage2(record) {
  const errors = [];
  if (!isObject(record) || record.schemaVersion !== 1) {
    return { valid: false, errors: ['Expected a Stage 2 record with schemaVersion 1.'], verdict: 'UNRESOLVED' };
  }
  if (!nonempty(record.agentId) || !nonempty(record.candidateCommit) || !nonempty(record.integratedCommit)) {
    errors.push('agentId, candidateCommit and integratedCommit are required.');
  }
  if (!Array.isArray(record.policies) || !Array.isArray(record.checks) || !Array.isArray(record.repetitions)) {
    errors.push('policies, checks and repetitions must be arrays.');
  }
  if (!isObject(record.integration) || !nonempty(record.integration.verifiedCommit) ||
      typeof record.integration.includesCandidate !== 'boolean') {
    errors.push('integration needs verifiedCommit and includesCandidate.');
  }
  if (!isObject(record.coordination) || !Array.isArray(record.coordination.tasks)) {
    errors.push('coordination.tasks must be an array.');
  }
  if (errors.length) return { valid: false, errors, verdict: 'UNRESOLVED' };

  const ids = new Set();
  for (const policy of record.policies) {
    if (!isObject(policy) || !nonempty(policy.id) || ids.has(policy.id) ||
        !['PASS', 'FAIL', 'UNRESOLVED'].includes(policy.outcome) ||
        !['trajectory', 'result'].includes(policy.surface) || typeof policy.applicable !== 'boolean' ||
        !nonempty(policy.evaluatorId) || policy.evaluatorId === record.agentId) {
      errors.push('Each policy needs a unique id, surface, applicable flag and outcome.');
    } else ids.add(policy.id);
  }
  const checkNames = new Set();
  for (const check of record.checks) {
    if (!isObject(check) || !CHECKS.includes(check.name) || checkNames.has(check.name) ||
        !OUTCOMES.includes(check.outcome) || !nonempty(check.evaluatorId) ||
        check.evaluatorId === record.agentId) {
      errors.push('Checks must have unique supported names and PASS, FAIL or UNRESOLVED outcomes.');
    } else checkNames.add(check.name);
  }
  const taskIds = new Set();
  const scopes = new Set();
  for (const task of record.coordination.tasks) {
    if (!isObject(task) || !nonempty(task.id) || taskIds.has(task.id) ||
        !Array.isArray(task.writeScope) || task.writeScope.length === 0 ||
        new Set(task.writeScope).size !== task.writeScope.length ||
        task.writeScope.some(scope => !nonempty(scope) || [...scopes].some(existing =>
          existing === scope || existing.startsWith(scope + '/') || scope.startsWith(existing + '/'))) ||
        !Array.isArray(task.consumes) || !Array.isArray(task.produces) ||
        [...task.consumes, ...task.produces].some(contract => !nonempty(contract))) {
      errors.push('Tasks require unique ids, disjoint explicit writeScope paths and contract arrays.');
    } else {
      taskIds.add(task.id);
      task.writeScope.forEach(scope => scopes.add(scope));
    }
  }
  const runIds = new Set();
  for (const repetition of record.repetitions) {
    if (!isObject(repetition) || !nonempty(repetition.runId) || runIds.has(repetition.runId) ||
        !nonempty(repetition.commit) || !OUTCOMES.includes(repetition.outcome) ||
        !nonempty(repetition.evaluatorId) || repetition.evaluatorId === record.agentId) {
      errors.push('Each repetition needs a unique runId, commit, outcome and independent evaluatorId.');
    } else runIds.add(repetition.runId);
  }
  if (errors.length) return { valid: false, errors, verdict: 'UNRESOLVED' };

  const reasons = [];
  const applicable = record.policies.filter(policy => policy.applicable);
  if (applicable.length === 0 || !new Set(applicable.map(policy => policy.surface)).has('trajectory') ||
      !new Set(applicable.map(policy => policy.surface)).has('result')) {
    reasons.push({ outcome: 'UNRESOLVED', code: 'POLICY_SCOPE_INCOMPLETE' });
  }
  for (const policy of applicable) {
    if (policy.outcome !== 'PASS') reasons.push({ outcome: policy.outcome, code: 'POLICY_' + policy.outcome, id: policy.id });
  }
  for (const name of CHECKS) {
    const check = record.checks.find(item => item.name === name);
    if (!check) {
      reasons.push({ outcome: 'UNRESOLVED', code: 'CHECK_MISSING', id: name });
    } else if (check.outcome !== 'PASS') {
      reasons.push({ outcome: check.outcome, code: 'CHECK_' + check.outcome, id: name });
    }
  }
  if (record.integration.verifiedCommit !== record.integratedCommit || !record.integration.includesCandidate) {
    reasons.push({ outcome: 'UNRESOLVED', code: 'MERGE_NOT_VERIFIED' });
  }
  if (record.coordination.tasks.length === 0) reasons.push({ outcome: 'UNRESOLVED', code: 'NO_COORDINATION_PLAN' });
  const produced = new Set(record.coordination.tasks.flatMap(task => task.produces));
  for (const task of record.coordination.tasks) {
    for (const contract of task.consumes) {
      if (!produced.has(contract)) reasons.push({ outcome: 'UNRESOLVED', code: 'UNRESOLVED_CONTRACT', id: contract });
    }
  }
  // Critical passes require three independent re-runs on the actual merged commit.
  const minimum = record.critical === true ? 3 : 1;
  const repetitions = record.repetitions.filter(run => run.commit === record.integratedCommit);
  if (repetitions.length < minimum) reasons.push({ outcome: 'UNRESOLVED', code: 'INSUFFICIENT_REPETITIONS' });
  for (const run of repetitions) {
    if (run.outcome !== 'PASS') reasons.push({ outcome: run.outcome, code: 'UNSTABLE_REPETITION' });
  }
  return {
    valid: true,
    errors: [],
    verdict: reasons.some(reason => reason.outcome === 'FAIL') ? 'FAIL' :
      reasons.length ? 'UNRESOLVED' : 'PASS',
    reasons,
  };
}

module.exports = { assessStage2 };
