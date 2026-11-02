'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseTrx } = require('./trx-xml');
const { qualifyEvidence } = require('./qualification');
const { writeEvidence } = require('./store');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const specIds = text => [...new Set(String(text).match(/\b(?:US|BR|INV|OP|POL|EVT|AG|SK|WF|AC)-\d{3}\b/g) || [])].sort();

function normalizeInventory(expected, commit) {
  if (!expected || expected.schemaVersion !== 1) throw new Error('A trusted version 1 expected inventory is required.');
  // Pipeline freezes this inventory from versioned specs before test execution.
  // Never derive expected tests from the TRX or its Counters/summary.json.
  if (Object.hasOwn(expected, 'commit')) {
    if (expected.commit !== commit || !Array.isArray(expected.tests)) throw new Error('Pipeline inventory commit mismatch or invalid tests.');
    return { schemaVersion: 1, source: { system: 'guido-agentic-pipeline', revision: expected.commit },
      tests: expected.tests.map(item => ({ id: item?.id, key: item?.name, execution: 'expected' })) };
  }
  return expected;
}

function readTrx(input) {
  const target = path.resolve(input), stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) throw new Error('Refusing symlink TRX input.');
  const names = stat.isDirectory() ? fs.readdirSync(target).filter(name => name.endsWith('.trx')).sort() : [path.basename(target)];
  if (names.length > 100) throw new Error('TRX input exceeds 100 files.');
  let total = 0;
  return names.map(name => {
    const file = stat.isDirectory() ? path.join(target, name) : target, entry = fs.lstatSync(file);
    if (!name.endsWith('.trx') || !entry.isFile() || entry.size > 16 * 1024 * 1024 ||
        (total += entry.size) > 32 * 1024 * 1024) throw new Error('Invalid or oversized TRX input.');
    const bytes = fs.readFileSync(file);
    return { document: parseTrx(bytes), source: { file: name, sha256: digest(bytes) } };
  });
}

function aggregateTrx(input, { runId, commit, ref = null, expected } = {}) {
  if (typeof runId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(runId)) throw new Error('runId must be a safe alphanumeric slug.');
  if (typeof commit !== 'string' || !/^(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(commit)) throw new Error('commit must be a full Git commit hash.');
  if (ref !== null && !nonempty(ref)) throw new Error('ref must be a non-empty string.');
  const inventory = normalizeInventory(expected, commit);
  qualifyEvidence([], inventory); // Validate the independent inventory even for no result files.
  const entries = readTrx(input), tests = [], keys = new Set(), executions = new Set(), testIds = new Set();
  const diagnostics = [];
  for (const { document, source } of entries) {
    if (!nonempty(document.id)) throw new Error('TRX TestRun identity is required.');
    if (!['Completed', 'Passed'].includes(document.outcome)) diagnostics.push(`RUN_NOT_COMPLETED:${source.file}`);
    for (const row of document.rows) {
      const key = row.testName;
      if (!nonempty(key) || !nonempty(row.testId) || !nonempty(row.executionId) || !nonempty(row.outcome)) {
        throw new Error('TRX result identity and outcome are required.');
      }
      if (keys.has(key) || executions.has(row.executionId) || testIds.has(row.testId)) {
        throw new Error(`Duplicate TRX test or execution: ${key}`);
      }
      keys.add(key); executions.add(row.executionId); testIds.add(row.testId);
      const statuses = { Passed: 'passed', Failed: 'failed', Error: 'broken', Timeout: 'broken',
        Aborted: 'broken', NotExecuted: 'skipped', Inconclusive: 'unknown' };
      const finalStatus = Object.hasOwn(statuses, row.outcome) ? statuses[row.outcome] : 'unknown';
      const expectedTest = inventory.tests.find(item => item.key === key);
      tests.push({ key, name: key, specIds: specIds(`${expectedTest?.id || ''} ${key}`), finalStatus, flaky: false,
        attempts: [{ uuid: row.executionId, testId: row.testId, trxRunId: document.id,
          status: finalStatus, outcome: row.outcome, source }] });
    }
  }
  tests.sort((a, b) => a.key.localeCompare(b.key));
  const sourceDigest = digest(entries.map(entry => `${entry.source.file}:${entry.source.sha256}`).join('\n'));
  const qualification = qualifyEvidence(tests, inventory);
  qualification.diagnostics.push(...diagnostics);
  if (diagnostics.length && qualification.verdict === 'PASS') qualification.verdict = 'UNKNOWN';
  const counts = { tests: tests.length, attempts: tests.length,
    ...Object.fromEntries(['passed', 'failed', 'broken', 'skipped', 'unknown'].map(status =>
      [status, tests.filter(test => test.finalStatus === status).length])),
    unmapped: tests.filter(test => !test.specIds.length).length, flaky: 0 };
  const snapshot = { schemaVersion: 1, source: 'trx-results', runId, sourceDigest,
    provenance: { commit, ref, files: entries.map(entry => entry.source),
      inventorySha256: digest(JSON.stringify(expected)) }, counts, tests, qualification };
  const gaps = [];
  const base = { type: 'TEST', runId, sourceDigest, evidenceRefs: [`test-runs/${runId}.json`] };
  for (const result of qualification.results.filter(result => result.state !== 'PASS')) {
    gaps.push({ ...base, id: `EXPECTED-${digest(result.id).slice(0, 12).toUpperCase()}`,
      description: `Expected test ${result.id}: ${result.state}`, severity: 'MAJOR', status: result.state, expectedTestId: result.id });
  }
  for (const observed of tests) {
    const unexpected = qualification.unexpected.includes(observed.key);
    if (!observed.specIds.length || observed.finalStatus !== 'passed' || unexpected) {
      const status = unexpected ? 'UNEXPECTED' : !observed.specIds.length ? 'UNMAPPED' : observed.finalStatus.toUpperCase();
      const ids = observed.specIds.length && !unexpected ? observed.specIds : [`TRX-${digest(observed.key).slice(0, 12).toUpperCase()}`];
      gaps.push(...ids.map(id => ({ ...base, id, description: observed.name,
        severity: ['failed', 'broken'].includes(observed.finalStatus) || unexpected ? 'MAJOR' : 'MINOR', status })));
    }
  }
  diagnostics.forEach(message => gaps.push({ ...base, id: `TRX-RUN-${digest(message).slice(0, 12).toUpperCase()}`,
    description: message, status: 'UNKNOWN', severity: 'MAJOR' }));
  return { snapshot, coverageMap: { schemaVersion: 1, producer: 'spectra.ingest-trx', runId, sourceDigest, gaps } };
}

function writeTrxEvidence(projectRoot, aggregation) {
  return writeEvidence(projectRoot, aggregation, 'spectra.ingest-trx');
}

module.exports = { aggregateTrx, writeTrxEvidence };
