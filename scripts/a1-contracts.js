#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const { assessA1Contracts } = require('../lib/verification/a1-contracts');

function run(args) {
  try {
    if (args.length !== 2 || args[0] !== '--input' || !args[1]) throw new Error('Usage: node scripts/a1-contracts.js --input <contracts.json>');
    const stat = fs.lstatSync(args[1]);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error('Input must be a regular, non-symlink JSON file at most 1 MiB.');
    const report = assessA1Contracts(JSON.parse(fs.readFileSync(args[1], 'utf8')));
    // Exit status is contract validity, NOT test quality, scoring or A1 completion.
    return { exitCode: report.valid ? 0 : 2, report };
  } catch (error) {
    return { exitCode: 2, report: { valid: false, scope: 'structure-and-lineage-only', errors: [error.message],
      executionAuthorized: false, a1CycleComplete: false } };
  }
}

if (require.main === module) {
  const result = run(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result.report)}\n`);
  process.exitCode = result.exitCode;
}
module.exports = { run };
