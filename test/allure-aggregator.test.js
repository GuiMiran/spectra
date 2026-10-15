'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { aggregateAllure, writeAllureEvidence } = require('../lib/evidence/allure-aggregator');
const { parseCoverageMap } = require('../lib/evolution/gap-engine');

const FIXTURE = path.join(__dirname, 'fixtures', 'allure');

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-allure-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('ingests pass, fail, broken, retry, skip and unmapped results deterministically', () => {
  const first = aggregateAllure(FIXTURE, { runId: 'ci-42', commit: 'abcdef1234', ref: 'refs/heads/main' });
  const second = aggregateAllure(FIXTURE, { runId: 'ci-42', commit: 'abcdef1234', ref: 'refs/heads/main' });
  assert.deepEqual(first, second);
  assert.deepEqual(first.snapshot.counts, {
    tests: 5, attempts: 6, passed: 2, failed: 1, broken: 1, skipped: 1, unmapped: 2, flaky: 1,
  });
  const retry = first.snapshot.tests.find(item => item.key === 'payment');
  assert.deepEqual(retry.attempts.map(item => item.status), ['failed', 'passed']);
  assert.equal(retry.flaky, true);
  assert.equal(retry.specIds[0], 'AC-002');
  assert.equal(first.snapshot.provenance.files.length, 6);
  assert.ok(first.snapshot.provenance.files.every(file => /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.deepEqual(first.coverageMap.gaps.map(item => item.status).sort(),
    ['BROKEN', 'FLAKY', 'UNMAPPED', 'UNMAPPED']);
  const parsed = parseCoverageMap(first.coverageMap);
  assert.equal(parsed.find(item => item.id === 'INV-003').severity, 'CRITICAL');
  assert.ok(parsed.every(item => item.evidenceRefs.length === 1 && item.runId === 'ci-42'));
});

test('writes versioned snapshot and current gap map without overwriting external maps', t => {
  const root = project(t);
  const result = aggregateAllure(FIXTURE, { runId: 'ci-42' });
  const files = writeAllureEvidence(root, result);
  assert.ok(fs.existsSync(files.snapshotFile));
  assert.equal(JSON.parse(fs.readFileSync(files.mapFile)).gaps.length, 4);
  assert.deepEqual(writeAllureEvidence(root, result), files);
  const changed = aggregateAllure(FIXTURE, { runId: 'ci-42', ref: 'other' });
  assert.throws(() => writeAllureEvidence(root, changed), /different evidence/);
  fs.writeFileSync(files.mapFile, '{"schemaVersion":1,"gaps":[]}');
  assert.throws(() => writeAllureEvidence(root, result), /not Allure-managed/);
});

test('rejects malformed inputs, unsafe run IDs, duplicate UUIDs and symlinked results', t => {
  const root = project(t);
  assert.throws(() => aggregateAllure(root), /No \*-result.json/);
  const file = path.join(root, 'one-result.json');
  fs.writeFileSync(file, '{');
  assert.throws(() => aggregateAllure(root), /Malformed/);
  fs.writeFileSync(file, '{"uuid":"one","status":"passed","name":"AC-001"}');
  assert.throws(() => aggregateAllure(root, { runId: '../escape' }), /safe alphanumeric/);
  fs.writeFileSync(path.join(root, 'two-result.json'), '{"uuid":"one","status":"passed","name":"AC-001"}');
  assert.throws(() => aggregateAllure(root), /Duplicate Allure uuid/);
  fs.unlinkSync(path.join(root, 'two-result.json'));
  fs.symlinkSync(file, path.join(root, 'two-result.json'));
  assert.throws(() => aggregateAllure(root), /Invalid Allure result file/);
});
