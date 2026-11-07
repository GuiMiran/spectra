# Governance hub handoff — 2026-11-07

Status: proposed implementation; links below identify review artifacts, not
merged delivery or production deployment. Consult GitHub for current PR state.

Origin: owner request to retain ecosystem governance inside SPECTRA and provide
AGENTS navigation, version observation and cross-repository traceability.

| Component | Companion PR | Implementation revision | Responsibility |
| --- | --- | --- | --- |
| SPECTRA | [#31](https://github.com/GuiMiran/spectra/pull/31) | Initial hub snapshot `f5a1342413fd2bed8a5df3ff0044d7c38737b71d` | Hub, manifest, observer and agent entry |
| guido-sdd-engineering-stack | [#1](https://github.com/GuiMiran/guido-sdd-engineering-stack/pull/1) | `948bc7ee27831cdf35f3e4dedce0bfe7518db446` | Local agent entry and hub navigation |
| guido-sdd-migration-effort-scale | [#7](https://github.com/GuiMiran/guido-sdd-migration-effort-scale/pull/7) | `1f8add07f72e5a408ec22d4139576d4dff6cd520` | Local agent entry and hub navigation |
| guido-agentic-pipeline | [#19](https://github.com/GuiMiran/guido-agentic-pipeline/pull/19) | `bb309a731d3db17e3e04c979fc2effddcf3793ec` | Local agent entry and hub navigation |
| guido-autonomous-runtime | [#9](https://github.com/GuiMiran/guido-autonomous-runtime/pull/9) | `745cfde9fa45cbb4264c821a059c0a99e6793e05` | Local agent entry and explicit pinned governance context |

## Contracts and verification basis

- [ADR-0022](../../architecture/decisions/0022-ecosystem-governance-hub.md)
- [Version policy](../version-policy.md) and [traceability contract](../traceability.md)
- Baseline identities: [components.json](../components.json), NOT_VERIFIED
- Local verification reported in PRs: SPECTRA 174 tests, Scale 10 tests,
  Runtime autonomy 18 tests. These local counts are not authenticated remote
  CI receipts. Stack/Pipeline navigation changes did not execute application tests.
- One complete local API observation generated [observations](../observations.md).
  That record does not verify remote CI, publication to package registries,
  deployments or cross-component compatibility.

## Merge and deployment dependencies

Review the sensitive instruction/CI changes in SPECTRA #31 first, then merge the
companion navigation changes. Runtime's governance entry intentionally pins the
initial hub snapshot, not mutable main and not every later documentation edit.
Update that pin only in a reviewed Runtime change.

No automatic merge, component upgrade, organizational score or deployment is
authorized by these references. Production agent use requires a separate
deployment check. Rollback is a normal reviewed revert of the affected PRs;
no external resources are changed by the offline controls.
