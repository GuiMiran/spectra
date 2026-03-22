---
name: spectra
version: 1.0.0
author: Guido Miranda (GuiMiran)
repository: https://github.com/GuiMiran/spectra
category: agentic-specification
compatible_with: [claude, chatgpt, gpt-4o, codex, gemini]
tags:
  - spec-driven-development
  - sdd
  - agentic-ai
  - domain-specs
  - ai-agents
  - invariants
  - spectra-trace
  - reconstructable
  - qa-engineering
description: >
  Spectra is the agentic specification framework. Domain-first specs that AI
  can consume directly. It is the knowledge infrastructure an agent needs to
  operate alone in a complex domain — before any code is written.
  S·P·E·C·T·R·A: Source · Product · Exhaustive · Contractual · Truth · Reconstructable · Agentic
---

# SPECTRA Skill

> **The specification framework designed to be consumed by AI, not humans.**

Spectra is NOT documentation. NOT a README. NOT code comments.
Spectra is the **domain source of truth**: business rules, invariants, contracts,
regulations, decisions — structured in 13 layers so an agent can operate autonomously.

```
You define the domain → Spectra structures the specs → AI builds, maintains and evolves the system
```

Spectra goes BEFORE everything else:

```
Spectra (domain)  →  OpenSpec / GitHub Spec Kit (construction)  →  Code
```

---

## The 7 principles — if something violates one, it is not Spectra

| Letter | Principle | Meaning |
|--------|-----------|---------|
| **S** | Source | Specs are the source. Code is the derivative. Lose the code, lose nothing essential. Lose the specs, lose everything. |
| **P** | Product | Business domain, not technical architecture. No table names, endpoints or React components in specs. |
| **E** | Exhaustive | Every rule, every edge case, every exception. An incomplete spec is worse than no spec. |
| **C** | Contractual | Preconditions, postconditions, boolean invariants. Not narratives — contracts. |
| **T** | Truth | One single source of truth. No contradictions. Unique IDs make everything traceable. |
| **R** | Reconstructable | The complete system must be reconstructable from specs alone, agent in empty context. |
| **A** | Agentic | Designed to be consumed by AI, not humans. Nothing implicit. Everything explicit. |

**The reconstructability test**: give specs to an agent in empty context, no existing code,
no conversation history. Can it rebuild the system identically? If yes — specs are complete.

---

## When to activate this skill

Activate Spectra when the user:
- Starts a new project, feature, module, or API
- Says "generate specs", "write specs", "define the behaviour of X"
- Wants to work in SDD (Spec-Driven Development) mode
- Asks an agent to build something non-trivial
- Needs to document business rules, invariants, or regulations
- Wants to ensure an AI agent can work autonomously without constant correction
- Asks to review, evolve, or update existing specs
- Mentions SPECTRA-TRACE, gap detection, or traceability

---

## The 13 layers of a Spectra specification

```
Static layers — define the domain
──────────────────────────────────────────────────────────────
00 · Vision & Context         ← what it is, who it's for, scope
01 · Domain Glossary          ← canonical language, one definition per term
02 · User Stories             ← AS A / I WANT / SO THAT
03 · Business Rules           ← every rule with regulatory source
04 · Invariants               ← always-true boolean conditions
05 · Operation Contracts      ← pre/postconditions per operation
06 · Decision Policies        ← IF/THEN decision trees and tables
07 · Domain Events            ← facts that occur and their consequences
08 · Agents                   ← autonomous AI actors in the domain
09 · Skills                   ← atomic invocable capabilities
10 · Workflows                ← agent and skill orchestration
11 · Acceptance Criteria      ← GIVEN/WHEN/THEN in natural language
──────────────────────────────────────────────────────────────
Live layer — updated by the agent every iteration
──────────────────────────────────────────────────────────────
12 · SPECTRA-TRACE            ← bidirectional traceability matrix
```

### Layer 00 — Vision & Context
Product purpose, problem solved, target users, functional scope (what IS and what is NOT
included), applicable regulatory framework summary.

### Layer 01 — Domain Glossary
Dictionary of all business terms. Each entry: Name · Unambiguous definition · Example ·
Synonyms to avoid. This glossary IS the canonical language — all layers use these exact terms.

### Layer 02 — User Stories
Format: `US-XXX: AS A [role] I WANT [action] SO THAT [benefit]`
Each story: unique ID · Priority (Must/Should/Could) · Acceptance criteria GIVEN/WHEN/THEN.
Include main flows AND alternative/error flows.

### Layer 03 — Business Rules
Format: `BR-XXX: [Rule description]`
Each rule: ID · Description · Normative source (law, article, regulation) · Examples · Exceptions.
Include ALL rules derived from applicable regulations — even "obvious" ones.

### Layer 04 — Invariants
Conditions that MUST ALWAYS be true at any system state.
Format: `INV-XXX: [boolean condition in natural language]`
Example: `INV-001: Invoice total ALWAYS equals sum of lines + taxes - withholdings`
If an invariant is violated → the system is in a corrupt state.

