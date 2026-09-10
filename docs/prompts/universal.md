# UNIVERSAL PROMPT — Spec-Driven Development for Agentic AI

> **Instructions**: Copy this prompt, fill in the variables between `{{curly braces}}` and send it to the AI.
> Everything between `{{...}}` is what YOU define for your project.
> The AI will generate all 13 spec files ready to drop into your `/specs` folder.

---

## START OF PROMPT

---

Act as an expert **Specification Architect** in Spec-Driven Development (SDD). Your mission is to generate the complete, exhaustive, and agentic-AI-consumable specification for the following project.

**Absolute rules:**
- Do NOT generate code or technical architecture
- Do NOT make assumptions — ask if something is ambiguous
- DO generate functional specifications, rules, invariants and definitions
- DO use the domain language of the sector (define it in Layer 01 first)

---

### BLOCK 1 — PROJECT CONTEXT

```
Project name:           {{PROJECT_NAME}}
Product type:           {{PRODUCT_TYPE}}
                        (e.g. SaaS, Mobile App, Web Platform, API, Marketplace, ERP...)
Sector / Industry:      {{SECTOR}}
                        (e.g. Healthcare, Retail, Finance, Education, Hospitality, Legal...)
Country / Jurisdiction: {{COUNTRY}}
                        (e.g. Spain, Mexico, USA, EU multi-country...)
Applicable regulations: {{REGULATIONS}}
                        (e.g. "Spanish VAT Law, Invoicing Regulation RD 1619/2012,
                         GDPR, VeriFactu, Crea y Crece Law"...)
Business model:         {{BUSINESS_MODEL}}
                        (e.g. Monthly subscription, Freemium, Pay-per-use, License...)
Output language:        {{LANGUAGE}}
                        (e.g. English, Spanish)
```

---

### BLOCK 2 — PRODUCT DESCRIPTION

```
What does the product do?
{{PRODUCT_DESCRIPTION}}
(Describe in natural language what problem it solves and for whom.)

Who are the users?
{{USERS}}
(List user types / roles with their main responsibility and what they CANNOT do.
 e.g. "Cashier: processes sales and payments. Cannot modify prices or void old tickets.")

What are the main modules?
{{MODULES}}
(List the functional areas, one per line.
 e.g. "1. Point of Sale — counter sales, receipts, cash
       2. Stock — inventory, alerts, suppliers
       3. Delivery — online orders, dispatch, tracking")
```

---

### BLOCK 3 — KNOWN RULES AND CONSTRAINTS

```
Business rules I already know:
{{KNOWN_RULES}}
(List every rule you know applies. The more you provide, the better the specs.
 Include: formulas, limits, deadlines, restrictions, rates, types...)

Regulatory constraints:
{{REGULATORY_CONSTRAINTS}}
(Reporting obligations, audit requirements, data retention, licensing...)

Required external integrations:
{{INTEGRATIONS}}
(Systems this product must connect to. Describe functionally, not technically.
 e.g. "Tax authority: validate invoices · Bank: import statements")
```

---

### BLOCK 4 — DOMAIN ENTITIES AND FLOWS

> This block dramatically improves spec quality. Fill it as completely as possible.

```
Main domain entities:
{{ENTITIES}}
(The "objects" the system manages. For each:
 ENTITY: name — what it is — key fields — possible states
 e.g.
 ORDER: a customer purchase — id, items, total, status — draft|confirmed|paid|invoiced
 PRODUCT: item in catalog — id, name, price, stock — active|inactive|out_of_stock)

Main business flows:
{{FLOWS}}
(The 3–5 most important processes, step by step as they happen today.
 e.g.
 FLOW: Sale at counter
   1. Cashier scans product
   2. System checks stock
   3. Customer pays
   4. System prints receipt and deducts stock)

State machines:
{{STATE_MACHINES}}
(For each entity with a lifecycle:
 STATE_A --[action]--> STATE_B
 e.g.
 ORDER: draft --[confirm]--> confirmed --[pay]--> paid --[invoice]--> invoiced)
```

---

### BLOCK 5 — COMPLEX DECISION RULES

```
{{DECISION_RULES}}
(The most complex rules the system must apply automatically.
 Use tables where multiple conditions interact.
 e.g.
 TABLE: Which VAT rate applies?
 | Product type        | Customer type | VAT  |
 |---------------------|---------------|------|
 | Basic food          | Any           | 4%   |
 | Non-basic food      | Any           | 10%  |
 | Alcoholic beverages | Any           | 21%  |)
```

---

### BLOCK 6 — WHAT I NEED YOU TO GENERATE

Generate the complete specification as **13 separate files**, each fully populated.
Output them in order, one at a time, starting with `00-index.md`.

Each file must begin with:
```
# [filename] — [project name]
> Generated with SPECTRA · github.com/GuiMiran/spectra
```

---

#### FILE: /specs/00-index.md
Dispatch table: for each possible agent task, which files to load.
Include at minimum:
- Build system from scratch
- Add a new module
- Debug a business logic error
- Verify the app is complete
- Implement a specific workflow

#### FILE: /specs/01-glossary.md
Canonical domain dictionary. For each term:
- Name
- Unambiguous definition
- Concrete example
- Synonyms to avoid

Minimum 15 terms from the sector.

#### FILE: /specs/02-stories.md
User stories: `AS A [role] I WANT [action] SO THAT [benefit]`
For each story:
- Unique ID (US-001, US-002...)
- Priority: Must / Should / Could
- Acceptance criteria: GIVEN / WHEN / THEN

