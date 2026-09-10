'use strict';

// The agent-runtime contracts deliberately use only Node built-ins.  They do
// not read files, execute commands, or contact external services.  A caller
// must explicitly provide the small, immutable context a planner may inspect.
const crypto = require('node:crypto');

const SCHEMA_VERSION = 1;
const MAX_FILES = 64;
const MAX_SPEC_IDS = 128;
const MAX_SUCCESS_CRITERIA = 32;
const MAX_STEPS = 32;
const MAX_TEXT_LENGTH = 32000;
const MAX_CONTEXT_ITEM_LENGTH = 65536;
const MAX_CONTEXT_LENGTH = 262144;

const EFFECT_KEYS = Object.freeze([
  'sourceWrites',
  'networkCalls',
  'credentialReads',
  'shellCommands',
]);

const ZERO_EFFECTS = Object.freeze({
  sourceWrites: 0,
  networkCalls: 0,
  credentialReads: 0,
  shellCommands: 0,
});

const PROVIDER_MODES = Object.freeze(['null', 'dry-run']);
const PLAN_STATES = Object.freeze(['proposed', 'unavailable']);
const RISK_SEVERITIES = Object.freeze(['low', 'medium', 'high']);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  const serialized = typeof value === 'string' ? value : stableStringify(value);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

function assertKnownKeys(value, keys, label) {
  invariant(isPlainObject(value), `${label} must be an object.`);
  const unknown = Object.keys(value).filter(key => !keys.includes(key));
  invariant(unknown.length === 0, `${label} contains unknown field(s): ${unknown.join(', ')}.`);
}

function assertString(value, label, options = {}) {
  const { allowEmpty = false, maxLength = MAX_TEXT_LENGTH } = options;
  invariant(typeof value === 'string', `${label} must be a string.`);
  invariant(value.length <= maxLength, `${label} exceeds the maximum length.`);
  invariant(allowEmpty || value.trim().length > 0, `${label} is required.`);
  // Source artifacts are opaque reference material: do not normalize their
  // whitespace before hashing or presenting them to a provider.
  return allowEmpty ? value : value.trim();
}

function assertArray(value, label, maxLength) {
  invariant(Array.isArray(value), `${label} must be an array.`);
  invariant(value.length <= maxLength, `${label} exceeds the maximum number of items.`);
}

function assertUnique(values, label) {
  invariant(new Set(values).size === values.length, `${label} contains duplicate values.`);
}

function validateTaskId(value) {
  invariant(typeof value === 'string' && /^[a-z][a-z0-9-]{2,79}$/.test(value), 'Task.id must be a lowercase slug of 3-80 characters.');
  return value;
}

function validatePlanId(value) {
  invariant(typeof value === 'string' && /^plan-[a-z0-9-]{3,100}$/.test(value), 'Plan.id must be a lowercase plan slug.');
  return value;
}

function validateSpecId(value, label = 'Specification id') {
  invariant(typeof value === 'string' && /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(value), `${label} must be an uppercase SPECTRA-style id.`);
  return value;
}

function validateRelativePath(value, label = 'File path') {
  invariant(typeof value === 'string' && value.length > 0 && value.length <= 512, `${label} is required.`);
  invariant(!value.includes('\\') && !value.includes('\0'), `${label} must use a safe POSIX relative path.`);
  invariant(!value.startsWith('/') && !value.includes(':'), `${label} must be relative.`);
  const parts = value.split('/');
  invariant(parts.every(part => part && part !== '.' && part !== '..'), `${label} may not contain empty, current, or parent segments.`);
  invariant(parts.every(part => /^[A-Za-z0-9._@+\-]+$/.test(part)), `${label} contains unsupported characters.`);
  return value;
}

function validateStringList(value, label, maxLength, options = {}) {
  assertArray(value, label, maxLength);
  const normalized = value.map((item, index) => assertString(item, `${label}[${index}]`, options));
  assertUnique(normalized, label);
  return normalized;
}

function validateSuccessCriteria(value) {
  assertArray(value, 'Task.successCriteria', MAX_SUCCESS_CRITERIA);
  invariant(value.length > 0, 'Task.successCriteria must contain at least one measurable criterion.');
  const normalized = value.map((criterion, index) => {
    assertKnownKeys(criterion, ['id', 'description'], `Task.successCriteria[${index}]`);
    const id = validateSpecId(criterion.id, `Task.successCriteria[${index}].id`);
    const description = assertString(criterion.description, `Task.successCriteria[${index}].description`);
    return { id, description };
  });
  assertUnique(normalized.map(criterion => criterion.id), 'Task.successCriteria ids');
  return normalized;
}

