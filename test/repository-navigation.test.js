'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function assertExists(relativePath) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), true, `${relativePath} must exist`);
}

function localMarkdownTargets(relativePath) {
  const file = path.join(root, relativePath);
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map(match => match[1].split('#')[0])
    .filter(target => target && !/^(https?:|mailto:)/.test(target))
    .map(target => path.resolve(path.dirname(file), target));
}

test('agent navigation contract exposes all architectural entry points', () => {
  [
    'AGENTS.md',
    'bin/spectra.js',
    'lib/evolution/index.js',
    'test',
    'evals',
    'templates/evolution.config.json',
    'docs/README.md',
    'docs/architecture/README.md',
    'docs/architecture/controlled-evolution.md',
    'docs/architecture/decisions/0001-controlled-evolution-superagents.md',
  ].forEach(assertExists);
});

test('documentation indexes do not contain broken local Markdown links', () => {
  ['README.md', 'README.es.md', 'docs/README.md', 'docs/architecture/README.md']
    .flatMap(localMarkdownTargets)
    .forEach(target => assert.equal(fs.existsSync(target), true, `broken documentation link: ${target}`));
});
