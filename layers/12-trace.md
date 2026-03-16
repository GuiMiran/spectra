# LAYER 12 — SPECTRA-TRACE
## Bidirectional Agentic Traceability Matrix

> **Purpose**: Live graph of relationships between specs and implementation. Updated automatically at the end of each iteration. Detects functional gaps (spec without code) and technical gaps (code without spec).

---

## Engineering design

### What problem it solves

Traditional traceability systems (RTM, DOORS, Jira) are **manual snapshots**. Someone creates them, nobody updates them, two weeks later they're lies.

SPECTRA-TRACE is different in three ways:

1. **Updated by the agent, not the human** — at the end of each iteration, the agent runs the trace protocol and updates the file
2. **Bidirectional** — not just spec→code but also code→spec
3. **Typed gaps** — not all gaps are equal. An unimplemented invariant is CRITICAL. A low-priority unimplemented story is MINOR.

### Inspiration from existing frameworks

| Framework | What we take | What we discard |
|---|---|---|
| **RTM (IEEE 829)** | Bidirectional matrix structure | Manual process, static |
| **ADR** | Decision records with context | Only captures the past, not current state |
| **Cucumber/BDD** | Spec↔test executable linkage | Coupled to code, not domain |
| **OpenTelemetry** | Typed span concept with metadata | Runtime-oriented, not design |
| **Backstage** | Catalog with ownership and relationships | Too heavy, requires infrastructure |
| **SBOM** | Exhaustive component inventory | Only description, no gaps or state |

SPECTRA-TRACE combines the **RTM structure**, the **OpenTelemetry typing**, and the **agentic update protocol** that none of them have.

---

## File schema `SPECTRA-TRACE.md`

```
SPECTRA-TRACE.md
├── [1] Coverage Dashboard     ← auto-calculated coverage metrics
├── [2] Forward Matrix         ← Spec → Code (detects FUNCTIONAL gaps)
├── [3] Reverse Matrix         ← Code → Spec (detects TECHNICAL gaps)
├── [4] Gap Report             ← actionable summary for the current iteration
├── [5] Iteration Log          ← change history per iteration
└── [6] Agent Protocol         ← instructions for the agent to update
```

---

## [1] Coverage Dashboard

```markdown
## Coverage Dashboard
> Last updated: iter-N · {date} · Agent: {model}

| Metric                     | Value   | Trend     |
|----------------------------|---------|-----------|
| Total specs                | 47      | —         |
| Implemented specs          | 31      | ↑ +4      |
| Functional coverage        | 65.9%   | ↑ +8.5%   |
| Artifacts without spec     | 3       | ↓ -1      |
| CRITICAL gaps              | 2       | ↓ -1      |
| MAJOR gaps                 | 6       | → 0       |
| MINOR gaps                 | 8       | ↑ +2      |
| Current iteration          | iter-5  | —         |
```

**Functional coverage rule**:
```
coverage = implemented_specs / total_specs × 100
```

A spec is "implemented" when it has at least one linked code artifact AND at least one acceptance criterion that validates it.

---

## [2] Forward Matrix — Spec → Code

**Detects FUNCTIONAL gaps**: specs with no implementation.

### Required fields

| Field | Type | Description |
|---|---|---|
| `spec_id` | string | Source spec ID (BR-001, INV-003, US-007...) |
| `spec_type` | enum | `BR` `INV` `US` `POL` `EVT` `SK` `WF` |
| `description` | string | Short spec description |
| `priority` | enum | `MUST` `SHOULD` `COULD` |
| `status` | enum | `✅ IMPL` `⏳ PARTIAL` `❌ PENDING` `🚫 EXCLUDED` |
| `artifacts` | string[] | Files/functions that implement it |
| `tests` | string[] | Acceptance criteria IDs that validate it |
| `gap_severity` | enum | `CRITICAL` `MAJOR` `MINOR` `—` |
| `last_iter` | string | Last iteration that touched it |
| `notes` | string | Decisions, blockers, technical debt |

### Gap severity table

```
CRITICAL  ← INV (invariant) not implemented
           ← BR from legal regulation not implemented
           ← SK (skill) blocking not implemented

MAJOR     ← MUST business BR not implemented
           ← MUST priority US not implemented
           ← Main WF (workflow) not implemented

MINOR     ← SHOULD/COULD BR not implemented
           ← SHOULD/COULD priority US not implemented
           ← POL edge case not implemented
```

### Forward Matrix example

