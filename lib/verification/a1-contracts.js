'use strict';

// Validates ONLY the fixed, vendored A1 schemas below. Not a general JSON Schema
// implementation: no external schemas, $ref resolution, file reads or effects.
const { sha256, deepFreeze } = require('../agent-runtime/contracts');
const schemas = {
  repositoryProfile: require('../../schemas/repository-profile.v1.schema.json'),
  evidenceBundle: require('../../schemas/evidence-bundle.v1.schema.json'),
  guidoAssessment: require('../../schemas/guido-assessment.v1.schema.json'),
};
const CHECKS = Object.freeze(['project_readme', 'specifications', 'contribution_policy', 'security_policy',
  'ci_workflow', 'tests', 'agent_contract', 'trace_map']);
const KEYWORDS = new Set(['$schema', 'title', 'type', 'const', 'enum', 'properties', 'required',
  'additionalProperties', 'items', 'minItems', 'maxItems', 'uniqueItems', 'pattern', 'minLength',
  'maxLength', 'minimum', 'maximum']);
function checkSupported(schema) {
  for (const key of Object.keys(schema)) if (!KEYWORDS.has(key)) throw new Error(`Unsupported bundled schema keyword: ${key}`);
  if (schema.type && !['object', 'array', 'string', 'integer', 'null'].includes(schema.type)) throw new Error('Unsupported bundled schema type.');
  if (schema.type === 'object' && (schema.additionalProperties !== false ||
      !Array.isArray(schema.required) || schema.required.length !== Object.keys(schema.properties).length)) throw new Error('A1 objects must remain closed and fully required.');
  Object.values(schema.properties || {}).forEach(checkSupported);
  if (schema.items) checkSupported(schema.items);
}
Object.values(schemas).forEach(schema => { checkSupported(schema); deepFreeze(schema); });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));

function validate(schema, value, location, errors, depth = 0) {
  if (errors.length >= 32) return;
  const fail = message => errors.push(`${location}: ${message}`);
  if (depth > 16) return fail('depth limit');
  if (Object.hasOwn(schema, 'const') && value !== schema.const) return fail('constant mismatch');
  if (schema.enum && !schema.enum.includes(value)) return fail('unsupported enum value');
  const type = schema.type;
  if (type === 'object') {
    if (!plain(value)) return fail('expected plain object');
    if (Object.keys(value).some(key => !Object.hasOwn(schema.properties, key))) return fail('unknown field');
    if (schema.required.some(key => !Object.hasOwn(value, key))) return fail('missing required field');
    for (const [key, child] of Object.entries(schema.properties)) validate(child, value[key], `${location}.${key}`, errors, depth + 1);
  } else if (type === 'array') {
    if (!Array.isArray(value)) return fail('expected array');
    if (value.length < (schema.minItems || 0) || value.length > (schema.maxItems ?? Infinity)) return fail('array length');
    if (schema.uniqueItems && new Set(value.map(item => JSON.stringify(item))).size !== value.length) return fail('duplicate array value');
    value.forEach((item, index) => validate(schema.items, item, `${location}[${index}]`, errors, depth + 1));
  } else if (type === 'string') {
    if (typeof value !== 'string' || value.length < (schema.minLength || 0) ||
        value.length > (schema.maxLength ?? Infinity) || schema.pattern && !new RegExp(schema.pattern).test(value)) fail('invalid string');
  } else if (type === 'integer') {
    if (!Number.isSafeInteger(value) || value < schema.minimum || value > schema.maximum) fail('invalid bounded integer');
  } else if (type === 'null' && value !== null) fail('must remain null');
}

function assessA1Contracts(record) {
  const errors = [];
  if (!plain(record) || record.schemaVersion !== 1 ||
      Object.keys(record).length !== 4 || !['schemaVersion', 'repositoryProfile', 'evidenceBundle', 'guidoAssessment'].every(key => Object.hasOwn(record, key))) {
    errors.push('Expected schemaVersion 1 and exactly three A1 contract documents.');
  } else {
    for (const [key, schema] of Object.entries(schemas)) validate(schema, record[key], key, errors);
  }
  if (!errors.length) {
    const { repositoryProfile: profile, evidenceBundle: bundle, guidoAssessment: assessment } = record;
    const ids = profile.observations.map(item => item.id);
    if (new Set(ids).size !== CHECKS.length || CHECKS.some(id => !ids.includes(id))) errors.push('Inventory check set is incomplete or duplicated.');
    for (const item of profile.observations) {
      if (item.evidenceCount < item.paths.length || item.status === 'observed' && (!item.paths.length || item.evidenceCount === 0) ||
          item.status === 'no_evidence' && (item.paths.length !== 0 || item.evidenceCount !== 0)) errors.push(`Inconsistent file-presence observation: ${item.id}`);
    }
    for (const doc of [profile, bundle, assessment]) {
      if (!Number.isFinite(Date.parse(doc.generatedAt)) || new Date(doc.generatedAt).toISOString() !== doc.generatedAt) errors.push('Invalid canonical UTC timestamp.');
      if (doc.repository.fullName !== profile.repository.fullName || doc.repository.commit !== profile.repository.commit ||
          doc.correlationId !== profile.correlationId) errors.push('Repository, commit or correlation lineage mismatch.');
    }
    if (Date.parse(assessment.generatedAt) < Math.max(Date.parse(profile.generatedAt), Date.parse(bundle.generatedAt))) errors.push('Assessment precedes its inputs.');
    if (assessment.provenance.repositoryProfileSha256 !== sha256(profile) ||
        assessment.provenance.evidenceBundleSha256 !== sha256(bundle)) errors.push('Assessment input digest mismatch.');
    const c = bundle.counts;
    if (c.passed + c.failed + c.broken + c.skipped + c.unknown !== c.observed || c.unmapped > c.observed) errors.push('Inconsistent execution counts.');
    if (bundle.qualification === 'PASS' && (c.expected === 0 || c.expected !== c.observed || c.passed !== c.expected || c.unmapped !== 0)) errors.push('PASS cannot hide missing, nonpassing, unexpected or unmapped tests.');
    if (bundle.qualification === 'FAIL' && c.failed + c.broken === 0) errors.push('FAIL needs recorded failed/broken outcomes.');
    if (bundle.qualification === 'UNKNOWN' && c.failed + c.broken > 0) errors.push('Recorded failures must not be downgraded to UNKNOWN.');
  }
  return { valid: errors.length === 0, scope: 'structure-and-lineage-only', errors,
    evidenceState: errors.length ? 'UNKNOWN' : record.evidenceBundle.qualification,
    evidenceMode: errors.length ? null : record.evidenceBundle.provenance.mode,
    organizationalLevel: null, migrationEffort: null, executionAuthorized: false,
    a1CycleComplete: false, requiresHumanApproval: true,
    limitations: ['REFERENCE_HASHES_ARE_NOT_AUTHENTICATION', 'FILE_PRESENCE_IS_NOT_QUALITY',
      'NO_SCORING_POLICY_APPROVED', 'NO_GAP_OR_PLAN_ADAPTER_IN_THIS_SLICE'] };
}

module.exports = { assessA1Contracts };
