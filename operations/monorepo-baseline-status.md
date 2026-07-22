# X24Sport Monorepo Baseline Status

Last updated: 2026-07-22.

## Evidence Runs

Ignored evidence directories:

- Render, SEO, sitemap, robots, screenshot, and browser checks:
  `operations/monorepo-baseline/20260722-183631/`
- Build and typecheck checks:
  `operations/monorepo-baseline/20260722-184150/`

These directories are intentionally ignored by Git.

## Build Gate

| Site | Build | Typecheck |
|---|---|---|
| `x24sport.vn` | Pass | Pass |
| `mayaocaulong.vn` | Pass | Skipped: no `typecheck` script |
| `mayaopickleball.vn` | Pass | Skipped: no `typecheck` script |
| `mayaobongchuyen.vn` | Pass | Skipped: no `typecheck` script |
| `mayaobongro.vn` | Pass | Pass |
| `mayaochaybo.vn` | Pass | Pass |

Build/typecheck evidence uses tenant-safe build environment:

```text
PAYLOAD_API_URL=https://cms.x24sport.vn
TENANT_SLUG=<site tenant slug>
```

## Public Render Baseline

| Site | Sitemap URLs | Representative detail | Page audit status |
|---|---:|---|---|
| `x24sport.vn` | 796 | `/logo-hello-kitty-de-thuong` | Home/catalog/static/detail pass |
| `mayaocaulong.vn` | 0 | None discovered | Catalog pass; home/static fail missing canonical |
| `mayaopickleball.vn` | 843 | `/san-pham/bo-quan-ao-pickleball-x24-pb-281-cam` | Home/catalog/static/detail pass |
| `mayaobongchuyen.vn` | 0 | None discovered | Home/static fail missing canonical; catalog audit hit HTTP 308 |
| `mayaobongro.vn` | 796 | `/san-pham/ao-bong-ro-hoc-sinh/` | Home/catalog/static/detail pass |
| `mayaochaybo.vn` | 654 | `/may-ao-chay-bo-thiet-ke-rieng-x24` | Home/catalog/static/detail pass |

## Known Baseline Issues Before Monorepo Migration

These are current-state findings, not regressions from monorepo work.

- `mayaocaulong.vn/sitemap.xml` returns a Next.js 404/error page, so sitemap URL
  count is `0`.
- `mayaocaulong.vn` home and `/dat-may-ao-cau-long` render without a canonical
  link.
- `mayaobongchuyen.vn/sitemap.xml` returns a Next.js 404/error page, so sitemap
  URL count is `0`.
- `mayaobongchuyen.vn` home renders without a canonical link.
- `mayaobongchuyen.vn/san-pham/` returns HTTP 308 during the audit path and needs
  route/canonical normalization before it is a clean catalog baseline.
- `x24sport.vn` representative detail URL selected from sitemap is
  `/logo-hello-kitty-de-thuong`; confirm whether this is an intended product-like
  detail page before using it for product-detail contract comparisons.
- Browser contract checks currently flag:
  - `x24sport.vn`: mobile catalog filter toolbar one-row check; detail `h1`
    product font-size check on the selected representative detail.
  - `mayaobongro.vn`: catalog product name size, compare-price row/delta, and
    product-detail `h1` font-size checks.
  - `mayaochaybo.vn`: product-detail `h1` font-size check on the selected legacy
    product detail URL.

## Completed Baseline Automation

- `operations/scripts/monorepo-baseline.mjs` records per-site inventory,
  routes, command results, public HTML, robots, sitemap, audit output, data
  samples, analytics-script detection, screenshots, and computed-style/layout
  checks.
- `.gitignore` excludes baseline and post-migration evidence output.
- `mayaobongro.vn/pnpm-workspace.yaml` and
  `mayaochaybo.vn/pnpm-workspace.yaml` now set `allowBuilds.sharp: true` so pnpm
  build/typecheck gates can run under pnpm 11.

## Next Phase Gate

Before Phase 1 root workspace changes:

- Keep the known baseline issues above as comparison context.
- Do not treat these current-state issues as monorepo regressions unless the
  post-migration result gets worse.
- Prefer fixing sitemap/canonical/product-contract issues in separate scoped
  tasks, not inside the mechanical root-workspace commit.

