# X24Sport Production Deployment Runbook

This is the single authoritative procedure for moving code from this local
workspace to X24Sport production. All agents and operators must use this file
instead of inventing commands from container names, old Compose labels, shell
history, or legacy deployment sections in website profiles.

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
| `x24sport.vn` | `root@10.10.0.58` | `/root/websites/x24sport.vn` | `next-x24sport` | `10.10.0.58:3010` |
| `mayaochaybo.vn` | `root@10.10.0.58` | `/root/websites/next.mayaochaybo.vn` | `next-mayaochaybo` | `10.10.0.58:3011` |
| `mayaobongda.vn` | `root@10.10.0.58` | `/root/websites/next.mayaobongda.vn` | `next-mayaobongda` | `10.10.0.58:3012` |
| `mayaocaulong.vn` | `root@10.10.0.28` | `/opt/sports-cms/mayaocaulong.vn` | `sports-cms-mayaocaulong-1` | `10.10.0.28:3002` |
| `mayaobongchuyen.vn` | `root@10.10.0.28` | `/opt/sports-cms/mayaobongchuyen.vn` | `sports-cms-mayaobongchuyen-1` | `10.10.0.28:3003` |
| `mayaobongro.vn` | `root@10.10.0.28` | `/opt/sports-cms/mayaobongro.vn` | `sports-cms-mayaobongro-1` | `10.10.0.28:3005` |
| `mayaopickleball.vn` | `root@10.10.0.27` | `/root/websites/apps/mayaopickleball-next` | `mayaopickleball-next` | `10.10.0.27:8000` |
| Shared `cms-api` | `root@10.10.0.28` | `/opt/sports-cms/cms-api` | `sports-cms-cms-api-1` | `10.10.0.28:3001` |

## Compose frontends on 10.10.0.58

### x24sport.vn

Synchronize `x24sport.vn/` to `/root/websites/x24sport.vn/`, then run only:

```bash
ssh root@10.10.0.58 \
  'cd /root/websites/x24sport.vn && docker compose -f compose.production.yml up -d --build web'
```

Verify:

```bash
ssh root@10.10.0.58 \
  'docker inspect -f "{{.State.Status}} {{.State.Health.Status}}" next-x24sport && docker logs --tail 120 next-x24sport'
curl -fsSI http://10.10.0.58:3010/
curl -fsSI https://x24sport.vn/
```

### mayaochaybo.vn

Synchronize `mayaochaybo.vn/` to
`/root/websites/next.mayaochaybo.vn/`, then run only:

```bash
ssh root@10.10.0.58 \
  'cd /root/websites/next.mayaochaybo.vn && docker compose -f compose.production.yml up -d --build web'
```

Verify:

```bash
ssh root@10.10.0.58 \
  'docker inspect -f "{{.State.Status}} {{.State.Health.Status}}" next-mayaochaybo && docker logs --tail 120 next-mayaochaybo'
curl -fsSI http://10.10.0.58:3011/
curl -fsSI https://mayaochaybo.vn/
```

### mayaobongda.vn

Synchronize `mayaobongda.vn/` to
`/root/websites/next.mayaobongda.vn/`, then run only:

```bash
ssh root@10.10.0.58 \
  'cd /root/websites/next.mayaobongda.vn && docker compose -f compose.production.yml up -d --build web'
```

Verify:

```bash
ssh root@10.10.0.58 \
  'docker inspect -f "{{.State.Status}} {{.State.Health.Status}}" next-mayaobongda && docker logs --tail 120 next-mayaobongda'
curl -fsSI http://10.10.0.58:3012/
curl -fsSI https://mayaobongda.vn/
```

## Standalone frontends on 10.10.0.28

There is no live `/opt/sports-cms/docker-compose.yml`. Do not run Docker Compose
for these services even if their containers retain historical Compose labels.
Use a UTC deployment ID and the exact runtime definitions below.

### mayaocaulong.vn

