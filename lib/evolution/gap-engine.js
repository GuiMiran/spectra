'use strict';

const fs = require('fs');
const path = require('path');
const { validateGap } = require('./contracts');
const { sha256, unique } = require('./utils');

const SEVERITY_RANK = { CRITICAL: 3, MAJOR: 2, MINOR: 1 };

function normalizeSeverity(value, fallback = 'MINOR') {
  const normalized = String(value || '').toUpperCase();
  return SEVERITY_RANK[normalized] ? normalized : fallback;
}

function parseTableRow(line) {
  if (!line.trim().startsWith('|')) return [];
  return line.split('|').slice(1, -1).map(cell => cell.trim());
}

function parseTrace(traceContent) {
  const gaps = [];
  const rows = traceContent.split(/\r?\n/);
  let inForwardMatrix = false;

  rows.forEach(line => {
    if (/^## \[2\] Forward Matrix/.test(line)) inForwardMatrix = true;
    else if (inForwardMatrix && /^## \[3\]/.test(line)) inForwardMatrix = false;
    if (!inForwardMatrix) return;

    const cells = parseTableRow(line);
    if (cells.length < 8 || !/^(US|BR|INV|OP|POL|EVT|AG|SK|WF)-\d{3}$/.test(cells[0])) return;
    const [id, type, description, priority, status, artifacts, tests, severity] = cells;
    if (!/PENDING|PARTIAL/.test(status)) return;

    gaps.push(validateGap({
      id,
      type,
      severity: normalizeSeverity(severity, type === 'INV' || type === 'SK' ? 'CRITICAL' : 'MINOR'),
      status: status.includes('PARTIAL') ? 'PARTIAL' : 'PENDING',
      priority,
      description: description === '—' ? `${id} lacks complete evidence` : description,
      artifacts: artifacts === '—' ? [] : artifacts.split(',').map(value => value.trim()),
      tests: tests === '—' ? [] : tests.split(',').map(value => value.trim()),
      sources: ['spectra-trace'],
    }));
  });

  const orphanSection = traceContent.match(/## \[3\] Reverse Matrix[\s\S]*?(?=## \[4\])/);
  if (orphanSection) {
    orphanSection[0].split(/\r?\n/).forEach(line => {
      const cells = parseTableRow(line);
      if (cells.length < 7 || !cells[4]?.includes('ORPHAN')) return;
      gaps.push(validateGap({
        id: `ORPHAN-${sha256(`${cells[0]}:${cells[3]}`).slice(0, 8).toUpperCase()}`,
        type: 'ORPHAN',
        severity: 'MINOR',
        status: 'ORPHAN',
        description: `${cells[0]} references missing specification ${cells[3]}`,
        artifact: cells[0],
        sources: ['spectra-trace'],
      }));
    });
  }

  return gaps;
}

function parseAllure(summary) {
  const tests = Array.isArray(summary.tests) ? summary.tests : [];
  const failed = tests.filter(test => ['failed', 'broken'].includes(String(test.status).toLowerCase()));
  return failed.map((test, index) => {
    const specId = test.specId || test.spec_id || (String(test.name || '').match(/\b(?:US|BR|INV|OP|POL|EVT|AG|SK|WF|AC)-\d{3}\b/) || [])[0];
    return validateGap({
      id: specId || `ALLURE-${String(index + 1).padStart(3, '0')}`,
      type: 'TEST',
      severity: String(test.status).toLowerCase() === 'broken' ? 'CRITICAL' : 'MAJOR',
      status: String(test.status).toUpperCase(),
      description: test.name || test.fullName || 'Failing Allure test',
      sources: ['allure-summary'],
    });
  });
}

function parseCoverageMap(map) {
  const rawGaps = Array.isArray(map) ? map : Array.isArray(map.gaps) ? map.gaps : [];
  return rawGaps.map((gap, index) => validateGap({
    id: String(gap.id || gap.specId || `COVERAGE-${String(index + 1).padStart(3, '0')}`),
    type: String(gap.type || 'COVERAGE').toUpperCase(),
    severity: normalizeSeverity(gap.severity, 'MAJOR'),
    status: String(gap.status || 'PENDING').toUpperCase(),
    description: String(gap.description || gap.name || 'Coverage gap'),
    sources: ['coverage-map'],
  }));
}

function mergeGaps(gaps) {
  const byId = new Map();
  gaps.forEach(gap => {
    const existing = byId.get(gap.id);
    if (!existing) {
      byId.set(gap.id, { ...gap, sources: [...gap.sources] });
      return;
    }
    const severity = SEVERITY_RANK[gap.severity] > SEVERITY_RANK[existing.severity]
      ? gap.severity
      : existing.severity;
    byId.set(gap.id, {
      ...existing,
      ...gap,
      severity,
      description: existing.description.length >= gap.description.length ? existing.description : gap.description,
      sources: unique([...existing.sources, ...gap.sources]),
    });
  });
  return [...byId.values()]
    .map(validateGap)
    .sort((left, right) => SEVERITY_RANK[right.severity] - SEVERITY_RANK[left.severity] || left.id.localeCompare(right.id));
}

function loadJsonIfPresent(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

class CoverageMapAdapter {
  constructor(projectRoot, config) {
    this.projectRoot = projectRoot;
    this.config = config;
  }

  aggregate(objective) {
    const traceFile = path.resolve(this.projectRoot, this.config.inputs.trace);
    const allureFile = path.resolve(this.projectRoot, this.config.inputs.allureSummary);
    const coverageFile = path.resolve(this.projectRoot, this.config.inputs.coverageMap);
    const inputs = {
      trace: fs.existsSync(traceFile),
      allureSummary: fs.existsSync(allureFile),
      coverageMap: fs.existsSync(coverageFile),
    };

    const gaps = [];
    if (inputs.trace) gaps.push(...parseTrace(fs.readFileSync(traceFile, 'utf8')));
    if (inputs.allureSummary) gaps.push(...parseAllure(loadJsonIfPresent(allureFile)));
    if (inputs.coverageMap) gaps.push(...parseCoverageMap(loadJsonIfPresent(coverageFile)));
    if (gaps.length === 0) {
      gaps.push(validateGap({
        id: 'OBJ-001',
        type: 'OBJECTIVE',
        severity: 'MAJOR',
        status: 'UNASSESSED',
        description: `No measured evidence yet for objective: ${objective.statement}`,
        sources: ['objective-fallback'],
      }));
    }

    const merged = mergeGaps(gaps).slice(0, this.config.limits.maxGapsPerRun);
    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      inputs,
      gaps: merged,
      metrics: {
        total: merged.length,
        critical: merged.filter(gap => gap.severity === 'CRITICAL').length,
        major: merged.filter(gap => gap.severity === 'MAJOR').length,
        minor: merged.filter(gap => gap.severity === 'MINOR').length,
      },
    };
  }
}

module.exports = {
  CoverageMapAdapter,
  mergeGaps,
  normalizeSeverity,
  parseAllure,
  parseCoverageMap,
  parseTrace,
};
