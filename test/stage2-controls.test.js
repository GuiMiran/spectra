'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { runControls, verifyFreeze, validateProtocol } = require('../evals/stage2/run-controls');
const { runVariant } = require('../evals/stage2/implementations');
const { assessCase } = require('../evals/stage2/oracle');
const directory = path.join(__dirname, '../evals/stage2');
const protocol = () => JSON.parse(fs.readFileSync(path.join(directory, 'protocol.json'), 'utf8'));

test('frozen public controls accept two correct alternatives and reject two faults per coupled case', async () => {
  assert.equal(verifyFreeze().valid, true);
  const report = await runControls();
  assert.equal(report.verdict, 'PASS');
  assert.deepEqual(report.metrics, { logicalControls: 16, executions: 48,
    positiveExecutions: 24, negativeExecutions: 24, falseAccepts: 0, falseRejects: 0, unstableExecutions: 0 });
  assert.ok(report.rows.every(row => row.matched && row.beforeHash === row.afterHash));
  assert.ok(Object.isFrozen(report));
  assert.equal(report.reportHash, (await runControls()).reportHash);
  assert.equal(report.effects.modelCalls, 0);
});

test('each defect maps to a discriminating oracle violation rather than a target-provided pass flag', async () => {
  const expected = {
    'duplicate-effect': 'EXACTLY_ONCE', 'no-retry': 'OPERATION_COMPLETED',
    'check-before-yield': 'SHARED_CAPACITY', 'reject-all': 'CAPACITY_PROGRESS',
    'raw-sensitive-data': 'NO_RAW_SENSITIVE_DATA', 'drop-correlation': 'TRACE_CORRELATED',
    'reject-v1': 'LEGACY_V1_ACCEPTED', 'absence-is-pass': 'ABSENCE_NOT_PASS',
  };
  for (const item of protocol().cases) {
    assert.equal(assessCase(item.id, item.input, { passed: true }).passed, false);
    for (const variant of item.negative) {
      const result = await runVariant(item.id, variant, item.input);
      const before = JSON.stringify(result);
      const assessed = assessCase(item.id, item.input, result);
      assert.equal(assessed.passed, false);
      assert.ok(assessed.violations.includes(expected[variant]));
      assert.equal(JSON.stringify(result), before);
    }
  }
});

test('correct implementations compute behaviour for changed inputs instead of replaying fixture answers', async () => {
  const cases = protocol().cases;
  cases.find(item => item.id === 'retry-idempotency').input.amountCents = 1300;
  cases.find(item => item.id === 'concurrency-limits').input = { jobs: 5, limit: 3 };
  cases.find(item => item.id === 'trace-privacy').input.traceId = 'TRACE-DIFFERENT';
  for (const item of cases) for (const variant of item.positive) {
    const result = await runVariant(item.id, variant, item.input);
    assert.equal(assessCase(item.id, item.input, result).passed, true);
  }
  await assert.rejects(runVariant('toString', 'reference', {}), /Unknown/);
  await assert.rejects(runVariant('retry-idempotency', 'arbitrary-module', {}), /Unknown/);
});

test('removed controls, byte mutations and manifest omissions invalidate the freeze', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-stage2-freeze-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files = ['implementations.js', 'oracle.js', 'protocol.json', 'run-controls.js', 'freeze.json'];
  const restore = () => files.forEach(file => fs.copyFileSync(path.join(directory, file), path.join(root, file)));
  restore(); assert.equal(verifyFreeze(root).valid, true);
  fs.appendFileSync(path.join(root, 'oracle.js'), '\n// changed');
  assert.equal(verifyFreeze(root).valid, false);
  restore(); fs.unlinkSync(path.join(root, 'implementations.js'));
  assert.equal(verifyFreeze(root).valid, false);
  restore(); const manifest = JSON.parse(fs.readFileSync(path.join(root, 'freeze.json')));
  delete manifest.files['oracle.js'];
  fs.writeFileSync(path.join(root, 'freeze.json'), JSON.stringify(manifest));
  assert.equal(verifyFreeze(root).valid, false);
});

test('invalid protocols fail before implementation execution', () => {
  for (const mutate of [value => value.cases.pop(), value => { value.repetitions = 0; },
    value => { value.cases[0].positive = []; }, value => { value.cases[0].input.amountCents = -1; },
    value => { value.cases[1].input.jobs = '3'; }]) {
    const value = protocol(); mutate(value); assert.throws(() => validateProtocol(value));
  }
});

test('CLI emits the fault matrix without raw synthetic sensitive data and accepts no arbitrary modules', () => {
  const script = path.join(__dirname, '../scripts/stage2-controls.js');
  const run = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  const result = JSON.parse(run.stdout);
  assert.equal(result.metrics.executions, 48);
  assert.ok(!run.stdout.includes('SYNTHETIC_TOKEN_NOT_A_CREDENTIAL'));
  assert.ok(!run.stdout.includes('synthetic@example.invalid'));
  const invalid = spawnSync(process.execPath, [script, '--module', 'unknown.js'], { encoding: 'utf8' });
  assert.equal(invalid.status, 2);
  assert.equal(JSON.parse(invalid.stdout).verdict, 'UNRESOLVED');
});
