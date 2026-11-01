#!/usr/bin/env node
'use strict';
const { runControls, verifyFreeze } = require('../evals/stage2/run-controls');

async function main() {
  if (process.argv.length === 3 && process.argv[2] === '--verify-freeze') {
    const result = verifyFreeze();
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = result.valid ? 0 : 2;
  } else {
    if (process.argv.length !== 2) throw new Error('No custom modules or paths are accepted.');
    const report = await runControls();
    process.stdout.write(`${JSON.stringify(report)}\n`);
    process.exitCode = report.verdict === 'PASS' ? 0 : 1;
  }
}
main().catch(() => {
  process.stdout.write(`${JSON.stringify({ verdict: 'UNRESOLVED', errors: ['STAGE2_CONTROLS_INCOMPLETE'] })}\n`);
  process.exitCode = 2;
});
