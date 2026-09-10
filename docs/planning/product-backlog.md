# Product Backlog — Spectra Evidence Control Plane

Status: proposed

This backlog turns Spectra from a structured specification method with a light
CLI into an evidence-driven control plane for AI-assisted software delivery.
It is based on the current product, its existing safety constraints, and the
independent product review recorded in the project discussion.

## Product thesis

**Spectra helps AI coding agents make domain-safe changes by turning business
knowledge into explicit, versioned, and measurable evidence.**

The commercial differentiation is not “more autonomous agents.” It is the
combination of domain constraints, traceability, executable evidence, and
governed delivery. This is most valuable where a wrong change is expensive:
regulated workflows, financial operations, health, insurance, migrations, and
multi-agent software teams.

## Promise ladder

| Level | Customer promise | Evidence required | Current state |
| --- | --- | --- | --- |
| L0 — structured context | Agents receive consistent domain rules and acceptance context. | Valid layers, cross references, trace declarations. | Available. |
| L1 — verified behaviour | Critical rules and acceptance criteria are linked to executed test results. | Test-run ingestion, result-to-spec mapping, regression detection. | Backlog P0. |
| L2 — governed delivery | Agents can turn verified gaps into reviewable plans and approved delivery actions. | Planner, approval gates, immutable audit trail, PR/re-run adapters. | Backlog P1. |
| L3 — measured evolution | Agent strategies are selected against independent task evaluations. | Benchmark suite, external evaluator, baseline comparison. | Controlled local MVP only. |

Spectra must not claim complete truth, structural reconstruction, autonomous
implementation, or unrestricted self-improvement until the corresponding level
has independent evidence.

## Now — establish a credible product contract

### P0-01 — Claim and terminology audit

**Outcome:** public language accurately matches the shipped product.

- Replace “identical reconstruction” with *behavioural equivalence measured by
  independent evaluators*.
- Replace “the cost of over-specifying is zero” with a risk-proportional
  specification rule.
- State that trace coverage is a declaration/evidence-link metric, not test or
  functional coverage.
- Describe the current evolution component as controlled selection of
  declarative agent strategies; do not present it as autonomous code evolution.
- Correct package, version, skill, and comparison metadata drift.

**Acceptance:** a claim inventory links every strong public assertion to a test,
benchmark, or clearly marked roadmap item; README, manifesto, skill, website,
and comparison pages agree.

### P0-02 — Evidence taxonomy and metric contract

**Outcome:** every dashboard number identifies exactly what it proves.

- Define `declared_trace`, `acceptance_linked`, `executed_test`,
  `behaviourally_verified`, and `unverified` evidence levels.
- Persist evidence provenance: test run, source file, commit/ref, timestamp,
  evaluator version, and outcome.
- Rename existing coverage fields where needed so they cannot be mistaken for
  behavioural coverage.
- Add thresholds by severity: for example, a critical invariant cannot be
  reported as verified without an executed independent check.

**Acceptance:** the trace report and JSON output contain evidence level and
provenance; unit tests demonstrate that a tag plus acceptance link does not
become verified without a passing execution result.

### P0-03 — Semantic layer schemas and linting

**Outcome:** `spectra validate` checks meaning-bearing structure, not only IDs
and files.

- Define a machine-readable schema for rules, invariants, contracts, decision
  tables, acceptance criteria, and source references.
- Add `spectra lint` as a non-breaking command; retain `validate` compatibility.
- Detect malformed invariants, missing rule sources, ambiguous priorities,
  incomplete decision tables, orphaned acceptance criteria, and duplicate
  canonical terms.
- Emit diagnostic codes, locations, severity, and remediation guidance.

**Acceptance:** fixture-driven tests cover valid and invalid semantic examples;
the command returns stable JSON diagnostics suitable for CI and agents.

### P0-04 — Trace scanner hardening

**Outcome:** tracing is configurable, explainable, and less dependent on a
small hard-coded directory list.

- Add include/exclude globs to a project trace configuration.
- Report unscanned files and ignored paths explicitly.
- Add language-aware tag extractors incrementally, starting with the currently
  supported source extensions.
- Distinguish “not scanned”, “declared”, “executed”, and “orphaned”.

**Acceptance:** a fixture with custom source roots, ignored generated files, and
an intentionally unscanned directory produces an auditable report.

## Next — make the delivery pipeline real, still governed

### P1-01 — Allure Aggregator and execution-result ingestion

**Outcome:** Spectra consumes real Allure result files and produces a canonical
test-evidence snapshot.

- Add `lib/evidence/allure-aggregator.js` to parse Allure result JSON, not only
  a hand-authored summary.
- Produce `.spectra/evidence/test-runs/<run-id>.json` with spec/AC mapping,
  failures, retries, duration, commit/ref, and provenance.
- Add `spectra ingest-allure --input <dir>` and a deterministic fixture suite.
- Keep the aggregator local and read-only.

**Acceptance:** an Allure fixture with pass, fail, broken, retry, and unmapped
tests creates an evidence snapshot and deterministic diagnostics.

### P1-02 — Canonical coverage-map and Gap Engine

**Outcome:** all sources produce one versioned gap contract.

- Define `coverage-map.v1` with gaps, evidence level, severity, owner, source
  provenance, and suggested verification.
- Merge SPECTRA-TRACE, Allure evidence, and future external evaluators without
  losing disagreement between sources.
- Make the Gap Engine classify regression, stale evidence, missing evidence,
  domain risk, and delivery risk separately.
- Add `spectra coverage-map` and JSON output for CI.

