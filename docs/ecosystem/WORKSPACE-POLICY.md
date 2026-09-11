# Canonical multi-root workspace policy

Status: Proposed — requires owner ratification before it becomes operating
policy. Date: 2026-09-11.

## Purpose

The GUIDO ecosystem is one logical workspace made of five independent Git
repositories. This policy makes the selected checkout explicit without moving,
merging, deleting, or silently updating a repository.

## Candidate canonical checkouts

| Repository identity | Candidate canonical root | Current role |
| --- | --- | --- |
| `GuiMiran/spectra` | `C:\REpos\spectra` | SPECTRA platform |
| `GuiMiran/guido-sdd-migration-effort-scale` | `C:\REpos\guido-sdd-migration-effort-scale` | GUIDO measurement |
| `GuiMiran/guido-sdd-engineering-stack` | `C:\reposClaude\guido-sdd-engineering-stack` | GUIDO definition |
| `GuiMiran/guido-agentic-pipeline` | `C:\reposClaude\guido-agentic-pipeline` | Benchmark and proof |
| `GuiMiran/guido-autonomous-runtime` | `C:\reposClaude\guido-autonomous-runtime` | Governed execution |

`C:\reposClaude\spectra` is a parallel SPECTRA checkout with uncommitted
content. It is not a canonical root, must not be targeted by bulk operations,
and must be preserved unchanged until its owner explicitly chooses to retain,
reconcile, archive, or remove it. This policy authorizes none of those actions.

## Operating rules

1. Treat the remote repository identity, not the folder name, as authoritative.
2. Before a write, record the repository root, remote URL, current branch,
   commit, and working-tree state. Stop when the identity does not match the
   intended repository.
3. A branch is explicit per task. Being a canonical checkout does not authorize
   changing its branch, pulling, rebasing, or overwriting local work.
4. One task owns one checkout at a time. A second checkout of the same remote is
   a warning condition, not a fallback target.
5. A multi-root editor workspace is navigation only. It must not introduce
   cross-repository source imports, shared lockfiles, or a combined Git history.
6. A future SPECTRA scanner records repository identity and commit provenance;
   it must not infer authority from a local path alone.

## Adoption gate

The ecosystem owner must ratify the five roots above and nominate an owner and
disposition for the parallel SPECTRA checkout. After that decision, a
`GUIDO-Ecosystem.code-workspace` file may be generated as a convenience only.

## Acceptance evidence

- Every selected root resolves to the expected Git remote.
- The duplicate SPECTRA checkout is detected and excluded from automated
  targeting.
- A dry-run inventory reports identity, branch, commit, and dirty state for all
  five canonical roots without modifying them.
