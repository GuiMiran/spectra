# GUIDO ecosystem architecture

Status: responsibility baseline with separately reviewed implementation changes.
Start at the [governance hub](README.md) for version pins and boundaries.

GUIDO and SPECTRA are complementary models. The five GUIDO engineering layers
express what good engineering looks like. The thirteen SPECTRA layers express
domain knowledge and traceability. Neither replaces the other.

## Target responsibilities

GUIDO SDD Engineering Stack defines engineering standards.

GUIDO Scale measures readiness and migration effort.

SPECTRA understands repository evidence and decides a governed plan.

GUIDO Autonomous Runtime executes an approved plan under explicit policy.

GUIDO Agentic Pipeline proves the approach with a real benchmark repository.

Evidence and reassessment return to SPECTRA and GUIDO Scale.

The governing rule is:

GUIDO Stack = DEFINE

GUIDO Scale = MEASURE

SPECTRA = UNDERSTAND + DECIDE

Autonomous Runtime = EXECUTE

Agentic Pipeline = PROVE

## Current implementation baseline

| Component | What is implemented now | Architectural interpretation |
| --- | --- | --- |
| Stack | Documentation, five-layer model, test taxonomy, reference examples | The engineering standard |
| Scale | Read-only Python inventory, proposed six-dimension diagnostics, scorecards | Inventory is executable; substantive assessment and organizational scoring remain separate |
| SPECTRA | Specification CLI, trace, recorded evidence verification, read-only planning, controlled declarative evolution | The evidence and decision nucleus |
| Runtime | Planning-only Node control plane, bounded evaluation adapter and historical .NET demo | Experimental capabilities, not unrestricted execution |
| Pipeline | .NET 8, direct xUnit and Selenium, native TRX evidence handoff | Reference checks; no mandatory SpecFlow/Reqnroll or Allure |

## Non-goals

- Do not merge these repositories.
- Do not create a separate APM or orchestrator repository.
- Do not turn SPECTRA into a source-writing runtime.
- Do not turn the Pipeline into the global orchestrator.
- Do not claim autonomous execution from static prompts or trace tags.

The proposals are constrained by ADR-0003 through ADR-0005.
