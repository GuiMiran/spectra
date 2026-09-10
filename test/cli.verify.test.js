'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const CLI = path.join(__dirname, '..', 'bin', 'spectra.js');

function temporaryProject(t, acceptanceLayer, evidence) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-cli-verify-'));
  const spectra = path.join(root, '.spectra');
  fs.mkdirSync(spectra, { recursive: true });
  fs.writeFileSync(path.join(spectra, '11-acceptance-criteria.md'), acceptanceLayer, 'utf8');
  if (evidence !== undefined) {
    fs.writeFileSync(path.join(spectra, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  }
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function verify(root, args = []) {
  const result = childProcess.spawnSync(process.execPath, [CLI, 'verify', '--json', ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    ...result,
    report: JSON.parse(result.stdout),
  };
}

test('verify derives acceptance requirements and passes only recorded passed evidence', t => {
  const root = temporaryProject(t, '# AC-001\n# AC-002\n', {
    schemaVersion: 1,
    results: [
      { id: 'AC-001', status: 'passed', test: 'first acceptance test' },
      { id: 'AC-002', status: 'passed', test: 'second acceptance test' },
    ],
  });

  const result = verify(root);
  assert.equal(result.status, 0);
  assert.equal(result.report.success, true);
  assert.equal(result.report.requiredSource.endsWith(path.join('.spectra', '11-acceptance-criteria.md')), true);
  assert.deepEqual(result.report.passed, ['AC-001', 'AC-002']);
  assert.equal(result.report.counts.passedCoverage, 1);
});

test('verify fails closed for missing or non-passing acceptance evidence', t => {
  const root = temporaryProject(t, '# AC-001\n# AC-002\n# AC-003\n', {
    schemaVersion: 1,
    results: [
      { id: 'AC-001', status: 'passed' },
      { id: 'AC-002', status: 'skipped' },
    ],
  });

  const result = verify(root);
  assert.equal(result.status, 1);
  assert.equal(result.report.success, false);
  assert.deepEqual(result.report.skipped, ['AC-002']);
  assert.deepEqual(result.report.missing, ['AC-003']);
});

test('verify accepts an explicit bounded scope for a reviewed task', t => {
  const root = temporaryProject(t, '# AC-001\n# AC-002\n', {
    schemaVersion: 1,
    results: [{ id: 'AC-001', status: 'passed' }],
  });

  const result = verify(root, ['--require', 'AC-001']);
  assert.equal(result.status, 0);
  assert.equal(result.report.requiredSource, 'explicit');
  assert.deepEqual(result.report.required, ['AC-001']);
});
