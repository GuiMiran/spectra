# ADR-0023 — Explicit greenfield and brownfield adoption

Status: proposed for maintainer review. Date: 2026-11-07.

## Context

The CLI scaffolds domain layers but does not extract behavior from an existing
project. A consumer can have code, technical specifications and passing tests
without a formal Spectra entry point, a reviewed diagnostic or a clear boundary
between delivered capabilities and roadmap. The previous quickstart also mixed
legacy `/specs` names with the CLI's canonical `.spectra/` paths.

## Decision

Own the documented `spectra-adoption` protocol at revision 1.0.0 in
[the shared guide](../../guides/adoption-protocol.md), with separate greenfield
and brownfield entry routes. Provide opt-in record and consumer AGENTS.md
templates. Preserve existing `.spectra/` formats and CLI behavior. Protocol
revision is independent of project/package versions; this is not a release.

Require a named scope, provenance, observed/desired/unknown claims, separate
trace declarations and behavioral receipts, gaps and review. AGENTS.md routes
builders and auditors but cannot supply evaluation authority or prove its own
claims. Existing instruction files must be extended, not overwritten.

GUIDO Scale continues to own inventory and diagnostics. Its audit is presence
only; qualitative review and organizational rating remain separate. Spectra
does not introduce a duplicate score or infer G1–G5 from adoption. Preserve
NOT_EVALUATED and NOT_TESTED where appropriate.

## Consequences

New projects begin from intent and acceptance obligations. Existing projects
retain a baseline, recover domain knowledge and distinguish current behavior
from desired corrections; they need no automatic rewrite. Consumer handoffs
can be reviewed while product gaps remain open. Subsequent changes carry their
own acceptance and recovery scope rather than silently replacing evidence.

This revision adds no CLI adoption engine, JSON-schema enforcement, autonomous
reviewer, qualitative evaluator, Runtime permission, deployment or migration.
Templates require manual adaptation; document conformance is reviewed, not
inferred from a generated file. Family Ledger is an illustrative consumer;
its outstanding adoption PR requires a separate conformance review.

## Verification

Run `npm run verify`, inspect local links, parse the record JSON, and smoke
`init`, `validate` and `trace` in a temporary consumer. These checks establish
documentation/package compatibility, not completion of any consumer adoption
or a qualitative SDD assessment. Agent-routing changes are shown separately in
the PR for owner review.