Cover all roles and modules. Include error flows. Minimum 15 stories.

#### FILE: /specs/03-business-rules.md
All rules in format:
**BR-XXX**: [description]
- Normative source: [law/regulation/industry practice]
- Example: [concrete case]
- Exception: [if any]

Group by domain: Fiscal · Invoicing · Operational · Legal.
Include ALL applicable regulations for the sector and country.

#### FILE: /specs/04-invariants.md
Conditions that MUST ALWAYS be true. If violated, the system is corrupt.

**INV-XXX**: [condition in natural language]
- Type: Business | Technical | Architectural
- If violated: [consequence]
- Verified by: [SK-XXX or WF-XXX]

Minimum 10 invariants. These are the agent's hard limits.

#### FILE: /specs/05-contracts.md
For each critical operation:
```
OPERATION: [name]
PRE:     [what must be true before]
POST:    [what must be true after]
ERROR:   [what happens if it fails]
REVERTS: [what is undone on error]
```
Cover the 5–8 most important operations.

#### FILE: /specs/06-policies.md
Decision rules and tables.

**POL-XXX**: IF [condition] THEN [action] ELSE [alternative]

Include complete tables for:
- Tax/VAT rates by product/service type
- Permissions by user role
- Alternative flows based on entity state
- Pricing and discounts if applicable

#### FILE: /specs/07-events.md
Significant domain facts and their chain reactions.

**EVT-XXX**: [EventName]
- Trigger: [what causes it]
- Triggers: [list of reactions]
- Notifies: [roles that must be informed]
- Records in: [where it's logged]

Minimum 8 events.

#### FILE: /specs/08-agents.md
Autonomous functional actors (NOT technical components).

**AG-XXX**: [AgentName]
- Responsibility: [domain it manages]
- Skills it uses: [SK-XXX, SK-XXX]
- Events it listens to: [EVT-XXX]
- Events it produces: [EVT-XXX]
- Invariants it must respect: [INV-XXX]

#### FILE: /specs/09-skills.md
Atomic invocable capabilities — the lego pieces.

**SK-XXX**: [skill_name]
- Description: [what it does in one sentence]
- Input: [parameters with type]
- Output: [result with type]
- Rules it applies: [BR-XXX, BR-XXX]
- Invariants it verifies: [INV-XXX]
- Used by: [AG-XXX]

Minimum 8 skills.

#### FILE: /specs/10-workflows.md
Complete end-to-end business flows.

**WF-XXX**: [WorkflowName]
- Trigger: [what initiates it]
- Agents involved: [AG-XXX]
- Ordered steps: [numbered, with skill invoked at each]
- Expected result: [postcondition]
- Error handling: [what happens if each step fails]

Cover all flows defined in Block 4.

#### FILE: /specs/11-acceptance-criteria.md
Functional tests in natural language.

**AC-XXX**: [test name]
- Linked story: US-XXX
- Linked rule: BR-XXX
- Linked invariant: INV-XXX
- GIVEN [initial context]
- WHEN [action executed]
- THEN [expected result]

Cover: happy path, expected errors, edge cases, regulatory combinations.
Minimum 15 criteria.

#### FILE: /specs/12-trace.md — SPECTRA-TRACE
Bidirectional traceability matrix.

**Forward table (Spec → Code)** — functional gap detection:
| Spec ID | Description | Expected module | Status |
|---------|-------------|-----------------|--------|
| US-001  | ...         | ...             | Pending |

**Reverse table (Code → Spec)** — technical gap detection:
Empty initially. The builder agent fills this during construction.

**Update protocol**: The agent updates this file at the end of every iteration.

#### FILE: /specs/SPEC-INDEX.md
Master navigable index:
- Full cross-reference map (which BR affects which US, which SK uses which AG...)
- Naming conventions
- Format conventions
- Instructions for the builder agent on how to consume these specs

---

### BLOCK 7 — QUALITY CHECKLIST

Before delivering, verify every file against this checklist:

```
IDs and references:
- [ ] All IDs are unique and have no gaps in sequence
- [ ] Every SK references its BR and INV
- [ ] Every WF references its AG and SK
- [ ] Every AC references its US, BR and INV
- [ ] SPEC-INDEX.md maps all cross-references correctly

Content completeness:
- [ ] Invariants cover all critical business cases
- [ ] All sector regulations are complete in 03-business-rules.md
- [ ] All user roles have stories in 02-stories.md
- [ ] All flows from Block 4 are formalized in 10-workflows.md
- [ ] All decision tables from Block 5 are in 06-policies.md

Agent readability:
- [ ] 00-index.md lets any agent navigate to the right file for any task
- [ ] No technical jargon — pure business language throughout
- [ ] Every invariant states what happens if violated
- [ ] Every operation contract has an ERROR and REVERTS clause
```

---

### BLOCK 8 — ADDITIONAL CONTEXT (OPTIONAL)

```
Competitors / References: {{COMPETITORS}}
                          (Similar systems that exist today)

Key differentiation:      {{DIFFERENTIATION}}
                          (What this system does that others don't)

Scope constraints:        {{SCOPE_CONSTRAINTS}}
                          (What is explicitly OUT of scope for phase 1)

Additional information:   {{ADDITIONAL_INFO}}
                          (Reference documents, current manual processes,
                          screenshots, anything else relevant)
```

---

## END OF PROMPT

---

> **Before sending**: verify all `{{variables}}` are filled or removed.
> A prompt with empty variables produces generic specs. A prompt with
> detailed Block 3, Block 4 and Block 5 produces production-ready specs.
