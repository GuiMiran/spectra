# ADR-0010 — Stage 2 trust assessment contract

- Status: Proposed
- Date: 2026-10-09
- Owners: Spectra maintainers

## Context

A functional pass can coexist with repository-policy violations, unsupported
grader credit, incomplete work claims, intermittent outcomes, or a broken
integration of individually successful changes. Stage 2 needs to record these
dimensions independently and evaluate the actual merge.

## Decision

Add a dependency-free, read-only `assessStage2(record)` contract under
`lib/verification/stage2.js`. It accepts a versioned record assembled by an
external harness and returns `PASS`, `FAIL`, or `UNRESOLVED` with reason codes.

The input declares:

- candidate and integrated commit IDs, plus a separate attestation that the
  candidate is in the verified merge;
- applicable repository policies for both intermediate trajectory and final
  result, with an evaluator distinct from the builder;
- functional result, grader support, computation traceability, and truthful
  completion as independent checks;
- a coordination plan with disjoint write paths and declared produced/consumed
  contracts;
- distinct repeated run IDs on the integrated commit (three for critical
  work, one otherwise).

Missing evidence stays `UNRESOLVED`; an observed failure takes precedence.
The contract does not generate a grader, execute commands, inspect a real
worktree, prove an evaluator independent, or validate a signed provenance
chain. A producer must supply genuine external evidence and verify the merge
relationship before treating its verdict as a delivery gate. Agent-generated
tests remain candidates until checked against a separately held oracle.

## Consequences

Stage 2 now has an executable shape for policy, trust, repeatability, and
integration results without modifying the existing `.spectra/evidence.json`
format or granting any agent external effects. Connecting a CI collector and
independent oracle will require a separate design and integration tests.
