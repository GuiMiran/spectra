# ADR-0009 — Controlled evolution of the Mother prompt

## Status

Accepted for the local evaluator, authorized host adapter, and scheduled trigger.

## Context

The Mother loop evolves bounded declarative agent definitions. Its operating
instructions can also be revised after failures, but a prompt that changes
its own policy or judges its own answer would make promotion circular.
The existing specialist score counts some placeholder checks and cannot
establish that a new prompt improves product outcomes.

## Decision

Provide `PromptEvolutionRunner` as an opt-in component beside the existing
Mother loop. The candidate contains **instructions only**. Trusted governance,
promotion policy, test suite and invocation adapter are supplied separately
by the host. The host must place governance in a higher-priority context and
keep heldout expected answers outside candidate access.

The runner invokes the active baseline and candidate with the same pinned
model identifier, tool hash and token budget on each frozen known/heldout
case. An evaluator owned by this module compares their structured responses
to suite expectations, requires a minimum improvement, rejects critical
failures and heldout regressions, and ignores self-reported scores. Missing
responses reject the run without changing the active version.

Promotions occur only when a trusted policy explicitly sets `autoPromote`.
Otherwise a passing candidate remains a proposal. The active pointer changes
only after evaluation and is loaded on the next invocation. Prompt versions
and decisions are recorded in a SHA-256 audit chain; state and version bytes
are checked against that chain before use. A trusted host can roll back to a
previously active version with an audited reason.

## Boundary

SPECTRA ships a narrow host adapter client and a scheduled GitHub Actions
trigger, not direct provider credentials or a self-authorizing evaluator. The
trusted host still owns isolation, authorization, heldout secrecy, endpoint
policy, and cost ceilings. In-process evaluation alone cannot guarantee that a
compromised host has protected heldout cases or kept governance at higher
priority. No candidate may modify governance, policy or suite.

## Consequences

This establishes a testable prompt-registry mechanism, an explicit host
contract, a recurring trigger, and a minimal approved adapter shape. It does
not claim autonomous model training, independent research, product maturity or
production release. Real deployments still need an approved evaluator-owned
endpoint, protected cases, and reviewed execution telemetry.
