# mayaopickleball.vn — Shared Frontend Tenant Profile

> Scope: This file contains only data and runbooks specific to `mayaopickleball.vn`.
> Shared routing is defined in `AGENTS.md`. The active frontend source is
> `cms-frontend/`; do not treat this tenant as a standalone app.

> Deployment authority: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the
> `cms-frontend` deployment procedure because `mayaopickleball.vn` is served by
> the same shared `cms-frontend` container.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `mayaopickleball.vn` |
| Payload tenant slug | `mayaopickleball` |
| Active development platform | Shared `cms-frontend/` Next.js frontend + shared Payload CMS |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress status | Legacy/restore source only; never use for active development or content updates |

The generated registry block below may still contain WordPress-shaped fields and
paths. Treat every such field as historical recovery/source data, even when it
has a value. New products, categories, media, content, code, and deployments must
target Payload tenant `mayaopickleball` and its Next.js frontend.

This tenant is merged into `cms-frontend/`. Keep this root-level
`mayaopickleball.vn.MD` file for tenant notes, and do not keep a standalone
`mayaopickleball.vn/` source folder.

## Source and runtime routing

| Requested work | Local source of truth | Remote runtime / action |
|---|---|---|
| Public UI, routes, SEO templates, catalog rendering | `cms-frontend/` | Deploy to `root@10.10.0.58:/root/websites/cms-frontend` |
| Tenant-specific page/layout behavior | `cms-frontend/src/app/[tenant]/_mayaopickleball/` and route wrappers under `cms-frontend/src/app/[tenant]/` | Rebuild only the shared `cms-frontend` frontend |
| Tenant styles | `cms-frontend/src/app/mayaopickleball.css` | Scoped by `body.tenant-mayaopickleball` |
| Tenant assets | `cms-frontend/public/images/mayaopickleball/` | Included in the shared frontend deploy |
| Add or edit a product/category/post/media record | Payload admin or a tenant-scoped API migration | `https://cms.x24sport.vn/admin`; select tenant `mayaopickleball` |

## Runtime management

| Field | Value |
|---|---|
| Application host | `root@10.10.0.58` |
| Deployed source | `/root/websites/cms-frontend` |
| Runtime method | Docker Compose shared frontend |
| Image | `cms-frontend:production` |
| Container | `cms-frontend` |
| Container/published port | `3010` / `10.10.0.58:3010` |
| Tenant environment | `TENANT_SLUG=mayaopickleball` |
| CMS origin | `http://10.10.0.28:3001` |
| Proxy host | `root@10.10.0.56` (`103.147.35.95`) |
| Proxy config | `/etc/nginx/conf.d/mayaopickleball.vn.conf` |
| Public upstream | `http://10.10.0.58:3010` |
| Public site | `https://mayaopickleball.vn` |

The tenant was merged into the shared `cms-frontend` runtime on 31/07/2026.
Do not deploy the retired standalone `mayaopickleball-next` container for normal
frontend changes.

Read-only runtime checks:

```bash
ssh root@10.10.0.58 'docker inspect cms-frontend'
curl -I http://10.10.0.58:3010/
ssh root@10.10.0.56 'nginx -t'
curl -I https://mayaopickleball.vn/
```

<!-- WEBSITE_REGISTRY_START -->
## Central website registry

Generated from the latest `website_configs` record. Because this domain is a
merged `cms-frontend/` tenant, do not leave a generated `mayaopickleball.vn/`
folder in the repository. Keep tenant notes in this file.

| Field | Value |
|-------|-------|
| Website registry ID | 35 |
| Configuration registry ID | 116 |
| Configuration status | pending |
| Display name | mayaopickleball-vn |
| Brand name | Not configured |
| WordPress | No |
| CDN enabled | Yes |
| N8N capable | No |
| Nginx cache status | Not configured |
| Cloudflare cache status | Not configured |
| Application port | 8000 |
| Root directory | /root/websites |
| WordPress content directory | /root/websites/sites/mayaopickleball.vn/wp-content |
| Source directory | /root/websites/sites/mayaopickleball.vn |
| Root folder | Not configured |
| Source folder | Not configured |
| WordPress content folder | Not configured |
| Website host registry ID | 19 |
| Website host private IP | 10.10.0.27 |
| Website host public IP | Not configured |
| Website host setup complete | Yes |
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
ruby scripts/website_registry.rb cloudflare-token mayaopickleball.vn
```

Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
<!-- WEBSITE_REGISTRY_END -->
