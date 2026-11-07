# Changelog

## Unreleased

- Documented `spectra-adoption` protocol 1.0.0 with greenfield/brownfield routes,
  opt-in consumer AGENTS.md and adoption-record templates, and separate GUIDO
  inventory/diagnostic/rating boundaries. No new adoption CLI or evaluator.
- English GUIDO SDD governance hub in SPECTRA: agent entry, diagrams, component
  responsibilities and cross-repository traceability.
- Versioned five-component baseline inventory; compatibility NOT_VERIFIED.
- Bounded metadata observation and scheduled/manual documentation-only PRs;
  no automatic pin upgrades, cross-repository writes, merge or deployment.

## [0.5.0]

- Native TRX ingestion with a trusted expected inventory; Allure remains optional.
- A1 contracts, pinned same-commit audit projection and bounded dry-run gap review.
- Experimental Python distribution bundles the same Node CLI. It requires
  Node.js 18+ and does not fetch npm packages at runtime.

Compatibility notes:

- `spectra status` changes display labels and deduplicates spec IDs. Scripts
  parsing the old human-readable output must be updated.
- `spectra validate` recognizes additional draft markers. Existing drafts may
  be classified differently; review validation output before upgrading CI.
- A1 evidence is scoped and unscored; this release assigns no GUIDO level and
  does not execute repository changes.