**Acceptance:** a mixed fixture shows a passing declaration but failing test as
an explicit regression rather than a false positive; schema changes are versioned.

### P1-03 — Deterministic Planner

**Outcome:** every measured gap becomes a reviewable delivery proposal rather
than a free-form recommendation.

- Add `lib/planning/` with task, dependency, required evidence, risk, and
  approval requirement contracts.
- Add `spectra plan --from <coverage-map>`; persist plans under
  `.spectra/plans/<plan-id>.json` and a readable Markdown view.
- Split plans by independently reviewable change, never directly by agent role.
- Require explicit acceptance evidence and rollback notes for critical work.

**Acceptance:** a critical invariant gap produces a plan that blocks delivery
until verification is attached; plans are deterministic for the same input.

### P1-04 — Approval and external-action boundary

**Outcome:** MCP, pull requests, and re-runs become usable integrations without
becoming agent-controlled powers.

- Define an `ActionRequest` contract: immutable plan hash, requested adapter,
  scope, source ref, approval identity, expiry, and expected evidence.
- Add `spectra approve <plan-id>` that creates a signed local approval record;
  it must not execute external work.
- Implement adapter interfaces for `McpDispatchAdapter`, `PullRequestAdapter`,
  and `ReexecutionAdapter`, all disabled by default.
- Require an approval record and matching plan hash before any adapter can act.

**Acceptance:** a request without approval or with a changed plan is rejected;
adapter contract tests prove that credentials and governance controls cannot be
read or mutated by evolved agent definitions.

### P1-05 — First real delivery adapter: GitHub draft PR

**Outcome:** an approved plan can create a draft pull request with evidence,
without autonomous merging or source changes.

- Implement the PR adapter behind explicit configuration and approval.
- Attach the plan, coverage-map, evidence summary, and audit record to the PR
  body.
- Default to draft; never merge, request secrets, or change branch protection.
- Pair with re-execution ingestion rather than a blind “success” status.

**Acceptance:** integration tests with a fake GitHub adapter prove approval,
idempotency, and denial paths; live integration remains opt-in.

## Then — prove and improve the evolution system

### P2-01 — Behavioural reconstruction benchmark

**Outcome:** quantify whether a frozen Spectra specification helps independent
agents reproduce observable behaviour.

- Create a small public reference product with a frozen specification.
- Hold out evaluator-owned tests and compare baseline agents vs Spectra-guided
  agents across multiple attempts.
- Publish pass rate, critical invariant pass rate, cost, latency, and failure
  taxonomy; do not publish hidden tests.

**Acceptance:** reproducible benchmark protocol and signed result artifacts are
available; marketing only claims the measured scope.

### P2-02 — Independent evaluator plug-in protocol

**Outcome:** the Evolution Engine can use reproducible external evals rather
than only local strategy heuristics.

- Define evaluator input/output, dataset version, oracle provenance, and score
  normalization contracts.
- Keep evaluator definitions immutable to evolved agents.
- Require candidate/baseline parity: same fixtures, model budget, seed policy,
  timeout, and evaluator version.

**Acceptance:** a deliberately overfitted candidate fails a held-out evaluator;
all promotions cite evaluator provenance in the registry.

### P2-03 — Controlled model-backed specialists

**Outcome:** selected specialists can use an LLM through a bounded adapter while
remaining proposal-only.

- Add a model adapter contract with prompt/input redaction, cost ceiling,
  timeout, deterministic replay metadata, and structured output validation.
- Use it first for plan enrichment and root-cause hypotheses, never source-code
  mutation or governance changes.
- Compare model-backed and deterministic variants through P2-02.

**Acceptance:** failures degrade safely to the deterministic planner; every
model invocation is attributable and redacted in the audit trail.

## Product and ecosystem decisions

### P3-01 — Licensing decision

**Decision required:** choose whether Spectra is an open-core standard,
commercial product, or non-commercial reference framework.

The current CC BY-NC-ND license conflicts with language that calls the project
open source and inhibits enterprise adoption and ecosystem extensions. This is a
business/legal decision, not an automated code change.

**Acceptance:** license, README, npm metadata, contribution policy, and website
use consistent terms; any license change is reviewed by the rights holder.

### P3-02 — Packaging and commercial offer

**Outcome:** customers can understand what they buy and why it reduces risk.

- Community core: layers, linting, trace, local evidence ingestion.
- Team/enterprise offer: managed evaluators, policy packs, audit export,
  CI integrations, and approved delivery adapters.
- Start with regulated-domain templates and a measurable onboarding outcome:
  first evidence-backed critical workflow within one day.

**Acceptance:** pricing/packaging page separates shipped capabilities from
roadmap; one design-partner workflow runs end-to-end with recorded value metrics.

## Sequencing and non-goals

1. Complete P0-01 through P0-04 before advertising autonomous evolution.
2. Complete P1-01 through P1-03 before enabling any external delivery action.
3. Complete P1-04 before implementing a real MCP, PR, or re-execution adapter.
4. Complete P2-01 and P2-02 before claiming measured self-improvement.

Out of scope for the current product contract:

- unrestricted self-modification;
- autonomous production deployment or merge;
- access to credentials from evolved agents;
- claims of exhaustive legal, domain, or behavioural correctness;
- structural identity reconstruction promises.

## Operating metrics

Track these metrics for each design partner and release:

- percentage of critical rules with executed independent evidence;
- regression detection rate and time to diagnosis;
- false-positive rate of trace and gap reports;
- plan approval-to-completion rate;
- agent baseline vs candidate performance on held-out tasks;
- cost and latency per verified gap closed;
- number of blocked unsafe action requests.
