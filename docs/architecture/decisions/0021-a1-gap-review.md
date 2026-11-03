# ADR-0021 — Measured A1 gaps and bounded review proposals

- Status: Proposed; code-owner review required
- Date: 2026-11-03

Extend [ADR-0020](0020-a1-evidence-projection.md) after custody and lineage
validation. Build a GapReport from the verified qualification of mapped
expected tests. Only FAIL becomes a measured TEST gap: this establishes a
recorded test failure, not a product defect, regression or root cause.
Missing, skipped and ambiguous outcomes remain unresolved; auditor
file-presence observations and scoring policy are reported separately.
Unexpected results do not create mapped gaps. Never use an objective fallback.

For one or more gaps, select the lowest acceptance ID and reuse the
[existing Task/Context/Plan runtime](0002-evidence-and-read-only-planning.md)
with the deterministic dry-run provider. Admit only that acceptance ID and
the normalized gap summary, no repository files or raw test messages.
All gaps remain visible. The proposal requests independent human review,
not implementation. With no measured gaps, return no plan and distinguish
qualified PASS from insufficient evidence.

The existing integration publishes gap-review.json and binds it to its
receipt with file and report hashes. The pure adapter has no host authority;
the workflow continues to use historical recorded tests plus a fresh inventory
audit, not fresh unattended test acquisition. No scoring, execution authority
or A1 completion is asserted.
