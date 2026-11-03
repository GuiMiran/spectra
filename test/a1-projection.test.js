'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const test = require('node:test');
const { projectA1Contracts } = require('../lib/verification/a1-projection');
const { projectA1GapPlan } = require('../lib/verification/a1-gap-plan');
const { sha256 } = require('../lib/agent-runtime/contracts');
const { qualifyEvidence } = require('../lib/evidence/qualification');
const root = path.join(__dirname, '../evals/a1-recorded-pipeline');
const recordedPins = require('../evals/a1-recorded-pipeline/pins.json');
const fixture = require('../evals/a1-contracts.v1.json');
const clone = value => JSON.parse(JSON.stringify(value));
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const bytes = value => Buffer.from(JSON.stringify(value));
const options = { generatedAt: '2026-11-03T00:00:00.000Z', correlationId: 'a1-projection-unit' };

function inputs() {
  // Audit is explicitly synthetic in UNIT tests. Dedicated CI runs the actual pinned auditor.
  const audit = { schema_version: '1.0', agent: 'sdd-auditor', agent_version: '0.1.0',
    repository: { commit: recordedPins.source.commit }, guido_scale: { organizational_level: null, migration_effort: null },
    checks: fixture.repositoryProfile.observations.map(item => ({ id: item.id, status: item.status,
      evidence_count: item.evidenceCount, evidence: item.paths })) };
  return { auditBytes: bytes(audit), receiptBytes: fs.readFileSync(path.join(root, 'receipt.json')),
    snapshotBytes: fs.readFileSync(path.join(root, 'snapshot.json')), expectedBytes: fs.readFileSync(path.join(root, 'expected.json')) };
}
function rebind(data, pins) {
  pins.hashes.receiptSha256 = digest(data.receiptBytes);
  pins.hashes.snapshotSha256 = digest(data.snapshotBytes);
  pins.hashes.expectedInventorySha256 = digest(data.expectedBytes);
}

test('projects original byte-pinned recorded evidence deterministically without scoring or authority', () => {
  const data = inputs(), pins = clone(recordedPins), original = digest(data.auditBytes);
  const first = projectA1Contracts(data, pins, options), second = projectA1Contracts(data, pins, options);
  assert.deepEqual(first, second);
  assert.equal(first.validation.valid, true);
  assert.equal(first.contracts.evidenceBundle.counts.passed, 28);
  assert.equal(first.contracts.evidenceBundle.repository.commit, pins.source.commit);
  assert.equal(first.contracts.repositoryProfile.provenance.auditSha256, original);
  assert.equal(first.contracts.guidoAssessment.organizationalLevel, null);
  assert.equal(first.contracts.guidoAssessment.executionAuthorized, false);
  assert.equal(first.validation.a1CycleComplete, false);
  assert.ok(Object.isFrozen(first.contracts.guidoAssessment));
  assert.equal(digest(data.auditBytes), original);
});

test('every altered recorded file fails its trusted byte pin before projection', () => {
  for (const key of ['receiptBytes', 'snapshotBytes', 'expectedBytes']) {
    const data = inputs(); data[key] = Buffer.concat([data[key], Buffer.from('\n')]);
    assert.throws(() => projectA1Contracts(data, recordedPins, options), /custody digest/);
  }
});

test('audit must have actual matching Git commit, correct collector and no inferred scores', () => {
  for (const mutate of [a => { a.repository.commit = null; }, a => { a.repository.commit = 'b'.repeat(40); },
    a => { a.agent = 'self-approved-auditor'; }, a => { a.agent_version = 'future'; },
    a => { a.guido_scale.organizational_level = 'G5'; }, a => { a.guido_scale.migration_effort = 'low'; }]) {
    const data = inputs(), audit = JSON.parse(data.auditBytes); mutate(audit); data.auditBytes = bytes(audit);
    assert.throws(() => projectA1Contracts(data, recordedPins, options));
  }
});

