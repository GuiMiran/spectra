#!/usr/bin/env node

'use strict';

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const CYAN   = '\x1b[36m';
const WHITE  = '\x1b[97m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const MAGENTA= '\x1b[35m';
const BLUE   = '\x1b[34m';
const GRAY   = '\x1b[90m';

const c  = (color, text) => `${color}${text}${RESET}`;
const b  = (text) => `${BOLD}${text}${RESET}`;
const bd = (color, text) => `${BOLD}${color}${text}${RESET}`;

function print(line = '') {
  process.stdout.write(line + '\n');
}

function welcome() {
  print();
  print(bd(CYAN,
    '  ███████╗██████╗ ███████╗ ██████╗████████╗██████╗  █████╗ '));
  print(bd(CYAN,
    '  ██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗'));
  print(bd(CYAN,
    '  ███████╗██████╔╝█████╗  ██║        ██║   ██████╔╝███████║'));
  print(bd(CYAN,
    '  ╚════██║██╔═══╝ ██╔══╝  ██║        ██║   ██╔══██╗██╔══██║'));
  print(bd(CYAN,
    '  ███████║██║     ███████╗╚██████╗   ██║   ██║  ██║██║  ██║'));
  print(bd(CYAN,
    '  ╚══════╝╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝'));
  print();

  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(
    c(WHITE, '  The specification framework') +
    c(GRAY, ' designed to be consumed by ') +
    bd(MAGENTA, 'AI, not humans') + c(GRAY, '.')
  );
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print();

  // The agentic pitch
  print(bd(YELLOW, '  Why Spectra?'));
  print();
  print(
    c(GRAY, '  You give a task to an AI agent. It builds something.') 
  );
  print(
    c(GRAY, '  But it guesses your business rules, ignores your regulations,')
  );
  print(
    c(GRAY, '  invents the edge cases. Ten messages later — you\'re still correcting it.')
  );
  print();
  print(
    c(WHITE, '  Not an AI problem. A ') + bd(YELLOW, 'context') + c(WHITE, ' problem.')
  );
  print();
  print(
    c(GRAY, '  Agents are powerful. But they don\'t know what ') + c(WHITE, 'you') + c(GRAY, ' know.')
  );
  print(
    c(GRAY, '  Spectra bridges that gap — before the first line of code.')
  );
  print();

  // The stack
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(bd(YELLOW, '  How it fits in your agentic stack'));
  print();
  print(
    c(GRAY, '  ') + bd(CYAN, 'SPECTRA') + c(GRAY, '  →  domain truth, rules, invariants, regulations')
  );
  print(
    c(GRAY, '       ↓   feeds your agent')
  );
  print(
    c(GRAY, '  ') + bd(WHITE, 'OpenSpec') + c(GRAY, ' →  how features evolve and get implemented')
  );
  print(
    c(GRAY, '       ↓   agent builds')
  );
  print(
    c(GRAY, '  ') + bd(WHITE, 'Your Code') + c(GRAY, ' →  the derivative, never the source')
  );
  print();

  // The 7 letters
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(bd(YELLOW, '  Seven letters. Seven principles.'));
  print();
  print(`  ${bd(CYAN, 'S')}${c(GRAY, 'ource       ')}${c(WHITE, 'Specs are the source. Code is the derivative.')}`);
  print(`  ${bd(CYAN, 'P')}${c(GRAY, 'roduct      ')}${c(WHITE, 'Business domain first. Architecture never.')}`);
  print(`  ${bd(CYAN, 'E')}${c(GRAY, 'xhaustive   ')}${c(WHITE, 'Every rule, every edge case, every exception.')}`);
  print(`  ${bd(CYAN, 'C')}${c(GRAY, 'ontractual  ')}${c(WHITE, 'Preconditions, postconditions, boolean invariants.')}`);
  print(`  ${bd(CYAN, 'T')}${c(GRAY, 'ruth        ')}${c(WHITE, 'One single source. No contradictions.')}`);
  print(`  ${bd(CYAN, 'R')}${c(GRAY, 'econstructable  ')}${c(WHITE, 'The full system must be rebuildable from specs alone.')}`);
  print(`  ${bd(CYAN, 'A')}${c(GRAY, 'gentic      ')}${c(WHITE, 'Designed for AI to read and act. Not humans.')}`);
  print();

  // The 13 layers quick ref
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(bd(YELLOW, '  13 layers. One domain truth.'));
  print();
  const layers = [
    ['00', 'Vision & Context       ', 'what it is and who it\'s for'],
    ['01', 'Domain Glossary        ', 'the canonical language'],
    ['02', 'User Stories           ', 'what users need'],
    ['03', 'Business Rules         ', 'every rule with regulatory source'],
    ['04', 'Invariants             ', 'always-true boolean conditions'],
    ['05', 'Operation Contracts    ', 'pre/postconditions per operation'],
    ['06', 'Decision Policies      ', 'IF/THEN decision trees'],
    ['07', 'Domain Events          ', 'facts and their consequences'],
    ['08', 'Agents                 ', 'autonomous actors'],
    ['09', 'Skills                 ', 'atomic invocable capabilities'],
    ['10', 'Workflows              ', 'agent and skill orchestration'],
    ['11', 'Acceptance Criteria    ', 'tests in natural language'],
    ['12', 'SPECTRA-TRACE  ★      ', 'live bidirectional traceability matrix'],
  ];
  layers.forEach(([num, name, desc]) => {
    const isTrace = num === '12';
    print(
      `  ${c(GRAY, num + ' ·')} ${isTrace ? bd(MAGENTA, name) : c(WHITE, name)}` +
      `${c(GRAY, '← ' + desc)}`
    );
  });
  print();

  // SPECTRA-TRACE highlight
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(bd(MAGENTA, '  ★  SPECTRA-TRACE  —  The key innovation'));
  print();
  print(
    c(GRAY, '  A living bidirectional matrix. Updated by the agent, not you.')
  );
  print(
    `  ${bd(GREEN, 'Spec → Code')}  ${c(GRAY, 'Detects functional gaps — things the business needs that don\'t exist yet.')}`
  );
  print(
    `  ${bd(YELLOW, 'Code → Spec')}  ${c(GRAY, 'Detects technical gaps — orphaned code with no business rule justifying it.')}`
  );
  print();

  // Quick start
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(bd(YELLOW, '  Get started in 3 steps'));
  print();
  print(
    `  ${c(GRAY, '1.')} Run ${bd(GREEN, 'spectra init')}      ${c(GRAY, '→ scaffold 13 layers in .spectra/')}`
  );
  print(
    `  ${c(GRAY, '2.')} Fill ${bd(WHITE, 'SPECTRA-PROMPT.md')} ${c(GRAY, '→ your domain, rules, regulations')}`
  );
  print(
    `  ${c(GRAY, '3.')} Send to an LLM     ${c(GRAY, '→ Claude, GPT-4, Gemini — your choice')}`
  );
  print();
  print(
    c(GRAY, '  Then point your agent at .spectra/ — and never explain your')
  );
  print(
    c(GRAY, '  domain twice.')
  );
  print();

  // Commands
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(bd(YELLOW, '  Commands'));
  print();
  print(`  ${bd(GREEN, 'spectra init')}        ${c(GRAY, 'Initialize Spectra in the current project')}`);
  print(`  ${bd(GREEN, 'spectra validate')}    ${c(GRAY, 'Validate spec files (coming soon)')}`);
  print(`  ${bd(GREEN, 'spectra trace')}       ${c(GRAY, 'Show traceability matrix (coming soon)')}`);
  print(`  ${bd(GREEN, 'spectra --version')}   ${c(GRAY, 'Show installed version')}`);
  print();

  // Footer
  print(
    c(GRAY, '  ─────────────────────────────────────────────────────────────')
  );
  print(
    `  ${c(GRAY, 'Docs')}    ${c(CYAN, 'https://github.com/GuiMiran/spectra')}`
  );
  print(
    `  ${c(GRAY, 'Issues')}  ${c(CYAN, 'https://github.com/GuiMiran/spectra/issues')}`
  );
  print(
    `  ${c(GRAY, 'License')} CC BY-NC-ND 4.0  ·  ${c(GRAY, 'v0.1.0')}  ·  ${c(GRAY, '© Guido Miranda Mercado')}`
  );
  print();
  print(
    c(GRAY, '  Build agents that know your domain. Not agents that guess it.')
  );
  print();
}

welcome();
