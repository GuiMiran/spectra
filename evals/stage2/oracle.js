'use strict';

// The oracle receives observable outputs and public case inputs, not the variant
// label or the expected pass/fail class. It never calls the implementation.
function assessCase(caseId, input, result) {
  const violations = [];
  const require = (condition, id) => { if (!condition) violations.push(id); };
  if (caseId === 'retry-idempotency') {
    require(result?.attempts === 2, 'RETRY_REQUIRED');
    require(result?.delivered === true, 'OPERATION_COMPLETED');
    require(result?.effects === 1, 'EXACTLY_ONCE');
    require(result?.chargedCents === input.amountCents, 'AMOUNT_PRESERVED');
  } else if (caseId === 'concurrency-limits') {
    const capacity = Math.min(input.limit, input.jobs);
    require(['peak', 'active', 'accepted', 'rejected', 'finished'].every(key => Number.isSafeInteger(result?.[key])), 'TYPED_COUNTERS');
    require(result?.peak <= input.limit && result?.peak > 0 && result?.active === 0, 'SHARED_CAPACITY');
    require(result?.accepted === capacity && result?.finished === capacity, 'CAPACITY_PROGRESS');
    require(result?.rejected === input.jobs - capacity, 'EXPLICIT_REJECTIONS');
  } else if (caseId === 'trace-privacy') {
    require(Array.isArray(result?.events) && result.events.length === 3, 'TRACE_COMPLETE');
    const states = ['received', 'decided', 'completed'];
    require(Array.isArray(result?.events) && result.events.every((event, index) =>
      event && event.traceId === input.traceId && event.operationId === input.operationId &&
      event.sequence === index + 1 && event.state === states[index]), 'TRACE_CORRELATED');
    const serialized = JSON.stringify(result) || '';
    require(!serialized.includes(input.token) && !serialized.includes(input.email), 'NO_RAW_SENSITIVE_DATA');
  } else if (caseId === 'compatibility-validation') {
    require(result?.absent?.accepted === true && result?.complete?.accepted === true && result?.missing?.accepted === true,
      'LEGACY_V1_ACCEPTED');
    require(result?.absent?.state === 'UNKNOWN', 'ABSENCE_NOT_PASS');
    require(result?.complete?.state === 'PASS', 'COMPLETE_EVIDENCE_ACCEPTED');
    require(result?.missing?.state === 'UNKNOWN', 'MISSING_RESULT_NOT_PASS');
  } else throw new Error('Unknown Stage 2 oracle case.');
  return { passed: violations.length === 0, violations };
}

module.exports = { assessCase };
