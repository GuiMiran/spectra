'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SPEC_ID = /\b(?:US|BR|INV|OP|POL|EVT|AG|SK|WF|AC)-\d{3}\b/g;
const STATUSES = new Set(['passed', 'failed', 'broken', 'skipped', 'unknown']);
const MAX_RESULT_BYTES = 2 * 1024 * 1024;

function digest(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
function idsIn(value) { return [...String(value || '').matchAll(SPEC_ID)].map(match => match[0]); }

function resultIds(result) {
  const explicit = (result.labels || [])
    .filter(label => ['spectraId', 'specId', 'tag', 'as_id'].includes(label.name))
    .flatMap(label => idsIn(label.value));
  return [...new Set([...explicit, ...idsIn(result.name), ...idsIn(result.fullName)])].sort();
}

function readResults(inputDir) {
  const directory = path.resolve(inputDir);
  if (!fs.statSync(directory).isDirectory()) throw new Error('Allure input must be a directory.');
  const names = fs.readdirSync(directory).filter(name => name.endsWith('-result.json')).sort();
  if (names.length === 0) throw new Error('No *-result.json files found in the Allure directory.');
  return names.map(name => {
    const file = path.join(directory, name);
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.size > MAX_RESULT_BYTES) throw new Error(`Invalid Allure result file: ${name}`);
    const bytes = fs.readFileSync(file);
    let result;
    try { result = JSON.parse(bytes.toString('utf8')); }
    catch { throw new Error(`Malformed Allure result JSON: ${name}`); }
    if (!result || typeof result !== 'object' || Array.isArray(result) ||
        typeof result.uuid !== 'string' || !result.uuid ||
        !STATUSES.has(result.status) ||
        (result.labels !== undefined && (!Array.isArray(result.labels) || result.labels.some(label =>
          !label || typeof label.name !== 'string' || typeof label.value !== 'string')))) {
      throw new Error(`Invalid Allure result fields: ${name}`);
    }
    return { result, source: { file: name, sha256: digest(bytes) } };
  });
}

function aggregateAllure(inputDir, { runId, commit = null, ref = null } = {}) {
  const entries = readResults(inputDir);
  const sourceDigest = digest(entries.map(entry => `${entry.source.file}:${entry.source.sha256}`).join('\n'));
  const id = runId || `allure-${sourceDigest.slice(0, 12)}`;
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(id)) throw new Error('runId must be a safe alphanumeric slug.');
  if (commit !== null && (typeof commit !== 'string' || !/^[a-fA-F0-9]{7,64}$/.test(commit))) {
    throw new Error('commit must be a Git commit hash.');
  }
  if (ref !== null && (typeof ref !== 'string' || !ref.trim())) throw new Error('ref must be a non-empty string.');

  const groups = new Map();
  const uuids = new Set();
  for (const { result, source } of entries) {
    if (uuids.has(result.uuid)) throw new Error(`Duplicate Allure uuid: ${result.uuid}`);
    uuids.add(result.uuid);
    const key = result.historyId || result.fullName || result.name || result.uuid;
    if (typeof key !== 'string' || !key) throw new Error(`Allure result ${result.uuid} has no test identity.`);
    const attempt = {
      uuid: result.uuid, status: result.status,
      start: Number.isFinite(result.start) ? result.start : null,
      stop: Number.isFinite(result.stop) ? result.stop : null,
      source,
    };
    if (attempt.start !== null && attempt.stop !== null && attempt.stop < attempt.start) {
      throw new Error(`Invalid Allure timestamps: ${source.file}`);
    }
    const group = groups.get(key) || { key, name: result.name || result.fullName || key, ids: new Set(), attempts: [] };
    resultIds(result).forEach(specId => group.ids.add(specId));
    group.attempts.push(attempt);
    groups.set(key, group);
  }

  const tests = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key)).map(group => {
    if (group.attempts.length > 1 && group.attempts.some(attempt => attempt.start === null || attempt.stop === null)) {
      throw new Error(`Cannot order Allure retries without start and stop: ${group.key}`);
    }
    const attempts = group.attempts.sort((a, b) =>
      (a.stop ?? a.start ?? -1) - (b.stop ?? b.start ?? -1) || a.source.file.localeCompare(b.source.file));
    const finalStatus = attempts.at(-1).status;
    return {
      key: group.key, name: group.name, specIds: [...group.ids].sort(), finalStatus,
      flaky: finalStatus === 'passed' && attempts.some(attempt => ['failed', 'broken'].includes(attempt.status)),
      attempts,
    };
  });
  const counts = {
    tests: tests.length, attempts: entries.length,
    passed: tests.filter(test => test.finalStatus === 'passed').length,
    failed: tests.filter(test => test.finalStatus === 'failed').length,
    broken: tests.filter(test => test.finalStatus === 'broken').length,
    skipped: tests.filter(test => test.finalStatus === 'skipped').length,
    unmapped: tests.filter(test => test.specIds.length === 0).length,
    flaky: tests.filter(test => test.flaky).length,
  };
  const snapshot = {
    schemaVersion: 1, source: 'allure-results', runId: id, sourceDigest,
    provenance: { commit, ref, files: entries.map(entry => entry.source) },
    counts, tests,
  };
  const gaps = tests.flatMap(test => {
    const reference = `test-runs/${id}.json#${digest(test.key).slice(0, 12)}`;
    const base = { type: 'TEST', description: test.name, evidenceRefs: [reference], sourceDigest, runId: id };
    if (!test.specIds.length) return [{ ...base, id: `ALLURE-${digest(test.key).slice(0, 12).toUpperCase()}`,
      severity: ['failed', 'broken'].includes(test.finalStatus) ? 'MAJOR' : 'MINOR', status: 'UNMAPPED' }];
    if (['failed', 'broken'].includes(test.finalStatus)) return test.specIds.map(specId => ({ ...base,
      id: specId, severity: test.finalStatus === 'broken' ? 'CRITICAL' : 'MAJOR', status: test.finalStatus.toUpperCase() }));
    if (['skipped', 'unknown'].includes(test.finalStatus)) return test.specIds.map(specId => ({ ...base,
      id: specId, severity: 'MINOR', status: test.finalStatus.toUpperCase() }));
    if (test.flaky) return test.specIds.map(specId => ({ ...base,
      id: specId, severity: 'MINOR', status: 'FLAKY' }));
    return [];
  });
  return { snapshot, coverageMap: { schemaVersion: 1, producer: 'spectra.ingest-allure', runId: id, sourceDigest, gaps } };
}