test('missing/duplicate observations and unsafe paths remain invalid after projection', () => {
  for (const mutate of [a => a.checks.pop(), a => { a.checks[0] = a.checks[1]; },
    a => { a.checks[0].status = 'observed'; }, a => { a.checks[0].evidence = ['../outside']; }]) {
    const data = inputs(), audit = JSON.parse(data.auditBytes); mutate(audit); data.auditBytes = bytes(audit);
    assert.throws(() => projectA1Contracts(data, recordedPins, options));
  }
});

test('rebinding byte hashes alone cannot hide mismatched receipt run, artifact or tool identity', () => {
  for (const mutate of [r => { r.source.runId++; }, r => { r.source.commit = 'c'.repeat(40); },
    r => { r.artifact.id++; }, r => { r.spectraCommit = 'c'.repeat(40); },
    r => { r.mode = 'pull_request'; }, r => { r.snapshotSha256 = '0'.repeat(64); }]) {
    const data = inputs(), pins = clone(recordedPins), receipt = JSON.parse(data.receiptBytes);
    mutate(receipt); data.receiptBytes = bytes(receipt); rebind(data, pins);
    assert.throws(() => projectA1Contracts(data, pins, options));
  }
});

test('snapshot and expected inventory cannot be mixed across commits or substituted after rebinding', () => {
  for (const key of ['snapshotBytes', 'expectedBytes']) {
    const data = inputs(), pins = clone(recordedPins), value = JSON.parse(data[key]);
    if (key === 'snapshotBytes') value.provenance.commit = 'c'.repeat(40);
    else value.source.revision = 'c'.repeat(40);
    data[key] = bytes(value); rebind(data, pins);
    assert.throws(() => projectA1Contracts(data, pins, options));
  }
});

test('self-reported PASS and execution counts are recomputed, not blindly copied', () => {
  const data = inputs(), pins = clone(recordedPins), snapshot = JSON.parse(data.snapshotBytes), receipt = JSON.parse(data.receiptBytes);
  snapshot.tests[0].finalStatus = 'failed';
  data.snapshotBytes = bytes(snapshot); receipt.snapshotSha256 = digest(data.snapshotBytes);
  data.receiptBytes = bytes(receipt); rebind(data, pins);
  assert.throws(() => projectA1Contracts(data, pins, options), /qualification/);
});

test('recorded source workflow failure cannot become overall PASS from green test counts', () => {
  const data = inputs(), pins = clone(recordedPins), receipt = JSON.parse(data.receiptBytes);
  pins.source.conclusion = 'failure'; receipt.source.conclusion = 'failure';
  data.receiptBytes = bytes(receipt); rebind(data, pins);
  assert.throws(() => projectA1Contracts(data, pins, options), /overall verdict/);
  receipt.verdict = 'UNKNOWN'; data.receiptBytes = bytes(receipt); rebind(data, pins);
  assert.equal(projectA1Contracts(data, pins, options).contracts.evidenceBundle.qualification, 'UNKNOWN');
  const review = projectA1GapPlan(data, pins, options);
  assert.equal(review.outcome, 'INSUFFICIENT_EVIDENCE');
  assert.deepEqual(review.gapReport.gaps, []);
  assert.equal(review.planning, null);
});

