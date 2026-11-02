'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { aggregateTrx, writeTrxEvidence } = require('../lib/evidence/trx-aggregator');
const { aggregateAllure, writeAllureEvidence } = require('../lib/evidence/allure-aggregator');
const { parseTrx } = require('../lib/evidence/trx-xml');
const { parseCoverageMap } = require('../lib/evolution/gap-engine');
const commit = 'a'.repeat(40);
const expected = { schemaVersion: 1, source: { system: 'reviewed-specs', revision: 'v1' },
  tests: [{ id: 'AC-001', key: 'Login & logout', execution: 'expected' }] };
const row = (outcome = 'Passed', name = 'Login &amp; logout', execution = 'exec-1') =>
  `<UnitTestResult executionId="${execution}" testId="test-${execution}" testName="${name}" outcome="${outcome}"/>`;
const xml = (rows = row(), outcome = 'Completed') => `\uFEFF<?xml version="1.0" encoding="utf-8"?>
<TestRun id="native-42" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010">
<Results>${rows}</Results><ResultSummary outcome="${outcome}"><Output><StdOut><![CDATA[<not-a-test/>]]></StdOut></Output></ResultSummary></TestRun>`;

function fixture(t, content = xml()) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-trx-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const input = path.join(root, 'input'); fs.mkdirSync(input);
  if (content !== null) fs.writeFileSync(path.join(input, 'tests.trx'), content);
  return { root, input, options: { runId: 'ci-42', commit, expected },
    aggregate: overrides => aggregateTrx(input, { runId: 'ci-42', commit, expected, ...overrides }) };
}

test('TRX yields deterministic qualified evidence with original byte hashes and canonical gaps', t => {
  const f = fixture(t), result = f.aggregate();
  assert.equal(result.snapshot.qualification.verdict, 'PASS');
  assert.deepEqual(result.snapshot.tests[0].specIds, ['AC-001']);
  assert.equal(result.snapshot.tests[0].attempts[0].trxRunId, 'native-42');
  assert.equal(result.snapshot.counts.passed, 1);
  assert.equal(result.coverageMap.gaps.length, 0);
  const bytes = fs.readFileSync(path.join(f.input, 'tests.trx'));
  assert.equal(result.snapshot.provenance.files[0].sha256, crypto.createHash('sha256').update(bytes).digest('hex'));
  assert.deepEqual(result, f.aggregate());
});

test('each non-passing native outcome fails closed, retaining evidence and expected gaps', t => {
  for (const [outcome, verdict, state] of [['Failed', 'FAIL', 'FAIL'], ['Error', 'FAIL', 'FAIL'],
    ['Timeout', 'FAIL', 'FAIL'], ['Aborted', 'FAIL', 'FAIL'], ['NotExecuted', 'UNKNOWN', 'NOT_RUN'],
    ['Inconclusive', 'UNKNOWN', 'UNKNOWN'], ['FutureStatus', 'UNKNOWN', 'UNKNOWN'], ['constructor', 'UNKNOWN', 'UNKNOWN']]) {
    const result = fixture(t, xml(row(outcome))).aggregate();
    assert.equal(result.snapshot.qualification.verdict, verdict, outcome);
    assert.equal(result.snapshot.qualification.results[0].state, state);
    assert.ok(result.coverageMap.gaps.some(gap => gap.expectedTestId === 'AC-001'));
    const gaps = parseCoverageMap(result.coverageMap);
    assert.ok(gaps.every(gap => gap.sources.includes('trx-results') && gap.evidenceRefs.length));
  }
});

test('absent files and empty Results remain missing, not zero-test PASS', t => {
  for (const content of [null, xml('')]) {
    const f = fixture(t, content), result = f.aggregate();
    assert.equal(result.snapshot.qualification.verdict, 'UNKNOWN');
    assert.equal(result.snapshot.qualification.results[0].state, 'MISSING_EVIDENCE');
    assert.equal(result.snapshot.counts.tests, 0);
    assert.ok(writeTrxEvidence(f.root, result).snapshotFile);
  }
});

test('missing paths, zero byte or malformed XML are rejected before writing', t => {
  for (const content of ['', '<Results/>', xml().slice(0, -10)]) {
    const f = fixture(t, content);
    assert.throws(() => f.aggregate());
    assert.equal(fs.existsSync(path.join(f.root, '.spectra')), false);
  }
  assert.throws(() => aggregateTrx('/no/such/trx', { runId: 'ci', commit, expected }));
});

test('duplicates across rows/files and execution identities are not interpreted as retries', t => {
  for (const rows of [row() + row('Passed', 'Login &amp; logout', 'exec-2'),
    row() + row('Passed', 'Other', 'exec-1')]) {
    assert.throws(() => fixture(t, xml(rows)).aggregate(), /Duplicate TRX/);
  }
  const f = fixture(t); fs.copyFileSync(path.join(f.input, 'tests.trx'), path.join(f.input, 'copy.trx'));
  assert.throws(() => f.aggregate(), /Duplicate TRX/);
  assert.throws(() => fixture(t, xml(row() + row('Passed', 'Other', 'exec-2')
    .replace('test-exec-2', 'test-exec-1'))).aggregate(), /Duplicate TRX/);
});

test('unexpected results and incomplete run summaries cannot authorize PASS', t => {
  const unexpected = fixture(t, xml(row() + row('Passed', 'Other', 'exec-2'))).aggregate();
  assert.equal(unexpected.snapshot.qualification.verdict, 'UNKNOWN');
  assert.ok(unexpected.coverageMap.gaps.some(gap => gap.status === 'UNEXPECTED'));
  for (const outcome of ['Failed', 'Aborted', 'Future']) {
    const result = fixture(t, xml(row(), outcome)).aggregate();
    assert.equal(result.snapshot.qualification.verdict, 'UNKNOWN');
    assert.ok(result.coverageMap.gaps.some(gap => gap.description.startsWith('RUN_NOT_COMPLETED:')));
  }
});

