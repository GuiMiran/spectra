'use strict';

const fs = require('fs');
const path = require('path');

const EVIDENCE_SCHEMA_VERSION = 1;
const EVIDENCE_STATUSES = Object.freeze(['passed', 'failed', 'skipped']);

function issue(code, message, pathName) {
  return { code, message, path: pathName };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateOptionalString(value, pathName, errors) {
  if (value !== undefined && !isNonEmptyString(value)) {
    errors.push(issue('INVALID_STRING', `${pathName} must be a non-empty string when present.`, pathName));
  }
}

function validateOptionalStringArray(value, pathName, errors) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some(item => !isNonEmptyString(item))) {
    errors.push(issue('INVALID_STRING_ARRAY', `${pathName} must be an array of non-empty strings when present.`, pathName));
  }
}

/**
 * Validate the version-one canonical evidence document.
 *
 * Minimum stable schema:
 * {
 *   schemaVersion: 1,
 *   results: [{ id: 'AC-001', status: 'passed' }]
 * }
 *
 * Optional execution metadata records where the evidence came from without
 * making an early integration invent data it does not yet possess.
 */
function validateEvidenceDocument(document) {
  const errors = [];
  if (!isPlainObject(document)) {
    errors.push(issue('INVALID_DOCUMENT', 'Evidence document must be an object.', '$'));
    return { valid: false, errors };
  }

  if (document.schemaVersion !== EVIDENCE_SCHEMA_VERSION) {
    errors.push(issue(
      'UNSUPPORTED_SCHEMA_VERSION',
      `schemaVersion must be ${EVIDENCE_SCHEMA_VERSION}.`,
      'schemaVersion'
    ));
  }

  if (!Array.isArray(document.results)) {
    errors.push(issue('INVALID_RESULTS', 'results must be an array.', 'results'));
  }

  if (document.run !== undefined) {
    if (!isPlainObject(document.run)) {
      errors.push(issue('INVALID_RUN', 'run must be an object when present.', 'run'));
    } else {
      validateOptionalString(document.run.command, 'run.command', errors);
      validateOptionalString(document.run.commit, 'run.commit', errors);
      validateOptionalString(document.run.executedAt, 'run.executedAt', errors);
    }
  }

  const seenIds = new Set();
  if (Array.isArray(document.results)) {
    document.results.forEach((result, index) => {
      const resultPath = `results[${index}]`;
      if (!isPlainObject(result)) {
        errors.push(issue('INVALID_RESULT', `${resultPath} must be an object.`, resultPath));
        return;
      }

      if (!isNonEmptyString(result.id)) {
        errors.push(issue('INVALID_ID', `${resultPath}.id must be a non-empty string.`, `${resultPath}.id`));
      } else if (seenIds.has(result.id)) {
        errors.push(issue('DUPLICATE_ID', `${resultPath}.id duplicates ${result.id}.`, `${resultPath}.id`));
      } else {
        seenIds.add(result.id);
      }

      if (!EVIDENCE_STATUSES.includes(result.status)) {
        errors.push(issue(
          'INVALID_STATUS',
          `${resultPath}.status must be one of: ${EVIDENCE_STATUSES.join(', ')}.`,
          `${resultPath}.status`
        ));
      }

      validateOptionalString(result.command, `${resultPath}.command`, errors);
      validateOptionalString(result.test, `${resultPath}.test`, errors);
      validateOptionalStringArray(result.artifacts, `${resultPath}.artifacts`, errors);
    });
  }

  return { valid: errors.length === 0, errors };
}

function normalizeRequestedIds(requestedIds) {
  const errors = [];
  if (!Array.isArray(requestedIds)) {
    return {
      valid: false,
      ids: [],
      errors: [issue('INVALID_REQUESTED_IDS', 'requestedIds must be an array of non-empty strings.', 'requestedIds')],
    };
  }

  const ids = [];
  const seen = new Set();
  requestedIds.forEach((id, index) => {
    const idPath = `requestedIds[${index}]`;
    if (!isNonEmptyString(id)) {
      errors.push(issue('INVALID_REQUESTED_ID', `${idPath} must be a non-empty string.`, idPath));
      return;
    }
    if (seen.has(id)) {
      errors.push(issue('DUPLICATE_REQUESTED_ID', `${idPath} duplicates ${id}.`, idPath));
      return;
    }
    seen.add(id);
    ids.push(id);
  });

  return { valid: errors.length === 0, ids, errors };
}

