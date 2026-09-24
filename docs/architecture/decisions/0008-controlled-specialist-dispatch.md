# ADR-0008 — Controlled specialist dispatch and independent evaluation

## Status

Accepted.

## Context

The MotherEvolutionLoop already creates, evaluates, and promotes bounded
declarative specialist definitions. The initial specialist route plan records
only intended assignments; it must not imply that a specialist executed.

The next step needs an execution record without widening authority to models,
MCP, shell, source writes, credentials, pull requests, or re-execution.

## Decision

Add a controlled dispatch phase:

1. the Mother selects only active specialist definitions for current measured gaps;
2. `ControlledSpecialistDispatcher` runs them exclusively through
   `StructuredSandbox`;
3. `IndependentDispatchEvaluator`, separate from dispatch, verifies full
   gap coverage, unique assignments, route zero-effect contracts, and zero
   observed source writes, network calls, and credential reads;
4. a failing evaluation rejects the run before its final artifact is written;
5. the dispatch digest and verdict enter the append-only audit chain and run
   artifact.

This is **not** a model invocation or external tool dispatch. Outputs remain
structured findings and execution plans.

## Consequences

SPECTRA can now distinguish a planned specialist route from a bounded,
evaluated specialist execution. Promotions remain policy-driven and the
control envelope stays immutable to the evolved agent definitions.

External MCP, PR, rerun, shell, credential, and source-write adapters remain
disabled; they require a separate approval boundary and independent evaluator.