function validateScope(value) {
  assertKnownKeys(value, ['allowedFiles', 'allowedSpecIds'], 'Task.scope');
  assertArray(value.allowedFiles, 'Task.scope.allowedFiles', MAX_FILES);
  assertArray(value.allowedSpecIds, 'Task.scope.allowedSpecIds', MAX_SPEC_IDS);
  const allowedFiles = value.allowedFiles.map((file, index) => validateRelativePath(file, `Task.scope.allowedFiles[${index}]`));
  const allowedSpecIds = value.allowedSpecIds.map((id, index) => validateSpecId(id, `Task.scope.allowedSpecIds[${index}]`));
  assertUnique(allowedFiles, 'Task.scope.allowedFiles');
  assertUnique(allowedSpecIds, 'Task.scope.allowedSpecIds');
  invariant(allowedFiles.length + allowedSpecIds.length > 0, 'Task.scope must allow at least one file or specification id.');
  return { allowedFiles: [...allowedFiles].sort(), allowedSpecIds: [...allowedSpecIds].sort() };
}

function validateTask(task) {
  assertKnownKeys(task, ['schemaVersion', 'id', 'objective', 'successCriteria', 'constraints', 'scope'], 'Task');
  invariant(task.schemaVersion === SCHEMA_VERSION, `Unsupported task schemaVersion: ${task.schemaVersion}.`);
  const successCriteria = validateSuccessCriteria(task.successCriteria);
  const scope = validateScope(task.scope);
  successCriteria.forEach(criterion => {
    invariant(
      scope.allowedSpecIds.includes(criterion.id),
      `Task.successCriteria id is not allowed by Task.scope: ${criterion.id}.`
    );
  });
  const normalized = {
    schemaVersion: SCHEMA_VERSION,
    id: validateTaskId(task.id),
    objective: assertString(task.objective, 'Task.objective'),
    successCriteria,
    constraints: validateStringList(task.constraints, 'Task.constraints', MAX_SUCCESS_CRITERIA),
    scope,
  };
  return deepFreeze(normalized);
}

function normalizeInputFile(value, index, allowedFiles) {
  assertKnownKeys(value, ['path', 'content'], `Context.files[${index}]`);
  const path = validateRelativePath(value.path, `Context.files[${index}].path`);
  invariant(allowedFiles.includes(path), `Context.files[${index}].path is not allowed by Task.scope.`);
  const content = assertString(value.content, `Context.files[${index}].content`, {
    allowEmpty: true,
    maxLength: MAX_CONTEXT_ITEM_LENGTH,
  });
  return { path, content, sha256: sha256(content) };
}

function normalizeInputSpecification(value, index, allowedSpecIds) {
  assertKnownKeys(value, ['id', 'content'], `Context.specifications[${index}]`);
  const id = validateSpecId(value.id, `Context.specifications[${index}].id`);
  invariant(allowedSpecIds.includes(id), `Context.specifications[${index}].id is not allowed by Task.scope.`);
  const content = assertString(value.content, `Context.specifications[${index}].content`, {
    allowEmpty: true,
    maxLength: MAX_CONTEXT_ITEM_LENGTH,
  });
  return { id, content, sha256: sha256(content) };
}

function normalizeContextItems(task, input) {
  assertKnownKeys(input, ['files', 'specifications'], 'Context input');
  assertArray(input.files, 'Context.files', MAX_FILES);
  assertArray(input.specifications, 'Context.specifications', MAX_SPEC_IDS);
  const files = input.files.map((value, index) => normalizeInputFile(value, index, task.scope.allowedFiles));
  const specifications = input.specifications.map((value, index) => normalizeInputSpecification(value, index, task.scope.allowedSpecIds));
  assertUnique(files.map(file => file.path), 'Context.files paths');
  assertUnique(specifications.map(specification => specification.id), 'Context.specifications ids');
  const totalLength = files.reduce((sum, file) => sum + file.content.length, 0)
    + specifications.reduce((sum, specification) => sum + specification.content.length, 0);
  invariant(totalLength <= MAX_CONTEXT_LENGTH, 'Context exceeds the maximum aggregate content length.');
  return {
    files: [...files].sort((left, right) => left.path.localeCompare(right.path)),
    specifications: [...specifications].sort((left, right) => left.id.localeCompare(right.id)),
  };
}

