# ADR-0005: Require governed runtime execution of approved plans

- Status: Proposed
- Date: 2026-09-11
- Owners: GUIDO ecosystem maintainers

## Context

The Autonomous Runtime includes useful prototype applications and static agent
profiles, while the Agentic Pipeline includes detection and issue-escalation
automation. Neither currently establishes authorization, sandboxing, rollback,
or auditable source mutation. Treating prompts or workflow labels as runtime
authority would be unsafe.

## Decision

Autonomous Runtime is the sole execution boundary. It may execute only an
immutable, evidence-backed `AgentExecutionPlan` accepted from SPECTRA and
within the plan's declared scope, policy, budget, and expiry.

The first executable increment is A2: an isolated worktree, a narrow command
allowlist, structured execution receipts, and no branch update or pull
request. A3, a draft pull request, requires a separate approval decision and
explicit human review. Merge and deployment remain human-controlled.

Static agent instructions and Pipeline's issue-creation workflow are guidance
and escalation mechanisms, not permission to modify source code.

## Consequences

- Runtime needs explicit tool binding, identity, secrets handling, branch
  policy, idempotency, retries, rollback or compensation, and audit storage
  before autonomous effects are introduced.
- Pipeline can prove an execution path only by consuming published receipts
  and benchmark evidence.
- Any future MCP or model provider is an adapter behind Runtime policy, not an
  implicit capability of SPECTRA CLI.
- A failed or expired plan must produce evidence and stop, not improvise a
  broader action.

## Alternatives considered

Allowing agents to operate directly from markdown prompts offers speed but no
reliable authorization or provenance. Embedding execution inside SPECTRA
would violate the separate decision and execution boundaries.
