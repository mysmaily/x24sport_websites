---
name: launch-or-complete-x24sport-tenant
description: >-
  Plan, design, populate, implement, validate, and launch a complete X24Sport
  Payload/Next.js tenant website. Use when the user asks to add or launch a new
  tenant/domain, finish an incomplete tenant, complete an entire website from UI
  through content, audit what remains before launch, or says “thêm tenant”,
  “hoàn thiện tenant”, “hoàn thiện website”, or equivalent. Enforce discovery,
  design and information-architecture proposals, approval gates, representative
  demos, tenant-scoped implementation, production validation, and a documented
  definition of done; do not use for isolated page, product, copy, image, or
  cosmetic changes.
---

# Launch or Complete an X24Sport Tenant

Own the whole website outcome. Do not interpret “complete the tenant” as a
request for one page, a renamed theme, a few placeholder records, or a list of
recommendations. Continue until every agreed scope item is implemented and
verified, or report a concrete external blocker.

## Load the operating context

1. Read the repository `AGENTS.md`, `PRODUCTION-DEPLOYMENT-RUNBOOK.md`,
   `PAYLOAD-REST-API-GUIDE.md`, and the target domain's `AGENTS.md` in full.
2. If this is a new domain, inspect two or three domain profiles only to learn
   the profile format and operational contract. Do not copy their visual design,
   taxonomy, content, or factual claims.
3. Use `$develop-x24sport-websites` for implementation and quality rules. Use
   `$ui-ux-pro-max` when proposing or evaluating a distinct visual system.
4. Read all three workflow references before proposing the plan:
   - [discovery-and-design.md](references/discovery-and-design.md)
   - [content-and-taxonomy.md](references/content-and-taxonomy.md)
   - [delivery-and-validation.md](references/delivery-and-validation.md)
5. Copy [tenant-completion-dossier.md](assets/tenant-completion-dossier.md) to a
   task-local working document when the project spans more than one turn. Keep it
   current throughout the work. Do not commit it unless the user wants a durable
   project brief.

## Establish the control model

- Identify one target tenant and canonical domain.
- Classify it as `new`, `incomplete`, or `rebuild`. For an incomplete tenant,
  preserve verified good work and inventory gaps before proposing replacements.
- Translate “complete” into an explicit scope matrix covering brand, page types,
  navigation, catalog, content, conversion paths, CMS records, SEO, responsive
  behavior, accessibility, performance, infrastructure, and operations.
- Label every item `existing/verified`, `existing/needs-work`, `missing`,
  `blocked-facts`, `approved`, `implemented`, or `verified`.
- Separate business facts supplied or verified by the user from assumptions.
  Never invent prices, addresses, policies, certifications, testimonials,
  inventory, delivery promises, or product specifications.
- Maintain a decision log. A later instruction supersedes an earlier decision;
  update the scope and affected acceptance criteria explicitly.
- Treat a stage as complete only when its required artifact and evidence exist.

## Run the gated workflow

### Phase 0 — Audit and brief

For an existing tenant, inspect the public site, rendered page states, CMS/API
records, repository implementation, tenant profile, routing, and production
health. For a new tenant, inspect the business inputs, required infrastructure,
and generic platform capabilities.

Ask one compact, prioritized batch of questions that materially affects the
result. Offer a recommended answer where useful. At minimum resolve:

- business role, target buyers, product/service scope, and primary conversion;
- brand assets, desired personality, visual references, and styles to avoid;
- canonical domain, tenant slug, launch target, and production authorization;
- real content/data available now and facts that still require the user;
- must-have page types, languages, catalog depth, and special functionality.

Do useful read-only audit work while waiting. Do not ask for information that can
be discovered safely from the repository, current site, CMS, or approved public
sources.

**Gate 0 artifact:** current-state audit, proposed project brief, explicit scope
matrix, known facts, missing facts, risks, and acceptance criteria. Obtain the
user's approval of the brief before irreversible infrastructure or broad content
work. If the user explicitly delegates decisions, record that delegation and use
the recommended option.

### Phase 1 — Propose the design system

Use the approved brief to produce one recommended visual direction and up to two
meaningfully different alternatives. Each direction must specify typography,
color, spacing/density, photography or illustration direction, component
character, motion, and how it serves the intended buyer. Avoid cosmetic variants
that differ only in color.

Recommend one direction with concrete reasoning. Show a visual concept or
high-fidelity representative composition whenever visual identity is material.
Do not implement the full site yet.

**Gate 1 artifact:** approved visual direction and design tokens, with rejected
alternatives recorded so they are not accidentally reintroduced.

