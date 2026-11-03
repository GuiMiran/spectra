# A1 contracts v1 — structure and lineage, not autonomous delivery

This slice defines three bounded data contracts and reconciles the backlog with
the shipped Pipeline evidence path. It does **not** implement a new scanner,
authenticated collector, complete recommendation loop, scoring model or executor.

## Concrete boundaries

| Contract | Meaning in v1 | Never implies |
| --- | --- | --- |
| [RepositoryProfile](../../schemas/repository-profile.v1.schema.json) | Projection of all eight current GUIDO file-presence checks, raw-audit hash and source commit | Practice quality, enforcement, technology completeness or behavioral coverage |
| [EvidenceBundle](../../schemas/evidence-bundle.v1.schema.json) | Scoped recorded test counts and references to receipt, snapshot, expected inventory and source artifact hashes | Authentication of those references, independent assertions or exhaustive product coverage |
| [GUIDOAssessment](../../schemas/guido-assessment.v1.schema.json) | Explicit NOT_ASSESSED record linked to the exact profile/bundle hashes | G1–G5, migration effort, an approved rubric or execution authority |

All documents require schemaVersion, producer component/version, canonical UTC
generatedAt, correlationId, repository fullName and full commit. Unknown fields
are rejected. The assessment must match both inputs' repository, commit and
correlation ID and cannot predate them. Its hash links use the existing
agent-runtime stable JSON hashing: sorted object keys, preserved array order,
SHA-256. These are canonical object hashes, not original file byte hashes.
The provenance hash fields reference original artifacts separately.

The eight observation IDs match GUIDO Scale `sdd-auditor` v0.1.0. An observed
check requires at least one safe relative path; no_evidence has zero paths/count.
The profile is a **proposed host projection** of the auditor's legacy report,
not a new output already emitted by `guido audit` or a full SPECTRA tech scanner.

Evidence counts must reconcile. PASS cannot conceal zero expected tests,
missing/unexpected totals, skipped/unknown/failed/broken or unmapped results.
Explicit FAIL and UNKNOWN remain valid negative data when consistent; they
never become organizational scoring. `mode: fixture` and `pull_request` stay
distinct from `workflow_run`. These mode strings are supplied data, not proof
that a trusted host authenticated them.

## Check supplied contract records

```sh
npm run a1:contracts -- --input evals/a1-contracts.v1.json
```

The bundled record is **synthetic**, with fixture-only producer, hashes and
repository. It is a contract test, not a live repository audit or new run result.
The script reads one regular, non-symlink JSON file up to 1 MiB and writes only
its JSON report to stdout. It does not scan files, fetch referenced artifacts,
call an auditor/provider, generate a plan or change source.

Exit 0 means **contract structure and linkage are valid**, even for consistent
negative test evidence; inspect `evidenceState`. Exit 2 means malformed/invalid
input. This command must not be substituted for a behavioral quality gate.
Every report keeps `a1CycleComplete: false`, `executionAuthorized: false`,
human approval required and null GUIDO level/effort.

The runtime supports only the closed vocabulary used by these three vendored
schemas; it is not a general JSON Schema implementation. It rejects unsupported
schema keywords/types during loading, resolves no external schemas/$refs, and
performs separate cross-document semantic checks beyond JSON Schema. Independent
standard validators can validate each published schema/document's structural
shape; they do not implement the extra lineage/count rules.

## How the A1 adapters connect existing components

The [recorded-evidence/live-audit projection](a1-projection.md) now implements
the bounded host projection portion of steps 1–3 for one pinned real case.
Fresh collector automation and the complete gap-to-plan cycle are still separate.

1. A trusted host obtains an immutable repository snapshot and its full commit;
   runs the existing GUIDO auditor outside that target; verifies its output's
   custody; projects the eight observations without upgrading them to quality.
2. The host obtains authenticated Pipeline receipt, snapshot and expected
   inventory for the **same repository/commit**. It verifies original bytes and
   scoped outcomes before projecting EvidenceBundle. A stale audit cannot be
   combined silently with a newer green test run.
3. Persist GUIDOAssessment as NOT_ASSESSED until an independently reviewed
   scoring policy exists. Neither a green suite nor eight observed files is a
   GUIDO maturity result; all scoring fields stay null in this v1 contract.
4. Pass measured gaps from existing evidence/gap adapters to deterministic
   analysis. Missing inventory files are **not automatically behavioral gaps**.
   A full disagreement-preserving GapReport/coverage-map contract remains open.
5. Use the existing bounded task/context/plan contracts in `lib/agent-runtime/`
   for a dry-run proposal. Keep allow-lists, task/context/plan hashes, required
   verification, human approval and zero effects. Do not introduce a second plan
   format or reinterpret an A1 contract as Runtime execution authority.

Steps 4–5 and unattended fresh-input integration remain open. The contract
checker alone does not execute any step. Missing evidence or unresolved contract boundaries must stop a
complete-cycle claim. A2 worktree mutation, A3 draft-PR automation, provider
credentials, canonical scoring and before/after improvement remain separate.

## Already shipped versus pending

Pipeline PRs #13–#17 delivered direct xUnit, 28 locally scoped linked tests,
native TRX and an authenticated pinned-SPECTRA handoff. The first automatic
[receipt run 41580010385](https://github.com/GuiMiran/guido-agentic-pipeline/actions/runs/41580010385)
passed on source commit `35fb5f7da800f77320405bcc78627e762ef1e6d1`.
Its original hashes and scope are recorded in the
[ecosystem backlog](../planning/ecosystem-backlog.md).
The Pipeline consumer remains pinned at the older reviewed SPECTRA commit.
The separate recorded-evidence/live-audit integration does not update that pin
or turn the production collector into an unattended A1 contract/plan orchestrator.

Next deliverable after the bounded projection's review: explicit
GapReport-to-existing-plan integration and an end-to-end scoped A1 receipt.
See [ADR-0019](../architecture/decisions/0019-a1-read-only-contracts.md) and
[ADR-0020](../architecture/decisions/0020-a1-evidence-projection.md).
