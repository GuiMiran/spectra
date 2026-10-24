# Evaluator and signal-path assurance

Use these checks after an independent runner has produced real observations.
The included `evals/*-pass.json` files demonstrate the schema; they contain
illustrative values, not measured production evidence.

## Oracle integrity

Run `npm run assurance:assess -- oracle record.json`. The host should snapshot
the database or API state before and after each evaluation (`stateHash` exports
a canonical SHA-256 hash helper for JSON state), restore a clean state, and
repeat the case with a different run ID. Capture both PASS and FAIL known-answer
controls from a trusted source. Capture score pairs on the same scale [0,1],
where higher means better: `invariant` for reordering independent evidence
or adding irrelevant text, `no-improvement` for removing supporting evidence,
and `no-decrease` for adding valid supporting evidence. Define these relations
per scorer; they are not universal properties of every task.

The assessor catches state mutation, wrong answers, drift, and broken score
relations. It cannot prove that supplied hashes, expected answers, or scores
are genuine. Keep control expectations independent of the agent under test.

## End-to-end signal canary

Inject a safe, synthetic violation under a unique `traceId` and `evidenceId`.
Record the detector's `violation: true`, correlation's `matched: true`, a
policy `decision` of `block` or `alert`, the matching action with
`executed: true` and a unique `id`, then an audit event with `recorded: true`
and the matching `actionId`. Run
`npm run assurance:assess -- signal record.json`.

This contract checks the full reported path, not just the detector dashboard.
Do not assert a real integration is working until a trusted observer collects
those five events and an independent test confirms the actual block or alert.

## Azure DevOps Services task inventory

Run `npm run audit:azure-tasks -- <pipeline-YAML-directory>` to scan the
selected retired task versions relevant to C#/.NET, tests and monitoring. A
finding returns exit code 1 and includes file, line and suggested replacement.
This is a read-only YAML check; comments and script text are ignored. Review
the complete [Microsoft retirement list](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/task-retirement?view=azure-devops),
other repositories and classic pipelines separately. This date schedule is for
Azure DevOps Services, not Server. Verify task inputs, credentials, exit codes,
TRX/JUnit/Allure artifacts and coverage in a non-production pipeline before
switching versions.
