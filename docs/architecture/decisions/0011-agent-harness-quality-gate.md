# ADR-0011 — Agent harness quality gate

- Status: Proposed
- Date: 2026-10-09
- Owners: Spectra maintainers

## Context

Stage 2 assesses a completed external run record. It does not validate whether an
agent trajectory used an allowed tool with complete arguments, linked a result
to a decision, retried a failed operation coherently, or stayed inside its
read-only execution envelope.

Those gaps make a superficially successful result hard to trust. A harness
needs a deterministic, replayable gate before any future builder receives more
authority.

## Decision

Add dependency-free `assessTrajectory(record, controls)` under
`lib/verification/trajectory.js`, plus a CI-friendly
`trajectory:assess` command. The caller supplies a versioned trajectory
record and an independently held controls snapshot.

A passing record has this order:

`spec/version → evidence → tool/args → result → retry or decision → test → execution → PR intent`.

The gate rejects unknown tools, missing required arguments, unsupported
decisions, unjustified retries, missing test evidence, and out-of-order events.
Controls only allow read effects. Execution must be an explicit dry-run with
zero source writes, network calls, credential reads, and shell commands. The
final PR event is an un-opened intent requiring human approval.

Malformed input or controls is `UNRESOLVED`; a well-formed trajectory that
violates the contract is `FAIL`.

## Consequences

The gate is deliberately read-only and cannot mutate a repository, open a PR,
alter controls, execute tools, or attest that supplied records are genuine.
The evaluator therefore complements—not replaces—an isolated runner,
independent oracle, signed provenance, or approval workflow. Those integrations
require a separate ADR and end-to-end tests.
