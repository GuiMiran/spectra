# Evidence and read-only planning

This guide is the safe first step toward an agentic SPECTRA workflow. It does
not invoke a model, alter source code, run a shell command, or grant MCP,
network, credential, pull-request, or deployment access.

## 1. Record independently executed evidence

After a focused test command has been run by a trusted developer or CI runner,
write its result to `.spectra/evidence.json`. Start from
[`templates/evidence.json`](../../templates/evidence.json).

```json
{
  "schemaVersion": 1,
  "run": { "command": "npm run focused-check" },
  "results": [
    { "id": "AC-001", "status": "passed", "test": "Payment is rejected" }
  ]
}
```

Validate the complete layer-11 acceptance scope:

```bash
spectra verify
```

Or validate the explicitly reviewed scope of one task:

```bash
spectra verify --require AC-001 --require AC-002
```

`verify` fails on a missing, malformed, failed, skipped, or absent record. It
does not execute the command recorded in JSON; that command is provenance, not
an instruction to trust or execute.

## 2. Prepare a bounded planning request

Copy these templates into a project:

- [`templates/agent-task.json`](../../templates/agent-task.json)
- [`templates/agent-context.json`](../../templates/agent-context.json)

The task declares the sole files and SPECTRA IDs a planner may inspect. The
context contains only reviewed excerpts from those items. Do not paste secrets,
environment files, production exports, untrusted instructions, or an entire
repository into the context.

Run the bundled deterministic contract check:

```bash
spectra agent plan \
  --task .spectra/tasks/evidence-audit.json \
  --context .spectra/contexts/evidence-audit.json \
  --provider dry-run \
  --output .spectra/agent-runs/evidence-audit.json
```

The output contains content hashes, the admitted context manifest, a plan, and
a run record. It is a planning artifact, not evidence that a model reasoned
about the problem. `dry-run` does not call AI; `null` explicitly reports that
no provider exists.

## 3. Human review gate

Before a future builder exists, a human must check that:

1. The task's success criteria and allowed SPECTRA IDs express the intended
   outcome.
2. The context contains no secret or untrusted instruction that can redirect
   the objective.
3. The proposed verification is independent of the future builder.
4. The change class is low risk. Payments, taxes, authentication, migrations,
   permissions, personal data, and deployment remain human-approved.

The next architecture phase is a reviewed model adapter followed by a
disposable worktree builder. It must not be enabled by changing
`evolution.config.json`.
