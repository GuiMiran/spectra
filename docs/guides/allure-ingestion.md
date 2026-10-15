# Import Allure results

From a project containing an Allure 2 results directory:

```bash
spectra ingest-allure --input ./allure-results --run-id ci-42 --commit abcdef1234 --ref refs/heads/main --json
```

The command reads top-level `*-result.json` files, groups attempts by Allure
`historyId` (falling back to full name, name, then UUID), and writes:

- `.spectra/evidence/test-runs/<run-id>.json`: immutable snapshot of final
  status, retry history, spec IDs, source file hashes and supplied Git provenance;
- `.spectra/coverage-map.json`: latest Allure-managed gaps consumed by the
  existing Gap Engine during `spectra evolve`.

An omitted run ID is derived from the source file digests. The command accepts
IDs from `spectraId`, `specId`, `tag`, or `as_id` labels and from explicit
SPECTRA IDs in test names. An unmatched test is recorded as `UNMAPPED`, even if
it passed. A failed or broken final attempt creates a gap; a failed retry that
eventually passed becomes `FLAKY`. The snapshot retains all attempts and the
SHA-256 digest of each result file, while avoiding raw failure messages and
attachments. Missing or unordered retry timestamps fail ingestion.

The importer does not run tests, attest that Allure files are genuine, or infer
a Git commit. Pass `--commit` and `--ref` from the trusted CI environment. The
evidence level is a **recorded execution result**, not independent behavioural
verification. Keep the input and persisted snapshot under a trusted collector
when using results for promotion decisions.

The current coverage map is replaced only if it was created by this importer.
An existing map from another producer causes an error, preserving its data.
The versioned snapshot for a run ID is never replaced with different content.
Combining Allure with other map producers and comparing baseline runs remains
part of P1-02; this first slice exposes observed failures and missing links.

See [ADR-0012](../architecture/decisions/0012-allure-ingestion.md).
