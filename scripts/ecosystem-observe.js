'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { validateManifest, observe, renderObservation } = require('../lib/ecosystem');
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--live')) throw new Error('Usage: node scripts/ecosystem-observe.js [--live]');
  const manifest = validateManifest(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/ecosystem/components.json'), 'utf8')));
  if (!args.length) {
    console.log('Ecosystem manifest valid; no network or compatibility assessment performed.');
    return;
  }
  const report = await observe(manifest);
  // Local, fixed output paths only; never update baseline pins.
  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'reports/ecosystem-observation.json'), JSON.stringify(report, null, 2) + '\n');
  const markdown = renderObservation(report);
  fs.writeFileSync(path.join(ROOT, 'docs/ecosystem/observations.md'), markdown);
  console.log('Observed five repositories; generated documentation requires human review.');
}
if (require.main === module) main().catch(() => {
  console.error('Ecosystem observation failed; do not promote partial evidence or update pins.');
  process.exitCode = 1;
});
