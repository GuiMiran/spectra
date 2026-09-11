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
| ECO-EPIC-002 | Produce an evidence-backed A1 observation and recommendation cycle | PLANNED |
| ECO-EPIC-003 | Execute approved improvements through governed A2 and A3 stages | PLANNED |

## Delivery history

| ID | Parent user story | Work | Status | Evidence |
| --- | --- | --- | --- | --- |
| ECO-DISCOVERY-001 | ECO-US-001 | Read-only discovery of Stack, Scale, SPECTRA, Runtime and Pipeline | DONE | Ecosystem architecture baseline, 2026-09-11 |
| ECO-ARCH-001 | ECO-US-001 | Publish architecture, ownership, autonomy and contract baseline | DONE | docs/ecosystem and ADR-0003 through ADR-0005 |
| ECO-WORKSPACE-001 | ECO-US-003 | Publish proposed canonical multi-root workspace and duplicate-checkout policy | DONE | `WORKSPACE-POLICY.md`, 2026-09-11 |
| ECO-SECPLAN-001 | ECO-US-003 | Publish proposed security remediation plan from read-only findings | DONE | `SECURITY-REMEDIATION-PLAN.md`, 2026-09-11 |

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

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P0-002 | Select one canonical GUIDO Scale scoring model and evidence policy | BLOCKED BY ECO-P0-001 |
| ECO-P0-003 | Define JSON Schema v1 for RepositoryProfile, EvidenceBundle and GUIDOAssessment | NOT STARTED |

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

Status: PLANNED.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P1-001 | SPECTRA deterministic scanner produces RepositoryProfile | NOT STARTED |
| ECO-P1-002 | GUIDO Scale adapter produces evidence-based GUIDOAssessment | NOT STARTED |
| ECO-P1-003 | SPECTRA creates GapReport and AgentExecutionPlan with existing verify and dry-run facilities | NOT STARTED |
| ECO-P1-004 | Run the A1 vertical against guido-agentic-pipeline without source mutation | NOT STARTED |

## ECO-EPIC-003 — Governed execution and measurable learning

### ECO-US-005 — Select capabilities and execute an approved plan in isolation

As an ecosystem owner, I want a compatible capability selected from an
approved plan and executed in an isolated worktree with receipts so that
automation remains bounded, auditable, and reversible.

Status: PLANNED.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P2-001 | APM registry and compatible capability discovery inside SPECTRA | NOT STARTED |
| ECO-P2-002 | Runtime adapter with isolated worktree, allowlisted tools and audit | NOT STARTED |

### ECO-US-006 — Review changes and measure their effect before promotion

As an ecosystem owner, I want a draft change and a before-and-after GUIDO
assessment so that human reviewers can accept only demonstrable improvement.

Status: PLANNED.

| ID | Outcome | Status |
| --- | --- | --- |
| ECO-P2-003 | Draft-PR execution at A3 after deterministic quality gates | NOT STARTED |
| ECO-P2-004 | GUIDO reassessment and measurable before and after improvement loop | NOT STARTED |
