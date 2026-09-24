'use strict';

const fs = require('fs');
const path = require('path');
const { sha256 } = require('./utils');

const RELATIVE_REPORT = '.spectra/guido-audit.json';
const MAX_BYTES = 1024 * 1024;

function loadGuidoAudit(projectRoot) {
  const reportPath = path.join(projectRoot, RELATIVE_REPORT);
  let stat;
  try {
    stat = fs.lstatSync(reportPath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BYTES) {
    throw new Error('GUIDO audit must be a regular JSON file smaller than 1 MiB.');
  }
  const root = fs.realpathSync(projectRoot);
  if (!fs.realpathSync(reportPath).startsWith(`${root}${path.sep}`)) {
    throw new Error('GUIDO audit must stay inside the project.');
  }
  const raw = fs.readFileSync(reportPath, 'utf8');
  let report;
  try {
    report = JSON.parse(raw);
  } catch {
    throw new Error('GUIDO audit is not valid JSON.');
  }
  if (report?.schema_version !== '1.0' || report.agent !== 'sdd-auditor'
      || !Array.isArray(report.checks) || report.checks.length > 100) {
    throw new Error('GUIDO audit has an unsupported evidence contract.');
  }
  const seen = new Set();
  const checks = report.checks.map(check => {
    if (!check || typeof check.id !== 'string' || !/^[a-z][a-z0-9_]*$/.test(check.id)
        || seen.has(check.id) || !['observed', 'no_evidence'].includes(check.status)
        || !Array.isArray(check.evidence) || check.evidence.length > 1000
        || !check.evidence.every(item => typeof item === 'string')
        || !Number.isSafeInteger(check.evidence_count) || check.evidence_count < check.evidence.length
        || (check.status === 'no_evidence' && check.evidence_count !== 0)) {
      throw new Error('GUIDO audit contains invalid check evidence.');
    }
    seen.add(check.id);
    return { id: check.id, status: check.status, evidenceCount: check.evidence_count };
  });
  return {
    source: RELATIVE_REPORT,
    sha256: sha256(raw),
    repositoryCommit: typeof report.repository?.commit === 'string' ? report.repository.commit : null,
    observed: checks.filter(check => check.status === 'observed').length,
    noEvidence: checks.filter(check => check.status === 'no_evidence').length,
    checks,
    interpretation: 'File presence only; no GUIDO organizational score or SPECTRA gap inferred.',
  };
}

module.exports = { loadGuidoAudit };
