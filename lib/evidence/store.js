'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function writeEvidence(projectRoot, aggregation, producer) {
  if (!['spectra.ingest-allure', 'spectra.ingest-trx'].includes(producer) ||
      aggregation.coverageMap.producer !== producer ||
      !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(aggregation.snapshot.runId)) {
    throw new Error('Invalid evidence producer or run ID.');
  }
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
    if (existing.producer !== producer) {
      throw new Error(producer === 'spectra.ingest-allure'
        ? 'Existing coverage-map.json is not Allure-managed; refusing overwrite.'
        : 'Existing coverage-map.json is not managed by this evidence producer; refusing overwrite.');
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


module.exports = { writeEvidence };
