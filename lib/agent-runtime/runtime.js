'use strict';

const {
  ZERO_EFFECTS,
  createBoundedContext,
  createRunRecord,
  deepFreeze,
  invariant,
  validateEffects,
  validatePlan,
  validateProviderProvenance,
  validateTask,
} = require('./contracts');
const { NullPlannerProvider } = require('./providers');

/**
 * Runs a planner only as a pure proposal generator.  This class intentionally
 * owns no filesystem, network, credential, shell, or source-write adapter.
 * A future external provider must be introduced outside this closed contract.
 */
class ReadOnlyPlanningRuntime {
  constructor(options = {}) {
    this.provider = options.provider || new NullPlannerProvider();
    invariant(this.provider && typeof this.provider.plan === 'function', 'A planner provider with a plan() method is required.');
    this.clock = options.clock || (() => new Date().toISOString());
  }

  plan(taskInput, contextInput) {
    const task = validateTask(taskInput);
    const context = createBoundedContext(task, contextInput);
    const startedAt = this.clock();
    const result = this.provider.plan({ task, context });
    invariant(result && typeof result === 'object', 'Planner provider must return an object.');
    const provider = validateProviderProvenance(result.provider);
    validateEffects(result.effects, 'Planner provider effects');
    const plan = validatePlan(task, context, result.plan);
    const completedAt = this.clock();
    const run = createRunRecord({
      task,
      context,
      plan,
      provider,
      startedAt,
      completedAt,
    });
    return deepFreeze({ task, context, plan, run, effects: ZERO_EFFECTS });
  }
}

module.exports = { ReadOnlyPlanningRuntime };
