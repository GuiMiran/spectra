# ADR-0012 — Versioned Allure evidence and gap ingestion

- Status: Proposed
- Date: 2026-10-12
- Owners: Spectra maintainers

## Context

Controlled evolution currently consumes a hand-authored Allure summary or an
external coverage map. Neither proves which result files were read or records
retry history. Stage 2 also needs provenance rather than a self-reported pass.

## Decision

Add a local Allure 2 result importer under `lib/evidence/` and a thin
`spectra ingest-allure` CLI. The importer reads result JSON only, groups retry
attempts deterministically, retains source hashes, and writes an immutable
run snapshot. It also writes a current Allure-managed coverage map containing
failed, broken, flaky, and unmapped test gaps. The existing Gap Engine consumes
the map; source references remain attached to each normalized gap.

Refuse malformed result files, duplicate UUIDs, unordered retries, unsafe run
IDs, changed evidence for an existing run ID, symlinked output directories,
and overwrites of maps owned by another producer. No agent receives test
execution, network, credential, or source-write powers from this importer.

## Consequences

The pipeline has a reproducible first slice from real result files to measured
gaps. A reported `passed` status remains a claim from the input collector.
Authenticating the collector, merging multiple coverage sources, identifying
regressions against a baseline, and an independent oracle are separate work.
