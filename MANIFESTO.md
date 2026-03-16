# SPECTRA MANIFESTO

> The 7 principles of the framework. If something violates one of these principles, it's not Spectra.

---

## S · Source
### Specs are the source. Code is the derivative.

Code gets generated, deleted, rewritten. Specs remain.

If you lose the code but keep the specs, you lose nothing essential. If you lose the specs but keep the code, you've lost the knowledge that makes that code meaningful.

In Spectra, specs live in the repo as first-class citizens — not in Notion, not in Confluence, not in someone's head. They are versionable, reviewable, mergeable.

> **Practical consequence**: before touching code, update the spec. Always.

---

## P · Product
### The business domain, not the technical architecture.

Spectra doesn't describe how the system is built. It describes what the system is.

A Spectra spec contains no table names, endpoints, React components, or design patterns. It contains business rules, invariants, user flows, applicable regulations, domain glossary.

Technical architecture is an implementation decision. Business domain is a truth about the real world.

> **Practical consequence**: any developer, in any stack, should be able to build the same system by reading only the specs.

---

## E · Exhaustive
### Every rule, every edge case, every exception.

An incomplete spec is worse than no spec. The agent fills the gaps with assumptions — and assumptions are the origin of all business bugs.

Specifying exhaustively means including: the exceptions "everyone knows", the edge cases that "never happen", the regulations that "are obvious", the implicit rules living in the founder's head.

If it's not written, it doesn't exist for the agent.

> **Practical consequence**: when in doubt whether to include something, include it. The cost of over-specifying is zero. The cost of under-specifying is an agent that guesses.

---

## C · Contractual
### Preconditions, postconditions, boolean invariants.

Spectra specs are not narratives. They are contracts.

Every important operation has preconditions (what must be true before), postconditions (what must be true after), and error cases (what happens on failure). Every invariant is a boolean condition — true or false, no ambiguity.

Natural language is for the glossary. Rules are precise.

> **Practical consequence**: if a rule can't be expressed as a verifiable condition, it's not sufficiently defined. Go back to the domain and clarify.

---

## T · Truth
### One single source of truth. No contradictions.

In a Spectra system there is exactly one definition of each concept, exactly one version of each rule, exactly one place to look when there's a question.

Contradictions between layers are not writing errors — they are symptoms that the domain isn't resolved. Spectra makes them visible because everything is cross-referenced.

An agent with two contradictory sources of truth makes arbitrary decisions. An agent with a single source of truth makes correct decisions.

> **Practical consequence**: unique IDs (RN-001, INV-003, SK-007) are not bureaucracy. They are the nervous system that makes every decision traceable.

---

## R · Reconstructable
### The complete system must be reconstructable by reading only the specs.

This is the definitive test of a Spectra spec: give the specs to an agent in an empty context. No existing code, no additional explanations, no conversation history. Can it reconstruct the system identically?

If yes: the specs are complete.
If no: there's implicit knowledge still living outside the specs.

Reconstructability is not an exotic use case. It's day-to-day: new agent, new context, new session. It happens constantly.

> **Practical consequence**: write specs as if the reader has zero prior context. Because the agent doesn't.

---

## A · Agentic
### Designed to be consumed by AI, not by humans.

Traditional specs are written for a human to understand and then do something. Spectra specs are written for an AI to read and act directly.

This changes everything: the format, the required precision, the structure, the IDs, the cross-references. A human can infer, contextualize, ask questions. An agent can't — it needs everything to be explicit.

An agent that knows the complete domain through the specs can make autonomous correct decisions. Without specs, it guesses. With incomplete specs, it partially guesses. With Spectra specs, it operates.

> **Practical consequence**: if reading a spec you think "this is obvious, no need to write it" — write it. For the agent, nothing is obvious.

---

## The 7 principles in one sentence

> Specs are the source of the system, describe the business domain exhaustively and contractually, constitute a single truth from which the system is reconstructable, and are designed to be consumed directly by AI agents.

---

## What Spectra is not

**Not a code linter.** It doesn't analyze your code or tell you if it's well written.

**Not a code generator.** Spectra doesn't generate code — it gives the agent the context for the code it generates to be correct.

**Not technical documentation.** Architecture diagrams, database schemas, infrastructure decisions go elsewhere.

**Not BDD/TDD.** Spectra's acceptance criteria describe business behaviour, not software tests. They are the source of tests, not the tests themselves.

**Not a development process.** Spectra is process-agnostic. It works with Agile, Shape Up, waterfall, or "let's see what happens".

---

## What Spectra is

It's the knowledge infrastructure an agent needs to operate alone in a complex domain.

It's the artifact that makes "implement this change" work without you explaining the context every time.

It's the difference between an agent that executes and an agent that understands.

---

*SPECTRA — Source Product Exhaustive Contractual Truth Reconstructable Agentic*
