'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const CLI = path.join(__dirname, '..', 'bin', 'spectra.js');

function temporaryProject(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-cli-agent-'));
  fs.mkdirSync(path.join(root, '.spectra'), { recursive: true });
  fs.writeFileSync(path.join(root, 'task.json'), JSON.stringify({
    schemaVersion: 1,
    id: 'evidence-audit-plan',
    objective: 'Plan a read-only evidence audit.',
    successCriteria: [{ id: 'AC-001', description: 'Acceptance evidence is reviewed.' }],
    constraints: ['Do not modify source code.'],
    scope: {
      allowedFiles: ['test/cobro.service.spec.ts'],
      allowedSpecIds: ['AC-001'],
    },
  }, null, 2), 'utf8');
  fs.writeFileSync(path.join(root, 'context.json'), JSON.stringify({
    files: [{ path: 'test/cobro.service.spec.ts', content: '// @spectra AC-001\n' }],
    specifications: [{ id: 'AC-001', content: 'Payment rejection is independently tested.' }],
  }, null, 2), 'utf8');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function agentPlan(root, args = []) {
  const result = childProcess.spawnSync(process.execPath, [
    CLI,
    'agent',
    'plan',
    '--task',
    'task.json',
    '--context',
    'context.json',
    '--json',
    ...args,
  ], { cwd: root, encoding: 'utf8' });
  return { ...result, report: JSON.parse(result.stdout) };
}

test('agent plan creates a zero-effect bounded dry-run artifact', t => {
  const root = temporaryProject(t);
  const result = agentPlan(root, ['--output', '.spectra/agent-runs/evidence-audit.json']);

  assert.equal(result.status, 0);
  assert.equal(result.report.success, true);
  assert.equal(result.report.mode, 'read-only-planning');
  assert.equal(result.report.provider.mode, 'dry-run');
  assert.deepEqual(result.report.effects, {
    sourceWrites: 0,
    networkCalls: 0,
    credentialReads: 0,
    shellCommands: 0,
  });
  assert.equal(result.report.requiresHumanApproval, true);
  const artifact = path.join(root, '.spectra', 'agent-runs', 'evidence-audit.json');
  assert.equal(fs.existsSync(artifact), true);
  assert.equal(JSON.parse(fs.readFileSync(artifact, 'utf8')).run.decision.sourceWritesPermitted, false);
});

test('agent plan refuses output outside the controlled artifact directory', t => {
  const root = temporaryProject(t);
  const result = agentPlan(root, ['--output', 'plan.json']);

  assert.equal(result.status, 1);
  assert.equal(result.report.success, false);
  assert.match(result.report.error, /agent-runs/);
  assert.equal(fs.existsSync(path.join(root, 'plan.json')), false);
});
