# Responsibility map and overlap register

## Ownership

| Repository | Current responsibility | Target responsibility | Classification | Recommended action |
| --- | --- | --- | --- | --- |
| guido-sdd-engineering-stack | Engineering doctrine, examples, quality taxonomy | Define standards and reference architecture | KEEP | Preserve as documentation-first |
| guido-sdd-migration-effort-scale | Maturity and migration templates | Measure maturity from evidence | KEEP / REFACTOR | Reconcile score model before automation |
| spectra | Domain specs, traceability, evidence and proposal-only planning | Repository understanding and governed decisions | KEEP / REFACTOR | Extend through versioned contracts |
| guido-autonomous-runtime | Test demo plus agent-profile documents | Execute approved plans with isolated tools | REFACTOR | Build execution boundary only after A1 |
| guido-agentic-pipeline | SauceDemo quality-engineering implementation | Prove and benchmark the ecosystem | REFERENCE | Use as first target repository |

## Overlap register

| Area | Existing overlap | Owner after ratification | Resolution |
| --- | --- | --- | --- |
| Agent descriptions | SPECTRA declarative specialists, Pipeline prompts, Runtime agent profiles | SPECTRA owns capability requirements; Runtime binds approved tools | Define a common manifest contract, no migration yet |
| Traceability | SPECTRA trace, Runtime trace table, Pipeline documentation | SPECTRA owns evidence contract | Treat other matrices as producer inputs |
| GUIDO scoring | Scale templates, Pipeline review prompt score, Runtime quality-plan claims | GUIDO Scale | Eliminate incompatible local scoring after Scale contract is approved |
| Self-healing | Pipeline issue workflow and Runtime documentation | Runtime under SPECTRA plan | Reclassify existing flows as detection or escalation until execution exists |
| CI and Allure | Pipeline and Runtime each publish reports | Target repository owns raw test output; SPECTRA consumes normalized evidence | Define EvidenceBundle v1 |

## Discovery findings

- The Stack defines GUIDO as Governed, Unified, Intent-Driven,
  Definition-first, Outcomes.
- The Scale repository retains a conflicting historical expansion of the
  acronym and also contains two incompatible score approaches: a manual
  five-pillar total and a six-dimension bottleneck model.
- SPECTRA main already provides recorded-evidence validation and a safe
  dry-run planner. It must be reused rather than recreated.
- The Pipeline auto-heal workflow creates an issue and task description; it
  does not run a healing model or apply a source change.
- Runtime agent profiles are Markdown instructions, not an executable
  scheduler, permission system, or sandbox.
- The Runtime MCP configuration is not strict JSON and must not be used as a
  live tool configuration.

## Checkout governance

A logical multi-root workspace is recommended. It must contain one canonical
checkout per repository. A duplicate dirty checkout is a preservation concern,
not a second component or a candidate for automatic deletion.
