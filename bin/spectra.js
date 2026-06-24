#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const R  = '\x1b[0m';
const B  = '\x1b[1m';
const CY = '\x1b[36m';
const WH = '\x1b[97m';
const YL = '\x1b[33m';
const GR = '\x1b[32m';
const MG = '\x1b[35m';
const DM = '\x1b[90m';

const bd = (col, t) => `${B}${col}${t}${R}`;
const c  = (col, t) => `${col}${t}${R}`;
const p  = (l = '') => process.stdout.write(l + '\n');

// ── SPECTRA-INIT ──────────────────────────────────────────────────────────────
function cmdInit() {
  p();
  p(bd(CY, '  Initializing Spectra...'));
  p();

  const spectraDir = path.join(process.cwd(), '.spectra');

  if (fs.existsSync(spectraDir)) {
    p(c(YL, '  ⚠  .spectra/ already exists in this directory.'));
    p(c(DM, '     Remove it first if you want to re-initialize.'));
    p();
    process.exit(1);
  }

  fs.mkdirSync(spectraDir, { recursive: true });

  const layers = [
    ['00', 'vision',               'Vision & Context'],
    ['01', 'glossary',             'Domain Glossary'],
    ['02', 'stories',              'User Stories'],
    ['03', 'business-rules',       'Business Rules'],
    ['04', 'invariants',           'Invariants'],
    ['05', 'contracts',            'Operation Contracts'],
    ['06', 'policies',             'Decision Policies'],
    ['07', 'events',               'Domain Events'],
    ['08', 'agents',               'Agents'],
    ['09', 'skills',               'Skills'],
    ['10', 'workflows',            'Workflows'],
    ['11', 'acceptance-criteria',  'Acceptance Criteria'],
    ['12', 'trace',                'SPECTRA-TRACE'],
  ];

  layers.forEach(([num, slug, name]) => {
    const file = path.join(spectraDir, `${num}-${slug}.md`);
    const content = num === '12' ? generateTrace() : generateLayer(num, name);
    fs.writeFileSync(file, content);
    p(`  ${c(DM, num + ' ·')} ${num === '12' ? bd(MG, name) : c(WH, name)}`);
  });

  // Copy SPECTRA-PROMPT.md if bundled with the package
  const promptSrc  = path.join(__dirname, '..', 'SPECTRA-PROMPT.md');
  const promptDest = path.join(process.cwd(), 'SPECTRA-PROMPT.md');
  if (fs.existsSync(promptSrc) && !fs.existsSync(promptDest)) {
    fs.copyFileSync(promptSrc, promptDest);
  }

  // Create .instructions.md so AI agents pick up Spectra automatically
  const instrDest = path.join(process.cwd(), '.instructions.md');
  if (!fs.existsSync(instrDest)) {
    fs.writeFileSync(instrDest,
      `# Project Instructions\n\n` +
      `## Spectra Framework\n\n` +
      `This project uses **Spectra** for domain specification.\n\n` +
      `### AI Agent Instructions\n\n` +
      `1. Read relevant layers from \`.spectra/\` before making any changes\n` +
      `2. Never violate invariants defined in \`04-invariants.md\`\n` +
      `3. Apply business rules from \`03-business-rules.md\`\n` +
      `4. Use only canonical terms from \`01-glossary.md\`\n` +
      `5. Update \`12-trace.md\` (SPECTRA-TRACE) at the end of every iteration\n\n` +
      `> Specs are the source of truth. Code is the derivative.\n`
    );
  }

  p();
  p(c(GR, '  ✔  .spectra/ created with 13 layers'));
  p(c(GR, '  ✔  SPECTRA-PROMPT.md ready'));
  p(c(GR, '  ✔  .instructions.md created for AI agents'));
  p();
  p(bd(YL, '  Next steps'));
  p();
  p(`  ${c(DM, '1.')} Open ${bd(WH, 'SPECTRA-PROMPT.md')} and fill in your domain`);
  p(`  ${c(DM, '2.')} Send it to ${bd(WH, 'Claude, GPT-4, or Gemini')} to generate the 13 layers`);
  p(`  ${c(DM, '3.')} Drop the specs into ${bd(WH, '.spectra/')} — your agent reads them automatically`);
  p(`  ${c(DM, '4.')} Build. The agent now knows your domain.`);
  p();
  p(c(DM, '  Docs: https://github.com/GuiMiran/spectra'));
  p();
}

// ── SPECTRA-VALIDATE ──────────────────────────────────────────────────────────
function cmdValidate() {
  p();
  p(bd(YL, '  spectra validate'));
  p();
  p(c(DM, '  Validation engine coming in v0.2.0.'));
  p(c(DM, '  It will check: invariant format, ID uniqueness, cross-reference integrity.'));
  p();
  p(`  Follow progress → ${c(CY, 'https://github.com/GuiMiran/spectra/issues')}`);
  p();
}

