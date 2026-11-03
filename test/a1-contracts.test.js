'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { assessA1Contracts } = require('../lib/verification/a1-contracts');
const { sha256 } = require('../lib/agent-runtime/contracts');
const { run } = require('../scripts/a1-contracts');
const fixture = require('../evals/a1-contracts.v1.json');
const fresh = () => JSON.parse(JSON.stringify(fixture));
function bind(record) {
  record.guidoAssessment.provenance.repositoryProfileSha256 = sha256(record.repositoryProfile);
  record.guidoAssessment.provenance.evidenceBundleSha256 = sha256(record.evidenceBundle);
  return record;
}

test('synthetic contracts validate without scoring, execution authority or A1 completion', () => {
  const record = fresh(), before = JSON.stringify(record), report = assessA1Contracts(record);
  assert.equal(report.valid, true);
  assert.equal(report.scope, 'structure-and-lineage-only');
  assert.equal(report.evidenceMode, 'fixture');
  assert.equal(report.organizationalLevel, null);
  assert.equal(report.migrationEffort, null);
  assert.equal(report.executionAuthorized, false);
  assert.equal(report.a1CycleComplete, false);
  assert.equal(JSON.stringify(record), before);
});

test('every missing contract or required top-level field fails closed', () => {
  for (const key of Object.keys(fixture)) {
    const record = fresh(); delete record[key];
    assert.equal(assessA1Contracts(record).valid, false, key);
  }
  for (const kind of ['repositoryProfile', 'evidenceBundle', 'guidoAssessment']) {
    for (const key of Object.keys(fixture[kind])) {
      const record = fresh(); delete record[kind][key];
      assert.equal(assessA1Contracts(record).valid, false, `${kind}.${key}`);
    }
  }
});

test('schema version, unknown effects and attempted scoring are rejected', () => {
  for (const mutate of [r => { r.schemaVersion = 2; }, r => { r.command = 'execute'; },
    r => { r.guidoAssessment.organizationalLevel = 'G5'; }, r => { r.guidoAssessment.migrationEffort = 'low'; },
    r => { r.guidoAssessment.rubric = 'self-approved'; }, r => { r.guidoAssessment.executionAuthorized = true; },
    r => { r.guidoAssessment.requiresHumanApproval = false; }, r => { r.guidoAssessment.sourceWrites = 1; },
    r => { r.repositoryProfile.scope = 'verified-quality'; }, r => { r.evidenceBundle.scope = 'exhaustive-product'; }]) {
    const record = fresh(); mutate(record);
    assert.equal(assessA1Contracts(record).valid, false);
  }
});

test('cross-repository, mixed-commit, correlation drift and stale inputs cannot link', () => {
  for (const mutate of [r => { r.evidenceBundle.repository.commit = 'b'.repeat(40); },
    r => { r.guidoAssessment.repository.fullName = 'other/repo'; }, r => { r.guidoAssessment.correlationId = 'other-cycle'; },
    r => { r.guidoAssessment.generatedAt = '2026-11-02T00:00:00.000Z'; },
    r => { r.evidenceBundle.generatedAt = '2026-02-30T00:00:00.000Z'; }]) {
    const record = fresh(); mutate(record); bind(record);
    assert.equal(assessA1Contracts(record).valid, false);
  }
});

test('changing a linked input without updating its canonical digest is detected', () => {
  const record = fresh(); record.repositoryProfile.producer.version = '1.0.1';
  assert.equal(assessA1Contracts(record).valid, false);
  assert.equal(assessA1Contracts(bind(record)).valid, true);
});

test('complete eight-check inventory distinguishes absence from observed file presence only', () => {
  for (const mutate of [r => r.repositoryProfile.observations.pop(),
    r => { r.repositoryProfile.observations[0] = r.repositoryProfile.observations[1]; },
    r => { r.repositoryProfile.observations[0].status = 'observed'; },
    r => { r.repositoryProfile.observations[0].evidenceCount = 1; },
    r => { r.repositoryProfile.observations[0].paths = ['../outside']; }]) {
    const record = fresh(); mutate(record); bind(record);
    assert.equal(assessA1Contracts(record).valid, false);
  }
  const record = fresh();
  record.repositoryProfile.observations[0] = { id: 'project_readme', status: 'observed', evidenceCount: 1, paths: ['README.md'] };
  assert.equal(assessA1Contracts(bind(record)).valid, true);
});

test('PASS cannot hide zero, missing, duplicate-count, skipped or unmapped results', () => {
  for (const mutate of [r => { r.evidenceBundle.counts.expected = 0; }, r => { r.evidenceBundle.counts.expected = 2; },
    r => { r.evidenceBundle.counts.observed = 2; }, r => { r.evidenceBundle.counts.unmapped = 1; },
    r => { r.evidenceBundle.counts.passed = 0; r.evidenceBundle.counts.skipped = 1; }]) {
    const record = fresh(); mutate(record); bind(record);
    assert.equal(assessA1Contracts(record).valid, false);
  }
});

test('well-formed failing and unknown evidence remain explicit, not organizational scoring', () => {
  const failed = fresh(); failed.evidenceBundle.qualification = 'FAIL';
  failed.evidenceBundle.counts.passed = 0; failed.evidenceBundle.counts.failed = 1;
  const failReport = assessA1Contracts(bind(failed));
  assert.equal(failReport.valid, true);
  assert.equal(failReport.evidenceState, 'FAIL');
  assert.equal(failReport.a1CycleComplete, false);
  const unknown = fresh(); unknown.evidenceBundle.qualification = 'UNKNOWN';
  unknown.evidenceBundle.counts.passed = 0; unknown.evidenceBundle.counts.skipped = 1;
  assert.equal(assessA1Contracts(bind(unknown)).evidenceState, 'UNKNOWN');
});

test('invalid values, newline hash suffixes and unsafe paths cannot pass the fixed schemas', () => {
  for (const mutate of [r => { r.evidenceBundle.provenance.snapshotSha256 = '2'.repeat(64) + '\n'; },
    r => { r.repositoryProfile.repository.commit = 'a'.repeat(40) + '\n'; },
    r => { r.evidenceBundle.counts.passed = NaN; }, r => { r.evidenceBundle.counts.observed = 1.5; },
    r => { r.repositoryProfile.observations[0].paths = ['/absolute']; },
    r => { r.repositoryProfile.observations[0].paths = ['a//b']; }]) {
    const record = fresh(); mutate(record);
    assert.equal(assessA1Contracts(record).valid, false);
  }
});

test('CLI validates bounded regular JSON and never writes or executes plans', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'a1-contracts-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, 'input.json'); fs.writeFileSync(file, JSON.stringify(fixture));
  assert.equal(run(['--input', file]).exitCode, 0);
  assert.equal(run([]).exitCode, 2);
  const link = path.join(root, 'link.json'); fs.symlinkSync(file, link);
  assert.equal(run(['--input', link]).exitCode, 2);
  fs.writeFileSync(file, '{bad'); assert.equal(run(['--input', file]).exitCode, 2);
  fs.writeFileSync(file, 'x'.repeat(1024 * 1024 + 1)); assert.equal(run(['--input', file]).exitCode, 2);
  assert.deepEqual(fs.readdirSync(root).sort(), ['input.json', 'link.json']);
});
