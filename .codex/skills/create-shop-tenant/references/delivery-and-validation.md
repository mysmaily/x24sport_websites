# Delivery and Validation Reference

## Definition of done matrix

A tenant is complete only when all applicable rows pass or are explicitly out of
the approved scope.

| Area | Required evidence |
|---|---|
| Identity | tenant resolves by slug/domain; brand and Store Settings are correct |
| Information architecture | approved navigation, footer, taxonomy, URLs, redirects, and internal links render correctly |
| Core journeys | browse, filter/search, product/detail, consultation/order/contact, and policy/trust paths succeed |
| Content | approved inventory is populated; no unintended placeholders, thin drafts, false claims, or orphan records |
| Catalog | correct categories, variants/attributes, price states, media, and product reachability |
| Product view counting | every product-detail renderer mounts the shared tracker once with the current tenant and its own published product ID; a representative event increments `viewCount` once per session |
| Responsive UI | representative pages and interactive states checked at 390x844 and 1440x900, plus relevant extremes |
| Accessibility | semantic structure, keyboard, focus, labels/errors, contrast, zoom/reflow, touch targets, reduced motion |
| SEO | status, title, H1, description, canonical, robots, sitemap, crawlable links, image alt, and valid factual JSON-LD |
| Performance | no obvious regressions; LCP media, layout stability, font/image loading, client JS, and third parties checked |
| Reliability | loading, empty, error, unavailable, validation, and success states behave intentionally |
| Analytics | approved IDs/events are present and tested without inventing configuration |
| Tenant isolation | API queries, relationships, media ownership/sharing, and public host resolution cannot leak siblings |
| Operations | domain/proxy/SSL prerequisites, credential profile, health, logs, revalidation/cache, commit/push/deploy status |

## Required verification layers

### Local source

- Review diff and confirm only task-scoped files are staged.
- Run `pnpm typecheck` and `pnpm build` in `cms-frontend`.
- Run additional tests appropriate to touched CMS/schema code.
- Search changed customer-facing files for placeholder and internal-process
  language.

### CMS/API

- Authenticate using only the target tenant's scoped account.
- Resolve tenant and relationships at runtime.
- Verify uniqueness by stable identity and ownership for every mutated class.
- Verify media HTTP status, MIME type, dimensions, ownership or explicit share.
- Prove a sibling-tenant query exposes no sibling record.
- Post one representative product-view event from an allowed tenant origin and
  verify `201` plus a one-step `viewCount` increase. Repeat the same
  tenant/product/session payload and verify `200`, `recorded: false`, and no
  second increase.

### Rendered browser experience

- Inspect real rendered HTML and screenshots, not source assumptions.
- Test every core page type, primary journey, interactive state, navigation link,
  form outcome, console, and viewport in the approved matrix.
- Confirm category/product visibility after the documented cache interval.

### Search and commerce contract

- Confirm HTTP/redirects, title, H1, canonical, description, robots, sitemap,
  breadcrumbs, crawlable links, image alternatives, and JSON-LD.
- Confirm price, availability, variants, shipping/return facts, and visible copy
  agree wherever those facts are present.

### Production operations

- Follow `PRODUCTION-DEPLOYMENT-RUNBOOK.md` exactly for code deployments.
- Verify origin and public HTTP, container health, recent logs, and all sibling
  domains affected by shared code.
- Do not claim DNS, SSL, analytics, or external integrations passed unless they
  were actually observed.

## Severity and closure

- **Critical:** wrong tenant/data exposure, broken primary journey, false public
  facts, production unavailable, unusable mobile/keyboard flow. Must fix before
  completion.
- **High:** broken core page type, incorrect taxonomy/metadata, missing required
  content, major responsive/accessibility defect. Must fix before completion.
- **Medium:** important but non-blocking polish or edge case. Fix if in approved
  scope; otherwise report with evidence and owner.
- **Low:** optional enhancement outside the accepted outcome. Do not inflate it
  into a launch blocker.

Re-run affected checks after every fix. Final evidence must come from the fresh
post-fix state.

## Final report contract

Report verified URLs, viewport/device conditions, commands and outcomes, CMS
record types/counts or stable identities, cache wait, services touched, commit,
push, deployment, and unresolved factual inputs. Distinguish direct evidence
from inference. Never describe an unmeasured area as passed.
