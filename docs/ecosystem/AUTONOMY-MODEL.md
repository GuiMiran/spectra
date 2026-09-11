# Autonomy model

GUIDO maturity and operational autonomy are independent dimensions. A
repository may have strong engineering maturity while still operating with a
human-approved A1 workflow.

| Level | Meaning | Required controls |
| --- | --- | --- |
| A0 | Observe | Read-only scanner and evidence collection |
| A1 | Recommend | Deterministic analysis and human-reviewed plan |
| A2 | Generate | Isolated candidate changes with independent tests |
| A3 | Open PR | Approved plan, protected branch and draft PR |
| A4 | Merge after gates | Deterministic gates, explicit merge policy and audit |
| A5 | Autonomous within policy | Bounded budgets, stop conditions and continuous reassessment |

## Current target

The ecosystem target is A1. SPECTRA main already supports part of this with
evidence verification and dry-run planning. No repository currently proves A2
or higher as an integrated system.

## Mandatory stop conditions

- target achieved;
- no measurable improvement;
- budget or timeout exceeded;
- repeated failure;
- missing or stale evidence;
- policy or security gate failure;
- required human approval absent.

## Mutation boundary

No change may target main directly. A2 and above require an isolated branch or
worktree, a scope-limited tool policy, independent quality gates, and an audit
record that binds execution to the approved plan hash.
