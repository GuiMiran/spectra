'use strict';

const { deepFreeze, sha256 } = require('./utils');

// Fixed contracts: run inputs select evidence and focus, never permissions or code.
const CONTRACTS = deepFreeze({
  'sdd-auditor': {
    mode: 'supplied-evidence',
    inputs: ['.spectra/guido-audit.json'],
    outputs: ['repositoryAudit'],
    effects: [],
  },
  'gap-analyzer': {
    mode: 'internal-result',
    inputs: ['objective', 'trace', 'allureSummary', 'coverageMap'],
    outputs: ['gaps'],
    effects: [],
  },
  'qa-planner': {
    mode: 'internal-plan',
    inputs: ['objective', 'gaps', 'architecture'],
    outputs: ['pipeline', 'specialist-blueprints'],
    effects: [],
  },
});

function buildRoutePlan(coverageMap, architecture, pipeline) {
  const audit = coverageMap.repositoryAudit;
  const gapIds = coverageMap.gaps.map(gap => gap.id);
  const assignments = architecture.blueprints.map(blueprint => ({
    agentId: blueprint.agentId,
    capability: blueprint.primaryCapability,
    gapIds: [...blueprint.focusGapIds],
  }));
  const routes = [
    {
      id: 'sdd-auditor', contract: CONTRACTS['sdd-auditor'],
      status: audit ? 'evidence-provided' : 'awaiting-evidence',
      evidence: audit ? { source: audit.source, sha256: audit.sha256 } : null,
    },
    {
      id: 'gap-analyzer', contract: CONTRACTS['gap-analyzer'],
      status: 'completed', gapIds,
    },
    {
      id: 'qa-planner', contract: CONTRACTS['qa-planner'],
      status: 'planned', gapIds, assignments,
      stageIds: pipeline.stages.map(stage => stage.id),
    },
  ];
  return deepFreeze({ schemaVersion: 1, routes });
}

function routePlanDigest(plan) {
  return sha256(plan);
}

module.exports = { CONTRACTS, buildRoutePlan, routePlanDigest };