function writeAllureEvidence(projectRoot, aggregation) {
  const root = path.resolve(projectRoot, '.spectra');
  const evidenceDir = path.join(root, 'evidence');
  const snapshots = path.join(root, 'evidence', 'test-runs');
  const snapshotFile = path.join(snapshots, `${aggregation.snapshot.runId}.json`);
  const mapFile = path.join(root, 'coverage-map.json');
  const snapshotText = `${JSON.stringify(aggregation.snapshot, null, 2)}\n`;
  const mapText = `${JSON.stringify(aggregation.coverageMap, null, 2)}\n`;
  for (const directory of [root, evidenceDir, snapshots]) {
    if (fs.existsSync(directory) && (!fs.lstatSync(directory).isDirectory() || fs.lstatSync(directory).isSymbolicLink())) {
      throw new Error(`Refusing unsafe evidence directory: ${directory}`);
    }
  }
  if (fs.existsSync(snapshotFile) && fs.lstatSync(snapshotFile).isSymbolicLink()) {
    throw new Error('Refusing symlink test-run snapshot.');
  }
  if (fs.existsSync(snapshotFile) && fs.readFileSync(snapshotFile, 'utf8') !== snapshotText) {
    throw new Error(`Run ID already has different evidence: ${aggregation.snapshot.runId}`);
  }
  if (fs.existsSync(mapFile)) {
    if (fs.lstatSync(mapFile).isSymbolicLink()) throw new Error('Refusing symlink coverage-map.json.');
    let existing;
    try { existing = JSON.parse(fs.readFileSync(mapFile, 'utf8')); }
    catch { throw new Error('Existing coverage-map.json is invalid; refusing overwrite.'); }
    if (existing.producer !== 'spectra.ingest-allure') {
      throw new Error('Existing coverage-map.json is not Allure-managed; refusing overwrite.');
    }
  }
  fs.mkdirSync(snapshots, { recursive: true });
  if (!fs.existsSync(snapshotFile)) fs.writeFileSync(snapshotFile, snapshotText, { flag: 'wx' });
  const temporary = path.join(root, `.coverage-map-${process.pid}-${crypto.randomBytes(6).toString('hex')}.tmp`);
  try {
    fs.writeFileSync(temporary, mapText, { flag: 'wx' });
    fs.renameSync(temporary, mapFile);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  return { snapshotFile, mapFile };
}

module.exports = { aggregateAllure, writeAllureEvidence };
