'use strict';

const path = require('path');
const { createControlEnvelope, normalizeObjective } = require('./contracts');
const { loadConfig } = require('./config');
const { CoverageMapAdapter } = require('./gap-engine');
const { AgentRegistry } = require('./registry');
const { buildRoutePlan, routePlanDigest } = require('./router');
const {
  AgentFactory,
  Evaluator,
  EvolutionEngine,
  MetaIntelligence,
  PipelineOrchestrator,
  StructuredSandbox,
  SystemArchitect,
  validateCandidateMutation,
} = require('./components');
const { ensureDir, sha256, writeJsonAtomic } = require('./utils');

class MotherEvolutionLoop {
  constructor(projectRoot, options = {}) {
    this.projectRoot = path.resolve(projectRoot);
    this.config = options.config || loadConfig(this.projectRoot, options.configPath);
    this.clock = options.clock || (() => new Date().toISOString());
    this.registry = options.registry || new AgentRegistry(this.projectRoot, {
      clock: this.clock,
      maxAgentVersions: this.config.limits.maxAgentVersions,
    });
    this.coverageAdapter = options.coverageAdapter || new CoverageMapAdapter(this.projectRoot, this.config);
    this.meta = options.meta || new MetaIntelligence();
    this.architect = options.architect || new SystemArchitect(this.config);
    this.factory = options.factory || new AgentFactory();
    this.orchestrator = options.orchestrator || new PipelineOrchestrator();
    this.sandbox = options.sandbox || new StructuredSandbox(this.config);
    this.evaluator = options.evaluator || new Evaluator(this.config, this.sandbox);
    this.evolution = options.evolution || new EvolutionEngine(this.config);
  }

