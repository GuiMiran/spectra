#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { assessComparison } = require('../lib/verification/comparison');
try {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/comparison-assess.js <record.json>');
  const file = process.argv[2];
  if (!fs.statSync(file).isFile() || fs.statSync(file).size > 1024 * 1024) throw new Error('Invalid input file size.');
  const result = assessComparison(JSON.parse(fs.readFileSync(file, 'utf8')));
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.valid ? (result.verdict === 'PASS' ? 0 : 1) : 2;
} catch (error) {
  process.stdout.write(`${JSON.stringify({ valid: false, verdict: 'UNRESOLVED', errors: [error.message] })}\n`);
  process.exitCode = 2;
}
