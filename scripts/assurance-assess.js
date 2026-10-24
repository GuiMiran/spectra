'use strict';

const fs = require('node:fs');
const { assessOracleIntegrity, assessSignalPath } = require('../lib/verification/assurance');

function main(args = process.argv.slice(2)) {
  const [kind, file] = args;
  if (!['oracle', 'signal'].includes(kind) || !file || args.length !== 2) {
    throw new Error('Usage: npm run assurance:assess -- <oracle|signal> <record.json>');
  }
  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  const assessment = kind === 'oracle' ? assessOracleIntegrity(record) : assessSignalPath(record);
  process.stdout.write(`${JSON.stringify(assessment, null, 2)}\n`);
  if (assessment.verdict !== 'PASS') process.exitCode = 1;
}

if (require.main === module) {
  try { main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 2; }
}

module.exports = { main };