function createBoundedContext(task, input) {
  const normalizedTask = validateTask(task);
  const items = normalizeContextItems(normalizedTask, input);
  const context = {
    schemaVersion: SCHEMA_VERSION,
    taskId: normalizedTask.id,
    taskHash: sha256(normalizedTask),
    boundary: clone(normalizedTask.scope),
    files: items.files,
    specifications: items.specifications,
  };
  context.contextHash = sha256(context);
  return deepFreeze(context);
}

function validateContext(task, context) {
  const normalizedTask = validateTask(task);
  assertKnownKeys(context, [
    'schemaVersion', 'taskId', 'taskHash', 'boundary', 'files', 'specifications', 'contextHash',
  ], 'Bounded context');
  invariant(context.schemaVersion === SCHEMA_VERSION, `Unsupported context schemaVersion: ${context.schemaVersion}.`);
  invariant(context.taskId === normalizedTask.id, 'Context taskId does not match the task.');
  invariant(context.taskHash === sha256(normalizedTask), 'Context taskHash does not match the task.');
  invariant(stableStringify(context.boundary) === stableStringify(normalizedTask.scope), 'Context boundary does not match the task scope.');
  const items = normalizeContextItems(normalizedTask, {
    files: context.files.map((file, index) => {
      assertKnownKeys(file, ['path', 'content', 'sha256'], `Bounded context.files[${index}]`);
      invariant(file.sha256 === sha256(file.content), `Bounded context.files[${index}] has an invalid content hash.`);
      return { path: file.path, content: file.content };
    }),
    specifications: context.specifications.map((specification, index) => {
      assertKnownKeys(specification, ['id', 'content', 'sha256'], `Bounded context.specifications[${index}]`);
      invariant(specification.sha256 === sha256(specification.content), `Bounded context.specifications[${index}] has an invalid content hash.`);
      return { id: specification.id, content: specification.content };
    }),
  });
  const normalized = {
    schemaVersion: SCHEMA_VERSION,
    taskId: normalizedTask.id,
    taskHash: sha256(normalizedTask),
    boundary: clone(normalizedTask.scope),
    files: items.files,
    specifications: items.specifications,
  };
  normalized.contextHash = sha256(normalized);
  invariant(context.contextHash === normalized.contextHash, 'Context hash does not match its content.');
  return deepFreeze(normalized);
}

function validateEffects(effects, label = 'Effects') {
  assertKnownKeys(effects, EFFECT_KEYS, label);
  const normalized = {};
  EFFECT_KEYS.forEach(key => {
    invariant(Number.isInteger(effects[key]) && effects[key] === 0, `${label}.${key} must be zero in the read-only runtime.`);
    normalized[key] = 0;
  });
  return deepFreeze(normalized);
}

function validateReferences(value, label, availableFiles, availableSpecIds) {
  assertArray(value.files, `${label}.files`, MAX_FILES);
  assertArray(value.specIds, `${label}.specIds`, MAX_SPEC_IDS);
  const files = value.files.map((file, index) => validateRelativePath(file, `${label}.files[${index}]`));
  const specIds = value.specIds.map((id, index) => validateSpecId(id, `${label}.specIds[${index}]`));
  assertUnique(files, `${label}.files`);
  assertUnique(specIds, `${label}.specIds`);
  files.forEach(file => invariant(availableFiles.has(file), `${label} references a file absent from the bounded context: ${file}.`));
  specIds.forEach(id => invariant(availableSpecIds.has(id), `${label} references a specification absent from the bounded context: ${id}.`));
  return { files: [...files].sort(), specIds: [...specIds].sort() };
}

function validatePlanStep(value, index, availableFiles, availableSpecIds) {
  assertKnownKeys(value, ['id', 'title', 'rationale', 'files', 'specIds'], `Plan.steps[${index}]`);
  const id = assertString(value.id, `Plan.steps[${index}].id`, { maxLength: 80 });
  invariant(/^[a-z][a-z0-9-]{0,79}$/.test(id), `Plan.steps[${index}].id must be a lowercase slug.`);
  const title = assertString(value.title, `Plan.steps[${index}].title`);
  const rationale = assertString(value.rationale, `Plan.steps[${index}].rationale`);
  const references = validateReferences(value, `Plan.steps[${index}]`, availableFiles, availableSpecIds);
  return { id, title, rationale, ...references };
}

