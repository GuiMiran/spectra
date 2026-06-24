#!/usr/bin/env node

'use strict';

const CYAN   = '\x1b[36m';
const WHITE  = '\x1b[97m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const GRAY   = '\x1b[90m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

const c = (color, text) => `${color}${text}${RESET}`;
const b = (color, text) => `${BOLD}${color}${text}${RESET}`;

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

const W = 72;

function row(text = '') {
  const raw = stripAnsi(text);
  const pad = Math.max(0, W - raw.length - 2);
  return c(CYAN, '║') + '  ' + text + ' '.repeat(pad) + '  ' + c(CYAN, '║');
}

function rule() {
  return c(CYAN, '╠' + '═'.repeat(W) + '╣');
}

function print(line = '') {
  process.stdout.write(line + '\n');
}

function welcome() {
  print();
  print(b(CYAN, '╔' + '═'.repeat(W) + '╗'));
  print(row());
  print(row(b(CYAN, '███████╗██████╗ ███████╗ ██████╗████████╗██████╗  █████╗')));
  print(row(b(CYAN, '██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗')));
  print(row(b(CYAN, '███████╗██████╔╝█████╗  ██║        ██║   ██████╔╝███████║')));
  print(row(b(CYAN, '╚════██║██╔═══╝ ██╔══╝  ██║        ██║   ██╔══██╗██╔══██║')));
  print(row(b(CYAN, '███████║██║     ███████╗╚██████╗   ██║   ██║  ██║██║  ██║')));
  print(row(b(CYAN, '╚══════╝╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝')));
  print(row());
  print(row(b(WHITE, 'SPEC DRIVEN DEVELOPMENT FOR THE AGENTIC ERA')));
  print(row());
  print(rule());
  print(row());
  print(row(c(WHITE, 'Transform specifications into traceable actions.')));
  print(row(c(WHITE, 'Transform actions into verifiable evidence.')));
  print(row(c(WHITE, 'Transform AI output into accountable delivery.')));
  print(row());
  print(row(c(GREEN, '✓  Specific Action Traceability')));
  print(row(c(GREEN, '✓  End-to-End Requirement Coverage')));
  print(row(c(GREEN, '✓  Human + AI Collaboration')));
  print(row(c(GREEN, '✓  Explainable Agent Workflows')));
  print(row(c(GREEN, '✓  Production-Ready Governance')));
  print(row());
  print(rule());
  print(row());
  print(row(b(YELLOW, 'SPEC → TASK → AGENT → ACTION → EVIDENCE → VALUE')));
  print(row());
  print(row(c(YELLOW, '"If an AI can act, you must be able to trace it."')));
  print(row());
  print(row(c(WHITE, 'The traceability layer for AI-generated software.')));
  print(row(b(WHITE, 'Build with AI. Prove with SPECTRA.')));
  print(row());
  print(rule());
  print(row());
  print(row(b(GREEN, 'spectra init')   + c(GRAY, '    -> scaffold the .spectra/ structure')));
  print(row(b(GREEN, 'spectra status') + c(GRAY, '  -> show completed vs pending spec layers')));
  print(row(b(GREEN, 'spectra trace')  + c(GRAY, '   -> generate the action traceability matrix')));
  print(row(b(GREEN, 'spectra help')   + c(GRAY, '    -> display available commands')));
  print(row());
  print(rule());
  print(row());
  print(row(c(GRAY, 'Copyright (c) 2026 Guido Miranda Mercado')));
  print(row(c(GRAY, 'GitHub: https://github.com/GuiMiran/spectra')));
  print(row(c(GRAY, 'npm:    @guimiran/spectra')));
  print(row());
  print(b(CYAN, '╚' + '═'.repeat(W) + '╝'));
  print();
}

welcome();