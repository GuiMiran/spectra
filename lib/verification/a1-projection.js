'use strict';

// Pure projection of byte-pinned recorded evidence plus a host-produced audit.
// Pins are a TRUSTED HOST input, not authority acquired from the artifact itself.
const crypto = require('node:crypto');
const { sha256, stableStringify, deepFreeze } = require('../agent-runtime/contracts');
const { qualifyEvidence } = require('../evidence/qualification');
const { assessA1Contracts } = require('./a1-contracts');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const invariant = (condition, message) => { if (!condition) throw new Error(message); };
const same = (a, b) => stableStringify(a) === stableStringify(b);
const git = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const positive = value => Number.isSafeInteger(value) && value > 0;

function parse(bytes, label) {
  invariant(Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= 1024 * 1024, `${label} must be bounded original bytes.`);
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new Error(`Invalid ${label} JSON/UTF-8.`); }
}

function projectA1Contracts({ auditBytes, receiptBytes, snapshotBytes, expectedBytes }, pins, { generatedAt, correlationId } = {}) {
  invariant(pins?.schemaVersion === 1 && pins.kind === 'RecordedA1InputPins', 'Trusted host custody pins required.');
  const source = pins.source;
  invariant(source && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository) && git(source.commit) &&
    positive(source.repositoryId) && positive(source.workflowId) && positive(source.runId) && positive(source.attempt) &&
    ['success', 'failure'].includes(source.conclusion), 'Invalid pinned source identity.');
  invariant(git(pins.auditorCommit) && git(pins.spectraCommit) && positive(pins.handoffRunId) &&
    ['workflow_run', 'pull_request'].includes(pins.mode), 'Invalid pinned collector/tool identity.');
  invariant(positive(pins.artifact?.id) && /^sha256:[a-f0-9]{64}$/.test(pins.artifact.digest) &&
    pins.artifact.name === `pipeline-trx-${source.runId}-${source.attempt}` && positive(pins.artifact.size), 'Invalid pinned artifact identity.');
  const inputs = { receiptSha256: receiptBytes, snapshotSha256: snapshotBytes, expectedInventorySha256: expectedBytes };
  for (const [key, bytes] of Object.entries(inputs)) {
    invariant(hash(pins.hashes?.[key]) && Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= 1024 * 1024 &&
      digest(bytes) === pins.hashes[key], `${key} custody digest mismatch.`);
  }
  const audit = parse(auditBytes, 'audit'), receipt = parse(receiptBytes, 'receipt');
  const snapshot = parse(snapshotBytes, 'snapshot'), expected = parse(expectedBytes, 'expected inventory');
  invariant(audit.schema_version === '1.0' && audit.agent === 'sdd-auditor' && audit.agent_version === '0.1.0' &&
    audit.repository?.commit === source.commit && Array.isArray(audit.checks) && audit.checks.length === 8,
  'Audit must come from the pinned auditor and same full repository commit.');
  invariant(audit.guido_scale?.organizational_level === null && audit.guido_scale?.migration_effort === null,
    'An inventory audit must not assign GUIDO scores.');
  invariant(receipt.schemaVersion === 1 && receipt.acquisition === 'authenticated-github-actions-api' &&
    same(receipt.source, source) && same(receipt.artifact, pins.artifact) && receipt.mode === pins.mode &&
    receipt.spectraCommit === pins.spectraCommit, 'Receipt differs from trusted host source/artifact pins.');
  invariant(snapshot.schemaVersion === 1 && snapshot.source === 'trx-results' &&
    snapshot.provenance?.commit === source.commit && snapshot.runId === `pipeline-${source.runId}-${source.attempt}`,
  'Snapshot belongs to a different source/commit.');
  invariant(expected.source?.revision === source.commit && expected.source.system === 'guido-agentic-pipeline/declared-acceptance-map',
    'Expected inventory belongs to a different commit/system.');
  const inventoryDigest = digest(JSON.stringify(expected));
  invariant(snapshot.provenance.inventorySha256 === inventoryDigest, 'Snapshot expected-inventory digest mismatch.');
  const qualification = qualifyEvidence(snapshot.tests, expected);
  invariant(same(qualification, snapshot.qualification), 'Snapshot qualification is not reproducible from original tests/inventory.');
  invariant(receipt.snapshotSha256 === digest(snapshotBytes) && receipt.testQualification === qualification.verdict &&
    same(receipt.counts, snapshot.counts) && Array.isArray(receipt.unassessedCriteria), 'Receipt/snapshot qualification mismatch.');
  const tests = snapshot.tests;
  invariant(tests.every(test => Array.isArray(test.specIds) && Array.isArray(test.attempts)), 'Malformed snapshot test mapping/attempts.');
  const actual = { tests: tests.length, attempts: tests.reduce((count, test) => count + test.attempts.length, 0),
    ...Object.fromEntries(['passed', 'failed', 'broken', 'skipped', 'unknown'].map(status => [status, tests.filter(test => test.finalStatus === status).length])),
    unmapped: tests.filter(test => !test.specIds.length).length, flaky: tests.filter(test => test.flaky).length };
  invariant(same(actual, snapshot.counts), 'Snapshot execution counts differ from its tests.');
  for (const item of expected.tests) {
    const observed = tests.find(test => test.key === item.key);
    if (observed) invariant(observed.specIds.includes(item.id), 'Expected acceptance ID is not mapped by its observed test.');
  }
  const overall = qualification.verdict === 'FAIL' ? 'FAIL' : qualification.verdict === 'PASS' &&
    source.conclusion === 'success' && receipt.unassessedCriteria.length === 0 ? 'PASS' : 'UNKNOWN';
  invariant(receipt.verdict === overall, 'Receipt overall verdict is inconsistent.');
  const base = { schemaVersion: 1, producer: { component: 'spectra/a1-projection', version: '1.0.0' },
    generatedAt, correlationId, repository: { fullName: source.repository, commit: source.commit } };
  const repositoryProfile = { ...base, kind: 'RepositoryProfile', scope: 'file-presence-only', provenance: { auditSha256: digest(auditBytes) },
    observations: audit.checks.map(check => ({ id: check.id, status: check.status, evidenceCount: check.evidence_count, paths: check.evidence })) };
  const evidenceBundle = { ...base, kind: 'EvidenceBundle', scope: 'local-expected-tests-only', provenance: {
    receiptSha256: digest(receiptBytes), snapshotSha256: digest(snapshotBytes), expectedInventorySha256: digest(expectedBytes),
    sourceArtifactSha256: pins.artifact.digest.slice(7), spectraCommit: pins.spectraCommit,
    sourceRunId: source.runId, sourceAttempt: source.attempt, handoffRunId: pins.handoffRunId, mode: pins.mode },
    qualification: overall, counts: { expected: expected.tests.length, observed: actual.tests, passed: actual.passed,
      failed: actual.failed, broken: actual.broken, skipped: actual.skipped, unknown: actual.unknown, unmapped: actual.unmapped } };
  const guidoAssessment = { ...base, kind: 'GUIDOAssessment', state: 'NOT_ASSESSED', organizationalLevel: null,
    migrationEffort: null, rubric: null, reason: 'SCORING_POLICY_NOT_APPROVED', provenance: {
      repositoryProfileSha256: sha256(repositoryProfile), evidenceBundleSha256: sha256(evidenceBundle) },
    requiresHumanApproval: true, executionAuthorized: false };
  const contracts = { schemaVersion: 1, repositoryProfile, evidenceBundle, guidoAssessment };
  const validation = assessA1Contracts(contracts);
  invariant(validation.valid, `Projected A1 contracts failed validation: ${validation.errors.join('; ')}`);
  return deepFreeze({ contracts, validation, provenance: { verification: 'host-pinned-bytes-and-lineage',
    authentication: 'provided-by-trusted-host-not-self-attested', auditorCommit: pins.auditorCommit,
    sourceCommit: source.commit, auditSha256: digest(auditBytes), contractsSha256: sha256(contracts) } });
}

module.exports = { projectA1Contracts };
