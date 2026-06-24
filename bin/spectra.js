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
const RD = '\x1b[31m';

const bd = (col, t) => `${B}${col}${t}${R}`;
const c  = (col, t) => `${col}${t}${R}`;
const p  = (l = '') => process.stdout.write(l + '\n');

// ── SHARED LAYER DEFINITIONS ─────────────────────────────────────────────────
const LAYERS = [
  ['00', 'vision',              'Vision & Context'],
  ['01', 'glossary',            'Domain Glossary'],
  ['02', 'stories',             'User Stories'],
  ['03', 'business-rules',      'Business Rules'],
  ['04', 'invariants',          'Invariants'],
  ['05', 'contracts',           'Operation Contracts'],
  ['06', 'policies',            'Decision Policies'],
  ['07', 'events',              'Domain Events'],
  ['08', 'agents',              'Agents'],
  ['09', 'skills',              'Skills'],
  ['10', 'workflows',           'Workflows'],
  ['11', 'acceptance-criteria', 'Acceptance Criteria'],
  ['12', 'trace',               'SPECTRA-TRACE'],
];

const ID_PATTERNS = {
  US:  /\bUS-\d{3}\b/g,
  BR:  /\bBR-\d{3}\b/g,
  INV: /\bINV-\d{3}\b/g,
  OP:  /\bOP-\d{3}\b/g,
  POL: /\bPOL-\d{3}\b/g,
  EVT: /\bEVT-\d{3}\b/g,
  AG:  /\bAG-\d{3}\b/g,
  SK:  /\bSK-\d{3}\b/g,
  WF:  /\bWF-\d{3}\b/g,
  AC:  /\bAC-\d{3}\b/g,
};

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


  LAYERS.forEach(([num, slug, name]) => {
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

// ── SPECTRA-STATUS ────────────────────────────────────────────────────────────
function cmdStatus() {
  const spectraDir = path.join(process.cwd(), '.spectra');

  p();
  p(bd(CY, '  SPECTRA STATUS'));
  p();

  if (!fs.existsSync(spectraDir)) {
    p(c(YL, '  ⚠  No .spectra/ directory found.'));
    p(c(DM, '     Run: spectra init'));
    p();
    process.exit(1);
  }

  const STUB_MARKERS = ['To be completed', 'Add your domain', '_Add your'];
  const isStub = (content) => STUB_MARKERS.some(m => content.includes(m));

  let totalIds = 0;
  let filledLayers = 0;

  p(c(DM, '  ─────────────────────────────────────────────────────────────'));
  p(`  ${'Layer'.padEnd(28)} ${'IDs'.padEnd(6)} Status`);
  p(c(DM, '  ─────────────────────────────────────────────────────────────'));

  LAYERS.forEach(([num, slug, name]) => {
    const file = path.join(spectraDir, `${num}-${slug}.md`);
    if (!fs.existsSync(file)) {
      p(`  ${c(DM, num + ' ·')} ${name.padEnd(25)} ${c(RD, '——    ❌ missing')}`);
      return;
    }
    const content = fs.readFileSync(file, 'utf8');
    const stub = isStub(content);

    // Count IDs (skip code blocks)
    const clean = content.replace(/```[\s\S]*?```/g, '');
    let ids = 0;
    Object.values(ID_PATTERNS).forEach(rx => {
      ids += (clean.match(rx) || []).length;
    });
    totalIds += ids;
    if (!stub) filledLayers++;

    const isTrace = num === '12';
    const nameCol = isTrace ? bd(MG, name) : c(WH, name);
    const idsCol  = c(ids > 0 ? GR : DM, String(ids).padEnd(6));
    const status  = stub ? c(YL, '⏳ pending') : c(GR, '✅ filled');

    p(`  ${c(DM, num + ' ·')} ${nameCol.padEnd(25 + (isTrace ? 20 : 0))} ${idsCol} ${status}`);
  });

  p(c(DM, '  ─────────────────────────────────────────────────────────────'));
  p();

  const pct = Math.round((filledLayers / (LAYERS.length - 1)) * 100); // exclude trace
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  p(`  Layers filled   ${bd(WH, filledLayers + '/' + (LAYERS.length - 1))}  ${c(filledLayers > 0 ? GR : DM, bar)}  ${bd(CY, pct + '%')}`);
  p(`  Total IDs       ${bd(WH, String(totalIds))}`);
  p();

  if (filledLayers === 0) {
    p(c(YL, '  Next: fill SPECTRA-PROMPT.md and send it to an LLM to generate your specs.'));
  } else if (pct < 80) {
    p(c(YL, '  Some layers still pending. Run: spectra trace  to build the traceability matrix.'));
  } else {
    p(c(GR, '  Specs look complete. Run: spectra trace  to generate the traceability matrix.'));
  }
  p();
}

// ── SPECTRA-TRACE ─────────────────────────────────────────────────────────────
function inferArtifactType(filePath) {
  if (/\/hooks\//.test(filePath) || /\buse[A-Z]/.test(path.basename(filePath))) return 'hook';
  if (/\/components\/|\.jsx$|\.tsx$/.test(filePath)) return 'component';
  if (/\/utils\/|\/helpers\//.test(filePath)) return 'util';
  if (/\/services\/|\/api\//.test(filePath)) return 'service';
  if (/\/config\//.test(filePath)) return 'config';
  if (/\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filePath)) return 'test';
  return 'function';
}

function cmdTrace() {
  const spectraDir = path.join(process.cwd(), '.spectra');

  p();
  p(bd(MG, '  SPECTRA-TRACE  —  Building traceability matrix...'));
  p();

  if (!fs.existsSync(spectraDir)) {
    p(c(YL, '  ⚠  No .spectra/ directory found. Run: spectra init'));
    p();
    process.exit(1);
  }

  const today     = new Date().toISOString().split('T')[0];
  const traceFile = path.join(spectraDir, '12-trace.md');

  // ── Read previous trace for iteration history ─────────────────────────────
  let iterNum        = 1;
  let prevIterRows   = [];
  let prevFwdStatus  = {}; // id → status string from previous forward matrix
  let prevMetrics    = null;

  if (fs.existsSync(traceFile)) {
    const prev     = fs.readFileSync(traceFile, 'utf8');
    // Only match actual Iteration Log rows (have a date as second column)
    const iterRows = prev.match(/\| iter-\d+ \| \d{4}-\d{2}-\d{2}[^\n]*/g) || [];
    prevIterRows   = iterRows;
    // Use max iter number (not count) so re-runs don't skip numbers
    iterRows.forEach(row => {
      const m = row.match(/\| iter-(\d+)/);
      if (m) iterNum = Math.max(iterNum, parseInt(m[1]) + 1);
    });

    // Parse previous forward matrix statuses (to detect closed/regressions)
    (prev.match(/\| (?:US|BR|INV|OP|POL|EVT|AG|SK|WF|AC)-\d{3}[^\n]*/g) || []).forEach(row => {
      const cols = row.split('|').map(s => s.trim()).filter(Boolean);
      if (cols[0] && cols[4]) prevFwdStatus[cols[0]] = cols[4];
    });

    // Parse last iteration row for trend calculation
    if (iterRows.length > 0) {
      const cols = iterRows[iterRows.length - 1].split('|').map(s => s.trim()).filter(Boolean);
      // | iter-N | date | specs_impl | coverage | critical_gaps | major_gaps | orphans | note |
      if (cols.length >= 7) {
        const m = (cols[2] || '').match(/(\d+)\/(\d+)/);
        prevMetrics = {
          impl:     m ? parseInt(m[1]) : null,
          coverage: parseFloat(cols[3]) || null,
          critical: parseInt(cols[4]) || null,
          major:    parseInt(cols[5]) || null,
          orphans:  parseInt(cols[6]) || null,
        };
      }
    }
  }

  const iterLabel = `iter-${iterNum}`;

  // ── Collect all spec IDs from layers 00-11 ───────────────────────────────
  const specMap = {}; // id → { type, desc, layer, priority }

  LAYERS.slice(0, 12).forEach(([num, slug]) => {
    const file = path.join(spectraDir, `${num}-${slug}.md`);
    if (!fs.existsSync(file)) return;
    const clean = fs.readFileSync(file, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')    // strip HTML comments (removes example ID hints)
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '');
    Object.entries(ID_PATTERNS).forEach(([type, rx]) => {
      (clean.match(rx) || []).forEach(id => {
        if (!specMap[id]) {
          const line = clean.split('\n').find(l => l.includes(id)) || '';
          const desc = line.replace(/[|#*`]/g, '').replace(id, '').trim().slice(0, 50) || '—';
          const prio = line.includes('MUST') ? 'MUST' : line.includes('SHOULD') ? 'SHOULD' : 'COULD';
          specMap[id] = { type, desc, layer: `${num}-${slug}.md`, priority: prio };
        }
      });
    });
  });

  const specIds = Object.keys(specMap).sort();
  const total   = specIds.length;

  // ── Build AC linkage map: spec_id → [AC-XXX] from layer 11 ──────────────
  const acMap = {};
  const acFile = path.join(spectraDir, '11-acceptance-criteria.md');
  if (fs.existsSync(acFile)) {
    const acClean = fs.readFileSync(acFile, 'utf8').replace(/```[\s\S]*?```/g, '');
    acClean.split('\n').forEach(line => {
      const acIds = line.match(/\bAC-\d{3}\b/g) || [];
      if (!acIds.length) return;
      Object.keys(ID_PATTERNS).filter(t => t !== 'AC').forEach(type => {
        (line.match(new RegExp(`\\b${type}-\\d{3}\\b`, 'g')) || []).forEach(sid => {
          if (!acMap[sid]) acMap[sid] = [];
          acIds.forEach(ac => { if (!acMap[sid].includes(ac)) acMap[sid].push(ac); });
        });
      });
    });
  }

  p(`  ${c(DM, 'Found')} ${bd(WH, String(total))} ${c(DM, 'spec IDs across layers 00–11')}`);
  p();

  // ── Scan source files for @spectra comments ──────────────────────────────
  const srcDirs = ['src', 'lib', 'app', 'components', 'pages', 'api', 'services'];
  const traced  = {}; // spec_id → [files]
  const orphans = []; // { file, id, type }

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) { scanDir(full); return; }
      if (!/\.(js|ts|jsx|tsx|py|rb|go|java|cs|php)$/.test(item.name)) return;
      const content = fs.readFileSync(full, 'utf8');
      (content.match(/@spectra\s+([\w:-]+)/g) || []).forEach(ref => {
        const id      = ref.replace('@spectra', '').trim().toUpperCase();
        const relPath = path.relative(process.cwd(), full);
        if (specMap[id]) {
          if (!traced[id]) traced[id] = [];
          traced[id].push(relPath);
        } else {
          orphans.push({ file: relPath, id, type: inferArtifactType(relPath) });
        }
      });
    });
  }
  srcDirs.forEach(scanDir);

  const implemented = specIds.filter(id => traced[id]);
  const coverage    = total > 0 ? Math.round((implemented.length / total) * 100) : 0;

  // ── Severity ─────────────────────────────────────────────────────────────
  function severity(id, spec) {
    if (traced[id]) return '—';
    if (spec.type === 'INV')                             return 'CRITICAL';
    if (spec.type === 'SK')                              return 'CRITICAL';
    if (spec.type === 'BR' && spec.priority === 'MUST')  return 'MAJOR';
    if (spec.type === 'US' && spec.priority === 'MUST')  return 'MAJOR';
    if (spec.type === 'WF')                              return 'MAJOR';
    return 'MINOR';
  }

  const criticalIds = specIds.filter(id => severity(id, specMap[id]) === 'CRITICAL');
  const majorIds    = specIds.filter(id => severity(id, specMap[id]) === 'MAJOR');
  const minorIds    = specIds.filter(id => severity(id, specMap[id]) === 'MINOR');

  // ── Detect closed items and regressions ──────────────────────────────────
  const closedItems = [];
  const regressions = [];
  specIds.forEach(id => {
    const prev = prevFwdStatus[id] || '';
    if (!prev) return;
    const nowImpl    = !!traced[id];
    const wasPending = prev.includes('PENDING') || prev.includes('PARTIAL');
    const wasImpl    = prev.includes('IMPL') && !prev.includes('PARTIAL');
    if (wasPending && nowImpl)  closedItems.push(id);
    if (wasImpl    && !nowImpl) regressions.push(id);
  });

  // ── Trend helper ──────────────────────────────────────────────────────────
  function trend(curr, prev) {
    if (prev === null || prev === undefined || isNaN(prev)) return '—';
    const diff = curr - prev;
    if (diff > 0) return `↑ +${diff}`;
    if (diff < 0) return `↓ ${diff}`;
    return '→ 0';
  }
  const pm = prevMetrics || {};

  // ── Build markdown ────────────────────────────────────────────────────────
  let md = '';

  // [1] Coverage Dashboard
  md += `# LAYER 12 — SPECTRA-TRACE\n`;
  md += `## Bidirectional Agentic Traceability Matrix\n\n`;
  md += `> **Live layer** — auto-generated by \`spectra trace\` · ${iterLabel} · ${today}\n`;
  md += `> Forward: detects functional gaps (spec without code).\n`;
  md += `> Reverse: detects technical gaps (code without spec).\n\n---\n\n`;
  md += `## [1] Coverage Dashboard\n`;
  md += `> Last updated: ${iterLabel} · ${today} · Agent: spectra-cli\n\n`;
  md += `| Metric                     | Value   | Trend     |\n`;
  md += `|----------------------------|---------|----------|\n`;
  md += `| Total specs                | ${total}        | —         |\n`;
  md += `| Implemented specs          | ${implemented.length}        | ${trend(implemented.length, pm.impl)}    |\n`;
  md += `| Functional coverage        | ${coverage}%      | ${trend(coverage, pm.coverage)}  |\n`;
  md += `| Artifacts without spec     | ${orphans.length}        | ${trend(orphans.length, pm.orphans)}    |\n`;
  md += `| CRITICAL gaps              | ${criticalIds.length}        | ${trend(criticalIds.length, pm.critical)}    |\n`;
  md += `| MAJOR gaps                 | ${majorIds.length}        | ${trend(majorIds.length, pm.major)}    |\n`;
  md += `| MINOR gaps                 | ${minorIds.length}        | —         |\n`;
  md += `| Current iteration          | ${iterLabel}   | —         |\n`;
  md += `\n---\n\n`;

  // [2] Forward Matrix
  md += `## [2] Forward Matrix — Spec → Code\n\n`;
  md += `| spec_id | type | description | prio | status | artifacts | tests | severity | iter | notes |\n`;
  md += `|---------|------|-------------|------|--------|-----------|-------|----------|------|-------|\n`;
  specIds.forEach(id => {
    const spec   = specMap[id];
    const arts   = traced[id]   ? traced[id].join(', ')  : '—';
    const tests  = acMap[id]    ? acMap[id].join(', ')   : '—';
    const status = traced[id]   ? '✅ IMPL'               : '❌ PENDING';
    const sev    = severity(id, spec);
    md += `| ${id} | ${spec.type} | ${spec.desc.slice(0, 40)} | ${spec.priority} | ${status} | ${arts} | ${tests} | ${sev} | ${iterLabel} | — |\n`;
  });
  if (total === 0) {
    md += `| — | — | *No spec IDs found in layers 00–11* | — | — | — | — | — | — | — |\n`;
  }
  md += `\n**Status**: \`✅ IMPL\` · \`⏳ PARTIAL\` · \`❌ PENDING\` · \`🚫 EXCLUDED\`  \n`;
  md += `**Severity**: \`CRITICAL\` (INV/legal BR/SK) · \`MAJOR\` (MUST BR/US/WF) · \`MINOR\` (SHOULD/COULD)\n\n---\n\n`;

  // [3] Reverse Matrix
  md += `## [3] Reverse Matrix — Code → Spec\n\n`;
  md += `| artifact | type | description | specs | status | action | iter_detected |\n`;
  md += `|----------|------|-------------|-------|--------|--------|---------------|\n`;
  Object.entries(traced).forEach(([id, files]) => {
    files.forEach(f => {
      md += `| ${f} | ${inferArtifactType(f)} | — | ${id} | ✅ TRACED | KEEP | ${iterLabel} |\n`;
    });
  });
  orphans.forEach(({ file, id, type }) => {
    md += `| ${file} | ${type} | — | ${id} | ⚠️ ORPHAN | SPECIFY | ${iterLabel} |\n`;
  });
  if (Object.keys(traced).length === 0 && orphans.length === 0) {
    md += `| — | — | — | — | *No @spectra comments found in source files* | — | — |\n`;
    md += `\n> **Tip**: Add \`// @spectra BR-001\` comments to source files to enable reverse tracing.\n`;
  }
  md += `\n**Status**: \`✅ TRACED\` · \`⚠️ ORPHAN\` · \`🔍 REVIEW\`  \n`;
  md += `**Action**: \`KEEP\` · \`SPECIFY\` · \`DELETE\` · \`REFACTOR\`\n\n---\n\n`;

  // [4] Gap Report
  md += `## [4] Gap Report — ${iterLabel} · ${today}\n\n`;
  if (criticalIds.length > 0) {
    md += `### 🔴 CRITICAL Gaps (block domain completeness)\n\n`;
    criticalIds.forEach((id, i) => {
      const spec = specMap[id];
      const n    = String(i + 1).padStart(3, '0');
      md += `GAP-C${n} · ${id} not implemented\n`;
      md += `  Spec: "${spec.desc}"\n`;
      md += `  Current state: no implementation found via @spectra comments\n`;
      md += `  Required action: implement and tag with \`// @spectra ${id}\`\n`;
      md += `  Impact: ${spec.type === 'INV' ? 'invariant violation risk' : 'blocking skill missing'}\n\n`;
    });
  }
  if (majorIds.length > 0) {
    md += `### 🟠 MAJOR Gaps (incomplete business functionality)\n\n`;
    majorIds.forEach((id, i) => {
      const spec = specMap[id];
      const n    = String(i + 1).padStart(3, '0');
      md += `GAP-M${n} · ${id} not implemented\n`;
      md += `  Spec: "${spec.desc}"\n`;
      md += `  Current state: no implementation found via @spectra comments\n`;
      md += `  Required action: implement and tag with \`// @spectra ${id}\`\n\n`;
    });
  }
  if (minorIds.length > 0) {
    md += `### 🟡 MINOR Gaps (improvements and edge cases)\n\n`;
    minorIds.forEach((id, i) => {
      const spec = specMap[id];
      const n    = String(i + 1).padStart(3, '0');
      md += `GAP-m${n} · ${id} not implemented\n`;
      md += `  Spec: "${spec.desc}"\n`;
      md += `  Priority: ${spec.priority}\n\n`;
    });
  }
  if (criticalIds.length === 0 && majorIds.length === 0 && minorIds.length === 0) {
    md += `> ✅ No functional gaps detected. All specs are implemented.\n\n`;
  }
  if (orphans.length > 0) {
    md += `### ⚠️ Orphan Artifacts (code without spec)\n\n`;
    orphans.forEach(({ file, id }, i) => {
      const n = String(i + 1).padStart(3, '0');
      md += `ORPHAN-${n} · ${file}\n`;
      md += `  Detected: ${iterLabel}. Referenced spec ID "${id}" not found in any layer.\n`;
      md += `  Decision required: create the missing spec, or remove the @spectra tag?\n\n`;
    });
  }
  if (closedItems.length > 0) {
    md += `### ✅ Closed in this iteration\n\n`;
    closedItems.forEach((id, i) => {
      const spec = specMap[id];
      const n    = String(i + 1).padStart(3, '0');
      const prev = prevFwdStatus[id] || 'PENDING';
      md += `CLOSED-${n} · ${id} — ${spec.desc} (was ${prev} in iter-${iterNum - 1})\n`;
    });
    md += '\n';
  }
  if (regressions.length > 0) {
    md += `### ⚠️ Regressions (previously IMPL, now PENDING)\n\n`;
    regressions.forEach(id => {
      md += `- **${id}**: was IMPL in iter-${iterNum - 1}, now PENDING — investigate\n`;
    });
    md += '\n';
  }
  md += `---\n\n`;

  // [5] Iteration Log
  const regNote = regressions.length > 0
    ? `Regression: ${regressions.slice(0, 2).join(', ')}`
    : `${iterLabel} scan`;
  const newRow  = `| ${iterLabel} | ${today} | ${implemented.length}/${total} | ${coverage}% | ${criticalIds.length} | ${majorIds.length} | ${orphans.length} | ${regNote} |`;
  const logBody = prevIterRows.length > 0
    ? prevIterRows.join('\n') + '\n' + newRow
    : newRow;

  md += `## [5] Iteration Log\n\n`;
  md += `| iter   | date       | specs_impl | coverage | critical_gaps | major_gaps | orphans | note |\n`;
  md += `|--------|------------|------------|----------|---------------|------------|---------|------|\n`;
  md += logBody + '\n';
  if (regressions.length > 0) {
    md += `\n> ⚠️ **Regression**: \`critical_gaps\` increased. Cause: ${regressions.join(', ')} previously IMPL.\n`;
  }
  md += `\n---\n\n`;

  // [6] Agent Protocol
  md += `## [6] Agent Protocol — How to update SPECTRA-TRACE\n\n`;
  md += `\`\`\`\n`;
  md += `UPDATE PROTOCOL — SPECTRA-TRACE\n`;
  md += `Execute at the end of every iteration, before closing the session.\n\n`;
  md += `STEP 1 — SCAN SPECS\n`;
  md += `  For each spec in layers 03 to 11:\n`;
  md += `    - Search for its ID in the source code\n`;
  md += `    - Determine status: IMPL / PARTIAL / PENDING\n`;
  md += `    - Identify artifacts that implement it\n`;
  md += `    - Link acceptance criteria that validate it\n\n`;
  md += `STEP 2 — SCAN CODE\n`;
  md += `  For each significant artifact (functions, components, hooks, utils):\n`;
  md += `    - Find which spec_id justifies it\n`;
  md += `    - If no spec_id: mark as ORPHAN\n`;
  md += `    - Classify action: SPECIFY / DELETE / REFACTOR\n\n`;
  md += `STEP 3 — CALCULATE GAPS\n`;
  md += `  Forward gaps = specs with PENDING or PARTIAL status\n`;
  md += `  Reverse gaps = artifacts with ORPHAN status\n`;
  md += `  Classify severity according to severity table\n\n`;
  md += `STEP 4 — UPDATE FILE\n`;
  md += `  Update [1] Coverage Dashboard with new metrics and trends\n`;
  md += `  Update [2] Forward Matrix with status changes\n`;
  md += `  Update [3] Reverse Matrix with new artifacts\n`;
  md += `  Generate new [4] Gap Report for the iteration\n`;
  md += `  Append row to [5] Iteration Log\n\n`;
  md += `STEP 5 — REPORT TO HUMAN\n`;
  md += `  "Iteration {N} complete.\n`;
  md += `   Coverage: {X}% ({+/-Y}% vs previous iter)\n`;
  md += `   Critical gaps: {N} ({+/-M})\n`;
  md += `   Next recommended priority: {GAP-ID} — {description}"\n\n`;
  md += `PROTOCOL RULES:\n`;
  md += `  - Never mark IMPL without a linked artifact\n`;
  md += `  - Never mark IMPL without a linked acceptance criterion\n`;
  md += `  - Always document regressions (new gap that was previously IMPL)\n`;
  md += `  - Orphans are never deleted automatically — marked and reported\n`;
  md += `  - EXCLUDED specs are never touched — they are explicit scope decisions\n\n`;
  md += `SEVERITY TABLE:\n`;
  md += `  CRITICAL  <- INV (invariant) not implemented\n`;
  md += `             <- BR from legal regulation not implemented\n`;
  md += `             <- SK (skill) blocking not implemented\n`;
  md += `  MAJOR     <- MUST business BR not implemented\n`;
  md += `             <- MUST priority US not implemented\n`;
  md += `             <- Main WF (workflow) not implemented\n`;
  md += `  MINOR     <- SHOULD/COULD BR not implemented\n`;
  md += `             <- SHOULD/COULD priority US not implemented\n`;
  md += `             <- POL edge case not implemented\n`;
  md += `\`\`\`\n`;

  // ── Write file ────────────────────────────────────────────────────────────
  fs.writeFileSync(traceFile, md);

  // ── Print summary ─────────────────────────────────────────────────────────
  const bar = '█'.repeat(Math.floor(coverage / 5)) + '░'.repeat(20 - Math.floor(coverage / 5));
  p(c(DM, '  ─────────────────────────────────────────────────────────────'));
  p(`  Iteration         ${bd(CY, iterLabel)}`);
  p(`  Total specs       ${bd(WH, String(total))}`);
  p(`  Implemented       ${bd(GR, String(implemented.length))}`);
  p(`  Coverage          ${bd(CY, coverage + '%')}  ${c(coverage > 0 ? GR : DM, bar)}`);
  p(`  CRITICAL gaps     ${bd(criticalIds.length > 0 ? RD : GR, String(criticalIds.length))}`);
  p(`  MAJOR gaps        ${bd(majorIds.length    > 0 ? YL : GR, String(majorIds.length))}`);
  p(`  Orphan artifacts  ${bd(orphans.length     > 0 ? YL : GR, String(orphans.length))}`);
  if (closedItems.length > 0) p(`  Closed            ${bd(GR, String(closedItems.length))} spec${closedItems.length > 1 ? 's' : ''} resolved this iteration`);
  if (regressions.length > 0) p(`  Regressions       ${bd(RD, String(regressions.length))} — investigate!`);
  p(c(DM, '  ─────────────────────────────────────────────────────────────'));
  p();
  p(c(GR, `  ✔  .spectra/12-trace.md updated (${iterLabel})`));
  if (total === 0) {
    p();
    p(c(YL, '  ⚠  No spec IDs found yet. Fill your spec layers first.'));
    p(c(DM, '     Example: add "BR-001: ..." to .spectra/03-business-rules.md'));
    p(c(DM, '     Then run: spectra trace'));
  }
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

| spec_id | type | description | prio | status | artifacts | tests | severity | iter | notes |
|---------|------|-------------|------|--------|-----------|-------|----------|------|-------|
| — | — | *No specs registered yet* | — | — | — | — | — | — | — |

**Status legend**: \`✅ IMPL\` · \`⏳ PARTIAL\` · \`❌ PENDING\` · \`🚫 EXCLUDED\`
**Severity**: \`CRITICAL\` (invariant/legal) · \`MAJOR\` (MUST BR/US) · \`MINOR\` (SHOULD/COULD)

---

## Reverse Matrix — Code → Spec
> Detects **technical gaps**: code artifacts with no spec justifying them.

| artifact | type | description | specs | status | action | iter_detected |
|----------|------|-------------|-------|--------|--------|---------------|
| — | — | *No artifacts registered yet* | — | — | — | — |

**Status legend**: \`✅ TRACED\` · \`⚠️ ORPHAN\` · \`🔍 REVIEW\`
**Action**: \`KEEP\` · \`SPECIFY\` · \`DELETE\` · \`REFACTOR\`

---

## Gap Report — iter-0
> No gaps detected yet. Start filling the spec layers and implementing features.

---

## Iteration Log

| iter | date | specs_impl | coverage | critical_gaps | major_gaps | orphans | note |
|------|------|------------|----------|---------------|-----------|---------|------|
| iter-0 | ${today} | 0/0 | 0% | 0 | 0 | 0 | Initial scaffold |

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

// ── DEFAULT HELP ──────────────────────────────────────────────────────────────
function cmdHelp() {
  p();
  p(bd(CY, '  SPECTRA') + c(DM, '  ·  Spec-Driven Development for Agentic AI'));
  p();
  p(c(DM, '  ┌─ Commands ────────────────────────────────────────────────┐'));
  p(`  │  ${bd(GR, 'spectra init')}        ${c(DM, 'Scaffold .spectra/ with 13 layers')}           │`);
  p(`  │  ${bd(GR, 'spectra status')}      ${c(DM, 'Show which layers are filled vs pending')}     │`);
  p(`  │  ${bd(GR, 'spectra trace')}       ${c(DM, 'Scan specs + code → generate 12-trace.md')}   │`);
  p(`  │  ${bd(GR, 'spectra validate')}    ${c(DM, 'Validate spec quality          (v0.4)')}       │`);
  p(`  │  ${bd(GR, 'spectra --version')}   ${c(DM, 'Show installed version')}                     │`);
  p(c(DM, '  └───────────────────────────────────────────────────────────┘'));
  p();
  p(`  ${c(DM, 'Workflow')}:`);
  p(`  ${c(DM, '1.')} ${bd(WH, 'spectra init')}    ${c(DM, '→')} scaffold layers`);
  p(`  ${c(DM, '2.')} Fill ${bd(WH, 'SPECTRA-PROMPT.md')} ${c(DM, '→')} paste into Claude/GPT-4/Gemini`);
  p(`  ${c(DM, '3.')} Copy generated specs ${c(DM, '→')} paste into ${bd(WH, '.spectra/')}`);
  p(`  ${c(DM, '4.')} ${bd(WH, 'spectra status')}  ${c(DM, '→')} verify coverage`);
  p(`  ${c(DM, '5.')} ${bd(WH, 'spectra trace')}   ${c(DM, '→')} generate traceability matrix`);
  p();
  p(`  ${c(DM, 'Docs')}  ${c(CY, 'https://github.com/GuiMiran/spectra')}`);
  p();
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
const command = process.argv[2];

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'status':
    cmdStatus();
    break;
  case 'trace':
    cmdTrace();
    break;
  case 'validate':
    cmdValidate();
    break;
  case 'help':
  case '--help':
  case '-h':
    cmdHelp();
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
