# Spectra vs the AI spec ecosystem

> **TL;DR**: Spectra, OpenSpec and GitHub Spec Kit don't compete. They are different layers of the same stack. Spectra goes first.

---

## The full stack

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1 · DOMAIN                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  SPECTRA                                    │   │
│  │  What the system IS                         │   │
│  │  Rules · Invariants · Regulations · Domain  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↓  specs feed the agent
┌─────────────────────────────────────────────────────┐
│  LAYER 2 · CONSTRUCTION                             │
│  ┌──────────────────┐   ┌──────────────────────┐   │
│  │  OpenSpec        │   │  GitHub Spec Kit      │   │
│  │  How code        │   │  /specify → /plan     │   │
│  │  evolves         │   │  → /tasks → build     │   │
│  └──────────────────┘   └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↓  agent builds
┌─────────────────────────────────────────────────────┐
│  LAYER 3 · CODE                                     │
│  Your application                                   │
└─────────────────────────────────────────────────────┘
```

Without Spectra in layer 1, the agent in layer 2 guesses the domain. With Spectra, it knows it.

---

## Detailed comparison

### What does each tool specify?

| | Spectra | OpenSpec | GitHub Spec Kit |
|---|---|---|---|
| **Business rules** | ✅ With regulatory source | ❌ | ❌ |
| **Boolean invariants** | ✅ | ❌ | ❌ |
| **Legal regulations** | ✅ Required | ❌ | ❌ |
| **Domain glossary** | ✅ | ❌ | ❌ |
| **Operation contracts** | ✅ Pre/post conditions | ❌ | Partial |
| **Agents and skills** | ✅ | ❌ | ❌ |
| **Technical features** | ❌ (not its layer) | ✅ | ✅ |
| **Code tasks** | ❌ (not its layer) | ✅ | ✅ |
| **Full reconstruction** | ✅ | ❌ | ❌ |
| **Bidirectional traceability** | ✅ SPECTRA-TRACE | ❌ | ❌ |

### How does each one work?

**Spectra**
```
1. Fill SPECTRA-PROMPT.md with your domain
2. LLM generates the 13 layers (pure Markdown)
3. Specs live in your repo as source of truth
4. Agent consumes them as context every session
5. When a rule changes → update the spec
```

**OpenSpec**
```
1. /opsx:new   → creates folder for the change
2. /opsx:ff    → generates proposal.md + specs/ + design.md + tasks.md
3. /opsx:apply → agent implements the tasks
4. /opsx:archive → merges into main spec
```

**GitHub Spec Kit**
```
1. /specify  → generates technical spec for the feature
2. /plan     → produces implementation plan
3. /tasks    → derives actionable task list
4. Agent (Copilot/Claude Code/Gemini) implements
```

### What problem does each solve?

| | Problem it solves |
|---|---|
| **Spectra** | *"The agent doesn't know my domain, guesses business rules and applicable regulations"* |
| **OpenSpec** | *"The agent loses context between changes and can't maintain coherence across features"* |
| **GitHub Spec Kit** | *"I don't know how to go from an idea to concrete tasks the agent can execute"* |

Three different problems. All three are real.

---

## Why Spectra goes first

OpenSpec and GitHub Spec Kit are construction tools. They need to know what to build.

When an agent generates a feature with OpenSpec or GitHub Spec Kit, it implicitly makes business decisions: what validations to apply, what states are possible, what fiscal rules to respect, what flows are legal. Without Spectra, the agent makes those decisions alone — and makes them wrong, or inconsistently, or ignoring regulations.

With Spectra as context, the agent executing OpenSpec or GitHub Spec Kit already knows the domain. Its implementation decisions are correct because the business constraints are explicit.

```
Without Spectra:
/opsx:new "add invoicing"
→ agent invents how invoicing works

With Spectra:
/opsx:new "add invoicing"
→ agent knows invoice = subtotal + 21% VAT,
  requires mandatory customerId,
  generates 3 accounting journal entries,
  sequential number FAC-YYYY-NNN
```

---

## The reconstruction argument

This is the most important difference, and the least obvious.

Every time you open a new session with an agent, the agent starts from scratch. It doesn't remember the previous session. It doesn't know what decisions were made three weeks ago. It doesn't know the exceptions that "everyone knows".

OpenSpec and GitHub Spec Kit manage the history of changes — what was added, modified, planned. But they don't capture the *why* behind business rules, the regulations that justify them, the invariants that can never be broken.

Spectra captures exactly that. It's the context that doesn't change between sessions.

```
Reconstruction test:

1. Delete all the code
2. Open a new agent session
3. Give it only the Spectra specs
4. Ask it to reconstruct the system

If it can: specs are complete.
If it can't: there's knowledge living outside the specs.
```

OpenSpec and GitHub Spec Kit don't pass this test. They're not designed to. Spectra is.

---

## When to use what

**Spectra only** — when you're in domain design phase, before writing a single line of code. When you need to align the team on business rules. When you want any agent to pick up the project without a briefing.

**Spectra + OpenSpec** — for ongoing projects with frequent changes. Spectra as permanent domain layer, OpenSpec to manage code evolution.

**Spectra + GitHub Spec Kit** — if you use the GitHub/Copilot ecosystem. Spectra as domain context, GitHub Spec Kit for the /specify → /plan → /tasks flow.

**All three** — full stack for complex projects with regulated domain, distributed team, and multiple agents.

---

## What Spectra doesn't try to be

Spectra doesn't replace OpenSpec or GitHub Spec Kit. It doesn't manage feature history, doesn't generate code tasks, doesn't integrate with your IDE.

Spectra does one thing: give the agent the domain knowledge it needs for all the other tools to work correctly.

**Specs are not documentation. Specs are the system.**
