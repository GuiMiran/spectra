'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { run } = require('../scripts/stage2-assess');

test('CI passes a complete illustrative record', () => {
  const result = run(['--input', path.join(__dirname, '../evals/stage2-pass.json')]);
  assert.equal(result.exitCode, 0);
  assert.equal(result.output.verdict, 'PASS');
});

test('CI exits with 2 on absent or invalid input', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-stage2-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  assert.equal(run(['--input', path.join(directory, 'missing.json')]).exitCode, 2);
  const file = path.join(directory, 'invalid.json');
  fs.writeFileSync(file, '{', 'utf8');
  assert.equal(run(['--input', file]).exitCode, 2);
});

test('CI exits with 1 for a well-formed but unresolved record', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-stage2-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'unresolved.json');
  fs.writeFileSync(file, JSON.stringify({
    schemaVersion: 1, agentId: 'builder', candidateCommit: 'a', integratedCommit: 'b',
    integration: { verifiedCommit: 'b', includesCandidate: true },
    policies: [], checks: [], coordination: { tasks: [] }, repetitions: [],
  }));
  const result = run(['--input', file]);
  assert.equal(result.exitCode, 1);
  assert.equal(result.output.verdict, 'UNRESOLVED');
});
