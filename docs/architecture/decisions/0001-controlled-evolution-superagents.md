# ADR-0001: Controlled evolution architecture for Spectra

- Status: Accepted for MVP
- Date: 2026-09-10
- Owners: Spectra maintainers

## Context

Spectra 0.4.0 is a dependency-free Node.js CLI. Its executable behavior lives in
`bin/spectra.js` and currently provides `init`, `status`, `trace`, and `validate`.
`spectra trace` is the existing gap-analysis seam: it reads specification layers,
builds forward and reverse traceability, classifies gaps, and records iteration
history.

The proposed evolution loop must extend that seam without granting a generated
agent permission to rewrite its own controls. The repository does not currently
contain executable Allure, coverage-map, Planner, MCP, pull-request, or re-run
components. The MVP therefore defines explicit contracts and local adapters for
those stages instead of pretending that remote integrations already exist.

## Decision

Add a dependency-free `lib/evolution/` subsystem and expose it through
`spectra evolve`. The subsystem is split into a data plane and a control plane.

```text
Objective
   |
   v
Allure summary (optional) -> coverage-map -> Gap Engine / SPECTRA-TRACE
                                      |
                                      v
Mother / Meta-Intelligence -> System Architect -> Agent Factory
                                      |
                                      v
                               Orchestrator
                                      |
                                      v
                         sandboxed local execution
                                      |
                                      v
                 Evaluator (candidate vs active baseline)
                         |                    |
                    improved             not improved
                         |                    |
                      promote          Root-Cause Analysis
                         |                    |
                         +---------- Evolution Engine
                                      |
                                      v
                         versioned Agent Registry
                                      |
                                      v
                       Planner -> MCP -> PR -> re-run
                       (declared extension adapters;
                        disabled by default in the MVP)
```

### 1. Declarative agents, not generated executable code

The Agent Factory creates versioned JSON definitions containing a role,
capabilities, instructions, allowed inputs and outputs, and bounded strategy
parameters. It does not generate or execute JavaScript, shell commands, MCP
requests, credential access, or pull requests.

### 2. Immutable control envelope

Every run receives a frozen control envelope. Candidates may change only
allow-listed agent fields. Mutations that mention protected fields or paths are
rejected before execution. Protected controls include:

- sandbox and execution policy;
- credential, secret, token, and environment access;
- filesystem and network boundaries;
- evaluation thresholds and evaluator definitions;
- promotion policy, audit policy, and maximum iteration limits.

The envelope is hashed at run start and verified before promotion. Generated
agents never receive a mutation interface for the envelope.

### 3. Sandbox boundary

The MVP sandbox is an in-process capability sandbox. Agents receive immutable,
serializable snapshots and can emit only structured findings and plans. They
cannot invoke arbitrary code or tools. Each run writes artifacts beneath
`.spectra/evolution/runs/<run-id>/`; it never modifies source code, credentials,
or governance configuration.

A future operating-system/container sandbox may implement the same interface,
but it must not weaken this contract.

### 4. Independent evaluation and baseline comparison

The evaluator scores the active baseline and candidate with the same objective,
gaps, fixtures, weights, and safety gates. A candidate is promotable only when:

1. all safety gates pass;
2. required capabilities are covered;
3. its weighted score exceeds the baseline by `minimumImprovement`;
4. the immutable control-envelope hash is unchanged.

A missing active agent is represented by an explicit `null-baseline` scored by
the same evaluator. Evaluation evidence is persisted; self-reported candidate
scores are ignored.

### 5. Versioned registry and lifecycle

The registry stores immutable agent versions and mutable lifecycle pointers.
Versions transition through `candidate`, `active`, `rejected`, and `retired`.
Promotion is append-only from an audit perspective: the old active version is
retired only after the candidate passes all gates. Rejected candidates remain
available for diagnosis and reproducibility.

### 6. Tamper-evident traceability

Every material decision appends an audit event with the objective, gap inputs,
architecture decision, candidate version, baseline, metrics, root cause,
mutation proposal, and promotion result. Events form a SHA-256 hash chain using
the previous event hash.

### 7. Existing Spectra integration

The existing Markdown trace remains authoritative for spec-to-code evidence.
The new coverage-map adapter normalizes:

- `.spectra/12-trace.md` generated by `spectra trace`;
- optional `.spectra/allure-summary.json` test evidence;
- optional `.spectra/coverage-map.json` produced by an external aggregator.

Planner, MCP, PR, and re-run stages are represented as explicit pipeline
contracts. The MVP produces a reviewed execution plan for them but does not
perform external mutations. Implementations can be added later behind the same
interfaces and must remain subject to human approval and the control envelope.

## Alternatives considered

### Let agents rewrite source and re-run the CLI

Rejected. It makes evaluator and safety-control mutation possible and provides
no trustworthy boundary between proposal and promotion.

### Put the whole loop in `bin/spectra.js`

Rejected. The existing CLI is already large; isolated modules make contracts,
tests, and alternative adapters possible without rewriting current commands.

### Require an LLM or agent framework in the MVP

Rejected. A deterministic core is locally executable and testable. Model-backed
architects and builders can later implement the same interfaces.

## Consequences

- The MVP evolves agent definitions and orchestration policies, not its own
  source code or security controls.
- Runs are reproducible without network access or third-party dependencies.
- Remote MCP and pull-request execution remains intentionally out of scope until
  a separately reviewed adapter and approval protocol exist.
- The deterministic evaluator is a useful safety baseline, but production
  promotion should add repository-specific eval fixtures and independent test
  oracles.

## Implementation plan

1. Extract contracts, config loading, normalized gap ingestion, and registry.
2. Implement Mother/Meta, Architect, Factory, Orchestrator, sandbox, Evaluator,
   Root-Cause Analysis, and Evolution Engine.
3. Add `spectra evolve` and `spectra evolution-status` commands.
4. Add deterministic eval fixtures and Node test coverage for safety,
   promotion, rejection, retirement, audit-chain verification, and pipeline
   integration.
5. Document configuration, artifacts, operating model, and extension points.
6. Re-run existing CLI smoke checks, the new suite, and package validation.
