'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const ROOT_MARKDOWN = new Set([
  'AGENTS.md',
  'CONTRIBUTING.md',
  'MANIFESTO.md',
  'README.es.md',
  'README.md',
  'SPECTRA-PROMPT.md',
]);
const INDEXES = [
  'README.md',
  'README.es.md',
  'docs/README.md',
  'docs/architecture/README.md',
  'harness/README.md',
];

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function markdownLinks(relativePath) {
  const file = path.join(ROOT, relativePath);
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map(match => match[1].split('#')[0])
    .filter(target => target && !/^(https?:|mailto:)/.test(target))
    .map(target => path.relative(ROOT, path.resolve(path.dirname(file), target)));
}

function verifyRepository() {
  const failures = [];
  const matrix = readJson('harness/spectra-matrix.json');

  if (matrix.schemaVersion !== 1 || !Array.isArray(matrix.entries) || matrix.entries.length === 0) {
    failures.push('harness/spectra-matrix.json must declare schemaVersion 1 and non-empty entries.');
  }

  const ids = new Set();
  for (const entry of matrix.entries || []) {
    for (const field of ['id', 'requirement', 'owner']) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        failures.push(`Matrix entry is missing ${field}.`);
      }
    }
    if (ids.has(entry.id)) failures.push(`Duplicate matrix ID: ${entry.id}.`);
    ids.add(entry.id);

    for (const field of ['artifacts', 'evidence', 'verify']) {
      if (!Array.isArray(entry[field]) || entry[field].length === 0) {
        failures.push(`${entry.id} must declare non-empty ${field}.`);
      }
    }
    for (const artifact of [...(entry.artifacts || []), ...(entry.evidence || [])]) {
      if (!exists(artifact)) failures.push(`${entry.id} references missing artefact: ${artifact}.`);
    }
  }

  const unexpectedRootMarkdown = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md') && !ROOT_MARKDOWN.has(entry.name))
    .map(entry => entry.name);
  if (unexpectedRootMarkdown.length > 0) {
    failures.push(`Unexpected root Markdown: ${unexpectedRootMarkdown.join(', ')}.`);
  }

  for (const index of INDEXES) {
    for (const target of markdownLinks(index)) {
      if (!exists(target)) failures.push(`${index} links to missing local path: ${target}.`);
    }
  }

  if (failures.length > 0) throw new Error(`Repository verification failed:\n- ${failures.join('\n- ')}`);
}

if (require.main === module) {
  try {
    verifyRepository();
    process.stdout.write('Repository verification passed.\n');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { verifyRepository };
