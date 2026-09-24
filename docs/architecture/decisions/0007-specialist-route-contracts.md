# ADR-0007: Recorded specialist routes in Mother runs

- Status: Accepted for declarative routing
- Date: 2026-09-24

## Context

The Mother loop consumes normalized gaps, plans specialists and records a
GUIDO repository inventory when supplied. Reviewers need to see which fixed
contract handles each handoff, and whether an external auditor actually ran.

## Decision

Record a frozen, versioned `routePlan` in every evolution run. It names three
fixed routes: `sdd-auditor` accepts a supplied report, `gap-analyzer` records
the existing normalized gaps, and `qa-planner` records the existing pipeline
and specialist assignments. Every route declares its accepted inputs, outputs,
mode, state and empty effects list. The run-start audit event commits to the
plan's SHA-256 digest.

The plan reflects components already executed by the Mother. Its `planned`
planner status describes a plan, not tasks performed by specialists. Supplying
an auditor report records evidence availability, not an auditor invocation or
proof of repository maturity. Route contracts cannot be selected or modified
from the objective or supplied evidence.

## Consequences

- `spectra evolve --json` and `run.json` expose the same reviewable routes.
- The CLI summarizes the three statuses; the existing registry audit chain
  records the route-plan digest.
- Invocation of external agents requires a separate, reviewed adapter and
  independent evaluation before it can change state or permissions.
