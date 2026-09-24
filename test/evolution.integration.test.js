'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  AgentRegistry,
  CoverageMapAdapter,
  DEFAULT_CONFIG,
  MotherEvolutionLoop,
  IndependentDispatchEvaluator,
  mergeKnown,
  routePlanDigest,
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
  assert.deepEqual(second.routePlan.routes.map(route => [route.id, route.status]), [
    ['sdd-auditor', 'awaiting-evidence'],
    ['gap-analyzer', 'completed'],
    ['qa-planner', 'planned'],
  ]);
  assert.deepEqual(second.routePlan.routes[1].gapIds, ['INV-001']);
  assert.deepEqual(second.routePlan.routes[2].assignments[0].gapIds, ['INV-001']);
  assert.ok(second.routePlan.routes.every(route => route.contract.effects.length === 0));
  assert.deepEqual(JSON.parse(fs.readFileSync(second.runArtifact, 'utf8')).routePlan, second.routePlan);
  const started = fs.readFileSync(path.join(root, '.spectra', 'evolution', 'audit.jsonl'), 'utf8')
    .trim().split(/\r?\n/).map(line => JSON.parse(line))
    .find(event => event.type === 'run.started' && event.payload.runId === second.runId);
  assert.equal(started.payload.routePlanSha256, routePlanDigest(second.routePlan));
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

test('mother records GUIDO repository evidence without turning it into measured gaps', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'INV-001', type: 'INV', severity: 'CRITICAL', status: 'PENDING', description: 'Missing test evidence',
  }]);
  const adapter = new CoverageMapAdapter(root, DEFAULT_CONFIG);
  const objective = { statement: 'Review evidence' };
  const originalGaps = adapter.aggregate(objective).gaps;
  const report = {
    schema_version: '1.0', agent: 'sdd-auditor', repository: { commit: 'abc123' },
    guido_scale: { organizational_level: null, migration_effort: null },
    checks: [
      { id: 'specifications', status: 'observed', evidence: ['Spec/game/invariants.yaml'], evidence_count: 1 },
      { id: 'trace_map', status: 'no_evidence', evidence: [], evidence_count: 0 },
    ],
  };
  fs.writeFileSync(path.join(root, '.spectra', 'guido-audit.json'), JSON.stringify(report));
  const withAudit = adapter.aggregate(objective);
  assert.deepEqual(withAudit.gaps, originalGaps);
  assert.equal(withAudit.inputs.guidoAudit, true);
  assert.deepEqual(withAudit.repositoryAudit.checks, [
    { id: 'specifications', status: 'observed', evidenceCount: 1 },
    { id: 'trace_map', status: 'no_evidence', evidenceCount: 0 },
  ]);

  const result = new MotherEvolutionLoop(root, { clock }).run({ objective: objective.statement });
  assert.equal(result.coverageMap.repositoryAudit.repositoryCommit, 'abc123');
  assert.equal(result.routePlan.routes[0].status, 'evidence-provided');
  assert.equal(result.routePlan.routes[0].evidence.sha256, result.coverageMap.repositoryAudit.sha256);
  assert.deepEqual(result.routePlan.routes[1].gapIds, originalGaps.map(gap => gap.id));
  assert.equal(result.coverageMap.gaps.length, 1);
  assert.equal(result.registry.audit.valid, true);
  assert.equal(result.registry.active[0].capability, 'invariant-assurance');
  assert.equal(JSON.parse(fs.readFileSync(result.runArtifact, 'utf8')).coverageMap.repositoryAudit.observed, 1);
});

