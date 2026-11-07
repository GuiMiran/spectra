# ADR-0022: Keep the GUIDO governance hub in SPECTRA

- Status: Proposed implementation for owner review
- Date: 2026-11-07
- Scope: central documentation, component inventory and metadata observation

The owner requested a central governance and coordination hub, then chose to
retain it within SPECTRA rather than create another repository. This extends
the documented five-repository boundary without approving every earlier ADR
or resolving organizational scoring.

SPECTRA hosts the ecosystem index, agent navigation, component pins, release
policy and reviewed cross-repository coordination. Stack owns engineering
doctrine; Scale owns assessment; Runtime owns bounded execution; Pipeline
provides reference evidence. Human maintainers retain approval authority.

The versioned manifest describes a baseline inventory, NOT a tested compatible
distribution. An observer reads only allowlisted GitHub metadata and version
files pinned to each observed source commit. It never executes component code,
updates baseline pins, assigns maturity, deploys or writes other repositories.

Offline controls run on PRs and main. Daily or manually requested observations
may open a documentation-only PR in SPECTRA. This is a separately reviewed CI
adapter, not authority for model-driven evolution or runtime tools. No automatic
merge is enabled. GitHub's setting permitting Actions to create PRs is required;
failure does not authorize weakening protections or adding a broad PAT.

Baseline changes and agent/governance instructions require owner review.
Compatibility can only be recorded later through a separately designed,
independently evidenced integration assessment. This change supplies no such
assessment. Documentation links from peer repositories do not transfer authority.