/**
 * Compare a valid canonical document against the IDs required for a task.
 * A passed result is deliberately distinct from an ID merely being present:
 * failed and skipped evidence are reported, never counted as success.
 */
function compareEvidenceIds(document, requestedIds) {
  const documentValidation = validateEvidenceDocument(document);
  const requested = normalizeRequestedIds(requestedIds);
  const errors = [...documentValidation.errors, ...requested.errors];
  const empty = {
    requested: requested.ids,
    present: [],
    passed: [],
    failed: [],
    skipped: [],
    missing: [],
    counts: {
      requested: requested.ids.length,
      present: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      missing: 0,
      passedCoverage: 0,
    },
  };

  if (errors.length > 0) {
    return { valid: false, errors, ...empty };
  }

  const byId = new Map(document.results.map(result => [result.id, result]));
  const comparison = {
    requested: requested.ids,
    present: [],
    passed: [],
    failed: [],
    skipped: [],
    missing: [],
  };

  requested.ids.forEach(id => {
    const result = byId.get(id);
    if (!result) {
      comparison.missing.push(id);
      return;
    }
    comparison.present.push(id);
    comparison[result.status].push(id);
  });

  const requestedCount = comparison.requested.length;
  const counts = {
    requested: requestedCount,
    present: comparison.present.length,
    passed: comparison.passed.length,
    failed: comparison.failed.length,
    skipped: comparison.skipped.length,
    missing: comparison.missing.length,
    passedCoverage: requestedCount === 0 ? 1 : comparison.passed.length / requestedCount,
  };

  return { valid: true, errors: [], ...comparison, counts };
}

/**
 * Read evidence without treating absence or malformed JSON as an exception a
 * caller might accidentally ignore. `state` is always one of missing,
 * invalid, or valid.
 */
function readEvidenceFile(file) {
  const resolvedFile = path.resolve(file);
  if (!fs.existsSync(resolvedFile)) {
    return {
      state: 'missing',
      file: resolvedFile,
      document: null,
      validation: { valid: false, errors: [issue('EVIDENCE_FILE_MISSING', `Evidence file does not exist: ${resolvedFile}`, 'file')] },
    };
  }

  let document;
  try {
    document = JSON.parse(fs.readFileSync(resolvedFile, 'utf8'));
  } catch (error) {
    return {
      state: 'invalid',
      file: resolvedFile,
      document: null,
      validation: {
        valid: false,
        errors: [issue('INVALID_JSON', `Evidence file is not valid JSON: ${error.message}`, 'file')],
      },
    };
  }

  const validation = validateEvidenceDocument(document);
  return {
    state: validation.valid ? 'valid' : 'invalid',
    file: resolvedFile,
    document,
    validation,
  };
}

function verifyEvidenceFile(file, requestedIds) {
  const loaded = readEvidenceFile(file);
  if (loaded.state !== 'valid') {
    const requested = normalizeRequestedIds(requestedIds);
    return {
      state: loaded.state,
      file: loaded.file,
      document: loaded.document,
      valid: false,
      errors: [...loaded.validation.errors, ...requested.errors],
      requested: requested.ids,
      present: [],
      passed: [],
      failed: [],
      skipped: [],
      missing: requested.valid ? [...requested.ids] : [],
      counts: {
        requested: requested.ids.length,
        present: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        missing: requested.valid ? requested.ids.length : 0,
        passedCoverage: 0,
      },
    };
  }

  return {
    state: 'valid',
    file: loaded.file,
    document: loaded.document,
    ...compareEvidenceIds(loaded.document, requestedIds),
  };
}

module.exports = {
  EVIDENCE_SCHEMA_VERSION,
  EVIDENCE_STATUSES,
  compareEvidenceIds,
  normalizeRequestedIds,
  readEvidenceFile,
  validateEvidenceDocument,
  verifyEvidenceFile,
};
