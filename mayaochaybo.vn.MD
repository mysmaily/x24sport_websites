# mayaochaybo.vn — Shared Frontend Tenant Profile

> Scope: This file contains only tenant notes for `mayaochaybo.vn`. The active
> frontend source is `cms-frontend/`; do not treat this tenant as a standalone
> app.

> Deployment authority: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the shared
> `cms-frontend` deployment procedure.

## Active Tenant Identity

| Field | Value |
|---|---|
| Domain | `mayaochaybo.vn` |
| Payload tenant slug | `mayaochaybo` |
| Active development platform | Shared `cms-frontend/` Next.js frontend + shared Payload CMS |
| Tenant source | `cms-frontend/src/app/[tenant]/_mayaochaybo/` |
| Tenant styles | `cms-frontend/src/app/mayaochaybo.css` scoped by `body.tenant-mayaochaybo` |
| Tenant assets | `cms-frontend/public/images/mayaochaybo/` |
| Payload CMS | `https://cms.x24sport.vn` |
| WordPress archive | `https://wp.mayaochaybo.vn` |

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
| Proxy config | `/etc/nginx/conf.d/mayaochaybo.vn.conf` |
| Public upstream | `http://10.10.0.58:3010` |
| Public site | `https://mayaochaybo.vn` |

The former standalone source path `/root/websites/next.mayaochaybo.vn` and
container `next-mayaochaybo` are historical after the shared frontend merge.
Do not deploy them for normal frontend changes.

## Local Development

```bash
cd cms-frontend
pnpm typecheck
pnpm build
```

Product detail pages use `/san-pham/<slug>/` as the canonical public URL.
Root-level legacy product paths must redirect permanently to `/san-pham/<slug>/`
when a product is found. Category, content, and other legacy paths remain
tenant-scoped by exact `legacyPath`.

## Verification

Check representative routes after changes:

```bash
curl -fsSI https://mayaochaybo.vn/
curl -fsSI https://mayaochaybo.vn/san-pham/
curl -fsSI https://mayaochaybo.vn/blog/
```
