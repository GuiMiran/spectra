'use strict';

const {
  SCHEMA_VERSION,
  ZERO_EFFECTS,
  deepFreeze,
  sha256,
  validateContext,
  validatePlan,
  validateProviderProvenance,
  validateTask,
} = require('./contracts');

function planId(task, context, state, providerId) {
  return `plan-${sha256({ taskId: task.id, contextHash: context.contextHash, state, providerId }).slice(0, 24)}`;
}

function readOnlyProvenance(id, version, mode) {
  return validateProviderProvenance({
    schemaVersion: SCHEMA_VERSION,
    id,
    version,
    mode,
    networkAccess: false,
    sourceWriteAccess: false,
    credentialAccess: false,
    shellAccess: false,
    model: null,
  });
}

class NullPlannerProvider {
  constructor(options = {}) {
    this.id = options.id || 'null-planner';
    this.version = options.version || '1';
  }

  provenance() {
    return readOnlyProvenance(this.id, this.version, 'null');
  }

  plan({ task, context }) {
    const normalizedTask = validateTask(task);
    const normalizedContext = validateContext(normalizedTask, context);
    const provider = this.provenance();
    const plan = validatePlan(normalizedTask, normalizedContext, {
      schemaVersion: SCHEMA_VERSION,
      id: planId(normalizedTask, normalizedContext, 'unavailable', provider.id),
      taskId: normalizedTask.id,
      contextHash: normalizedContext.contextHash,
      state: 'unavailable',
      summary: 'No model-backed planner is configured. This read-only provider intentionally returns no execution plan.',
      assumptions: ['No external model, tool, filesystem, network, credential, or shell capability was invoked.'],
      risks: [{
        id: 'human-planning-required',
        severity: 'medium',
        description: 'The task has not been analyzed by a model-backed planner.',
        mitigation: 'A human must select and approve a bounded planner before any proposed implementation work.',
      }],
      steps: [],
      verification: [],
      requiresHumanApproval: true,
      effects: ZERO_EFFECTS,
    });
    return deepFreeze({ provider, plan, effects: ZERO_EFFECTS });
  }
}

class DryRunPlannerProvider {
  constructor(options = {}) {
    this.id = options.id || 'dry-run-planner';
    this.version = options.version || '1';
  }

  provenance() {
    return readOnlyProvenance(this.id, this.version, 'dry-run');
  }

  plan({ task, context }) {
    const normalizedTask = validateTask(task);
    const normalizedContext = validateContext(normalizedTask, context);
    const provider = this.provenance();
    const files = normalizedContext.files.map(file => file.path);
    const specIds = normalizedContext.specifications.map(specification => specification.id);
    const plan = validatePlan(normalizedTask, normalizedContext, {
      schemaVersion: SCHEMA_VERSION,
      id: planId(normalizedTask, normalizedContext, 'proposed', provider.id),
      taskId: normalizedTask.id,
      contextHash: normalizedContext.contextHash,
      state: 'proposed',
      summary: `Deterministic dry-run plan for: ${normalizedTask.objective}`,
      assumptions: [
        'This plan is generated deterministically from the supplied bounded context.',
        'No model, command, network request, credential, or source write was used.',
      ],
      risks: [{
        id: 'human-review-required',
        severity: 'medium',
        description: 'A dry-run cannot establish that a proposed implementation is correct.',
        mitigation: 'A human must review the proposal and independently select executable verification before any source change.',
      }],
      steps: [{
        id: 'review-bounded-context',
        title: 'Review the explicitly supplied task context',
        rationale: 'Use only the files and specification IDs admitted by the task boundary before proposing a change.',
        files,
        specIds,
      }],
      verification: [{
        id: 'human-confirm-success-criteria',
        description: 'A human verifies that the proposed next action satisfies every stated success criterion and remains within scope.',
        files,
        specIds,
      }],
      requiresHumanApproval: true,
      effects: ZERO_EFFECTS,
    });
    return deepFreeze({ provider, plan, effects: ZERO_EFFECTS });
  }
}

module.exports = {
  DryRunPlannerProvider,
  NullPlannerProvider,
  readOnlyProvenance,
};
