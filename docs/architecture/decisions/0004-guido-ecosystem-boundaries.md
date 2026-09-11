# ADR-0004: Preserve five GUIDO repositories with explicit responsibility boundaries

- Status: Proposed
- Date: 2026-09-11
- Owners: GUIDO ecosystem maintainers

## Context

The ecosystem has five logical layers. Documentation in more than one
repository describes adjacent responsibilities, and GUIDO has historical
expansions that are not fully aligned. The risk is duplication or a large,
unsafe consolidation before the operating model is agreed.

## Decision

Keep the five repositories separate and assign their target responsibilities:

| Repository | Target responsibility |
| --- | --- |
| GUIDO SDD Engineering Stack | DEFINE: doctrine, reference practices, templates, examples |
| GUIDO SDD Migration Effort Scale | MEASURE: official maturity rubric, scorecard, assessment interpretation |
| SPECTRA | UNDERSTAND + DECIDE: evidence, repository profile, gaps, capabilities, plans |
| GUIDO Autonomous Runtime | EXECUTE: bounded execution of approved plans and operational evidence |
| GUIDO Agentic Pipeline | PROVE: reproducible benchmark, regression tests, and published evidence |

The Stack expansion, `Governed · Unified · Intent-Driven · Definition-first ·
Outcomes`, is the candidate canonical meaning. Scale's historical expansion
must be reconciled editorially by its maintainers; no automated rename is
authorized.

## Consequences

- Repositories are not merged, deleted, or physically moved by this ADR.
- A multi-root workspace may improve local navigation without changing Git
  ownership.
- Pipeline-local quality scores cannot be presented as the official GUIDO
  Scale score until Scale defines the contract.
- Cross-repository interfaces are versioned documents first, then schemas and
  tests; they are not implicit imports or copy-pasted logic.

## Alternatives considered

A monorepo would simplify navigation but would blur ownership and introduce
unnecessary migration risk. Letting each repository define its own agents and
scores would repeat the present ambiguity.
