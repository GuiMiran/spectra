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
    const assignments = Array.isArray(dispatch?.assignments) ? dispatch.assignments : [];
    const expected = new Set(gaps.map(gap => gap.id));
    const observed = new Set(assignments.flatMap(item => Array.isArray(item.gapIds) ? item.gapIds : []));
    const missingGapIds = [...expected].filter(id => !observed.has(id));
    const unexpectedGapIds = [...observed].filter(id => !expected.has(id));
    const effectKeys = ['sourceWrites', 'networkCalls', 'credentialReads'];
    const zeroEffects = effects => effects && effectKeys.every(key => effects[key] === 0)
      && Object.keys(effects).length === effectKeys.length;
    const effectsSafe = zeroEffects(dispatch?.effects)
      && assignments.every(item => zeroEffects(item.output?.effects));
    const keys = assignments.map(item => `${item.agent?.id}@${item.agent?.version}`);
    const uniqueAgents = new Set(keys).size === assignments.length
      && assignments.every(item => typeof item.agent?.id === 'string' && Number.isInteger(item.agent?.version));
    const routes = routePlan?.routes;
    const routeBound = Array.isArray(routes) && routes.length > 0
      && routes.every(route => Array.isArray(route.contract?.effects) && route.contract.effects.length === 0);
    const planned = routes?.find(route => route.id === 'qa-planner')?.assignments;
    const matchesPlan = Array.isArray(planned) && planned.length === assignments.length
      && assignments.every(item => planned.some(plan => plan.agentId === item.agent?.id
        && plan.capability === item.agent?.capability
        && Array.isArray(item.gapIds) && Array.isArray(plan.gapIds)
        && item.gapIds.length === plan.gapIds.length
        && new Set(item.gapIds).size === item.gapIds.length
        && item.gapIds.every(id => plan.gapIds.includes(id))));
    const assignedIds = assignments.flatMap(item => Array.isArray(item.gapIds) ? item.gapIds : []);
    const uniqueGapAssignments = assignedIds.length === new Set(assignedIds).size;
    const findingsMatchAssignments = assignments.every(item => {
      const findings = item.output?.findings;
      if (!Array.isArray(findings) || !Array.isArray(item.gapIds)
        || item.output?.agent?.id !== item.agent?.id
        || item.output?.agent?.version !== item.agent?.version
        || findings.length !== item.gapIds.length) return false;
      const findingIds = findings.map(finding => finding?.gapId);
      return new Set(findingIds).size === findingIds.length
        && findings.every(finding => item.gapIds.includes(finding.gapId)
          && finding.capability === item.agent.capability);
    });
    const digestValid = typeof dispatch?.digest === 'string'
      && dispatch.digest === sha256({ assignments, effects: dispatch.effects });
    const passed = effectsSafe && uniqueAgents && routeBound && matchesPlan
      && uniqueGapAssignments && findingsMatchAssignments && digestValid
      && missingGapIds.length === 0 && unexpectedGapIds.length === 0;
    return deepFreeze({
      schemaVersion: 1,
      passed,
      checks: { effectsSafe, uniqueAgents, routeBound, matchesPlan, uniqueGapAssignments,
        findingsMatchAssignments, digestValid, completeGapCoverage: missingGapIds.length === 0,
        noUnexpectedGaps: unexpectedGapIds.length === 0 },
      missingGapIds,
      unexpectedGapIds,
      dispatchDigest: dispatch.digest,
    });
  }
}

module.exports = { ControlledSpecialistDispatcher, IndependentDispatchEvaluator };
