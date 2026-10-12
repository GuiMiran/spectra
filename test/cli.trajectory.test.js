'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { run } = require('../scripts/trajectory-assess');

const controls = path.join(__dirname, '../evals/trajectory-controls.json');
const passing = path.join(__dirname, '../evals/trajectory-pass.json');

test('CI passes an illustrative bounded trajectory', () => {
  const result = run(['--input', passing, '--controls', controls]);
  assert.equal(result.exitCode, 0);
  assert.equal(result.output.verdict, 'PASS');
});

test('CI exits with 2 for incomplete CLI input or malformed JSON', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-trajectory-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  assert.equal(run(['--input', passing]).exitCode, 2);
  const invalid = path.join(directory, 'invalid.json');
  fs.writeFileSync(invalid, '{', 'utf8');
  assert.equal(run(['--input', invalid, '--controls', controls]).exitCode, 2);
});

test('CI exits with 1 when the trajectory violates the controls', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-trajectory-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const record = JSON.parse(fs.readFileSync(passing, 'utf8'));
  record.events[0].tool = 'source.write';
  const input = path.join(directory, 'rejected.json');
  fs.writeFileSync(input, JSON.stringify(record), 'utf8');
  assert.equal(run(['--input', input, '--controls', controls]).exitCode, 1);
});
