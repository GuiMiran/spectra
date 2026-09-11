# GUIDO ecosystem

This section records the boundaries between the five GUIDO repositories. It is
an architecture record, not an execution runtime and not a replacement for the
13 SPECTRA specification layers.

## Status board semantics

The ecosystem backlog contains future work only. Closed work is preserved in
the delivery history below and in the decision records that constrained it.

| Record | Status | Evidence |
| --- | --- | --- |
| ECO-DISCOVERY-001: read-only inventory of the five repositories | DONE | 2026-09-11 architecture inventory, repository metadata, source, tests, workflows, documentation, and issue review |
| ECO-ARCH-001: publish ecosystem architecture baseline | DONE | This section and ADR-0003 through ADR-0005 |
| ECO-WORKSPACE-001: publish candidate workspace policy | DONE | WORKSPACE-POLICY.md |
| ECO-SECPLAN-001: publish proposed security remediation plan | DONE | SECURITY-REMEDIATION-PLAN.md |

## Navigation

- [Ecosystem architecture](GUIDO-ECOSYSTEM.md)
- [Responsibility map and overlap register](RESPONSIBILITY-MAP.md)
- [Versioned component contracts](COMPONENT-CONTRACTS.md)
- [Dynamic agent architecture](AGENT-ARCHITECTURE.md)
- [Autonomy model](AUTONOMY-MODEL.md)
- [Canonical multi-root workspace policy](WORKSPACE-POLICY.md)
- [Security remediation plan](SECURITY-REMEDIATION-PLAN.md)
- [Ecosystem backlog](../planning/ecosystem-backlog.md)

## Scope

The proposed logical workspace contains one candidate canonical checkout of
each repository:

1. guido-sdd-engineering-stack
2. guido-sdd-migration-effort-scale
3. spectra
4. guido-autonomous-runtime
5. guido-agentic-pipeline

Multiple physical copies must not be treated as independent products. A dirty
or older duplicate stays preserved until its owner explicitly reconciles it.
