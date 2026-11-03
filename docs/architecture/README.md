# Architecture

Architecture documents define durable implementation boundaries and decisions.
See [ADR-0020](decisions/0020-a1-evidence-projection.md) for pinned evidence projection and its separate read-only host integration.
See [ADR-0021](decisions/0021-a1-gap-review.md) for measured gaps and bounded review proposals.
See [ADR-0019](decisions/0019-a1-read-only-contracts.md) for bounded A1 contracts and the reconciled delivery ledger.
See [ADR-0017](decisions/0017-external-suite-runtime-isolation.md) for the external-suite API and separate Runtime isolation boundary.
See [ADR-0016](decisions/0016-frozen-stage2-controls.md) for executable frozen Stage 2 public controls.
See [ADR-0015](decisions/0015-budget-matched-runner.md) for the bounded best-of-n experiment runner.
See [ADR-0014](decisions/0014-evidence-closed-brief-controls.md) for evidence-closed qualification and comparable evaluation.
They complement the SPECTRA domain layers; they do not replace them.

- [ADR-0002](decisions/0002-evidence-and-read-only-planning.md) adds a recorded-evidence gate and bounded planning contract without enabling model or source-write effects.
- [ADR-0003](decisions/0003-spectra-platform-role.md) establishes SPECTRA as the evidence-backed understanding and decision platform.
- [ADR-0004](decisions/0004-guido-ecosystem-boundaries.md) preserves five GUIDO repositories with explicit responsibilities.
- [ADR-0005](decisions/0005-runtime-execution-boundary.md) constrains runtime execution to approved, bounded plans.
- [ADR-0006](decisions/0006-guido-repository-audit-input.md) records a read-only GUIDO inventory input for the Mother loop.

- [Controlled Evolution](controlled-evolution.md) describes the current controlled-evolution MVP, its data flow, lifecycle, and safety model.
- [Mother prompt evolution](prompt-evolution.md) describes the evaluated prompt registry and trusted-host boundary.
- [ADR-0009](decisions/0009-controlled-mother-prompt-evolution.md) records prompt promotion rules.
- [ADR-0010](decisions/0010-stage2-trust-assessment.md) defines the read-only Stage 2 trust assessment contract.
- [ADR-0012](decisions/0012-allure-ingestion.md) defines versioned Allure evidence and gap ingestion.
- [ADR-0018](decisions/0018-native-trx-ingestion.md) adds native TRX with independent inventory and no mandatory reporting framework.
- [ADR-0013](decisions/0013-evaluator-and-signal-assurance.md) adds read-only evaluator and signal-path contracts.
- [ADR-0001](decisions/0001-controlled-evolution-superagents.md) records why the MVP is declarative, local, and externally inert.

New decisions that materially constrain runtime behaviour, persistence, security,
or public compatibility belong in `decisions/` using the next zero-padded ADR
number.
