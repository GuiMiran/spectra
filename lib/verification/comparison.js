'use strict';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const identity = value => object(value) && text(value.model) && text(value.harnessVersion) && hash(value.toolsHash);

// Checks supplied experiment records, not the authenticity of the external runner.
function assessComparison(record) {
  const errors = [], reasons = [];
  if (!object(record) || record.schemaVersion !== 1 || !identity(record.executor) ||
      !hash(record.suiteHash) || !hash(record.oracleHash) || !text(record.evaluationMetric) || record.split !== 'heldout' ||
      !Array.isArray(record.optimizedMetrics) || record.optimizedMetrics.some(metric => !text(metric))) {
    return { valid: false, verdict: 'UNRESOLVED', errors: ['Invalid comparison identity or metric contract.'] };
  }
  const fail = code => reasons.push(code);
  for (const side of ['candidate', 'baseline']) {
    const arm = record[side];
    if (!object(arm) || !identity(arm.executor) || !object(arm.budget) || !object(arm.consumed) ||
        !Number.isFinite(arm.score) || arm.score < 0 || arm.score > 1 ||
        ['tokens', 'toolCalls'].some(key => !Number.isSafeInteger(arm.budget[key]) || arm.budget[key] < (key === 'tokens' ? 1 : 0) ||
          !Number.isSafeInteger(arm.consumed[key]) || arm.consumed[key] < 0)) {
      errors.push(`Invalid ${side} arm.`); continue;
    }
    if (['model', 'harnessVersion', 'toolsHash'].some(key => arm.executor[key] !== record.executor[key])) fail('EXECUTOR_MISMATCH');
    if (arm.suiteHash !== record.suiteHash || arm.oracleHash !== record.oracleHash) fail('EVALUATOR_PARITY_MISSING');
    if (['tokens', 'toolCalls'].some(key => arm.consumed[key] > arm.budget[key])) fail('BUDGET_EXCEEDED');
  }
  if (errors.length) return { valid: false, verdict: 'UNRESOLVED', errors };
  if (record.baseline.strategy !== 'best-of-n' || !Number.isSafeInteger(record.baseline.n) || record.baseline.n < 2) fail('BEST_OF_N_MISSING');
  if (['tokens', 'toolCalls'].some(key => record.candidate.budget[key] !== record.baseline.budget[key])) fail('BUDGET_NOT_EQUAL');
  if (record.optimizedMetrics.includes(record.evaluationMetric)) fail('EVALUATION_METRIC_LEAKAGE');
  if (record.candidate.score <= record.baseline.score) fail('NO_MEASURED_IMPROVEMENT');
  if (record.knownGoodPreserved !== true || record.noOpCompared !== true) fail('CONTINUITY_CONTROLS_MISSING');
  if (!Array.isArray(record.faults) || record.faults.length < 2 || new Set(record.faults.map(f => f?.id)).size !== record.faults.length ||
      record.faults.some(f => !text(f?.id) || typeof f.expectedDetected !== 'boolean' || typeof f.observedDetected !== 'boolean')) {
    errors.push('At least two uniquely identified fault controls are required.');
  } else {
    if (!record.faults.some(f => f.expectedDetected) || !record.faults.some(f => !f.expectedDetected)) fail('ONE_SIDED_FAULT_CONTROLS');
    if (record.faults.some(f => f.expectedDetected !== f.observedDetected)) fail('FAULT_DISCRIMINATION_FAILED');
  }
  return { valid: !errors.length, verdict: errors.length ? 'UNRESOLVED' : reasons.length ? 'FAIL' : 'PASS', errors, reasons };
}

module.exports = { assessComparison };
