# mayaocaulong.vn — Shared Frontend Tenant Profile

> Scope: This file contains only routing notes and tenant operations for
> `mayaocaulong.vn`. The active frontend source is `cms-frontend/`; do not treat
> this tenant as a standalone app.

> Deployment authority: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the
> `cms-frontend` deployment procedure because `mayaocaulong.vn` is served by the
> same `cms-frontend` container.

## Active Tenant Identity

| Field | Value |
|---|---|
| Domain | `mayaocaulong.vn` |
| Payload tenant slug | `mayaocaulong` |
| Active development platform | Next.js shared frontend + shared Payload CMS |
| Frontend source | `cms-frontend/` |
| Tenant route root | `cms-frontend/src/app/[tenant]/` |
| Tenant-specific wrapper | `cms-frontend/src/app/[tenant]/_mayaocaulong/` |
| Tenant styles | `cms-frontend/src/app/mayaocaulong.css` |
| Tenant assets | `cms-frontend/public/images/mayaocaulong/` |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress status | Legacy/restore source only; never use for active development or content updates |

## Operational Authority And Routing

When the user mentions `mayaocaulong.vn`, treat the request as tenant-scoped work
inside `cms-frontend/`, not as a standalone app.

| Requested work | Local source of truth | Remote runtime / action |
|---|---|---|
| Public UI, routes, SEO templates, catalog rendering | `cms-frontend/` | Deploy to `root@10.10.0.58:/root/websites/cms-frontend` |
| Tenant-specific page/layout behavior | `cms-frontend/src/app/[tenant]/` gated by `params.tenant === "mayaocaulong"` | Rebuild only the shared `cms-frontend` frontend |
| Tenant-specific imported app code | `cms-frontend/src/app/[tenant]/_mayaocaulong/` | Keep scoped to `mayaocaulong` routes |
| Shared frontend components | `cms-frontend/src/app/_components/` only when intentionally reused by multiple tenants | Verify every affected shared tenant |
| Add or edit a product/category/post/media record | Payload admin or a tenant-scoped API migration | `https://cms.x24sport.vn/admin`; select tenant `mayaocaulong` |
| CMS schema, collection, admin UI, API, storage adapter | `cms-api/` | Deploy to `root@10.10.0.28:/opt/sports-cms/cms-api` |
| DNS, SSL, and Cloudflare settings | Cloudflare zone for `mayaocaulong.vn` | Do not change without an explicit DNS/CDN request |

## Production Runtime

Verified on 30/07/2026:

| Field | Value |
|---|---|
| Public site | `https://mayaocaulong.vn` |
| Application host | `root@10.10.0.58` |
| Application path | `/root/websites/cms-frontend` |
| Container | `cms-frontend` |
| Container/published port | `3010` / `10.10.0.58:3010` |
| Public upstream | `http://10.10.0.58:3010` |
| Proxy host | `root@10.10.0.56` |
| Proxy config | `/etc/nginx/conf.d/mayaocaulong.vn.conf` |

The old standalone source path `/opt/sports-cms/mayaocaulong.vn` may still exist
on `10.10.0.28` for historical reconciliation, but the standalone
`sports-cms-mayaocaulong-1` container is not part of the active public runtime.
Do not restart or redeploy it unless an explicit rollback/recovery task requires
that path.

## Local Development

```bash
cd cms-frontend
pnpm install
pnpm typecheck
pnpm build
```

Local routes are resolved through `src/proxy.ts` and the `[tenant]` route
segment. Keep `mayaocaulong.vn` and `www.mayaocaulong.vn` mapped to the
`mayaocaulong` slug, and keep tenant data requests filtered with:

```text
where[tenant.slug][equals]=mayaocaulong
```

## Content Operations

Use the shared CMS admin:

1. Open `https://cms.x24sport.vn/admin/login`.
2. Select or filter tenant `mayaocaulong`.
3. Add media first if the product/page needs images.
4. Add or update products, pages, posts, and store settings.
5. Check public page after save.

Do not hard-code normal product/blog content in the frontend unless it is a
temporary fallback. Real catalog and article data belongs in Payload.

## Tenant Isolation Rules

- Keep badminton storefront copy, layout, images, and route wrappers scoped to
  `mayaocaulong` unless the user explicitly asks to share them.
- Do not reuse sibling tenant credentials, Payload IDs, cache rules, or
  deployment paths.
- If a shared component changes, verify `x24sport.vn`, `rynosport.vn`, and
  `mayaocaulong.vn` because all three run in the same frontend container.
- Keep legacy WordPress and standalone frontend references in notes or ledgers
  only; do not use them for active public UI work.

## Verification

For frontend changes, check the affected page plus representative shared-tenant
routes:

```bash
curl -fsSI https://mayaocaulong.vn/
curl -fsSI https://mayaocaulong.vn/san-pham/
curl -fsSI https://x24sport.vn/
curl -fsSI https://rynosport.vn/
```

Report changed files, confirmation that no backup was created, commands run, and
verification results.
