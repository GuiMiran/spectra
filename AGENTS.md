# SPECTRA Agent Navigation Contract

This repository is designed to be read, changed, validated, and reconstructed by
humans and autonomous agents. Treat this file as the repository entry point.

## Read by task

| If you need to… | Read first | Change only if needed | Verify |
| --- | --- | --- | --- |
| Understand the product | `README.md`, `MANIFESTO.md`, `skills/SKILL.md` | Domain docs and prompts | `npm test` |
| Change a CLI command | `bin/spectra.js` | `lib/`, `test/`, relevant docs | `npm test` and `npm run test:syntax` |
| Change the evolution loop | `docs/architecture/controlled-evolution.md`, `docs/architecture/decisions/0001-controlled-evolution-superagents.md`, `lib/evolution/index.js` | `lib/evolution/`, `evals/`, `test/`, config template | `npm test` |
| Add an evolution capability | `lib/evolution/contracts.js`, `lib/evolution/components.js`, `templates/evolution.config.json` | A bounded component, contract, test, and ADR when the decision is durable | `npm test` |
| Change agent-facing specification guidance | `skills/SKILL.md`, `SPECTRA-PROMPT.md`, `layers/12-trace.md` | Prompt, skill, layer reference, example | `spectra init`, `spectra validate`, `spectra trace` in a temporary project |
| Add user documentation | `docs/README.md` | The appropriate `docs/` subsection and its index | Check all relative links |
| Publish a release | `docs/guides/publishing.md`, `package.json` | Release metadata and release docs | `npm pack --dry-run` |

## Directory contracts

```text
bin/        Stable CLI entry point. Keep it thin: parse arguments and delegate.
lib/        Dependency-free runtime modules. `lib/evolution/` owns the controlled-evolution domain.
test/       Deterministic unit and integration tests for public behaviour.
evals/      Versioned evaluation scenarios and fixtures; not production runtime state.
templates/  Files copied into a consumer project; maintain backward-compatible schemas.
layers/     Canonical SPECTRA layer reference material.
skills/     Agent skill contract for external agent runtimes.
agents/     Ready-to-use agent profile definitions.
docs/       Human and agent documentation, indexed by `docs/README.md`.
examples/   Complete, non-production reference specifications.
```

## Invariants for repository changes

1. Preserve the public CLI commands and the `.spectra/` file formats unless a documented migration is supplied.
2. Keep `bin/` free of domain logic; place reusable behaviour in `lib/` and cover it in `test/`.
3. A mutation to controlled evolution may alter only the approved declarative agent fields. It must never enable network access, credentials, source writes, MCP, pull requests, or re-execution without a separately reviewed adapter and approval boundary.
4. Every durable architectural decision receives an ADR under `docs/architecture/decisions/`.
5. Update navigation and cross-links in the same change whenever a path or ownership boundary changes.
6. Do not treat trace declarations as behavioural evidence. Independent tests remain required.

## Change protocol

1. Find the owning directory using the table above; do not duplicate a concept in a second location.
2. Read the relevant contract and tests before changing code.
3. Make the smallest coherent change, including tests and documentation when the observable behaviour changes.
4. Run the narrowest relevant checks, then `npm test` for runtime changes.
5. If an agent cannot determine the applicable contract or invariant, it must stop and ask rather than invent a rule.

## Reconstruction order

An agent rebuilding SPECTRA from scratch should read, in order:

1. `README.md` and `MANIFESTO.md` for product intent;
2. this file for ownership and constraints;
3. `skills/SKILL.md`, `SPECTRA-PROMPT.md`, and `layers/12-trace.md` for the specification model;
4. `docs/architecture/` and `lib/evolution/` for the controlled-evolution model;
5. `test/` and `evals/` for executable evidence;
6. `templates/` and `examples/` for consumer-facing artefacts.
