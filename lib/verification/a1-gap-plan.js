'use strict';

const { validateGap } = require('../evolution/contracts');
const { sha256, deepFreeze, ZERO_EFFECTS } = require('../agent-runtime/contracts');
const { ReadOnlyPlanningRuntime } = require('../agent-runtime/runtime');
const { DryRunPlannerProvider } = require('../agent-runtime/providers');
const { projectA1Contracts } = require('./a1-projection');

// This entry point accepts the original custody-pinned inputs, never an
// independently supplied GapReport or an aggregate-only EvidenceBundle.
function projectA1GapPlan(inputs, pins, options) {
  const projection = projectA1Contracts(inputs, pins, options);
  const { evidenceBundle: bundle, repositoryProfile: profile, guidoAssessment } = projection.contracts;
  const snapshot = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(inputs.snapshotBytes));
  const results = snapshot.qualification.results;
  if (results.some(item => !/^AC-\d{3}$/.test(item.id))) throw new Error('Expected canonical acceptance IDs.');
  const gaps = results.filter(item => item.state === 'FAIL').map(item => validateGap({
    id: item.id, type: 'TEST', severity: 'MAJOR', status: 'FAILED',
    description: 'The mapped expected test has a recorded failed or broken outcome; root cause is unverified.',
    sources: ['trx-results'], sourceDigest: bundle.provenance.snapshotSha256, runId: snapshot.runId,
  })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const gapReport = deepFreeze({
    schemaVersion: 1, kind: 'GapReport', generatedAt: bundle.generatedAt, correlationId: bundle.correlationId,
    repository: bundle.repository, scope: bundle.scope, evidenceState: bundle.qualification,
    contractsSha256: projection.provenance.contractsSha256, gaps,
    unresolvedEvidence: results.filter(item => !['PASS', 'FAIL'].includes(item.state))
      .map(({ id, state }) => ({ id, state })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    inventoryWithoutEvidence: profile.observations.filter(item => item.status === 'no_evidence').map(item => item.id).sort(),
    scoringPolicy: guidoAssessment.reason,
  });
  // One proposal per run: stable selection, with all other gaps still visible.
  const selected = gaps[0];
  const gapReportSha256 = sha256(gapReport);
  const planning = selected ? new ReadOnlyPlanningRuntime({
    provider: new DryRunPlannerProvider(), clock: () => bundle.generatedAt,
  }).plan({
    schemaVersion: 1, id: `a1-gap-${gapReportSha256.slice(0, 24)}`,
    objective: `Review recorded failure for ${selected.id} and determine whether it is reproducible.`,
    successCriteria: [{ id: selected.id, description: 'Independently verify the mapped test outcome and document its cause before proposing a change.' }],
    constraints: ['Read-only proposal; no repository files admitted.', 'Human approval required before any action.'],
    scope: { allowedFiles: [], allowedSpecIds: [selected.id] },
  }, { files: [], specifications: [{ id: selected.id, content: JSON.stringify(selected) }] }) : null;
  return deepFreeze({ projection, gapReport, gapReportSha256, planning, selectedGapId: selected?.id ?? null,
    outcome: planning ? 'REVIEW_PROPOSED' : bundle.qualification === 'PASS' ? 'NO_MEASURED_GAPS' : 'INSUFFICIENT_EVIDENCE',
    requiresHumanApproval: true, executionAuthorized: false, a1CycleComplete: false, effects: ZERO_EFFECTS });
}

module.exports = { projectA1GapPlan };
