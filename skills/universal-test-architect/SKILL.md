# GUIDO Universal Test Architect — v0.1 (proposal)

## Purpose
Design reproducible quality gates for brownfield or greenfield repositories and multi-agent missions, using SPECTRA domain specifications as the source of truth. This skill is a **design and evaluation contract**, not an autonomous execution engine.

## Inputs
- Repository revision, AGENTS.md, test commands and available tools
- SPECTRA layer IDs: rules (03), invariants (04), operation contracts (05), agent/skill/workflow definitions (08–10), acceptance criteria (11), trace (12)
- Approved mission, permissions, environment, budgets and baseline
- Missing requirements must be recorded as gaps; never guessed into acceptance criteria

## Procedure
1. Inspect AGENTS.md and repository-specific instructions; identify owner and execution boundary.
2. Extract requirements and critical invariants; assign stable IDs and risk severity.
3. Build requirement → test → evidence trace links, including negative and boundary cases.
4. Choose deterministic oracles for money, idempotency, state transitions and access control. Use model judges only for subjective outcomes and calibrate them against labelled examples.
5. Plan unit, integration, contract, end-to-end, agent trajectory, tool-permission and adversarial tests. Use isolated fixtures and least-privilege credentials.
6. Execute only with explicitly approved tools and environment; otherwise mark BLOCKED. Preserve stdout, exit codes, artefact hashes, timestamps and revisions.
7. Evaluate each agent handoff, tool call, outcome and stop condition; distinguish outcome quality from trajectory compliance.
8. Produce the seven output artefacts listed below. Do not claim PASS for missing or simulated evidence.
9. Open a reviewable PR only if authorized. Never merge, deploy or expand permissions without approval.

## Output contract
- test-plan.md — scope, risks, commands, environment, oracles
- test-cases.yaml — IDs, requirements, inputs, expected outcomes
- traceability.json — bidirectional requirement/test/evidence references
- execution-results.json — executed cases, status, logs and commit SHA
- agent-evaluation.json — trajectories, handoffs, policy violations, judge version
- evidence-manifest.json — artefact locations, hashes, source revisions
- quality-gate.json — PASS | FAIL | INCONCLUSIVE | BLOCKED, rationale, failing IDs

## Gate policy
PASS requires every approved critical invariant and permission check to pass with recorded evidence, zero open critical defects, and all mandatory cases executed. FAIL if an executed critical check fails. BLOCKED if execution is prohibited or impossible. INCONCLUSIVE if evidence is insufficient or evaluation ambiguous. No automatic threshold relaxation or self-approval.

## Standards mapping (guidance, not certification)
ISO/IEC/IEEE 29119: test design and reporting; ISO/IEC 25010: quality attributes; ISO/IEC 42001 and ISO/IEC 23894: AI governance/risk; NIST AI RMF: risk controls; OWASP LLM Top 10: adversarial security. Tool adapters may use DeepEval, Promptfoo or trace evaluators; these are optional.

## Pilot
See ../../docs/guides/gastroflow-agent-test-pilot.md. Do not run production payments or use real customer data.
