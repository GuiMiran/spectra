# Controlled Evolution MVP

Spectra's controlled evolution subsystem designs, evaluates, versions, and
promotes declarative specialist agents from measured specification and test
gaps. It extends `spectra trace`; it does not replace the existing Spectra
layers or traceability workflow.

## Quick start

From a project that already contains `.spectra/`:

```bash
spectra evolve --init-config
spectra trace
spectra evolve --objective "Close critical evidence gaps" --iterations 3
spectra evolution-status
```

`--iterations` is capped by `limits.maxIterations`. The default is one. Add
`--json` to either evolution command for machine-readable output. The loop stops
early when every required active agent reaches `evaluation.targetScore`.

## Runtime flow

```text
Objective
  -> optional Allure summary
  -> coverage-map normalization
  -> Spectra Gap Engine
  -> Mother / Meta-Intelligence
  -> System Architect
  -> Agent Factory
  -> Orchestrator
  -> structured local sandbox
  -> Evaluator(candidate, active baseline)
  -> Root-Cause Analysis on rejection
  -> Evolution Engine
  -> Agent Registry and next iteration
```

The Meta-Intelligence groups gaps by required capability. The Architect creates
only the roles required for the current input, for example invariant assurance,
test-failure analysis, evidence completion, reverse-trace analysis, or
implementation planning.

## Inputs

The coverage adapter reads three sources. All are local and optional.

### SPECTRA-TRACE

`.spectra/12-trace.md` remains the source of spec-to-code and reverse-trace
gaps. Generate it with `spectra trace`.

### Coverage map

An external aggregator may write `.spectra/coverage-map.json`:

```json
{
  "schemaVersion": 1,
  "gaps": [
    {
      "id": "INV-001",
      "type": "INV",
      "severity": "CRITICAL",
      "status": "PENDING",
      "description": "Tenant isolation lacks independent evidence"
    }
  ]
}
```

### Allure summary

An Allure adapter may write `.spectra/allure-summary.json`:

```json
{
  "tests": [
    { "name": "AC-042 checkout", "specId": "AC-042", "status": "failed" }
  ]
}
```

Failed and broken tests become normalized gaps. Passing tests do not create
gaps. If no source contains a gap, Spectra creates an explicit unassessed
objective gap instead of claiming success without evidence.

## Agent lifecycle

Each agent version has one lifecycle state:

- `candidate`: proposed by the Agent Factory;
- `active`: promoted after beating the active baseline;
- `rejected`: retained with evaluation evidence and root cause;
- `retired`: superseded by a promoted version or no longer required.

For a new capability, the baseline is an explicit zero-scoring null baseline.
For an existing capability, the active version is executed with the same gaps,
pipeline state, evaluator, and metric weights as the candidate.

The weighted score combines gap coverage, priority coverage, pipeline
readiness, and evidence specificity. Promotion additionally requires every
safety gate and the configured minimum improvement.

## Persistence and traceability

```text
.spectra/evolution/
├── registry.json                 active pointers and immutable versions
├── audit.jsonl                   append-only SHA-256 event chain
└── runs/<run-id>/run.json        complete run decision record
```

The run record includes objective, source availability, normalized gaps,
Meta-Intelligence decision, architecture rationale, pipeline state, candidate
and baseline metrics, mutation fields, root cause, lifecycle decision, and the
control-envelope hash.

`spectra evolution-status` verifies the complete audit chain and reports active
versions. A modified historical event makes verification fail.

## Safety model

The MVP uses a structured in-process capability sandbox. Agent definitions can
emit findings and plans only. They cannot execute JavaScript, shell commands,
MCP requests, pull requests, network calls, credential reads, or source writes.

Only these agent fields may evolve:

- `capabilities`;
- `instructions`;
- `strategy`.

Identity, role, input/output contract, version sequence, execution rules,
evaluation metrics, promotion criteria, iteration ceilings, filesystem scope,
network policy, credential policy, and audit policy are protected. Candidate
content that attempts to reference protected resources is rejected before the
sandbox runs.

Configuration is declared in `.spectra/evolution.config.json`, created from
`templates/evolution.config.json`. The MVP validates unknown fields and refuses
configurations that enable network, credentials, source writes, MCP, PR, or
re-execution.

## Existing pipeline integration

The orchestrator records these explicit stages:

```text
Allure Aggregator -> coverage-map -> Gap Engine -> Planner
                  -> MCP -> PR -> re-execution
```

The first four are represented by local data and planning contracts. MCP, PR,
and re-execution are visible in every run record but remain disabled. A future
adapter must preserve the contracts, add an external approval boundary, and
remain outside the self-mutable agent definition.

## Extension interfaces

The default components are exported from `lib/evolution/index.js` and can be
replaced through `MotherEvolutionLoop` constructor options:

- coverage adapter;
- Meta-Intelligence;
- System Architect;
- Agent Factory;
- Pipeline Orchestrator;
- structured sandbox;
- Evaluator;
- Evolution Engine;
- Registry.

Alternative model-backed components must return the same serializable contracts
and pass the same independent evaluator and mutation guard.

See [ADR-0001](decisions/0001-controlled-evolution-superagents.md) for the decision
record and rejected alternatives.
