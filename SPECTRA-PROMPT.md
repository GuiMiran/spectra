# UNIVERSAL PROMPT — Spec-Driven Development for Agentic AI

> **Instructions**: Copy this prompt, fill in the variables between `{{curly braces}}` and send it to the AI.
> Everything between `{{...}}` is what YOU define for your project.

---

## START OF PROMPT

---

Act as an expert **Specification Architect** in Spec-Driven Development (SDD). Your mission is to generate the complete, exhaustive, and agentic-AI-consumable specification for the following project. **Do not generate code or technical architecture**. Only functional specifications, rules, invariants, and definitions that an agentic AI can use as a source of truth to build the system.

---

### BLOCK 1 — PROJECT CONTEXT

```
Project name:        {{PROJECT_NAME}}
Product type:        {{PRODUCT_TYPE}}
                     (e.g. SaaS, Mobile App, Web Platform, API, Marketplace, ERP...)
Sector / Industry:   {{SECTOR}}
                     (e.g. Healthcare, Retail, Finance, Education, Hospitality, Legal...)
Country / Jurisdiction: {{COUNTRY}}
                     (e.g. Spain, Mexico, USA, EU multi-country...)
Applicable regulations: {{REGULATIONS}}
                     (e.g. "Spanish VAT Law, Invoicing Regulation RD 1619/2012,
                      GDPR, VeriFactu, Crea y Crece Law"...)
Business model:      {{BUSINESS_MODEL}}
                     (e.g. Monthly subscription, Freemium, Pay-per-use, License...)
```

---

### BLOCK 2 — PRODUCT DESCRIPTION

```
What does the product do?
{{PRODUCT_DESCRIPTION}}
(Describe in natural language what problem it solves and for whom.
 e.g. "Comprehensive management platform for Spanish SMEs and freelancers
 that enables invoicing, expense tracking, tax calculation and
 submission of tax returns to the AEAT.")

Who are the users?
{{USERS}}
(List user types / roles.
 e.g. "Freelancer, SME Administrator, External Accountant, Employee, Auditor")

What are the main modules?
{{MODULES}}
(List the functional areas.
 e.g. "Invoicing, Clients/Suppliers, Products/Services, Expenses,
 Treasury, Taxes, Accounting, Payroll, Inventory, Reporting")
```

---

### BLOCK 3 — KNOWN RULES AND CONSTRAINTS

```
Business rules I already know:
{{KNOWN_RULES}}
(List any rules you already know apply.
 e.g. "Standard VAT 21%, reduced 10%, super-reduced 4%.
 Invoices must be sequential with no gaps.
 Credit notes must reference the original invoice.
 Standard professional IRPF withholding at 15%.")

Regulatory constraints:
{{REGULATORY_CONSTRAINTS}}
(e.g. "Mandatory e-invoicing from 2026 under Crea y Crece Law.
 Invoice retention minimum 4 years.
 Operations over €3,005.06 must be reported via form 347.")

Required external integrations:
{{INTEGRATIONS}}
(e.g. "AEAT (Electronic Office), VIES (intra-EU VAT validation),
 Banks (statements), Payment gateway, Email")
```

---

### BLOCK 4 — WHAT I NEED YOU TO GENERATE

Generate the complete specification organized in the following **13 layers**, each in its own file/section:

#### LAYER 00 — VISION & CONTEXT (`00-vision/`)
- Product purpose
- Problem it solves
- Target users and their needs
- Functional scope (what's included and what's NOT)
- Applicable regulatory framework (executive summary)

#### LAYER 01 — DOMAIN GLOSSARY (`01-glossary/`)
- Dictionary of all business terms
- Each term with: **Name**, **Unambiguous definition**, **Example**, **Synonyms to avoid**
- Organized by context (fiscal, commercial, accounting, legal...)
- This glossary is the canonical language: the entire spec uses these terms

#### LAYER 02 — USER STORIES (`02-stories/`)
- Format: `AS A [role] I WANT [action] SO THAT [benefit]`
- Grouped by functional module
- Each story with: **Unique ID**, **Priority** (Must/Should/Could), **Acceptance criteria in GIVEN/WHEN/THEN format**
- Include stories for main flows AND alternative/error flows

#### LAYER 03 — BUSINESS RULES (`03-business-rules/`)
- Format: `BR-XXX: [Rule description]`
- Each rule with: **ID**, **Description**, **Normative source** (law, article, industry practice), **Examples**, **Exceptions**
- Group by domain: Fiscal, Invoicing, Commercial, Labour, Accounting...
- **Include ALL rules derived from applicable regulations**

#### LAYER 04 — INVARIANTS (`04-invariants/`)
- Conditions that MUST ALWAYS be true at any system state
- Format: `INV-XXX: [boolean condition in natural language]`
- Examples: "Invoice total always = sum of lines + taxes - withholdings"
- If an invariant is violated, the system is in a corrupt state

