# Shared Frontend Tenant Merge Workflow

Use this workflow when merging a standalone `mayao*.vn` Next.js tenant into the
shared `cms-frontend/` application.

## Scope

- Preserve the public URL/page contract for the tenant.
- Preserve tenant-specific UI and CSS isolation.
- Move reusable operational knowledge into this workflow or a skill, not ad hoc
  root-level notes.
- After merge, keep only the domain metadata document at the repository root,
  such as `mayaopickleball.vn.MD`.

## Local Merge

1. Read root `AGENTS.md`, the production runbook, and the tenant profile/source
   that is being merged.
2. Inventory routes, layouts, components, metadata, product/category behavior,
   and static assets.
3. Add tenant configuration to `cms-frontend` without changing existing tenant
   behavior.
4. Place tenant-specific routes/wrappers under `cms-frontend/src/app/[tenant]/`
   and tenant-specific styling/assets in isolated modules or classes.
5. Avoid shared CSS changes unless the same behavior is intentionally shared by
   more than one tenant.
6. Run route parity checks for all non-product pages. Product pages may be
   sampled when the catalog is large.
7. Delete the merged standalone source folder only after local verification and
   create/update `<domain>.MD` with tenant metadata and production evidence.

## Production Cutover

1. Deploy `cms-frontend` using `PRODUCTION-DEPLOYMENT-RUNBOOK.md`.
2. Point proxy upstreams for the merged apex, `www`, and preview hosts to the
   shared frontend upstream.
3. Validate Nginx config before reload.
4. Verify HTTP status, redirects, canonical tenant marker, and representative
   pages on public HTTPS.
5. Stop old standalone frontend containers only after public verification passes.
6. Leave archive WordPress containers, media/CDN origins, reporters, and the CMS
   API running unless the user explicitly asks to consolidate those services too.

## Git Hygiene

- Commit tenant merge changes separately from generated artifacts.
- Do not track generated images, build outputs, Playwright state, backups,
  source downloads, or credentials.
- Track metadata, manifests, ledgers, inventory files, and uploaded URL records
  when they are useful for repeatability.
