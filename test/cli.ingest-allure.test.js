'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { CoverageMapAdapter } = require('../lib/evolution/gap-engine');

test('CLI imports Allure evidence and emits a coverage map consumed by the gap engine', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-allure-cli-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.join(__dirname, '..', 'bin', 'spectra.js');
  const input = path.join(__dirname, 'fixtures', 'allure');
  const output = execFileSync(process.execPath,
    [cli, 'ingest-allure', '--input', input, '--run-id', 'ci-42', '--commit', 'abcdef1234', '--json'],
    { cwd: root, encoding: 'utf8' });
  const report = JSON.parse(output);
  assert.equal(report.success, true);
  assert.equal(report.counts.attempts, 6);
  assert.equal(report.gaps, 4);
  const map = JSON.parse(fs.readFileSync(report.coverageMapFile, 'utf8'));
  assert.equal(map.producer, 'spectra.ingest-allure');
  assert.ok(map.gaps.some(gap => gap.id === 'INV-003' && gap.status === 'BROKEN'));
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'templates', 'evolution.config.json')));
  const aggregated = new CoverageMapAdapter(root, config).aggregate({ statement: 'Close test gaps' });
  assert.equal(aggregated.inputs.coverageMap, true);
  assert.ok(aggregated.gaps.some(gap => gap.id === 'INV-003'
    && gap.sources.includes('allure-results') && gap.evidenceRefs.length === 1));
});
