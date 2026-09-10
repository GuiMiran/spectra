'use strict';

const { validateAgent, validateMutation } = require('./contracts');
const { deepFreeze, slug, unique } = require('./utils');

const SEVERITY_WEIGHT = { CRITICAL: 3, MAJOR: 2, MINOR: 1 };

class MetaIntelligence {
  analyze(objective, coverageMap) {
    const grouped = new Map();
    coverageMap.gaps.forEach(gap => {
      const capability = this.capabilityFor(gap);
      const current = grouped.get(capability) || {
        capability,
        priority: 0,
        gapIds: [],
        rationale: [],
      };
      current.priority += SEVERITY_WEIGHT[gap.severity] || 1;
      current.gapIds.push(gap.id);
      current.rationale.push(`${gap.id}:${gap.type}:${gap.status}`);
      grouped.set(capability, current);
    });

    const needs = [...grouped.values()]
      .map(need => ({ ...need, gapIds: unique(need.gapIds), rationale: unique(need.rationale) }))
      .sort((left, right) => right.priority - left.priority || left.capability.localeCompare(right.capability));

    return deepFreeze({
      objectiveId: objective.id,
      objectiveStatement: objective.statement,
      needs,
      decision: `Create or improve ${needs.length} specialist role(s) for ${coverageMap.gaps.length} measured gap(s).`,
    });
  }

  capabilityFor(gap) {
    if (gap.type === 'TEST' || gap.sources.includes('allure-summary')) return 'test-failure-analysis';
    if (gap.type === 'ORPHAN' || gap.status === 'ORPHAN') return 'reverse-trace-analysis';
    if (gap.type === 'INV' || gap.type === 'SK' || gap.severity === 'CRITICAL') return 'invariant-assurance';
    if (gap.status === 'PARTIAL') return 'evidence-completion';
    if (gap.type === 'OBJECTIVE') return 'objective-decomposition';
    return 'implementation-planning';
  }
}

const ROLE_CATALOG = Object.freeze({
  'test-failure-analysis': {
    role: 'Test Failure Analyst',
    instruction: 'Correlate failing tests with specification evidence and produce a reproducible diagnostic plan.',
  },
  'reverse-trace-analysis': {
    role: 'Reverse Trace Auditor',
    instruction: 'Classify artifacts without a valid specification reference and recommend specify, refactor, or review actions.',
  },
  'invariant-assurance': {
    role: 'Invariant Assurance Specialist',
    instruction: 'Prioritize invariant evidence, identify failure modes, and define independent verification checks.',
  },
  'evidence-completion': {
    role: 'Evidence Completion Specialist',
    instruction: 'Identify the missing artifact or acceptance evidence and produce the smallest reviewable completion plan.',
  },
  'objective-decomposition': {
    role: 'Objective Decomposition Specialist',
    instruction: 'Turn an unassessed objective into measurable gaps, acceptance evidence, and ordered work items.',
  },
  'implementation-planning': {
    role: 'Implementation Planner',
    instruction: 'Translate specification gaps into ordered, reviewable implementation and verification tasks.',
  },
});

class SystemArchitect {
  constructor(config) {
    this.config = config;
  }

  design(metaAnalysis) {
    const selected = metaAnalysis.needs.slice(0, this.config.limits.maxAgents);
    return deepFreeze({
      objectiveId: metaAnalysis.objectiveId,
      blueprints: selected.map(need => {
        const catalog = ROLE_CATALOG[need.capability] || ROLE_CATALOG['implementation-planning'];
        return {
          agentId: `${slug(need.capability)}-agent`,
          role: catalog.role,
          primaryCapability: need.capability,
          capabilities: [need.capability],
          instruction: catalog.instruction,
          focusGapIds: need.gapIds,
          priority: need.priority,
          rationale: need.rationale,
        };
      }),
      rationale: selected.map(need => `${need.capability} covers ${need.gapIds.join(', ')}`),
    });
  }
}

