# mayaobongda.vn — Managed Website Profile

> Scope: This file contains only data and runbooks specific to `mayaobongda.vn`.
> Shared routing is defined in `../AGENTS.md`. Load the optimization guide only
> when the current request matches a guide-loading trigger.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `mayaobongda.vn` |
| Payload tenant slug | `mayaobongda` |
| Active platform | Next.js + Payload |
| Migration status | Public apex is served by the Next.js frontend; legacy WordPress runtime remains on the application host |

`mayaobongda.vn` public traffic is currently routed to the Next.js frontend on
port `3012`, backed by the shared Payload CMS tenant slug `mayaobongda`.
WordPress containers and files remain available on the application host for
legacy access and source reference only; do not treat them as the public runtime
unless the proxy is intentionally changed back.

## Runtime management

| Field | Value |
|---|---|
| Application host | `root@10.10.0.58` |
| Application root | `/root/websites/next.mayaobongda.vn` |
| Docker Compose | `/root/websites/next.mayaobongda.vn/compose.production.yml` |
| Runtime container | `next-mayaobongda` |
| Published application port | `10.10.0.58:3012` |
| Proxy host | `root@10.10.0.56` (`103.147.35.95`) |
| Proxy config | `/etc/nginx/conf.d/mayaobongda.vn.conf` |
| Public upstream | `http://10.10.0.58:3012` |
| Request path | Proxy → `next-mayaobongda` → shared Payload CMS at `http://10.10.0.28:3001` |

Legacy WordPress source remains at `/root/websites/sites/mayaobongda.vn` with
containers `wp-nginx` and `wp-php` on the shared WordPress host. The generated
registry block below still describes that WordPress infrastructure and may lag
the verified public cutover state above.

<!-- WEBSITE_REGISTRY_START -->
## Central website registry

Generated from the latest `website_configs` record. From this website folder,
run `ruby ../scripts/website_registry.rb sync domain=mayaobongda.vn` to refresh only this website block. Local notes outside
the markers are preserved.

| Field | Value |
|-------|-------|
| Website registry ID | 30 |
| Configuration registry ID | 155 |
| Configuration status | pending |
| Display name | mayaobongda-vn |
| Brand name | Not configured |
| WordPress | Yes |
| CDN enabled | No |
| N8N capable | No |
| Nginx cache status | Not configured |
| Cloudflare cache status | Not configured |
| Application port | 8001 |
| Root directory | /root/websites |
| WordPress content directory | /root/websites/sites/mayaobongda.vn/wp-content |
| Source directory | /root/websites/sites/mayaobongda.vn |
| Root folder | Not configured |
| Source folder | Not configured |
| WordPress content folder | Not configured |
| Website host registry ID | 15 |
| Website host private IP | 10.10.0.58 |
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
ruby ../scripts/website_registry.rb cloudflare-token mayaobongda.vn
```

Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
<!-- WEBSITE_REGISTRY_END -->
