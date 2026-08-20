---
name: create-shop-tenant
description: >-
  Plan, build, populate, validate, and launch a complete brand/shop tenant from
  a blank or incomplete state. Use for a new tenant/domain, whole-shop rebuild,
  complete launch-readiness workflow, or first production setup. Do not use for
  isolated page, product, copy, image, or cosmetic changes.
---

# Create Shop Tenant

Own the complete approved shop outcome. A tenant is not complete because a
homepage exists or because CMS records were created. It is complete only when a
shopper can discover, understand, select, trust, and contact/order through the
approved journey, with factual content and fresh verification evidence.

## Mandatory inputs before starting

For a brand clone or new shop, ask for the basic operating facts before creating
source, records, credentials, or deployment config:

- brand display name, normalized tenant slug, and target repo/folder name using
  the `<brand-slug>-websites` suffix;
- primary domain, optional secondary domains, canonical host, CMS/admin domain,
  and static/media domain;
- hotline, email, address if public, social links, chat channel, and primary
  order/contact flow;
- primary brand color, secondary/accent colors, logo/favicon assets, typography
  preference, and any avoid-list for visual style;
- initial admin name, email, role, and whether an API/rest account is required;
- server targets, database, object storage/CDN, environment names, analytics,
  Telegram/chat integration, and mail/SMS providers if used;
- product/service scope, initial categories, sample products, policies, pricing
  or quote rules, delivery area, and any claims that need proof.

If a fact is unknown, record it as `blocked` or `draft`. Do not invent addresses,
prices, lead times, guarantees, testimonials, stock, payment methods, or
certifications.

## Workflow boundary

This is the sole orchestration skill for a whole-tenant request. Do not also
start `$update-shop-tenant` for the same outcome. For a bounded change to known
pages, components, routes, SEO, accessibility, performance, content, or CMS
records, route to `$update-shop-tenant` instead.

## Load context

1. Read root `AGENTS.md`, the target domain `AGENTS.md` when it exists,
   `PRODUCTION-DEPLOYMENT-RUNBOOK.md`, and `PAYLOAD-REST-API-GUIDE.md`.
2. Read these local creation references:
   - `references/discovery-and-design.md`
   - `references/content-and-taxonomy.md`
   - `references/delivery-and-validation.md`
   - `references/vietnam-market.md`
3. For material UI, Google, ecommerce, Next/Payload, or performance work, read
   the relevant file in `../update-shop-tenant/references/`.
4. Keep a task-local dossier based on
   `assets/tenant-completion-dossier.md`. Record content pillars, taxonomy
   decisions, facts, source/owner of public claims, approval evidence, and
   launch evidence. Commit the dossier only when the user wants a durable brief.
5. Load the bundled specialist skills when their pass begins:
   - `../content-strategy/SKILL.md`
   - `../site-architecture/SKILL.md`
   - `../programmatic-seo/SKILL.md`
   - `../web-design-guidelines/SKILL.md`
   These are part of the starter kit, not optional external dependencies. If an
   environment also exposes skills with the same names globally, prefer the
   bundled versions in this repository unless the user requests otherwise.

## Run the gated workflow

### Phase 0 - Audit, brief, and facts

Classify the shop as `new`, `incomplete`, or `rebuild`. Audit existing public
pages, CMS content, media, tenant isolation, operations, and representative
mobile/desktop states before proposing replacements.

Resolve only facts that change the strategy: products/services, target buyers
and geography, primary conversion, customization/quantity/size/delivery needs,
approved contacts, payment/order process, verified policies, brand assets, and
available product/media/content data.

Gate 0: approved brief, fact ledger, primary journey, market-fit avoid list,
scope matrix, and explicit acceptance criteria.

### Phase 1 - Commerce design direction

Propose one recommended visual direction and up to two genuinely distinct
alternatives. Each direction should specify tokens, typography, product/lifestyle
imagery, density, component states, trust presentation, mobile adaptation,
motion, and fit for the buyer.

Normal catalog, product, quote, filter, and form UI must be compact and
scan-first. Large type, decorative overlap, broad empty space, image-overlay
copy, and unusual navigation need a page-specific reason plus a tested mobile
fallback.

Gate 1: approved visual direction, tokens, copy/style rules, and avoid list.

### Phase 2 - Content strategy, IA, and taxonomy

Run the bundled `content-strategy` pass first, then the bundled
`site-architecture` pass. Produce content pillars, buyer-stage clusters,
navigation, category tree, attributes/filters, variants, use-case landings,
guides/posts, policy/trust pages, contact/order path, and an inventory for every
planned URL or record.

Category means durable product family; filter means cross-cutting narrowing
attribute; variant means purchasable/configurable product form; guide means
education. Do not turn every SEO phrase into an indexable category.

Run a mandatory `programmatic-seo` assessment for scalable page families. Only
approve generated/indexable page sets when there is a repeating search intent,
enough unique source data, a useful page template, bounded crawl/index policy,
and owner approval. Otherwise record the pSEO decision as `not applicable` or
`deferred`, with the reason.

Gate 2: approved pillars, sitemap/IA, taxonomy, inventory, CMS model,
indexation policy, pSEO decision, and factual-gap ledger.

### Phase 3 - Representative demo

Build a reviewable demo using real or clearly labelled draft data. Include the
homepage/header/footer, a populated category with filters, a product detail page,
and the primary quote/order/contact journey at 390x844 and 1440x900. Test long
Vietnamese names, price/quote states, two-line CTA labels, error states, and
mobile touch interactions.

Gate 3: user-approved demo, screenshots, and closed revision list.

### Phase 4 - Implement, populate, and launch

Implement the approved tenant shell and interactions, then apply the CMS plan in
tenant-scoped, idempotent batches. Resolve tenant and relationships at runtime;
upload media before relating it; keep missing-fact content as drafts; verify
each batch's ownership, public rendering, and sibling isolation after the
documented cache interval. Follow the production runbook for deployment.

Complete all approved relevant layers: tenant/domain/settings, navigation and
components, category/product/media content, guides and trust/policy content,
conversion paths, metadata/structured data/sitemap/robots, accessibility,
performance, analytics if configured, and operations.

### Phase 5 - Validate and close

Run the bundled `web-design-guidelines` pass for changed UI files, then run the
delivery-and-validation matrix plus market checks. Reopen every critical or high
finding and re-test fresh post-fix output. Report only `verified`,
`implemented-not-deployed`, `draft`, or `blocked`; never call a partly populated
or unvalidated tenant complete.

## Completion report

State the domain/tenant, business scope, market fit, approved pillars and
taxonomy, pages/CMS records/files changed, exact source/API/browser/production
evidence, viewport conditions, cache/services touched, commit/push/deployment,
and every remaining blocked fact with its owner. Separate verified evidence from
inference.