### Phase 2 — Propose information architecture and content

In parallel with design refinement, propose the complete customer-facing
information system:

- top-level navigation and footer;
- product category tree, stable slugs, attributes, variants, and useful filters;
- required pages, category introductions, product-content model, posts/guides,
  policies, trust content, contact and quote/order journeys;
- internal-linking relationships, sitemap intent, and index/noindex policy;
- content source, factual owner, readiness, and migration/create/rewrite action.

Prefer buyer tasks and real catalog distinctions over keyword-shaped category
sprawl. Identify which taxonomy decisions are hard to reverse.

**Gate 2 artifact:** approved sitemap, navigation, taxonomy, CMS content model,
content inventory, and a factual-gap list. Never publish unresolved factual
placeholders.

### Phase 3 — Build and validate the demo

Create a representative, reviewable demo before full implementation. It must
cover the visual and data patterns needed to expose wrong decisions:

- homepage/header/footer;
- one populated category/catalog state;
- one representative product or service-detail state;
- the primary conversion/contact path;
- mobile and desktop viewport evidence.

Use isolated local fixtures or draft CMS records unless the user has approved
production mutation. Make the demo interactive when behavior is a design
decision. Present screenshots or a reachable preview plus a concise decision
list; do not ask the user to infer the design from code.

**Gate 3 artifact:** approved demo and a closed list of requested revisions.
Apply revisions and re-present affected states until approved.

### Phase 4 — Implement the complete approved scope

Turn the approved demo, taxonomy, and content plan into a page-by-page and
record-by-record execution plan. Then complete it, including all applicable:

1. tenant record, domains, Store Settings, scoped REST account/profile, proxy and
   routing prerequisites for a new tenant;
2. tenant shell, design tokens, responsive components, states, navigation,
   footer, search/filtering, forms, analytics hooks, and conversion paths;
3. category hierarchy, products, media, pages, posts, policies, metadata, and
   internal links using tenant-scoped, idempotent Payload operations;
4. technical SEO, structured data, sitemap/robots/canonicals, accessibility,
   performance, error/empty/loading states, and tenant isolation;
5. local checks, task-scoped commit/push, canonical deployment, cache behavior,
   and post-deploy verification unless the user requested local/review-only.

Do not stop after the easiest layer. Frontend without required content is not a
complete site; CMS records without a coherent rendered experience are not a
complete site. If business data is unavailable, complete all non-factual work,
keep affected records in draft, and present a precise input ledger.

For every content batch: dry-run, resolve tenant and relationships at runtime,
apply idempotently, verify the records, then verify public rendering after the
documented cache window. Do not reuse sibling numeric IDs or credentials.

### Phase 5 — Validate, audit, and close

Run the validation matrix in `references/delivery-and-validation.md`. Reopen any
failed item; do not downgrade it to a note merely to finish the task.

Compare the deployed result against the approved brief, design direction, demo,
sitemap, taxonomy, content inventory, and scope matrix. Test real journeys and
rendered output, not only source files or successful API responses.

**Gate 4 artifact:** final completion report with exact evidence, remaining
factual blockers, services/cache touched, deployment status, and residual risk.

## Enforce anti-superficial rules

- Do not claim completion from `typecheck`/`build` alone.
- Do not mark a page complete when its desktop state works but mobile, empty,
  error, keyboard, or content states remain untested.
- Do not create a homepage-only “website” when the agreed customer journey needs
  catalog, detail, trust, policy, and contact/order pages.
- Do not copy another tenant's design or content unless the user explicitly
  approved it as a source and tenant ownership/licensing permits it.
- Do not publish generic filler, internal process language, fake proof, or
  fabricated business facts.
- Do not silently narrow scope. Mark an item blocked with its exact missing input,
  complete everything independent of it, and ask for the smallest needed input.
- Do not leave discoveries only in chat. Update the dossier and implementation
  plan so later turns resume from evidence instead of rediscovery.
- Do not declare production-ready while critical-severity validation findings or
  broken primary journeys remain.

## Report progress and completion

During long work, report completed phase, current phase, decisions needed, and
new evidence. Do not repeatedly narrate unchanged status.

At handoff, lead with the outcome and report:

- domain, tenant, business scope, and approved launch state;
- page types, journeys, CMS records, taxonomy, and files completed;
- exact local, API, rendered-page, browser, production, and isolation evidence;
- commit/push/deployment and services/cache touched;
- any item still `blocked-facts`, why it could not be completed, and the exact
  user input required.

Use only `verified`, `implemented-not-deployed`, `draft`, or `blocked` for final
status. Never call a partially populated or unvalidated tenant complete.
