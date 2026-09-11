# Dynamic agent architecture

Status: design boundary. This document does not create an agent runtime or an
APM implementation.

## Principle

Layer is not agent. A SPECTRA layer is a domain of analysis. A repository may
need zero, one, or many specialist capabilities for that domain.

RepositoryProfile, EvidenceBundle and GapReport produce capability requirements.
The platform searches compatible reusable agents, evaluates compatibility and
provenance, creates a bounded candidate only when no evaluated capability
exists, and finally produces an approved execution plan.

## APM responsibility inside SPECTRA

APM is a future SPECTRA module, not a sixth repository. Its initial role is
registry and discovery only:

- agent manifest;
- capability identifiers;
- version and compatibility;
- evaluated evidence and provenance;
- policy and permission requirements.

Reuse before generate is mandatory. A capability is not trusted merely because
it has a prompt or a descriptive file.

## Minimum future AgentManifest

| Field | Purpose |
| --- | --- |
| schemaVersion, id, version | Stable identity |
| capability and purpose | Why the capability exists |
| inputs and outputs | Bounded data contract |
| tools and permissions | Explicit allowlists |
| constraints and stop conditions | Operational limits |
| evaluation | Independent acceptance method |
| provenance | Author, source, model and review lineage |

## Current state

SPECTRA has safe declarative specialist selection and read-only planning.
Pipeline and Runtime contain prompts and Markdown profiles. Neither is a
reusable, evaluated agent package nor evidence of execution. The first
implementation must therefore remain A1 and proposal-only.
