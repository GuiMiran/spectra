# A1 projection — recorded evidence plus a fresh pinned audit

This adapter connects real Pipeline evidence to the v1 A1 contracts from
[ADR-0019](../architecture/decisions/0019-a1-read-only-contracts.md). It does not
implement gap-to-plan integration, a new authenticated collector, GUIDO scoring,
source mutation, or a complete A1 recommendation cycle.

## Two different boundaries

| Boundary | Inputs and authority | Outputs |
| --- | --- | --- |
| `lib/verification/a1-projection.js` | Bounded original bytes + **trusted host pins** + explicit projection time/correlation; no filesystem/network/process access | Immutable RepositoryProfile, EvidenceBundle, NOT_ASSESSED GUIDOAssessment and contract validation |
| `scripts/a1-recorded-integration.js` / CI | Fixed public Git checkouts and reviewed fixture pins; Git reads and one pinned auditor invocation, clean child environment | Actual `audit.json`/`audit.md`, projected contracts and a scoped integration receipt outside all source repos |

Pins are trusted configuration supplied by the host, not credentials or authority
obtained from an artifact. A caller supplying both malicious bytes and its own
matching hashes has not authenticated anything. The module verifies byte identity
and semantic lineage; the integration demonstrates reviewed pins plus actual Git
HEAD/clean-tree checks and execution of the separately pinned auditor CLI.

## Recorded production evidence, not synthetic test outcomes

`evals/a1-recorded-pipeline/` preserves original bytes from the first authenticated
production handoff. Its pins record:

- repository `GuiMiran/guido-agentic-pipeline`;
- source commit `35fb5f7da800f77320405bcc78627e762ef1e6d1`;
- [source Run Tests 41579887847](https://github.com/GuiMiran/guido-agentic-pipeline/actions/runs/41579887847), attempt 1;
- [handoff workflow_run 41580010385](https://github.com/GuiMiran/guido-agentic-pipeline/actions/runs/41580010385);
- source artifact 13205103884 and result artifact 13204899747, with original ZIP
  hashes and individual receipt/snapshot/expected-file hashes in `pins.json`.

The GitHub API artifact metadata and ZIP hashes were checked when these records
were acquired. This workflow **replays those recorded bytes**, not a fresh API
download/authentication or new Selenium execution. The original Pipeline handoff
remains the authenticated collector; its production pin is not changed here.
Updating these evidence pins is a maintainer-reviewed data/provenance change.

The new CI job checks out exactly that source commit and GUIDO Scale
`497b6694de9315516ea297a48a470c5a5048abc1`. It runs the existing stdlib-only
`sdd-auditor` v0.1.0 on the actual clean Git checkout. The audit's own commit must
match the recorded tests. Null Git metadata is rejected, not filled in from a
caller assertion. No target code, build, test or repository instruction executes.

## What is checked

1. Original receipt, snapshot and expected inventory bytes match host pins.
2. Receipt repository/run/attempt/commit/artifact/tool pin and mode match the
   host's recorded custody. Snapshot and inventory belong to the same commit.
3. Snapshot's expected-inventory digest matches parsed inventory bytes. The
   existing qualifier recomputes outcomes from tests; actual counts/attempts and
   acceptance mappings agree with receipt and snapshot. A self-reported green
   count is insufficient. Failed source workflow / unassessed criteria remain
   UNKNOWN or FAIL as appropriate; recorded failures cannot become PASS.
4. Audit has all eight checks, matching commit/collector version and null GUIDO
   level/effort. Projection preserves observations without upgrading file presence
   or absence into practice quality or behavioral gaps.
5. Existing A1 contract validation checks correlation, timestamps, canonical input
   hashes, safe paths, count consistency and zero execution authority.

File-byte hashes and parsed-object hashes are distinct. Expected inventory raw
SHA-256 is preserved in EvidenceBundle; the snapshot's parsed JSON digest is
recomputed separately. Contract-to-assessment links use existing stable JSON
hashing, not an accidental reserialization of original evidence files.

## Run the bounded integration

Prepare three real Git checkouts under one workspace: SPECTRA in `spectra`, the
exact recorded Pipeline commit in `target`, and the pinned Scale commit in
`scale`. Then:

```sh
npm run a1:recorded-integration -- --workspace /path/to/workspace --output /tmp/a1-projection
```

Use a new output directory outside all three repositories. The script verifies
HEAD and clean tracked/untracked/ignored state before and after the audit. It
executes only Git read commands and the fixed auditor CLI, with bounded time and
output and a clean environment. It never accepts an arbitrary source command or
plan. Python output is kept outside the audited target as its contract requires.

The `.github/workflows/a1-recorded-integration.yml` job performs this on PRs and
relevant main pushes using contents:read only. All action/tool/source refs are
pinned where external; credentials are not persisted or passed to child commands.
It has no actions:read token, referenced secrets, write scopes, provider or PAT.

Artifact `a1-recorded-live-audit-<run>-<attempt>` retains for 30 days:

- `audit/audit.json` and `audit/audit.md` from the actual pinned auditor;
- `contracts.json` with projected v1 records;
- `projection-receipt.json` with source/auditor/projector commits, raw/canonical
  hashes, observed host operations, clean-tree checks and interpretation limits.

Projection `generatedAt` is the time envelopes are created, **not a claim that
historical test execution happened then**. The receipt labels the combination as
`recorded-evidence-live-audit-projection`. Contract validity can coexist with
negative test evidence; it is not a fresh behavioral quality gate.

## Remaining work

This supplies a bounded host projection and a real integration receipt. The
auditor still uses file-name heuristics: for example, absence of a matching trace
filename must not erase a separately verified acceptance mapping. No G1–G5 level
or migration effort is assigned. No source artifact authenticates its own pins.

Next: deterministic GapReport integration that distinguishes measured test gaps,
inventory observations and unresolved policy, then the existing bounded dry-run
Task/Context/Plan contract. Do not call this an unattended live A1 cycle or enable
A2/A3 from a successful projection. See
[ADR-0020](../architecture/decisions/0020-a1-evidence-projection.md).