### Layer 05 — Operation Contracts
```
OPERATION: [name]
PRE:   [what must be true before executing]
POST:  [what must be true after executing]
ERROR: [what happens if it fails]
```

### Layer 06 — Decision Policies
Format: `POL-XXX: IF [condition] THEN [action] ELSE [alternative]`
Decision tables for complex logic. Complete decision trees for fiscal and business flows.

### Layer 07 — Domain Events
Format: `EVT-XXX: [EventName] → TRIGGERS: [list of reactions]`
Example: `EVT-012: InvoiceIssued → record VAT ledger + update client balance + generate PDF`

### Layer 08 — Agents
Autonomous AI actors operating on the domain.
Each agent: Name · Responsibility · Skills it uses (SK-XXX) ·
Events it listens to (EVT-XXX) · Events it produces · Invariants it must respect (INV-XXX).

### Layer 09 — Skills
Atomic, invocable capabilities. The lego pieces that agents combine.
Each skill: Name · Description · Input · Output ·
Business Rules applied (BR-XXX refs) · Invariants verified (INV-XXX refs).

### Layer 10 — Workflows
Orchestrations of agents and skills.
Each workflow: Name · Trigger · Ordered steps · Agents · Skills per step ·
Expected result · Error handling.

### Layer 11 — Acceptance Criteria
GIVEN/WHEN/THEN format. Linked to: US-XXX · BR-XXX · INV-XXX.
Cover: happy path · expected errors · edge cases · regulatory combinations.

### Layer 12 — SPECTRA-TRACE (KEY INNOVATION)
The bidirectional traceability matrix. The living layer. Updated by the agent every iteration.

**Forward direction (Spec → Code)** — detects FUNCTIONAL GAPS:
specs that exist but have no corresponding code implementation.

**Reverse direction (Code → Spec)** — detects TECHNICAL GAPS:
code that exists but has no business rule justifying it (orphaned code).

```
SPECTRA-TRACE FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITERATION: [n] | DATE: [date] | AGENT: [agent name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORWARD MATRIX (Spec → Code)
  [US-001] → [module/component] : COVERED ✓ | PARTIAL ⚠ | MISSING ✗
  [BR-003] → [function/service] : COVERED ✓ | PARTIAL ⚠ | MISSING ✗
  [INV-002] → [validation]      : COVERED ✓ | PARTIAL ⚠ | MISSING ✗

REVERSE MATRIX (Code → Spec)
  [module/function] → [BR-XXX or US-XXX] : TRACED ✓ | ORPHAN ✗

FUNCTIONAL GAPS (forward MISSING): [count]
TECHNICAL GAPS  (reverse ORPHAN):  [count]
COVERAGE SCORE:                    [0-100%]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Unique ID system — the nervous system of Spectra

| Layer | ID Format | Example |
|-------|-----------|---------|
| User Stories | US-XXX | US-042 |
| Business Rules | BR-XXX | BR-015 |
| Invariants | INV-XXX | INV-003 |
| Operation Contracts | OP-XXX | OP-008 |
| Decision Policies | POL-XXX | POL-021 |
| Domain Events | EVT-XXX | EVT-007 |
| Agents | AG-XXX | AG-002 |
| Skills | SK-XXX | SK-011 |
| Workflows | WF-XXX | WF-004 |
| Acceptance Criteria | AC-XXX | AC-088 |

Cross-reference rule: every element that depends on another MUST cite its ID.
Example: `SK-007 applies: BR-015, BR-016 / verifies: INV-003, INV-004`

---

## How to generate a complete Spectra specification

### Step 1 — Collect the 6 information blocks from the user

```
BLOCK 1 — Project context
  Project name · product type · sector/industry
  country/jurisdiction · applicable regulations · business model

BLOCK 2 — Product description
  What does it do? (problem + solution in natural language)
  Who are the users? (roles list)
  What are the main modules?

BLOCK 3 — Known rules and constraints
  Business rules already known
  Regulatory constraints (laws, compliance)
  Required external integrations

BLOCK 4 — What to generate
  All 13 layers (always all of them)

BLOCK 5 — Format instructions
  Language · detail level (always: exhaustive)
  unique ID format · cross-reference requirements

BLOCK 6 — Optional context
  Competitors/references · differentiation · scope constraints
