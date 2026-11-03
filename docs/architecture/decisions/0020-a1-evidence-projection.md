# ADR-0020 — Pinned-evidence A1 projection with a live read-only audit

- Status: Proposed; code-owner review required
- Date: 2026-11-03

## Context

ADR-0019 provides strict structures and lineage checks, but only synthetic
contract examples. Pipeline's real authenticated handoff already records 28 local
test outcomes. GUIDO's existing auditor can independently inventory the exact
source Git checkout without executing its code or scoring its organization.

## Decision

Add a pure byte-based projector under `lib/verification/`. Require host-owned
custody pins, original recorded evidence, matching audit Git commit and the
existing collector version. Recompute qualification/counts/mappings and validate
the resulting three A1 contracts; keep assessment NOT_ASSESSED and execution
authority false. A digest supplied by an untrusted artifact is not authentication.

Add a separately reviewed host integration script and read-only CI job. Use
fixed public source/tool commits, a clean actual Git checkout, the original
recorded production evidence, and one execution of the pinned Scale auditor.
Verify source cleanliness before/after; write audit and contracts outside source
repositories. Retain source/auditor/projector commits and raw/canonical hashes.

This host explicitly has Git-read/process/output authority needed for the
auditor. The pure projector and existing planning runtime do not inherit it.
No target code executes and no repository artifact supplies a command or tool
ref. CI adds no secrets, Actions-read permission, write scope, provider or PAT.

## Consequences

There is a reproducible real audit + recorded test evidence projection for one
commit, without pretending the tests ran again. Future fresh authentication stays
in the trusted collector/host boundary, not in the pure module. Existing Pipeline
consumer pin is unchanged. Source data and receipt pins require maintainer review.

The auditor's name-based observations are not quality scores or behavioral gaps.
GapReport and existing dry-run plan integration remain open. A1 completion, A2
mutation, A3 automatic PRs, independent oracle proof and GUIDO G1–G5 assignment
are not enabled or claimed by this projection.