// ── DEFAULT (no command) ──────────────────────────────────────────────────────
function cmdHelp() {
  p();
  p(bd(CY, '  SPECTRA') + c(DM, '  ·  Spec-Driven Development for Agentic AI'));
  p();
  p(c(DM, '  ┌─ Commands ────────────────────────────────────────────────┐'));
  p(`  │  ${bd(GR, 'spectra init')}        ${c(DM, 'Scaffold 13 layers in .spectra/')}          │`);
  p(`  │  ${bd(GR, 'spectra validate')}    ${c(DM, 'Validate spec files          (v0.2)')}       │`);
  p(`  │  ${bd(GR, 'spectra trace')}       ${c(DM, 'Show traceability matrix     (v0.2)')}       │`);
  p(`  │  ${bd(GR, 'spectra --version')}   ${c(DM, 'Show installed version')}                   │`);
  p(c(DM, '  └───────────────────────────────────────────────────────────┘'));
  p();
  p(`  ${c(DM, 'Docs')}  ${c(CY, 'https://github.com/GuiMiran/spectra')}`);
  p();
}

// ── LAYER CONTENT GENERATORS ─────────────────────────────────────────────────

function generateLayer(num, name) {
  return `# LAYER ${num} — ${name.toUpperCase()}

> **Status**: Pending — fill this layer with your domain knowledge.
> Send \`SPECTRA-PROMPT.md\` to an LLM to generate all 13 layers at once.

---

<!-- Add your ${name} here. Each element must have a unique ID. -->
<!-- Example IDs: US-001, BR-001, INV-001, POL-001, EVT-001, SK-001, WF-001 -->
`;
}

function generateTrace() {
  const today = new Date().toISOString().split('T')[0];
  return `# LAYER 12 — SPECTRA-TRACE
## Bidirectional Agentic Traceability Matrix

> **Live layer** — updated automatically by the agent at the end of every iteration.
> Forward: detects functional gaps (spec without code).
> Reverse: detects technical gaps (code without spec).

---

## Coverage Dashboard
> Last updated: iter-0 · ${today} · Agent: —

| Metric                  | Value | Trend |
|-------------------------|-------|-------|
| Total specs             | 0     | —     |
| Implemented specs       | 0     | —     |
| Functional coverage     | 0%    | —     |
| Artifacts without spec  | 0     | —     |
| CRITICAL gaps           | 0     | —     |
| MAJOR gaps              | 0     | —     |
| MINOR gaps              | 0     | —     |
| Current iteration       | iter-0| —     |

---

## Forward Matrix — Spec → Code
> Detects **functional gaps**: specs with no implementation.

| spec_id | type | description | prio | status | artifacts | tests | severity | iter |
|---------|------|-------------|------|--------|-----------|-------|----------|------|
| — | — | *No specs registered yet* | — | — | — | — | — | — |

**Status legend**: \`✅ IMPL\` · \`⏳ PARTIAL\` · \`❌ PENDING\` · \`🚫 EXCLUDED\`
**Severity**: \`CRITICAL\` (invariant/legal) · \`MAJOR\` (MUST BR/US) · \`MINOR\` (SHOULD/COULD)

---

## Reverse Matrix — Code → Spec
> Detects **technical gaps**: code artifacts with no spec justifying them.

| artifact | type | description | spec_id | status | action | iter_detected |
|----------|------|-------------|---------|--------|--------|---------------|
| — | — | *No artifacts registered yet* | — | — | — | — |

**Status legend**: \`✅ TRACED\` · \`⚠️ ORPHAN\` · \`🔍 REVIEW\`
**Action**: \`KEEP\` · \`SPECIFY\` · \`DELETE\` · \`REFACTOR\`

---

## Gap Report — iter-0
> No gaps detected yet. Start filling the spec layers and implementing features.

---

## Iteration Log

| iter | date | coverage | impl | critical | major | minor | notes |
|------|------|----------|------|----------|-------|-------|-------|
| iter-0 | ${today} | 0% | 0/0 | 0 | 0 | 0 | Initial scaffold |

---

## Agent Protocol
> Instructions for the agent on how to update this file.

At the end of every iteration:
1. Count total specs across layers 02–11
2. For each spec, find its implementing artifacts and link them in the Forward Matrix
3. Scan all source files for \`// @spectra\` trace comments → populate Reverse Matrix
4. Recalculate coverage = implemented / total × 100
5. Classify unimplemented specs by severity (CRITICAL / MAJOR / MINOR)
6. Update Coverage Dashboard and append a row to Iteration Log
7. Write Gap Report with actionable next steps

\`\`\`
coverage = implemented_specs / total_specs × 100
CRITICAL ← INV not implemented | BR from legal regulation | SK blocking
MAJOR    ← MUST BR not implemented | MUST US not implemented
MINOR    ← SHOULD/COULD BR or US | POL edge case
\`\`\`
`;
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
const command = process.argv[2];

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'validate':
    cmdValidate();
    break;
  case '--version':
  case '-v': {
    const pkg = require(path.join(__dirname, '..', 'package.json'));
    p(`  spectra v${pkg.version}`);
    p();
    break;
  }
  default:
    // No command = full welcome screen
    require(path.join(__dirname, '..', 'scripts', 'welcome.js'));
}
