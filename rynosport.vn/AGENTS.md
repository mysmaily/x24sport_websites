# rynosport.vn — Shared Frontend Tenant Profile

> Scope: This file contains only data and routing rules specific to
> `rynosport.vn`. Shared workflow is defined in `../AGENTS.md`. The active
> frontend source is `../cms-frontend/`; this folder is documentation only.

> Deployment authority: `../PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the
> `x24sport.vn` frontend deployment procedure because `rynosport.vn` is served by
> the same shared `next-x24sport` container.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `rynosport.vn` |
| Payload tenant slug | `rynosport` |
| Active development platform | Next.js shared frontend + shared Payload CMS |
| Frontend source | `../cms-frontend/` |
| Tenant route root | `../cms-frontend/src/app/[tenant]/` |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress status | None for this tenant |

## Operational authority and routing

When the user mentions `rynosport.vn`, treat the request as tenant-scoped work
inside `../cms-frontend/`, not as a standalone app in this folder.

| Requested work | Local source of truth | Remote runtime / action |
|---|---|---|
| Public UI, routes, SEO templates, catalog rendering | `../cms-frontend/` | Deploy to `root@10.10.0.58:/root/websites/x24sport.vn` |
| Tenant-specific page/layout behavior | `../cms-frontend/src/app/[tenant]/` gated by `params.tenant === "rynosport"` | Rebuild only the shared `next-x24sport` frontend |
| Shared frontend components | `../cms-frontend/src/app/_components/` only when intentionally reused by multiple tenants | Verify both `rynosport.vn` and affected sibling tenants |
| Ryno assets | `../cms-frontend/public/images/rynosport/` | Included in the shared frontend deploy |
| Add or edit a product/category/post/media record | Payload admin or a tenant-scoped API migration | `https://cms.x24sport.vn/admin`; select tenant `rynosport` |
| CMS schema, collection, admin UI, API, storage adapter | `../cms-api/` | Deploy to `root@10.10.0.28:/opt/sports-cms/cms-api` |
| DNS, SSL, and Cloudflare settings | Cloudflare zone for `rynosport.vn` | Do not change without an explicit DNS/CDN request |

## Tenant isolation rules

- Keep Ryno storefront copy, layout, colors, images, and page wrappers separate
  from `x24sport.vn` unless the user explicitly asks to share them.
- Do not render X24Sport-only headers, footers, category templates, or product
  detail wrappers for `rynosport.vn`.
- When reusing product data from `x24sport.vn`, rebrand customer-facing titles,
  descriptions, CTAs, and metadata for Ryno before shipping.
- If a shared component must change, verify the pages for both `rynosport.vn` and
  `x24sport.vn` because both domains run in the same frontend container.

## Local checks

Frontend checks:

```bash
cd ../cms-frontend
pnpm install
pnpm typecheck
pnpm build
```

Recommended public verification for Ryno UI changes:

```bash
curl -fsSI https://rynosport.vn/
curl -fsSI https://rynosport.vn/san-pham/
curl -fsSI https://rynosport.vn/danh-muc/bong-chuyen/
```

