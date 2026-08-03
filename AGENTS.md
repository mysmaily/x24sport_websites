# X24Sport Websites — Shared Agent Guide

## Scope and platform

This repository operates one dynamic Next.js/Payload multi-tenant platform.
All current website, content and deployment work uses this platform. These are
new websites with their own requirements. Work only on the exact requested
outcome; do not derive requirements from another implementation or initiate
unsolicited full-site analysis or visual rebuilding.

Shared runtime:

| Component | Local source | Production |
|---|---|---|
| Public storefront | `cms-frontend/` | `root@10.10.0.58:/root/websites/cms-frontend`, container `cms-frontend`, port `3010` |
| CMS/API/admin | `cms-api/` | `root@10.10.0.28:/opt/sports-cms/cms-api`, container `sports-cms-cms-api-1`, port `3001` |
| Payload database | tenant records and content | PostgreSQL `sports_cms` on `10.10.0.17` |
| Public proxy | per-domain Nginx vhost | `root@10.10.0.56:/etc/nginx/conf.d/<domain>.conf` |
| Public CMS | — | `https://cms.x24sport.vn` |
| Public media | tenant-prefixed R2 objects | `https://static.x24sport.vn/<tenant>/...` |

`PRODUCTION-DEPLOYMENT-RUNBOOK.md` is the only deployment authority.
`PAYLOAD-REST-API-GUIDE.md` is the common content and media API authority.

## Dynamic tenant contract

Tenant identity comes from the Payload `tenants` collection. A tenant becomes
resolvable when it has:

1. a unique lowercase ASCII `slug`;
2. at least one `domains.domain` entry;
3. brand name/headline/subheadline values;
4. Store Settings and published content appropriate for the storefront;
5. DNS/Nginx routing to `10.10.0.58:3010` for each public domain.

`cms-frontend/src/lib/tenant-registry.ts` resolves the request host against
Payload. Current production tenants have a small static fallback only so their
sites remain identifiable during a short CMS outage. The fallback is not the
source of truth and new generic tenants do not require a code entry.

The shared catalog/home/product/category templates work for a new tenant. A
tenant may additionally have a slug-specific visual override under
`cms-frontend/src/app/[tenant]/_<slug>/`; these overrides are intentionally
manual because they encode a distinct design and route contract, not tenant
registration.

Never select a tenant from a browser-supplied query parameter, reuse numeric
relationship IDs between tenants, or omit tenant filters from content queries.

## Current business portfolio

| Domain | Tenant slug | Business role |
|---|---|---|
| `x24sport.vn` | `x24sport` | Master marketplace and X24Sport brand; aggregates the complete multi-sport catalog from the specialist satellite sites when products/media are deliberately shared or cloned. |
| `rynosport.vn` | `rynosport` | Independent RynoSport brand at the same portfolio level as X24Sport; multi-sport teamwear, not a satellite of X24Sport. |
| `mayaobongda.vn` | `mayaobongda` | Specialist satellite for football kits, football shirts and team customization. |
| `mayaocaulong.vn` | `mayaocaulong` | Specialist satellite for badminton apparel and club/team customization. |
| `mayaopickleball.vn` | `mayaopickleball` | Specialist satellite for pickleball apparel and club/team customization. |
| `mayaobongchuyen.vn` | `mayaobongchuyen` | Specialist satellite for volleyball uniforms and team customization. |
| `mayaobongro.vn` | `mayaobongro` | Specialist satellite for basketball uniforms and team customization. |
| `mayaochaybo.vn` | `mayaochaybo` | Specialist satellite for running shirts, clubs, companies and race events. |

X24Sport aggregation is explicit, not automatic cross-tenant leakage. A source
product remains owned by its specialist tenant. Sharing to X24Sport must use the
documented media sharing relationship and an idempotent product clone/sync
workflow. RynoSport content stays independent unless the user explicitly asks
for distribution to or from that brand.

## Domain profiles

Every website has a folder-level profile:

```text
<domain>/AGENTS.md   # domain identity, business rules and operational overrides
<domain>/CLAUDE.md   # contains only @AGENTS.md
```

For a website request, read this root file, then `<domain>/AGENTS.md`.

## Request router: act without rediscovery

### Frontend, layout, route, SEO or component change

