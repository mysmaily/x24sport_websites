# mayaobongro.vn — Managed Website Profile

> Scope: This file contains only data and runbooks specific to `mayaobongro.vn`.
> Shared routing is defined in `../AGENTS.md`. Load the optimization guide only
> when the current request matches a guide-loading trigger.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `mayaobongro.vn` |
| Payload tenant slug | `mayaobongro` |
| Active development platform | Next.js frontend + shared Payload CMS |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress status | Legacy/restore source only; never use for active development or content updates |

The generated registry block below describes the old WordPress installation.
Keep it for restore, rollback, and source reconciliation only. New products,
categories, media, content, code, and deployments must target Payload tenant
`mayaobongro` and its Next.js frontend.

## Runtime management

| Field | Value |
|---|---|
| Application host | `root@10.10.0.28` |
| Deployed source | `/opt/sports-cms/mayaobongro.vn` |
| Compose project/file | `/opt/sports-cms` / `docker-compose.yml` |
| Compose service | `mayaobongro` |
| Runtime container | `sports-cms-mayaobongro-1` |
| Container/published port | `3005` / `10.10.0.28:3005` |
| CMS service/origin | `cms-api` / `http://cms-api:3001` |
| Proxy host | `root@10.10.0.56` (`103.147.35.95`) |
| Proxy config | `/etc/nginx/conf.d/mayaobongro.vn.conf` |
| Public upstream | `http://10.10.0.28:3005` (`mayaobongro_nextjs`) |
| Public site | `https://mayaobongro.vn` |

The values above were verified from the live Compose project and proxy config
on 17/07/2026. The proxy keeps historical `/wp-content/uploads/` media readable,
but blocks WordPress execution/admin routes on the apex domain.

Read-only runtime checks:

```bash
ssh root@10.10.0.28 'cd /opt/sports-cms && docker compose ps mayaobongro'
curl -I http://10.10.0.28:3005/
ssh root@10.10.0.56 'nginx -t'
curl -I https://mayaobongro.vn/
```

<!-- WEBSITE_REGISTRY_START -->
## Central website registry

Generated from the latest `website_configs` record. From this website folder,
run `ruby ../scripts/website_registry.rb sync domain=mayaobongro.vn` to refresh only this website block. Local notes outside
the markers are preserved.

| Field | Value |
|-------|-------|
| Website registry ID | 32 |
| Configuration registry ID | 122 |
| Configuration status | pending |
| Display name | mayaobongro-vn |
| Brand name | Not configured |
| WordPress | Yes |
| CDN enabled | Yes |
| N8N capable | No |
| Nginx cache status | Not configured |
| Cloudflare cache status | Not configured |
| Application port | 8001 |
| Root directory | /root/websites |
| WordPress content directory | /root/websites/sites/mayaobongro.vn/wp-content |
| Source directory | /root/websites/sites/mayaobongro.vn |
| Root folder | Not configured |
| Source folder | Not configured |
| WordPress content folder | Not configured |
| Website host registry ID | 18 |
| Website host private IP | 10.10.0.26 |
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
ruby ../scripts/website_registry.rb cloudflare-token mayaobongro.vn
```

Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
<!-- WEBSITE_REGISTRY_END -->
