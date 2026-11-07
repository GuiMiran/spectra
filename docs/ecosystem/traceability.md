# Cross-repository traceability

Navigation starts here, but links alone are not behavioral evidence.
Every cross-repository change should provide this review record:

| Field | Required meaning |
| --- | --- |
| Origin | Request or issue URL and responsible maintainer |
| Producer / consumer | Exact repository names and full source commits |
| Decision | Governing ADR and contract/schema revision, or explicit unresolved decision |
| Companion changes | PR URLs in every affected repository, with merge state |
| Acceptance | Named obligations, independent checks and execution receipts |
| Observed result | Demonstrated, failed, not evaluated or invalid run; explicit exclusions |
| Approval | Who accepted what scope; never inferred from a model's statement |
| Recovery | Rollback or no-mutation boundary |

Use commit-pinned links for evidence and mutable main links for navigation.
If another PR must merge first, state that dependency; do not call an open PR
delivered or compatible. A diagnostic report is not an execution authorization.

## Component navigation anchors

- [Stack standards](https://github.com/GuiMiran/guido-sdd-engineering-stack)
- [Scale diagnostic scope](https://github.com/GuiMiran/guido-sdd-migration-effort-scale/blob/main/SCALE.md)
- [SPECTRA contracts](COMPONENT-CONTRACTS.md)
- [Runtime planning boundary](https://github.com/GuiMiran/guido-autonomous-runtime/blob/main/autonomy/README.md)
- [Pipeline evidence handoff](https://github.com/GuiMiran/guido-agentic-pipeline/blob/main/docs/evidence-handoff.md)

The hub [manifest](components.json) contains baseline commit identities. The
[observations](observations.md) link each component's current metadata to exact
commits but do not certify its CI or deployment.
