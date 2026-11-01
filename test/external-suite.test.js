'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadExternalSuite, evaluateExternalSuite, canonical, digest } = require('../lib/evaluation/external-suite');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const IMAGE = `node@sha256:${'c'.repeat(64)}`;
const source = 'module.exports = input => input.x * 2;';
function fixture(t, overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-external-suite-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const workspaceRoot = path.join(root, 'workspace'); fs.mkdirSync(workspaceRoot);
  const file = path.join(root, 'custodian-suite.json');
  const data = { schemaVersion: 1, suiteId: 'synthetic-private-location', suiteVersion: 'v1',
    cases: [{ id: 'double-one', input: { x: 1 }, expected: 2 }, { id: 'double-negative', input: { x: -3 }, expected: -6 }], ...overrides };
  const bytes = JSON.stringify(data); fs.writeFileSync(file, bytes);
  const expectedDigest = sha256(bytes);
  return { file, workspaceRoot, expectedDigest, data, root,
    load: () => loadExternalSuite(file, { workspaceRoot, expectedDigest }) };
}
const approve = async (_, requestHash) => ({ schemaVersion: 1, requestHash, approvedBy: 'synthetic-trusted-host', expiresAt: new Date(Date.now() + 60000).toISOString() });
function config(execute) { return { candidateSource: source, image: IMAGE, limits: { timeoutMs: 1000, maxOutputBytes: 1024 }, approve, execute }; }
const completed = (request, value) => ({ schemaVersion: 1, requestHash: digest(request), image: IMAGE,
  status: 'COMPLETED', cleanupConfirmed: true, output: value, outputHash: digest(value) });

