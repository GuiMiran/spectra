'use strict';

const crypto = require('node:crypto');
const { assessComparison } = require('../verification/comparison');

const hashPattern = /^[a-f0-9]{64}$/;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
function check(condition, message) { if (!condition) throw new Error(message); }
function canonical(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  check(value && Object.getPrototypeOf(value) === Object.prototype, 'Expected JSON data.');
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}
const digest = value => crypto.createHash('sha256').update(canonical(value)).digest('hex');
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const clone = value => JSON.parse(canonical(value));
const units = value => value && Object.keys(value).sort().join(',') === 'tokens,toolCalls' &&
  ['tokens', 'toolCalls'].every(key => Number.isSafeInteger(value[key]) && value[key] >= 0);
const matches = (a, b) => a && ['model', 'harnessVersion', 'toolsHash'].every(key => a[key] === b[key]);
class BudgetStop extends Error {}

function validate(options, adapters) {
  check(options && options.schemaVersion === 1, 'Expected experiment schemaVersion 1.');
  const config = clone(options);
  check(config.executor && nonempty(config.executor.model) && nonempty(config.executor.harnessVersion) &&
    typeof config.executor.toolsHash === 'string' && hashPattern.test(config.executor.toolsHash) &&
    Object.keys(config.executor).sort().join(',') === 'harnessVersion,model,toolsHash', 'A pinned executor is required.');
  check(Number.isInteger(config.n) && config.n >= 2 && config.n <= 32, 'n must be between 2 and 32.');
  check(units(config.budget) && config.budget.tokens > 0, 'A whole-arm budget is required.');
  for (const phase of ['baseline', 'candidate', 'select', 'evaluate']) {
    check(units(config.limits?.[phase]) && config.limits[phase].tokens > 0, `Missing ${phase} allowance.`);
  }
  check(nonempty(config.task?.id) && nonempty(config.task?.input) &&
    Object.keys(config.task).sort().join(',') === 'id,input', 'Only public task id and input are allowed.');
  check(hashPattern.test(config.suiteHash) && hashPattern.test(config.oracleHash), 'Pinned suite and oracle hashes are required.');
  check(nonempty(config.selectionMetric) && nonempty(config.evaluationMetric) &&
    config.selectionMetric !== config.evaluationMetric, 'Selection and held-out metrics must differ.');
  check(Number.isInteger(config.timeoutMs) && config.timeoutMs > 0 && config.timeoutMs <= 300000,
    'A callback timeout between 1 and 300000 ms is required.');
  for (const phase of ['baseline', 'candidate', 'select', 'evaluate']) check(typeof adapters?.[phase] === 'function', `Missing ${phase} adapter.`);
  return freeze(config);
}

/**
 * Host-owned callbacks only. No default model, tools, network or file writes.
 * A reservation is passed to the callback before invoking it. Telemetry checks
 * cannot constrain a malicious callback or stop external work after timeout.
 */
