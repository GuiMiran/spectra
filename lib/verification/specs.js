'use strict';

const fs = require('fs');
const path = require('path');

const ACCEPTANCE_ID_PATTERN = /\bAC-\d{3}\b/g;

/**
 * Read the acceptance-criterion IDs declared by a project's canonical
 * SPECTRA layer. This deliberately reads declarations only; passing evidence
 * is evaluated separately by evidence.js.
 */
function readAcceptanceCriteriaIds(projectRoot) {
  const file = path.resolve(projectRoot, '.spectra', '11-acceptance-criteria.md');
  if (!fs.existsSync(file)) {
    throw new Error(`Acceptance-criteria layer does not exist: ${file}`);
  }

  const content = fs.readFileSync(file, 'utf8');
  const ids = [...new Set(content.match(ACCEPTANCE_ID_PATTERN) || [])];
  if (ids.length === 0) {
    throw new Error(`No acceptance-criterion IDs found in: ${file}`);
  }

  return { file, ids };
}

module.exports = {
  ACCEPTANCE_ID_PATTERN,
  readAcceptanceCriteriaIds,
};
