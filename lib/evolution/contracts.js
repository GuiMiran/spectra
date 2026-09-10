'use strict';

const { clone, deepFreeze, sha256, stableStringify } = require('./utils');

/**
 * @typedef {Object} Objective
 * @property {string} id
 * @property {string} statement
 * @property {string[]} successCriteria
 * @property {string[]} constraints
 */

/**
 * @typedef {Object} Gap
 * @property {string} id
 * @property {string} type
 * @property {string} severity
 * @property {string} status
 * @property {string} description
 * @property {string[]} sources
 */

/**
 * @typedef {Object} AgentDefinition
 * @property {string} id
 * @property {number} version
 * @property {string} role
 * @property {string[]} capabilities
 * @property {string} instructions
 * @property {string[]} allowedInputs
 * @property {string[]} allowedOutputs
 * @property {Object} strategy
 */

const ALLOWED_MUTABLE_AGENT_FIELDS = Object.freeze([
  'capabilities',
  'instructions',
  'strategy',
]);

const PROTECTED_TERMS = Object.freeze([
  'credential', 'credentials', 'secret', 'secrets', 'token', 'password',
  'sandbox', 'network', 'filesystem', 'environment', 'permission',
  'control', 'controls', 'governance', 'limit', 'limits', 'threshold',
  'evaluator', 'evaluationweights', 'promotionpolicy', 'auditpolicy',
]);

const PROTECTED_AGENT_FIELDS = Object.freeze([
  'id', 'version', 'role', 'allowedInputs', 'allowedOutputs', 'createdAt',
  'controlEnvelopeHash', 'executionPolicy', 'permissions', 'credentials',
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeObjective(statement, successCriteria = [], constraints = []) {
  invariant(typeof statement === 'string' && statement.trim(), 'An objective is required.');
  const clean = statement.trim();
  return deepFreeze({
    id: `objective-${sha256(clean).slice(0, 12)}`,
    statement: clean,
    successCriteria: [...successCriteria].map(String),
    constraints: [...constraints].map(String),
  });
}

function validateGap(gap) {
  invariant(gap && typeof gap === 'object', 'Gap must be an object.');
  invariant(typeof gap.id === 'string' && gap.id, 'Gap.id is required.');
  invariant(typeof gap.description === 'string', `Gap ${gap.id} requires a description.`);
  invariant(['CRITICAL', 'MAJOR', 'MINOR'].includes(gap.severity), `Gap ${gap.id} has invalid severity.`);
  return deepFreeze(clone(gap));
}

function validateAgent(agent) {
  invariant(agent && typeof agent === 'object', 'Agent definition must be an object.');
  invariant(/^[a-z0-9][a-z0-9-]*$/.test(agent.id), 'Agent.id must be a lowercase slug.');
  invariant(Number.isInteger(agent.version) && agent.version > 0, `Agent ${agent.id} requires a positive integer version.`);
  invariant(typeof agent.role === 'string' && agent.role, `Agent ${agent.id} requires a role.`);
  invariant(Array.isArray(agent.capabilities) && agent.capabilities.length > 0, `Agent ${agent.id} requires capabilities.`);
  invariant(typeof agent.instructions === 'string' && agent.instructions, `Agent ${agent.id} requires instructions.`);
  invariant(Array.isArray(agent.allowedInputs), `Agent ${agent.id} requires allowedInputs.`);
  invariant(Array.isArray(agent.allowedOutputs), `Agent ${agent.id} requires allowedOutputs.`);
  invariant(agent.strategy && typeof agent.strategy === 'object', `Agent ${agent.id} requires a strategy.`);
  return deepFreeze(clone(agent));
}

function collectChangedPaths(before, after, prefix = '') {
  if (stableStringify(before) === stableStringify(after)) return [];
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object' || Array.isArray(before) || Array.isArray(after)) {
    return [prefix || '$'];
  }
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].flatMap(key => collectChangedPaths(before[key], after[key], prefix ? `${prefix}.${key}` : key));
}

function hasProtectedTerm(value) {
  const normalized = String(value).toLowerCase().replace(/[^a-z]/g, '');
  return PROTECTED_TERMS.some(term => normalized.includes(term));
}

function validateMutation(baseline, candidate, controlEnvelope) {
  validateAgent(candidate);
  const reasons = [];
  const mutableProjection = value => Object.fromEntries(
    ALLOWED_MUTABLE_AGENT_FIELDS.map(field => [field, value?.[field]])
  );
  const changedPaths = baseline
    ? collectChangedPaths(mutableProjection(baseline), mutableProjection(candidate))
    : Object.keys(candidate).filter(key => ALLOWED_MUTABLE_AGENT_FIELDS.includes(key));

  if (baseline) {
    if (candidate.version !== baseline.version + 1) reasons.push('Candidate version must increment the baseline by exactly one.');
    if (candidate.id !== baseline.id) reasons.push('Protected field changed: id');
    if (candidate.role !== baseline.role) reasons.push('Protected field changed: role');
  }

  const candidateText = stableStringify({
    capabilities: candidate.capabilities,
    instructions: candidate.instructions,
    strategy: candidate.strategy,
  });
  if (hasProtectedTerm(candidateText)) reasons.push('Candidate content references a protected control or resource.');

  PROTECTED_AGENT_FIELDS.forEach(field => {
    if (field === 'version') return;
    if (baseline && stableStringify(baseline[field]) !== stableStringify(candidate[field])) {
      reasons.push(`Protected field changed: ${field}`);
    }
  });

  const actualEnvelopeHash = sha256(controlEnvelope);
  if (candidate.controlEnvelopeHash && candidate.controlEnvelopeHash !== actualEnvelopeHash) {
    reasons.push('Candidate control-envelope hash does not match the active controls.');
  }

  return deepFreeze({
    safe: reasons.length === 0,
    reasons,
    changedPaths,
    controlEnvelopeHash: actualEnvelopeHash,
  });
}

function createControlEnvelope(config) {
  const envelope = {
    schemaVersion: config.schemaVersion,
    limits: clone(config.limits),
    sandbox: clone(config.sandbox),
    evaluation: clone(config.evaluation),
    promotion: clone(config.promotion),
    protectedTerms: [...PROTECTED_TERMS],
    allowedMutableAgentFields: [...ALLOWED_MUTABLE_AGENT_FIELDS],
  };
  return deepFreeze(envelope);
}

module.exports = {
  ALLOWED_MUTABLE_AGENT_FIELDS,
  PROTECTED_AGENT_FIELDS,
  PROTECTED_TERMS,
  collectChangedPaths,
  createControlEnvelope,
  invariant,
  normalizeObjective,
  validateAgent,
  validateGap,
  validateMutation,
};
