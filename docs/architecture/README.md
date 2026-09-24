# Architecture

Architecture documents define durable implementation boundaries and decisions.
They complement the SPECTRA domain layers; they do not replace them.

- [ADR-0002](decisions/0002-evidence-and-read-only-planning.md) adds a recorded-evidence gate and bounded planning contract without enabling model or source-write effects.
- [ADR-0003](decisions/0003-spectra-platform-role.md) establishes SPECTRA as the evidence-backed understanding and decision platform.
- [ADR-0004](decisions/0004-guido-ecosystem-boundaries.md) preserves five GUIDO repositories with explicit responsibilities.
- [ADR-0005](decisions/0005-runtime-execution-boundary.md) constrains runtime execution to approved, bounded plans.
- [ADR-0006](decisions/0006-guido-repository-audit-input.md) records a read-only GUIDO inventory input for the Mother loop.

- [Controlled Evolution](controlled-evolution.md) describes the current controlled-evolution MVP, its data flow, lifecycle, and safety model.
- [ADR-0001](decisions/0001-controlled-evolution-superagents.md) records why the MVP is declarative, local, and externally inert.

New decisions that materially constrain runtime behaviour, persistence, security,
or public compatibility belong in `decisions/` using the next zero-padded ADR
number.