test('approved external bytes load frozen; raw expected answers never go to execution or report', async t => {
  const f = fixture(t), suite = f.load(); let count = 0;
  assert.ok(Object.isFrozen(suite.cases[0].input));
  const report = await evaluateExternalSuite(suite, config(async (request, approval, payload) => {
    count++; assert.deepEqual(Object.keys(payload).sort(), ['candidateSource', 'input']);
    assert.equal(payload.candidateSource, source); assert.equal(approval.requestHash, digest(request));
    assert.equal(Object.isFrozen(request.limits), true); assert.equal(Object.isFrozen(approval), true);
    assert.equal(JSON.stringify([request, payload]).includes('expected'), false);
    assert.equal(JSON.stringify([request, payload]).includes(f.file), false);
    return completed(request, payload.input.x * 2);
  }));
  assert.equal(count, 2); assert.equal(report.verdict, 'PASS'); assert.equal(report.score, 1);
  assert.equal(report.expectedCases, 2); assert.equal(report.completedCases, 2); assert.equal(report.dispatchedCases, 2);
  assert.equal(Object.isFrozen(report.rows[0]), true);
  assert.equal('output' in report.rows[0], false); assert.equal('input' in report.rows[0], false);
  assert.equal(JSON.stringify(report).includes('double-negative'), false);
  const { reportHash, ...body } = report; assert.equal(reportHash, digest(body));
});
test('loader rejects workspace-local, symlinked, altered and overlarge suite files', t => {
  const f = fixture(t);
  assert.throws(() => loadExternalSuite(f.file, { workspaceRoot: f.workspaceRoot, expectedDigest: '0'.repeat(64) }), /digest mismatch/);
  const local = path.join(f.workspaceRoot, 'suite.json'); fs.copyFileSync(f.file, local);
  assert.throws(() => loadExternalSuite(local, { workspaceRoot: f.workspaceRoot, expectedDigest: f.expectedDigest }), /outside/);
  const link = path.join(f.root, 'link.json'); fs.symlinkSync(f.file, link);
  assert.throws(() => loadExternalSuite(link, { workspaceRoot: f.workspaceRoot, expectedDigest: f.expectedDigest }), /Invalid/);
  fs.writeFileSync(f.file, 'x'.repeat(1024 * 1024 + 1)); assert.throws(f.load, /Invalid/);
});
test('malformed suite contracts are rejected before evaluation', async t => {
  const variants = [
    { schemaVersion: 2 }, { suiteId: '../bad' }, { cases: [] }, { cases: Array(33).fill({ id: 'x', input: null, expected: null }) },
    { cases: [{ id: 'duplicate', input: 1, expected: 1 }, { id: 'duplicate', input: 2, expected: 2 }] },
    { cases: [{ id: 'x', input: 1, expected: 1, command: 'ignored?' }] },
    { cases: [{ id: 'x', input: 'a'.repeat(65537), expected: 1 }] }, { unexpected: true }
  ];
  for (const value of variants) await t.test(JSON.stringify(value).slice(0, 70), t => { const f = fixture(t, value); assert.throws(f.load); });
});
test('unbranded objects and unsafe configuration cannot dispatch', async t => {
  const f = fixture(t), suite = f.load(); let called = false;
  const c = config(async () => { called = true; });
  await assert.rejects(evaluateExternalSuite({ ...suite }, c));
  await assert.rejects(evaluateExternalSuite(suite, { ...c, image: 'node:24' }));
  await assert.rejects(evaluateExternalSuite(suite, { ...c, limits: { timeoutMs: 30001, maxOutputBytes: 1024 } }));
  assert.equal(called, false);
});
test('invalid approvals never invoke the external executor', async t => {
  for (const mode of ['null', 'expired', 'mismatched', 'missing-identity', 'extra-field', 'long-lived']) await t.test(mode, async t => {
    const f = fixture(t); let calls = 0;
    const c = config(async () => { calls++; });
    c.approve = async (request, hash) => {
      const a = await approve(request, hash);
      if (mode === 'null') return null;
      if (mode === 'expired') a.expiresAt = '2000-01-01T00:00:00Z';
      if (mode === 'mismatched') a.requestHash = '0'.repeat(64);
      if (mode === 'missing-identity') a.approvedBy = '';
      if (mode === 'extra-field') a.enabled = true;
      if (mode === 'long-lived') a.expiresAt = new Date(Date.now() + 172800000).toISOString();
      return a;
    };
    const r = await evaluateExternalSuite(f.load(), c); assert.equal(r.verdict, 'UNRESOLVED'); assert.equal(r.score, null); assert.equal(calls, 0);
    assert.equal(r.attemptedCases, 1); assert.equal(r.dispatchedCases, 0); assert.equal(r.completedCases, 0);
  });
});
test('wrong results and candidate errors fail; infrastructure uncertainty never invents a score', async t => {
  const f = fixture(t), suite = f.load();
  const wrong = await evaluateExternalSuite(suite, config(async request => completed(request, 999)));
  assert.equal(wrong.verdict, 'FAIL'); assert.equal(wrong.score, 0);
  const errors = await evaluateExternalSuite(suite, config(async request => ({ ...completed(request, 1), status: 'CANDIDATE_ERROR' })));
  assert.equal(errors.verdict, 'FAIL'); assert.equal(errors.score, 0);
  const mutations = [r => { r.cleanupConfirmed = false; }, r => { r.requestHash = '0'.repeat(64); }, r => { r.image = 'other'; },
    r => { r.outputHash = '0'.repeat(64); }, r => { r.schemaVersion = 2; }, r => { delete r.output; },
    ...['TIMEOUT', 'OUTPUT_LIMIT', 'RESOURCE_LIMIT', 'UNAVAILABLE', 'DENIED', 'INFRA_ERROR'].map(status => r => { r.status = status; })];
  for (const mutate of mutations) {
    const report = await evaluateExternalSuite(suite, config(async request => { const r = completed(request, 2); mutate(r); return r; }));
    assert.equal(report.verdict, 'UNRESOLVED'); assert.equal(report.score, null); assert.equal(report.attemptedCases, 1);
    assert.equal(report.dispatchedCases, 1); assert.equal(report.completedCases, 0);
  }
  const thrown = await evaluateExternalSuite(suite, config(async () => { throw Error('PRIVATE_ADAPTER_MESSAGE'); }));
  assert.equal(thrown.score, null); assert.equal(JSON.stringify(thrown).includes('PRIVATE_ADAPTER_MESSAGE'), false);
});
test('canonical representation matches the Runtime JSON contract', () => {
  assert.equal(canonical({ z: [true, 1], a: null }), '{"a":null,"z":[true,1]}');
  assert.throws(() => canonical(undefined));
});
