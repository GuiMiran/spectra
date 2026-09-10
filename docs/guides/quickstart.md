# Quickstart — From zero to /specs in 15 minutes

> This guide documents the exact steps to go from a blank repo
> to a fully populated `/specs` folder ready for an agentic builder.

---

## What you need

- A code editor with an AI agent (VS Code + Gemini Code Assist, GitHub Copilot, Claude Code...)
- Access to an LLM (Claude, GPT-4o, Gemini...)
- A blank repo (or an existing project without specs)

---

## Step 1 — Get the spec for your business type

Open the SPECTRA catalogue and find your business sector:

**Option A — Spanish business (fastest)**
Use the interactive catalogue at the SPECTRA repo examples.
Click "Generate specs" for your business type.
Download the generated `.md` file.

**Option B — Any business / any country**
Open `SPECTRA-PROMPT.md` from this repo.
Fill in all `{{variables}}` for your project (Blocks 1–5).
The more you fill in Blocks 3, 4 and 5, the better the specs.

---

## Step 2 — Set up your repo structure

Create this folder structure in your project:

```bash
mkdir specs
mkdir config
```

Your repo should look like:

```
your-project/
├── .claude/
│   └── agents/
│       └── spectra.agent.md    ← agent definition (Step 4)
├── specs/                      ← 13 spec files will go here (Step 3)
└── config/
    └── negocio.md              ← specific business data (Step 5)
```

Place the `.md` from Step 1 inside `/specs/` as a starting point.

---

## Step 3 — Generate the 13 spec files

Open your LLM (Claude, GPT-4o, Gemini) and send this prompt:

```
Read the attached file. Using the SPECTRA framework
(github.com/GuiMiran/spectra), generate the 13 spec files
for the /specs folder:

00-index.md, 01-glossary.md, 02-stories.md,
03-business-rules.md, 04-invariants.md, 05-contracts.md,
06-policies.md, 07-events.md, 08-agents.md, 09-skills.md,
10-workflows.md, 11-acceptance-criteria.md, 12-trace.md

Rules:
- No code, only functional specs in business language
- Real regulations for the country/sector in 03-business-rules.md
- Unique IDs with cross-references between files
- Generate each file in order, starting with 00-index.md
```

Attach the `.md` from Step 1.

Save each generated file into your `/specs/` folder.

---

## Step 4 — Set up the builder agent

Copy the agent definition from this repo:

```
.claude/agents/spectra.agent.md
```

Place it in the same path in your project.

This agent will:
- Read `/specs/00-index.md` before every task
- Read `/specs/04-invariants.md` as hard limits
- Trace every piece of code back to a spec
- Refuse requests that violate invariants
- Update `/specs/12-trace.md` after each iteration

---

## Step 5 — Add your specific business data

Create `config/negocio.md` with the data specific to this
business instance — not the sector rules (those are in `/specs/`),
but the concrete details: name, owner, hours, services, prices.

```markdown
# config/negocio.md

nombre: Your Business Name
propietario: Owner Name
horario: Mon-Sat 9:00-20:00
servicios:
  - nombre: Service 1
    precio: 00€
# ... add what's relevant for your business type
notas:
  - Any specific rules that override the generic sector specs
```

The specs define HOW a barbershop works.
`negocio.md` defines WHO this specific barbershop is.

---

## Step 6 — Launch the agent

Open the AI chat in your editor with the SPECTRA agent selected.
Send this first prompt:

```
Read specs/00-index.md and config/negocio.md.

Build the complete system respecting all invariants
in specs/04-invariants.md.

Start with the folder structure and data models.
No code until the structure is confirmed.
```

The agent reads the specs, understands the full domain,
and builds without asking business questions.

---

## The full picture

```
CATALOGUE / SPECTRA-PROMPT.md
  ↓ describes the business type
LLM (Claude, GPT-4o, Gemini)
  ↓ generates 13 spec files
/specs/  ←  source of truth
  +
config/negocio.md  ←  this specific business
  ↓ agent reads both
BUILDER AGENT (in your IDE)
  ↓ builds autonomously
Your application
```

---

## What the specs give the agent

Without specs the agent guesses business rules, ignores
regulations, and needs correction at every step.

With SPECTRA specs the agent:
- Knows every business rule before writing a line
- Knows what it can never do (invariants)
- Knows the real business flows (workflows)
- Can fully reconstruct the system if something breaks
- Updates the traceability matrix automatically

---

## Troubleshooting

**Agent ignores the specs**
Make sure the agent definition file is in `.claude/agents/`
and the agent is selected in the chat.

**Specs are too generic**
Go back to `SPECTRA-PROMPT.md` and fill in Blocks 3, 4 and 5
with more detail — especially known business rules and
real workflows step by step.

**Agent asks business questions**
Good — it means something is missing from the specs.
Add it to the relevant spec file and continue.

**IDs are inconsistent between files**
Ask the LLM to regenerate `specs/SPEC-INDEX.md` with
a full cross-reference map.

---

## Resources

- Framework: https://github.com/GuiMiran/spectra
- Manifesto: https://github.com/GuiMiran/spectra/blob/main/MANIFESTO.md
- Layer contracts: https://github.com/GuiMiran/spectra/tree/main/layers
- Examples: https://github.com/GuiMiran/spectra/tree/main/examples
