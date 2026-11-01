'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const suites = new WeakSet();
const HASH = /^[a-f0-9]{64}$/;
const IMAGE = /^[a-z0-9][a-z0-9./:_-]*@sha256:[a-f0-9]{64}$/;
function canonical(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) throw new Error('Expected JSON data.');
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const digest = value => sha256(canonical(value));
const exact = (value, keys) => value && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }

function loadExternalSuite(file, { expectedDigest, workspaceRoot } = {}) {
  if (typeof expectedDigest !== 'string' || !HASH.test(expectedDigest) || typeof workspaceRoot !== 'string') throw new Error('Approved suite digest and workspaceRoot are required.');
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error('Invalid external suite file.');
  const relative = path.relative(fs.realpathSync(workspaceRoot), fs.realpathSync(file));
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('The suite must be outside the candidate workspace.');
  }
  let bytes;
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.size > 1024 * 1024) throw new Error('Invalid external suite file.');
    const buffer = Buffer.alloc(1024 * 1024 + 1); let total = 0, count;
    while (total < buffer.length && (count = fs.readSync(descriptor, buffer, total, buffer.length - total, null)) > 0) total += count;
    if (total > 1024 * 1024) throw new Error('External suite exceeds size bound.');
    bytes = buffer.subarray(0, total);
  } finally { fs.closeSync(descriptor); }
  if (sha256(bytes) !== expectedDigest) throw new Error('External suite digest mismatch.');
  const suite = JSON.parse(bytes.toString('utf8'));
  if (!exact(suite, ['schemaVersion', 'suiteId', 'suiteVersion', 'cases']) || suite.schemaVersion !== 1 ||
      !['suiteId', 'suiteVersion'].every(key => typeof suite[key] === 'string' && /^[A-Za-z0-9_.-]{1,80}$/.test(suite[key])) ||
      !Array.isArray(suite.cases) || suite.cases.length === 0 || suite.cases.length > 32) throw new Error('Invalid external suite contract.');
  const ids = new Set();
  for (const item of suite.cases) {
    if (!exact(item, ['id', 'input', 'expected']) || typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(item.id) ||
        ids.has(item.id) || Buffer.byteLength(canonical(item.input)) > 65536 || Buffer.byteLength(canonical(item.expected)) > 65536) {
      throw new Error('Invalid external case contract.');
    }
    ids.add(item.id);
  }
  const loaded = freeze({ ...suite, suiteDigest: expectedDigest });
  suites.add(loaded); return loaded;
}

async function evaluateExternalSuite(suite, { candidateSource, image, limits, approve, execute } = {}) {
  if (!suites.has(suite) || typeof approve !== 'function' || typeof execute !== 'function' ||
      typeof candidateSource !== 'string' || !candidateSource.trim() || Buffer.byteLength(candidateSource) > 65536 ||
      typeof image !== 'string' || !IMAGE.test(image) || !exact(limits, ['timeoutMs', 'maxOutputBytes']) ||
      !Number.isInteger(limits.timeoutMs) || limits.timeoutMs < 100 || limits.timeoutMs > 30000 ||
      !Number.isInteger(limits.maxOutputBytes) || limits.maxOutputBytes < 1024 || limits.maxOutputBytes > 65536) throw new Error('Invalid isolated evaluation configuration.');
  limits = { ...limits };
  const candidateSha256 = sha256(candidateSource), rows = [];
  let unresolved = false, dispatchedCases = 0;
  for (const item of suite.cases) {
    const request = freeze({ schemaVersion: 1, purpose: 'isolated-evaluation',
      requestId: `eval-${digest([suite.suiteDigest, item.id, candidateSha256]).slice(0, 32)}`,
      candidateSha256, inputSha256: digest(item.input), image, limits: { ...limits } });
    const requestHash = digest(request), caseHash = digest(item.id);
    try {
      const approval = freeze(JSON.parse(canonical(await approve(request, requestHash))));
      const now = Date.now();
      if (!exact(approval, ['schemaVersion', 'requestHash', 'approvedBy', 'expiresAt']) || approval.schemaVersion !== 1 ||
          approval.requestHash !== requestHash || typeof approval.approvedBy !== 'string' || !approval.approvedBy.trim() ||
          approval.approvedBy.length > 120 || typeof approval.expiresAt !== 'string' || !Number.isFinite(Date.parse(approval.expiresAt)) ||
          Date.parse(approval.expiresAt) <= now || Date.parse(approval.expiresAt) > now + 86400000) throw new Error('Invalid host approval.');
      dispatchedCases++;
      const receipt = await execute(request, approval, { candidateSource, input: item.input });
      if (receipt?.schemaVersion !== 1 || receipt.requestHash !== requestHash || receipt.image !== image ||
          receipt.cleanupConfirmed !== true || !['COMPLETED', 'CANDIDATE_ERROR'].includes(receipt.status)) {
        rows.push({ caseHash, requestHash, outcome: 'UNRESOLVED' }); unresolved = true; break;
      }
      if (receipt.status === 'CANDIDATE_ERROR') { rows.push({ caseHash, requestHash, outcome: 'FAIL', status: receipt.status }); continue; }
      if (!Object.hasOwn(receipt, 'output') || receipt.outputHash !== digest(receipt.output)) {
        rows.push({ caseHash, requestHash, outcome: 'UNRESOLVED' }); unresolved = true; break;
      }
      rows.push({ caseHash, requestHash, outcome: canonical(receipt.output) === canonical(item.expected) ? 'PASS' : 'FAIL',
        outputHash: receipt.outputHash, status: receipt.status });
    } catch {
      rows.push({ caseHash, requestHash, outcome: 'UNRESOLVED' }); unresolved = true; break;
    }
  }
  const report = { schemaVersion: 1, mode: 'external-suite-runtime-execution', suiteId: suite.suiteId,
    suiteVersion: suite.suiteVersion, suiteDigest: suite.suiteDigest, candidateSha256, image,
    expectedCases: suite.cases.length, attemptedCases: rows.length, dispatchedCases,
    completedCases: rows.filter(row => ['COMPLETED', 'CANDIDATE_ERROR'].includes(row.status)).length, rows,
    score: unresolved ? null : rows.filter(row => row.outcome === 'PASS').length / suite.cases.length,
    verdict: unresolved ? 'UNRESOLVED' : rows.every(row => row.outcome === 'PASS') ? 'PASS' : 'FAIL' };
  return freeze({ ...report, reportHash: digest(report) });
}

module.exports = { loadExternalSuite, evaluateExternalSuite, canonical, digest };
