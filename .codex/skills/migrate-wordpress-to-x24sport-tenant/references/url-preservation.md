# URL Preservation Contract

## Governing rule

For a same-domain WordPress-to-Next.js migration, keep the public URL contract
unchanged wherever the route can be reproduced. The new application serves that
path directly with `200`. A redirect is not preservation when the original path
could have remained valid.

This follows Google's guidance to use consistent, stable URLs in internal links,
sitemaps, and canonicals. Site-move guidance is a fallback for paths that truly
change, not a reason to redesign URLs during a platform migration.

Official references:

- [Google: Ecommerce URL structure](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites)
- [Google: Change hosting with no URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes)
- [Google: Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google: Redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google: Ecommerce navigation](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)

## Manifest model

Create one immutable source URL manifest and a reviewed target contract with at
least these columns:

| Field | Meaning |
|---|---|
| `source_url` | Exact accepted public URL, including encoded path |
| `path` | Exact path and trailing-slash form |
| `query_class` | Meaningful query behavior or ignored tracking class |
| `content_type` | Product, term, page, post, media, feed, search, system |
| `source_id` | Stable WordPress identity |
| `slug` | Original WordPress slug, unmodified |
| `status` | Published, draft, private, trashed, redirected, gone |
| `canonical` | Current canonical target |
| `indexability` | Current robots/index state |
| `target_action` | `direct`, `redirect`, `gone`, or `retain-noindex` |
| `target_url` | Exact final target |
| `reason` | Required for every non-direct action |
| `evidence_source` | DB, REST, sitemap, link graph, log, Search Console |

Do not infer complete coverage from a sitemap. Discover URLs from all available
sources, then deduplicate by normalized host plus exact path/query policy.

## Direct-route rules

- Preserve scheme and canonical host (`https://mayaobongro.vn`).
- Preserve product full paths. A product currently at `/<slug>/` remains there;
  do not move it to `/san-pham/<slug>/` merely to match a new template.
- Preserve category, tag, page, post, pagination, feed, search, and attachment
  behavior when they are accepted public routes.
- Preserve trailing slash and percent encoding behavior after measuring the live
  site. Configure Next.js consistently and test both variants.
- Preserve old media URLs by serving the legacy path or by an exact one-to-one
  media mapping. Never assume a filename-only prefix rewrite is lossless.
- Store full `legacyPath` separately from `slug`; a slug alone cannot represent
  nested paths, taxonomy bases, locale, or collisions.
- Reserve all static and operational paths before enabling a root dynamic route.
  Fail the build/import on a route collision.
- Generate internal links, sitemap entries, breadcrumbs, schema URLs, hreflang
  where applicable, and canonical tags from the same route registry.

## Redirect rules

- Redirect only reviewed exceptions that cannot be served at the same path or
  intentional legacy duplicates being consolidated.
- Use server-side `301` or `308`, one hop, old URL to the closest equivalent final
  URL. Keep query parameters only where they remain meaningful.
- No redirect chains, loops, soft 404s, blanket homepage redirects, or mass
  redirects to a category.
- Removed content with no equivalent should return a useful `404` or explicit
  `410`; do not fabricate relevance.
- Keep redirect records tenant-scoped, test collision order, and make them
  observable in logs.

## Verification contract

For every manifest row verify:

1. exact response status and redirect count;
2. final path, host, HTTPS, and trailing slash;
3. self-canonical for direct indexable pages;
4. expected robots state and no staging `noindex` after launch;
5. correct content type and source identity;
6. crawlable internal links using real `<a href>` values;
7. inclusion/exclusion in the correct sitemap;
8. media and structured-data URLs resolve;
9. no cross-tenant route resolution.

Use `scripts/verify_url_contract.py` for HTTP/canonical/indexability checks, then
add semantic and browser checks for templates and business flows.

The verifier accepts CSV columns `path`, `expected_status`, optional
`expected_canonical`, optional `expected_location`, and optional `indexability`
(`index`, `noindex`, or `ignore`). Run it against an unpublished origin while
sending the production host header:

```bash
python3 scripts/verify_url_contract.py url-contract.csv \
  --base-url http://127.0.0.1:PORT \
  --host mayaobongro.vn
```
