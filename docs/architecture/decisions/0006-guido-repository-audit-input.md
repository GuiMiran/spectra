# ADR-0006: GUIDO audit as contextual evidence for the Mother loop

- Status: Accepted for read-only bridge
- Date: 2026-09-24

## Context

GUIDO Scale's `sdd-auditor` inventories files in a repository. SPECTRA's
MotherEvolutionLoop evaluates measured specification and test gaps. A file's
presence or absence cannot prove the quality of a practice, test result or
organizational maturity. The two components need a reproducible handoff
without turning inventory findings into false assurance.

## Decision

The Mother optionally reads a versioned `sdd-auditor` JSON report from the
fixed project path `.spectra/guido-audit.json`. It validates the basic schema,
normalizes only check IDs, statuses and evidence counts, and records a digest
and optional repository commit in its run/audit record. It does not call the
auditor, accept arbitrary input paths, infer gaps from missing files, alter
evaluation weights, or promote agents on the strength of this report.

The source file must be a regular file within the project and under 1 MiB.
Invalid evidence fails the run before a new evolution event is persisted.
Missing evidence is allowed. The repository commit is provenance provided by
the auditor, not proof that the report matches the current working tree.

## Consequences

- SPECTRA and GUIDO Scale retain separate ownership and assessment meaning.
- Read-only cross-repository evidence is visible to reviewers in a Mother run.
- A later, separately reviewed adapter may turn independently verified
  findings into work proposals; this decision does not enable execution,
  external effects or organizational scoring.
