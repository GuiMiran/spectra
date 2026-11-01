'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadExternalSuite, evaluateExternalSuite } = require('../lib/evaluation');
assert.ok(process.env.GUIDO_RUNTIME_MODULE, 'Explicit trusted Runtime checkout required; never silently skip.');
const runtime = require(path.resolve(process.env.GUIDO_RUNTIME_MODULE));
assert.match(process.env.GUIDO_RUNTIME_COMMIT || '', /^[a-f0-9]{40}$/);
assert.match(process.env.GUIDO_EVAL_IMAGE || '', /@sha256:[a-f0-9]{64}$/);
const reports = [];
test.after(() => fs.writeFileSync('external-runtime-controls.json', JSON.stringify({ schemaVersion: 1, syntheticControlsOnly: true,
  runtimeCommit: process.env.GUIDO_RUNTIME_COMMIT, reports }, null, 2)));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-runtime-ci-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const workspaceRoot = path.join(root, 'candidate-workspace'); fs.mkdirSync(workspaceRoot);
  const file = path.join(root, 'custodian-suite.json');
  const bytes = JSON.stringify({ schemaVersion: 1, suiteId: 'public-synthetic-controls', suiteVersion: 'v1',
    cases: [{ id: 'positive', input: { n: 5 }, expected: 10 }, { id: 'negative', input: { n: -4 }, expected: -8 }] });
  fs.writeFileSync(file, bytes);
  return loadExternalSuite(file, { workspaceRoot, expectedDigest: crypto.createHash('sha256').update(bytes).digest('hex') });
}
const approve = async (_, requestHash) => ({ schemaVersion: 1, requestHash, approvedBy: 'synthetic-ci-fixture', expiresAt: new Date(Date.now() + 60000).toISOString() });
function config(candidateSource) {
  return { candidateSource, image: process.env.GUIDO_EVAL_IMAGE, limits: { timeoutMs: 10000, maxOutputBytes: 8192 }, approve,
    execute: (request, approval, payload) => runtime.executeCandidate(request, approval, payload, { enabled: true }) };
}
test('SPECTRA to pinned Runtime: synthetic correct implementation passes two externally loaded cases', async t => {
  const report = await evaluateExternalSuite(fixture(t), config('module.exports = input => input.n * 2;'));
  reports.push(report); assert.equal(report.verdict, 'PASS'); assert.equal(report.score, 1);
  assert.equal(report.completedCases, 2); assert.ok(report.rows.every(row => row.status === 'COMPLETED'));
});
test('synthetic defective implementation fails the same external oracle', async t => {
  const report = await evaluateExternalSuite(fixture(t), config('module.exports = input => input.n * 3;'));
  reports.push(report); assert.equal(report.verdict, 'FAIL'); assert.equal(report.score, 0);
});
test('candidate exceptions produce failures, not invented passing evidence', async t => {
  const report = await evaluateExternalSuite(fixture(t), config('module.exports = () => {throw Error("controlled failure")};'));
  reports.push(report); assert.equal(report.verdict, 'FAIL'); assert.equal(report.score, 0);
  assert.ok(report.rows.every(row => row.status === 'CANDIDATE_ERROR'));
});
test('missing approval never dispatches Runtime', async t => {
  const c = config('module.exports = () => 1;'); let called = false;
  c.approve = async () => null; c.execute = async () => { called = true; };
  const report = await evaluateExternalSuite(fixture(t), c); reports.push(report);
  assert.equal(report.verdict, 'UNRESOLVED'); assert.equal(report.score, null); assert.equal(called, false);
});