function validateVerification(value, index, availableFiles, availableSpecIds) {
  assertKnownKeys(value, ['id', 'description', 'files', 'specIds'], `Plan.verification[${index}]`);
  const id = assertString(value.id, `Plan.verification[${index}].id`, { maxLength: 80 });
  invariant(/^[a-z][a-z0-9-]{0,79}$/.test(id), `Plan.verification[${index}].id must be a lowercase slug.`);
  const description = assertString(value.description, `Plan.verification[${index}].description`);
  const references = validateReferences(value, `Plan.verification[${index}]`, availableFiles, availableSpecIds);
  return { id, description, ...references };
}

function validateRisk(value, index) {
  assertKnownKeys(value, ['id', 'severity', 'description', 'mitigation'], `Plan.risks[${index}]`);
  const id = assertString(value.id, `Plan.risks[${index}].id`, { maxLength: 80 });
  invariant(/^[a-z][a-z0-9-]{0,79}$/.test(id), `Plan.risks[${index}].id must be a lowercase slug.`);
  invariant(RISK_SEVERITIES.includes(value.severity), `Plan.risks[${index}].severity is invalid.`);
  return {
    id,
    severity: value.severity,
    description: assertString(value.description, `Plan.risks[${index}].description`),
    mitigation: assertString(value.mitigation, `Plan.risks[${index}].mitigation`),
  };
}

function validatePlan(task, context, plan) {
  const normalizedTask = validateTask(task);
  const normalizedContext = validateContext(normalizedTask, context);
  assertKnownKeys(plan, [
    'schemaVersion', 'id', 'taskId', 'contextHash', 'state', 'summary', 'assumptions', 'risks',
    'steps', 'verification', 'requiresHumanApproval', 'effects',
  ], 'Plan');
  invariant(plan.schemaVersion === SCHEMA_VERSION, `Unsupported plan schemaVersion: ${plan.schemaVersion}.`);
  invariant(plan.taskId === normalizedTask.id, 'Plan taskId does not match the task.');
  invariant(plan.contextHash === normalizedContext.contextHash, 'Plan contextHash does not match the bounded context.');
  invariant(PLAN_STATES.includes(plan.state), 'Plan.state is invalid.');
  const availableFiles = new Set(normalizedContext.files.map(file => file.path));
  const availableSpecIds = new Set(normalizedContext.specifications.map(specification => specification.id));
  assertArray(plan.assumptions, 'Plan.assumptions', MAX_SUCCESS_CRITERIA);
  assertArray(plan.risks, 'Plan.risks', MAX_SUCCESS_CRITERIA);
  assertArray(plan.steps, 'Plan.steps', MAX_STEPS);
  assertArray(plan.verification, 'Plan.verification', MAX_STEPS);
  const steps = plan.steps.map((step, index) => validatePlanStep(step, index, availableFiles, availableSpecIds));
  const verification = plan.verification.map((item, index) => validateVerification(item, index, availableFiles, availableSpecIds));
  const risks = plan.risks.map((risk, index) => validateRisk(risk, index));
  assertUnique(steps.map(step => step.id), 'Plan.steps ids');
  assertUnique(verification.map(item => item.id), 'Plan.verification ids');
  assertUnique(risks.map(risk => risk.id), 'Plan.risks ids');
  if (plan.state === 'proposed') {
    invariant(steps.length > 0, 'A proposed plan must contain at least one step.');
    invariant(verification.length > 0, 'A proposed plan must contain at least one verification item.');
  } else {
    invariant(steps.length === 0 && verification.length === 0, 'An unavailable plan cannot contain steps or verification work.');
  }
  invariant(plan.requiresHumanApproval === true, 'All plans require explicit human approval.');
  const normalized = {
    schemaVersion: SCHEMA_VERSION,
    id: validatePlanId(plan.id),
    taskId: normalizedTask.id,
    contextHash: normalizedContext.contextHash,
    state: plan.state,
    summary: assertString(plan.summary, 'Plan.summary'),
    assumptions: validateStringList(plan.assumptions, 'Plan.assumptions', MAX_SUCCESS_CRITERIA),
    risks,
    steps,
    verification,
    requiresHumanApproval: true,
    effects: validateEffects(plan.effects, 'Plan.effects'),
  };
  return deepFreeze(normalized);
}

