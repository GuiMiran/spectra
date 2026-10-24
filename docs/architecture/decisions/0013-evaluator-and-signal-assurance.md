# ADR-0013 — Evaluator and signal-path assurance

- Status: Accepted
- Date: 2026-10-24
- Owners: Spectra maintainers

## Context

An agent trajectory may pass its deterministic contract while its external
oracle has changed the state being evaluated, produced the wrong known answer,
or drifted on replay. Likewise a detector may report a violation while the
signal fails to reach the enforcement or audit boundary.

## Decision

Add two dependency-free, schema-versioned assessments to `lib/verification/`.
The oracle assessment compares two independently recorded runs, including
before/after state digests, two opposite known-answer controls, and at least
one metamorphic relation. The signal-path assessment checks a synthetic
violation through detection, correlation, policy, executed action and audit,
with a shared trace and evidence identity.

Malformed input is `UNRESOLVED`; a valid record that violates an invariant is
`FAIL`. `PASS` means only that the supplied record is internally consistent.
An external trusted runner must capture actual state and telemetry; SPECTRA
neither executes an oracle nor attests the provenance of self-reported data.
No network, credential or source-write authority is added to the agent runtime.

The Azure YAML audit checks a selected task list relevant to .NET and QA. It
does not inspect classic pipelines or Azure DevOps projects, and it never
rewrites a pipeline automatically. Migration needs a separate owner review of
task inputs and a non-production run.

## Consequences

CI exercises the assessment contracts on illustrative fixtures and checks this
repository's YAML. Those fixtures do not constitute a production canary.
Integration with Datadog, Azure DevOps, MCP tools or real model calls requires
explicit adapters and end-to-end tests at the appropriate trust boundary.
