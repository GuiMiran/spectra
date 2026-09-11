# Component contracts

Status: conceptual v1 contracts. No producer is enabled by this document.

Every cross-repository artifact must be small, versioned, serializable, and
independently attributable. Contracts must not transfer credentials, raw
environment files, unrestricted prompts, or authority to execute tools.

## Common envelope

Every artifact that represents an assessment, decision, plan, or execution
uses these fields when applicable:

| Field | Purpose |
| --- | --- |
| schemaVersion | Compatibility boundary |
| producer | Component name and version |
| generatedAt | ISO-8601 generation time |
| correlationId | Links one audit cycle across components |
| provenance | Source references, hashes, evaluator and input lineage |

## Contract flow

RepositoryProfile leads to EvidenceBundle, GUIDOAssessment, SpectraAnalysis,
GapReport, CapabilityRequirements, AgentExecutionPlan, RuntimeExecution,
QualityGateResult, and GUIDOReassessment.

## Ownership and minimum intent

| Contract | Producer | Consumer | Minimum purpose |
| --- | --- | --- | --- |
| RepositoryProfile | SPECTRA scanner | SPECTRA analysis and GUIDO adapter | Deterministic inventory of technology, tests, CI, specs and source facts |
| EvidenceBundle | Test or CI adapter | SPECTRA | Executed test and quality evidence with source provenance |
| GUIDOAssessment | GUIDO Scale adapter | SPECTRA | Dimension scores, evidence, gaps and migration effort |
| SpectraAnalysis and GapReport | SPECTRA | Planner and human reviewer | Explainable repository risks and missing evidence |
| CapabilityRequirements | SPECTRA | APM and Runtime | Required expertise, scope, constraints and independent verification |
| AgentExecutionPlan | SPECTRA | Runtime | Reviewable work units, required approvals and expected evidence |
| RuntimeExecution | Runtime | SPECTRA | Actions attempted, effects, logs and resulting evidence references |
| QualityGateResult | Independent CI or evaluator | SPECTRA and GUIDO Scale | Pass or fail of declared quality conditions |
| GUIDOReassessment | GUIDO Scale adapter | Human reviewer | Before and after maturity and effort delta |

## Boundary rules

1. SPECTRA can propose an AgentExecutionPlan but cannot execute it in A1.
2. Runtime cannot reinterpret product strategy or alter a plan hash.
3. GUIDO Scale provides measurement; it does not grant authority.
4. Pipeline provides reference evidence; it does not define global policy.
5. All mutation requires a matching approved plan, isolated branch or worktree,
   and independent QualityGateResult.