  run(options) {
    const objective = normalizeObjective(
      options.objective,
      options.successCriteria || [],
      options.constraints || []
    );
    const requestedIterations = Number(options.iterations || 1);
    const iterations = Math.max(1, Math.min(requestedIterations, this.config.limits.maxIterations));
    const controlEnvelope = createControlEnvelope(this.config);
    const controlEnvelopeHash = sha256(controlEnvelope);
    const runId = this.createRunId(objective);
    const coverageMap = this.coverageAdapter.aggregate(objective);
    const metaAnalysis = this.meta.analyze(objective, coverageMap);
    const architecture = this.architect.design(metaAnalysis);
    const pipeline = this.orchestrator.plan(coverageMap, this.config, architecture);
    const routePlan = buildRoutePlan(coverageMap, architecture, pipeline);

    this.registry.appendAudit('run.started', {
      runId,
      objective,
      inputs: coverageMap.inputs,
      guidoAuditSha256: coverageMap.repositoryAudit?.sha256 || null,
      gapIds: coverageMap.gaps.map(gap => gap.id),
      controlEnvelopeHash,
      routePlanSha256: routePlanDigest(routePlan),
    });
    this.registry.appendAudit('architecture.designed', {
      runId,
      decision: metaAnalysis.decision,
      rationale: architecture.rationale,
      agents: architecture.blueprints.map(blueprint => ({
        id: blueprint.agentId,
        capability: blueprint.primaryCapability,
        gapIds: blueprint.focusGapIds,
      })),
    });
    this.registry.save();

    const iterationResults = [];
    const priorRootCauses = new Map();
    for (let iteration = 1; iteration <= iterations; iteration += 1) {
      const outcomes = [];
      for (const blueprint of architecture.blueprints) {
        const baselineRecord = this.registry.getActive(blueprint.primaryCapability);
        const baseline = baselineRecord?.definition || null;
        const baselineScore = baselineRecord?.evaluation?.candidate?.score ?? 0;
        if (baseline && baselineScore >= this.config.evaluation.targetScore) {
          const outcome = {
            agentId: blueprint.agentId,
            baselineVersion: baseline.version,
            action: 'skip',
            reason: 'target-score-met',
            baselineScore,
          };
          this.registry.appendAudit('candidate.skipped', { runId, iteration, ...outcome });
          this.registry.save();
          outcomes.push(outcome);
          continue;
        }
        const knownVersions = this.registry.versions(blueprint.agentId);
        if (knownVersions.length >= this.config.limits.maxAgentVersions) {
          const outcome = {
            agentId: blueprint.agentId,
            action: 'skip',
            reason: 'max-agent-versions-reached',
          };
          this.registry.appendAudit('candidate.skipped', { runId, iteration, ...outcome });
          this.registry.save();
          outcomes.push(outcome);
          continue;
        }
        const nextVersion = knownVersions.reduce(
          (max, record) => Math.max(max, record.definition.version),
          0
        ) + 1;
        const candidate = this.factory.build(
          blueprint,
          baseline,
          nextVersion,
          controlEnvelopeHash,
          priorRootCauses.get(blueprint.agentId) || null
        );
        const mutationSafety = validateCandidateMutation(baseline, candidate, controlEnvelope);
        const mutation = {
          changedPaths: mutationSafety.changedPaths,
          safetyPassed: mutationSafety.safe,
          reasons: mutationSafety.reasons,
        };
        this.registry.registerCandidate(candidate, {
          runId,
          supersedes: baseline ? { id: baseline.id, version: baseline.version } : null,
          mutation,
        });

        const assignedGaps = coverageMap.gaps.filter(gap => blueprint.focusGapIds.includes(gap.id));
        const evaluation = this.evaluator.compare({
          baseline,
          candidate,
          gaps: assignedGaps,
          pipeline,
          mutationSafety,
        });
        this.registry.recordEvaluation(candidate.id, candidate.version, evaluation, runId);
        const decision = this.evolution.decide(evaluation);
        if (decision.action === 'promote') {
          this.registry.promote(candidate.id, candidate.version, evaluation, runId);
          priorRootCauses.delete(candidate.id);
        } else {
          this.registry.reject(candidate.id, candidate.version, decision.reason, evaluation, runId);
          priorRootCauses.set(candidate.id, decision.rootCause);
        }
        outcomes.push({
          agentId: candidate.id,
          version: candidate.version,
          baselineVersion: baseline?.version || null,
          action: decision.action,
          reason: decision.reason,
          score: evaluation.candidate.score,
          baselineScore: evaluation.baseline.score,
          improvement: evaluation.improvement,
          safetyPassed: evaluation.safety.passed,
          rootCause: decision.rootCause,
        });
      }
      iterationResults.push({ iteration, outcomes });
      const targetMet = architecture.blueprints.every(blueprint => {
        const active = this.registry.getActive(blueprint.primaryCapability);
        return (active?.evaluation?.candidate?.score ?? 0) >= this.config.evaluation.targetScore;
      });
      if (targetMet) break;
    }

    const requiredCapabilities = metaAnalysis.needs.map(need => need.capability);
    const retired = this.registry.retireUnneeded(requiredCapabilities, runId);
    const auditBeforeCompletion = this.registry.verifyAuditChain();
    const runRoot = path.resolve(this.projectRoot, this.config.sandbox.allowedWriteRoot);
    const allowedRoot = path.resolve(this.projectRoot, '.spectra', 'evolution', 'runs');
    if (runRoot !== allowedRoot) throw new Error('Run artifact path escaped the configured safe root.');
    const runDir = path.join(runRoot, runId);
    const runArtifact = path.join(runDir, 'run.json');
    this.registry.appendAudit('run.completed', {
      runId,
      iterations: iterationResults.length,
      promoted: iterationResults.flatMap(item => item.outcomes).filter(item => item.action === 'promote').length,
      rejected: iterationResults.flatMap(item => item.outcomes).filter(item => item.action === 'reject').length,
      runArtifact: path.relative(this.projectRoot, runArtifact),
    });
    this.registry.save();
    const result = {
      schemaVersion: 1,
      runId,
      generatedAt: this.clock(),
      objective,
      controlEnvelopeHash,
      coverageMap,
      metaAnalysis,
      architecture,
      pipeline,
      routePlan,
      iterations: iterationResults,
      retired,
      registry: this.registry.summary(),
      auditBeforeCompletion,
      runArtifact,
    };
    ensureDir(runDir);
    writeJsonAtomic(runArtifact, result);
    return result;
  }

  createRunId(objective) {
    const time = this.clock().replace(/[^0-9]/g, '').slice(0, 17);
    return `run-${time}-${sha256(`${objective.id}:${this.registry.state.auditHead}`).slice(0, 8)}`;
  }
}

module.exports = { MotherEvolutionLoop };
