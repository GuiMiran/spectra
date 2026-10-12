# Mother prompt evolution

The prompt evolution runner keeps the Mother's **instructions** versioned
under `.spectra/prompt-evolution/`. Governance, policy, the evaluation suite
and model invocation belong to an external trusted host. This is separate
from `spectra evolve`, which versions declarative specialist definitions.

## Host integration

```js
const fs = require('node:fs');
const { PromptEvolutionRunner, DEFAULT_PROMPT_POLICY } =
  require('@guimiran/spectra/lib/evolution');

// The host owns these inputs. Do not send expected answers to a candidate.
const runner = new PromptEvolutionRunner(projectRoot, {
  governance: fs.readFileSync(governanceFile, 'utf8'),
  policy: { ...DEFAULT_PROMPT_POLICY, autoPromote: true },
  invoke: async ({ governance, instructions, input, config }) => {
    // Approved adapter: governance in a higher-priority context;
    // instructions and input in their respective bounded contexts.
    // Return a parsed JSON object. Reject unknown tools or effects.
    return approvedModelAdapter.invoke({ governance, instructions, input, config });
  },
});

// `evaluatorOwnedSuite` is loaded by the trusted host from protected storage.
// Once per project: runner.initialize(currentMotherInstructions);
const before = runner.active(); // Pinned prompt for this execution.
const result = await runner.run({
  candidate: proposedInstructions,
  suite: evaluatorOwnedSuite,
  invocationConfig: {
    model: pinnedModelId,
    toolsHash: approvedToolsetSha256,
    tokenBudget: 2000,
  },
});
// The host loads runner.active() at the next execution only.
```

The host should set `autoPromote: true` only in a previously approved,
versioned policy. Its default is `false`, leaving successful candidates as
proposals. The candidate must not be allowed to supply policy, governance,
expected answers, the model adapter or its own evaluation score.

SPECTRA now includes a host-side runner entry point at
`scripts/run-prompt-evolution.js` and an `AuthorizedPromptAdapter` helper. The
adapter POSTs only `governance`, `instructions`, `input`, `caseId`, and pinned
invocation config to an evaluator-owned endpoint; expected answers stay in the
trusted host. The scheduled workflow reads the candidate prompt and case suite
from protected GitHub secrets (or an explicitly selected prompt file), and does
not run when they are absent. It stores the complete audited registry on the
serialized `prompt-evolution-registry` branch so later runs load promotions.
The adapter URL is represented in run metadata only by its SHA-256 digest.
The scheduled workflow
`.github/workflows/mother-prompt-evaluation.yml` runs the same comparison on a
recurring trigger and promotes only the version loaded by the next execution.

## Suite contract

The suite is `{schemaVersion: 1, cases: [...]}`. Each case has a unique
`id`, `tier` (`known` or `heldout`), `critical` boolean, `input`
string, and nonempty `expected` object with scalar fields. Include both
tiers. Store heldout expectations under evaluator ownership and exclude them
from candidate context, generated PRs and logs. The runner logs only case
IDs, pass/fail and response digests.

Both prompts receive the same `model`, `toolsHash`, `tokenBudget`, sampling
parameters, and cost budget for every case. The runner records response hashes,
per-case pass/fail, telemetry totals, regressions, and an audited decision
reason. The trusted adapter may also return token, latency, and cost telemetry
as long as it does not expose heldout expectations.

## Persistence and checks

```text
.spectra/prompt-evolution/
├── state.json
├── audit.jsonl
└── versions/v1.txt, v2.txt, ...
```

`spectra prompt-status --json` reads the active version and verifies the
audit chain, lifecycle pointer and version hashes. A rejected or proposed
candidate cannot become active in the same run. A changed policy or
governance digest fails before evaluation. A trusted host can invoke
`runner.rollback(previousVersion, reason)` after a later regression; the
rollback itself is recorded in the same audit chain.

The runner doesn't train a model, edit its weights, deploy software or
execute a specialist's plan. See [ADR-0009](decisions/0009-controlled-mother-prompt-evolution.md)
for the trust boundary.

## Evaluator-owned pilot configuration

The repository includes the trusted governance and promotion policy at
`evals/prompt-evolution/game-04-pilot/`. Case inputs, expected outputs, and
their manifest are not committed. Configure `SPECTRA_PROMPT_SUITE_JSON` as a
protected secret containing a manifest with `schemaVersion`, `suiteId`,
`suiteVersion`, and at least one known and one heldout case. Each case includes
`id`, `tier`, `critical`, `input`, `expected`, `inputSha256`, and
`expectedSha256`; hashes are checked before any model invocation. Keep the
complete specification-generation cases and their artifact-specific expected
fields in that protected data, rather than using a binary release decision.
The candidate prompt is supplied through the protected
`SPECTRA_PROMPT_CANDIDATE` secret or an explicitly selected workflow-dispatch
file. Configure `SPECTRA_PROMPT_ADAPTER_URL` and its optional token separately.

The registry branch is writable only by the scheduled/manual workflow token;
workflow concurrency prevents overlapping read/modify/write cycles. Protect
that branch with repository access controls. Artifacts contain case hashes and
scores, never case inputs or expected values.