async function runBestOfN(options, adapters) {
  const config = validate(options, adapters);
  const arms = Object.fromEntries(['baseline', 'candidate'].map(arm => [arm,
    { budget: { ...config.budget }, consumed: { tokens: 0, toolCalls: 0 }, calls: 0 }]));
  const events = [];
  const append = payload => {
    const event = { sequence: events.length + 1, previousHash: events.at(-1)?.hash || '0'.repeat(64), ...payload };
    events.push({ ...event, hash: digest(event) });
  };
  let status = 'COMPLETED';
  let comparison = null;
  let assessment = null;
  let selected = null;
  let phaseContext;

  async function invoke(arm, phase, index, data) {
    phaseContext = { arm, phase, index };
    const allowance = config.limits[phase];
    const meter = arms[arm];
    if (['tokens', 'toolCalls'].some(key => meter.consumed[key] + allowance[key] > meter.budget[key])) {
      throw new BudgetStop();
    }
    const controller = new AbortController();
    let timer;
    meter.calls++;
    append({ arm, phase, index, state: 'reserved', allowance });
    try {
      const request = freeze(clone({ ...(phase === 'evaluate' ? {} : { arm, index }),
        task: config.task, executor: config.executor, allowance, ...data }));
      const reply = await Promise.race([
        Promise.resolve().then(() => adapters[phase]({ ...request, signal: controller.signal })),
        new Promise((_, reject) => { timer = setTimeout(() => {
          controller.abort(); reject(new Error('ADAPTER_TIMEOUT'));
        }, config.timeoutMs); }),
      ]);
      check(reply && matches(reply.executor, config.executor), 'EXECUTOR_MISMATCH');
      check(units(reply.usage), 'USAGE_MISSING');
      check(['tokens', 'toolCalls'].every(key => reply.usage[key] <= allowance[key]), 'ALLOWANCE_EXCEEDED');
      for (const key of ['tokens', 'toolCalls']) meter.consumed[key] += reply.usage[key];
      // Copy only the fields the phase contract consumes. Do not retain arbitrary
      // adapter metadata, raw prompts, responses, exceptions or oracle secrets.
      let result;
      if (phase === 'baseline' || phase === 'candidate') {
        const serialized = canonical(reply.artifact);
        check(Buffer.byteLength(serialized) <= 1024 * 1024 && reply.artifact !== null, 'ARTIFACT_INVALID');
        check(typeof reply.artifact !== 'string' || reply.artifact.trim(), 'ARTIFACT_EMPTY');
        result = { artifact: clone(reply.artifact) };
      } else {
        check(Number.isFinite(reply.score) && reply.score >= 0 && reply.score <= 1, 'SCORE_INVALID');
        result = { score: reply.score };
        if (phase === 'evaluate') {
          check(reply.suiteHash === config.suiteHash && reply.oracleHash === config.oracleHash &&
            reply.metric === config.evaluationMetric && reply.split === 'heldout', 'EVALUATOR_IDENTITY_MISMATCH');
          check(typeof reply.knownGoodPreserved === 'boolean' && typeof reply.noOpCompared === 'boolean' &&
            Array.isArray(reply.faults) && reply.faults.length >= 2 && reply.faults.length <= 100 &&
            new Set(reply.faults.map(f => f?.id)).size === reply.faults.length &&
            reply.faults.every(f => typeof f?.id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(f.id) &&
              typeof f.expectedDetected === 'boolean' && typeof f.observedDetected === 'boolean'), 'CONTROLS_INVALID');
          check(reply.faults.some(f => f.expectedDetected) && reply.faults.some(f => !f.expectedDetected), 'ONE_SIDED_CONTROLS');
          result = { ...result, knownGoodPreserved: reply.knownGoodPreserved, noOpCompared: reply.noOpCompared,
            faults: reply.faults.map(f => ({ id: f.id, expectedDetected: f.expectedDetected, observedDetected: f.observedDetected })) };
        }
      }
      append({ arm, phase, index, state: 'completed', usage: clone(reply.usage), resultHash: digest(result),
        ...(result.artifact !== undefined ? { artifactHash: digest(result.artifact) } : { score: result.score }) });
      return result;
    } finally { clearTimeout(timer); }
  }

  try {
    const candidate = await invoke('candidate', 'candidate', 0, {});
    await invoke('candidate', 'select', 0, { artifact: candidate.artifact, metric: config.selectionMetric });
    let best;
    for (let index = 0; index < config.n; index++) {
      const generated = await invoke('baseline', 'baseline', index, {});
      const scored = await invoke('baseline', 'select', index,
        { artifact: generated.artifact, metric: config.selectionMetric });
      if (!best || scored.score > best.score) best = { artifact: generated.artifact, score: scored.score, index };
    }
    selected = { baselineIndex: best.index, baselineHash: digest(best.artifact), candidateHash: digest(candidate.artifact) };
    append({ state: 'selection-frozen', ...selected });
    // No generation or selection callback is invoked after held-out feedback.
    const evaluated = {};
    for (const [arm, artifact] of [['baseline', best.artifact], ['candidate', candidate.artifact]]) {
      evaluated[arm] = await invoke(arm, 'evaluate', 0,
        { artifact, metric: config.evaluationMetric, split: 'heldout', suiteHash: config.suiteHash, oracleHash: config.oracleHash });
    }
    const makeArm = arm => ({ executor: config.executor, suiteHash: config.suiteHash, oracleHash: config.oracleHash,
      budget: arms[arm].budget, consumed: arms[arm].consumed, score: evaluated[arm].score,
      ...(arm === 'baseline' ? { strategy: 'best-of-n', n: config.n } : {}) });
    comparison = { schemaVersion: 1, executor: config.executor, suiteHash: config.suiteHash, oracleHash: config.oracleHash,
      split: 'heldout', evaluationMetric: config.evaluationMetric, optimizedMetrics: [config.selectionMetric],
      baseline: makeArm('baseline'), candidate: makeArm('candidate'),
      knownGoodPreserved: evaluated.baseline.knownGoodPreserved && evaluated.candidate.knownGoodPreserved,
      noOpCompared: evaluated.baseline.noOpCompared && evaluated.candidate.noOpCompared,
      faults: ['baseline', 'candidate'].flatMap(arm => evaluated[arm].faults.map(f => ({ ...f, id: `${arm}-${f.id}` }))) };
    assessment = assessComparison(comparison);
  } catch (error) {
    status = error instanceof BudgetStop ? 'BUDGET_STOP' : 'INFRA_ERROR';
    // Unknown adapter errors are deliberately not echoed into reports.
    append({ ...phaseContext, state: status, usageUnresolved: status === 'INFRA_ERROR' });
    assessment = { valid: false, verdict: 'UNRESOLVED', errors: [status] };
  }
  const report = { schemaVersion: 1, mode: 'host-adapter-experiment', status, configHash: digest(config),
    taskHash: digest(config.task), executor: config.executor, arms, selected, comparison, assessment, events };
  return freeze({ ...report, reportHash: digest(report) });
}

function verifyBestOfNReport(report) {
  try {
    check(report?.schemaVersion === 1 && Array.isArray(report.events), 'Invalid report.');
    const { reportHash, ...body } = report;
    check(hashPattern.test(reportHash) && digest(body) === reportHash, 'Report digest mismatch.');
    for (let index = 0; index < report.events.length; index++) {
      const { hash, ...event } = report.events[index];
      check(event.sequence === index + 1 && event.previousHash === (index ? report.events[index - 1].hash : '0'.repeat(64)) &&
        digest(event) === hash, 'Event chain mismatch.');
    }
    return { valid: true, errors: [] };
  } catch { return { valid: false, errors: ['Report digest or event chain is invalid.'] }; }
}

module.exports = { runBestOfN, verifyBestOfNReport };
