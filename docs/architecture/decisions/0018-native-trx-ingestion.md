# ADR-0018 — Native TRX evidence without a mandatory reporting framework

- Status: Proposed (code-owner review required)
- Date: 2026-11-02
- Owners: Spectra maintainers

## Context

GUIDO Pipeline PR #13 replaces executable SpecFlow bindings with direct xUnit
and Selenium. VSTest emits native TRX. Allure and Reqnroll are not prerequisites
for recording evidence. A green CI job or TRX Counters element alone cannot
establish completeness against independently expected tests.

## Decision

Add `spectra ingest-trx` and a dependency-free local importer under
`lib/evidence/`. Require host-supplied run ID, full commit and independently
maintained expected inventory. Reuse the existing qualification states and
snapshot / coverage-map layout, but identify the source as `trx-results`.
Accept the canonical expected-test inventory or Pipeline's pre-execution
`{schemaVersion, commit, tests:[{id,name}]}` inventory, bound to the same commit.
Pipeline IDs remain expected-test IDs, not invented SPECTRA requirement IDs.

Support flat VSTest TRX in the default TeamTest/2010 namespace, UTF-8 only.
The bounded parser rejects DTDs, external/declared entities, processing
instructions except the XML declaration, namespace rebinding, prefixed XML,
nested test results and malformed documents. It never resolves resources.
Bound input size, file count, node count and depth. Duplicate test names or
execution IDs across the import are errors, not inferred retry history.

Missing results, skips, inconclusive outcomes, unexpected tests and incomplete
run summaries cannot produce PASS. Malformed inputs fail before persistence;
well-formed negative evidence is persisted and the CLI exits non-zero.
Hashes bind the original TRX bytes; inventory hashes bind its parsed JSON.
File hashes prove byte identity, not collector authenticity or assertion quality.

Share only the persistence mechanism with Allure. Preserve the Allure API and
error contract. Refuse overwriting another producer's coverage map; source
merging and automatic provenance authentication are separate work.

## Consequences

Native .NET results feed existing measured gaps without adding a test runner,
network access, shell authority, auto-repair or model calls to SPECTRA.
TRX import does not overwrite `.spectra/evidence.json`, and is not automatically
acceptance coverage for `spectra verify`. Data-driven nested TRX, retry merging,
cross-source aggregation and baseline regression analysis are not implemented.
Trusted hosts must freeze and preserve inventory before execution and verify
artifact/run/commit custody; an agent-created matching inventory is not an oracle.