test('requires independent inventory, safe host identity and matching Pipeline commit', t => {
  const f = fixture(t);
  for (const override of [{ expected: null }, { expected: { schemaVersion: 1, tests: [] } },
    { expected: { ...expected, tests: [...expected.tests, ...expected.tests] } },
    { runId: '../escape' }, { commit: 'abcdef0' }, { ref: '' }]) assert.throws(() => f.aggregate(override));
  const pipeline = { schemaVersion: 1, commit, tests: [{ id: 'AUTH-001', name: 'Login & logout' }] };
  const result = f.aggregate({ expected: pipeline });
  assert.equal(result.snapshot.qualification.verdict, 'PASS');
  assert.equal(result.snapshot.qualification.results[0].id, 'AUTH-001');
  assert.deepEqual(result.snapshot.tests[0].specIds, []); // No invented SPECTRA mapping.
  assert.ok(result.coverageMap.gaps.some(gap => gap.status === 'UNMAPPED'));
  assert.throws(() => f.aggregate({ expected: { ...pipeline, commit: 'b'.repeat(40) } }), /commit mismatch/);
});

test('XML security and ambiguity controls reject entities, namespaces, malformed or hidden rows', () => {
  const valid = xml();
  const cases = [
    valid.replace('<TestRun', '<!DOCTYPE TestRun [<!ENTITY x SYSTEM "file:///etc/passwd">]><TestRun'),
    valid.replace('Login &amp; logout', '&external;'),
    valid.replace('Login &amp; logout', '&#0;'),
    valid.replace('Login &amp; logout', 'unescaped & value'),
    valid.replace('testId="test-exec-1"', 'testId="test-1" testId="test-2"'),
    valid.replace('testId="test-exec-1" ', 'testId="test-1"'),
    valid.replace('<Results>', '<Results xmlns="urn:foreign">'),
    valid.replace('TeamTest/2010', 'TeamTest/2006'),
    valid.replace('<Results>', '<x:Results>'),
    valid.replace('</Results>', '</Wrong>'),
    valid.replace('</Results>', `</Results><Results>${row()}</Results>`),
    valid.replace('<ResultSummary', `<Output>${row()}</Output><ResultSummary`),
    valid.replace(row(), row().replace('/>', `><InnerResults>${row()}</InnerResults></UnitTestResult>`)),
    valid.replace('<Results>', '<Results><!-- invalid -- comment -->'),
    valid + '<TestRun/>', valid + 'trailing', valid.replace('<Results>', '<Results><?process x?>'),
    valid.replace('<Results>', '<Results><!DOCTYPE x>'), valid.replace('<Results>', '<Results>\u0000'),
    valid.replace('<ResultSummary', '<ResultSummary outcome="Completed"/><ResultSummary'),
  ];
  for (const candidate of cases) assert.throws(() => parseTrx(Buffer.from(candidate)), candidate.slice(0, 180));
  assert.throws(() => parseTrx(Buffer.from([0xff, 0xfe, 0x00])), /encoded|encoding/i);
  assert.throws(() => parseTrx(Buffer.alloc(16 * 1024 * 1024 + 1)), /16 MiB/);
  assert.throws(() => parseTrx(Buffer.from(valid.replace('<Results>', '<Results>' + '<x>'.repeat(65)))), /complexity/);
  assert.throws(() => parseTrx(Buffer.from(valid.replace('<Results>', '<Results>' + '<x/>'.repeat(200000)))), /complexity/);
  assert.equal(parseTrx(Buffer.from(valid.replace('Login &amp; logout', 'Login &#x26; logout'))).rows[0].testName, 'Login & logout');
});

test('input limits and symlink inputs/outputs fail closed', t => {
  const f = fixture(t), file = path.join(f.input, 'tests.trx');
  fs.symlinkSync(file, path.join(f.input, 'link.trx'));
  assert.throws(() => f.aggregate(), /Invalid/);
  fs.unlinkSync(path.join(f.input, 'link.trx'));
  const link = path.join(f.root, 'linked'); fs.symlinkSync(f.input, link);
  assert.throws(() => aggregateTrx(link, f.options), /symlink/);
  fs.symlinkSync(f.input, path.join(f.root, '.spectra'));
  assert.throws(() => writeTrxEvidence(f.root, f.aggregate()), /unsafe/);
  const many = fixture(t, null);
  for (let i = 0; i < 101; i++) fs.writeFileSync(path.join(many.input, `${i}.trx`), '');
  assert.throws(() => many.aggregate(), /100 files/);
});

test('writer is idempotent, immutable and never replaces a foreign or Allure-owned map', t => {
  const f = fixture(t), result = f.aggregate(), files = writeTrxEvidence(f.root, result);
  assert.deepEqual(files, writeTrxEvidence(f.root, result));
  assert.throws(() => writeTrxEvidence(f.root, { ...result, snapshot: { ...result.snapshot, extra: true } }), /different evidence/);
  fs.writeFileSync(files.mapFile, JSON.stringify({ producer: 'external' }));
  assert.throws(() => writeTrxEvidence(f.root, result), /producer/);
  fs.writeFileSync(files.mapFile, JSON.stringify({ producer: 'spectra.ingest-allure' }));
  assert.throws(() => writeTrxEvidence(f.root, result), /producer/);
  const other = fixture(t), allure = aggregateAllure(path.join(__dirname, 'fixtures/allure'), { runId: 'allure-ci' });
  writeAllureEvidence(other.root, allure);
  assert.throws(() => writeTrxEvidence(other.root, result), /producer/);
});

