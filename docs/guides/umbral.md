# Umbral: synthetic release-transition control

Umbral is a local SPECTRA/GUIDO evaluation fixture, not a production release
gate. Its example contract permits `PreReady → Ready → Release` but rejects
`PreReady → Release` with HTTP 409 and `TRANSITION_NOT_ALLOWED`, preserving
the resource state.

Run it from the repository root with Node.js 18 or later:

```sh
node evals/umbral.mjs
```

The script starts a temporary HTTP server bound to loopback, prints one JSON
record per variant and exits nonzero if observations differ from expectations.
The existing `npm run verify` CI job exercises it through the Node test suite.

| Variant | Valid-path smoke | Smoke plus rejection checks |
| --- | --- | --- |
| Reference | Pass | Pass |
| Direct jump permitted | Pass | Fail |
| Rejection returns the expected error but changes the state | Pass | Fail |
| Rejection returns the wrong domain error | Pass | Fail |

The independent GET before and after the attempt catches a state change even
when the rejected POST returns the expected status and domain code. This only
checks observable state at readback time: it does not establish transactional
rollback or the absence of downstream effects. The experiment uses no remote
API, credentials, production release policy or agent.