```markdown
## Forward Matrix — Spec → Code

| spec_id | type | description           | prio | status     | artifacts                  | tests  | severity | iter   |
|---------|------|-----------------------|------|------------|----------------------------|--------|----------|--------|
| INV-001 | INV  | total = subtotal + VAT | MUST | ✅ IMPL   | accounting.js:computeFigs  | AC-001 | —        | iter-2 |
| INV-002 | INV  | customer req. invoice  | MUST | ✅ IMPL   | AppContext.jsx              | AC-007 | —        | iter-3 |
| INV-003 | INV  | 3 journal entries/inv  | MUST | ⏳ PARTIAL | accounting.js:genJournal   | —      | CRITICAL | iter-4 |
| BR-001  | BR   | 21% VAT base           | MUST | ✅ IMPL   | accounting.js:VAT_RATE     | AC-002 | —        | iter-2 |
| BR-007  | BR   | FAC-YYYY-NNN sequential| MUST | ✅ IMPL   | invoiceGen.js:genNumber    | AC-011 | —        | iter-3 |
| BR-012  | BR   | 15% IRPF withholding   | MUST | ❌ PENDING | —                          | —      | MAJOR    | —      |
| US-004  | US   | export invoice to PDF  | SHOULD| ⏳ PARTIAL | InvoiceDocument.jsx        | —      | MINOR    | iter-4 |
| POL-003 | POL  | equivalence surcharge  | COULD| 🚫 EXCLUDED| —                          | —      | —        | iter-1 |
```

---

## [3] Reverse Matrix — Code → Spec

**Detects TECHNICAL gaps**: code artifacts with no spec to justify them.

### Required fields

| Field | Type | Description |
|---|---|---|
| `artifact` | string | File or function |
| `type` | enum | `function` `component` `hook` `util` `config` `test` |
| `description` | string | What it does |
| `spec_id` | string[] | Spec IDs that justify it |
| `status` | enum | `✅ TRACED` `⚠️ ORPHAN` `🔍 REVIEW` |
| `action` | enum | `KEEP` `SPECIFY` `DELETE` `REFACTOR` |
| `iter_detected` | string | When the gap was detected |

### Orphan artifact classification

```
⚠️ ORPHAN + DELETE     ← code nobody asked for, adds no value
⚠️ ORPHAN + SPECIFY    ← valid code but missing the spec that justifies it
⚠️ ORPHAN + REFACTOR   ← code that should belong to another spec
🔍 REVIEW              ← ambiguous, requires human decision
```

### Reverse Matrix example

```markdown
## Reverse Matrix — Code → Spec

| artifact                           | type      | description              | specs            | status      | action   | iter   |
|------------------------------------|-----------|--------------------------|------------------|-------------|----------|--------|
| accounting.js:computeInvoiceFigs   | function  | calculates subtotal/vat  | INV-001, BR-001  | ✅ TRACED  | KEEP     | iter-2 |
| invoiceGen.js:renderInvoiceText    | function  | generates WhatsApp text  | US-009           | ✅ TRACED  | KEEP     | iter-3 |
| utils/calculateDiscount.js         | function  | applies volume discounts | —                | ⚠️ ORPHAN  | SPECIFY  | iter-4 |
| hooks/useRetryLogic.js             | hook      | API call retry logic     | —                | ⚠️ ORPHAN  | DELETE   | iter-4 |
| components/DebugPanel.jsx          | component | internal debug panel     | —                | ⚠️ ORPHAN  | DELETE   | iter-3 |
```

---

## [4] Gap Report

Generated automatically at the end of each iteration. This is the actionable output.

```markdown
## Gap Report — iter-5 · 2024-03-15

### 🔴 CRITICAL Gaps (block domain completeness)

GAP-C001 · INV-003 not fully implemented
  Spec: "Every invoice generates exactly 3 balanced journal entries"
  Current state: generateJournalEntries() creates DR 430 but missing CR 700 and CR 477
  Required action: complete the 3 entries in accounting.js
  Impact: system can issue invoices with incorrect accounting

### 🟠 MAJOR Gaps (incomplete business functionality)

GAP-M001 · BR-012 not implemented
  Spec: "15% IRPF withholding on professional invoices"
  Current state: no implementation
  Required action: add withholding logic in invoiceGen.js
  Impact: invoices to professionals are fiscally incorrect

GAP-M002 · US-006 partially implemented
  Spec: "As admin I want to see the monthly VAT ledger"
  Current state: AccountingView shows totals but no monthly breakdown
  Required action: add time filter in DailyClosure.jsx

### 🟡 MINOR Gaps (improvements and edge cases)

GAP-m001 · US-004 partially implemented
  Spec: "export invoice to PDF"
  Current state: renderInvoiceHTML() exists but download button not connected
  Required action: connect button in InvoiceDocument.jsx

### ⚠️ Orphan Artifacts (code without spec)

ORPHAN-001 · utils/calculateDiscount.js
  Detected: iter-4. Nobody has claimed this function.
  Decision required: specify discounts or delete?

ORPHAN-002 · hooks/useRetryLogic.js
  Detected: iter-4. Retry logic with no defined use case.
  Recommendation: DELETE — no spec justifies it

### ✅ Closed in this iteration

CLOSED-001 · INV-002 — customer required for invoicing (was CRITICAL in iter-4)
CLOSED-002 · BR-001 — 21% VAT base amount (was MAJOR in iter-1)
```