```

### Step 2 — Generate layer by layer in order

Generate: 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11
Layer 12 (SPECTRA-TRACE) initializes empty, populated by agent during iteration.

**Critical constraint**: do NOT generate code or technical architecture.
No table names, endpoints, frameworks, or design patterns in specs.

### Step 3 — Self-validate before output

- [ ] Every element has a unique ID in correct format
- [ ] No element describes HOW — only WHAT the system must do
- [ ] Every Invariant is boolean (true or false, zero ambiguity)
- [ ] Every Business Rule has a normative source cited
- [ ] Every Skill references the BR-XXX rules it applies
- [ ] Every Agent references the SK-XXX skills it uses
- [ ] Every Acceptance Criterion links to US-XXX, BR-XXX, or INV-XXX
- [ ] Glossary covers every domain term used across all layers

### Step 4 — Generate SPEC-INDEX.md

Navigable master index: cross-reference map · naming conventions ·
instructions for any AI agent on how to consume these specs.

---

## Autonomous agent operation protocol

### Before building anything
1. Read Layer 00 — understand scope
2. Read Layer 01 — adopt the canonical vocabulary
3. Read Layer 04 — internalize all invariants as hard constraints
4. Read Layer 03 — understand all business rules

### During each iteration
1. Identify the US-XXX story being implemented
2. Find all BR-XXX rules linked to that story
3. Find all INV-XXX invariants that apply
4. Find SK-XXX skills and AG-XXX agents involved
5. Check POL-XXX decision policies for conditional logic
6. Verify AC-XXX acceptance criteria before completing

### After each iteration — mandatory SPECTRA-TRACE update
1. Update Layer 12 with all changes (forward + reverse matrix)
2. Recalculate gap counts and coverage score
3. Flag any MISSING or ORPHAN items for human review
4. If coverage < 80% → alert before proceeding

### Self-maintenance protocol (for evolving systems)
When the agent detects a requirement change:
1. Identify which spec elements are affected (via ID cross-references)
2. Update the relevant layers before touching any code
3. Update SPECTRA-TRACE to reflect all changes
4. Flag all downstream elements that depend on the changed spec
5. Propose spec version increment (v1.0 → v1.1 → v2.0)
6. Rule: specs are ALWAYS updated before code. Never the reverse.

---

## What Spectra is NOT

- NOT a code linter — it does not analyze code quality
- NOT a code generator — it gives agents the context to generate correct code
- NOT technical documentation — architecture and infrastructure go elsewhere
- NOT BDD/TDD — acceptance criteria are business behaviour, not software tests
- NOT a development process — works with Agile, Shape Up, waterfall, or anything else

---

## Comparison with other frameworks

| | Traditional docs | BDD/Cucumber | OpenSpec | **Spectra** |
|---|---|---|---|---|
| **Audience** | Humans | Developers | Coding agents | Domain agents |
| **Describes** | How it works | Behaviour tests | How code evolves | **What the system IS** |
| **Regulations** | Rarely | ❌ | ❌ | ✅ Required |
| **Boolean invariants** | ❌ | ❌ | ❌ | ✅ |
| **Full reconstruction** | ❌ | ❌ | ❌ | ✅ |
| **Bidirectional trace** | ❌ | ❌ | ❌ | ✅ SPECTRA-TRACE |
| **Layer position** | After code | After code | After code | **Before code** |
| **Gap detection** | ❌ | ❌ | ❌ | ✅ Bidirectional |

---

## Quick reference — phrases that trigger Spectra

| User says | Action |
|-----------|--------|
| "generate specs for X" | Full 13-layer generation |
| "write the spec for this feature" | L02 + L03 + L04 + L11 |
| "what invariants apply here" | Query Layer 04 |
| "define business rules for X" | Generate Layer 03 section |
| "update the trace" | Update Layer 12 SPECTRA-TRACE |
| "detect gaps" | Forward + reverse trace analysis |
| "is the system reconstructable" | Reconstructability check across all 13 layers |
| "what does [term] mean" | Query Layer 01 Glossary |
| "the regulation changed" | Update BR-XXX → flag dependents → update TRACE |

---

## Core rules for any AI agent using this skill

1. **Specs before code. Always.** No code without specs existing first.
2. **The glossary is law.** Every term must be in Layer 01. No informal synonyms.
3. **Invariants are inviolable.** An INV-XXX violation means stop and flag immediately.
4. **SPECTRA-TRACE is accountability.** Update it every iteration without exception.
5. **When in doubt — specify, don't assume.** Over-specifying costs zero. Under-specifying produces bugs.
6. **Reconstructability is the test.** A spec is complete when another agent with zero context can rebuild the system from it.

---

## Resources

- Repository: https://github.com/GuiMiran/spectra
- Universal Prompt: https://github.com/GuiMiran/spectra/blob/main/SPECTRA-PROMPT.md
- Manifesto (7 principles): https://github.com/GuiMiran/spectra/blob/main/MANIFESTO.md
- Real example (GastroFlow): https://github.com/GuiMiran/spectra/tree/main/examples/gastroflow
- vs other frameworks: https://github.com/GuiMiran/spectra/blob/main/vs-frameworks.md

---

*Spectra was built with AI, describes how to build with AI, and is the manual AI uses*
*to maintain itself. That recursion is not accidental — it's the point.*

*SPECTRA — Source · Product · Exhaustive · Contractual · Truth · Reconstructable · Agentic*
*Created by Guido Florentino · MIT License · https://github.com/GuiMiran/spectra*
