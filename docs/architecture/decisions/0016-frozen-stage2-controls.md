# ADR-0016 — Executable frozen Stage 2 public controls

- Status: Proposed
- Date: 2026-11-01
- Owners: Spectra maintainers

## Context

The Stage 2 coupled-case catalogue names interacting requirements, but its case
descriptions are not executable evidence. Before testing model-generated
solutions, the evaluator must accept correct alternatives and reject known
defects without modifying the state it scores.

## Decision

Add a bounded public control suite under `evals/stage2/`: four in-memory
reference scenarios, two correct variants and two injected faults per case,
and an oracle in a separate module. The oracle receives inputs and observable
outputs, never the variant's expected classification. Three fresh-state repeats
produce a fault matrix, false-accept/false-reject counts, state hashes and
repeatability diagnostics. No arbitrary modules, shell or candidate code are
accepted by the runner.

Pin the protocol, implementations, oracle and runner bytes in `freeze.json`.
Verify the exact file inventory and SHA-256 hashes before loading case modules.
CI retains the result report, including unresolved execution errors, as an
artifact. There is no automatic freeze-refresh command.

## Boundaries

These public controls test evaluator discrimination, not agent performance,
model quality or benchmark secrecy. The correct and defective variants are
trusted fixture code, not code running in an OS sandbox. Separate modules and
hashes do not establish independent custody. A maintainer can alter both the
suite and manifest; any such revision requires a reviewed new suite version.
Private held-out tasks, provider integration, candidate-code isolation and
statistical comparisons remain separate work.
