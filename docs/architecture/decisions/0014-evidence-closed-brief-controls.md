# ADR-0014 — Evidence-closed qualification and comparable evaluation

- Status: Proposed
- Date: 2026-11-01
- Owners: Spectra maintainers

## Decision

Keep expected obligations separate from received results. Extend Allure v1
snapshots additively with qualification and continuity records. Only an
externally supplied, versioned inventory can qualify a run; absence, skipped
execution and unknown evidence are not passes. Preserve existing import-only
behaviour and make qualification a distinct reported verdict and CI exit gate.

Expose executable-prefix metrics from the read-only trajectory assessor. Add a
separate comparison-record contract for equal-budget best-of-n controls and
held-out fault discrimination. Require pinned deployment identity for automatic
Mother promotion without altering historical audit formats. Assign ownership
to security-sensitive instructions and require reporting specification/code
conflicts rather than silently editing verified behaviour.

## Boundaries

No new model, network or source-mutation adapter is enabled. Record validation
cannot authenticate the collector or prove independence. Live ADO inventories,
private held-out suites, model trials, statistical confidence, and enforced
repository review rules remain host/maintainer responsibilities. Public test
fixtures and coupled-case definitions must not be presented as experiment
results or as secret holdouts.
