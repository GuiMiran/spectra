# ADR-0019 — Bounded A1 contracts and reconciled delivery ledger

- Status: Proposed; code-owner review required
- Date: 2026-11-03

## Context

The ecosystem backlog still calls native TRX mapping and authenticated handoff
unstarted, although Pipeline PRs #14–#17 and the first main workflow_run receipt
verify those bounded capabilities. Conversely, those receipts do not establish
a complete GUIDO audit-to-analysis-to-reviewed-plan cycle or an organizational
score. Scale currently emits only a file-presence audit with null level/effort.

## Decision

Publish version 1 schemas for a bounded RepositoryProfile inventory projection,
scoped EvidenceBundle and explicitly unscored GUIDOAssessment. Adopt the existing
common envelope concepts (producer/version, time, correlation, repository/commit,
provenance), and bind assessment inputs using existing stable JSON SHA-256.

Add a dependency-free checker limited to these fixed vendored schemas and
cross-document lineage/count semantics. It never resolves external references,
authenticates supplied hashes, produces recommendations, calls tools, writes
source or enables execution. Schema validity is not behavioral PASS; negative
recorded evidence can be valid data. Every report says A1 incomplete and no
execution authority. The synthetic fixture is explicitly labeled as a fixture.

Keep GUIDO level, effort and rubric null, with NOT_ASSESSED and human approval
required. This contract proposal does not ratify the ecosystem's global scoring
or governance decisions. Further scoring policy needs separate owner approval.

Keep existing Gap Engine and agent-runtime task/context/plan ownership intact;
the next adapter must reuse those contracts rather than invent an alternate
execution plan or treat file absence as behavioral failure. Update the backlog
to separate shipped evidence components from unfinished A1/A2/A3 integration.

## Consequences

There is a concrete, testable data boundary before adding more autonomy.
Eight observed files and 28 passing scoped tests cannot become G5. Mixed
commits, broken hashes, omitted observations, contradictory counts, hidden
unknown evidence and attempted authority/scoring are rejected.

No workflow/token permission, SPECTRA consumer pin, target repository, Runtime,
provider, agent permission or plan execution is changed. Contract schemas and
validator are security-sensitive and require code-owner review; CODEOWNERS
alone is not proof of an enforced repository protection rule.
