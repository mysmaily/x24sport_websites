# Pickleball Transfer Skill v0.4-safe

Compact basketball-style update-only skill for converting existing `mayaopickleball.vn` products from running-shirt legacy content to pickleball catalog products.

## What changed

This package intentionally moves the most important constants back into `SKILL.md`, similar to the working basketball pipeline:

- update existing product only;
- no product creation mode;
- user only provides a product URL for demo;
- official logo/contact/color dots are fixed in the skill, not passed every run;
- approved generated model faces can be stored in `model-references/` and selected randomly by default;
- missing logo/contact/color overlays are blocking QA failures;
- one compact source-of-truth runbook for agents.

## User-facing usage

```text
@pickleball-transfer https://mayaopickleball.vn/san-pham/example/
```

Production:

```text
@pickleball-transfer scan all running products
```

## Preflight

Put official logo assets here:

```text
image-references/logo.svg
image-references/logo.png
```

Then run:

```bash
python scripts/check_fixed_assets.py
```

Load runtime secrets only from `.runtime/wordpress-api.env` and never commit them.
