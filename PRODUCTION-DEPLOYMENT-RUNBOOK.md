# X24Sport Production Deployment Runbook

This is the single authoritative procedure for moving code from this local
workspace to X24Sport production. All agents and operators must use this file
instead of inventing commands from container names or shell history.

## Non-negotiable rules

- Deploy from the repository workspace over the private VPN using SSH/rsync.
- Do not deploy with Git pull, GitHub Actions, an ad-hoc archive, or by editing
  production source directly.
- Do not create rollback copies, dumps, snapshots, archives, cloned containers,
  copied images, or renamed resources during deployment or mutation work.
- Never transfer `.env`, `.env.local`, secrets, `node_modules`, `.next`, or
  operations artifacts from local.
- Build the production Docker image on the target application host.
- Deploy only the requested frontend. A frontend change does not rebuild the
  shared CMS or sibling frontends.
- Use the exact host, path, container, port, environment, and network in this
  runbook. If live state differs, stop before mutation and update this runbook
  from verified Docker, filesystem, and Nginx evidence.
- Current deployments replace one container behind one Nginx upstream. They are
  not zero-downtime deployments.

## Standard sequence

Every code deployment uses this order:

1. Read root `AGENTS.md`, this runbook, and the target profile.
2. Run the target package's TypeScript/test and production build locally.
3. Commit the task-scoped source changes unless the user requested no commit.
4. Run an rsync dry-run and review every deletion.
5. Synchronize source using the exact target mapping below.
6. Build the image on the application host while the current container serves.
7. Replace only the target container using the documented runtime command.
8. Verify origin HTTP, public HTTP, container status/health, and recent logs.
9. Report the image/container deployed, observed checks, and service impact.

Use this standard rsync filter for every frontend, first with `--dry-run`, then
again without it:

```bash
rsync -az --delete --dry-run \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude '.env*' \
  --exclude backups \
  --exclude operations \
  <local-directory>/ root@<host>:<remote-directory>/
```

Do not continue when the dry-run would delete a production-only secret or an
unrecognized runtime file.

## Runtime inventory

| Target | SSH host | Remote source | Container | Published origin |
|---|---|---|---|---|
| `x24sport.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `rynosport.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `mayaocaulong.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `mayaopickleball.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `mayaobongchuyen.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `mayaobongro.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `mayaochaybo.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| `mayaobongda.vn` | `root@10.10.0.58` | `/root/websites/cms-frontend` | `cms-frontend` | `10.10.0.58:3010` |
| Shared `cms-api` | `root@10.10.0.28` | `/opt/sports-cms/cms-api` | `sports-cms-cms-api-1` | `10.10.0.28:3001` |

## Compose frontends on 10.10.0.58

### Shared cms-frontend tenants

This shared frontend currently serves:

- `x24sport.vn`
- `rynosport.vn`
- `mayaocaulong.vn`
- `mayaopickleball.vn`
- `mayaobongchuyen.vn`
- `mayaobongro.vn`
- `mayaochaybo.vn`
- `mayaobongda.vn`

Synchronize `cms-frontend/` to `/root/websites/cms-frontend/`, then run only:

```bash
ssh root@10.10.0.58 \
  'cd /root/websites/cms-frontend && docker compose -f compose.production.yml up -d --build web'
```

Verify:

```bash
ssh root@10.10.0.58 \
  'docker inspect -f "{{.State.Status}} {{.State.Health.Status}}" cms-frontend && docker logs --tail 120 cms-frontend'
curl -fsSI http://10.10.0.58:3010/
curl -fsSI https://x24sport.vn/
curl -fsSI https://rynosport.vn/
curl -fsSI https://mayaocaulong.vn/
curl -fsSI https://mayaopickleball.vn/
curl -fsSI https://mayaobongchuyen.vn/
curl -fsSI https://mayaobongro.vn/
curl -fsSI https://mayaochaybo.vn/
curl -fsSI https://mayaobongda.vn/
```

There are no standalone public frontends. Do not create or deploy a per-domain
frontend container; every tenant is served by `cms-frontend`.

## Shared cms-api

CMS is shared by every Payload tenant. Normal content edits do not deploy CMS.
For CMS code/schema work, synchronize only the local `cms-api/` directory to
`/opt/sports-cms/cms-api/`. Never rsync with `--delete` directly into
`/opt/sports-cms/`, because that parent also contains frontend source and the
production `.env`.

Create the canonical source directory if needed, then use the standard rsync
filter from this runbook:

```bash
ssh root@10.10.0.28 'mkdir -p /opt/sports-cms/cms-api'
```

Run local checks first:

```bash
cd cms-api
pnpm payload generate:types
pnpm payload generate:importmap
pnpm exec tsc --noEmit
pnpm build
```

Build and migrate before replacing the container:

```bash
DEPLOY_ID=$(date -u +%Y%m%d%H%M%S)
ssh root@10.10.0.28 "docker build -t sports-cms-cms-api:deploy-${DEPLOY_ID} /opt/sports-cms/cms-api"
ssh root@10.10.0.28 "docker run --rm --env-file /opt/sports-cms/.env --network host -v /opt/sports-cms/cms-api/tsconfig.json:/app/tsconfig.json:ro sports-cms-cms-api:deploy-${DEPLOY_ID} pnpm payload migrate"
ssh root@10.10.0.28 "set -e; docker stop sports-cms-cms-api-1; docker container rm sports-cms-cms-api-1; docker run -d --name sports-cms-cms-api-1 --restart unless-stopped --env-file /opt/sports-cms/.env -p 3001:3001 sports-cms-cms-api:deploy-${DEPLOY_ID}"
```

Verify:

```bash
curl -fsSI http://10.10.0.28:3001/admin/login
curl -fsSI https://cms.x24sport.vn/admin/login
ssh root@10.10.0.28 'docker inspect -f "{{.State.Status}}" sports-cms-cms-api-1 && docker logs --tail 120 sports-cms-cms-api-1'
```

For shared changes, also verify authentication and tenant isolation with scoped
service accounts. Never restart PostgreSQL for an application deployment.

## Failure handling

- If local checks or image build fail, leave the current container running.
- If the new container fails, inspect logs and correct the code/config; do not
  improvise a different runtime command.
- Do not change Nginx, DNS, Cloudflare, CMS, or a sibling frontend to compensate
  for a failed site-local deployment.
- This runbook intentionally documents the current single-instance replacement
  model. A future blue-green rollout requires a separate approved runbook update.
