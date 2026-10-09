#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { assessStage2 } = require('../lib/verification/stage2');

function run(args) {
  if (args.length !== 2 || args[0] !== '--input' || !args[1]) {
    return { exitCode: 2, output: { valid: false, verdict: 'UNRESOLVED', errors: ['Usage: node scripts/stage2-assess.js --input <record.json>'] } };
  }

  const file = path.resolve(args[1]);
  let record;
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error('Input must be a JSON file no larger than 1 MiB.');
    record = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { exitCode: 2, output: { valid: false, verdict: 'UNRESOLVED', errors: [`Cannot read Stage 2 record: ${error.message}`] } };
  }

  const output = assessStage2(record);
  return { exitCode: output.valid ? (output.verdict === 'PASS' ? 0 : 1) : 2, output };
}

if (require.main === module) {
  const result = run(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result.output)}\n`);
  process.exitCode = result.exitCode;
}

module.exports = { run };