test('mother rejects malformed or external GUIDO audit input before persisting a run', t => {
  const { root, clock } = tempProject(t);
  const reportPath = path.join(root, '.spectra', 'guido-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify({ schema_version: '1.0', agent: 'sdd-auditor', checks: [
    { id: 'unit_agent', status: 'no_evidence', evidence: ['game/agent.py'], evidence_count: 1 },
  ] }));
  assert.throws(() => new MotherEvolutionLoop(root, { clock }).run({ objective: 'Review evidence' }), /invalid check evidence/);
  assert.equal(fs.existsSync(path.join(root, '.spectra', 'evolution', 'registry.json')), false);

  fs.rmSync(reportPath);
  const outside = path.join(os.tmpdir(), `external-guido-${process.pid}.json`);
  fs.writeFileSync(outside, '{}');
  t.after(() => fs.rmSync(outside, { force: true }));
  fs.symlinkSync(outside, reportPath);
  assert.throws(() => new MotherEvolutionLoop(root, { clock }).run({ objective: 'Review evidence' }), /regular JSON file/);
});


test('mother dispatches active specialists only through the zero-effect sandbox and independent evaluator', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [
    { id: 'INV-001', type: 'INV', severity: 'CRITICAL', status: 'PENDING', description: 'Invariant evidence' },
    { id: 'TEST-002', type: 'TEST', severity: 'MAJOR', status: 'FAILED', description: 'Acceptance failure' },
  ]);
  const result = new MotherEvolutionLoop(root, { clock }).run({ objective: 'Evaluate two specialist routes' });
  assert.equal(result.dispatch.mode, 'structured-sandbox');
  assert.equal(result.dispatch.assignments.length, 2);
  assert.equal(result.dispatch.effects.sourceWrites, 0);
  assert.equal(result.dispatch.effects.networkCalls, 0);
  assert.equal(result.dispatch.effects.credentialReads, 0);
  assert.equal(result.dispatchEvaluation.passed, true);
  assert.equal(result.dispatchEvaluation.checks.completeGapCoverage, true);
  assert.equal(result.dispatchEvaluation.checks.routeBound, true);
  const artifact = JSON.parse(fs.readFileSync(result.runArtifact, 'utf8'));
  assert.equal(artifact.dispatchEvaluation.dispatchDigest, result.dispatch.digest);
});

test('independent dispatch evaluator rejects assignments without matching findings', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'GAME-04-M1-REPLAY', type: 'AC', severity: 'MAJOR', status: 'PENDING',
    description: 'Replay requires an independent evaluator',
  }]);
  const result = new MotherEvolutionLoop(root, { clock }).run({ objective: 'Plan replay' });
  const evaluator = new IndependentDispatchEvaluator();
  const modified = JSON.parse(JSON.stringify(result.dispatch));
  modified.assignments[0].output.findings = [];
  const verdict = evaluator.evaluate({ dispatch: modified, routePlan: result.routePlan,
    gaps: result.coverageMap.gaps });
  assert.equal(verdict.passed, false);
  assert.equal(verdict.checks.completeGapCoverage, true);
  assert.equal(verdict.checks.findingsMatchAssignments, false);
  assert.equal(verdict.checks.digestValid, false);
});

test('independent dispatch evaluator rejects duplicate assignments and unplanned specialists', t => {
  const { root, clock } = tempProject(t);
  writeCoverageMap(root, [{
    id: 'GAME-04-M1-SIMULATION', type: 'OBJECTIVE', severity: 'MAJOR', status: 'PENDING',
    description: 'Simulation pending',
  }]);
  const result = new MotherEvolutionLoop(root, { clock }).run({ objective: 'Plan simulation' });
  const evaluator = new IndependentDispatchEvaluator();
  const modified = JSON.parse(JSON.stringify(result.dispatch));
  modified.assignments.push(JSON.parse(JSON.stringify(modified.assignments[0])));
  const verdict = evaluator.evaluate({ dispatch: modified, routePlan: result.routePlan,
    gaps: result.coverageMap.gaps });
  assert.equal(verdict.passed, false);
  assert.equal(verdict.checks.uniqueGapAssignments, false);
  assert.equal(verdict.checks.matchesPlan, false);
});
