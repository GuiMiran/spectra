# Evidence-closed evaluation controls

These controls implement engineering actions from the October QA briefs. They
do not assert that the supplied research has been replicated by SPECTRA.

## Allure inventory and continuity

```bash
spectra ingest-allure --input allure-results --run-id ci-43 --expected expected-tests.json --baseline .spectra/evidence/test-runs/ci-42.json --json
```

`--expected` is a separately frozen inventory from the CI workflow or test-plan
owner, **not a list inferred from the Allure files that happened to arrive**.
The host must enforce custody and versioning. For example:

```json
{
  "schemaVersion": 1,
  "source": { "system": "GitHub Actions", "revision": "workflow-and-plan-v1" },
  "tests": [{ "id": "TC-001", "key": "checkout", "execution": "expected" }]
}
```

The `key` is the same stable history ID used by the Allure importer. The JSON
Schema is in `schemas/expected-tests.v1.schema.json`; the runtime also rejects
duplicate IDs and keys. The snapshot retains the inventory digest and source
revision. The command validates contracts before writing either output.

| Observation | Qualification state |
| --- | --- |
| Expected test passed without flaky attempts | PASS |
| Final result failed or broken | FAIL |
| Expected test skipped, or plan explicitly says it did not run | NOT_RUN |
| Expected test has no result | MISSING_EVIDENCE |
| Flaky/unknown result, contradictory plan, or no trusted inventory | UNKNOWN |

All obligations must be PASS and no unexpected tests may be present to qualify
the run. An empty results directory with a valid inventory generates missing
evidence, not success. With `--expected`, a non-PASS qualification exits 1 after
persisting the evidence. Legacy ingestion without an inventory still exits 0
on a successful **import**, but reports UNKNOWN qualification; that exit code
must not be used as a release approval. Malformed inputs exit unsuccessfully
without overwriting evidence.

Legacy snapshots remain usable as baselines. Re-importing their original run ID
with the new additive qualification fields intentionally refuses an overwrite;
use a new `--run-id` to preserve both versions of the evidence.

`--baseline` creates critical REGRESSION gaps when a previously stable test
fails, becomes uncertain or disappears. A single prior passing snapshot is a
continuity baseline, not statistical proof of historical stability. Snapshots
must cover comparable test scopes; caller custody remains necessary.

## Executable prefixes

`trajectory:assess` reports 1-based `first_invalid_step`, `valid_prefixes`,
`total_prefixes`, `valid_prefix_ratio`, and
`successful_result_after_invalid_step`. Every prefix after a violation remains
invalid even if a later tool reports success. A tool failure followed by a
justified retry is not itself an invalid prefix. Result and decision references
must point to the latest dependency, not an older successful call. These are
record-level checks, not permission to run the recorded actions.
A truncated but well-ordered trajectory can have fully executable prefixes
while still failing the separate completion requirement.

## Comparisons and deployment identity

```bash
npm run comparison:assess -- evals/comparison-pass.json
```

The command checks a supplied record for best-of-n versus candidate budget
parity (whole-arm tokens and tool calls), executor identity, matching
suite/oracle digests in both arms, a held-out metric not listed among optimized
metrics, preservation of known-good behaviour,
no-op comparison, and both positive and negative fault controls. The fixture
is illustrative, not a measured improvement. The assessor does not generate
candidates or perform model calls and is not wired as an automatic promotion
authority. A trusted experiment runner must produce the measurements.
The separate [best-of-n runner](best-of-n-runner.md) supplies that execution
protocol through host-owned callbacks; its bundled demo has no live model.

Automatic Mother prompt promotion now additionally requires
`invocationConfig.executor = { model, harnessVersion, toolsHash }`. Its model
and tools must match the actual pinned invocation config. The host script
loads `harnessVersion` from `SPECTRA_PROMPT_HARNESS_VERSION`; the scheduled
workflow reads the repository variable with that name. Existing proposal-only
evaluation remains supported. Missing or mismatched identity fails before
model invocation and before the registry changes. Historical audit records are
still readable. Declared identity is not an attestation of a remote endpoint.

## Instruction-file security

`AGENTS.md` requires conflict reporting and preservation of verified behaviour.
`CODEOWNERS` assigns instruction files, evaluator controls and workflows to the
maintainer. **Required code-owner review must still be enabled by a human in a
repository ruleset**; CODEOWNERS alone does not block merging. Changes to these
files must be called out separately in the PR. The existing Node security and
mutation checks run for every PR, including instruction-only changes.

Next work and experimental boundaries are in the
[QA brief delivery ledger](../planning/qa-brief-delivery.md).