1. Work locally in `cms-frontend/`; tenant-specific work belongs under
   `src/app/[tenant]/_<slug>/`, tenant CSS/assets in the paths named by the
   domain profile, and genuinely shared code under `src/app/_components/` or
   `src/lib/`.
2. Run `pnpm typecheck` and `pnpm build` in `cms-frontend/`.
3. Commit only task-scoped changes.
4. Deploy the single shared frontend with the exact rsync/SSH Compose procedure
   in `PRODUCTION-DEPLOYMENT-RUNBOOK.md`.
5. Verify the requested domain plus every sibling affected by shared code.

Do not edit production source directly over SSH. SSH is used for read-only
inspection, canonical deployment, container checks and approved server-side
scripts. Direct server editing creates undocumented drift.

### Product, category, page, post, Store Settings or image change

This is normally a Payload content operation and does not deploy code:

1. Read the target profile for `TENANT_SLUG`, business scope and revalidation.
2. Use the tenant-specific mode-`0600` credential file documented there and the
   workflow in `PAYLOAD-REST-API-GUIDE.md`.
3. Resolve the tenant record by slug at runtime; never copy its numeric ID.
4. Query by tenant plus stable identity before creating or updating.
5. Upload media first through `POST /api/media`, then relate it to the product.
6. Create incomplete records as drafts and publish only after factual review.
7. Verify the API record, R2 URL, public URL, category membership, metadata and
   tenant isolation after the documented cache window.

If a profile says its REST credential is not provisioned, use the Payload admin
at `https://cms.x24sport.vn/admin` for a manual content request. For agentic or
batch work, provision a dedicated `tenant_admin` API user and secret file first;
never borrow another tenant's key or use direct SQL.

### CMS schema, access, hook, admin or storage change

Work in `cms-api/`, read `cms-api/AGENTS.md`, run its type/generation/build gates,
verify isolation across representative tenants, then use the shared CMS section
of the production runbook. Normal content edits never rebuild CMS.

### New tenant/domain

1. Create the Payload tenant record and domain rows.
2. Create tenant Store Settings, a dedicated `tenant_admin` REST account and
   `/root/sports-cms/<slug>-rest-api.env` with mode `0600`.
3. Create `<domain>/AGENTS.md` and `<domain>/CLAUDE.md` from this contract.
4. Add DNS and a version-controlled Nginx vhost routing to `10.10.0.58:3010`.
5. Generic storefront routes require no frontend registry edit. Add a
   slug-specific override only when the tenant needs its own visual/route system.
6. Verify homepage, catalog, product, sitemap, robots, canonical domain, media,
   analytics and tenant isolation.

## Shared content and customer experience rules

- Public copy must help shoppers browse, choose, customize, order or contact.
  Never expose CMS, AI, SEO, cache, staging or developer language.
- Product-detail `h1` is immediately below the breadcrumb: `20px` below the
  desktop breakpoint and `22px` at/above it. Product-card names are `18px`.
- Original and discounted prices stay on one line; discounted price is exactly
  `2px` larger.
- Product galleries use the shared `product-media-gallery.tsx`, a square stage,
  `object-fit: contain` and PhotoSwipe.
- Catalogs show the first product row within the initial viewport at `390x844`
  and `1440x900`. Primary filters are one horizontally scrollable `40px` row;
  secondary options use an overlay dropdown with crawlable links.
- The consultation form renders only when the tenant Store Settings has
  `telegramChatId`. The server resolves that value; the browser never supplies it.
- Every content mutation is tenant-scoped and idempotent. Cross-tenant media is
  shared explicitly through `sharedWithTenants`; do not duplicate or silently
  reassign ownership.

## Safety and verification

- Preserve unrelated user changes and stage only current-task files.
- Do not create rollback copies, dumps, archives, snapshots or cloned runtime
  artifacts. Use Git, dry-runs, health checks and documented rollback commands.
- Do not change DNS, SSL, firewall, credentials or billing unless explicitly in
  scope.
- Do not restart PostgreSQL for application or content work.
- Verify after mutation; an edit or successful API response alone is not
  completion.
- After verified code work, commit and deploy by default unless the user requests
  local-only, review-only or no deployment.

## Result reporting

Report the target domain, business scope, files or CMS records changed, exact
verification evidence, services/cache touched, deployment status and remaining
risk. Never display credentials or secret values.
