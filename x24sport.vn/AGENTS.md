# x24sport.vn — Managed Website Profile

> Scope: This file contains only data and runbooks specific to `x24sport.vn`.
> Shared routing is defined in `../AGENTS.md`. Load the optimization guide only
> when the current request matches a guide-loading trigger.

> Deployment authority: `../PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Any deployment
> commands later in this profile are historical context and must not be executed.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `x24sport.vn` |
| Payload tenant slug | `x24sport` |
| Active development platform | Next.js frontend + shared Payload CMS |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress status | Legacy/restore source only; never use for active development or content updates |

The generated registry block below describes the old WordPress installation.
Keep it for restore, rollback, source reconciliation, and cutover safety only.
All current development and content operations must target tenant `x24sport`.

<!-- WEBSITE_REGISTRY_START -->
## Central website registry

Generated from the latest `website_configs` record. From this website folder,
run `ruby ../scripts/website_registry.rb sync domain=x24sport.vn` to refresh only this website block. Local notes outside
the markers are preserved.

| Field | Value |
|-------|-------|
| Website registry ID | 27 |
| Configuration registry ID | 145 |
| Configuration status | pending |
| Display name | x24sport-vn |
| Brand name | Not configured |
| WordPress | Yes |
| CDN enabled | Yes |
| N8N capable | Yes |
| Nginx cache status | Not configured |
| Cloudflare cache status | Not configured |
| Application port | 8000 |
| Root directory | /root/websites |
| WordPress content directory | /root/websites/sites/x24sport.vn/wp-content |
| Source directory | /root/websites/sites/x24sport.vn |
| Root folder | Not configured |
| Source folder | Not configured |
| WordPress content folder | Not configured |
| Website host registry ID | 17 |
| Website host private IP | 10.10.0.25 |
| Website host public IP | Not configured |
| Website host setup complete | Not configured |
| Proxy registry ID | 14 |
| Proxy private IP | 10.10.0.56 |
| Proxy public IP | 103.147.35.95 |
| Database host registry ID | 3 |
| Database endpoint | Not configured |
| Database host private IP | 10.10.0.52 |
| Database host public IP | Not configured |
| Database host type | local |
| Database container | ukw8w004c0s88gosw88ggswk |
| Cloudflare account registry ID | 4 |
| Cloudflare account ID | 31f48e75fd61f2011365efe121e99942 |

### Credential availability

| Credential | Stored in registry |
|------------|--------------------|
| Website admin credentials | Yes |
| Website database password | Yes |
| Database root password | Yes |
| Cloudflare API token | Yes |
| Cloudflare global API key | Yes |
| Cloudflare R2 credentials | Yes |

Credentials are intentionally excluded from documentation. Retrieve a
Cloudflare API token only when an explicit task requires it:

```bash
ruby ../scripts/website_registry.rb cloudflare-token x24sport.vn
```

Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
<!-- WEBSITE_REGISTRY_END -->

## Operational authority and routing

This section is the authoritative runbook for the new Next.js/Payload tenant.
The registry block above describes the legacy WordPress website and must not be
used to guess the new stack's application, CMS, or database host.

| Requested work | Local source of truth | Remote runtime / action |
|---|---|---|
| Public UI, routes, SEO templates, catalog rendering | `../cms-frontend/` | Deploy to `root@10.10.0.58:/root/websites/x24sport.vn` |
| Add or edit a product/category/post/media record | Payload admin or a tenant-scoped API migration | `https://cms.x24sport.vn/admin`; select tenant `x24sport` |
| CMS schema, collection, admin UI, API, storage adapter | `cms-api/` | Deploy to `root@10.10.0.28:/opt/sports-cms/cms-api` |
| Payload data inspection or controlled DB migration | Do not use direct SQL for ordinary content editing | PostgreSQL `sports_cms` on `root@10.10.0.17` |
| Public reverse proxy | `../cms-frontend/deploy/x24sport.vn.conf` | `root@10.10.0.56:/etc/nginx/conf.d/x24sport.vn.conf` |
| DNS, zone cache, or Cloudflare settings | Central registry credential command below | Cloudflare account from the registry block; never store the token in this file |
| Legacy WordPress reconciliation only | Read-only source unless the user explicitly requests a WordPress change | `root@10.10.0.25:/root/websites/sites/x24sport.vn` |

