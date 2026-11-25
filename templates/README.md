# Spectra templates

The CLI `spectra init` generates the 13 domain layers directly in `.spectra/`;
it does not copy per-layer template files from this directory.

## Opt-in adoption handoff

- [Adoption record](adoption/record.json) — authoring template for protocol revision,
  scope, baseline, claims, evidence, diagnostic status and review.
- [Consumer AGENTS.md](adoption/AGENTS.template.md) — adapt routes for builders
  and auditors; preserve existing project instructions.

Follow [spectra-adoption 1.0.0](../docs/guides/adoption-protocol.md) and its
new/existing-project route. These files are copied manually; no automatic
adoption command, schema validation or qualitative evaluation is implied.

## Recorded evidence and bounded planning

- `evidence.json` records results from checks already executed.
- `agent-task.json` defines the goal, acceptance and read limits.
- `agent-context.json` contains reviewed excerpts the planner can inspect.
- `evolution.config.json` configures the opt-in controlled-evolution loop.

The evidence and planning templates are not copied automatically by
`spectra init`. Consult the relevant guides before populating them; an example
PASS record is not evidence that a consumer's checks passed.
