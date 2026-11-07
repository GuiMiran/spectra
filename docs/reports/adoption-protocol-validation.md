# Adoption protocol validation

Date: 2026-11-07. Inspected Spectra baseline:
`c6d1f36d3ec98ab48e47cafeaf24b4039fdb2e85`, package version 0.5.0.
Change scope: documented protocol `spectra-adoption` 1.0.0, templates,
navigation and ownership. No runtime or public CLI change.

| Check | Observed result | Limit |
| --- | --- | --- |
| `npm run verify` | 174 tests passed, 0 failures, 0 skipped; repository harness and syntax checks passed | Existing Spectra tooling regression, not consumer maturity |
| Temporary synthetic consumer | `init`, populated-layer `validate`, and `trace` completed successfully | Structural compatibility, not application correctness |
| Existing-consumer preservation | Repeated `init` rejected an existing `.spectra/`; selected story bytes remained unchanged | Existing CLI behavior, not an automatic adoption transaction |
| Opt-in templates | JSON record parsed; AGENTS.md and record copied manually into temporary consumer | No schema enforcement or automatic copy claimed |
| Local documentation links | New adoption guides and ADR targets resolved | External URLs, anchors and rendered layout not verified |
| `npm pack --dry-run --json` | Three guides and both adoption templates included | No publication or release performed |

The temporary consumer used one synthetic story, one acceptance link and a
source trace annotation. Remaining layers held explicitly synthetic scope text.
No acceptance PASS receipt, GUIDO score, reconstruction claim, deployment or
consumer database mutation was created. The temporary directory was removed.

To repeat the compatibility smoke, run `spectra init` in an empty disposable
directory, fill its generated layers with a bounded synthetic domain and stable
IDs, manually copy/adapt the templates, run `spectra validate` and
`spectra trace`, then verify that rerunning init refuses to overwrite it.
Use `npm run verify` and the npm dry-run from the Spectra checkout for the
repository/package checks. This report records local execution; remote CI
results and maintainer adoption review are separate.