Private hosts are reachable while the user's VPN is active. Use the documented
private IP directly. Do not substitute the WordPress host, database, credentials,
or paths for the Next.js/Payload stack. The Payload database host `10.10.0.17`
is distinct from the legacy WordPress database entry in the generated registry
block.

### Default decision rules

- A normal product, category, post, or media change is a **CMS content change**.
  Use Payload admin/API for tenant `x24sport`; it does not require a CMS or
  frontend deployment.
- A display/layout/routing/metadata change is a **frontend code change**. Work in
  `../cms-frontend/`, build locally, then deploy only the `next-x24sport` service.
- A collection field, access rule, hook, admin component, API behavior, or media
  storage change is a **shared CMS code change**. Work in `cms-api/`, verify
  tenant isolation, then rebuild only the shared CMS container using the
  canonical production runbook.
- Direct SQL is reserved for controlled repair/migration work. It is not the
  normal way to create or edit products and does not authorize a backup.
- Do not update the legacy WordPress catalog in parallel unless the request is
  explicitly a source delta or rollback operation.

## Local source and development

| Component | Local path | Runtime |
|---|---|---|
| Shared CMS frontend | `cms-frontend/` | Next.js 16, React 19, TypeScript, pnpm |
| Shared CMS | `cms-api/` | Payload CMS 3 + Next.js, PostgreSQL |
| Frontend production compose | `cms-frontend/compose.production.yml` | Published port `3010` |
| Frontend proxy source | `cms-frontend/deploy/x24sport.vn.conf` | Nginx |

Frontend checks:

```bash
cd ../cms-frontend
pnpm install
pnpm typecheck
pnpm build
```

CMS checks for code/schema changes:

```bash
cd cms-api
pnpm install
pnpm exec tsc --noEmit
pnpm payload generate:types
pnpm payload generate:importmap
pnpm run build
```

## Next.js production deployment

| Field | Value |
|-------|-------|
| Public URL | `https://x24sport.vn` |
| Application host | `root@10.10.0.58` |
| Application path | `/root/websites/x24sport.vn` |
| Compose file | `compose.production.yml` |
| Compose service | `web` |
| Container | `next-x24sport` |
| Container/published port | `3010` / `10.10.0.58:3010` |
| Tenant environment | `TENANT_SLUG=x24sport` |
| CMS origin | `http://10.10.0.28:3001` |
| Proxy host | `root@10.10.0.56` |
| Proxy config | `/etc/nginx/conf.d/x24sport.vn.conf` |
| Public upstream | `http://10.10.0.58:3010` |
| Public cutover state | `x24sport.vn` targets the Next.js frontend |
| Search visibility | Production indexing is controlled by `SITE_ENV=production`; do not add `noindex` headers to `x24sport.vn` |

Use only the `x24sport.vn` procedure in
`../PRODUCTION-DEPLOYMENT-RUNBOOK.md`: standard rsync from local, then the exact
`compose.production.yml` `web` service command on `10.10.0.58`. Do not create a
backup, deploy by Git pull, or change the proxy during a normal frontend deploy.

## Payload tenant integration

| Field | Value |
|-------|-------|
| Tenant slug | `x24sport` |
| CMS application host | `root@10.10.0.28` |
| CMS compose path | `/opt/sports-cms` |
| CMS deployed source | `/opt/sports-cms/cms-api` |
| CMS compose service | `cms-api` |
| CMS origin | `http://10.10.0.28:3001` |
| Public CMS | `https://cms.x24sport.vn` |
| Admin login | `https://cms.x24sport.vn/admin/login` |
| Payload database | PostgreSQL `sports_cms` on `10.10.0.17` |
| Public media base | `https://static.x24sport.vn/x24sport/` |
| Tenant domains | `x24sport.vn` |
| Category collection | `product-categories` with `group=sport` |
| Product collection | `products` |

