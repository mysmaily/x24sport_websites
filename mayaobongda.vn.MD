# mayaobongda.vn — Shared Frontend Tenant Profile

> Scope: This file contains only tenant notes for `mayaobongda.vn`. The active
> frontend source is `cms-frontend/`; do not treat this tenant as a standalone
> app.

> Deployment authority: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`. Use the shared
> `cms-frontend` deployment procedure.

## Active Tenant Identity

| Field | Value |
|---|---|
| Domain | `mayaobongda.vn` |
| Payload tenant slug | `mayaobongda` |
| Active development platform | Shared `cms-frontend/` Next.js frontend + shared Payload CMS |
| Tenant source | `cms-frontend/src/app/[tenant]/_mayaobongda/` |
| Tenant styles | `cms-frontend/src/app/mayaobongda.css` scoped by `body.tenant-mayaobongda` |
| Tenant assets | `cms-frontend/public/images/mayaobongda/` |
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
| Proxy config | `/etc/nginx/conf.d/mayaobongda.vn.conf` |
| Public upstream | `http://10.10.0.58:3010` |
| Public site | `https://mayaobongda.vn` |

The former standalone preview runtime has been removed after the shared
frontend merge. Do not deploy preview runtimes for normal frontend changes.

## Local Development

```bash
cd cms-frontend
pnpm typecheck
pnpm build
```

Football products use root-level legacy product paths from Payload. Preserve
exact tenant-scoped `legacyPath` behavior when changing routing.

## Verification

Check representative routes after changes:

```bash
curl -fsSI https://mayaobongda.vn/
curl -fsSI https://mayaobongda.vn/san-pham/
curl -fsSI https://mayaobongda.vn/blog/
```
