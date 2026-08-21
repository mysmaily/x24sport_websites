# Master Catalog Distribution

## Scope

`x24sport` and `pndsport` are master catalogs. Every product created or updated
for another tenant is a satellite source and must be distributed to both masters
within the same publishing task, unless the user explicitly approves a deferred
or excluded target. This rule supersedes older portfolio descriptions that treat
an individual source as an independent catalog for distribution purposes.

Distribution is one-way: satellite product to master product. Do not distribute
a master product, or a product whose `sourceSystem` is already
`payload-tenant-clone`, to another master. This prevents loops.

## Required Ledger Contract

The CMS distribution layer must maintain one `catalog-distributions` record per
unique tuple:

```text
sourceTenant + sourceProduct + targetTenant
```

The record needs source and target product relationships, a status
(`ready`, `draft_created`, `published`, `needs_review`, `blocked`, `archived`),
last synchronization time, source fact fingerprint, target-copy fingerprint,
copy mode (`auto` or `manual_locked`), and an error/review note. The tuple must
be database-unique.

Target products retain `sourceSystem=payload-tenant-clone` and
`sourceId=<source-tenant-slug>:<source-product-id>`. The ledger is authoritative
for queue/status management; `sourceId` provides target-product idempotency.

## Copy Generation Contract

Build an immutable factual package from the source: SKU, sport, product type,
prices, stock, attributes, badges, gallery media and order, confirmed material,
colors, customisation options, and source category. AI may generate only target
copy fields: name, short description, long description, SEO title, meta
description, and media alt/caption copy.

Use target-brand instructions for each master. The output must not contain
unverified claims, source-domain URLs, AI/process language, or altered factual
fields. Reject exact duplicates and queue high-similarity copy for review. A
manual-locked target must retain its approved copy; save AI output as a proposal
instead of overwriting it.

## Safe State Transitions

1. Upsert source product using its stable identity.
2. Upsert ledger record for each master target.
3. Check source ownership, target category mapping, conflicts and every media
   `sharedWithTenants` permission.
4. Share the existing media records through a super-admin distribution worker.
5. Generate and validate target copy, then create/update the target as a draft.
6. Publish only with explicit authorization or an established target policy.

Any conflict moves the existing ledger record to `needs_review` or `blocked`.
Never create another target product to bypass it. A retry updates the same
ledger and target records.

## Current Implementation Boundary

The routine tenant REST publisher cannot implement this distribution by itself:
only a privileged worker can update `media.sharedWithTenants`, and the current
CMS has no shared ledger collection yet. Until that CMS workflow is deployed,
this skill must treat required master distribution as unavailable rather than
quietly creating duplicate media or untracked clones.