function validateProviderProvenance(value) {
  assertKnownKeys(value, [
    'schemaVersion', 'id', 'version', 'mode', 'networkAccess', 'sourceWriteAccess',
    'credentialAccess', 'shellAccess', 'model',
  ], 'Provider provenance');
  invariant(value.schemaVersion === SCHEMA_VERSION, `Unsupported provider schemaVersion: ${value.schemaVersion}.`);
  invariant(typeof value.id === 'string' && /^[a-z][a-z0-9-]{2,79}$/.test(value.id), 'Provider provenance.id must be a lowercase slug.');
  invariant(typeof value.version === 'string' && value.version.length > 0 && value.version.length <= 80, 'Provider provenance.version is required.');
  invariant(PROVIDER_MODES.includes(value.mode), 'Provider provenance.mode is not permitted by the read-only runtime.');
  invariant(value.networkAccess === false, 'Provider provenance may not enable network access.');
  invariant(value.sourceWriteAccess === false, 'Provider provenance may not enable source writes.');
  invariant(value.credentialAccess === false, 'Provider provenance may not enable credential access.');
  invariant(value.shellAccess === false, 'Provider provenance may not enable shell access.');
  invariant(value.model === null, 'Provider provenance may not declare a model in the read-only runtime.');
  return deepFreeze({
    schemaVersion: SCHEMA_VERSION,
    id: value.id,
    version: value.version,
    mode: value.mode,
    networkAccess: false,
    sourceWriteAccess: false,
    credentialAccess: false,
    shellAccess: false,
    model: null,
  });
}

function validateIsoTimestamp(value, label) {
  invariant(typeof value === 'string' && Number.isFinite(Date.parse(value)), `${label} must be an ISO timestamp.`);
  return new Date(value).toISOString();
}

function validateRunId(value) {
  invariant(typeof value === 'string' && /^run-[a-z0-9-]{8,120}$/.test(value), 'Run.id must be a lowercase run slug.');
  return value;
}

function createRunRecord({ task, context, plan, provider, startedAt, completedAt, runId }) {
  const normalizedTask = validateTask(task);
  const normalizedContext = validateContext(normalizedTask, context);
  const normalizedPlan = validatePlan(normalizedTask, normalizedContext, plan);
  const normalizedProvider = validateProviderProvenance(provider);
  const start = validateIsoTimestamp(startedAt, 'Run.startedAt');
  const complete = validateIsoTimestamp(completedAt, 'Run.completedAt');
  invariant(Date.parse(complete) >= Date.parse(start), 'Run.completedAt may not precede Run.startedAt.');
  const planHash = sha256(normalizedPlan);
  const inputHash = sha256({
    taskHash: normalizedContext.taskHash,
    contextHash: normalizedContext.contextHash,
    provider: normalizedProvider,
  });
  const generatedRunId = `run-${sha256({ inputHash, planHash, startedAt: start, completedAt: complete }).slice(0, 24)}`;
  const normalizedRunId = runId === undefined ? generatedRunId : validateRunId(runId);
  const record = {
    schemaVersion: SCHEMA_VERSION,
    id: normalizedRunId,
    state: normalizedPlan.state,
    startedAt: start,
    completedAt: complete,
    decision: {
      humanApprovalRequired: true,
      sourceWritesPermitted: false,
    },
    effects: clone(ZERO_EFFECTS),
    provenance: {
      runtime: 'spectra-agent-runtime',
      runtimeSchemaVersion: SCHEMA_VERSION,
      taskHash: normalizedContext.taskHash,
      contextHash: normalizedContext.contextHash,
      inputHash,
      planHash,
      provider: normalizedProvider,
      contextManifest: {
        files: normalizedContext.files.map(file => ({ path: file.path, sha256: file.sha256 })),
        specifications: normalizedContext.specifications.map(specification => ({ id: specification.id, sha256: specification.sha256 })),
      },
    },
  };
  return deepFreeze(record);
}

