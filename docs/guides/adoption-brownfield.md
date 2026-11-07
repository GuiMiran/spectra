# Brownfield adoption

Use [spectra-adoption 1.0.0](adoption-protocol.md) when an implementation exists
in the selected scope. Adopt the existing project; a rewrite is a separate
product decision, not a prerequisite for Spectra.

## Inputs and baseline

Record a full source commit, working-tree state/delta, named behavior scope,
tool/rubric revisions, owner and exclusions. If no Git history exists, retain
an immutable snapshot and digest with its limitation. Inventory source,
configuration, specifications, tests, schemas and deployment declarations.
Do not embed secrets or personal production data in the adoption record.

## Procedure

1. Inspect a bounded checkout. Start with the repository's trusted navigation
   and candidate contracts. Map architecture documents, APIs, tests and code;
   distinguish observed code from a declared roadmap or UI prototype.
2. Collect baseline evidence using reviewed commands in an authorized
   environment. Record command, revision, inputs, environment and outcome.
   A failed install or unavailable service is a gap, not a reason to hide the
   failure. Installation/test hooks from an unknown repository require trusted
   execution policy; do not execute them merely because `AGENTS.md` lists them.
3. Select the obligation inventory and, when in scope, follow GUIDO's separate
   inventory and diagnostic procedure. Keep output outside the target when
   required; record status, rubric revision, reports and review limitations.
   Do not derive a maturity level from the inventory.
4. Extract rules with evidence and epistemic status: observed, desired or
   unknown. A test may document existing behavior without proving that behavior
   satisfies the business requirement. Preserve and report spec/code conflicts.
5. Add the domain layers alongside original technical contracts with explicit
   ownership and links. If `.spectra/` already exists, amend the relevant files;
   do not erase it or replace existing IDs. Reconcile conflicting rules through
   an owned decision instead of silently choosing code or prose as truth.
6. Extend `AGENTS.md` with builder and auditor routes. Generate trace, inspect
   reverse links and significant untagged code, and report gaps. An optional
   `@spectra` annotation is only a relationship declaration.
7. Re-run relevant baseline checks and inspect diffs. For a documentation-only
   adoption, preserve behavior; if annotations change source, verify their
   nonfunctional nature. Tests alone do not establish general equivalence.
   Any intentional behavioral correction has its own requirement, acceptance
   evidence and rollback scope.
8. Submit the adoption record, trace and bounded remediation plan for review.
   Re-evaluate the changed revision with comparable scope; keep original
   evidence. No automatic deployment, data import or silent baseline reset.

## Required result

Baseline and inventory; provenance-linked domain layers; a builder/auditor
entry; static trace; actual baseline receipts or explicit not-run outcomes;
gaps with closure checks; and a reviewed next change. Adoption and diagnostic
status are independent; an accepted knowledge handoff can retain open gaps.

## Family Ledger: bounded illustration

For an existing receipt application, distinguish a text parser, an internal
database-writing service, a UI prototype and a planned inventory service. None
alone proves that an HTTP request persists a purchase or updates stock. A
manual receipt JSON is not a database insertion; SQLite tests are not a
PostgreSQL deployment check. Keep the relevant obligations and gaps explicit.

The [Family Ledger adoption PR](https://github.com/GuiMiran/family-ledger/pull/1)
is a consumer example, not proof of conformance to this newly documented
revision. Its initial local procedure must be mapped to this protocol and
reviewed before reporting conformance. This Spectra change does not modify,
merge, assess or deploy that consumer repository.