---

## [5] Iteration Log

Compressed history. One line per iteration.

```markdown
## Iteration Log

| iter   | date       | specs_impl | coverage | critical_gaps | major_gaps | orphans | note |
|--------|------------|------------|----------|---------------|------------|---------|------|
| iter-1 | 2024-01-10 | 8/47       | 17%      | 5             | 12         | 0       | Initial setup, data models |
| iter-2 | 2024-01-17 | 18/47      | 38%      | 3             | 9          | 0       | Core accounting logic |
| iter-3 | 2024-01-24 | 25/47      | 53%      | 2             | 8          | 1       | Invoice generation |
| iter-4 | 2024-02-01 | 27/47      | 57%      | 3             | 7          | 3       | CobrosView — regression in INV-003 |
| iter-5 | 2024-02-08 | 31/47      | 65%      | 2             | 6          | 2       | INV-002 fix, partial US |
```

**Regression**: when `critical_gaps` increases between iterations, the agent must include a note explaining why (new spec added, refactoring that broke something, etc.)

---

## [6] Agent Protocol — How to update SPECTRA-TRACE

This block is for the agent. Read at the end of each iteration.

```
UPDATE PROTOCOL — SPECTRA-TRACE
Execute at the end of every iteration, before closing the session.

STEP 1 — SCAN SPECS
  For each spec in layers 03 to 11:
    - Search for its ID in the source code
    - Determine status: IMPL / PARTIAL / PENDING
    - Identify artifacts that implement it
    - Link acceptance criteria that validate it

STEP 2 — SCAN CODE
  For each significant artifact (functions, components, hooks, utils):
    - Find which spec_id justifies it
    - If no spec_id: mark as ORPHAN
    - Classify action: SPECIFY / DELETE / REFACTOR

STEP 3 — CALCULATE GAPS
  Forward gaps = specs with PENDING or PARTIAL status
  Reverse gaps = artifacts with ORPHAN status
  Classify severity according to severity table

STEP 4 — UPDATE FILE
  Update [1] Coverage Dashboard with new metrics
  Update [2] Forward Matrix with status changes
  Update [3] Reverse Matrix with new artifacts
  Generate new [4] Gap Report for the iteration
  Add row to [5] Iteration Log

STEP 5 — REPORT TO HUMAN
  End-of-iteration report format:

  "Iteration {N} complete.
   Coverage: {X}% ({+/-Y}% vs previous iter)
   Critical gaps: {N} ({+/-M})
   Next recommended priority: {GAP-ID} — {description}"

PROTOCOL RULES:
  - Never mark IMPL without a linked artifact
  - Never mark IMPL without a linked acceptance criterion
  - Always document regressions (new gap that was previously IMPL)
  - Orphans are never deleted automatically — marked and reported
  - 🚫 EXCLUDED specs are never touched — they are explicit scope decisions
```

---

## Integration with the rest of Spectra

```
Layer 03 (BR) ─────────────────┐
Layer 04 (INV) ────────────────┤
Layer 02 (US) ─────────────────┤──→ SPECTRA-TRACE.Forward Matrix
Layer 06 (POL) ────────────────┤       ↕ bidirectional
Layer 09 (SK) ─────────────────┘
                                    SPECTRA-TRACE.Reverse Matrix
Source code ───────────────────────────────────────────────────→

SPECTRA-TRACE.Gap Report ──→ next iteration of OpenSpec/GitHub Spec Kit
```

SPECTRA-TRACE is the bridge between static specs (layers 00-11) and iterative construction tools (OpenSpec, GitHub Spec Kit). The Gap Report is the natural input for `/opsx:new` or `/specify`.

---

## Key difference vs traditional RTM

| | Traditional RTM | SPECTRA-TRACE |
|---|---|---|
| **Who updates it** | Human (QA/PM) | Agent autonomously |
| **When updated** | When someone remembers | End of every iteration |
| **Direction** | One-way (req→test) | Bidirectional (spec↔code) |
| **Gap typing** | Doesn't exist | FUNCTIONAL vs TECHNICAL |
| **Severity** | Manual or nonexistent | Automatic by spec type |
| **History** | Snapshot | Iteration log |
| **Actionable** | Not directly | Gap Report → next iteration |
| **Format** | Excel/Word/SaaS tool | Markdown in the repo |
