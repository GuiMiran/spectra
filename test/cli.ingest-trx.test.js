'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { CoverageMapAdapter } = require('../lib/evolution/gap-engine');
const cli = path.join(__dirname, '../bin/spectra.js');
const commit = 'a'.repeat(40);

test('CLI persists TRX and passes only a complete independent inventory; Gap Engine retains provenance', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-trx-cli-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const input = path.join(root, 'run.trx'), expected = path.join(root, 'expected.json');
  fs.writeFileSync(input, '<TestRun id="native-1" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010"><Results>' +
    '<UnitTestResult testName="Login" testId="test-1" executionId="exec-1" outcome="Passed"/>' +
    '</Results><ResultSummary outcome="Completed"/></TestRun>');
  fs.writeFileSync(expected, JSON.stringify({ schemaVersion: 1, commit, tests: [{ id: 'AUTH-001', name: 'Login' }] }));
  const args = ['ingest-trx', '--input', input, '--expected', expected, '--run-id', 'ci-42', '--commit', commit, '--json'];
  const run = argv => spawnSync(process.execPath, [cli, ...argv], { cwd: root, encoding: 'utf8' });
  const passed = run(args), report = JSON.parse(passed.stdout);
  assert.equal(passed.status, 0, passed.stderr || passed.stdout);
  assert.equal(report.qualification.verdict, 'PASS');
  assert.equal(report.counts.tests, 1);
  assert.equal(report.gaps, 1); // AUTH is a Pipeline ID, not an invented SPECTRA requirement.
  assert.ok(fs.existsSync(report.snapshotFile));
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/evolution.config.json')));
  const gaps = new CoverageMapAdapter(root, config).aggregate({ statement: 'Review native test evidence' }).gaps;
  assert.ok(gaps.some(gap => gap.sources.includes('trx-results') && gap.evidenceRefs.length));
  const failed = run(args.map(value => value === 'ci-42' ? 'ci-43' : value));
  assert.equal(failed.status, 0);
  fs.writeFileSync(input, fs.readFileSync(input, 'utf8').replace('Passed', 'Failed'));
  const rejected = run(args.map(value => value === 'ci-42' ? 'ci-44' : value));
  const failedReport = JSON.parse(rejected.stdout);
  assert.equal(rejected.status, 1);
  assert.equal(failedReport.success, true); // Successful import, failed qualification.
  assert.equal(failedReport.qualification.verdict, 'FAIL');
  assert.ok(fs.existsSync(failedReport.snapshotFile));
  const noInventory = run(['ingest-trx', '--input', input, '--json']);
  assert.equal(noInventory.status, 1);
  assert.equal(JSON.parse(noInventory.stdout).success, false);
});
