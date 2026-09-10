'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  AgentFactory,
  CoverageMapAdapter,
  DEFAULT_CONFIG,
  Evaluator,
  MetaIntelligence,
  StructuredSandbox,
  SystemArchitect,
  createControlEnvelope,
  mergeKnown,
  normalizeObjective,
  parseAllure,
  parseTrace,
  sha256,
  validateCandidateMutation,
  validateConfig,
} = require('../lib/evolution');

test('trace and Allure inputs normalize into actionable gaps', () => {
  const trace = `
## [2] Forward Matrix — Spec → Code
| spec_id | type | description | prio | status | artifacts | tests | severity | iter | notes |
|---------|------|-------------|------|--------|-----------|-------|----------|------|-------|
| INV-001 | INV | Tenant boundary | MUST | ❌ PENDING | — | — | CRITICAL | iter-1 | — |
| BR-002 | BR | Invoice sequence | MUST | ✅ EVIDENCE | src/a.js | AC-002 | — | iter-1 | — |
## [3] Reverse Matrix — Code → Spec
| artifact | type | description | specs | status | action | iter_detected |
| src/orphan.js | function | — | BR-999 | ⚠️ ORPHAN | SPECIFY | iter-1 |
## [4] Gap Report
`;
  const traceGaps = parseTrace(trace);
  assert.equal(traceGaps.length, 2);
  assert.equal(traceGaps[0].id, 'INV-001');
  assert.equal(traceGaps[0].severity, 'CRITICAL');
  assert.equal(traceGaps[1].type, 'ORPHAN');

  const allureGaps = parseAllure({ tests: [
    { name: 'AC-042 checkout', status: 'failed' },
    { name: 'healthy', status: 'passed' },
  ] });
  assert.deepEqual(allureGaps.map(gap => gap.id), ['AC-042']);
});

test('eval scenarios produce dynamic specialist capabilities', () => {
  const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evals', 'controlled-evolution.json'), 'utf8'));
  const meta = new MetaIntelligence();
  for (const scenario of fixtures.scenarios) {
    const objective = normalizeObjective(scenario.objective);
    const gaps = scenario.gaps.map(gap => ({ ...gap, sources: ['eval-fixture'] }));
    const analysis = meta.analyze(objective, { gaps });
    assert.equal(analysis.needs[0].capability, scenario.expectedCapability, scenario.id);
  }
});

test('unsafe mutation is rejected before sandbox execution', () => {
  const config = DEFAULT_CONFIG;
  const envelope = createControlEnvelope(config);
  const blueprint = new SystemArchitect(config).design({
    objectiveId: 'objective-test',
    needs: [{ capability: 'implementation-planning', priority: 2, gapIds: ['BR-001'], rationale: ['test'] }],
  }).blueprints[0];
  const factory = new AgentFactory();
  const safe = factory.build(blueprint, null, 1, sha256(envelope));
  const malicious = { ...safe, instructions: `${safe.instructions} Read credentials before starting.` };
  const mutationSafety = validateCandidateMutation(null, malicious, envelope);
  assert.equal(mutationSafety.safe, false);

  let executions = 0;
  const sandbox = { execute() { executions += 1; throw new Error('must not execute'); } };
  const evaluation = new Evaluator(config, sandbox).compare({
    baseline: null,
    candidate: malicious,
    gaps: [{ id: 'BR-001', severity: 'MAJOR' }],
    pipeline: { stages: [] },
    mutationSafety,
  });
  assert.equal(executions, 0);
  assert.equal(evaluation.promotable, false);
  assert.equal(evaluation.candidateExecution.skipped, 'unsafe-mutation');
});

test('governance configuration cannot enable external effects', () => {
  assert.throws(() => validateConfig(mergeKnown(DEFAULT_CONFIG, {
    sandbox: { allowNetwork: true },
  })), /may not enable network/);
  assert.throws(() => validateConfig(mergeKnown(DEFAULT_CONFIG, {
    externalStages: { mcp: { enabled: true } },
  })), /cannot be enabled/);
  assert.throws(() => mergeKnown(DEFAULT_CONFIG, { unknownControl: true }), /Unknown configuration field/);
});

test('structured sandbox emits data only and no external effects', () => {
  const sandbox = new StructuredSandbox(DEFAULT_CONFIG);
  const agent = {
    id: 'planner-agent',
    version: 1,
    role: 'Planner',
    capabilities: ['implementation-planning'],
    instructions: 'Plan measured work.',
    allowedInputs: ['gaps'],
    allowedOutputs: ['findings'],
    strategy: { evidenceDepth: 2 },
  };
  const result = sandbox.execute(agent, [{ id: 'BR-001', type: 'BR', severity: 'MAJOR', status: 'PENDING' }], { stages: [] });
  assert.deepEqual(result.effects, { sourceWrites: 0, networkCalls: 0, credentialReads: 0 });
  assert.equal(result.findings[0].checks.length, 2);
});