Every catalog request must include `where[tenant.slug][equals]=x24sport`.
Category and product slugs are resolved only inside this tenant.
`SITE_ENV=production` disables local presentation fallback so `x24sport.vn`
renders published CMS records.

The frontend fetch layer uses a 60-second Next.js revalidation window. A normal
published CMS content change should appear after the cache window and a fresh
request; do not rebuild the frontend merely to publish a product.

### Add or edit products

Preferred workflow:

1. Open `https://cms.x24sport.vn/admin/login`.
2. Select/filter tenant `x24sport` before opening Products, Product Categories,
   Media, Posts, Pages, or Store Settings.
3. For a product, verify at least name, stable ASCII slug, publication status,
   category, sport, price or contact-price state, stock state, short description,
   product content, gallery, image alt text, and SEO fields when applicable.
   Gallery media normally belongs to `x24sport`; a source-owned media record may
   be reused only when a super admin explicitly shares it with this tenant.
4. Publish the record and confirm the response is tenant-scoped to `x24sport`.
5. After at most the 60-second revalidation window, verify the product URL,
   assigned category URL, homepage shelf when applicable, sitemap, metadata,
   images, and structured data.

For bulk imports or deterministic content updates, use a tenant-scoped,
idempotent script under `cms-api/scripts/` or `cms-frontend/operations/`. Run a
dry-run first and never omit the `x24sport` tenant filter.

### REST service account

Use the common request, media, idempotency, no-backup, and verification workflow in
`../PAYLOAD-REST-API-GUIDE.md`. The table below contains only the X24Sport tenant
overrides. Payload API-key authentication is enabled for the shared `users` auth
collection, and X24Sport has one dedicated machine account:

| Field | Value |
|---|---|
| Service user | `x24sport-rest@internal.invalid` |
| Role | `tenant_admin` |
| Assigned tenant | `x24sport` only |
| REST base URL | `https://cms.x24sport.vn/api` |
| Secret source | `root@10.10.0.28:/root/sports-cms/x24sport-rest-api.env` |
| Secret file mode | `0600` |
| Authorization scheme | `users API-Key <key>` |
| Frontend revalidation | 60 seconds |
| Allowed content scope | X24Sport products, categories, media, posts, pages, and store settings |

The service account is tenant-filtered by the Payload multi-tenant plugin. It
must not be promoted to `super_admin`, assigned to another tenant, or reused by
a sibling website. For create requests, resolve and send the `x24sport` tenant
relationship explicitly. Rotate or revoke the key by updating/disabling this
service user, then atomically replace the mode-`0600` secret file. Never paste
the key into chat, logs, `AGENTS.md`, commits, shell tracing, or handoff output.

Verified on 17/07/2026: public API-key authentication returned 200; the account
could see X24Sport data but zero records from a sibling tenant; a temporary draft
product passed REST create, update, and delete cleanup.

### Deploy shared CMS code

Use only the shared `cms-api` procedure in
`../PRODUCTION-DEPLOYMENT-RUNBOOK.md`. CMS changes affect every tenant, so run
the documented type/build/import-map/migration and tenant-isolation gates. Do
not create a backup or substitute a Compose deployment.

Never restart PostgreSQL for an ordinary content or application deployment.

## Proxy and Cloudflare

- Proxy host: `root@10.10.0.56`.
- Active public config: `/etc/nginx/conf.d/x24sport.vn.conf`.
- Public logs: `/var/log/nginx/x24sport.vn_access.log` and
  `/var/log/nginx/x24sport.vn_error.log`.
- Validate with `nginx -t` before every reload; a normal frontend deploy needs
  no Nginx reload and no Cloudflare purge when the upstream is unchanged.
- Retrieve the Cloudflare API token at runtime only with
  `ruby ../scripts/website_registry.rb cloudflare-token x24sport.vn` from this
  folder. Never print it in handoff output or persist it in code/docs.
