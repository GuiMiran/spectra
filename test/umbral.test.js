'use strict';
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

test('Umbral detects seeded transition defects that escape the smoke', () => {
  const output = execFileSync(process.execPath, [path.join(__dirname, '../evals/umbral.mjs')], {
    encoding: 'utf8',
    timeout: 20000,
  });
  const results = output.trim().split('\n').map(line => JSON.parse(line));
  assert.deepEqual(results.map(({ variant, smoke, gate }) => [variant, smoke, gate]), [
    ['reference', 'PASS', 'PASS'],
    ['allows-skip', 'PASS', 'FAIL'],
    ['rejects-but-writes', 'PASS', 'FAIL'],
    ['rejects-with-wrong-code', 'PASS', 'FAIL'],
  ]);
  assert.deepEqual(results[2].checks, { status: true, code: true, state: false });
});
