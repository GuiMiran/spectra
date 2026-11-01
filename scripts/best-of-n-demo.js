#!/usr/bin/env node
'use strict';
const { runBestOfN } = require('../lib/evaluation/best-of-n');

async function runDemo() {
  const executor = { model: 'deterministic-demo-not-a-model', harnessVersion: 'demo-v1', toolsHash: 'a'.repeat(64) };
  const config = {
    schemaVersion: 1, executor, n: 3, budget: { tokens: 100, toolCalls: 10 }, timeoutMs: 1000,
    limits: { baseline: { tokens: 15, toolCalls: 1 }, candidate: { tokens: 30, toolCalls: 2 },
      select: { tokens: 5, toolCalls: 0 }, evaluate: { tokens: 10, toolCalls: 0 } },
    task: { id: 'public-demo', input: 'Compare deterministic fixture artifacts.' },
    suiteHash: 'b'.repeat(64), oracleHash: 'c'.repeat(64),
    selectionMetric: 'visible-checks', evaluationMetric: 'heldout-checks',
  };
  const reply = (usage, fields) => ({ executor, usage, ...fields });
  return runBestOfN(config, {
    baseline: async ({ index }) => reply({ tokens: 10, toolCalls: 1 }, { artifact: `baseline-${index}` }),
    candidate: async () => reply({ tokens: 20, toolCalls: 2 }, { artifact: 'candidate' }),
    select: async ({ artifact }) => reply({ tokens: 2, toolCalls: 0 },
      { score: artifact === 'candidate' ? 0.9 : [0.2, 0.8, 0.5][Number(artifact.at(-1))] }),
    evaluate: async ({ artifact, suiteHash, oracleHash, metric, split }) => reply({ tokens: 5, toolCalls: 0 }, {
      suiteHash, oracleHash, metric, split,
      score: artifact === 'candidate' ? 0.9 : 0.6, knownGoodPreserved: true, noOpCompared: true,
      faults: [{ id: 'broken', expectedDetected: true, observedDetected: true },
        { id: 'correct-alternative', expectedDetected: false, observedDetected: false }],
    }),
  });
}

if (require.main === module) runDemo().then(report => {
  process.stdout.write(`${JSON.stringify({ mode: 'illustrative-demo-no-model-calls', report })}\n`);
  process.exitCode = report.status === 'COMPLETED' && report.assessment.verdict === 'PASS' ? 0 : 1;
}).catch(() => { process.stderr.write('Demo configuration failed.\n'); process.exitCode = 2; });

module.exports = { runDemo };
