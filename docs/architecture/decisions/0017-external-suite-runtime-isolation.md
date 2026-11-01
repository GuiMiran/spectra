# ADR-0017 — External suites and the separate Runtime execution boundary

- Status: Proposed; owner review required
- Date: 2026-11-02
- Owners: SPECTRA and GUIDO Runtime maintainers

## Decision

Add a separate host-only evaluator API, not a mutation to Mother evolution or
automatic promotion. SPECTRA loads a bounded JSON suite outside the candidate
workspace, verifies an externally approved byte digest, validates and freezes
its cases, and retains expected answers exclusively in the trusted evaluator.
Location and hashes alone do not authenticate a custodian or make public cases
private. The trusted host must protect the suite and approval source.

For each case, a `CandidateExecutionRequest` binds candidate/input hashes, an
approved immutable image and limits. This is an evaluation-only sub-contract,
not delivery authority or the general AgentExecutionPlan/worktree runtime in
ADR-0005. The host must approve the exact request hash with identity and expiry;
SPECTRA validates that record before invoking a separately supplied Runtime
adapter. Plain records are not cryptographic identity signatures.

Only Runtime owns Docker/process authority. It receives source and one input,
never the suite, expected output or suite path. SPECTRA does not import Docker,
spawn a candidate, pull an image, call a provider or execute by default. Its API
requires both host callbacks; evolution definitions cannot supply either.

Receipts must bind the request and image and confirm cleanup. COMPLETED outputs
must match their digest before comparison to the expected JSON value. Candidate
errors fail; denied, timed-out, resource-limited, malformed or infrastructure
receipts stop evaluation as UNRESOLVED with no score. Reports retain hashes,
case outcomes and scope, not inputs, expected values, raw outputs or exceptions.
There is no promotion or claim of improvement from a single passing report.

## Evidence and limitations

Unit tests cover custody boundaries, contract validation, approval denial,
receipt tampering and uncertainty. A separate opt-in integration workflow pins
the Runtime commit and runs public synthetic correct, defective and throwing
candidates in real Docker, with no secrets. The image is resolved to a digest
for each run: this is not a fixed cross-run benchmark environment. Both reports
and the pinned Runtime source require human review.

No private held-out corpus, statistical model comparison, signed/remote
attestation, general worktree runtime, MCP, source mutation, autonomous merge or
deployment is enabled. Docker shares the host kernel; use dedicated disposable
secret-free runners and do not infer containment against kernel exploits.

See [Runtime evaluation module](https://github.com/GuiMiran/guido-autonomous-runtime/pull/4)
and [integration guide](../../guides/external-runtime-evaluation.md).
