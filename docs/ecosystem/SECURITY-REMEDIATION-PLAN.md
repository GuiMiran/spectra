# Security remediation plan

Status: Proposed — planning only; no configuration, workflow, permission, or
dependency change is made by this document. Date: 2026-09-11.

## Scope and evidence

The findings below are from read-only inspection of the GUIDO Autonomous
Runtime and GUIDO Agentic Pipeline. They are configuration and supply-chain
risks, not evidence of a compromise.

| ID | Finding | Evidence | Priority | Owner |
| --- | --- | --- | --- | --- |
| SEC-001 | Invalid MCP configuration | `guido-autonomous-runtime/.vscode/mcp.json` fails strict `JSON.parse` because of an extra comma before `azure-devops`. | P0 | Runtime maintainer |
| SEC-002 | More GitHub token privileges than the current auto-heal workflow needs | `agent-heal.yml` requests `contents: write`, `pull-requests: write`, and `issues: write`; its declared effect is issue creation. | P0 | Pipeline maintainer |
| SEC-003 | Workflow actions are referenced by movable tags | Pipeline workflows use major tags such as `@v4` and `@v7`; the Allure action uses `@master`. | P0 | Pipeline maintainer |
| SEC-004 | Static agent profiles advertise broad shell capability | Runtime profiles list `Bash` as a tool without an executable policy boundary. | P1 | Runtime maintainer |

## Remediation sequence

### SEC-001 — restore strict configuration validity

1. Correct the JSON structure in an isolated Runtime change.
2. Validate it with a strict JSON parser in CI or a repository check.
3. Review the configured MCP endpoints, authorization model, and intended
   trust boundary before enabling any client connection.

Acceptance: strict parsing succeeds and no endpoint is treated as permission
to execute a plan.

### SEC-002 — apply least privilege to auto-heal escalation

1. Confirm that the workflow creates an issue only and does not commit,
   dispatch a write, or open a pull request.
2. Replace workflow-wide write permissions with the narrow job-level set the
   verified behavior requires: read access for checkout and write access for
   issues only.
3. Remove `contents: write` and `pull-requests: write` unless a separately
   approved workflow change proves a need.
4. Test manual dispatch and failed-test escalation in a controlled repository.

Acceptance: the workflow still opens its intended issue and receives no token
scope capable of modifying source or pull requests.

### SEC-003 — make action dependencies reproducible

1. Inventory every `uses:` reference in all Pipeline workflows.
2. Replace `@master` first, then each mutable version tag, with a reviewed,
   full commit SHA and a comment containing its human-readable release.
3. Add a dependency-update process that proposes SHA changes for review rather
   than changing workflow dependencies automatically.
4. Re-run Pipeline tests and artifact publication after pinning.

Acceptance: no workflow action reference is a branch or mutable tag; changes
to an action pin are reviewable in source control.

### SEC-004 — treat prompts as non-authoritative until Runtime policy exists

1. Keep static agent profiles as documentation only.
2. In ECO-US-005, bind every executable tool to an approved plan, allowlist,
   isolated worktree, identity, and audit receipt.
3. Reject plans that add shell or network capability outside this policy.

Acceptance: no prompt or profile alone can grant command, source-write, or
credential access.

## Change controls

- Each remediation is a small repository-local pull request with a rollback
  note and validation evidence.
- No secret, endpoint token, or MCP credential belongs in this backlog or its
  evidence artifacts.
- Permission reductions and action pins are reviewed before merge by the
  owning repository maintainer.
- SPECTRA records the resulting evidence but does not apply the remediations.