test('consistent negative recorded evidence remains FAIL and never grants execution', () => {
  const data = inputs(), pins = clone(recordedPins), snapshot = JSON.parse(data.snapshotBytes), expected = JSON.parse(data.expectedBytes);
  snapshot.tests[0].finalStatus = 'failed'; snapshot.tests[0].attempts[0].status = 'failed';
  snapshot.tests[0].attempts[0].outcome = 'Failed'; snapshot.counts.passed--; snapshot.counts.failed++;
  snapshot.qualification = qualifyEvidence(snapshot.tests, expected);
  const receipt = JSON.parse(data.receiptBytes);
  receipt.verdict = 'FAIL'; receipt.testQualification = 'FAIL'; receipt.counts = snapshot.counts;
  data.snapshotBytes = bytes(snapshot); receipt.snapshotSha256 = digest(data.snapshotBytes); data.receiptBytes = bytes(receipt); rebind(data, pins);
  const projected = projectA1Contracts(data, pins, options);
  assert.equal(projected.validation.valid, true);
  assert.equal(projected.validation.evidenceState, 'FAIL');
  assert.equal(projected.validation.executionAuthorized, false);
  // This altered outcome and its rebound pins are synthetic negative controls.
  const review = projectA1GapPlan(data, pins, options);
  assert.deepEqual(review, projectA1GapPlan(data, pins, options));
  assert.equal(review.outcome, 'REVIEW_PROPOSED');
  assert.equal(review.selectedGapId, snapshot.qualification.results.find(item => item.state === 'FAIL').id);
  assert.equal(review.gapReport.gaps[0].sourceDigest, pins.hashes.snapshotSha256);
  assert.equal(review.gapReportSha256, sha256(review.gapReport));
  assert.deepEqual(review.planning.task.scope, { allowedFiles: [], allowedSpecIds: [review.selectedGapId] });
  assert.deepEqual(review.planning.plan.steps[0].specIds, [review.selectedGapId]);
  assert.equal(review.planning.plan.requiresHumanApproval, true);
  assert.equal(review.executionAuthorized, false);
  assert.deepEqual(Object.values(review.planning.effects), [0, 0, 0, 0]);
});

test('green recorded tests do not turn missing inventory files into behavioral gaps', () => {
  const review = projectA1GapPlan(inputs(), recordedPins, options);
  assert.equal(review.outcome, 'NO_MEASURED_GAPS');
  assert.ok(review.gapReport.inventoryWithoutEvidence.length > 0);
  assert.deepEqual(review.gapReport.gaps, []);
  assert.equal(review.planning, null);
  assert.equal(review.a1CycleComplete, false);
  assert.throws(() => projectA1GapPlan({ ...inputs(), snapshotBytes: bytes({ qualification: { results: [] } }) },
    recordedPins, options), /custody digest/);
});

test('malformed bytes, over-limit inputs, invalid metadata and bad timestamps fail closed', () => {
  for (const change of [{ auditBytes: Buffer.from('{bad') }, { auditBytes: Buffer.alloc(1024 * 1024 + 1) },
    { auditBytes: 'not-original-bytes' }]) assert.throws(() => projectA1Contracts({ ...inputs(), ...change }, recordedPins, options));
  assert.throws(() => projectA1Contracts(inputs(), recordedPins, { ...options, generatedAt: 'yesterday' }));
  assert.throws(() => projectA1Contracts(inputs(), recordedPins, { ...options, correlationId: '../bad' }));
  assert.throws(() => projectA1Contracts(inputs(), { ...recordedPins, auditorCommit: 'unpinned' }, options));
});

test('integration uses only pinned public data/tool checkouts, read permissions and clean auditor environment', () => {
  const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/a1-recorded-integration.yml'), 'utf8');
  const host = fs.readFileSync(path.join(__dirname, '../scripts/a1-recorded-integration.js'), 'utf8');
  const projector = fs.readFileSync(path.join(__dirname, '../lib/verification/a1-projection.js'), 'utf8');
  assert.ok(workflow.includes('ref: ' + recordedPins.source.commit));
  assert.ok(workflow.includes('ref: ' + recordedPins.auditorCommit));
  assert.ok(!/pull_request_target|workflow_run:|secrets\.|actions: read|: write/.test(workflow));
  assert.ok(workflow.includes('env -i PATH="$PATH" node'));
  assert.ok(!/dotnet test|npm install|pip install/.test(workflow));
  assert.ok(host.includes("'--ignored=matching'"));
  assert.ok(host.includes("'src/guido_auditor/cli.py'"));
  assert.ok(!/require\(['"](?:node:)?(?:fs|child_process|http|https|net)['"]\)/.test(projector));
});
