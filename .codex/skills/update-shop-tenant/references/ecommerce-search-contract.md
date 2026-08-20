# Ecommerce search and data contract

Use this reference for category filters, pagination, search results, product
variants, structured commerce data, policies, sitemaps, or Merchant Center work.

## Contents

1. URL classification
2. Faceted navigation
3. Product discovery
4. Commerce-data consistency
5. Product variants
6. Shipping and returns
7. Verification
8. Official sources

## 1. URL classification

Classify each generated URL before implementation:

| URL class | Default treatment |
|---|---|
| Unique category or curated filter landing page with real shopper value | Indexable, crawlable links, self-canonical, sitemap eligible |
| Pagination | Unique URL, sequential crawlable links, self-canonical |
| Temporary UX filter or alternate sort | Not sitemap eligible; control crawl/index deliberately |
| Combinatorial or duplicate filter state | Prevent URL explosion and normalize equivalent states |
| Internal search result | Do not use as the only discovery path to products |
| Product or real variant URL | Index only when content, offer, identity, and canonical policy support it |

Do not infer indexability from the existence of a route. Record the intended
canonical, robots behavior, link policy, sitemap inclusion, and user value.

## 2. Faceted navigation

- Prefer a finite set of curated, crawlable landing pages for filters that satisfy
  a genuine browsing or search need.
- Prevent unwanted filters, sort orders, repeated parameters, and parameter-order
  permutations from generating an unbounded crawl space.
- Use standard `&` parameter separators. If filters are encoded in the path, keep
  a stable logical order and reject duplicates.
- Use `robots.txt` only as crawl control. A blocked URL cannot reliably expose a
  page-level `noindex` directive to Google.
- Treat canonical as a consolidation hint, not a guaranteed crawl-control tool.
- If links to non-indexable facet URLs remain, apply one consistent link and crawl
  policy across every place that emits them.
- Never block the canonical category, product resources, or assets required to
  render indexable content.

## 3. Product discovery

- Link every intended indexable product from a crawlable hierarchy whenever
  practical: home to category, category to subcategory or curated landing page,
  then product.
- Googlebot generally does not submit search forms or click action-only load-more
  controls. Back incremental UI with crawlable paginated URLs.
- Include canonical indexable products in the correct tenant sitemap or Merchant
  Center feed when crawling alone cannot guarantee discovery.
- Keep tenant domains, canonicals, sitemap URLs, and product ownership isolated.

## 4. Commerce-data consistency

Treat this as one contract:

`Payload -> visible page -> JSON-LD -> sitemap -> Merchant Center -> order flow`

Resolve and compare, when applicable:

- tenant ownership, stable product ID, SKU, parent group, and variant ID;
- title, description, brand, color, size, material, and customization facts;
- public URL, canonical URL, primary image, and variant image;
- current price, original price, currency, promotion validity, and availability;
- shipping cost/time, return policy, and actual ordering behavior.

Payload is the application source of truth, but public claims are not valid merely
because a field exists. Only expose reviewed operational facts. Update dependent
surfaces together or publish a draft until they can agree.

Structured data and a Merchant Center feed complement each other. For frequently
changing price or stock, prefer an appropriately refreshed feed/API rather than
waiting only for recrawling. When feed automation is in scope, support automatic
item updates where appropriate and monitor mismatches.

## 5. Product variants

- Use `ProductGroup` and `Product` variants only for real selectable variants with
  stable identity and factual offers.
- Keep `productGroupID`, `variesBy`, variant identifiers, URLs, images, price, and
  availability synchronized with visible selectors and Merchant Center data.
- Choose one URL strategy deliberately: a single canonical group page with
  selectable variants, or stable variant URLs that expose their state without
  requiring interaction. Do not emit contradictory canonical and variant links.
- Do not create thin indexable URLs for every size/color combination unless each
  URL provides a stable, useful, accurately represented offer.

## 6. Shipping and returns

- Put a tenant-wide policy on the visible policy page and describe it under the
  tenant's factual `OnlineStore` or suitable `Organization` entity.
- Use organization-level `ShippingService` for the standard policy when supported
  by current Google documentation. Use offer-level shipping only for a product
  override or when no general policy applies.
- Keep return policy markup synchronized with the visible policy and operational
  behavior. Never infer regions, fees, time windows, or eligibility.
- Record the precedence of the active sources. Product-level policy overrides a
  general organization policy; Google states that Search Console shipping and
  return settings can take precedence over on-site structured data.
- Do not duplicate conflicting policy entities across the tenant.

## 7. Verification

- Inspect rendered mobile and desktop HTML for title, canonical, robots, links,
  pagination, product facts, and JSON-LD.
- Crawl representative category, facet, pagination, product, and variant URLs;
  verify status codes, canonical targets, sitemap membership, and tenant host.
- Confirm that non-indexable URL classes cannot expand without a bounded policy.
- Parse JSON-LD and test representative supported types in Rich Results Test.
- Compare visible facts, Payload records, JSON-LD, feed output, and order behavior.
- Use URL Inspection when connected access exists, but do not present technical
  eligibility as guaranteed indexing or rich-result display.

## 8. Official sources

- [Ecommerce SEO](https://developers.google.com/search/docs/specialty/ecommerce)
- [Ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)
- [Pagination and incremental loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Managing faceted navigation](https://developers.google.com/crawling/docs/faceted-navigation)
- [Share product data with Google](https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google)
- [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Merchant shipping policy](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy)
- [Merchant return policy](https://developers.google.com/search/docs/appearance/structured-data/return-policy)
- [Shipping and returns in Search Console or structured data](https://developers.google.com/search/blog/2025/11/more-ways-to-share-shipping)
