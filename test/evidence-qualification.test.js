'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { qualifyEvidence, compareSnapshots } = require('../lib/evidence/qualification');
const { aggregateAllure } = require('../lib/evidence/allure-aggregator');
const inventory = { schemaVersion: 1, source: { system: 'CI', revision: 'frozen-1' }, tests: [
  { id: 'T-1', key: 'one', execution: 'expected' }, { id: 'T-2', key: 'two', execution: 'expected' },
] };
const passed = key => ({ key, finalStatus: 'passed', flaky: false });

test('every nonempty deletion of evidence blocks qualification', () => {
  const observed = [passed('one'), passed('two')];
  assert.equal(qualifyEvidence(observed, inventory).verdict, 'PASS');
  for (let mask = 1; mask < 4; mask++) {
    const qualified = qualifyEvidence(observed.filter((_, i) => !(mask & (1 << i))), inventory);
    assert.equal(qualified.verdict, 'UNKNOWN');
    assert.ok(qualified.results.some(result => result.state === 'MISSING_EVIDENCE'));
  }
});
test('absence, not-run, unknown, flaky and failures remain distinct', () => {
  assert.equal(qualifyEvidence([], null).verdict, 'UNKNOWN');
  const expected = structuredClone(inventory);
  expected.tests[0].execution = 'not_run';
  assert.equal(qualifyEvidence([], expected).results[0].state, 'NOT_RUN');
  assert.equal(qualifyEvidence([passed('one')], expected).results[0].state, 'UNKNOWN');
  assert.equal(qualifyEvidence([{ ...passed('one'), flaky: true }], inventory).results[0].state, 'UNKNOWN');
  assert.equal(qualifyEvidence([{ ...passed('one'), finalStatus: 'broken' }], inventory).results[0].state, 'FAIL');
  assert.equal(qualifyEvidence([{ ...passed('one'), finalStatus: 'skipped' }], inventory).results[0].state, 'NOT_RUN');
});
test('inventory boundary rejects duplicate keys, empty and malformed contracts', () => {
  for (const invalid of [{}, { ...inventory, tests: [] }, { ...inventory, tests: [inventory.tests[0], inventory.tests[0]] }]) {
    assert.throws(() => qualifyEvidence([], invalid));
  }
});
test('stable baseline becoming broken, flaky or absent produces continuity gaps', () => {
  const baseline = { schemaVersion: 1, source: 'allure-results', runId: 'previous', tests: [passed('one'), passed('two')] };
  assert.deepEqual(compareSnapshots([passed('one'), passed('two')], baseline), []);
  const regressions = compareSnapshots([{ key: 'one', finalStatus: 'broken' }], baseline);
  assert.deepEqual(regressions.map(item => item.state), ['FAIL', 'MISSING_EVIDENCE']);
  assert.throws(() => compareSnapshots([], { ...baseline, tests: [passed('one'), passed('one')] }));
});
test('empty Allure directory with expected inventory persists missing evidence and fails the CLI gate', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-qualify-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const input = path.join(root, 'input'); fs.mkdirSync(input);
  const expected = path.join(root, 'expected.json'); fs.writeFileSync(expected, JSON.stringify(inventory));
  const aggregated = aggregateAllure(input, { expected: inventory });
  assert.equal(aggregated.coverageMap.gaps.length, 2);
  const execution = spawnSync(process.execPath, [path.join(__dirname, '../bin/spectra.js'), 'ingest-allure',
    '--input', input, '--expected', expected, '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(execution.status, 1);
  const report = JSON.parse(execution.stdout);
  assert.equal(report.qualification.verdict, 'UNKNOWN');
  assert.ok(fs.existsSync(report.snapshotFile));
});
