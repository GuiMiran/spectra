# Ecosystem backlog

Status: active. This is the cross-repository board. The product-specific
SPECTRA roadmap remains in Product Backlog.

## Board model

The board has three levels: `Epic -> User story -> Task`. A task is the
smallest independently verifiable piece of work. Completed tasks stay in
Delivery history; only unfinished tasks remain in the active backlog. A parent
can remain in review while one or more of its tasks are complete.

| Epic | Outcome | Status |
| --- | --- | --- |
| ECO-EPIC-001 | Agree the GUIDO ecosystem architecture and governance baseline | IN REVIEW |
| ECO-EPIC-002 | Produce an evidence-backed A1 observation and recommendation cycle | PARTIAL — authenticated test evidence shipped; full audit-to-plan cycle remains open |
| ECO-EPIC-003 | Execute approved improvements through governed A2 and A3 stages | PLANNED |

## Delivery history

### Reconciled delivery state — 2026-11-03

| Scope | Status | Evidence / remaining boundary |
| --- | --- | --- |
| Pipeline direct xUnit + Selenium, native TRX and independent inventory gate | MERGED, MAIN CI VERIFIED | [Pipeline PR #13](https://github.com/GuiMiran/guido-agentic-pipeline/pull/13); original 23 cases retained, extended to 28 by PRs #15–#16; no SpecFlow/Reqnroll or mandatory Allure |
| SPECTRA native TRX adapter + expected-inventory qualification + provenance-linked gaps | MERGED | [SPECTRA PR #22](https://github.com/GuiMiran/spectra/pull/22), [guide](../guides/trx-ingestion.md), ADR-0018 and negative controls |
| Map Pipeline tests to scoped SPECTRA requirements | MERGED, EXECUTED | [Pipeline PR #14](https://github.com/GuiMiran/guido-agentic-pipeline/pull/14); PRs [#15](https://github.com/GuiMiran/guido-agentic-pipeline/pull/15) and [#16](https://github.com/GuiMiran/guido-agentic-pipeline/pull/16) close five local obligations: 28 tests / 28 linked ACs, not exhaustive product coverage |
| Authenticated automatic Pipeline-to-SPECTRA evidence handoff | MERGED, FIRST AUTOMATIC RECEIPT VERIFIED | [Pipeline PR #17](https://github.com/GuiMiran/guido-agentic-pipeline/pull/17); [workflow_run 41580010385](https://github.com/GuiMiran/guido-agentic-pipeline/actions/runs/41580010385), PASS, mode=workflow_run, source commit 35fb5f7da800f77320405bcc78627e762ef1e6d1, source run 41579887847, 28 passed / 0 unmapped |
| Bounded RepositoryProfile / EvidenceBundle / unscored GUIDOAssessment v1 | PROPOSED IN THIS CHANGE | [A1 contract guide](../guides/a1-contracts.md), ADR-0019, strict schemas and negative structural/lineage controls; not a complete A1 orchestrator |

The source archive of the first automatic receipt was artifact 13205103884,
SHA-256 `216f37835e1d9e2ce6af7ce7d9a5be40b898e10bfc56f42289329f3f466b680e`.
Result artifact 13204899747 had ZIP SHA-256
`e38e54b4cc067c7010cc5327e58db306f366cc1e57019eabbcb76885979abc83`.
Receipt/snapshot/output hashes were checked. Results remain Pipeline artifacts;
SPECTRA was pinned at bb561e388eb3406b1ddd4792c4f8e81769b108c6. This change does
not update that pin or claim that these new A1 contracts ran in that workflow.

The active rows below distinguish shipped building blocks from unfinished A1/A2,
canonical GUIDO scoring, private evaluations and general source execution.

| ID | Parent user story | Work | Status | Evidence |
| --- | --- | --- | --- | --- |
| ECO-DISCOVERY-001 | ECO-US-001 | Read-only discovery of Stack, Scale, SPECTRA, Runtime and Pipeline | DONE | Ecosystem architecture baseline, 2026-09-11 |
| ECO-ARCH-001 | ECO-US-001 | Publish architecture, ownership, autonomy and contract baseline | DONE | docs/ecosystem and ADR-0003 through ADR-0005 |
| ECO-WORKSPACE-001 | ECO-US-003 | Publish proposed canonical multi-root workspace and duplicate-checkout policy | DONE | `WORKSPACE-POLICY.md`, 2026-09-11 |
| ECO-SECPLAN-001 | ECO-US-003 | Publish proposed security remediation plan from read-only findings | DONE | `SECURITY-REMEDIATION-PLAN.md`, 2026-09-11 |
| ECO-CI-001 | ECO-US-003 | Restore Runtime .NET CI with supported actions, Release parity, headless E2E and fresh TRX | DONE | [Runtime PR #2](https://github.com/GuiMiran/guido-autonomous-runtime/pull/2); 3 Auth + 1 E2E passed in run 41361529080 |

## ECO-EPIC-001 — Architecture and governance baseline

### ECO-US-001 — Approve an evidence-backed ecosystem architecture

As an ecosystem owner, I want a verified map of responsibilities, contracts,
risks, and autonomy boundaries so that I can approve the architecture before
automation is allowed to act.

Status: IN REVIEW. Discovery and architecture publication are complete; the
decisions still require human ratification.

| ID | Task | Status |
| --- | --- | --- |
| ECO-P0-001 | Approve or amend ADR-0003 through ADR-0005 | READY FOR HUMAN DECISION |

### ECO-US-002 — Establish one authoritative assessment and contract baseline

As a platform maintainer, I want one defined maturity model and versioned
cross-repository contracts so that observations and recommendations are
comparable, reproducible, and not based on duplicated interpretation.

Status: BLOCKED BY ECO-P0-001.

The block applies to authoritative policy/scoring. Read-only contract proposals
may be reviewed without assigning scores or ratifying the broader governance model.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P0-002 | Select one canonical GUIDO Scale scoring model and evidence policy | BLOCKED BY ECO-P0-001 |
| ECO-P0-003 | Define JSON Schema v1 for RepositoryProfile, EvidenceBundle and GUIDOAssessment | IN REVIEW: bounded read-only contracts in this change; scoring stays null, global policy still requires ratification |

## ECO-EPIC-002 — Evidence-backed A1 observation and recommendation

### ECO-US-003 — Operate the ecosystem from a safe, canonical local basis

As an ecosystem maintainer, I want an explicit workspace and supply-chain
posture so that the five repositories can be inspected consistently without
confusing duplicate checkouts or treating unsafe configuration as executable
authority.

Status: PLANNED.

| ID | Task | Status |
| --- | --- | --- |
| ECO-P0-004 | Ratify candidate canonical roots and decide the disposition of the parallel SPECTRA checkout | READY FOR HUMAN DECISION |
| ECO-P0-005 | Approve remediation priority, owners, and application windows for SEC-001 through SEC-004 | READY FOR HUMAN DECISION |

### ECO-US-004 — Produce a bounded A1 plan for a real repository

As an ecosystem owner, I want SPECTRA to turn recorded repository evidence
into a GUIDO assessment, gaps, and a read-only execution plan so that I can
choose improvements without source mutation.

Status: PARTIAL. Executed test evidence and authenticated ingestion are shipped;
an unattended inventory-to-analysis-to-proposal cycle is not yet delivered.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P1-001 | SPECTRA deterministic scanner produces RepositoryProfile | NOT STARTED as full technology scanner; GUIDO file-presence CLI exists, contract projection/commit custody adapter pending |
| ECO-P1-002 | GUIDO Scale adapter produces evidence-based GUIDOAssessment | PARTIAL: existing read-only audit bridge; unscored v1 contract proposed; no organizational score or approved rubric |
| ECO-P1-003 | SPECTRA creates GapReport and AgentExecutionPlan with existing verify and dry-run facilities | PARTIAL: Gap Engine and bounded dry-run planning exist; deterministic evidence-to-gap-to-plan adapter still pending |
| ECO-P1-004 | Run the A1 vertical against guido-agentic-pipeline without source mutation | PARTIAL: automatic TRX evidence path verified on main; full auditor/profile → analysis → reviewed-plan receipt remains open |

## ECO-EPIC-003 — Governed execution and measurable learning

### ECO-US-005 — Select capabilities and execute an approved plan in isolation

As an ecosystem owner, I want a compatible capability selected from an
approved plan and executed in an isolated worktree with receipts so that
automation remains bounded, auditable, and reversible.

Status: PLANNED.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P2-001 | APM registry and compatible capability discovery inside SPECTRA | NOT STARTED |
| ECO-P2-002 | Runtime adapter with isolated worktree, allowlisted tools and audit | PARTIAL: evaluation-only isolation [Runtime PR #4](https://github.com/GuiMiran/guido-autonomous-runtime/pull/4) is merged; general worktree mutation runtime remains separate future work |

### ECO-US-006 — Review changes and measure their effect before promotion

As an ecosystem owner, I want a draft change and a before-and-after GUIDO
assessment so that human reviewers can accept only demonstrable improvement.

Status: PLANNED.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P2-003 | Draft-PR execution at A3 after deterministic quality gates | NOT STARTED |
| ECO-P2-004 | GUIDO reassessment and measurable before and after improvement loop | NOT STARTED |
