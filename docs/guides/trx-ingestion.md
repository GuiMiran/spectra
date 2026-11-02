# Native TRX ingestion

Import local VSTest results without SpecFlow, Reqnroll or mandatory Allure:

```sh
spectra ingest-trx --input ./downloaded/trx --expected ./downloaded/expected.json \
  --run-id pipeline-main-41448729320 \
  --commit 995c956c23198e7d910fd28bae47b9268dd1af63 --ref refs/heads/main --json
```

`--input` accepts one `.trx` file or a flat directory of `.trx` files. A missing
path is an import error. An empty directory or empty Results container records
`MISSING_EVIDENCE` for the independent inventory, never a zero-test PASS.
Required values: `--input`, `--expected`, `--run-id`, `--commit` (full Git hash).
The importer reads local inputs only; it does not download or execute tests.

## Expected inventory

Use a trusted inventory frozen **before execution**. The canonical contract is
[`expected-tests.v1.schema.json`](../../schemas/expected-tests.v1.schema.json):

```json
{
  "schemaVersion": 1,
  "source": { "system": "reviewed-specs", "revision": "specs-v1" },
  "tests": [{ "id": "AC-001", "key": "Successful login", "execution": "expected" }]
}
```

`key` must exactly equal native TRX `testName`. No fuzzy matching is performed.
An expected `not_run` test is not a pass. Duplicate IDs or keys are errors.
Pipeline PR #13's pre-execution inventory is also supported directly:

```json
{
  "schemaVersion": 1,
  "commit": "995c956c23198e7d910fd28bae47b9268dd1af63",
  "tests": [{ "id": "AUTH-001", "name": "Successful login with standard user" }]
}
```

The Pipeline commit must match `--commit`. Its domain IDs are retained as
expected-test IDs; they are not SPECTRA acceptance IDs. Passing unmapped tests
remain `UNMAPPED` gaps until an independently reviewed specification mapping
exists. A complete execution PASS does **not** claim complete spec coverage.

## Outputs and exit status

- `.spectra/evidence/test-runs/<run-id>.json`: immutable snapshot with original
  file SHA-256, commit/ref, native run/test/execution identities, outcomes,
  expected qualification and inventory hashes (parsed JSON serialization).
- `.spectra/coverage-map.json`: TRX-owned current gaps consumed by the Gap Engine,
  retaining `trx-results`, run ID, source digest and snapshot references.
- Exit `0` only when every expected result passes, there are no unexpected tests,
  and all imported native run summaries are Completed/Passed; otherwise `1`.
- JSON `success: true` means the import succeeded, not that tests passed.
  Inspect `qualification.verdict`. Invalid input emits `success: false`.

Re-importing identical evidence with the same run ID is idempotent. Changed
evidence under that ID, symlinked outputs and a map owned by another producer
(including Allure) are rejected. Use separate project roots for independent
source imports; there is no automatic cross-source merge or history comparison.
This command does not rewrite `.spectra/evidence.json` used by `spectra verify`.

Supported XML is bounded UTF-8, default TeamTest/2010 namespace and flat
UnitTestResult entries. Prefixes, namespace rebinding, DTDs, external entities,
nested data-driven results and implicit retries are rejected. Limits: 100 files,
16 MiB per file, 32 MiB total, 200,000 XML nodes per file, depth 64, CLI inventory
2 MiB. Unknown outcomes remain UNKNOWN. Native Counters and rendered summaries
are not used to derive expected inventory or establish PASS.

## Recorded integration check (not a new test execution)

On 2026-11-02 the importer was replayed against Pipeline main
[run 41448729320](https://github.com/GuiMiran/guido-agentic-pipeline/actions/runs/41448729320),
commit `995c956c23198e7d910fd28bae47b9268dd1af63`, artifact `13144375709`.
The downloaded ZIP matched GitHub's published SHA-256
`b5f6fea107df531ef843fc60860c293b9d2d1fafc17cc0bff7591500cea7bcca`.
The original `tests.trx` hash was
`bec0914e6eb04cf2412d2bc29d3e1ff427c3c4a43fdf1c51bbb6623b77ae3ad9`.
Result: 23 expected, 23 observed, 23 passed, no missing/unexpected results;
23 unmapped SPECTRA relationships retained as gaps. This checks import fidelity,
not independent correctness of SauceDemo assertions or collector trust.

See [ADR-0018](../architecture/decisions/0018-native-trx-ingestion.md).
