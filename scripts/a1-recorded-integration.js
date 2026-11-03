#!/usr/bin/env node
'use strict';

// Bounded HOST integration, not part of the pure projector or the planning runtime.
// Runs only a fixed reviewed auditor CLI on a fixed clean Git checkout; never target code.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { projectA1GapPlan } = require('../lib/verification/a1-gap-plan');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function read(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error('Integration input is not a bounded regular file.');
  return fs.readFileSync(file);
}
function run(workspacePath, outputPath) {
  const workspace = fs.realpathSync(workspacePath), root = path.resolve(__dirname, '..');
  const target = fs.realpathSync(path.join(workspace, 'target')), scale = fs.realpathSync(path.join(workspace, 'scale'));
  const parent = fs.realpathSync(path.dirname(path.resolve(outputPath)));
  const output = path.join(parent, path.basename(outputPath));
  if ([root, target, scale].some(repo => output === repo || output.startsWith(repo + path.sep))) throw new Error('Outputs must stay outside all source repositories.');
  const fixture = path.join(root, 'evals/a1-recorded-pipeline');
  const pinsBytes = read(path.join(fixture, 'pins.json')), pins = JSON.parse(pinsBytes);
  const inputs = { receiptBytes: read(path.join(fixture, 'receipt.json')), snapshotBytes: read(path.join(fixture, 'snapshot.json')),
    expectedBytes: read(path.join(fixture, 'expected.json')) };
  for (const [key, bytes] of [['receiptSha256', inputs.receiptBytes], ['snapshotSha256', inputs.snapshotBytes],
    ['expectedInventorySha256', inputs.expectedBytes]]) if (hash(bytes) !== pins.hashes[key]) throw new Error('Recorded byte pin mismatch.');
  const operations = { gitReadCommands: 0, auditorInvocations: 0 };
  const environment = { PATH: process.env.PATH, PYTHONDONTWRITEBYTECODE: '1' };
  function git(repo, args) {
    operations.gitReadCommands++;
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', env: environment, timeout: 10000, maxBuffer: 1024 * 1024 }).trim();
  }
  function clean(repo, commit) {
    if (git(repo, ['rev-parse', 'HEAD']) !== commit || git(repo, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored=matching'])) {
      throw new Error('Pinned source checkout is dirty or at a different commit.');
    }
  }
  clean(target, pins.source.commit);
  clean(scale, pins.auditorCommit);
  const projectorCommit = git(root, ['rev-parse', 'HEAD']);
  fs.mkdirSync(output, { recursive: false });
  const auditDir = path.join(output, 'audit');
  operations.auditorInvocations++;
  execFileSync('python3', [path.join(scale, 'src/guido_auditor/cli.py'), 'audit', target, '--output-dir', auditDir],
    { env: environment, timeout: 60000, maxBuffer: 1024 * 1024 });
  clean(target, pins.source.commit);
  clean(scale, pins.auditorCommit);
  const auditBytes = read(path.join(auditDir, 'audit.json'));
  const generatedAt = new Date().toISOString();
  const { projection: projected, ...review } = projectA1GapPlan({ ...inputs, auditBytes }, pins,
    { generatedAt, correlationId: `a1-pipeline-${pins.source.runId}-${pins.source.attempt}` });
  const contractsBytes = Buffer.from(JSON.stringify(projected.contracts, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'contracts.json'), contractsBytes, { flag: 'wx' });
  const reviewBytes = Buffer.from(JSON.stringify(review, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'gap-review.json'), reviewBytes, { flag: 'wx' });
  const receipt = { schemaVersion: 1, kind: 'recorded-evidence-live-audit-projection', generatedAt,
    repository: pins.source.repository, sourceCommit: pins.source.commit, sourceRunId: pins.source.runId,
    handoffRunId: pins.handoffRunId, auditorCommit: pins.auditorCommit, projectorCommit,
    pinnedInputsSha256: hash(pinsBytes), auditSha256: hash(auditBytes), contractsFileSha256: hash(contractsBytes),
    contractsCanonicalSha256: projected.provenance.contractsSha256, validation: projected.validation,
    filePresence: { observed: projected.contracts.repositoryProfile.observations.filter(item => item.status === 'observed').length,
      noEvidence: projected.contracts.repositoryProfile.observations.filter(item => item.status === 'no_evidence').length },
    testCounts: projected.contracts.evidenceBundle.counts, hostOperations: operations,
    gapReview: { outcome: review.outcome, measuredGaps: review.gapReport.gaps.length,
      selectedGapId: review.selectedGapId, reportSha256: review.gapReportSha256, fileSha256: hash(reviewBytes) },
    targetCleanBefore: true, targetCleanAfter: true, targetCodeExecuted: false,
    limitations: ['RECORDED_TESTS_NOT_NEW_SELENIUM_EXECUTION', 'GITHUB_AUTHENTICATION_RECORDED_BY_REVIEWED_INPUT_PINS',
      'FILE_PRESENCE_ONLY', 'NO_ORGANIZATIONAL_SCORE_OR_EXECUTION_AUTHORITY'] };
  fs.writeFileSync(path.join(output, 'projection-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(receipt));
  return receipt;
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--workspace' || args[2] !== '--output') throw new Error('Usage: --workspace <three-checkout-root> --output <outside-repos>');
  run(args[1], args[3]);
}
module.exports = { run };
