# Cloudflare redirect: x24sport.com to x24sport.vn

Applied on 2026-07-20 (Asia/Ho_Chi_Minh).

## Scope

- Added one zone-level `http_request_dynamic_redirect` ruleset.
- Redirects `x24sport.com` and `www.x24sport.com` to `https://x24sport.vn`.
- Preserves the request path and query string.
- Uses HTTP status `301`.
- Disabled Cloudflare Managed `robots.txt` for this parked zone because it intercepted
  `/robots.txt` before the redirect rule. No other Bot Management value changed.
- DNS records, SSL, cache settings, the WordPress origin, and the destination site were
  not modified.

## Backups and responses

- `backups/zone-before-global-key.json`
- `backups/dns-records-before.json`
- `backups/dynamic-redirect-entrypoint-before.json`
- `backups/rulesets-list-before.json`
- `backups/bot-management-before.json`
- `responses/create-dynamic-redirect.json`
- `responses/dynamic-redirect-entrypoint-after.json`
- `responses/bot-management-after.json`

The pre-change dynamic redirect endpoint returned Cloudflare error `10003`, confirming
that no entrypoint ruleset existed before this operation.

## Verification

Verified apex and `www` over HTTP and HTTPS. Root, nested paths, query strings,
`/robots.txt`, and `/sitemap.xml` return `301` to the matching `x24sport.vn` URL.
Following the redirects for root, robots, and sitemap returns `200` from
`x24sport.vn`.

## Rollback

1. Delete the ruleset whose ID is recorded in
   `responses/create-dynamic-redirect.json` using the Cloudflare zone Rulesets API.
2. Restore the complete Bot Management state recorded in
   `backups/bot-management-before.json` (in particular,
   `is_robots_txt_managed: true`).
3. Re-run the HTTP/HTTPS checks for apex, `www`, `/robots.txt`, and `/sitemap.xml`.

Cloudflare credentials are intentionally not stored in this operation directory.
