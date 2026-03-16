# Spectra vs the complete specification framework ecosystem

> Honest comparison. Spectra doesn't replace any of these — it takes the best of each and adds what none of them have.

---

## The full map

```
CATEGORY 1 — DOMAIN SPECIFICATION
  Spectra          ← this repo
  DOORS (IBM)      ← enterprise traditional RTM

CATEGORY 2 — SPECIFICATION FOR CODING AGENTS
  OpenSpec         ← Fission AI, 27k⭐
  GitHub Spec Kit  ← GitHub, 2025

CATEGORY 3 — BEHAVIOUR SPECIFICATION
  BDD / Cucumber   ← Behaviour-Driven Development
  Gherkin          ← BDD language

CATEGORY 4 — DECISION RECORDS
  ADR              ← Architecture Decision Records
  MADR             ← Markdown ADR

CATEGORY 5 — SOFTWARE CATALOG
  Backstage        ← Spotify, software catalog

CATEGORY 6 — COMPONENT INVENTORY
  SBOM             ← Software Bill of Materials

CATEGORY 7 — RUNTIME TRACEABILITY
  OpenTelemetry    ← spans, traces, runtime metrics
```

---

## Detailed comparison

### Spectra vs RTM / DOORS

**RTM (Requirements Traceability Matrix)** is the IEEE 829 traceability standard. DOORS is IBM's enterprise implementation.

| Dimension | RTM / DOORS | Spectra |
|---|---|---|
| Origin | IEEE 829, 1998 | 2025 |
| Audience | QA engineers, auditors | AI agents |
| Format | Excel, Word, SaaS tool | Markdown in the repo |
| Updates | Manual by humans | Automatic by the agent |
| Direction | Req → Test (one-way) | Spec ↔ Code (bidirectional) |
| Gap typing | Doesn't exist | FUNCTIONAL vs TECHNICAL |
| Regulations | Referenced externally | Integrated in the spec |
| Cost | DOORS: enterprise license | Free, open source |
| Setup | Weeks | Minutes |
| AI-agent ready | ❌ No | ✅ Designed for it |

**What Spectra takes from RTM**: the bidirectional matrix structure and the concept of traceability as a first-class artifact.

**What Spectra adds**: agentic updates, gap typing, automatic severity, integration with the development cycle.

---

### Spectra vs OpenSpec

**OpenSpec** (Fission AI) manages iterative code evolution with a `/opsx:new → /opsx:ff → /opsx:apply → /opsx:archive` flow.

| Dimension | OpenSpec | Spectra |
|---|---|---|
| Layer | Construction (layer 2) | Domain (layer 1) |
| What it specifies | Code features | Business domain |
| Legal regulations | ❌ No | ✅ Required |
| Invariants | ❌ No | ✅ Boolean, verifiable |
| Full reconstruction | ❌ No | ✅ Yes |
| Requires CLI | ✅ Yes | ❌ Markdown only |
| Manages backlog | ✅ Yes | ❌ No (delegates) |
| Gap detection | ❌ No | ✅ Bidirectional |

**Relationship**: Spectra goes first. The SPECTRA-TRACE Gap Report is the natural input for `/opsx:new`. They are complementary, not competitors.

```
Spectra gap report  →  /opsx:new "implement BR-012"  →  /opsx:ff  →  /opsx:apply
```

---

### Spectra vs GitHub Spec Kit

**GitHub Spec Kit** is the `/specify → /plan → /tasks` flow integrated with Copilot/Claude Code/Gemini inside the GitHub IDE.

| Dimension | GitHub Spec Kit | Spectra |
|---|---|---|
| Layer | Construction (layer 2) | Domain (layer 1) |
| Integration | GitHub + IDE | Agnostic (any LLM) |
| What it generates | Technical plan + tasks | Domain knowledge |
| Regulations | ❌ No | ✅ Yes |
| IDE-independent | ❌ No | ✅ Yes |
| Full reconstruction | ❌ No | ✅ Yes |

**Relationship**: The SPECTRA-TRACE Gap Report can feed directly into `/specify`. Spectra gives it the domain context GitHub Spec Kit doesn't have.

---

### Spectra vs BDD / Cucumber / Gherkin

**BDD (Behaviour-Driven Development)** specifies behaviour in GIVEN/WHEN/THEN format. Cucumber executes it as tests.

| Dimension | BDD / Cucumber | Spectra |
|---|---|---|
| Focus | Testable behaviour | Complete domain |
| Regulations | ❌ No | ✅ Yes |
| Invariants | ❌ No | ✅ Yes |
| Executable as test | ✅ Yes | ❌ Not directly |
| Requires implementation | ✅ Yes (step definitions) | ❌ No |
| AI-oriented | ❌ No | ✅ Yes |
| Covers full domain | Partial (behaviour only) | ✅ Complete |

**What Spectra takes from BDD**: Layer 11 (Acceptance Criteria) uses Gherkin's GIVEN/WHEN/THEN format.

**Key difference**: BDD specifies how the system behaves in concrete situations. Spectra specifies why the system exists, what rules govern it, and what invariants can never be broken. BDD is a subset of what Spectra covers.

