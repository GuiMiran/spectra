'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  EVIDENCE_SCHEMA_VERSION,
  compareEvidenceIds,
  readEvidenceFile,
  readAcceptanceCriteriaIds,
  validateEvidenceDocument,
  verifyEvidenceFile,
} = require('../lib/verification');

function evidence(results, run = undefined) {
  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    ...(run === undefined ? {} : { run }),
    results,
  };
}

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-evidence-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('validates the minimum canonical evidence schema and optional execution metadata', () => {
  const document = evidence([
    {
      id: 'AC-001',
      status: 'passed',
      command: 'npm test -- cobrar',
      test: 'CobroService rechaza pago insuficiente',
      artifacts: ['test/cobro.service.spec.ts'],
    },
  ], {
    command: 'npm run spectra:demo',
    commit: 'abc1234',
    executedAt: '2026-09-10T12:00:00.000Z',
  });

  assert.deepEqual(validateEvidenceDocument(document), { valid: true, errors: [] });
});

test('reports structural validation failures rather than accepting ambiguous evidence', () => {
  const validation = validateEvidenceDocument(evidence([
    { id: 'AC-001', status: 'passed' },
    { id: 'AC-001', status: 'unknown', artifacts: [''] },
  ], { command: 42 }));

  assert.equal(validation.valid, false);
  assert.deepEqual(
    validation.errors.map(error => error.code),
    ['INVALID_STRING', 'DUPLICATE_ID', 'INVALID_STATUS', 'INVALID_STRING_ARRAY']
  );
});

test('compares requested IDs without treating failed or skipped evidence as passed', () => {
  const comparison = compareEvidenceIds(evidence([
    { id: 'AC-001', status: 'passed' },
    { id: 'AC-002', status: 'failed' },
    { id: 'AC-003', status: 'skipped' },
    { id: 'AC-999', status: 'passed' },
  ]), ['AC-003', 'AC-001', 'AC-002', 'AC-004']);

  assert.equal(comparison.valid, true);
  assert.deepEqual(comparison.present, ['AC-003', 'AC-001', 'AC-002']);
  assert.deepEqual(comparison.passed, ['AC-001']);
  assert.deepEqual(comparison.failed, ['AC-002']);
  assert.deepEqual(comparison.skipped, ['AC-003']);
  assert.deepEqual(comparison.missing, ['AC-004']);
  assert.deepEqual(comparison.counts, {
    requested: 4,
    present: 3,
    passed: 1,
    failed: 1,
    skipped: 1,
    missing: 1,
    passedCoverage: 0.25,
  });
});

test('reports a missing evidence file explicitly and marks every requested ID missing', t => {
  const directory = temporaryDirectory(t);
  const file = path.join(directory, 'evidence.json');
  const result = verifyEvidenceFile(file, ['AC-001', 'INV-001']);

  assert.equal(result.state, 'missing');
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['AC-001', 'INV-001']);
  assert.equal(result.errors[0].code, 'EVIDENCE_FILE_MISSING');
});

test('returns an invalid state for malformed JSON instead of throwing', t => {
  const directory = temporaryDirectory(t);
  const file = path.join(directory, 'evidence.json');
  fs.writeFileSync(file, '{invalid', 'utf8');

  const result = readEvidenceFile(file);
  assert.equal(result.state, 'invalid');
  assert.equal(result.validation.errors[0].code, 'INVALID_JSON');
});

test('reads and verifies a valid evidence file deterministically', t => {
  const directory = temporaryDirectory(t);
  const file = path.join(directory, 'evidence.json');
  fs.writeFileSync(file, `${JSON.stringify(evidence([
    { id: 'BR-001', status: 'passed', artifacts: ['src/cobro.service.ts'] },
    { id: 'INV-001', status: 'passed' },
  ]), null, 2)}\n`, 'utf8');

  const result = verifyEvidenceFile(file, ['INV-001', 'BR-001']);
  assert.equal(result.state, 'valid');
  assert.equal(result.valid, true);
  assert.deepEqual(result.passed, ['INV-001', 'BR-001']);
  assert.equal(result.counts.passedCoverage, 1);
});

test('reads unique acceptance IDs from the canonical layer without treating them as evidence', t => {
  const root = temporaryDirectory(t);
  const spectraDirectory = path.join(root, '.spectra');
  fs.mkdirSync(spectraDirectory);
  const layer = path.join(spectraDirectory, '11-acceptance-criteria.md');
  fs.writeFileSync(layer, '# AC-002\nReferences AC-001 and AC-002 again.\n', 'utf8');

  const result = readAcceptanceCriteriaIds(root);
  assert.equal(result.file, layer);
  assert.deepEqual(result.ids, ['AC-002', 'AC-001']);
});

test('refuses to infer acceptance coverage when the canonical layer is absent or empty', t => {
  const root = temporaryDirectory(t);
  assert.throws(() => readAcceptanceCriteriaIds(root), /does not exist/);

  const spectraDirectory = path.join(root, '.spectra');
  fs.mkdirSync(spectraDirectory);
  fs.writeFileSync(path.join(spectraDirectory, '11-acceptance-criteria.md'), '# Empty\n', 'utf8');
  assert.throws(() => readAcceptanceCriteriaIds(root), /No acceptance-criterion IDs/);
});
