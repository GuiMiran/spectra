# Quickstart — Select a route and scaffold domain layers

Start with [the adoption protocol](adoption-protocol.md). Use
[greenfield](adoption-greenfield.md) for a new behavior scope, or
[brownfield](adoption-brownfield.md) when implementation already exists.
Creating files is scaffolding; it does not complete the adoption or prove that
an agent understands every business rule.

## 1. Record the starting point

Name the product, users, behavior scope and exclusions. For an existing project,
freeze the source commit and working-tree delta and inspect original contracts
and tests before proposing changes. For a new project, record the intent
snapshot and independently selected acceptance obligations.

Copy and fill the [adoption record](../../templates/adoption/record.json).
Store it under `.spectra/adoption/record.json`, or link its canonical location.
Keep unknown fields explicit; the template is not a validated assessment.

## 2. Scaffold only when absent

Using a trusted installed Spectra CLI, from your authorized project directory:

```sh
spectra init
```

This creates `.spectra/` with 13 layers, copies the universal prompt and creates
`.instructions.md` if absent. It does not create AGENTS.md, extract existing
behavior or copy adoption templates. If `.spectra/` exists, inspect and update
it instead of deleting it to reinitialize.

The canonical names are:

```text
.spectra/
  00-vision.md
  01-glossary.md
  02-stories.md
  03-business-rules.md
  04-invariants.md
  05-contracts.md
  06-policies.md
  07-events.md
  08-agents.md
  09-skills.md
  10-workflows.md
  11-acceptance-criteria.md
  12-trace.md
```

Legacy `/specs/` technical contracts can remain in place with explicit links
and ownership. Do not create contradictory copies. The current CLI reads the
canonical `.spectra/` paths, including `00-vision.md` rather than `00-index.md`.

## 3. Author and review the domain

Use the universal prompt with reviewed sources. For each rule identify whether
it describes observed behavior, a desired requirement or unknown knowledge.
Give obligations stable IDs, examples, invariants and acceptance criteria.
Keep unsupported generated rules pending. Do not claim completeness or legal
correctness merely because all layers are filled.

## 4. Route builders and auditors

Adapt the [consumer AGENTS.md template](../../templates/adoption/AGENTS.template.md)
to the actual project paths and commands. Extend an existing AGENTS.md rather
than replacing it. Point to relevant domain layers, code, tests, technical
contracts, adoption record and open gaps. An auditor uses it to navigate but
independently verifies its claims under trusted evaluator policy.

## 5. Check structure and link evidence

```sh
spectra validate
spectra trace
```

Validation checks layer presence, identifiers and cross-references. Trace
records declared source/acceptance links; inspect untagged code separately.
Run relevant authorized independent checks, record their inputs, source
revision, environment and actual result, and use `spectra verify` only with
valid recorded acceptance evidence. A trace link is not a passing test.

## 6. Review the handoff and next change

Complete the shared protocol's acceptance checklist, preserve diagnostic
limitations and create a bounded next change. For new projects, implement and
verify the first slice. For existing projects, preserve the baseline while
addressing explicitly specified gaps. Update specs, trace, change history and
evidence together. Deployment and reconstruction remain separately scoped work.

GUIDO's inventory and reviewed repository diagnostic remain separate from
adoption and from an organizational maturity rating; follow the
[evaluation boundary](adoption-protocol.md#evaluation-ownership).