```bash
DEPLOY_ID=$(date -u +%Y%m%d%H%M%S)
ssh root@10.10.0.28 "docker build -t sports-cms-mayaocaulong:deploy-${DEPLOY_ID} /opt/sports-cms/mayaocaulong.vn"
ssh root@10.10.0.28 "set -e; docker stop sports-cms-mayaocaulong-1; docker container rm sports-cms-mayaocaulong-1; docker run -d --name sports-cms-mayaocaulong-1 --restart unless-stopped --network sports-cms_default --add-host host.docker.internal:host-gateway -p 3002:3002 -e NODE_ENV=production -e PORT=3002 -e TENANT_SLUG=mayaocaulong -e PAYLOAD_API_URL=http://host.docker.internal:3001 sports-cms-mayaocaulong:deploy-${DEPLOY_ID}"
```

### mayaobongchuyen.vn

```bash
DEPLOY_ID=$(date -u +%Y%m%d%H%M%S)
ssh root@10.10.0.28 "docker build -t sports-cms-mayaobongchuyen:deploy-${DEPLOY_ID} /opt/sports-cms/mayaobongchuyen.vn"
ssh root@10.10.0.28 "set -e; docker stop sports-cms-mayaobongchuyen-1; docker container rm sports-cms-mayaobongchuyen-1; docker run -d --name sports-cms-mayaobongchuyen-1 --restart unless-stopped --network sports-cms_default -p 3003:3003 -e NODE_ENV=production -e PORT=3003 -e TENANT_SLUG=mayaobongchuyen -e PAYLOAD_API_URL=http://10.10.0.28:3001 sports-cms-mayaobongchuyen:deploy-${DEPLOY_ID}"
```

### mayaobongro.vn

```bash
DEPLOY_ID=$(date -u +%Y%m%d%H%M%S)
ssh root@10.10.0.28 "docker build -t sports-cms-mayaobongro:deploy-${DEPLOY_ID} /opt/sports-cms/mayaobongro.vn"
ssh root@10.10.0.28 "set -e; docker stop sports-cms-mayaobongro-1; docker container rm sports-cms-mayaobongro-1; docker run -d --name sports-cms-mayaobongro-1 --restart unless-stopped --network sports-cms_default -p 3005:3005 -e NODE_ENV=production -e PORT=3005 -e TENANT_SLUG=mayaobongro -e PAYLOAD_API_URL=http://10.10.0.28:3001 sports-cms-mayaobongro:deploy-${DEPLOY_ID}"
```

Verify the selected service with its origin and public URL, then inspect the
selected container's last 120 log lines. Do not rebuild the other containers.

## Standalone mayaopickleball.vn frontend

The canonical runtime secret file is:

```text
/root/websites/apps/mayaopickleball-next/.env.production
```

It must be mode `0600` and contain the production runtime variables, including
the Telegram variables, before replacing the current container. Never reconstruct
secrets from chat, source code, or copied container output. If the file is
missing, stop the deployment and request that it be provisioned from the approved
secret source.

```bash
DEPLOY_ID=$(date -u +%Y%m%d%H%M%S)
ssh root@10.10.0.27 'test -f /root/websites/apps/mayaopickleball-next/.env.production && test "$(stat -c %a /root/websites/apps/mayaopickleball-next/.env.production)" = 600'
ssh root@10.10.0.27 "docker build -t mayaopickleball-next:deploy-${DEPLOY_ID} /root/websites/apps/mayaopickleball-next"
ssh root@10.10.0.27 "set -e; docker stop mayaopickleball-next; docker container rm mayaopickleball-next; docker run -d --name mayaopickleball-next --restart unless-stopped --env-file /root/websites/apps/mayaopickleball-next/.env.production -p 8000:3004 mayaopickleball-next:deploy-${DEPLOY_ID}"
```

Verify `http://10.10.0.27:8000/`, `https://mayaopickleball.vn/`, container
status, and the last 120 log lines.

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
