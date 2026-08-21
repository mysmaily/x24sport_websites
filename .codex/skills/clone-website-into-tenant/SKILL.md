---
name: clone-website-into-tenant
description: >-
  Recreate the visual language, layout, and interaction patterns of a reference
  website inside an X24Sport tenant override. Use when the user wants to clone,
  migrate, borrow, or adapt only the interface of a website into a tenant, while
  preserving this platform's Payload CMS, ecommerce components, tenant
  isolation, and deployment workflow.
---

# Clone Website Into Tenant

Create a native X24Sport tenant implementation inspired by a reference site.
This skill is for interface migration only: visual structure, spacing, type,
colors, imagery direction, sections, motion, and interaction behavior. It is not
permission to impersonate another brand, scrape private data, copy protected
copy, clone checkout/accounts, or replace the multi-tenant platform with a
standalone app.

## Boundaries

- If the user owns the reference site or asks to migrate their old site, preserve
  the useful visual and content structure, then map content into Payload and
  tenant code.
- If the reference site belongs to a third party, use it as inspiration. Do not
  reuse logos, trademarks, proprietary copy, unique illustrations, customer
  reviews, claims, prices, policies, photos, or brand assets unless the user
  explicitly provides rights to those assets.
- Do not import a website-cloner template directly into `cms-frontend/`. Use
  external clone tools only in a scratch workspace for reconnaissance, specs, or
  throwaway comparison output.
- Do not create a generic Next.js app for production. Production work belongs in
  the existing tenant architecture.

## Required Context

1. Read root `AGENTS.md`.
2. Read the target domain profile at `<domain>/AGENTS.md` when it exists.
3. If the task is a whole-tenant creation, completion, or launch, stop and use
   `$create-shop-tenant` as the orchestrating workflow instead.
4. For bounded implementation on an existing tenant, combine this skill with
   `$update-shop-tenant`; this skill governs the reference-site translation, and
   `$update-shop-tenant` governs the ecommerce, SEO, accessibility, verification,
   commit, and deployment gates.
5. For material customer-facing UI changes, run `$web-design-guidelines` after
   implementation and fix relevant findings.

## Inputs To Establish

Identify these before building. Infer reasonable defaults when low risk, but ask
when rights, target, or scope are ambiguous:

- Target domain and tenant slug.
- Reference URL or supplied screenshots.
- Intended scope: homepage, landing page, category page, product detail, shared
  header/footer, or a specific component.
- Whether the user owns the reference site or only wants visual inspiration.
- Which elements must be preserved exactly, approximated, Vietnamese-localized,
  or replaced with X24Sport commerce content.

## Reconnaissance

Capture only the information needed to rebuild the requested scope:

- Desktop and mobile screenshots, at minimum 1440x900 and 390x844.
- Section order, navigation structure, calls to action, form behavior, hover and
  focus states, scroll behavior, and responsive breakpoints.
- Computed design tokens: fonts, sizes, line heights, color palette, radii,
  shadows, spacing rhythm, grid widths, and media aspect ratios.
- Reusable patterns: header, footer, hero, product/category cards, trust blocks,
  testimonials, FAQ, contact/order surfaces, banners, and filters.
- Assets that are allowed to reuse. Otherwise record only the asset role and
  visual direction so replacement media can be sourced, generated, or pulled from
  the tenant's CMS.

Browser automation, screenshots, Playwright, or an external cloner template may
be used for research. Keep generated scratch output outside the production app
unless individual findings are intentionally ported.

## Translation Rules

- Implement inside `cms-frontend/`, normally under
  `src/app/[tenant]/_<tenant-slug>/` for tenant-specific routes and CSS.
- Use shared product, category, gallery, contact, metadata, and CMS data
  components where they already match the required behavior.
- Preserve tenant identity from Payload and domain resolution. Never choose the
  tenant from query params, hard-code numeric tenant IDs, or remove tenant
  filters from data access.
- Convert reference copy into shopper-facing Vietnamese copy for the target
  business unless the user supplies approved text.
- Use the reference site's structure to guide hierarchy, not to override
  X24Sport commerce rules. Catalogs must show products early, filters must stay
  compact and crawlable, and product details must keep the shared gallery and
  restrained product-title sizing.
- Replace third-party brand assets with tenant-owned assets, neutral placeholders
  only during local drafts, or generated/original media that matches the desired
  direction.
- Keep links crawlable with `<a href>` for navigation. Buttons perform actions.
- Keep the first viewport useful on mobile and desktop. Do not create a
  marketing-only landing page when the requested result is a shop, catalog, or
  product experience.

## Implementation Flow

1. Map reference sections to tenant-native page sections and data sources.
2. Sketch a short component plan: files to touch, shared components to reuse,
   tenant-specific components to add, and visual tokens to adjust.
3. Build the narrowest implementation that achieves the requested visual match.
4. Add only necessary client components for real interactions such as menus,
   galleries, filters, sliders, or forms.
5. Validate responsive behavior and text fit, especially Vietnamese product
   names, prices, badges, and CTA labels.
6. Run the appropriate checks for `cms-frontend`, including typecheck and build
   for code changes unless the user requested analysis only.
7. Visually inspect fresh screenshots at 390x844 and 1440x900, and test any
   breakpoint or interaction copied from the reference site.
8. Commit, push, and deploy by default for verified code work unless the user
   requests local-only, review-only, no push, or no deployment.

## Deliverable Standard

The finished tenant should feel like the target brand using a similar visual
system, not like a pasted clone. Report:

- Target domain and scoped pages/components.
- Reference URL and whether the result is a rights-preserving migration or an
  inspiration-based adaptation.
- Files and CMS records changed.
- What visual traits were reproduced and what was intentionally replaced.
- Verification evidence: checks run, build result, screenshots/viewports,
  browser console or interaction checks, and deployment status.
- Any remaining rights, content, asset, or factual-review risks.
