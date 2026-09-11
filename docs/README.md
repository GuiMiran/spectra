# Documentation

Start with the section that matches the job. Repository-wide agent navigation
and change rules are in [`../AGENTS.md`](../AGENTS.md).

## Architecture

- [Architecture index](architecture/README.md)
- [Controlled Evolution](architecture/controlled-evolution.md)
- [Architecture decisions](architecture/decisions/)

## Guides

- [Evidence and read-only planning](guides/evidence-and-read-only-planning.md) - record executed evidence and prepare a bounded agent-planning artifact.

- [Quickstart](guides/quickstart.md) — create a complete `/specs` folder from scratch.
- [Agent visibility](guides/agent-visibility.md) — expose Spectra instructions to agent runtimes.
- [OpenSpec integration](guides/openspec-integration.md)
- [npm availability](guides/npm-availability.md)
- [Publishing](guides/publishing.md)
- [Variable reference](guides/variable-reference.md)

## Reference and reports

- [Framework comparison](reference/framework-comparison.md)
- [OpenSpec comparison](reference/openspec-comparison.md)
- [GastroFlow demo and results](https://github.com/GuiMiran/GastroFlow)
- [Distribution summary](reports/distribution-summary.md)
- [Spectra report](reports/spectra-report.md)

## Planning

- [Product backlog](planning/product-backlog.md) — evidence-first roadmap for the product and delivery pipeline.
- [Ecosystem backlog](planning/ecosystem-backlog.md) — future cross-repository work and completed delivery history.

## GUIDO ecosystem

- [Ecosystem index](ecosystem/README.md)
- [Responsibility map](ecosystem/RESPONSIBILITY-MAP.md)
- [Component contracts](ecosystem/COMPONENT-CONTRACTS.md)
- [Agent architecture](ecosystem/AGENT-ARCHITECTURE.md)
- [Autonomy model](ecosystem/AUTONOMY-MODEL.md)
- [Canonical multi-root workspace policy](ecosystem/WORKSPACE-POLICY.md)
- [Security remediation plan](ecosystem/SECURITY-REMEDIATION-PLAN.md)

## Prompts and templates

- [Universal prompt](prompts/universal.md) — generate SPECTRA specifications for any domain.
- [Prompt maestro (ES)](prompts/maestro-es.md) — expand Spanish business rules into the full specification set.
- [Business configuration](templates/negocio.md) — template for `config/negocio.md`.

## Website assets

- [Landing page](website/index.html)
- [Spanish business catalogue](website/catalogo-sdd-negocios-espana.html)

The builder-agent profile lives in [`../agents/spectra.chatAgent`](../agents/spectra.chatAgent).
The repository-level SPECTRA matrix and verification harness live in [`../harness/`](../harness/).
