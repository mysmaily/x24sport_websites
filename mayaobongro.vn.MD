# mayaobongro.vn — Shared Frontend Tenant Profile

> Scope: This file contains only tenant notes for `mayaobongro.vn`. The active
> frontend source is `cms-frontend/`; do not treat this tenant as a standalone
> app.

> Deployment authority: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the shared
> `cms-frontend` deployment procedure.

## Active Tenant Identity

| Field | Value |
|---|---|
| Domain | `mayaobongro.vn` |
| Payload tenant slug | `mayaobongro` |
| Active development platform | Shared `cms-frontend/` Next.js frontend + shared Payload CMS |
| Tenant source | `cms-frontend/src/app/[tenant]/_mayaobongro/` |
| Tenant styles | `cms-frontend/src/app/mayaobongro.css` scoped by `body.tenant-mayaobongro` |
| Tenant assets | `cms-frontend/public/images/mayaobongro/` |
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
| Proxy config | `/etc/nginx/conf.d/mayaobongro.vn.conf` |
| Public upstream | `http://10.10.0.58:3010` |
| Public site | `https://mayaobongro.vn` |

The former standalone source path `/opt/sports-cms/mayaobongro.vn` and
container `sports-cms-mayaobongro-1` are historical after the shared frontend
merge. Do not deploy them for normal frontend changes.

## Local Development

```bash
cd cms-frontend
pnpm typecheck
pnpm build
```

Basketball routes include both catalog paths and root-level legacy product
paths. Preserve tenant-scoped `legacyPath` behavior when changing routing.

## Verification

Check representative routes after changes:

```bash
curl -fsSI https://mayaobongro.vn/
curl -fsSI https://mayaobongro.vn/san-pham/
curl -fsSI https://mayaobongro.vn/dat-may-ao-bong-ro/
```

