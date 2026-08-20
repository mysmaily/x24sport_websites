---
name: launch-or-complete-x24sport-tenant-v2
description: >-
  Plan, organize, build, populate, validate, and launch a complete X24Sport
  Payload/Next.js tenant for the Vietnamese market. Use for a new tenant/domain
  or a whole-tenant completion or rebuild. It coordinates content strategy,
  information architecture, optional programmatic SEO, compact commerce UI, and
  production validation. Do not use for an isolated page, product, copy, image,
  or cosmetic change.
---

# Launch or Complete an X24Sport Tenant v2

Own the complete approved tenant outcome. A tenant is not complete because a
homepage looks presentable or because records exist in the CMS. It is complete
only when a Vietnamese shopper can discover, understand, select, trust, and
contact/order through the approved journey, with factual content and fresh
verification evidence.

## Workflow boundary

This is the sole orchestration skill for a whole-tenant request. Do not also
start `develop-x24sport-websites`; consume its relevant references directly.
For a bounded change, route to the repository guidance and the narrower
workflow instead.

## Load context

1. Read the root `AGENTS.md`, target domain `AGENTS.md`,
   `PRODUCTION-DEPLOYMENT-RUNBOOK.md`, and `PAYLOAD-REST-API-GUIDE.md`.
2. Read these v1 references, which remain the platform authority:
   - `../launch-or-complete-x24sport-tenant/references/discovery-and-design.md`
   - `../launch-or-complete-x24sport-tenant/references/content-and-taxonomy.md`
   - `../launch-or-complete-x24sport-tenant/references/delivery-and-validation.md`
3. Read [Vietnam market requirements](references/vietnam-market.md) before
   proposing design, taxonomy, or copy.
4. Read the following only when relevant:
   - content/topic planning: `content-strategy`;
   - navigation, hierarchy, URLs, breadcrumbs, and internal links:
     `site-architecture`;
   - data-backed, repeatable landing-page families: `programmatic-seo`;
   - material UI work: `web-design-guidelines` and
     `../develop-x24sport-websites/references/quality-gates.md`;
   - Google, commerce, Next/Payload, or performance work: the matching
     reference in `../develop-x24sport-websites/references/`.
5. Keep a task-local dossier based on
   `../launch-or-complete-x24sport-tenant/assets/tenant-completion-dossier.md`.
   Record the content pillars, taxonomy decisions, Vietnamese-market facts,
   source/owner of every public claim, and approval evidence. Do not commit it
   unless the user requests a durable brief.

## Skill coordination rules

Use skills as sequential specialist passes, not competing style prompts:

1. **`content-strategy` — what to say:** identify buyer segments, jobs to be
   done, 3–5 content pillars, topic clusters, buyer stage, content purpose, and
   factual source. For ecommerce, start with buyer decisions and real catalog
   distinctions—not a generic blog calendar.
2. **`site-architecture` — where it belongs:** turn the approved pillars into
   navigation, a category/attribute/variant model, stable Vietnamese-friendly
   ASCII slugs, page hierarchy, breadcrumbs, and internal links. A keyword does
   not automatically deserve a category or menu item.
3. **`programmatic-seo` — only at proven scale:** use only after a repeating
   search intent, sufficient unique source data, a page-quality template, and
   indexation policy are approved. Never use it to mass-create thin locality,
   colour, audience, or keyword permutations.
4. **Visual QA — prove the result:** `web-design-guidelines` audits changed UI
   files; browser screenshots and interaction tests validate the rendered page.
   Neither replaces the other. Do not layer landing-page aesthetic skills over
   normal commerce UI.

Repository/domain rules take priority if any generic skill conflicts with the
tenant, factual-data, compact-commerce, or Vietnamese-market requirements.

## Run the gated workflow

### Phase 0 — Audit, market brief, and facts

Classify the tenant as `new`, `incomplete`, or `rebuild`; audit existing public
pages, CMS content, media, tenant isolation, operations, and representative
mobile/desktop states before proposing replacements.

