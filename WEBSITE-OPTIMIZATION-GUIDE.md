# WordPress Website Optimization Criteria

> **Scope:** Loaded only for a managed website when the current request matches a
> guide-loading trigger defined in root `AGENTS.md`. Apply only the modules that
> match each site's actual stack (Nginx, Flatsome, WooCommerce, Yoast,
> Cloudflare or R2).
>
> **Configuration source:** Any domain, IP, path, credentials, container, cache zone,
> CDN, business data, and exceptions must come from `<DOMAIN>/AGENTS.md`; do not
> infer them from examples in this document.
>
> **Goal:** Improve availability, speed, Core Web Vitals, technical SEO, and
> security without causing regressions in business functions.

---

## Table of Contents

1. [Optimize Nginx](#1-optimize-nginx)
2. [Optimize WordPress functions.php](#2-optimize-wordpress-functionsphp)
3. [Autoptimize settings & configuration](#3-installation-autoptimize-configuration)
4. [Set Cache-Control for Cloudflare R2](#4-set-cache-control-for-cloudflare-r2)
5. [Configure Cloudflare Dashboard](#5-configure-cloudflare-dashboard)
6. [Auto-generate Yoast Focus Keywords](#6-auto-generate-yoast-focus-keywords)
7. [Checklist applied to new website](#7-checklist-applied-to-new-website)
8. [SEO criteria](#8-seo-criteria)
9. [Configure Cloudflare via API](#9-configure-cloudflare-via-api)
10. [Performance functions library](#10-library-performance-functions)
11. [Acceptance criteria](#11-acceptance-criteria)

## Required configuration variable

The agent must read and confirm the following values from the website profile
before using any command or snippet:

| Variable | Meaning |
|------|---------|
| `<DOMAIN>` | Domain does not include protocol |
| `<SITE_ROOT>` | Source WordPress on host |
| `<CONTAINER_SITE_ROOT>` | Source WordPress viewed from PHP container |
| `<NGINX_CONFIG>` | Site's Nginx configuration file |
| `<NGINX_CONTAINER>` / `<PHP_CONTAINER>` | Actual container name |
| `<PHP_FPM_UPSTREAM>` | PHP-FPM upstream used by Nginx |
| `<FASTCGI_CACHE_PATH>` / `<CACHE_ZONE>` | Cache path and cache zone of the site |
| `<TRUSTED_PROXY_CIDR>` | CIDR proxy is allowed to send real client IP |
| `<DB_HOST>` / `<DB_NAME>` / `<DB_USER>` / `<DB_PASS>` / `<DB_PREFIX>` | Database connection |
| `<CDN_DOMAIN>` / `<BUCKET_NAME>` | CDN and R2, if the website uses |
| `<R2_CONFIG>` / `<OPS_DIR>` | R2 credentials file and script folder are not public |
| `<WEB_USER>` / `<WEB_GROUP>` | Actual owner of PHP/WordPress files |
| `<AUTOPTIMIZE_VERSION>` | Version has been checked for compatibility before installing |

Do not run a command when the relevant placeholder has not been replaced with a verified value.

---

## 1. Optimize Nginx

### File location

Retrieved from `<NGINX_CONFIG>` in website profile.

```
<NGINX_CONFIG>
```

### Backup before editing
```bash
cp <NGINX_CONFIG> <NGINX_CONFIG>.bak.$(date +%Y%m%d)
```

### Sample Config (copy & rename site + cache zone)

```nginx
fastcgi_cache_path <FASTCGI_CACHE_PATH> levels=1:2 keys_zone=<CACHE_ZONE>:100m inactive=24h;

server {
    listen 80;
    server_name <DOMAIN>;

    root <CONTAINER_SITE_ROOT>;
    index index.php index.html;

    set $skip_cache 0;

    # POST requests and urls with a query string should always go to PHP
    if ($request_method = POST) {
        set $skip_cache 1;
    }
    if ($query_string != "") {
        set $skip_cache 1;
    }

    # Don't cache uris containing the following segments
    if ($request_uri ~* "/wp-admin/|/wp-login.php|/cart/|/checkout/|/my-account/|/wc-api/|/xmlrpc.php|wp-.*.php|/feed/|index.php|sitemap(_index)?.xml") {
        set $skip_cache 1;
    }

    # Don't use the cache for logged in users or recent commenters
    if ($http_cookie ~* "comment_author|wordpress_logged_in|wp-postpass|wordpress_no_cache|wordpress_test_cookie|woocommerce_items_in_cart|woocommerce_cart_hash|wp_woocommerce_session_") {
        set $skip_cache 1;
    }

    # Use X-Forwarded-For for real IP when behind proxy
    set_real_ip_from <TRUSTED_PROXY_CIDR>;
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;

    # ===== GZIP COMPRESSION =====
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/x-javascript
        application/json
        application/xml
        application/xml+rss
        application/rss+xml
        application/atom+xml
        image/svg+xml
        font/woff
        font/woff2
        application/vnd.ms-fontobject
        application/x-font-ttf;

    # ===== SECURITY HEADERS =====
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # ===== STATIC ASSETS — LONG CACHE + CACHE-CONTROL =====
    location ~* \.(jpg|jpeg|png|gif|webp|avif|ico|svg|css|js|woff|woff2|ttf|otf|eot)$ {
        expires 31536000s;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        log_not_found off;
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass <PHP_FPM_UPSTREAM>;

        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;

        fastcgi_cache <CACHE_ZONE>;
        fastcgi_cache_key "$scheme$request_method$host$request_uri";

        fastcgi_cache_bypass $skip_cache;
        fastcgi_no_cache $skip_cache;

        fastcgi_cache_valid 200 301 302 6h;
        fastcgi_cache_use_stale error timeout invalid_header updating http_500 http_503;
        fastcgi_cache_lock on;
        fastcgi_cache_revalidate on;
        fastcgi_cache_min_uses 1;
        fastcgi_param HTTPS on;
        fastcgi_param HTTP_X_FORWARDED_PROTO $http_x_forwarded_proto;
        add_header X-FastCGI-Cache $upstream_cache_status always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # ===== DISABLE XML-RPC (security) =====
    location = /xmlrpc.php {
        deny all;
        access_log off;
        log_not_found off;
    }

    # ===== HIDE SENSITIVE FILES =====
    location ~* /wp-config\.php|/\.git|/\.htaccess|/readme\.html|/wp-admin/install\.php {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### Important note
- **`<DOMAIN>`**: Domain does not have `https://`
- **`<CACHE_ZONE>`**: Private cache zone, not duplicated by other websites
- **`<TRUSTED_PROXY_CIDR>`**: Only declare truly trusted proxies
- **Cache zone must be UNIQUE** for each site — no duplicate names
- Only create cache paths after checking the container's mount and permissions

### Test & Reload
```bash
# Test config
docker exec <NGINX_CONTAINER> nginx -t

# Reload
docker exec <NGINX_CONTAINER> nginx -s reload

# Clear cache
docker exec <NGINX_CONTAINER> sh -c 'rm -rf <FASTCGI_CACHE_PATH>/*'
```

### Applicable criteria

| Category | Criteria |
|----------|----------|
| Compression | Enable gzip/Brotli once in the correct layer, response public has the appropriate `Content-Encoding` |
| Static cache | Only use `immutable` for assets that have a version/hash or a secure purge process |
| FastCGI cache | Bypass admin, login, cart, checkout, account, POST, sensitive queries and sessions WooCommerce |
| Security headers | Do not override stronger headers in proxy/Cloudflare; check on response public |
| XML-RPC | Only blocked when the site does not use XML-RPC dependency integration |
| Sensitive files | Public access must be denied |

---

## 2. Optimize WordPress functions.php

Only use this section if the website has a compatible child theme. `siteopt_` is the namespace
sample; The agent must check for collisions before using and keep the same namespace in
All site snippets.

### File location
```
<SITE_ROOT>/wp-content/themes/flatsome-child/functions.php
```

### Backup before editing
```bash
cp .../flatsome-child/functions.php .../flatsome-child/functions.php.bak.$(date +%Y%m%d)
```

### Reference Snippet

Do not add all by default. Select each snippet after checking the plugin/theme,
Measure the baseline and confirm functionality is not duplicated.

```php
// ============================================================
// PERFORMANCE OPTIMIZATIONS v2
// (Just add the part that doesn't exist — check for duplicate function names first)
// ============================================================

// 1. REMOVE UNNECESSARY WP HEAD TAGS
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wp_shortlink_wp_head');
remove_action('wp_head', 'rest_output_link_wp_head');
remove_action('wp_head', 'wp_oembed_add_discovery_links');
remove_action('wp_head', 'adjacent_posts_rel_link_wp_head');

// 2. REMOVE WP VERSION QUERY STRINGS FROM ASSETS
add_filter('style_loader_src', 'siteopt_perf_remove_version', 9999);
add_filter('script_loader_src', 'siteopt_perf_remove_version', 9999);
function siteopt_perf_remove_version($src) {
    if (strpos($src, 'ver=') !== false) {
        $src = remove_query_arg('ver', $src);
    }
    return $src;
}

// 3. DEFER ADDITIONAL RENDER-BLOCKING SCRIPTS
add_filter('script_loader_tag', 'siteopt_perf_defer_extra', 25, 3);
function siteopt_perf_defer_extra($tag, $handle, $src) {
    if (is_admin() || false !== strpos($tag, ' defer') || false !== strpos($tag, ' async')) {
        return $tag;
    }
    $extra_defer = array(
        'jquery-migrate',
        'jquery-blockui',
        'js-cookie',
        'wc-add-to-cart-variation',
        'wc-single-product',
        'zoom',
        'flexslider',
        'flatsome-js',
        'flatsome-masonry-js',
        'ux-core-js',
    );
    if (in_array($handle, $extra_defer, true)) {
        return str_replace('<script ', '<script defer ', $tag);
    }
    return $tag;
}

// 4. PRELOAD CRITICAL CSS
add_action('wp_head', 'siteopt_perf_preload_css', 1);
function siteopt_perf_preload_css() {
    echo '<link rel="preload" as="style" href="' . get_template_directory_uri() . '/assets/css/flatsome.css" />';
    echo "\n";
    echo '<link rel="preload" as="style" href="' . get_stylesheet_directory_uri() . '/style.css" />';
    echo "\n";
}

// 5. ADD HSTS HEADER (via PHP since nginx is behind Cloudflare)
add_action('send_headers', 'siteopt_perf_hsts_header');
function siteopt_perf_hsts_header() {
    if (is_ssl() || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        header('Strict-Transport-Security: max-age=31536000');
    }
}
```

Only add `includeSubDomains` or `preload` after verifying all subdomains support it.
Long-term HTTPS support and user approval are difficult to rollback.

### ⚠️ Important — Check for duplicate function names
Before adding code, check for existing functions:
```bash
grep '^function ' <SITE_ROOT>/wp-content/themes/flatsome-child/functions.php
```

If there is already a function with the same function, **don't add duplicates**. Shared snippets
defined only once in [Section 10](#10-library-performance-functions).

---

## 3. Install & configure Autoptimize

Optional modules. Do not install if hosting, theme, CDN or cache plugin already exists
minify/aggregate same resources. Activation via WP Admin or WP-CLI is preferred; only
Use database script when website records confirm that the above two methods are not available.

### Installation (without WP-CLI)
```bash
# 1. Download plugin
cd /tmp
wget 'https://downloads.wordpress.org/plugin/autoptimize.<AUTOPTIMIZE_VERSION>.zip' -O autoptimize.zip

# 2. Extract (unzip may not be installed — use Python)
python3 -c "import zipfile; zipfile.ZipFile('/tmp/autoptimize.zip').extractall('<SITE_ROOT>/wp-content/plugins/')"

# 3. Fix permissions
chown -R <WEB_USER>:<WEB_GROUP> <SITE_ROOT>/wp-content/plugins/autoptimize/
chmod -R 755 <SITE_ROOT>/wp-content/plugins/autoptimize/

# 4. Create cache dir
install -d -o <WEB_USER> -g <WEB_GROUP> -m 0755 <SITE_ROOT>/wp-content/cache/autoptimize/

# 5. Verify inside the container
docker exec <PHP_CONTAINER> ls <CONTAINER_SITE_ROOT>/wp-content/plugins/autoptimize/autoptimize.php
```

### Activate via database
Create a temporary PHP file and run it in the container:

```php
<?php
// Save to <SITE_ROOT>/activate_ao.php
// Run: docker exec <PHP_CONTAINER> php <CONTAINER_SITE_ROOT>/activate_ao.php
// Delete after completion: rm <SITE_ROOT>/activate_ao.php

// CHANGE: DB credentials of the corresponding website
$pdo = new PDO("mysql:host=<DB_HOST>;dbname=<DB_NAME>;charset=utf8mb4", "<DB_USER>", "<DB_PASS>");

// Activate plugin
$stmt = $pdo->query("SELECT option_value FROM <DB_PREFIX>options WHERE option_name = 'active_plugins'");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$plugins = unserialize($row['option_value']);
if (!in_array('autoptimize/autoptimize.php', $plugins)) {
    $plugins[] = 'autoptimize/autoptimize.php';
    $stmt = $pdo->prepare("UPDATE <DB_PREFIX>options SET option_value = ? WHERE option_name = 'active_plugins'");
    $stmt->execute([serialize($plugins)]);
    echo "Autoptimize ACTIVATED\n";
}

// Configure settings
$ao_settings = array(
    'autoptimize_html' => 'on',
    'autoptimize_html_keepcomments' => 'off',
    'autoptimize_js' => 'on',
    'autoptimize_js_aggregate' => 'on',
    'autoptimize_js_exclude' => 'jquery-core, jquery-migrate',
    'autoptimize_js_trycatch' => 'off',
    'autoptimize_js_justhead' => 'off',
    'autoptimize_js_forceinline' => 'off',
    'autoptimize_css' => 'on',
    'autoptimize_css_aggregate' => 'on',
    'autoptimize_css_justhead' => 'off',
    'autoptimize_css_defer' => 'on',
    'autoptimize_css_defer_inline' => 'on',
    'autoptimize_css_inline' => 'off',
    'autoptimize_css_datauris' => 'off',
    'autoptimize_css_nogooglefont' => 'off',
    'autoptimize_cache_nogzip' => 'on',
    'autoptimize_cdn_url' => '',
    'autoptimize_cache_size' => '512',
    'autoptimize_show_adv' => '1',
);

$stmt = $pdo->prepare("INSERT INTO <DB_PREFIX>options (option_name, option_value, autoload) VALUES ('autoptimize_settings', ?, 'yes') ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)");
$stmt->execute([serialize($ao_settings)]);
echo "Autoptimize settings configured\n";

// Delete yourself
unlink(__FILE__);
```

### Autoptimize acceptance criteria

- Record baseline before enabling: HTML transfer size, request count, LCP, CLS, INP and
console error.
- Clear Autoptimize cache and website cache after each configuration change.
- Home page, product, category, cart, checkout, login and form must work.
- Do not let CSS/JS be minified or defer twice in plugins, Nginx and Cloudflare.
- Only keep the configuration if the following measurement changes to be better than or equal to the baseline and otherwise
interface/functionality regression.

---

## 4. Set Cache-Control for Cloudflare R2

### Reason
R2 objects by default DO NOT have the `Cache-Control` header → Cloudflare does not cache images at the edge (`cf-cache-status: DYNAMIC`) → each image request goes to the R2 origin.

### Install s3cmd (only needed once on the server)
```bash
apt-get install -y s3cmd
```

### Configure s3cmd for R2

Create separate file `<R2_CONFIG>` for each account/bucket, permission `0600`; do not use
common default config file if websites have different credentials:
```ini
[default]
access_key = <R2_ACCESS_KEY>
secret_key = <R2_SECRET_KEY>
host_base = <ACCOUNT_ID>.r2.cloudflarestorage.com
host_bucket = <BUCKET_NAME>.<ACCOUNT_ID>.r2.cloudflarestorage.com
use_https = True
```

**Get R2 information from wp-config.php**:
```bash
grep 'ADVMO_CLOUDFLARE_R2' <SITE_ROOT>/wp-config.php
```

Or from database:
```sql
SELECT option_value FROM <DB_PREFIX>options WHERE option_name = 'acoofm_settings';
```

### Batch set Cache-Control for all objects

```bash
#!/bin/bash
# <OPS_DIR>/<DOMAIN>-r2-set-cache-control.sh
# How to run: nohup <OPS_DIR>/<DOMAIN>-r2-set-cache-control.sh &

BUCKET="s3://<BUCKET_NAME>"
CONFIG="<R2_CONFIG>"

echo "Start: $(date)"
s3cmd -c "$CONFIG" ls -r "$BUCKET" 2>/dev/null | grep -v "^$" | grep -v "DIR" | awk '{print $4}' | while read obj; do
    s3cmd -c "$CONFIG" modify --add-header="Cache-Control: public, max-age=31536000, immutable" "$obj" > /dev/null 2>&1
done
echo "Done: $(date)"
```

### Check
```bash
# Test 1 object
s3cmd -c <R2_CONFIG> modify --add-header="Cache-Control: public, max-age=31536000, immutable" s3://<BUCKET_NAME>/<OBJECT_KEY>

# Verify header
curl -sI "https://<CDN_DOMAIN>/<OBJECT_KEY>" | grep -i cache-control
```

### ⚠️ Note
- Cache-Control only helps **browser caching** (1 year)
- For **Cloudflare edge caching** to work, you need to create a Cache Rule (see section 5)
- Running time depends on the number of objects; try on an object, log and just run
batch after confirming the correct bucket.

---

## 5. Configure Cloudflare Dashboard

Only applies when `<DOMAIN>/AGENTS.md` confirms the website uses Cloudflare. Can be configured
view via Dashboard or API depending on the access provided.

### 5.1. Cache Rule for CDN images (FREE — BIGGEST Impact)

```
Cloudflare Dashboard → <DOMAIN> → Caching → Cache Rules → Create rule
```

| Field | Value |
|-------|-------|
| Rule name | Cache R2 CDN Images |
| If | `Hostname` equals `<CDN_DOMAIN>` |
| Then | `Eligible for cache` |
| Edge TTL | Override → `1 day` (86400 seconds) |

**Criteria**: first request can be `MISS`, repeat request must be `HIT`; real TTFB recording
before/after data instead of using a sample number.

### 5.2. Auto Minify (FREE)

```
Cloudflare → <DOMAIN> → Speed → Optimization → Content Optimization
```

Enable: ✅ JavaScript, ✅ CSS, ✅ HTML

### 5.3. Polish / modern image format (if supported by plan)

```
Cloudflare → <DOMAIN> → Speed → Optimization → Image Optimization
```

- Turn on **Polish** (Lossy or Lossless)
- Enable **WebP** conversion

**Criteria**: confirm actual format and transfer size on supported browser, same
time to check image quality.

### 5.4. Cache HTML (optional, high risk)

```
Cloudflare → <DOMAIN> → Rules → Cache Rules
```

| Field | Value |
|-------|-------|
| URL | `<DOMAIN>/*` |
| Setting | Cache Level = Cache Everything |

Do not enable site-wide HTML cache if there are no bypass rules for admin, preview, login,
cart, checkout, account, request has session and logged in user:
```
If: Cookie contains `wordpress_logged_in`
Then: Bypass cache
```

### 5.5. Brotli (FREE)

```
Cloudflare → <DOMAIN> → Speed → Optimization → Content Optimization
```

Enable: ✅ Brotli (usually enabled by default)

### 5.6. Always Use HTTPS (FREE)

```
Cloudflare → <DOMAIN> → SSL/TLS → Edge Certificates
```

Enable: ✅ Always Use HTTPS

**Effect**: Redirect HTTP → HTTPS, resolve duplicate content

### 5.7. HTTP/3 (FREE)

```
Cloudflare → <DOMAIN> → Network
```

Enable: ✅ HTTP/3 (with QUIC)

---

## 6. Auto-generate Yoast Focus Keywords

Optional module, only used when a website audit shows a lot of content lacking focus
keyword. keyword. Focus keywords are editorial support data in Yoast, not signals
live ratings; Do not run in bulk without backing up the database and approving the sample.

### Script PHP auto-generate

```php
<?php
// Save to <SITE_ROOT>/fix_focus_kw.php
// Run: docker exec <PHP_CONTAINER> php <CONTAINER_SITE_ROOT>/fix_focus_kw.php
// Delete when done

// CHANGED: DB credentials, table prefix and niche configuration
$pdo = new PDO("mysql:host=<DB_HOST>;dbname=<DB_NAME>;charset=utf8mb4", "<DB_USER>", "<DB_PASS>");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$productPrefix = '<PRIMARY_PRODUCT_TERM>';
$fillerPhrases = [
    '<FILLER_PHRASE_1>',
    '<FILLER_PHRASE_2>',
];

function cleanText($text) {
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = mb_strtolower($text, 'UTF-8');
    $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
    $text = preg_replace('/[^\w\s\-]/u', '', $text);
    if ($text === null) {
        $text = filter_var($text, FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_HIGH);
    }
    $text = preg_replace('/\s+/', ' ', trim($text));
    return $text;
}

function removeFiller($text) {
    global $fillerPhrases;
    foreach ($fillerPhrases as $filler) {
        $text = str_replace($filler, '', $text);
    }
    $text = preg_replace('/\s+/', ' ', trim($text));
    return $text;
}

function generateProductKeyword($title) {
    global $productPrefix;
    $title = cleanText($title);
    $title = preg_split('/\s+[-]\s+/', $title, 2)[0];
    $title = preg_split('/:\s/', $title, 2)[0];
    $title = removeFiller($title);
    $title = trim($title, ' -,');

    $stopwords = ['<LANGUAGE_STOPWORD_1>', '<LANGUAGE_STOPWORD_2>'];
    $words = explode(' ', $title);
    $result = '';
    $wordCount = 0;
    foreach ($words as $word) {
        $word = trim($word, ' -,');
        if ($word === '') continue;
        if (in_array($word, $stopwords) && $wordCount >= 3) continue;
        $test = $result === '' ? $word : $result . ' ' . $word;
        if (mb_strlen($test, 'UTF-8') > 42) break;
        $result = $test;
        $wordCount++;
        if ($wordCount >= 7) break;
    }

    $result = trim($result, ' -,');

    // Prefix must be approved according to the niche of the website before running.
    if ($productPrefix !== '' && strpos($result, $productPrefix) !== 0) {
        $result = trim($productPrefix . ' ' . $result);
    }

    $result = preg_replace('/\s+/', ' ', trim($result));
    if ($result === '') $result = $productPrefix;
    return $result;
}

function generatePostKeyword($title) {
    $title = cleanText($title);
    $title = preg_split('/\s+[-]\s+/', $title, 2)[0];
    $title = preg_split('/:\s/', $title, 2)[0];
    $title = trim($title, ' -,');

    $words = explode(' ', $title);
    if (count($words) > 7) {
        $words = array_slice($words, 0, 7);
        $title = implode(' ', $words);
    }

    if (mb_strlen($title, 'UTF-8') > 45) {
        $words = explode(' ', $title);
        $result = '';
        foreach ($words as $w) {
            $test = $result === '' ? $w : $result . ' ' . $w;
            if (mb_strlen($test, 'UTF-8') > 45) break;
            $result = $test;
        }
        $title = $result;
    }
    return trim($title);
}

// ===== HANDLING PRODUCTS =====
echo "=== PROCESSING PRODUCTS ===\n";
$stmt = $pdo->query("
    SELECT p.ID, p.post_title
    FROM <DB_PREFIX>posts p
    LEFT JOIN <DB_PREFIX>postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_yoast_wpseo_focuskw'
    WHERE p.post_status = 'publish' AND p.post_type = 'product'
    AND (pm.meta_value IS NULL OR pm.meta_value = '')
    ORDER BY p.ID
");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Products to process: " . count($products) . "\n";

$insertStmt = $pdo->prepare("INSERT INTO <DB_PREFIX>postmeta (post_id, meta_key, meta_value) VALUES (?, '_yoast_wpseo_focuskw', ?)");
$updated = 0;
foreach ($products as $product) {
    $keyword = generateProductKeyword($product['post_title']);
    $keyword = mb_convert_encoding($keyword, 'UTF-8', 'UTF-8');
    try {
        $insertStmt->execute([$product['ID'], $keyword]);
        $updated++;
    } catch (Exception $e) {
        echo "ERROR ID " . $product['ID'] . ": " . $e->getMessage() . "\n";
    }
}
echo "Products updated: $updated\n";

// ===== HANDLING POSTS =====
echo "\n=== PROCESSING POSTS ===\n";
$stmt = $pdo->query("
    SELECT p.ID, p.post_title
    FROM <DB_PREFIX>posts p
    LEFT JOIN <DB_PREFIX>postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_yoast_wpseo_focuskw'
    WHERE p.post_status = 'publish' AND p.post_type = 'post'
    AND (pm.meta_value IS NULL OR pm.meta_value = '')
    ORDER BY p.ID
");
$posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Posts to process: " . count($posts) . "\n";

foreach ($posts as $post) {
    $keyword = generatePostKeyword($post['post_title']);
    $keyword = mb_convert_encoding($keyword, 'UTF-8', 'UTF-8');
    try {
        $insertStmt->execute([$post['ID'], $keyword]);
    } catch (Exception $e) {
        echo "ERROR post ID " . $post['ID'] . ": " . $e->getMessage() . "\n";
    }
}

// ===== VERIFICATION =====
echo "\n=== VERIFICATION ===\n";
$stmt = $pdo->query("
    SELECT p.post_type,
           COUNT(*) as total,
           SUM(CASE WHEN pm.meta_value IS NOT NULL AND pm.meta_value != '' THEN 1 ELSE 0 END) as with_kw
    FROM <DB_PREFIX>posts p
    LEFT JOIN <DB_PREFIX>postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_yoast_wpseo_focuskw'
    WHERE p.post_status = 'publish' AND p.post_type IN ('post', 'product')
    GROUP BY p.post_type
");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $pct = $row['total'] > 0 ? round($row['with_kw'] / $row['total'] * 100) : 0;
    echo $row['post_type'] . ": " . $row['with_kw'] . "/" . $row['total'] . " ({$pct}%)\n";
}

// Delete yourself
unlink(__FILE__);
```

### How to use
```bash
# 1. Edit DB credentials in the script
# 2. Copy to site dir
cp fix_focus_kw.php <SITE_ROOT>/

# 3. Run in containers
docker exec <PHP_CONTAINER> php <CONTAINER_SITE_ROOT>/fix_focus_kw.php

# 4. The script deletes itself after completion

# 5. Clear cache
docker exec <NGINX_CONTAINER> sh -c 'rm -rf <FASTCGI_CACHE_PATH>/*'
```

### Required before running

- Backup records `_yoast_wpseo_focuskw`.
- Replace `$productPrefix` and `$fillerPhrases` with approved data for the niche.
- Replace all DB credentials and `<DB_PREFIX>` according to website profile.
- Run the dry-run version and only print keywords for a small sample, review it manually before allowing it
write all.
- Do not overwrite existing focus keywords; check case `total = 0` when calculating scale.

---

## 7. Checklist applied to new website

### Information to prepare
```
Website: _______________
Site root: _______________
Container site root: _______________
Nginx config: _______________
Nginx/PHP containers: _______________
FastCGI cache path/zone: _______________
Trusted proxy CIDR: _______________
DB Host: _______________
DB Name: _______________
DB User: _______________
DB Pass: _______________
DB Prefix: _______________
Ops directory: _______________
Web user/group: _______________
R2 Bucket: _______________
R2 config path: _______________
R2 Access Key: _______________
R2 Secret Key: _______________
CDN Domain: _______________
Cloudflare Account ID: _______________
```

### Step 1: Backup
```bash
# Backup nginx config
cp <NGINX_CONFIG> <NGINX_CONFIG>.bak

# Backup functions.php
cp <SITE_ROOT>/wp-content/themes/flatsome-child/functions.php <SITE_ROOT>/wp-content/themes/flatsome-child/functions.php.bak
```

### Step 2: Nginx (Section 1)
- [ ] Copy the sample config and replace all placeholders from the website profile
- [ ] Test: `docker exec <NGINX_CONTAINER> nginx -t`
- [ ] Reload: `docker exec <NGINX_CONTAINER> nginx -s reload`
- [ ] Verify: `curl -sI https://<DOMAIN>/ | grep -iE 'x-frame|content-encoding'`

### Step 3: functions.php (Section 2)
- [ ] Check existing functions: `grep '^function ' .../functions.php`
- [ ] Add optimized code to the end of the file (check not to have the same name)
- [ ] Clear cache: `docker exec <NGINX_CONTAINER> sh -c 'rm -rf <FASTCGI_CACHE_PATH>/*'`
- [ ] Verify: `curl -s https://<DOMAIN>/ | grep -c 'generator.*WordPress'` → right = 0

### Step 4: Autoptimize (Section 3)
- [ ] Download & extract plugin
- [ ] Create cache dir + fix permissions
- [ ] Activate qua PHP script
- [ ] Clear cache
- [ ] Verify: `curl -s https://<DOMAIN>/ | grep -c 'autoptimize'` → right > 0

### Step 5: R2 Cache-Control (Section 4)
- [ ] Configure s3cmd using `<R2_CONFIG>` separately, permission `0600`
- [ ] Test: `s3cmd -c <R2_CONFIG> ls s3://<BUCKET_NAME>/ | head -5`
- [ ] Run the batch reviewed from `<OPS_DIR>`
- [ ] Verify header on a real `<OBJECT_KEY>`

### Step 6: Cloudflare Dashboard (Section 5)
- [ ] Cache Rule for `<CDN_DOMAIN>` (eligible for cache, Edge TTL 1 day)
- [ ] Auto Minify (CSS + JS + HTML)
- [ ] Brotli (normally enabled)
- [ ] Always Use HTTPS
- [ ] Polish/modern image format (if supported by current plan)
- [ ] If HTML cache: verify full bypass for private/dynamic flows

### Step 7: Focus Keywords (Section 6) — option P2
- [ ] Confirm the content team actually uses focus keywords in the editorial process
- [ ] If running in batch: backup, dry-run, browse the sample and then write to the database
- [ ] Verify keyword quality according to sample; Do not use 100% coverage as an SEO KPI

### Step 8: Final verification
```bash
# Speed test
curl -s -o /dev/null -w "TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" https://<DOMAIN>/

# Security headers
curl -sI https://<DOMAIN>/ | grep -iE 'x-frame|x-content|referrer|permissions'

# Compression
curl -sI -H "Accept-Encoding: gzip, br" https://<DOMAIN>/ | grep -i content-encoding

# Cache status
curl -sI https://<DOMAIN>/ | grep -i x-fastcgi-cache

# No WP version
curl -s https://<DOMAIN>/ | grep -c 'generator.*WordPress'
```

---

## Baseline and result recording sample

Do not use another website's measurements as a target. Record the data of the website itself
processing, same URL, viewport, cache state, tool and measurement time:

| Index | Baseline | After the change | Evidence |
|--------|----------|--------------|------------|
| HTTP status/redirect | | | |
| TTFB cold/warm | | | |
| LCP / CLS / INP | | | |
| Transfer size / request count | | | |
| Cache status public | | | |
| Cache bypass private flows | | | |
| Console/server errors | | | |
| SEO crawl/index coverage | | | |

---

## 8. SEO criteria

Only apply the configuration that matches the content model and business information already obtained
website verification. Do not copy brands, addresses, delivery policies, or opening hours
door or taxonomy from another site.

Standard sources must be compared when guidelines change:

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google crawling and indexing](https://developers.google.com/search/docs/crawling-indexing)
- [Google faceted navigation](https://developers.google.com/crawling/docs/faceted-navigation)
- [Google ecommerce SEO](https://developers.google.com/search/docs/specialty/ecommerce)
- [Google Product and ProductGroup](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [Google Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [Google structured data](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Google people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Search Console and Analytics](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console)
- [Core Web Vitals](https://web.dev/articles/vitals)

### 8.1. Baseline SEO and indexability matrix

Each audit must create or update `<DOMAIN>/SEO-AUDIT.md`. Each finding should have:

| School | Content |
|--------|----------|
| URL/template | Sample URL and page type |
| Evidence | HTTP headers, HTML, screenshots, Search Console or validator |
| Expected | Desired state according to indexability table |
| Actual | Actual Status |
| Priorities | `P0`, `P1`, `P2` or `P3` |
| Status | `Open`, `Applied`, `Verified`, `N/A` or `Rolled back` |
| Owner/date | Processor and time of verification |

Do not use one index/noindex rule for the entire website. Before editing, complete
The following matrix using actual data:

| URL type | Recommended default | Canonical | Sitemap | Required Notes |
|----------|------------------|-----------|---------|------------------|
| Homepage | Index | Self | Yes | A single HTTPS/host instance |
| Page/post has value | Index | Self | Yes | Title, H1 and separate intent |
| Products for sale | Index | Self | Yes | Price, inventory, variant and schema match content |
| Product category | Index if has value | Self | Yes if index | Has description, internal links and crawlable pagination |
| Product variant | Follow the URL strategy | Self or parent approved | Only URL index | Preselect correct photos, prices, inventory and add-to-cart |
| Author/tag/product tag | Decision after audit | Self if index | Only URL index | Do not default to noindex if there is a landing-page value |
| Internal Search | Noindex | Matching page | No | Do not generate crawl space |
| Filter/sort/facet | Usually do not index | Original category or separate policy | No | Control crawl parameters and infinite combinations |
| Pagination | According to the approved strategy | Usually self | Can | There are sequential `<a href>`; No JS | node dependencies
| Cart/checkout/account | Noindex | Self | No | Not cached, not appearing in SERP |
| Demo/preview/test | Noindex or remove | N/A | No | Return 404/410 if no longer used |
| Media attachment | Redirect/noindex according to policy | Asset/destination page | No | Do not create thin attachment pages |
| Product temporarily out of stock | Keep index if return | Self | Yes | Show status and replacement products |
| Product discontinued | 301, 404 or 410 according to the situation | N/A | No | Do not redirect all products to homepage |

#### Crawl, canonical and sitemap

- Only canonical URLs, returning `200`, that are indexable will appear in the XML sitemap.
- `robots.txt` is used for crawl management; `noindex` only works when the crawler can read it
page. Don't both `Disallow` and expect Google to read `noindex`.
- Standardize HTTPS, www/non-www, trailing slash, upper/lower case and query parameters.
- Each indexable URL has a valid canonical; redirect, canonical, sitemap and
Internal links should not send conflicting signals.
- Audit redirect chain/loop, soft-404, broken internal link and return URL `5xx`.
- Filter/sort/faceted navigation must have a list of allowed parameters and policy
explicit crawl/index and limit URL combinations.
- Category pagination/load-more must have a URL and sequential `<a href>` for crawlers to find
get all products; Googlebot is not assumed to click JavaScript buttons.
- Sitemap `lastmod` only changes when the main content actually changes.
- Use URL Inspection to check rendered HTML, Google's canonical options and capabilities
crawl of a sample URL for each template.

### 8.2. Yoast SEO — Basic configuration

**Plugin (if website chooses Yoast):**
- Yoast SEO free is enough for basic metadata/schema.
- Yoast SEO Premium is only needed when the website actually uses paid features such as redirects
manager or internal-linking tools.

**Mapping configuration reference:**

Prefer WP Admin, WP-CLI or WordPress/Yoast APIs. The following paragraph illustrates the required data
configuration, not a complete script to run directly. Do not edit serialized
options with SQL if you have not backed up and have not confirmed the Yoast version's schema options
using.

```php
<?php
// Save to <SITE_ROOT>/setup_yoast.php
// Run: docker exec <PHP_CONTAINER> php <CONTAINER_SITE_ROOT>/setup_yoast.php
$pdo = new PDO("mysql:host=<DB_HOST>;dbname=<DB_NAME>;charset=utf8mb4", "<DB_USER>", "<DB_PASS>");

// 1. Title templates
$titles = [
    'title-home-wpseo' => '%%sitename%% %%page%% %%sep%% %%sitedesc%%',
    // Leave blank for post/page/product → Yoast automatically uses %%title%% %%sep%% %%sitename%%
    'metadesc-home-wpseo' => '<HOMEPAGE_META_DESCRIPTION>',
];
// Save to wpseo_titles option (serialize)

// 2. Social profiles
$social = [
    'og_default_image' => 'https://<CDN_DOMAIN>/wp-content/uploads/.../logo.jpg',
    'facebook_site' => '<Facebook URL>',
    'instagram_url' => '<Instagram URL>',
    // 'twitter_site' => '@username',
];
// Save to wpseo_social option (serialize)

// 3. Permalink structure (IMPORTANT — must be set before having content)
$pdo->exec("UPDATE <DB_PREFIX>options SET option_value = '/%postname%/' WHERE option_name = 'permalink_structure'");
// Flush rewrite rules after changing permalink (via WP admin > Settings > Permalinks > Save)
```

Do not change the permalink automatically on a site that already has URL/index/traffic. If you need to change, you must have it
URL mapping, 301 redirects, updating internal links/canonical/sitemap and tracking
Search Console after the migration.

### 8.3. Schema Markup (Structured Data)

Only add schema types that match the actual content. All brands, shipping, addresses and hours
The opening below is the required placeholder instead of verified data. No more
`LocalBusiness` if the business does not have a customer service location.

#### Gate before adding schema

1. Extract all existing JSON-LD on homepage, post, category and product samples.
2. Specify which node was created by WordPress, WooCommerce, Yoast, another theme or plugin.
3. Only extend an existing node with the appropriate hook; do not create additional `Organization`,
`Product`, `WebPage`, `BreadcrumbList` or `BlogPosting` overlaps `@id`.
4. Schema data must appear or be evidenced in the content the user sees
see; Price, currency, inventory and policies cannot differ from interface.
5. Check with Rich Results Test, Schema Markup Validator and URL Inspection later
   khi clear cache.

The snippets below are structural samples, not the default code for every website.
Must check the actual shape of `$markup['offers']` before editing shipping data.

```php
// ============================================================
// 1. PRODUCT BRAND + SHIPPING DETAILS (WooCommerce)
// ============================================================

// Add Brand to Product schema
add_filter('woocommerce_structured_data_product', 'siteopt_add_product_brand', 20, 2);
function siteopt_add_product_brand($markup, $product) {
    $markup['brand'] = [
        '@type' => 'Brand',
        'name'  => '<BRAND_NAME>',
    ];
    return $markup;
}

// Add Shipping Details to Product Offer schema
add_filter('woocommerce_structured_data_product', 'siteopt_add_shipping_details', 30, 2);
function siteopt_add_shipping_details($markup, $product) {
    if (isset($markup['offers']) && is_array($markup['offers'])) {
        foreach ($markup['offers'] as &$offer) {
            if (!isset($offer['@type'])) continue;
            $offer['shippingDetails'] = [
                '@type' => 'OfferShippingDetails',
                'shippingRate' => [
                    '@type'    => 'MonetaryAmount',
                    'value'    => '<SHIPPING_RATE>',
                    'currency' => '<CURRENCY_CODE>',
                ],
                'deliveryTime' => [
                    '@type' => 'ShippingDeliveryTime',
                    'handlingTime' => [
                        '@type'    => 'QuantitativeValue',
                        'minValue' => <HANDLING_MIN_DAYS>,
                        'maxValue' => <HANDLING_MAX_DAYS>,
                        'unitCode' => 'DAY',
                    ],
                ],
                'shippingDestination' => [
                    '@type'          => 'DefinedRegion',
                    'addressCountry' => '<COUNTRY_CODE>',
                ],
            ];
        }
    }
    return $markup;
}

// ============================================================
// 2. ORGANIZATION SCHEMA (Yoast)
// ============================================================
add_filter('wpseo_schema_organization', 'siteopt_enhance_organization');
function siteopt_enhance_organization($data) {
    $data['name']        = '<COMPANY_NAME>';
    $data['description'] = '<COMPANY_DESCRIPTION>';
    $data['telephone']   = '<PHONE_NUMBER>';
    $data['address']     = [
        '@type'           => 'PostalAddress',
        'streetAddress'   => '<STREET_ADDRESS>',
        'addressLocality' => '<LOCALITY>',
        'addressRegion'   => '<REGION>',
        'addressCountry'  => '<COUNTRY_CODE>',
    ];
    return $data;
}

// ============================================================
// 3. LOCALBUSINESS SCHEMA (Yoast)
// ============================================================
add_filter('wpseo_schema_graph', 'siteopt_filter_local_business', 10, 2);
function siteopt_filter_local_business($graph, $context) {
    $graph[] = [
        '@type'            => 'LocalBusiness',
        '@id'              => $context->site_url . '#localbusiness',
        'name'             => '<COMPANY_NAME>',
        'description'      => '<SHORT_DESCRIPTION>',
        'url'              => $context->site_url,
        'telephone'        => '<PHONE_NUMBER>',
        'priceRange'       => '<PRICE_RANGE>',
        'address'          => [
            '@type'           => 'PostalAddress',
            'streetAddress'   => '<STREET_ADDRESS>',
            'addressLocality' => '<LOCALITY>',
            'addressRegion'   => '<REGION>',
            'addressCountry'  => '<COUNTRY_CODE>',
        ],
        'openingHoursSpecification' => [
            [
                '@type'     => 'OpeningHoursSpecification',
                'dayOfWeek' => ['<OPEN_DAY_1>', '<OPEN_DAY_2>'],
                'opens'     => '<OPEN_TIME>',
                'closes'    => '<CLOSE_TIME>',
            ],
        ],
    ];
    return $graph;
}

// ============================================================
// 4. BLOGPOSTING SCHEMA (Yoast — for blog posts)
// ============================================================
add_filter('wpseo_schema_graph', 'siteopt_seo_add_blogposting_schema', 20, 2);
function siteopt_seo_add_blogposting_schema($graph, $context) {
    if (!is_singular('post')) {
        return $graph;
    }
    $post_id = get_queried_object_id();
    $image_id = get_post_thumbnail_id($post_id);
    $author_id = (int) get_post_field('post_author', $post_id);

    $article = [
        '@type' => 'BlogPosting',
        '@id' => get_permalink($post_id) . '#article',
        'isPartOf' => ['@id' => get_permalink($post_id) . '#webpage'],
        'headline' => wp_strip_all_tags(get_the_title($post_id)),
        'datePublished' => get_the_date(DATE_W3C, $post_id),
        'dateModified' => get_the_modified_date(DATE_W3C, $post_id),
        'mainEntityOfPage' => ['@id' => get_permalink($post_id) . '#webpage'],
        'author' => [
            '@type' => 'Person',
            'name' => get_the_author_meta('display_name', $author_id),
        ],
        'publisher' => ['@id' => $context->site_url . '#organization'],
    ];
    if ($image_id) {
        $image_url = wp_get_attachment_image_url($image_id, 'full');
        if ($image_url) {
            $article['image'] = ['@type' => 'ImageObject', 'url' => $image_url];
        }
    }
    $graph[] = $article;
    return $graph;
}
```

#### Ecommerce structured data criteria

- Product purchased directly requires `name`, image crawlable, `Offer`, URL, price,
`priceCurrency`, availability and condition match live data.
- Add `brand`, SKU and GTIN/MPN when real data is available; do not generate identifiers yourself.
- Products with color/size need to audit variant URL strategy and `ProductGroup`,
  `productGroupID`, `variesBy`, `hasVariant`/`isVariantOf`.
- Each indexed URL variant must preselect the correct image, price, inventory, and add-to-cart.
- Shipping policy uses `ShippingService` in `Organization` if applicable; only
Use `OfferShippingDetails` to override specific products.
- General return policy uses `MerchantReturnPolicy` in `Organization`; policy according to
The product is only used when it is really different.
- Review/`aggregateRating` only marks real reviews, visible to users and
belongs to the correct product; Do not create ratings yourself.
- Connect to Google Merchant Center if the site needs Shopping/free listings. Compare feeds
with website about title, URL, image, price, sale price, availability, identifiers,
shipping and returns; Handles diagnostics and update delays.

### 8.4. SEO Hygiene — Noindex thin/demo pages

Post types, taxonomy and paths in snippets are just common candidates
Flatsome. Audit index/content first, create allowlist of pages to index and change names
books by each website; do not default to noindex author/tag if they have SEO value.

```php
// ============================================================
// NOINDEX DEMO/THIN PAGES + EXCLUDE FROM SITEMAP
// ============================================================

// Check if it's a demo site
function siteopt_seo_is_demo_page($post = null) {
    $post = get_post($post);
    if (!$post instanceof WP_Post) return false;

    // Do not noindex the homepage/blog page
    $protected = array_filter([(int) get_option('page_on_front'), (int) get_option('page_for_posts')]);
    if (in_array((int) $post->ID, $protected, true)) return false;

    // Noindex blocks, featured_item (Flatsome demo post types)
    if (in_array($post->post_type, ['blocks', 'featured_item'], true)) return true;

    if ($post->post_type !== 'page') return false;

    // Noindex Flatsome demo pages
    $path = trim((string) get_page_uri($post), '/');
    return $path === 'elements'
        || str_starts_with($path, 'elements/')
        || str_starts_with($path, 'demos/shop-demos/');
}

// Default safety policy: real archives are not noindexed until audit confirms.
function siteopt_seo_archive_noindex_policy() {
    return apply_filters('siteopt_seo_archive_noindex_policy', [
        'author'      => false,
        'post_tag'    => false,
        'product_tag' => false,
    ]);
}

// Apply noindex
function siteopt_seo_should_noindex_current_url() {
    if (is_admin()) return false;
    if (is_singular()) return siteopt_seo_is_demo_page(get_queried_object_id());

    $policy = siteopt_seo_archive_noindex_policy();
    if (!empty($policy['author']) && is_author()) return true;
    if (!empty($policy['post_tag']) && is_tag()) return true;
    if (!empty($policy['product_tag']) && is_tax('product_tag')) return true;
    if (is_post_type_archive(['blocks', 'featured_item'])) return true;
    return false;
}

add_filter('wpseo_robots', 'siteopt_seo_noindex_thin_urls', 999);
function siteopt_seo_noindex_thin_urls($robots) {
    if (!siteopt_seo_should_noindex_current_url()) return $robots;
    return 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
}

// Remove demo post types from sitemap
add_filter('wpseo_sitemap_exclude_post_type', 'siteopt_seo_exclude_demo_post_types_from_sitemap', 10, 2);
function siteopt_seo_exclude_demo_post_types_from_sitemap($excluded, $post_type) {
    if (in_array($post_type, ['blocks', 'featured_item'], true)) return true;
    return $excluded;
}

// Only taxonomies that have been audited are thin from the sitemap.
add_filter('wpseo_sitemap_exclude_taxonomy', 'siteopt_seo_exclude_thin_taxonomies_from_sitemap', 10, 2);
function siteopt_seo_exclude_thin_taxonomies_from_sitemap($excluded, $taxonomy) {
    $thin_taxonomies = apply_filters(
        'siteopt_seo_thin_taxonomies',
        ['featured_item_category']
    );
    if (in_array($taxonomy, $thin_taxonomies, true)) return true;
    return $excluded;
}

// Filter each entry in the sitemap
add_filter('wpseo_sitemap_entry', 'siteopt_seo_filter_demo_sitemap_entries', 10, 3);
function siteopt_seo_filter_demo_sitemap_entries($url, $type, $object) {
    if (is_object($object) && isset($object->ID) && siteopt_seo_is_demo_page((int) $object->ID)) return false;
    if (is_array($url) && isset($url['loc'])) {
        $loc = (string) $url['loc'];
        if (str_contains($loc, '/elements/') || str_contains($loc, '/demos/shop-demos/')) {
            return false;
        }
    }
    return $url;
}
```

### 8.5. Product Category H1 and image alt

Check HTML rendering on desktop/mobile before adding H1. Only use the snippet below
here if category does not have H1; Don't create a second H1 just because the current title is hidden
CSS or located in another hook.

```php
// ============================================================
// PRODUCT CATEGORY H1 (Flatsome does not add H1 itself)
// ============================================================
add_action('woocommerce_archive_description', 'siteopt_seo_add_product_category_h1', 1);
function siteopt_seo_add_product_category_h1() {
    if (!is_product_category()) return;
    $term = get_queried_object();
    if (!$term || empty($term->name)) return;
    echo '<h1 class="siteopt-seo-archive-title">' . esc_html($term->name) . '</h1>';
}

// CSS for the category H1
add_action('wp_head', 'siteopt_seo_archive_title_styles', 20);
function siteopt_seo_archive_title_styles() {
    if (!is_product_category()) return;
    echo '<style>
      .siteopt-seo-archive-title {
        font-size: clamp(28px, 4vw, 44px);
        line-height: 1.12;
        margin: 0 0 18px;
        color: #132238;
        letter-spacing: -0.03em;
      }
    </style>';
}

```

Alt text rules:

- Product photo/content: short description, in context and not stuffed with keywords.
- Link/action image: describes the purpose of the link/action.
- Decorative photos or avatars that do not carry information: use `alt=""`.
- Do not automatically assign a brand name to any image lacking alt.
- Check alt in public HTML, not just in Media Library.

### 8.6. Comprehensive SEO Checklist

Don't tick just the WP Admin check. Each `Verified` entry must have a sample URL and
evidence from public HTML, HTTP response, browser or corresponding tool.

#### A. Baseline, crawl and indexability — P0

- [ ] Create `<DOMAIN>/SEO-AUDIT.md` and complete the URL type matrix in Section 8.1.
- [ ] Verify ownership of Google Search Console for the correct HTTPS property.
- [ ] Ghi baseline Performance, Indexing, Core Web Vitals, Enhancements, Manual
Actions and Security Issues in Search Console.
- [ ] `robots.txt` is accessible, declares sitemap correctly and does not block resources to be rendered.
- [ ] XML sitemap contains only canonical, indexable URLs, returns `200`; `lastmod` reflects real change.
- [ ] Canonical consistency with redirects, sitemap, hreflang (if any) and internal links.
- [ ] No redirect chain/loop, soft-404, broken internal links or spike `5xx`.
- [ ] Demo/test/preview, internal search, cart, checkout and account are not indexed.
- [ ] Author/tag/product-tag is determined by actual value, not bulk noindex.
- [ ] Filter/sort/faceted parameters has crawl policy; does not generate infinite URL space.
- [ ] Pagination/load-more has the URL and `<a href>` crawlable to the entire product.
- [ ] If multilingual/multinational: hreflang reciprocal, self-reference and `x-default`
correct; each language URL canonical about itself.

#### B. Website architecture and internal linking — P1

- [ ] Clear crawl flow: homepage → category → subcategory → product.
- [ ] Every product/category that needs to be indexed can be accessed using an HTML link, not just the search box.
- [ ] There is no orphan page; write list of pages that only appear in sitemap/feed.
- [ ] Breadcrumb visual and `BreadcrumbList` reflect the logical user path.
- [ ] Important categories and best-selling products receive prominent internal links.
- [ ] Blog links to appropriate categories/products and vice versa when useful.
- [ ] Anchor text describes the destination, do not use a series of generic anchors or keyword stuffing.

#### C. On-page, content quality and trust — P1

- [ ] Each indexable URL has its own title, clear intent; an H1 describes the main content.
- [ ] Meta description gives priority to homepage, category, product and articles with traffic; paternal
Content must be useful, not just aimed at a fixed length.
- [ ] Product/category copies have their own value, do not copy manufacturers or sister websites.
- [ ] Audit cannibalization between subdomains; Each domain has niche, intent and content
Different content, do not create doorway pages/sites.
- [ ] Content represents actual experience, source, author/reviewer and update date
when users need that information.
- [ ] Has About, Contact, privacy, terms, shipping, returns, payment, warranty and business
identity is consistent with reality.
- [ ] Do not change fake dates, mass-generate or rewrite content just to increase the number of SEO pages.
- [ ] Focus keyword Yoast is an optional editor only; Do not use 100% coverage as a KPI.
- [ ] Open Graph/Twitter metadata has the correct title, description and image on the important URL.

#### D. Ecommerce and product lifecycle — P0/P1

- [ ] Product page clearly displays name, description, price, currency, availability, image,
SKU/identifier, shipping and returns are appropriate.
- [ ] Product variants have a consistent URL/canonical strategy; URL variant indexable
preselect the correct color/size, photo, price, inventory and add-to-cart.
- [ ] Products that are temporarily out of stock are still useful and have suitable replacement products/notifications.
- [ ] Product will stop selling using 301 when an equivalent replacement becomes available; If not, then 404/410,
Remove from sitemap/feed and keep useful UX.
- [ ] Category does not depend on filter/search so that Google can find the entire product.
- [ ] Google Merchant Center is connected when Shopping/free listings are needed.
- [ ] Feed and website match URL, title, image, identifiers, price, sale price, availability,
shipping and returns; diagnostics no longer has P0 error.

#### E. Structured data — P1

- [ ] No duplicate nodes/schema due to theme, WooCommerce, Yoast and custom code.
- [ ] `Organization` has real identity; `LocalBusiness` is only used when there is a location to serve guests.
- [ ] Product merchant listing has required properties and data matching visible content.
- [ ] The product has variants using `ProductGroup`/`Product` according to the audited strategy.
- [ ] `MerchantReturnPolicy` and `ShippingService` are placed in Organization as a general policy.
- [ ] `Review`/`aggregateRating` only reflect real reviews, displayed to users.
- [ ] Breadcrumb, Article/BlogPosting and Product passed Rich Results Test without critical error.
- [ ] URL Inspection shows the schema in rendered HTML; cache/CDN does not serve the old schema.

#### F. Image SEO — P1

- [ ] Image URL on CDN/R2 is crawlable, indexable, returns correct MIME/status and is not blocked by robots.
- [ ] Main product has high quality photos; Prioritize adding 1:1, 4:3 and 16:9 ratios when appropriate.
- [ ] Filename reasonable description; informative images have contextual alts, decorative images have `alt=""`.
- [ ] Declare `width`/`height`, responsive `srcset`/`sizes`; Do not lazy-load LCP image.
- [ ] Image URL in Product schema/feed matches the current public image.

#### G. Mobile and Core Web Vitals — P1

- [ ] Mobile content, links, metadata and structured data are equivalent to desktop.
- [ ] No intrusive interstitial covering the main content or the touch target cannot be used.
- [ ] Field data at percentile 75, mobile/desktop separation: **LCP ≤ 2.5s**, **INP ≤ 200ms**,
  **CLS ≤ 0.1**.
- [ ] Use CrUX/Search Console/RUM to validate field data; Lighthouse uses diagnostics,
Does not replace real user data.
- [ ] Separately track homepage, category, product, blog and checkout template to avoid
Site-wide average covers regression.

#### H. Post-deployment monitoring — P0/P1

- [ ] Submit sitemap and inspect sample URL for each template after major changes.
- [ ] Tracked 7/14/28 days: indexed/excluded URLs, crawl errors, clicks, impressions,
CTR, average position and organic conversions.
- [ ] Monitor Search Console Enhancements, rich-result errors, Manual Actions and Security Issues.
- [ ] Monitor Merchant Center diagnostics and price/inventory mismatch if there is a feed.
- [ ] Compare Search Console with Analytics by landing page/query; Annotate the deployment date.
- [ ] There is a warning threshold and rollback when organic traffic, indexed URLs, conversion or
Core Web Vitals decreased abnormally.

### 8.7. H1 on homepage and key pages

Every indexable page must have exactly one visible `<h1>` that describes the
main content. Lighthouse SEO reports 100 even when the homepage has zero H1
tags, so this check must be done manually.

**Criteria:**

| Page type | H1 requirement | Status |
|-----------|---------------|--------|
| Homepage | One H1 describing the site's primary purpose (e.g., brand + main service) | Verified |
| Product category | One H1 matching the category name | Verified |
| Product page | One H1 matching the product title (WooCommerce default) | Verified |
| Blog post / page | One H1 matching the article/page title | Verified |

**Common issues:**

- Flatsome `page-blank` template strips the default page title, leaving the
  homepage with no H1.
- Category pages built with UX Builder may omit the H1 if the default
  WooCommerce archive title is hidden.
- A commented-out or reverted PHP hook can silently remove a previously
  applied H1 fix.

**Verification:**

```bash
# Count H1 tags in the public HTML
curl -s https://<DOMAIN>/ | grep -oiE '<h1[^>]*>' | wc -l
# Must return 1
```

**Implementation pattern (Flatsome child theme `functions.php`):**

```php
add_action('flatsome_before_page', 'siteopt_front_page_h1', 5);
function siteopt_front_page_h1() {
    if (!is_front_page()) {
        return;
    }
    echo '<div class="siteopt-front-title-wrap">'
       . '<h1 class="siteopt-front-title">Primary keyword – brand description</h1>'
       . '</div>';
}
```

Style the H1 wrapper so it sits cleanly between the header and the hero
section. If the page uses a transparent header, add `padding-top` to `#main`
equal to the header height so the H1 is not hidden behind it.

### 8.8. Link and button accessibility

UX Builder shortcodes and visual editors often produce `<a>` tags styled as
buttons that have no `href`, or use `href="#"` for JavaScript-driven tabs.
These are accessibility and SEO defects.

**Criteria:**

| Issue | Requirement | Priority |
|-------|-------------|----------|
| `<a class="button">` without `href` | Add a real URL, or convert to `<button>` / heading if it is a label | P1 |
| `<a href="#">` for tabs/filters | Remove `href`, add `role="button"` + `tabindex="0"` + `preventDefault` | P1 |
| Section label styled as button link | Replace `<a>` with `<h2>` or `<h3>` to fix heading hierarchy | P1 |
| "View all" / "Xem toàn bộ" buttons | Link to the corresponding product category URL | P1 |
| "Learn more" / "Tìm hiểu thêm" buttons | Link to the relevant content page | P1 |
| External links (social, Zalo, etc.) | `target="_blank"` + `rel="noopener noreferrer"` + `aria-label` | P2 |

**Verification:**

```bash
# Find anchor tags styled as buttons with no href
curl -s https://<DOMAIN>/ | grep -oiE '<a[^>]*class="[^"]*button[^"]*"[^>]*>' | grep -v 'href='
# Must return 0 lines

# Find href="#" links
curl -s https://<DOMAIN>/ | grep -oiE '<a[^>]*href="#"[^>]*>' | grep -v 'data-open\|preventDefault'
# Must return 0 lines (excluding JS toggle triggers)
```

**Implementation pattern (JavaScript in `wp_footer`):**

```javascript
(function () {
    // Fix <a class="button"> without href
    document.querySelectorAll('a.button:not([href]), a.button[href=""]').forEach(function (el) {
        var text = (el.textContent || '').trim();
        if (text.indexOf('SECTION LABEL') !== -1) {
            // Convert label to heading
            var h2 = document.createElement('h2');
            h2.textContent = text;
            el.parentNode.replaceChild(h2, el);
            return;
        }
        if (text.indexOf('View all') !== -1) {
            el.setAttribute('href', 'https://<DOMAIN>/category-slug/');
            return;
        }
    });
    // Fix href="#" tab buttons
    document.querySelectorAll('a.category-button[href="#"]').forEach(function (el) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.removeAttribute('href');
        el.addEventListener('click', function (e) { e.preventDefault(); });
    });
})();
```

### 8.9. Transparent header and hero/banner overlap

Flatsome's transparent header (`has-transparent` body class) lets the header
float over the first content section. When the homepage uses a full-width
banner or hero image, the top portion of the banner is hidden behind the
header.

**Criteria:**

| Check | Requirement | Priority |
|-------|-------------|----------|
| Hero/banner fully visible | No part of the banner is obscured by the header on initial load | P1 |
| Sticky header scroll | Content does not jump or get covered when the header sticks on scroll | P1 |
| Mobile overlap | Banner is fully visible on mobile (header height differs) | P1 |

**Verification:**

```bash
# Check if the page uses transparent header
curl -s https://<DOMAIN>/ | grep -oE 'has-transparent|transparent' | head -1
# If present, verify padding-top compensates for header height

# Check computed header height from CSS
curl -s https://<DOMAIN>/ | grep -oE '\.header-main\{height:[0-9]+px\}' | head -1
```

**Implementation pattern (CSS in child theme):**

```css
/* Push first content section below the transparent header.
   Header height = top-bar + header-main + header-bottom.
   Adjust the value to match the actual theme configuration. */
.home.has-transparent #main {
    padding-top: 116px; /* 30px + 82px + 4px gap */
}
```

If the header height changes (e.g., different top-bar setting), update the
`padding-top` value accordingly and verify on both desktop and mobile.

---

## 9. Configure Cloudflare via API

Optional modules. Capture the current configuration and confirm API permissions before running.
Don't run the entire script if the site only needs to change one setting. SSL mode must be obtained
from Cloudflare transmission → actual origin in `<DOMAIN>/AGENTS.md`.

### 9.1. Necessary information

```bash
# Get Zone ID
curl -s "https://api.cloudflare.com/client/v4/zones?name=<DOMAIN>" \
  -H "X-Auth-Email: <email>" \
  -H "X-Auth-Key: <api_key>" | python3 -c "
import sys, json; d = json.load(sys.stdin); print(d['result'][0]['id'])
"
```

### 9.2. Cloudflare automatic configuration script

```bash
#!/bin/bash
# <OPS_DIR>/<DOMAIN>-setup-cloudflare.sh
# How to run: bash <OPS_DIR>/<DOMAIN>-setup-cloudflare.sh <zone_id> <email> <api_key> <ssl_mode>

ZONE_ID=$1
EMAIL=$2
API_KEY=$3
SSL_MODE=$4
BASE="https://api.cloudflare.com/client/v4/zones/$ZONE_ID"
AUTH="-H \"X-Auth-Email: $EMAIL\" -H \"X-Auth-Key: $API_KEY\" -H \"Content-Type: application/json\""

case "$SSL_MODE" in
  flexible|full|strict) ;;
  *) echo "ssl_mode must be flexible, full, or strict" >&2; exit 1 ;;
esac

echo "=== 1. AUTO MINIFY (CSS + HTML + JS) ==="
curl -s -X PATCH "$BASE/settings/minify" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"value":{"css":"on","html":"on","js":"on"}}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"

echo "=== 2. BROTLI ==="
curl -s -X PATCH "$BASE/settings/brotli" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"value":"on"}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"

echo "=== 3. ALWAYS USE HTTPS ==="
curl -s -X PATCH "$BASE/settings/always_use_https" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"value":"on"}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"

echo "=== 4. HTTP/3 ==="
curl -s -X PATCH "$BASE/settings/http3" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"value":"on"}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"

echo "=== 5. 0-RTT ==="
curl -s -X PATCH "$BASE/settings/0rtt" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"value":"on"}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"

echo "=== 6. SSL MODE: $SSL_MODE ==="
curl -s -X PATCH "$BASE/settings/ssl" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d "{\"value\":\"$SSL_MODE\"}" | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"

echo "=== 7. AUTOMATIC HTTPS REWRITES ==="
curl -s -X PATCH "$BASE/settings/automatic_https_rewrites" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"value":"on"}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅' if d.get('success') else d.get('errors'))"
```

### 9.3. Cache Rules (via API)

```bash
# Default safe example: cache CDN images only (Edge TTL 1 day).
# HTML cache needs its own ruleset with full bypass according to Section 5.4.

# Get the current ruleset ID
RULESET=$(curl -s "$BASE/rulesets/phases/http_request_cache_settings/entrypoint" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" | \
  python3 -c "import sys,json;d=json.load(sys.stdin);print(d['result']['id'])")

# Update ruleset with reviewed CDN rules
curl -s -X PUT "$BASE/rulesets/$RULESET" \
  -H "X-Auth-Email: $EMAIL" -H "X-Auth-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "description": "Cache CDN images",
        "expression": "(http.host eq \"<CDN_DOMAIN>\")",
        "action": "set_cache_settings",
        "action_parameters": {
          "cache": true,
          "edge_ttl": {"default": 86400, "mode": "override_origin"}
        },
        "enabled": true
      }
    ]
  }' | python3 -c "import sys,json;d=json.load(sys.stdin);print('✅ Cache Rules' if d.get('success') else d.get('errors'))"
```

### 9.4. ⚠️ Important about SSL Mode

| SSL Mode | When to use | Cloudflare → Origin |
|----------|-------------|---------------------|
| **Flexible** | Origin only has HTTP (port 80) | HTTP (unencrypted) |
| **Full** | Origin has self-signed SSL | HTTPS (no certificate verification) |
| **Full (Strict)** | Origin has valid SSL | HTTPS (verify cert) |

Select mode according to actual connection:

```text
Cloudflare → HTTP origin                       => Flexible (only when TLS cannot be enabled)
Cloudflare → HTTPS origin, unverified cert     => Full
Cloudflare → HTTPS origin, valid certificate   => Full (Strict), preferred
```

Do not infer SSL mode from user protocol → Cloudflare. After making changes, you must check
Check redirect loop, mixed content and origin accessibility.

### 9.5. R2 Custom Domain (need to do via Dashboard)

> The API does not automatically create DNS records — it must be done through Cloudflare Dashboard.

```
Cloudflare Dashboard → R2 → <BUCKET_NAME> → Settings → Public Access → Custom Domains
```

1. Click "Connect Domain"
2. Enter `<CDN_DOMAIN>`
3. Cloudflare creates its own CNAME record
4. Wait for SSL activation (1-5 minutes)
5. R2 images will be cached at the edge with Cache Rule

**Before setting up R2 Custom Domain:**
- `public.r2.dev` CNAME → R2 images NOT cached at edge (`cf-cache-status: DYNAMIC`)
- Browser caching still works (via Cache-Control header)

**After setting up the R2 custom domain:**
- R2 images cache at edge (`cf-cache-status: HIT`)
- Measure and record TTFB before/after on the same object and at the same test location

### 9.6. Verify Cloudflare settings

```bash
# HTTP→HTTPS redirect
curl -sI http://<DOMAIN>/ | grep -i location
# → Location: https://<DOMAIN>/

# Brotli
curl -sI -H "Accept-Encoding: gzip, br" https://<DOMAIN>/ | grep content-encoding
# → content-encoding: br

# Auto Minify (HTML on 1 line)
curl -s https://<DOMAIN>/ | head -1 | wc -c
# → > 1000 (minified, no line breaks)

# HTTP/3
curl -sI https://<DOMAIN>/ | grep alt-svc
# → alt-svc: h3=":443"; ma=86400

# Cache status
curl -sI https://<DOMAIN>/ | grep cf-cache
# → cf-cache-status: HIT (warm cache)

# Security headers
curl -sI https://<DOMAIN>/ | grep -iE 'x-frame|x-content|strict-transport'
```

---

## 10. Performance functions library

These are optional snippets, not the current state of the website. Audit
theme/plugin and check for duplicate functions/hooks before selecting each snippet.

### 10.1. Dequeue unnecessary CSS

```php
add_action('wp_enqueue_scripts', 'siteopt_dequeue_unneeded_frontend_assets', 100);
function siteopt_dequeue_unneeded_frontend_assets() {
    if (!is_admin()) {
        wp_dequeue_style('wp-block-library');      // WordPress block library CSS
        wp_dequeue_style('wc-blocks-style');        // WooCommerce blocks CSS
        wp_dequeue_style('woocommerce-inline');     // WooCommerce inline CSS
    }
}
```

### 10.2. Disable emoji

```php
add_action('init', 'siteopt_disable_wp_emoji_assets');
function siteopt_disable_wp_emoji_assets() {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
}
```

### 10.3. Resource hints (preconnect/dns-prefetch)

```php
add_filter('wp_resource_hints', 'siteopt_resource_hints', 10, 2);
function siteopt_resource_hints($urls, $relation_type) {
    if ('preconnect' === $relation_type) {
        $urls[] = 'https://<CDN_DOMAIN>';
    }
    if ('dns-prefetch' === $relation_type) {
        $urls[] = '//<CDN_DOMAIN>';
    }
    return array_values(array_unique($urls));
}
```

### 10.4. Image attributes (decoding=async, lazy, fetchpriority)

```php
add_filter('wp_get_attachment_image_attributes', 'siteopt_attachment_image_attributes', 20, 3);
function siteopt_attachment_image_attributes($attr, $attachment, $size) {
    if (is_admin()) return $attr;
    $attr['decoding'] = 'async';
    if (empty($attr['loading'])) $attr['loading'] = 'lazy';
    if ('lazy' === $attr['loading'] && empty($attr['fetchpriority'])) {
        $attr['fetchpriority'] = 'low';
    }
    return $attr;
}
```

### 10.5. Defer WooCommerce/CF7 scripts

```php
add_filter('script_loader_tag', 'siteopt_defer_safe_scripts', 20, 3);
function siteopt_defer_safe_scripts($tag, $handle, $src) {
    if (is_admin() || false !== strpos($tag, ' defer') || false !== strpos($tag, ' async')) {
        return $tag;
    }
    $defer_handles = array(
        'contact-form-7', 'wpcf7', 'wc-add-to-cart', 'woocommerce',
        'wc-cart-fragments', 'sourcebuster', 'wc-order-attribution',
        'flatsome-live-search',
    );
    if (in_array($handle, $defer_handles, true) || false !== strpos($src, '/contact-form-7/')) {
        return str_replace('<script ', '<script defer ', $tag);
    }
    return $tag;
}
```

### 10.6. HTML output buffer optimization

```php
add_action('template_redirect', 'siteopt_start_frontend_output_buffer', 0);
function siteopt_start_frontend_output_buffer() {
    if (is_admin() || wp_doing_ajax() || is_feed() || is_customize_preview()) return;
    ob_start('siteopt_optimize_frontend_html');
}

function siteopt_optimize_frontend_html($html) {
    if (false === stripos($html, '<html')) return $html;
    // Only use mappings confirmed in your website profile.
    $html = str_replace('<OLD_FONT_PATH>', '<PUBLIC_FONT_PATH>', $html);
    return $html;
}
```

### 10.7. Desktop visual tuning (Flatsome)

```php
// Adjust visual on desktop (if need customize Flatsome)
add_action('wp_head', 'siteopt_desktop_visual_tuning_overrides', 100);
function siteopt_desktop_visual_tuning_overrides() {
    if (is_admin()) return;
    // Add CSS overrides for desktop
    echo '<style>
      @media (min-width: 1024px) {
        /* Site-specific CSS overrides */
      }
    </style>';
}
```

---

## 11. Acceptance criteria

Do not mark complete according to the status in the guide. For each website, record
`N/A`, `Planned`, `Applied`, `Verified` or `Rolled back` with proof.

| Category | Condition `Verified` |
|----------|----------------------|
| Backup/rollback | Backup exists, has correct timestamp and has restore command |
| Availability | The main URL and the newly affected URL return the correct status/redirect |
| Nginx/PHP | Syntax/config test successful; reload does not create new errors |
| Cache | Public response has MISS→HIT; admin/login/cart/checkout/account always bypass |
| Performance | There are baseline and post-change measurements under the same conditions; no regression |
| Frontend | Desktop/mobile is correct; console has no new errors |
| Commerce/forms | Product, cart, checkout, account and related form operations |
| Technical SEO | Canonical, robots, sitemap, status code and redirect correct |
| Structured data | Contains only real business data and through appropriate validator |
| Security | HTTPS does not loop/mixed content; Sensitive files are not public |
| Operations | Correctly cleared the cache and checked the log after the change |

### Priority order

1. Backup, availability and serious security/technical SEO errors.
2. Regression function, indexability, redirect/canonical.
3. Core Web Vitals and bottlenecks have been proven by the baseline.
4. Cache/CDN/R2 if used by the website.
5. Metadata, schema and content hygiene verified.
6. Small tweaks or paid features only if the benefits are measurable.
