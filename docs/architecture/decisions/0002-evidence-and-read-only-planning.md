# ADR-0002: Executed-evidence contract and read-only planning boundary

- Status: Accepted
- Date: 2026-09-10
- Owners: Spectra maintainers

## Context

SPECTRA-TRACE records declared relationships between specifications and code.
It is useful context, but a trace tag and a cross-reference do not demonstrate
that a test was executed or that the declared behaviour passed. The controlled
evolution MVP also intentionally has no model, shell, network, credential, or
source-write capability.

Spectra needs a first executable foundation for measured improvement without
misrepresenting a static trace or a deterministic profile generator as an AI
agent that has changed a system.

## Decision

Add two independent, dependency-free contracts outside `lib/evolution/`.

### 1. Canonical recorded evidence

`.spectra/evidence.json` may record independently executed checks using schema
version 1:

```json
{
  "schemaVersion": 1,
  "run": { "command": "npm run focused-check" },
  "results": [{ "id": "AC-001", "status": "passed" }]
}
```

Supported result states are `passed`, `failed`, and `skipped`. A missing or
malformed file is an explicit failure state. `spectra verify` derives required
acceptance IDs from layer 11 unless a bounded `--require` scope is provided,
and exits unsuccessfully unless each required ID is recorded as `passed`.

`spectra verify` validates a recorded artifact. It does not run an arbitrary
project command and it does not treat an artifact link, a trace tag, or a
successful command written as text as behavioural proof.

### 2. Read-only planning runtime

`lib/agent-runtime/` accepts a versioned task and an explicitly supplied,
bounded context. The task allow-lists files and SPECTRA IDs. The runtime
validates hashes, context boundaries, plan references, and provenance.

The only bundled providers are:

- `null`: records that no model-backed plan is available;
- `dry-run`: creates a deterministic proposal for exercising the contract.

Neither provider calls a model. Both report zero source writes, network calls,
credential reads, and shell commands. Every plan requires human approval.
The CLI can persist a plan artifact only under `.spectra/agent-runs/`.

## Consequences

- SPECTRA now distinguishes declared traceability from recorded test evidence.
- A project can fail closed on missing acceptance evidence before any agent
  receives authority to write source code.
- `spectra agent plan` is deliberately not marketed as a model call. It creates
  a bounded request/provenance artifact and is safe to run locally.
- A future model adapter must remain outside this closed runtime until it has a
  separate ADR covering provider credentials, prompt-injection handling,
  logging, cost limits, approval, isolation, and independent evaluation.
- A future builder must use an operating-system/container worktree boundary;
  it may not reuse the planning runtime as a source-write mechanism.

## Rejected alternatives

### Treat SPECTRA-TRACE coverage as test coverage

Rejected. Traceability is a declaration and may be stale, incomplete, or
incorrect even when its static links are complete.

### Add an API key and general shell access to `spectra evolve`

Rejected. It violates ADR-0001's immutable control envelope and combines
planning, execution, and evaluation in one untrusted loop.

### Let the planner read the complete repository by default

Rejected. It creates unbounded context, weakens auditability, and makes it
easier for untrusted repository content to change the agent's objective.