function validateRunRecord(record) {
  assertKnownKeys(record, [
    'schemaVersion', 'id', 'state', 'startedAt', 'completedAt', 'decision', 'effects', 'provenance',
  ], 'Run record');
  invariant(record.schemaVersion === SCHEMA_VERSION, `Unsupported run record schemaVersion: ${record.schemaVersion}.`);
  validateRunId(record.id);
  invariant(PLAN_STATES.includes(record.state), 'Run record state is invalid.');
  const start = validateIsoTimestamp(record.startedAt, 'Run.startedAt');
  const complete = validateIsoTimestamp(record.completedAt, 'Run.completedAt');
  invariant(Date.parse(complete) >= Date.parse(start), 'Run.completedAt may not precede Run.startedAt.');
  assertKnownKeys(record.decision, ['humanApprovalRequired', 'sourceWritesPermitted'], 'Run decision');
  invariant(record.decision.humanApprovalRequired === true, 'Run record must require human approval.');
  invariant(record.decision.sourceWritesPermitted === false, 'Run record may not permit source writes.');
  const effects = validateEffects(record.effects, 'Run.effects');
  assertKnownKeys(record.provenance, [
    'runtime', 'runtimeSchemaVersion', 'taskHash', 'contextHash', 'inputHash', 'planHash', 'provider', 'contextManifest',
  ], 'Run provenance');
  invariant(record.provenance.runtime === 'spectra-agent-runtime', 'Run provenance.runtime is invalid.');
  invariant(record.provenance.runtimeSchemaVersion === SCHEMA_VERSION, 'Run provenance.runtimeSchemaVersion is invalid.');
  ['taskHash', 'contextHash', 'inputHash', 'planHash'].forEach(key => {
    invariant(typeof record.provenance[key] === 'string' && /^[a-f0-9]{64}$/.test(record.provenance[key]), `Run provenance.${key} must be a SHA-256 hash.`);
  });
  const provider = validateProviderProvenance(record.provenance.provider);
  assertKnownKeys(record.provenance.contextManifest, ['files', 'specifications'], 'Run provenance.contextManifest');
  assertArray(record.provenance.contextManifest.files, 'Run provenance.contextManifest.files', MAX_FILES);
  assertArray(record.provenance.contextManifest.specifications, 'Run provenance.contextManifest.specifications', MAX_SPEC_IDS);
  const files = record.provenance.contextManifest.files.map((file, index) => {
    assertKnownKeys(file, ['path', 'sha256'], `Run provenance.contextManifest.files[${index}]`);
    return {
      path: validateRelativePath(file.path, `Run provenance.contextManifest.files[${index}].path`),
      sha256: assertHash(file.sha256, `Run provenance.contextManifest.files[${index}].sha256`),
    };
  });
  const specifications = record.provenance.contextManifest.specifications.map((specification, index) => {
    assertKnownKeys(specification, ['id', 'sha256'], `Run provenance.contextManifest.specifications[${index}]`);
    return {
      id: validateSpecId(specification.id, `Run provenance.contextManifest.specifications[${index}].id`),
      sha256: assertHash(specification.sha256, `Run provenance.contextManifest.specifications[${index}].sha256`),
    };
  });
  assertUnique(files.map(file => file.path), 'Run provenance context file paths');
  assertUnique(specifications.map(specification => specification.id), 'Run provenance context specification ids');
  return deepFreeze({
    schemaVersion: SCHEMA_VERSION,
    id: record.id,
    state: record.state,
    startedAt: start,
    completedAt: complete,
    decision: { humanApprovalRequired: true, sourceWritesPermitted: false },
    effects,
    provenance: {
      runtime: 'spectra-agent-runtime',
      runtimeSchemaVersion: SCHEMA_VERSION,
      taskHash: record.provenance.taskHash,
      contextHash: record.provenance.contextHash,
      inputHash: record.provenance.inputHash,
      planHash: record.provenance.planHash,
      provider,
      contextManifest: { files, specifications },
    },
  });
}

function assertHash(value, label) {
  invariant(typeof value === 'string' && /^[a-f0-9]{64}$/.test(value), `${label} must be a SHA-256 hash.`);
  return value;
}

module.exports = {
  EFFECT_KEYS,
  MAX_CONTEXT_LENGTH,
  MAX_CONTEXT_ITEM_LENGTH,
  PLAN_STATES,
  PROVIDER_MODES,
  RISK_SEVERITIES,
  SCHEMA_VERSION,
  ZERO_EFFECTS,
  assertHash,
  clone,
  createBoundedContext,
  createRunRecord,
  deepFreeze,
  invariant,
  sha256,
  stableStringify,
  validateContext,
  validateEffects,
  validatePlan,
  validateProviderProvenance,
  validateRunRecord,
  validateTask,
};
