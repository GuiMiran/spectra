# External suite / Runtime evaluation

This is a host API for a bounded evaluation, not an autonomous coding pipeline.
SPECTRA keeps suites and expected answers; the separate Runtime executes source
against one input with explicit host approval. No existing CLI/Mother promotion
behaviour changes. Read [ADR-0017](../architecture/decisions/0017-external-suite-runtime-isolation.md).

## Trusted host contract

`require('.../lib/evaluation')` exports `loadExternalSuite` and
`evaluateExternalSuite` in addition to the existing best-of-n API. There is no
default executor or approver. Configure these only in trusted host code; never
use candidate content as adapter code, approval identity or approved digest.

The loader requires an externally approved SHA-256 of the **raw file bytes**
and a candidate workspace root. The suite file must be regular, not a symlink,
outside that workspace and at most 1 MiB. Its v1 contract contains only
`schemaVersion`, `suiteId`, `suiteVersion`, and 1–32 unique cases with `id`,
JSON `input` and JSON `expected` (each at most 64 KiB). The loaded object is
deep-frozen and branded; a copied/self-reported object cannot be evaluated.

Evaluation configuration requires candidateSource (single-file CommonJS,
64 KiB maximum), digest-pinned image, timeoutMs (100–30000), maxOutputBytes
(1024–65536), `approve(request, requestHash)` and
`execute(request, approval, {candidateSource, input})`. The latter is bound by
the host to Runtime's `executeCandidate` with opt-in enabled. It receives no
expected value or suite path. Approvals must match the request hash and identify
an authenticated host approver with a future expiry at most 24 hours away. This
record format is not itself authentication or a signature.

Only matching receipts with confirmed cleanup and valid output hashes can be
scored. Wrong answers/candidate errors fail; infrastructure/resource/approval
uncertainty stops with a null score. Hash-only reports do not prove custody,
honest adapters, complete functional correctness or self-improvement.
Counters distinguish attempted cases, adapter dispatches and matching completed
receipts; a denied approval is never counted as an execution.

## Verification

```sh
node --test test/external-suite.test.js
npm run verify
# On a disposable Docker runner with a reviewed Runtime checkout and image:
GUIDO_RUNTIME_MODULE=/absolute/runtime/evaluation \
GUIDO_RUNTIME_COMMIT=<reviewed-40-hex-commit> \
GUIDO_EVAL_IMAGE='node@sha256:<approved-64-hex-digest>' \
npm run test:runtime:integration
```

The integration file is outside the default unit-test discovery path. Running
it explicitly without configuration fails rather than silently skipping. The
workflow pins Runtime at `202ded17469940fd17b133c2ff6d60c972d04880` from
[Runtime PR #4](https://github.com/GuiMiran/guido-autonomous-runtime/pull/4).
Review that dependency before merging or updating the pin. The environment
commit value is recorded provenance, not remote attestation; the trusted CI
checkout enforces the actual pin. Its public image tag resolves to a digest per
run and is not a reproducible cross-run benchmark pin.

CI uses public synthetic cases in an externally located file to prove wiring,
not genuine private held-outs. It proves correct-vs-defective discrimination and
approval denial for those cases only. Private corpus custody, repeated model
trials, signed approval identities, full schemas and rejected-record retention
remain separate backlog items. No live provider or production system is used.