class AgentFactory {
  build(blueprint, baseline, nextVersion, controlEnvelopeHash, rootCause = null) {
    const previousDepth = baseline?.strategy?.evidenceDepth || 0;
    const evidenceDepth = Math.min(3, previousDepth + 1);
    const improvementNote = rootCause
      ? ` Address prior finding: ${rootCause.summary}`
      : '';
    const candidate = {
      id: blueprint.agentId,
      version: nextVersion,
      role: blueprint.role,
      capabilities: [...blueprint.capabilities],
      instructions: `${blueprint.instruction} Focus on ${blueprint.focusGapIds.join(', ')}.${improvementNote}`,
      allowedInputs: ['objective', 'gaps', 'coverage-map', 'pipeline-state'],
      allowedOutputs: ['findings', 'execution-plan', 'evaluation-evidence'],
      strategy: {
        evidenceDepth,
        focusGapIds: [...blueprint.focusGapIds],
        ordering: 'severity-then-id',
      },
      controlEnvelopeHash,
    };
    return validateAgent(candidate);
  }
}

class PipelineOrchestrator {
  plan(coverageMap, config, architecture) {
    const external = config.externalStages;
    return deepFreeze({
      stages: [
        { id: 'allure-aggregator', status: coverageMap.inputs.allureSummary ? 'consumed' : 'not-provided', mutating: false },
        { id: 'coverage-map', status: 'completed', mutating: false },
        { id: 'gap-engine', status: 'completed', mutating: false },
        { id: 'planner', status: 'ready', mutating: false },
        { id: 'mcp-dispatch', status: external.mcp.enabled ? 'ready' : 'disabled', mutating: true },
        { id: 'pull-request', status: external.pullRequest.enabled ? 'ready' : 'disabled', mutating: true },
        { id: 're-execution', status: external.rerun.enabled ? 'ready' : 'disabled', mutating: true },
      ],
      agents: architecture.blueprints.map(blueprint => ({
        id: blueprint.agentId,
        capability: blueprint.primaryCapability,
        gapIds: blueprint.focusGapIds,
      })),
    });
  }
}

class StructuredSandbox {
  constructor(config) {
    this.config = config;
  }

  execute(agent, gaps, pipeline) {
    if (this.config.sandbox.allowNetwork || this.config.sandbox.allowCredentials || this.config.sandbox.allowSourceWrites) {
      throw new Error('Structured sandbox refuses unsafe capabilities.');
    }
    const depth = Math.max(1, Math.min(3, Number(agent.strategy.evidenceDepth) || 1));
    const findings = gaps.map(gap => ({
      gapId: gap.id,
      severity: gap.severity,
      capability: agent.capabilities[0],
      recommendation: this.recommendationFor(gap),
      recommendedStage: this.stageFor(gap),
      checks: Array.from({ length: depth }, (_, index) => `${gap.id}-check-${index + 1}`),
    }));
    return deepFreeze({
      agent: { id: agent.id, version: agent.version },
      findings,
      executionPlan: pipeline.stages.map(stage => ({ id: stage.id, status: stage.status })),
      effects: {
        sourceWrites: 0,
        networkCalls: 0,
        credentialReads: 0,
      },
    });
  }

  recommendationFor(gap) {
    if (gap.type === 'TEST') return 'Reproduce the failure, map it to acceptance evidence, then propose the smallest correction.';
    if (gap.type === 'ORPHAN') return 'Resolve the missing specification reference before changing the artifact.';
    if (gap.type === 'INV' || gap.severity === 'CRITICAL') return 'Add independent invariant evidence before implementation proceeds.';
    if (gap.status === 'PARTIAL') return 'Complete the missing artifact or acceptance link and verify behavior independently.';
    return 'Create an ordered implementation task with explicit acceptance evidence.';
  }

  stageFor(gap) {
    if (gap.type === 'TEST') return 're-execution';
    if (gap.type === 'ORPHAN') return 'gap-engine';
    return 'planner';
  }
}

class Evaluator {
  constructor(config, sandbox) {
    this.config = config;
    this.sandbox = sandbox;
  }

