#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { assessTrajectory } = require('../lib/verification/trajectory');

function readJson(file, label) {
  const absolute = path.resolve(file);
  const stat = fs.statSync(absolute);
  if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error(`${label} must be a JSON file no larger than 1 MiB.`);
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function run(args) {
  if (args.length !== 4 || args[0] !== '--input' || !args[1] || args[2] !== '--controls' || !args[3]) {
    return { exitCode: 2, output: { valid: false, verdict: 'UNRESOLVED', errors: ['Usage: node scripts/trajectory-assess.js --input <trajectory.json> --controls <controls.json>'] } };
  }

  try {
    const output = assessTrajectory(readJson(args[1], 'Input'), readJson(args[3], 'Controls'));
    return { exitCode: output.valid ? (output.verdict === 'PASS' ? 0 : 1) : 2, output };
  } catch (error) {
    return { exitCode: 2, output: { valid: false, verdict: 'UNRESOLVED', errors: [`Cannot read trajectory input: ${error.message}`] } };
  }
}

if (require.main === module) {
  const result = run(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result.output)}\n`);
  process.exitCode = result.exitCode;
}

module.exports = { run };
