# ADR-0015 — Budget-matched best-of-n experiment runner

- Status: Proposed
- Date: 2026-11-01
- Owners: Spectra maintainers

## Context

ADR-0014 validates comparison records but does not generate candidates or
freeze a best-of-n selection before held-out feedback. A host needs a bounded
execution protocol that accounts for the complete experiment rather than
comparing a single baseline attempt with a more expensive candidate method.

## Decision

Add `lib/evaluation/` outside the self-mutable evolution loop. A trusted host
supplies four callbacks: baseline generator, candidate method, visible selector,
and held-out evaluator. There is no bundled live provider and no changes to the
Mother promotion path. The runner:

1. receives one frozen public task, executor, suite/oracle hashes and two
   independent metrics;
2. accounts for generation, selection and evaluation under identical whole-arm
   token/tool-call ceilings, with explicit per-callback reservations;
3. selects the maximum visible-scoring baseline among n attempts, retaining the
   first attempt on ties;
4. freezes both selected artifact hashes before either held-out evaluation;
5. verifies callback telemetry and declared executor/evaluator identity;
6. derives the comparison record and passes it to `assessComparison`;
7. emits a hash-chained report without raw artifacts or adapter errors.

Budget exhaustion before a call is `BUDGET_STOP`. Missing/mismatched telemetry,
timeouts and invalid replies are `INFRA_ERROR`. Neither receives an invented
score or a comparison pass. A completed experiment can still fail the separate
improvement or fault-discrimination assessment.

## Boundaries

Callbacks are trusted host code, not a sandbox. The runner can check reported
usage but cannot prevent a dishonest callback from spending more, accessing
private data, ignoring AbortSignal or continuing external work after timeout.
The external host must enforce resource ceilings and oracle isolation. Hashes
detect modifications only when their expected value is trusted; they do not
authenticate a producer. The bundled demo is deterministic and calls no model.
Real model trials, independent custody, repeated samples and deployment
integration remain separate reviewed work.
