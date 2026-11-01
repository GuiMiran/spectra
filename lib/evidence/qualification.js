'use strict';

const STATES = ['PASS', 'FAIL', 'NOT_RUN', 'MISSING_EVIDENCE', 'UNKNOWN'];
const { createHash } = require('node:crypto');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function validateSnapshot(snapshot) {
  if (!snapshot || snapshot.schemaVersion !== 1 || snapshot.source !== 'allure-results' ||
      !nonempty(snapshot.runId) || !Array.isArray(snapshot.tests)) throw new Error('Invalid baseline snapshot.');
  const keys = new Set();
  for (const test of snapshot.tests) {
    if (!test || !nonempty(test.key) || keys.has(test.key) || typeof test.flaky !== 'boolean' ||
        !['passed', 'failed', 'broken', 'skipped', 'unknown'].includes(test.finalStatus)) {
      throw new Error('Invalid or duplicate baseline test.');
    }
    keys.add(test.key);
  }
  return snapshot;
}

function qualifyEvidence(tests, inventory) {
  const seen = new Set();
  if (!Array.isArray(tests)) throw new Error('Observed tests must be an array.');
  for (const test of tests) {
    if (!test || !nonempty(test.key) || seen.has(test.key) || typeof test.flaky !== 'boolean' ||
        !['passed', 'failed', 'broken', 'skipped', 'unknown'].includes(test.finalStatus)) {
      throw new Error('Invalid observed test contract.');
    }
    seen.add(test.key);
  }
  if (inventory === null || inventory === undefined) {
    return { verdict: 'UNKNOWN', diagnostics: ['EXPECTED_INVENTORY_MISSING'], results: [] };
  }
  if (!inventory || inventory.schemaVersion !== 1 || !nonempty(inventory.source?.system) ||
      !nonempty(inventory.source?.revision) || !Array.isArray(inventory.tests) || !inventory.tests.length) {
    throw new Error('Expected inventory needs schemaVersion 1, source.system/revision and non-empty tests.');
  }
  const ids = new Set(), keys = new Set();
  const observed = new Map(tests.map(test => [test.key, test]));
  const results = inventory.tests.map(item => {
    if (!item || !nonempty(item.id) || !nonempty(item.key) || ids.has(item.id) || keys.has(item.key) ||
        !['expected', 'not_run'].includes(item.execution)) throw new Error('Invalid or duplicate inventory test.');
    ids.add(item.id); keys.add(item.key);
    const test = observed.get(item.key);
    let state;
    if (item.execution === 'not_run') state = test ? 'UNKNOWN' : 'NOT_RUN';
    else if (!test) state = 'MISSING_EVIDENCE';
    else if (['failed', 'broken'].includes(test.finalStatus)) state = 'FAIL';
    else if (test.finalStatus === 'skipped') state = 'NOT_RUN';
    else state = test.finalStatus === 'passed' && !test.flaky ? 'PASS' : 'UNKNOWN';
    return { id: item.id, key: item.key, state };
  });
  const unexpected = tests.filter(test => !keys.has(test.key)).map(test => test.key);
  const counts = Object.fromEntries(STATES.map(state => [state, results.filter(item => item.state === state).length]));
  return {
    verdict: counts.FAIL ? 'FAIL' : results.every(item => item.state === 'PASS') && !unexpected.length ? 'PASS' : 'UNKNOWN',
    source: { system: inventory.source.system, revision: inventory.source.revision }, counts, results, unexpected,
    inventoryDigest: createHash('sha256').update(JSON.stringify(inventory)).digest('hex'),
    diagnostics: unexpected.length ? ['UNEXPECTED_RESULTS'] : [],
  };
}

function compareSnapshots(tests, baseline) {
  if (!baseline) return [];
  validateSnapshot(baseline);
  const current = new Map(tests.map(test => [test.key, test]));
  return baseline.tests.filter(test => test.finalStatus === 'passed' && !test.flaky)
    .flatMap(previous => {
      const next = current.get(previous.key);
      const reason = !next ? 'MISSING_EVIDENCE' : ['failed', 'broken'].includes(next.finalStatus) ? 'FAIL'
        : next.finalStatus !== 'passed' || next.flaky ? 'UNKNOWN' : null;
      return reason ? [{ key: previous.key, state: reason, baselineRunId: baseline.runId }] : [];
    });
}

module.exports = { qualifyEvidence, compareSnapshots, validateSnapshot };
