'use strict';

const fs = require('fs');
const path = require('path');
const { invariant } = require('./contracts');
const { clone, deepFreeze } = require('./utils');

const DEFAULT_CONFIG = deepFreeze({
  schemaVersion: 1,
  limits: {
    maxIterations: 3,
    maxAgents: 8,
    maxAgentVersions: 10,
    maxGapsPerRun: 250,
  },
  sandbox: {
    mode: 'structured-local',
    allowNetwork: false,
    allowCredentials: false,
    allowSourceWrites: false,
    allowedWriteRoot: '.spectra/evolution/runs',
  },
  evaluation: {
    targetScore: 0.95,
    weights: {
      gapCoverage: 0.45,
      priorityCoverage: 0.25,
      pipelineReadiness: 0.15,
      specificity: 0.15,
    },
  },
  promotion: {
    enabled: true,
    minimumImprovement: 0.01,
    requireSafetyPass: true,
    requireCompleteCapabilityCoverage: true,
  },
  inputs: {
    trace: '.spectra/12-trace.md',
    allureSummary: '.spectra/allure-summary.json',
    coverageMap: '.spectra/coverage-map.json',
  },
  externalStages: {
    mcp: { enabled: false },
    pullRequest: { enabled: false },
    rerun: { enabled: false },
  },
});

function mergeKnown(base, override, prefix = '') {
  if (override === undefined) return clone(base);
  invariant(base && typeof base === 'object' && !Array.isArray(base), `Cannot override scalar control at ${prefix || '$'}.`);
  invariant(override && typeof override === 'object' && !Array.isArray(override), `Expected object at ${prefix || '$'}.`);
  const unknown = Object.keys(override).filter(key => !(key in base));
  invariant(unknown.length === 0, `Unknown configuration field(s): ${unknown.map(key => prefix ? `${prefix}.${key}` : key).join(', ')}`);
  const result = {};
  Object.keys(base).forEach(key => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    result[key] = base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])
      ? mergeKnown(base[key], override[key], nextPrefix)
      : override[key] === undefined ? clone(base[key]) : clone(override[key]);
  });
  return result;
}

function validateConfig(config) {
  invariant(config.schemaVersion === 1, 'Unsupported evolution config schemaVersion.');
  ['maxIterations', 'maxAgents', 'maxAgentVersions', 'maxGapsPerRun'].forEach(key => {
    invariant(Number.isInteger(config.limits[key]) && config.limits[key] > 0, `limits.${key} must be a positive integer.`);
  });
  invariant(config.sandbox.mode === 'structured-local', 'MVP only supports the structured-local sandbox.');
  invariant(config.sandbox.allowNetwork === false, 'Evolution agents may not enable network access.');
  invariant(config.sandbox.allowCredentials === false, 'Evolution agents may not access credentials.');
  invariant(config.sandbox.allowSourceWrites === false, 'Evolution agents may not write source files.');
  invariant(config.sandbox.allowedWriteRoot === '.spectra/evolution/runs', 'MVP run artifacts must stay inside .spectra/evolution/runs.');
  invariant(config.promotion.minimumImprovement > 0, 'promotion.minimumImprovement must be greater than zero.');
  invariant(config.evaluation.targetScore > 0 && config.evaluation.targetScore <= 1, 'evaluation.targetScore must be between 0 and 1.');
  const weightTotal = Object.values(config.evaluation.weights).reduce((sum, value) => sum + value, 0);
  invariant(Math.abs(weightTotal - 1) < 1e-9, 'evaluation.weights must add up to 1.');
  Object.entries(config.externalStages).forEach(([stage, value]) => {
    invariant(value.enabled === false, `External stage ${stage} cannot be enabled in the safe MVP.`);
  });
  return deepFreeze(config);
}

function loadConfig(projectRoot, explicitPath) {
  const configPath = explicitPath
    ? path.resolve(projectRoot, explicitPath)
    : path.join(projectRoot, '.spectra', 'evolution.config.json');
  const override = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
  return validateConfig(mergeKnown(DEFAULT_CONFIG, override));
}

module.exports = { DEFAULT_CONFIG, loadConfig, mergeKnown, validateConfig };