```
Spectra Layer 11 (Acceptance Criteria)  ≈  BDD scenarios
Spectra Layers 03-06 (Rules, Invariants, Contracts, Policies)  ≠  Nothing in BDD
```

---

### Spectra vs ADR / MADR

**ADR (Architecture Decision Records)** captures architecture decisions: context, options considered, decision taken, consequences.

| Dimension | ADR / MADR | Spectra |
|---|---|---|
| What it captures | Past decisions | Current state + history |
| Format | Narrative | Structured and machine-readable |
| AI-oriented | ❌ No | ✅ Yes |
| Bidirectional | ❌ No (only past→present) | ✅ Yes |
| Business domain | Partial | ✅ Complete |
| Gap detection | ❌ No | ✅ Yes |

**What Spectra takes from ADR**: the concept of capturing the *why* of decisions, not just the *what*. The notes field in SPECTRA-TRACE includes decision context like ADR does.

**Key difference**: ADR looks backward (why was it decided this way). Spectra looks forward (what's missing to implement) and backward simultaneously.

---

### Spectra vs Backstage

**Backstage** (Spotify) is a developer portal that catalogs software components, owners, documentation and dependencies.

| Dimension | Backstage | Spectra |
|---|---|---|
| What it catalogs | Technical components | Business domain |
| Requires infrastructure | ✅ Server, plugins | ❌ Markdown only |
| Regulations | ❌ No | ✅ Yes |
| Gap detection | ❌ No | ✅ Yes |
| For large teams | ✅ Designed for it | ✅ Also scales |
| AI-agent oriented | ❌ No | ✅ Yes |

**Key difference**: Backstage catalogs what exists. Spectra defines what must exist and detects the difference.

---

### Spectra vs SBOM

**SBOM (Software Bill of Materials)** is a formal inventory of a software system's components. Originates in supply chain security.

| Dimension | SBOM | Spectra |
|---|---|---|
| What it inventories | Dependencies and components | Specs and their implementation |
| Security-oriented | ✅ Yes (CVEs, licenses) | ❌ No |
| Domain-oriented | ❌ No | ✅ Yes |
| Gap detection | ❌ No | ✅ Yes |
| Machine-readable | ✅ SPDX, CycloneDX | ✅ Structured Markdown |

**Borrowed concept**: SPECTRA-TRACE takes SBOM's idea of exhaustive inventory and applies it to the spec↔code relationship instead of dependencies↔vulnerabilities.

---

### Spectra vs OpenTelemetry

**OpenTelemetry** captures traces, metrics and logs from the execution of distributed systems at runtime.

| Dimension | OpenTelemetry | Spectra |
|---|---|---|
| When it acts | Runtime (production) | Design time (before code) |
| What it traces | Calls, latencies, errors | Specs, gaps, decisions |
| AI-oriented | ❌ No | ✅ Yes |
| Regulations | ❌ No | ✅ Yes |

**Borrowed concept**: SPECTRA-TRACE takes the **span** concept from OpenTelemetry — each implementation has typed metadata (which spec it implements, when, in which iteration) — and applies it to design rather than runtime.

---

## Global summary table

| Framework | Layer | Business domain | Regulations | Invariants | Gap detection | AI-native | Updates |
|---|---|---|---|---|---|---|---|
| **Spectra** | Domain | ✅ | ✅ | ✅ | ✅ Bidirectional | ✅ | Agentic |
| OpenSpec | Construction | ❌ | ❌ | ❌ | ❌ | Partial | Agentic |
| GitHub Spec Kit | Construction | ❌ | ❌ | ❌ | ❌ | Partial | Agentic |
| BDD/Cucumber | Behaviour | Partial | ❌ | ❌ | ❌ | ❌ | Manual |
| RTM/DOORS | Traceability | ❌ | Reference | ❌ | Partial | ❌ | Manual |
| ADR/MADR | Decisions | Partial | ❌ | ❌ | ❌ | ❌ | Manual |
| Backstage | Catalog | ❌ | ❌ | ❌ | ❌ | ❌ | Semi-auto |
| SBOM | Inventory | ❌ | ❌ | ❌ | ❌ | ❌ | Auto |
| OpenTelemetry | Runtime | ❌ | ❌ | ❌ | ❌ | ❌ | Auto |

---

## Recommended full stack

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE CODE                                                │
│  Spectra ← domain, regulations, invariants, 13 layers      │
│  ADR     ← architecture decisions that complement          │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  ITERATIVE CONSTRUCTION                                     │
│  OpenSpec / GitHub Spec Kit ← features, tasks, code        │
│  fed by SPECTRA-TRACE.Gap Report                            │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  THE CODE                                                   │
│  BDD/Cucumber  ← behaviour tests                            │
│  SBOM          ← dependency inventory                       │
│  OpenTelemetry ← runtime observability                      │
└─────────────────────────────────────────────────────────────┘
```

Spectra doesn't compete with any of these frameworks. It's the layer that was missing before all of them.
