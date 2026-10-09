# Stage 2 trust assessment

`assessStage2` is a local library contract for assessing evidence collected
elsewhere. It does not run a benchmark or certify the supplied data.

```bash
npm run stage2:assess -- --input path/to/stage2-record.json
```

The command prints a JSON verdict. Exit codes are `0` for PASS, `1` for FAIL
or UNRESOLVED, and `2` for invalid input or an unreadable file. The example at
`evals/stage2-pass.json` exercises the shape only; its results are illustrative
and must never be reported as a real benchmark run.

```js
const { assessStage2 } = require('../../lib/verification/stage2');
const result = assessStage2(record);
// { valid: true, errors: [], verdict: 'PASS' | 'FAIL' | 'UNRESOLVED', reasons: [] }
```

`record` uses `schemaVersion: 1` and has `agentId`, `candidateCommit`,
`integratedCommit`, `critical`, `integration`, `policies`, `checks`,
`coordination` and `repetitions`. See `test/verification.stage2.test.js` for a
complete passing example and failure cases. A policy has `id`, `surface`
(`trajectory` or `result`), `applicable`, `outcome` and `evaluatorId`.
The four named checks are `functional`, `supported`, `traceable` and
`honestCompletion`. A repetition has a unique `runId`, the tested `commit`,
`outcome`, and an `evaluatorId` distinct from the builder.

Only a passing, integrated result with policy evidence on both surfaces and
enough stable reruns receives `PASS`. `FAIL` takes precedence over missing
information; missing checks, unknown contracts or unverified integration
remain `UNRESOLVED`. The assessor validates declared IDs and results, not the
authenticity of a collector or a cryptographic proof of independent execution.

Before parallel work, list each task's `writeScope`, `consumes` and `produces`.
After integration, rerun verification on the merge and use that commit in every
repetition. Preserve intermediate policy events so transient violations are
visible even if the final diff looks compliant.

Architecture rationale: [ADR-0010](../architecture/decisions/0010-stage2-trust-assessment.md).
