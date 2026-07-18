# mayaopickleball.vn — Managed Website Profile

> Scope: This file contains only data and runbooks specific to `mayaopickleball.vn`.
> Shared routing is defined in `../AGENTS.md`. Load the optimization guide only
> when the current request matches a guide-loading trigger.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `mayaopickleball.vn` |
| Payload tenant slug | `mayaopickleball` |
| Active development platform | Next.js frontend + shared Payload CMS |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress status | Legacy/restore source only; never use for active development or content updates |

The generated registry block below may still contain WordPress-shaped fields and
paths. Treat every such field as historical recovery/source data, even when it
has a value. New products, categories, media, content, code, and deployments must
target Payload tenant `mayaopickleball` and its Next.js frontend.

## Runtime management

| Field | Value |
|---|---|
| Application host | `root@10.10.0.27` |
| Deployed source | `/root/websites/apps/mayaopickleball-next` |
| Runtime method | Standalone Docker container; not part of `/root/websites/docker-compose.yml` |
| Image | `mayaopickleball-next:current` |
| Container | `mayaopickleball-next` |
| Container/published port | `3004` / `10.10.0.27:8000` |
| Tenant environment | `TENANT_SLUG=mayaopickleball` |
| CMS origin | `http://10.10.0.28:3001` |
| Proxy host | `root@10.10.0.56` (`103.147.35.95`) |
| Proxy config | `/etc/nginx/conf.d/mayaopickleball.vn.conf` |
| Public upstream | `http://10.10.0.27:8000` |
| Public site | `https://mayaopickleball.vn` |

The live container and proxy were verified on 17/07/2026. Because this frontend
is currently started outside Compose, inspect and preserve the current container
configuration before replacing it. Do not use the WordPress Compose project at
`/root/websites/docker-compose.yml` to deploy this Next.js app.

Read-only runtime checks:

```bash
ssh root@10.10.0.27 'docker inspect mayaopickleball-next'
curl -I http://10.10.0.27:8000/
ssh root@10.10.0.56 'nginx -t'
curl -I https://mayaopickleball.vn/
```

<!-- WEBSITE_REGISTRY_START -->
## Central website registry

Generated from the latest `website_configs` record. From this website folder,
run `ruby ../scripts/website_registry.rb sync domain=mayaopickleball.vn` to refresh only this website block. Local notes outside
the markers are preserved.

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
ruby ../scripts/website_registry.rb cloudflare-token mayaopickleball.vn
```

Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
<!-- WEBSITE_REGISTRY_END -->