  score(agent, execution, gaps) {
    if (!agent || !execution) {
      return { score: 0, metrics: { gapCoverage: 0, priorityCoverage: 0, pipelineReadiness: 0, specificity: 0 } };
    }
    const coveredIds = new Set(execution.findings.map(finding => finding.gapId));
    const totalPriority = gaps.reduce((sum, gap) => sum + (SEVERITY_WEIGHT[gap.severity] || 1), 0) || 1;
    const coveredPriority = gaps
      .filter(gap => coveredIds.has(gap.id))
      .reduce((sum, gap) => sum + (SEVERITY_WEIGHT[gap.severity] || 1), 0);
    const metrics = {
      gapCoverage: gaps.length ? coveredIds.size / gaps.length : 1,
      priorityCoverage: coveredPriority / totalPriority,
      pipelineReadiness: gaps.length
        ? execution.findings.filter(finding => finding.recommendedStage).length / gaps.length
        : 1,
      specificity: execution.findings.length
        ? execution.findings.reduce((sum, finding) => sum + Math.min(3, finding.checks.length) / 3, 0) / execution.findings.length
        : 0,
    };
    const score = Object.entries(this.config.evaluation.weights)
      .reduce((sum, [metric, weight]) => sum + metrics[metric] * weight, 0);
    return { score: Number(score.toFixed(6)), metrics };
  }

  compare({ baseline, candidate, gaps, pipeline, mutationSafety }) {
    const baselineExecution = baseline ? this.sandbox.execute(baseline, gaps, pipeline) : null;
    const candidateExecution = mutationSafety.safe
      ? this.sandbox.execute(candidate, gaps, pipeline)
      : {
          agent: { id: candidate.id, version: candidate.version },
          findings: [],
          executionPlan: [],
          effects: { sourceWrites: 0, networkCalls: 0, credentialReads: 0 },
          skipped: 'unsafe-mutation',
        };
    const baselineScore = this.score(baseline, baselineExecution, gaps);
    const candidateScore = this.score(candidate, candidateExecution, gaps);
    const improvement = Number((candidateScore.score - baselineScore.score).toFixed(6));
    const capabilityCoverage = gaps.length
      ? candidateExecution.findings.filter(finding => candidate.capabilities.includes(finding.capability)).length / gaps.length
      : 1;
    const effectsSafe = Object.values(candidateExecution.effects).every(value => value === 0);
    const safetyPassed = mutationSafety.safe && effectsSafe;
    const promotable = safetyPassed
      && (!this.config.promotion.requireCompleteCapabilityCoverage || capabilityCoverage === 1)
      && improvement >= this.config.promotion.minimumImprovement;
    return deepFreeze({
      baseline: baselineScore,
      candidate: candidateScore,
      improvement,
      minimumImprovement: this.config.promotion.minimumImprovement,
      capabilityCoverage,
      safety: { passed: safetyPassed, mutation: mutationSafety, effects: candidateExecution.effects },
      promotable,
      candidateExecution,
      baselineExecution,
    });
  }
}

class RootCauseAnalysis {
  analyze(evaluation) {
    const causes = [];
    if (!evaluation.safety.passed) causes.push('candidate-failed-safety-gate');
    if (evaluation.capabilityCoverage < 1) causes.push('incomplete-capability-coverage');
    if (evaluation.improvement < evaluation.minimumImprovement) causes.push('insufficient-measured-improvement');
    if (evaluation.candidate.metrics.specificity === 1 && evaluation.improvement <= 0) causes.push('bounded-strategy-saturated');
    return deepFreeze({
      causes,
      summary: causes.length ? causes.join(', ') : 'no-root-cause',
      nextProposal: causes.includes('bounded-strategy-saturated')
        ? 'Retain the active baseline until new gaps or eval fixtures provide evidence for another variant.'
        : 'Increase evidence specificity within the mutable agent strategy and evaluate again.',
    });
  }
}

class EvolutionEngine {
  constructor(config, rootCauseAnalysis = new RootCauseAnalysis()) {
    this.config = config;
    this.rootCauseAnalysis = rootCauseAnalysis;
  }

  decide(evaluation) {
    if (this.config.promotion.enabled && evaluation.promotable) {
      return deepFreeze({ action: 'promote', reason: 'candidate-exceeds-baseline', rootCause: null });
    }
    const rootCause = this.rootCauseAnalysis.analyze(evaluation);
    return deepFreeze({ action: 'reject', reason: rootCause.summary, rootCause });
  }
}

function validateCandidateMutation(baseline, candidate, controlEnvelope) {
  return validateMutation(baseline, candidate, controlEnvelope);
}

module.exports = {
  AgentFactory,
  Evaluator,
  EvolutionEngine,
  MetaIntelligence,
  PipelineOrchestrator,
  RootCauseAnalysis,
  StructuredSandbox,
  SystemArchitect,
  validateCandidateMutation,
};
