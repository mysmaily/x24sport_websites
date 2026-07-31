# mayaobongchuyen.vn — Shared Frontend Tenant Profile

> Scope: This file contains only tenant notes for `mayaobongchuyen.vn`. The
> active frontend source is `cms-frontend/`; do not treat this tenant as a
> standalone app.

> Deployment authority: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the shared
> `cms-frontend` deployment procedure.

## Active Tenant Identity

| Field | Value |
|---|---|
| Domain | `mayaobongchuyen.vn` |
| Payload tenant slug | `mayaobongchuyen` |
| Active development platform | Shared `cms-frontend/` Next.js frontend + shared Payload CMS |
| Tenant source | `cms-frontend/src/app/[tenant]/_mayaobongchuyen/` |
| Tenant styles | `cms-frontend/src/app/mayaobongchuyen.css` scoped by `body.tenant-mayaobongchuyen` |
| Tenant assets | `cms-frontend/public/images/mayaobongchuyen/` |
| Payload CMS | `https://cms.x24sport.vn` |

## Runtime Management

| Field | Value |
|---|---|
| Application host | `root@10.10.0.58` |
| Deployed source | `/root/websites/cms-frontend` |
| Runtime method | Docker Compose shared frontend |
| Container / service | `cms-frontend` / `web` |
| Container/published port | `3010` / `10.10.0.58:3010` |
| CMS origin | `http://10.10.0.28:3001` |
| Proxy host | `root@10.10.0.56` |
| Proxy config | `/etc/nginx/conf.d/mayaobongchuyen.vn.conf` |
| Public upstream | `http://10.10.0.58:3010` |
| Public site | `https://mayaobongchuyen.vn` |

The former standalone source path `/opt/sports-cms/mayaobongchuyen.vn` and
container `sports-cms-mayaobongchuyen-1` are historical after the shared
frontend merge. Do not deploy them for normal frontend changes.

## Local Development

```bash
cd cms-frontend
pnpm typecheck
pnpm build
```

Keep normal product, page, post, media, and store setting data in Payload under
tenant `mayaobongchuyen`. Frontend fallback content exists only for resilience
when the CMS is temporarily unreachable.

## Verification

Check representative routes after changes:

```bash
curl -fsSI https://mayaobongchuyen.vn/
curl -fsSI https://mayaobongchuyen.vn/ao-bong-chuyen/
curl -fsSI https://mayaobongchuyen.vn/tim-kiem/
```

