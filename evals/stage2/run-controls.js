'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const FROZEN_FILES = ['implementations.js', 'oracle.js', 'protocol.json', 'run-controls.js'];
const CASE_IDS = ['compatibility-validation', 'concurrency-limits', 'retry-idempotency', 'trace-privacy'];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const hashJson = value => sha256(JSON.stringify(value));
function check(condition, message) { if (!condition) throw new Error(message); }
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

function verifyFreeze(directory = __dirname) {
  try {
    const read = file => {
      const full = path.join(directory, file), stat = fs.lstatSync(full);
      check(stat.isFile() && !stat.isSymbolicLink() && stat.size <= 2 * 1024 * 1024, 'Unsafe frozen file.');
      return fs.readFileSync(full);
    };
    const bytes = read('freeze.json');
    const manifest = JSON.parse(bytes.toString('utf8'));
    check(manifest.schemaVersion === 1 && manifest.suiteVersion === '1.0.0' && manifest.files &&
      JSON.stringify(Object.keys(manifest.files).sort()) === JSON.stringify(FROZEN_FILES), 'Invalid freeze inventory.');
    for (const file of FROZEN_FILES) {
      check(typeof manifest.files[file] === 'string' && /^[a-f0-9]{64}$/.test(manifest.files[file]) &&
        sha256(read(file)) === manifest.files[file], 'Frozen bytes changed.');
    }
    return { valid: true, errors: [], manifestHash: sha256(bytes), files: manifest.files };
  } catch { return { valid: false, errors: ['FROZEN_SUITE_MISSING_OR_CHANGED'] }; }
}

function validateProtocol(protocol) {
  check(protocol?.schemaVersion === 1 && protocol.suiteId === 'stage2-coupled-public-controls' &&
    protocol.suiteVersion === '1.0.0' && protocol.scope === 'public-evaluator-controls-not-agent-performance' &&
    protocol.seed === 0 && protocol.repetitions === 3 && protocol.selectionPolicy === 'all-registered-controls-no-selection' &&
    Array.isArray(protocol.cases) && JSON.stringify(protocol.cases.map(item => item?.id).sort()) === JSON.stringify(CASE_IDS),
  'Invalid frozen protocol.');
  for (const item of protocol.cases) {
    check(Array.isArray(item.requirements) && item.requirements.length === 2 &&
      item.requirements.every(value => typeof value === 'string' && value.trim()) &&
      JSON.stringify(item.positive) === JSON.stringify(['reference', 'alternative']) &&
      Array.isArray(item.negative) && item.negative.length === 2 &&
      item.negative.every(id => typeof id === 'string' && /^[a-z0-9-]+$/.test(id)) &&
      new Set([...item.positive, ...item.negative]).size === 4 && item.input && typeof item.input === 'object',
    'Invalid coupled case contract.');
    const input = item.input;
    const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 256;
    const positive = value => Number.isSafeInteger(value) && value > 0;
    if (item.id === 'retry-idempotency') check(text(input.operationId) && positive(input.amountCents), 'Invalid retry input.');
    if (item.id === 'concurrency-limits') check(positive(input.jobs) && input.jobs <= 100 && positive(input.limit) && input.limit <= 100,
      'Invalid concurrency input.');
    if (item.id === 'trace-privacy') check(['traceId', 'operationId', 'token', 'email'].every(key => text(input[key])), 'Invalid privacy input.');
    if (item.id === 'compatibility-validation') check(input.legacy?.schemaVersion === 1 && Array.isArray(input.legacy.results) &&
      input.legacy.results.length > 0 && input.legacy.results.every(result => text(result?.id) && ['passed', 'failed', 'skipped'].includes(result.status)) &&
      new Set(input.legacy.results.map(result => result.id)).size === input.legacy.results.length &&
      ['complete', 'missing'].every(key => Array.isArray(input[key]) && input[key].length > 0 && input[key].every(text)), 'Invalid compatibility input.');
  }
  return freeze(protocol);
}

async function runControls() {
  const integrity = verifyFreeze();
  check(integrity.valid, 'Frozen suite verification failed.');
  const protocol = validateProtocol(JSON.parse(fs.readFileSync(path.join(__dirname, 'protocol.json'), 'utf8')));
  // These are fixed, reviewed modules, loaded only after checking their bytes.
  const { runVariant } = require('./implementations');
  const { assessCase } = require('./oracle');
  const rows = [], outcomes = new Map();
  for (let repetition = 1; repetition <= protocol.repetitions; repetition++) {
    for (const item of protocol.cases) {
      for (const variant of [...item.positive, ...item.negative]) {
        const expectedPass = item.positive.includes(variant);
        const result = await runVariant(item.id, variant, item.input);
        const beforeHash = hashJson(result);
        const observed = assessCase(item.id, item.input, freeze(result));
        check(typeof observed?.passed === 'boolean' && Array.isArray(observed.violations), 'Invalid oracle output.');
        const afterHash = hashJson(result);
        const key = `${item.id}:${variant}`;
        const signature = hashJson({ beforeHash, observed });
        const stable = !outcomes.has(key) || outcomes.get(key) === signature;
        outcomes.set(key, signature);
        rows.push({ caseId: item.id, variant, repetition, expectedPass, observedPass: observed.passed,
          violations: observed.violations, beforeHash, afterHash, stable,
          matched: expectedPass === observed.passed && beforeHash === afterHash && stable });
      }
    }
  }
  const metrics = { logicalControls: outcomes.size, executions: rows.length,
    positiveExecutions: rows.filter(row => row.expectedPass).length,
    negativeExecutions: rows.filter(row => !row.expectedPass).length,
    falseAccepts: rows.filter(row => !row.expectedPass && row.observedPass).length,
    falseRejects: rows.filter(row => row.expectedPass && !row.observedPass).length,
    unstableExecutions: rows.filter(row => !row.stable).length };
  const report = { schemaVersion: 1, scope: protocol.scope, suiteId: protocol.suiteId, suiteVersion: protocol.suiteVersion,
    seed: protocol.seed, repetitions: protocol.repetitions, runtime: { node: process.versions.node },
    manifestHash: integrity.manifestHash, files: integrity.files, metrics, rows,
    effects: { modelCalls: 0, networkCalls: 0, shellCommands: 0, sourceWrites: 0 },
    verdict: rows.every(row => row.matched) ? 'PASS' : 'FAIL' };
  return freeze({ ...report, reportHash: hashJson(report) });
}

module.exports = { runControls, verifyFreeze, validateProtocol };
