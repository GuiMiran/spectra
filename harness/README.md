# Repository Verification Harness

This directory contains the repository-level SPECTRA matrix. It is distinct
from a consumer project's `.spectra/12-trace.md`:

- `.spectra/12-trace.md` traces a consumer domain specification to its implementation;
- `harness/spectra-matrix.json` traces this repository's architectural requirements to owned artefacts and independent evidence.

Each matrix entry has a stable identifier, one owner, implementation artefacts,
evidence artefacts, and one or more verification commands. The harness validates
the schema, duplicate identifiers, referenced paths, local documentation links,
and the minimal root-document policy.

Run the complete repository check with:

```bash
npm run verify
```
