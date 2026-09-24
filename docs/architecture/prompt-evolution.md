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

## Suite contract

The suite is `{schemaVersion: 1, cases: [...]}`. Each case has a unique
`id`, `tier` (`known` or `heldout`), `critical` boolean, `input`
string, and nonempty `expected` object with scalar fields. Include both
tiers. Store heldout expectations under evaluator ownership and exclude them
from candidate context, generated PRs and logs. The runner logs only case
IDs, pass/fail and response digests.

Both prompts receive the same `model`, `toolsHash` and `tokenBudget` for
every case. The host also needs to pin sampling parameters and any other
provider controls. The runner currently compares deterministic structured
fields; repeated samples and confidence intervals for stochastic models
must be supplied by a future trusted adapter before using noisy results to
promote a prompt.

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
