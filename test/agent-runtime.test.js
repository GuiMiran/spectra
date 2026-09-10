'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  DryRunPlannerProvider,
  NullPlannerProvider,
  ReadOnlyPlanningRuntime,
  ZERO_EFFECTS,
  createBoundedContext,
  validatePlan,
  validateRunRecord,
  validateTask,
} = require('../lib/agent-runtime');

function task(overrides = {}) {
  return {
    schemaVersion: 1,
    id: 'payment-rejection-plan',
    objective: 'Plan evidence for rejecting insufficient payment.',
    successCriteria: [{ id: 'AC-001', description: 'The rejection path has independent acceptance evidence.' }],
    constraints: ['Do not change production data.', 'Keep the task within the payment service.'],
    scope: {
      allowedFiles: ['src/payment.service.js', 'test/payment.service.test.js', 'src/not-delivered.js'],
      allowedSpecIds: ['AC-001', 'BR-001', 'INV-001'],
    },
    ...overrides,
  };
}

function contextInput(overrides = {}) {
  return {
    files: [{
      path: 'src/payment.service.js',
      content: 'export function rejectPayment() { return false; }\n',
    }],
    specifications: [{
      id: 'AC-001',
      content: 'Given insufficient tender, when payment is attempted, then it is rejected.',
    }, {
      id: 'BR-001',
      content: 'A payment cannot complete when tender is less than total.',
    }],
    ...overrides,
  };
}

test('dry-run planner creates an immutable proposal confined to the supplied context', () => {
  let tick = 0;
  const runtime = new ReadOnlyPlanningRuntime({
    provider: new DryRunPlannerProvider(),
    clock: () => new Date(Date.UTC(2026, 0, 1, 0, 0, tick++)).toISOString(),
  });
  const result = runtime.plan(task(), contextInput());

  assert.equal(result.plan.state, 'proposed');
  assert.equal(result.plan.requiresHumanApproval, true);
  assert.deepEqual(result.effects, ZERO_EFFECTS);
  assert.deepEqual(result.plan.steps[0].files, ['src/payment.service.js']);
  assert.deepEqual(result.plan.steps[0].specIds, ['AC-001', 'BR-001']);
  assert.equal(result.run.decision.sourceWritesPermitted, false);
  assert.deepEqual(result.run.effects, ZERO_EFFECTS);
  assert.equal(result.run.provenance.provider.mode, 'dry-run');
  assert.deepEqual(result.run.provenance.contextManifest.files, [{
    path: 'src/payment.service.js',
    sha256: result.context.files[0].sha256,
  }]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.context.files[0]), true);
  assert.deepEqual(validateRunRecord(result.run), result.run);
});

test('null provider is explicit about no model-backed plan and still records zero effects', () => {
  const runtime = new ReadOnlyPlanningRuntime({
    provider: new NullPlannerProvider(),
    clock: () => '2026-01-01T00:00:00.000Z',
  });
  const result = runtime.plan(task(), contextInput());

  assert.equal(result.plan.state, 'unavailable');
  assert.deepEqual(result.plan.steps, []);
  assert.equal(result.run.state, 'unavailable');
  assert.deepEqual(result.run.effects, ZERO_EFFECTS);
  assert.equal(result.run.provenance.provider.mode, 'null');
});

test('task and context contracts reject paths, ids, and artifacts outside the declared boundary', () => {
  assert.throws(() => validateTask(task({
    scope: { allowedFiles: ['../secrets.env'], allowedSpecIds: ['AC-001'] },
  })), /parent segments/);
  assert.throws(() => validateTask(task({
    scope: { allowedFiles: ['src/payment.service.js'], allowedSpecIds: ['ac-001'] },
  })), /SPECTRA-style id/);
  assert.throws(() => validateTask(task({
    successCriteria: [{ id: 'AC-999', description: 'Outside the admitted specification scope.' }],
  })), /not allowed by Task.scope/);
  assert.throws(() => createBoundedContext(task(), contextInput({
    files: [{ path: 'package.json', content: '{}' }],
  })), /not allowed by Task.scope/);
  assert.throws(() => createBoundedContext(task(), contextInput({
    specifications: [{ id: 'INV-001', content: 'Not in scope input.' }, { id: 'EVT-999', content: 'Outside scope.' }],
  })), /not allowed by Task.scope/);
});

test('a plan cannot refer to an authorized-but-undelivered artifact or introduce executable fields', () => {
  const normalizedTask = validateTask(task());
  const context = createBoundedContext(normalizedTask, contextInput());
  const provider = new DryRunPlannerProvider();
  const generated = provider.plan({ task: normalizedTask, context }).plan;

  const absentArtifact = JSON.parse(JSON.stringify(generated));
  absentArtifact.steps[0].files = ['src/not-delivered.js'];
  assert.throws(() => validatePlan(normalizedTask, context, absentArtifact), /absent from the bounded context/);

  const executableField = JSON.parse(JSON.stringify(generated));
  executableField.toolCalls = [{ name: 'write-file' }];
  assert.throws(() => validatePlan(normalizedTask, context, executableField), /unknown field/);
});

test('runtime refuses a provider that claims or reports an external effect', () => {
  const base = new DryRunPlannerProvider();
  const unsafeProvider = {
    plan(request) {
      const result = base.plan(request);
      return {
        ...result,
        effects: { sourceWrites: 1, networkCalls: 0, credentialReads: 0, shellCommands: 0 },
      };
    },
  };
  const runtime = new ReadOnlyPlanningRuntime({ provider: unsafeProvider });
  assert.throws(() => runtime.plan(task(), contextInput()), /sourceWrites must be zero/);
});

test('agent runtime implementation imports no filesystem, network, or shell adapter', () => {
  const runtimeRoot = path.join(__dirname, '..', 'lib', 'agent-runtime');
  const source = ['contracts.js', 'providers.js', 'runtime.js']
    .map(file => fs.readFileSync(path.join(runtimeRoot, file), 'utf8'))
    .join('\n');
  assert.doesNotMatch(source, /require\(['"]node:(?:fs|child_process|http|https|net|tls)['"]\)/);
});
