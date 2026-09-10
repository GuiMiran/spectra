'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  AgentRegistry,
  DEFAULT_CONFIG,
  MotherEvolutionLoop,
  mergeKnown,
  validateConfig,
} = require('../lib/evolution');

function tempProject(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spectra-evolution-'));
  fs.mkdirSync(path.join(root, '.spectra'), { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  let tick = 0;
  const clock = () => new Date(Date.UTC(2026, 0, 1, 0, 0, 0, tick++)).toISOString();
  return { root, clock };
}

function writeCoverageMap(root, gaps) {
  fs.writeFileSync(
    path.join(root, '.spectra', 'coverage-map.json'),
    `${JSON.stringify({ schemaVersion: 1, gaps }, null, 2)}\n`,
    'utf8'
  );
}

test('Mother loop promotes only measured improvement and rejects weaker variants', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'INV-001',
    type: 'INV',
    severity: 'CRITICAL',
    status: 'PENDING',
    description: 'Tenant isolation lacks evidence',
  }]);

  const strictConfig = validateConfig(mergeKnown(DEFAULT_CONFIG, {
    evaluation: { targetScore: 1 },
    promotion: { minimumImprovement: 0.1 },
  }));
  const first = new MotherEvolutionLoop(root, { clock, config: strictConfig }).run({
    objective: 'Close all critical invariant gaps',
    iterations: 2,
  });
  const firstOutcomes = first.iterations.flatMap(iteration => iteration.outcomes);
  assert.deepEqual(firstOutcomes.map(outcome => outcome.action), ['promote', 'reject']);
  assert.deepEqual(firstOutcomes.map(outcome => outcome.version), [1, 2]);
  assert.equal(first.registry.active[0].version, 1);
  assert.equal(first.registry.audit.valid, true);

  const second = new MotherEvolutionLoop(root, { clock, config: strictConfig }).run({
    objective: 'Close all critical invariant gaps',
    iterations: 1,
  });
  const secondOutcome = second.iterations[0].outcomes[0];
  assert.equal(secondOutcome.version, 3);
  assert.equal(secondOutcome.action, 'reject');
  assert.match(secondOutcome.reason, /insufficient-measured-improvement/);
  assert.equal(second.registry.active[0].version, 1);
  assert.equal(second.registry.lifecycle.rejected, 2);
  assert.equal(second.registry.audit.valid, true);
  assert.ok(fs.existsSync(second.runArtifact));
});

test('Mother loop stops creating variants when the target score is met', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'BR-001', type: 'BR', severity: 'MAJOR', status: 'PENDING', description: 'Business gap',
  }]);
  const result = new MotherEvolutionLoop(root, { clock }).run({ objective: 'Resolve current gaps', iterations: 3 });
  const outcomes = result.iterations.flatMap(iteration => iteration.outcomes);
  assert.deepEqual(outcomes.map(outcome => outcome.action), ['promote', 'promote']);
  assert.equal(result.registry.active[0].version, 2);
  assert.equal(result.registry.active[0].score, DEFAULT_CONFIG.evaluation.targetScore);
});

test('active agents are retired when the measured capability is no longer required', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'INV-001', type: 'INV', severity: 'CRITICAL', status: 'PENDING', description: 'Invariant gap',
  }]);
  new MotherEvolutionLoop(root, { clock }).run({ objective: 'Resolve current gaps', iterations: 1 });

  writeCoverageMap(root, [{
    id: 'AC-010', type: 'TEST', severity: 'MAJOR', status: 'FAILED', description: 'Test failure',
  }]);
  const result = new MotherEvolutionLoop(root, { clock }).run({ objective: 'Resolve current gaps', iterations: 1 });
  assert.deepEqual(result.registry.active.map(agent => agent.capability), ['test-failure-analysis']);
  assert.equal(result.retired.length, 1);
  assert.equal(result.retired[0].capability, 'invariant-assurance');
  assert.equal(result.registry.audit.valid, true);
});

test('audit verification detects tampering', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'BR-001', type: 'BR', severity: 'MAJOR', status: 'PENDING', description: 'Business gap',
  }]);
  new MotherEvolutionLoop(root, { clock }).run({ objective: 'Resolve current gaps', iterations: 1 });
  const registry = new AgentRegistry(root, { clock });
  assert.equal(registry.verifyAuditChain().valid, true);

  const auditFile = path.join(root, '.spectra', 'evolution', 'audit.jsonl');
  const lines = fs.readFileSync(auditFile, 'utf8').trim().split(/\r?\n/);
  const first = JSON.parse(lines[0]);
  first.payload.runId = 'tampered-run';
  lines[0] = JSON.stringify(first);
  fs.writeFileSync(auditFile, `${lines.join('\n')}\n`, 'utf8');
  assert.equal(registry.verifyAuditChain().valid, false);
});
