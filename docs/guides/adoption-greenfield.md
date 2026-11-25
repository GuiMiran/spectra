# Greenfield adoption

Use [spectra-adoption 1.0.0](adoption-protocol.md) when the selected scope has no
implementation. A repository need not exist yet: start with a versioned intent
snapshot, then record the initial repository revision when it is created.

## Inputs

Name the problem, users, behavior boundary, mandatory obligations, exceptions,
jurisdiction and trusted sources, owners and constraints. Unknown legal or
business rules remain questions; generated text is not an authoritative source.
Define acceptance examples independently from any future implementation.

## Procedure

1. Create a draft adoption record from the [template](../../templates/adoption/record.json).
   Set mode to `greenfield`. Keep the implementation commit null until it exists;
   identify the reviewed intent snapshot separately.
2. Use `spectra init` in the selected project only if `.spectra/` is absent.
   Fill the domain layers using reviewed intent and the universal prompt. Mark
   requirements desired; do not label them observed implementation.
3. Define contracts, invariants and acceptance criteria for the first bounded
   vertical slice, including negative and failure paths. Record unknowns and
   blockers rather than authoring a fictional complete business domain.
4. Adapt the [AGENTS template](../../templates/adoption/AGENTS.template.md) with
   real paths and task routes. Keep framework internals separate from product
   instructions. The auditor route may use the file as a map, never as proof.
5. Validate layers and generate trace. Missing implementation and evidence are
   expected gaps; do not add dummy source tags or fabricated PASS records to
   improve the dashboard.
6. Review the handoff and the first implementation plan under existing task
   authorization. Build only within its scope, run independent acceptance
   checks and link actual receipts to the candidate revision. Update trace and
   change history after each iteration.

## Required result

A scoped, reviewed intent and obligation inventory; the domain layers; explicit
unknowns; an agent entry; declared trace gaps; and a next slice with acceptance
and recovery criteria. Diagnostic implementation dimensions and reconstruction
remain `NOT_EVALUATED` / `NOT_TESTED` until supported by actual work.

The existing CLI scaffolds and checks structure. It does not build the
application or automatically conduct the GUIDO diagnostic. Follow the shared
protocol's acceptance checklist and evaluation ownership boundary.
