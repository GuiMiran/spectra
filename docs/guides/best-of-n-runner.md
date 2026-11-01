# Budget-matched best-of-n runner

```bash
npm run best-of-n:demo
```

This runs a deterministic public example with **no model calls, credentials or
network access**. Its token/tool counts and scores are fixture values, not
measurements of a model. CI runs the same demo and mutation/negative tests.

The API is exported by `lib/evaluation/index.js`:

```js
const { runBestOfN, verifyBestOfNReport } = require('../../lib/evaluation');
const report = await runBestOfN(config, { baseline, candidate, select, evaluate });
const integrity = verifyBestOfNReport(report);
```

`config` contains schemaVersion 1, `n` (2–32), `executor` with model,
harnessVersion and toolsHash, a whole-arm `budget` with tokens/toolCalls,
per-phase `limits`, timeoutMs, a public `task` with only id/input, suiteHash,
oracleHash, selectionMetric and a distinct evaluationMetric. The complete
example configuration is in `scripts/best-of-n-demo.js`.

| Callback | Input | Required output |
| --- | --- | --- |
| baseline | Public task, attempt index, executor, allowance, AbortSignal | JSON artifact, executor and usage |
| candidate | Same public task, executor, allowance, AbortSignal | Artifact from the candidate method, executor and usage |
| select | Artifact, public task, visible metric, executor and allowance | Score in [0,1], executor and usage |
| evaluate | Frozen artifact, heldout split, evaluation metric and suite/oracle hashes | Score, matching identity, known-good/no-op booleans, positive and negative fault controls, executor and usage |

Usage is `{ tokens, toolCalls }` for **all internal work performed by that
callback**, not just its final model call. For the baseline the total includes
all n generations, n selections and the final evaluation. The candidate method
may use its own strategy inside its callback but must report all its work.
Both methods receive the same total ceilings; actual consumption is recorded
and need not be identical. A reservation must fit before a callback starts.

The selector never receives suite/oracle data. No generation or selection
callback runs after held-out evaluation starts. The host must keep actual
held-out cases inside the evaluator's independent custody; supplying hashes or
using separate callbacks in one process does not enforce that isolation.
The evaluator request omits method labels and attempt indexes. Artifact content
and call order may still reveal the method; a real blinded trial needs host-side
anonymisation and counterbalanced evaluation order.

## Outcomes and audit

- `COMPLETED`: both arms produced an evaluation. Check `assessment.verdict`
  separately; completion does not imply improvement.
- `BUDGET_STOP`: the next reservation did not fit. No next call and no comparison
  score are produced.
- `INFRA_ERROR`: invalid telemetry, identity, controls, replies or timeout. The
  report marks unresolved usage; known consumption is only a lower bound.

Reports retain task/config hashes, selected artifact hashes, numeric scores,
usage, per-phase reservations and a SHA-256 event chain. They do not contain raw
artifacts, prompts, task text, arbitrary adapter metadata or raw exceptions.
`verifyBestOfNReport` detects modified bytes relative to the embedded digests;
it is not a signature, authorization check or proof of honest measurements.

Adapters must enforce the passed allowance and honour cancellation. A callback
can ignore AbortSignal or spend before throwing, so host/process-level controls
remain essential for a real provider. The module has no default shell, MCP,
source mutation, registry persistence or promotion operation.

See [ADR-0015](../architecture/decisions/0015-budget-matched-runner.md).