Resolve only facts that change the strategy: products/services, target buyers
and geography, primary conversion, customization/quantity/size/delivery needs,
approved contacts, payment/order process, verified policies, brand assets, and
available product/media/content data. Distinguish a supported Vietnam-wide
service from a local claim. Do not invent addresses, lead times, guarantees,
prices, stock, payment methods, testimonials, or certifications.

**Gate 0:** approved brief, fact ledger, primary journey, Vietnamese-market
fit/avoid list, scope matrix, and explicit acceptance criteria.

### Phase 1 — Design system for Vietnamese commerce

Propose one recommended direction and up to two genuinely distinct alternatives.
Each specifies tokens, typography, product/lifestyle imagery, density, component
states, trust presentation, mobile adaptation, motion, and its fit for the
approved buyer. Use Vietnamese copy representative of actual page lengths.

Normal catalog, product, quote, filter, and form UI must be compact and
scan-first. Large type, decorative overlap, broad empty space, image-overlay
copy, and exotic navigation need a page-specific reason plus a tested mobile
fallback. Explicit foreground/background states are required for every CTA and
coloured control.

**Gate 1:** approved visual direction, tokens, Vietnamese copy/style rules, and
an explicit avoid list.

### Phase 2 — Content strategy, IA, and taxonomy

Run `content-strategy` then `site-architecture` before creating records. Produce:

- content pillars and buyer-stage clusters, each tied to a shopper question,
  conversion path, factual source, and owner;
- top navigation, footer, category tree, attributes/filters, variants,
  use-case/audience landings, guides/posts, policy/trust pages, and contact or
  ordering path;
- an inventory for every page/record: URL, purpose, audience task, content
  outline, media, CTA, related links, status, factual gaps, and index policy;
- internal links and redirect/migration mapping; identify duplicate concepts,
  empty categories, orphan products, cannibalization, and irreversible slugs.

Category = durable product family; filter = cross-cutting narrowing attribute;
variant = purchasable/configurable product form; guide = education. Do not turn
every SEO phrase into an indexable category. Consider programmatic SEO only via
the activation criteria above.

**Gate 2:** approved content pillars, sitemap/IA, taxonomy, inventory, CMS
model, indexation policy, and factual-gap ledger.

### Phase 3 — Representative, local-market demo

Build a reviewable demo using real or clearly labelled draft data. Include the
homepage/header/footer, a populated category with filters, a detail page, and
the primary quote/order/contact journey at 390x844 and 1440x900. Test Vietnamese
long product names, price/quote states, two-line CTA labels, error states, and
mobile touch interactions. Demonstrate only verified trust/contact/policy facts.

Run the visual quality gate. A screenshot containing text collisions, clipped
controls, unreadable contrast, hidden CTA, accidental whitespace, or horizontal
overflow fails the gate even if source checks pass.

**Gate 3:** user-approved demo, screenshots, and a closed revision list.

### Phase 4 — Implement, populate, and launch

Implement the approved tenant shell and interactions, then apply the approved
CMS plan in tenant-scoped, idempotent batches. Resolve tenant and relationships
at runtime; upload media before relating it; keep missing-fact content as drafts;
verify each batch's ownership, public rendering, and sibling isolation after the
documented cache interval. Follow the production runbook for code deployment.

Complete all approved relevant layers: tenant/domain/settings, navigation and
components, category/product/media content, guides and trust/policy content,
conversion paths, metadata/structured data/sitemap/robots, accessibility,
performance, analytics if configured, and operations.

### Phase 5 — Validate and close

Run the delivery-and-validation matrix plus the Vietnamese market checks. Reopen
every critical or high finding and re-test fresh post-fix output. Report only
`verified`, `implemented-not-deployed`, `draft`, or `blocked`; never call a
partly populated or unvalidated tenant complete.

## Completion report

State the domain/tenant, business scope, market fit, approved pillars and
taxonomy, pages/CMS records/files changed, exact source/API/browser/production
evidence, viewport conditions, cache/services touched, commit/push/deployment,
and every remaining blocked fact with its owner. Separate verified evidence from
inference.