#### LAYER 05 — OPERATION CONTRACTS (`05-contracts/`)
- For each important system operation:
  - **Preconditions**: what must be true BEFORE executing
  - **Postconditions**: what must be true AFTER executing
  - **Errors**: what happens if it fails
- Format: `OPERATION: [name]` / `PRE: [conditions]` / `POST: [conditions]` / `ERROR: [cases]`

#### LAYER 06 — DECISION POLICIES (`06-policies/`)
- Conditional IF/THEN decision rules
- Decision tables for complex logic (e.g. which VAT rate to apply based on product + territory + client)
- Format: `POL-XXX: IF [condition] THEN [action] ELSE [alternative]`
- Include complete decision trees for fiscal flows

#### LAYER 07 — DOMAIN EVENTS (`07-events/`)
- Significant facts that occur in the system
- Format: `EVT-XXX: [EventName] → TRIGGERS: [reactions]`
- What each event produces and its consequences
- Example: "InvoiceIssued → record in VAT ledger + update client balance + generate PDF"

#### LAYER 08 — AGENTS (`08-agents/`)
- Autonomous AI actors operating on the domain
- Each agent with: **Name**, **Responsibility** (what it manages), **Skills it uses**, **Events it listens to**, **Events it produces**, **Invariants it must respect**
- Agents are NOT technical: they are autonomous functional roles
- Example: "InvoicingAgent → responsible for creating, validating and issuing invoices"

#### LAYER 09 — SKILLS (`09-skills/`)
- Atomic and invocable capabilities
- Each skill with: **Name**, **Description**, **Input**, **Output**, **Business rules it applies**, **Invariants it verifies**
- They are the "lego pieces" that agents combine
- Example: "calculate_vat → input: amount + product_type + territory → output: VAT breakdown"

#### LAYER 10 — WORKFLOWS (`10-workflows/`)
- Workflows that orchestrate agents and skills
- Each workflow with: **Name**, **Trigger** (what initiates it), **Ordered steps**, **Agents involved**, **Skills invoked per step**, **Expected result**, **Error handling**
- Example: "Quarterly Close Workflow → step 1: AccountingAgent.skill:balance_accounts → step 2: TaxAgent.skill:calculate_form_303..."

#### LAYER 11 — ACCEPTANCE CRITERIA (`11-acceptance-criteria/`)
- Functional tests expressed in natural language
- GIVEN/WHEN/THEN format
- Linked to: Stories (US-XXX), Rules (BR-XXX), Invariants (INV-XXX)
- Cover: happy path, expected errors, edge cases, fiscal combinations

#### LAYER 12 — SPECTRA-TRACE (`12-trace/`)
- Bidirectional agentic traceability matrix
- Forward (Spec → Code): functional gap detection
- Reverse (Code → Spec): technical gap detection
- Updated by the agent at the end of every iteration
- See `layers/12-trace.md` for the full contract

#### MASTER INDEX (`SPEC-INDEX.md`)
- Navigable map of the entire specification
- Cross-references between layers (which rule affects which story, which skill which agent...)
- Naming and format conventions
- Instructions for the agentic AI on how to consume the specs

---

### BLOCK 5 — FORMAT AND QUALITY INSTRUCTIONS

```
Output format:       Structured Markdown, one file per layer
Language:            {{LANGUAGE}} (e.g. "English", "Spanish")
Detail level:        Exhaustive — every rule, every case, every exception
Language style:      Functional, business-oriented. NO technical or programming jargon
Unique IDs:          Every element must have a unique traceable ID
                     (US-001, BR-001, INV-001, POL-001, EVT-001, AG-001, SK-001, WF-001)
Cross-references:    Each skill must reference the rules it applies.
                     Each agent must reference the skills it uses.
                     Each workflow must reference agents and skills.
                     Each acceptance criterion must reference stories and rules.
Regulatory coverage: {{REGULATORY_COVERAGE}}
                     (e.g. "Include ALL applicable Spanish tax regulations
                     for SMEs and freelancers: VAT, IRPF, IS, e-invoicing,
                     tax returns, SII, VeriFactu, GDPR")
```

---

### BLOCK 6 — ADDITIONAL CONTEXT (OPTIONAL)

```
Competitors / References: {{COMPETITORS}}
                          (e.g. "Holded, Quipu, Contasol, Sage, A3")

Differentiation:          {{DIFFERENTIATION}}
                          (e.g. "AI that automates tax filing and
                          predicts cash flow")

Scope constraints:        {{SCOPE_CONSTRAINTS}}
                          (e.g. "Spain mainland only in phase 1.
                          Canary Islands (IGIC) / Ceuta & Melilla (IPSI) in phase 2")

Additional information:   {{ADDITIONAL_INFO}}
                          (Any other relevant data: reference documents,
                          current manual processes to digitize, etc.)
```

---

## END OF PROMPT

---
