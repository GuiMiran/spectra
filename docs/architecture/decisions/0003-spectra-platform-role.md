# ADR-0003: Establish SPECTRA as the understanding and decision platform

- Status: Proposed
- Date: 2026-09-11
- Owners: GUIDO ecosystem maintainers

## Context

The GUIDO ecosystem has five repositories with overlapping language around
agents, quality, evidence, planning, and automation. SPECTRA already provides
the strongest executable base for structured specifications, validation,
traceability, recorded evidence, and read-only agent planning. The other
repositories need a stable boundary before new agent or runtime work begins.

## Decision

SPECTRA owns the platform responsibilities that turn repository facts into a
bounded decision artifact:

- normalize declared and observed evidence;
- understand a repository through a future deterministic scanner;
- compare its state with the approved GUIDO expectations;
- produce gaps, capability requirements, and an immutable execution plan;
- preserve provenance, evidence coverage, and policy checks for each plan.

The current `spectra verify` and `spectra agent plan` commands are the A1
foundation for that boundary. `dry-run` remains a deterministic planner, not
an AI invocation.

SPECTRA does not own engineering doctrine, official maturity scoring, source
mutation, deployment, merge authority, or autonomous task execution.

## Consequences

- A future repository scanner, gap engine, capability registry, and APM belong
  in SPECTRA only when their contracts are approved and testable.
- GUIDO Scale remains the owner of the maturity rubric and becomes an adapter
  input to SPECTRA rather than a duplicated scoring algorithm.
- Autonomous Runtime receives an immutable `AgentExecutionPlan`; it does not
  reinterpret strategy.
- Agentic Pipeline is the first controlled benchmark and proof target.
- No Meta-Agent, external model call, credential handling, or source-write
  capability is enabled by this decision.

## Alternatives considered

Putting planning in Autonomous Runtime would couple strategy to mutation.
Putting it in Agentic Pipeline would make a benchmark repository the platform.
Keeping a separate unconnected planning system would recreate SPECTRA's
existing evidence and planning mechanisms.
