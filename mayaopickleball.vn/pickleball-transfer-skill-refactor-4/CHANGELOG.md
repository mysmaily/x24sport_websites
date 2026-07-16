# Changelog

## v0.4-safe - Compact basketball-style safety update

- Reworked the skill as a single agent-facing runbook, using the working basketball pipeline style.
- Made `SKILL.md` the source of truth for destination constants.
- Kept update-only behavior: every job must resolve to an existing `mayaopickleball.vn` product ID.
- Removed user-facing need to pass logo/contact/color-dot options.
- Hard-coded required final contact overlay: `mayaopickleball.vn | Hotline/Zalo: 0989.353.247`.
- Required official logo from `image-references/logo.svg`, with `image-references/logo.png` fallback only when SVG render fails.
- Forbid plain text `X24` badge fallback.
- Added fixed asset preflight and simplified postprocess contract.
- Kept runtime secret alias support for older `wordpress-api` env files.
- Added local model-reference pools under `model-references/female/` and `model-references/male/`.
- Added `scripts/select_model_reference.py` for default random/reproducible face selection.
- Updated prompt construction and manifest guidance to record selected face references.
