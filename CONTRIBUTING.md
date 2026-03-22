# Contributing to Spectra

> This document is written for both humans and AI agents.
> If you are an AI agent reading this — follow these instructions directly.

---

## Who can contribute

- **Humans**: developers, architects, QA engineers, domain experts
- **AI agents**: any agent with Spectra skill loaded and a GitHub integration
- **Both together**: the preferred mode — human defines intent, agent generates layers

---

## What contributions are welcome

| Type | Description | Priority |
|------|-------------|----------|
| New examples | Complete 13-layer specs for real domains | ⭐ High |
| Layer improvements | Refinements to existing layer formats | ⭐ High |
| New domain templates | Starter specs for specific industries (healthcare, legal, finance...) | ⭐ High |
| SPECTRA-TRACE tooling | Scripts/actions that automate trace matrix updates | ⭐ High |
| Translations | README and MANIFESTO in new languages | Medium |
| Bug reports | Contradictions, ambiguities, or gaps in the framework | Medium |
| Skill improvements | Refinements to SKILL.md for better agent consumption | Medium |

---

## Contribution rules — these are Spectra invariants for the repo itself

```
INV-C01: Every contribution MUST include or update the relevant spec layers.
         Code without spec = rejected.

INV-C02: Every new example MUST be reconstructable from specs alone.
         Test: give specs to a fresh agent with zero context. Can it rebuild? If not — incomplete.

INV-C03: Every ID in a contribution MUST be unique across the entire repo.
         Check existing IDs before assigning new ones.

INV-C04: No technical implementation details in spec layers.
         No table names, endpoints, framework names, or design patterns.

INV-C05: The Domain Glossary (Layer 01) MUST define every term used in all other layers.
         No term used before it is defined.
```

---

## How to contribute — step by step

### For humans

1. **Fork** the repository
2. **Choose** what you want to contribute (see table above)
3. **If adding an example**: fill `SPECTRA-PROMPT.md` for your domain, paste into any LLM, save the 13 layers under `examples/your-project/`
4. **If improving a layer format**: edit the relevant file, update `SPEC-INDEX.md` if needed
5. **Run the validator** (see below) before opening a PR
6. **Open a Pull Request** with:
   - Title: `[TYPE] Short description` (e.g. `[EXAMPLE] Healthcare appointment booking`)
   - Description: what domain/problem this covers and why it's useful
   - Checklist (see below)

### For AI agents

```
AGENT CONTRIBUTION PROTOCOL:

1. Load SKILL.md from https://github.com/GuiMiran/spectra
2. Read MANIFESTO.md — internalize the 7 principles
3. Read CONTRIBUTING.md (this file) — internalize INV-C01 to INV-C05
4. Identify the contribution type (example / layer / template / tooling)
5. Generate content following all 13 layers in order
6. Self-validate against INV-C01 to INV-C05 before any commit
7. Run spectra-validate.yml (GitHub Action) — fix all errors before PR
8. Open PR with structured description:
   CONTRIBUTION TYPE: [type]
   DOMAIN: [domain covered]
   LAYERS INCLUDED: [list of layers generated]
   RECONSTRUCTABILITY TEST: [PASSED / NEEDS REVIEW]
   INVARIANTS VERIFIED: INV-C01 ✓ | INV-C02 ✓ | INV-C03 ✓ | INV-C04 ✓ | INV-C05 ✓
```

---

## Pull Request checklist

Before opening a PR, verify every item:

- [ ] `INV-C01` — All new content has corresponding spec layers
- [ ] `INV-C02` — Example passes reconstructability test (if applicable)
- [ ] `INV-C03` — All IDs are unique (no duplicates across the repo)
- [ ] `INV-C04` — No technical implementation in spec layers
- [ ] `INV-C05` — All terms used are defined in Layer 01 Glossary
- [ ] GitHub Action `spectra-validate` passes with zero errors
- [ ] SPECTRA-TRACE updated (if modifying an existing example)
- [ ] `SPEC-INDEX.md` updated (if adding new layers or examples)

---

## Directory structure for new examples

```
examples/
└── your-project-name/
    ├── 00-vision.md
    ├── 01-glossary.md
    ├── 02-stories.md
    ├── 03-business-rules.md
    ├── 04-invariants.md
    ├── 05-contracts.md
    ├── 06-policies.md
    ├── 07-events.md
    ├── 08-agents.md
    ├── 09-skills.md
    ├── 10-workflows.md
    ├── 11-acceptance-criteria.md
    ├── 12-trace.md
    └── SPEC-INDEX.md
```

All 13 layers are required. No exceptions.

---

## ID conventions for new examples

To avoid ID collisions across examples, prefix all IDs with your project code:

```
Project: healthcare-appointments → prefix: HA
  US-HA-001, BR-HA-001, INV-HA-001, SK-HA-001 ...

Project: ecommerce-returns → prefix: ER
  US-ER-001, BR-ER-001, INV-ER-001 ...
```

Core framework IDs (no prefix) are reserved for the framework itself.

---

## Questions and discussions

- **GitHub Issues**: for bugs, contradictions, or framework questions
- **GitHub Discussions**: for new ideas, domain questions, "how would I spec X"
- **Pull Requests**: for actual contributions

---

## License

By contributing, you agree that your contributions are licensed under MIT —
the same license as Spectra.

---

*Spectra grows through specs, not code. Every contribution that adds domain knowledge*
*to the framework makes every AI agent that uses Spectra smarter.*

*SPECTRA — Source · Product · Exhaustive · Contractual · Truth · Reconstructable · Agentic*
*https://github.com/GuiMiran/spectra*
