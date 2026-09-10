# Architecture

Architecture documents define durable implementation boundaries and decisions.
They complement the SPECTRA domain layers; they do not replace them.

- [Controlled Evolution](controlled-evolution.md) describes the current controlled-evolution MVP, its data flow, lifecycle, and safety model.
- [ADR-0001](decisions/0001-controlled-evolution-superagents.md) records why the MVP is declarative, local, and externally inert.

New decisions that materially constrain runtime behaviour, persistence, security,
or public compatibility belong in `decisions/` using the next zero-padded ADR
number.
