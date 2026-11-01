# Frozen executable Stage 2 controls

```bash
npm run stage2:freeze
npm run stage2:controls
```

The first command verifies the frozen file inventory. The second executes all
public controls and prints a JSON report. Neither command calls a model,
uses credentials, opens the network or persists product state. The targets are
fixed in-memory implementations, not untrusted candidate programs.

| Coupled requirements | Correct variants | Known defects |
| --- | --- | --- |
| Retry after response loss + exactly-once effect | Receipt map; completed-operation set | Duplicate charge on retry; never retry |
| Concurrent work + shared capacity ceiling | Atomic reservation; slot set | Yield between check and reservation; reject all work |
| Correlated trace + privacy | Whitelisted events with digest; minimal safe events | Raw synthetic token/email; missing correlation |
| Legacy v1 compatibility + missing evidence must not pass | Indexed lookup; direct lookup | Reject v1; absence becomes PASS |

Each case has two positive and two negative controls. All 16 logical controls
run three times with fresh target state, giving 48 executions. The oracle checks
observable behaviour using the public specification inputs; it does not consume
the implementation's declared pass/fail label. The runner compares hashes of
the observable result before and after oracle evaluation and checks that each
control's output and verdict repeat consistently.

## Frozen protocol

`evals/stage2/protocol.json` pins suite ID/version, public inputs, requirement
pairs, all control IDs, seed 0 (no randomness), three repetitions, and no
selection policy. `freeze.json` pins the exact bytes of that protocol, targets,
oracle and runner. A missing file, omitted digest, symlink or changed byte fails
verification. The manifest is not refreshed during tests or CI.

The freeze is an integrity check against a maintainer-approved manifest, not a
signature or protection against an actor who can rewrite the manifest too.
Review any change as a new suite revision, update the version and expected
digests deliberately, and retain the previous commit and result artifacts.
CODEOWNERS covers these files; required review rules remain a maintainer task.

## Report and interpretation

The report contains the frozen source digests, manifest digest, actual Node
version, expected versus observed classification for every fault/control,
violated rule IDs, before/after result hashes and repeatability metrics. Raw
results and synthetic sensitive values are not written to the report. Identical
runs in the same runtime produce an identical report hash. Different Node
versions are recorded and can change the overall report hash.

- Exit 0 / PASS: all correct variants accepted, all known faults rejected,
  oracle scoring left result bytes unchanged, and repeats were stable.
- Exit 1 / FAIL: completed controls disagree with the expected classifications
  or repeatability/state-preservation requirements.
- Exit 2 / UNRESOLVED: invalid freeze, protocol or an incomplete execution.
  An infrastructure exception is not counted as successful fault detection.

CI runs `stage2:controls` and uploads `stage2-controls-report.json` under the
workflow's commit/run identity, even when the control command fails. The 48
deterministic executions are **not** 48 model trials or statistical proof of
generalisation. These cases are public; they must never be reported as hidden
tests. Privacy checks cover literal synthetic sensitive values, not every
possible encoding or exfiltration channel.

Next: create independently held-out tasks, execute candidate code in an approved
isolated runner, connect an authorized provider, and perform budget-matched
repeated trials. See [ADR-0016](../architecture/decisions/0016-frozen-stage2-controls.md).
