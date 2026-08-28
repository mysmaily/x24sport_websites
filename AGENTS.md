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
| Public storefront | `cms-frontend/` | `root@10.10.0.53:/root/websites/cms-frontend`, blue/green containers on ports `3010` and `3011` |
| CMS/API/admin | `cms-api/` | `root@10.10.0.53:/opt/sports-cms/cms-api`, container `sports-cms-cms-api-1`, port `3001` |
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
5. DNS/Nginx routing through the shared `cms_frontend_active` upstream for each public domain.
6. product-detail routes that mount the shared `ProductViewTracker` with the
   request-resolved tenant slug and that tenant's own published Payload product
   ID; never hard-code another tenant slug or use a sibling product ID.

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
| `mayaodongphuc.com.vn` | `mayaodongphuc` | Direct uniform-manufacturing workshop: turns approved briefs and specifications into made-to-order uniforms, with production, QC and delivery as the customer promise. |
| `dongphucx24.vn` | `dongphucx24` | Market-facing uniform brand: helps organizations discover samples and solutions by use case, then prepares a quote-ready request for the workshop. |

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

### Whole-tenant creation, completion or launch

Use `$create-shop-tenant` as the exclusive orchestrating skill when the
requested outcome is a new tenant/domain or completion of an entire tenant from
design through content and launch validation. Do not additionally invoke
`$update-shop-tenant` for that same outcome. The creation skill bundles and must
use the local specialist passes `$content-strategy`, `$site-architecture`,
`$programmatic-seo`, and `$web-design-guidelines`.

Use `$update-shop-tenant` only for bounded page, component, route, architecture,
SEO, accessibility, performance, conversion, CMS, content-record, or production-
readiness work that does not require the whole-tenant gated workflow.

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

### Frontend skill routing and visual quality gate

Do not stack design skills in the hope that their advice will average out.
For a customer-facing UI change, use the smallest applicable set in this order:

1. **Build:** use `$update-shop-tenant` as the workflow authority. Use
   `frontend-design` only when the request needs a genuinely new visual
   composition; preserve the tenant profile and the compact commerce rules
   below. Do not use it to justify experimental layouts, decorative overlap,
   oversized type, or excess whitespace in shopping UI.
2. **Implement:** use the existing design tokens and shared components before
   introducing colours, spacing scales, type scales, breakpoints, or another
   component system. `vercel-react-best-practices` is relevant only to a
   React/Next performance or refactor concern, not as a visual-design gate.
3. **Audit:** after material customer-facing UI work, run
   `web-design-guidelines` against the changed UI files and fix every relevant
   finding. Its audit does not replace visual inspection.
4. **Front-End Checklist:** run `frontend-checklist-global` for material
   customer-facing frontend changes and tenant launch/readiness work. Review
   the changed code first, then the rendered local or public URL when available.
   Prioritize evidence-backed Critical and High findings in the relevant HTML,
   CSS, JavaScript, performance, accessibility, SEO, security, images, testing,
   privacy and internationalization categories. Fix every applicable Critical
   and High finding before handoff; either fix applicable Medium findings that
   are within scope or report them explicitly as remaining risk. If the skill's
   MCP tools are unavailable, use its installed guidance plus the official rule
   pages and state that a full MCP corpus audit was not run; never claim a clean
   full audit from memory alone.
5. **Render and inspect:** use `browser:control-in-app-browser` (or an
   equivalent local browser surface) to capture fresh screenshots and exercise
   the changed flow before handoff. Test at 390x844 and 1440x900 at minimum;
   also test every breakpoint introduced or materially changed by the task.

The Front-End Checklist is a quality gate, not a redesign brief. Apply only
rules supported by the changed code or rendered page. Do not introduce PWA,
service-worker, dark-mode, RTL, print, animation or other optional features
unless the tenant requirements call for them. Next.js metadata, image, font,
script and bundling APIs count as valid implementations; do not require literal
HTML tags or duplicate framework behavior.

For shared frontend changes, the checklist pass must cover the requested tenant,
`x24sport.vn`, one tenant using the generic storefront and one tenant using a
slug-specific override when those surfaces are affected. In addition to the
upstream checklist, always verify the platform-specific invariants: tenant-safe
content queries, the request-resolved canonical host, tenant-specific robots and
sitemap output, no sibling analytics or branding leakage, compact scan-first
commerce layout, the first product row within the required viewports, and exactly
one tenant-owned `ProductViewTracker` on each product detail renderer.

Do not use `design-taste-frontend`, `image-to-code`, `gpt-taste`, or multiple
overlapping frontend-design skills for routine storefront work. Their
landing-page/experimental defaults can conflict with this platform's compact,
scan-first commerce contract. Use one only when the user explicitly requests
that type of campaign or redesign, and this repository's accessibility,
responsive, and commerce rules still take priority.

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
4. Add DNS and a version-controlled Nginx vhost routing to the shared `cms_frontend_active` upstream.
5. Generic storefront routes require no frontend registry edit. Add a
   slug-specific override only when the tenant needs its own visual/route system.
6. Mount the shared `ProductViewTracker` exactly once on every product-detail
   renderer. A static or custom catalog must still have tenant-owned published
   Payload product records resolved by stable slug/SKU so `viewCount` can be
   updated; a client-only/static product identifier is not sufficient.
7. Verify a representative product view in production: after the tracker delay,
   the analytics endpoint accepts the tenant origin, increments `viewCount`
   once, and does not increment again for the same product/session.
8. Verify homepage, catalog, product, sitemap, robots, canonical domain, media,
   analytics and tenant isolation.

## Shared content and customer experience rules

- Public copy must help shoppers browse, choose, customize, order or contact.
  Never expose CMS, AI, SEO, cache, staging or developer language.
- Default frontend taste is compact, scan-first and commerce-first. Avoid
  oversized typography, excessive whitespace and hero-like spacing for ordinary
  content, product titles, category headings, forms, filters and operational UI.
  Large display text is appropriate only for deliberate brand moments such as
  banners, slogans or campaign heroes, and must not force routine shopping
  content far below the initial viewport.
- Product-detail `h1` is immediately below the breadcrumb: `20px` below the
  desktop breakpoint and `22px` at/above it. Product-card names are `18px`.
- Product and category titles should read as normal shopping UI, not marketing
  hero typography. Keep product-detail headings responsive and restrained; never
  inflate product names into very large display sizes such as `80px`-`100px`.
- Original and discounted prices stay on one line; discounted price is exactly
  `2px` larger.
- Product galleries use the shared `product-media-gallery.tsx`, a square stage,
  `object-fit: contain` and PhotoSwipe.
- Every product-detail renderer mounts the shared `product-view-tracker.tsx`
  exactly once with the current tenant slug and a published product ID owned by
  that tenant. View counting is a baseline storefront requirement independent
  of optional GA/advertising configuration.
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
- After verified code work, commit and push by default without asking, then
  deploy by default unless the user requests local-only, review-only, no push or
  no deployment.

## Result reporting

Report the target domain, business scope, files or CMS records changed, exact
verification evidence, services/cache touched, deployment status and remaining
risk. Never display credentials or secret values.
