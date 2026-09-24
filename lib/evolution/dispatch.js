'use strict';

const { deepFreeze, sha256 } = require('./utils');

/**
 * Executes declared specialist definitions only inside the existing structured
 * sandbox. It never selects tools or grants effects: those boundaries remain
 * owned by the versioned SPECTRA control envelope.
 */
class ControlledSpecialistDispatcher {
  constructor(sandbox) {
    this.sandbox = sandbox;
  }

  dispatch({ blueprints, candidates, gaps, pipeline }) {
    const byCapability = new Map(candidates.map(candidate => [candidate.capabilities[0], candidate]));
    const assignments = blueprints.map(blueprint => {
      const agent = byCapability.get(blueprint.primaryCapability);
      if (!agent) throw new Error(`No candidate available for ${blueprint.primaryCapability}.`);
      const assignedGaps = gaps.filter(gap => blueprint.focusGapIds.includes(gap.id));
      const output = this.sandbox.execute(agent, assignedGaps, pipeline);
      return {
        agent: { id: agent.id, version: agent.version, capability: blueprint.primaryCapability },
        gapIds: assignedGaps.map(gap => gap.id),
        output,
      };
    });
    const effects = assignments.reduce(
      (total, item) => ({
        sourceWrites: total.sourceWrites + item.output.effects.sourceWrites,
        networkCalls: total.networkCalls + item.output.effects.networkCalls,
        credentialReads: total.credentialReads + item.output.effects.credentialReads,
      }),
      { sourceWrites: 0, networkCalls: 0, credentialReads: 0 }
    );
    return deepFreeze({
      schemaVersion: 1,
      mode: 'structured-sandbox',
      assignments,
      effects,
      digest: sha256({ assignments, effects }),
    });
  }
}

/** Evaluator is deliberately separate from the dispatcher and fails closed. */
class IndependentDispatchEvaluator {
  evaluate({ dispatch, routePlan, gaps }) {
    const expected = new Set(gaps.map(gap => gap.id));
    const observed = new Set(dispatch.assignments.flatMap(item => item.gapIds));
    const missingGapIds = [...expected].filter(id => !observed.has(id));
    const unexpectedGapIds = [...observed].filter(id => !expected.has(id));
    const effectsSafe = Object.values(dispatch.effects).every(value => value === 0);
    const uniqueAgents = new Set(dispatch.assignments.map(item => `${item.agent.id}@${item.agent.version}`)).size === dispatch.assignments.length;
    const routeBound = routePlan.routes.every(route => Array.isArray(route.contract.effects) && route.contract.effects.length === 0);
    const passed = effectsSafe && uniqueAgents && routeBound && missingGapIds.length === 0 && unexpectedGapIds.length === 0;
    return deepFreeze({
      schemaVersion: 1,
      passed,
      checks: { effectsSafe, uniqueAgents, routeBound, completeGapCoverage: missingGapIds.length === 0, noUnexpectedGaps: unexpectedGapIds.length === 0 },
      missingGapIds,
      unexpectedGapIds,
      dispatchDigest: dispatch.digest,
    });
  }
}

module.exports = { ControlledSpecialistDispatcher, IndependentDispatchEvaluator };
