# mayaochaybo.vn — Managed Website Profile

> **Scope:** This file only contains infrastructure data, access information, warnings and
> runbooks specific to `mayaochaybo.vn`. The shared workflow is defined in
> `../AGENTS.md`. Load `../WEBSITE-OPTIMIZATION-GUIDE.md` only when the current
> request matches a guide-loading trigger defined by the root instructions.

## Active tenant identity

| Field | Value |
|---|---|
| Domain | `mayaochaybo.vn` |
| Payload tenant slug | `mayaochaybo` |
| Active platform | WordPress on apex; Next.js + Payload on preview |
| Migration status | Preview deployed at `https://next.mayaochaybo.vn`; production cutover not performed |

`mayaochaybo.vn` remains the active public WordPress website. The tenant-scoped
Next.js/Payload replacement is live only on the non-indexable preview hostname.
Do not switch the apex proxy or DNS without the explicit production cutover gate.

## Active migration preview runtime

The July 19, 2026 migration created the `mayaochaybo` Payload tenant, tenant R2
media prefix, Next.js frontend, proxy, and Cloudflare preview DNS record. The
apex site remains on the WordPress runtime documented below.

For every migration task for this domain:

1. Load `../.codex/skills/migrate-wordpress-to-x24sport-tenant/SKILL.md`, its
   `references/mayaochaybo-plan.md`, and the references routed by that skill.
2. Load `../.codex/skills/develop-x24sport-websites/SKILL.md` for the public
   frontend and its routed Next.js, SEO, accessibility, and quality references.
3. Read `../cms-api/AGENTS.md` and `../PAYLOAD-REST-API-GUIDE.md` before any
   shared CMS schema, tenant, content, or media mutation.
4. Use the following verified preview inventory:

| Field | Verified value |
|---|---|
| Payload tenant slug | `mayaochaybo` |
| Tenant domains | `mayaochaybo.vn`, `next.mayaochaybo.vn` |
| Preview URL | `https://next.mayaochaybo.vn` |
| Frontend host | `root@10.10.0.58` |
| Frontend path | `/root/websites/next.mayaochaybo.vn` |
| Container / service | `next-mayaochaybo` / `web` |
| Container and host port | `3011` / `10.10.0.58:3011` |
| Preview proxy | `root@10.10.0.56` → `http://10.10.0.58:3011` |
| CMS origin | `http://10.10.0.28:3001` |

The frontend contract is full request-time SSR: use Next.js App Router Server
Components by default, force dynamic rendering, fetch CMS data without ISR or
static generation, and keep client components limited to interactive islands.
Do not cache HTML at Cloudflare or Nginx during preview. Static build assets and
tenant media may use immutable cache rules.

Preserve every accepted WordPress product, product-category, post, page, media,
pagination, and meaningful query URL directly whenever technically possible.
Products and several product categories currently occupy root-level paths, so
resolve by exact tenant-scoped `legacyPath`, not by slug or a new `/san-pham/`
prefix. Fail import/build on any unresolved route collision.

Keep `next.mayaochaybo.vn` non-indexable and canonicalized to the corresponding
production URL until cutover. Inventory and reproduce Google Ads landing pages,
GTM/GA/Ads tags, consent behavior, conversion events, forms, phone/Zalo actions,
and order/contact success states before declaring preview parity. Do not change
the apex DNS or proxy upstream without the explicit cutover gate.

The repository root `.env` is the approved runtime source for Cloudflare account
and API-token variables for this migration. Source it only inside a command that
does not print values. Never place Cloudflare, R2, WordPress, Payload, database,
or analytics secrets in arguments, source, artifacts, logs, or handoff text.

## Runtime management

| Field | Value |
|---|---|
| Application host | `root@10.10.0.26` |
| Application root | `/root/websites/sites/mayaochaybo.vn` |
| Docker Compose | `/root/websites/docker-compose.yml` |
| Runtime containers | `wp-nginx`, `wp-php` |
| Published application port | `10.10.0.26:80` |
| Proxy host | `root@10.10.0.56` (`103.147.35.95`) |
| Proxy config | `/etc/nginx/conf.d/mayaochaybo.vn.conf` |
| Public upstream | `http://10.10.0.26:80` |
| Request path | Proxy → `wp-nginx` → `wp-php` → WordPress database |

The WordPress, PHP, MySQL, theme, plugin, cache, Nginx, and filesystem details
below describe the active website runtime.

## Active WordPress system overview

| Section | Value |
|-----|--------|
| Website | `mayaochaybo.vn` |
| Platform | WordPress 7.0 |
| PHP | 8.2.31 (PHP-FPM in Docker) |
| Database | MySQL/MariaDB on `10.10.0.52` |
| Web server | nginx:alpine (Docker container `wp-nginx`) |
| Theme | Flatsome Child 3.0 (child of Flatsome) |
| SSL | Cloudflare + Let's Encrypt (proxy) |

---

## Access information

### SSH

| Server | Address | Hostname | OS |
|--------|---------|----------|-----|
| Main server | `root@10.10.0.26` | `10-10-0-26-wordpress` | Ubuntu 24.04.2 LTS |
| Proxy | `root@10.10.0.56` | `10-10-0-54-95-proxy` | Ubuntu 24.04.2 LTS |
| Proxy public IP | `103.147.35.95` | | |

### Database (`10.10.0.52`)

| Section | Value |
|-----|--------|
| DB Name | `mayaochaybo_vn_db` |
| DB User | `mayaochaybo_vn` |
| DB Password | Stored outside repository |
| Table prefix | `wp_` |
| DB Size | ~32 MB |

### WordPress Admin

| Section | Value |
|-----|--------|
| URL | `https://mayaochaybo.vn/wp-admin` |
| Site URL | `http://mayaochaybo.vn` |
| Home URL | `https://mayaochaybo.vn` |
| Username | `Hienx24` |
| Password | Stored outside repository |
| FS_METHOD | `direct` (allows writing directly from WP admin) |

---

## Infrastructure architecture

### Request stream

```
User → Cloudflare (SSL termination, CDN)
        → Proxy 10.10.0.56 (nginx 1.24.0, Let's Encrypt SSL)
            → Main server 10.10.0.26:80 (nginx:alpine Docker `wp-nginx`)
                → PHP-FPM Docker `wp-php` (port 9000, internal)
                    → Database 10.10.0.52:3306
```

### Docker (on 10.10.0.26)

| Container | Image | Status | Port |
|-----------|-------|--------|------|
| `wp-nginx` | nginx:alpine | Up 3 months | `0.0.0.0:80→80` |
| `wp-php` | websites-php (custom build) | Up 13 days | `9000/tcp` (internal) |

**Docker Compose** file: `/root/websites/docker-compose.yml`

**Dockerfile** (`/root/websites/Dockerfile`): PHP 8.2-fpm + mysqli/pdo_mysql extensions.  
PHP-FPM pool tuned: max_children=15, start_servers=4, min_spare=3, max_spare=8.  
Custom PHP settings: memory_limit=1024M, max_execution_time=300, post_max_size=128M, upload_max_filesize=128M, OPcache enabled.

### Proxy 10.10.0.56

- **nginx 1.24.0** on Ubuntu, not Docker
- Proxy configuration: `/etc/nginx/conf.d/mayaochaybo.vn.conf`
- Direct HTTP pass proxy `http://10.10.0.26` (client_max_body_size 32M)
- **Let's Encrypt SSL** for mayaochaybo.vn (ECDSA key, automatically renewed)
- Cert at: `/etc/letsencrypt/live/mayaochaybo.vn/`
- UFW firewall: only open ports 22, 80, 443 (Nginx Full)
- Disk: 48GB (25% used, 34GB free)
- RAM: 3.8GB

### Main server 10.10.0.26

- Disk: 48GB **(93% used — only 3.5GB left! ⚠️)**
- RAM: 5.8GB (1.8GB used)
- Site source: `/root/websites/sites/mayaochaybo.vn/`
- Site size: ~928MB (uploads: 496MB)

---

## Shared-resource warning

The PHP-FPM container and parts of the host infrastructure are shared. Keep every
change scoped to `mayaochaybo.vn`, and do not restart or modify shared services
without checking and stating the impact on other websites.

The main server is close to capacity at 93% disk usage. Warn the user before
running disk-intensive operations, creating large backups, or generating large
caches, logs, or temporary files.

---

## Website configuration

### Plugins are active

| Plugins | Purpose |
|--------|----------|
| Contact Form 7 | Contact form |
| Duplicator Pro | Backup & migration |
| Nextend Facebook Connect | Social login Facebook |
| Offload Media Cloud Storage | Offload media to Cloudflare R2 |
| TinyMCE Advanced | Advanced Editor |
| WooCommerce | E-commerce |
| Yoast SEO Premium | SEO |
| Yoast SEO (free) | SEO (dependency) |
| WP File Manager | Manage files via WP admin |

### Theme

- **Flatsome** (parent) + **Flatsome Child** 3.0 (active)
- File child theme: `/root/websites/sites/mayaochaybo.vn/wp-content/themes/flatsome-child/`

### Cloudflare R2 (Media Offload)

- Plugin: Offload Media Cloud Storage
- Account ID: `31f48e75fd61f2011365efe121e99942`
- Access Key: `56e703d869dc043c384f1b67196ff608`
- ⚠️ **Incomplete configuration**: DOMAIN, BUCKET, ENDPOINT are empty in wp-config

### FastCGI Cache

- Cache zone: `mayaochaybo_vn` (100MB)
- Cache TTL: **6 hours**
- Cache inactive: 24 hours
- Bypass: POST requests, query strings, wp-admin, logged-in users
- Cache path: `/var/cache/nginx/mayaochaybo.vn` (inside the container)

---

## Database

### Connection information

- Host: `10.10.0.52`
- Port: `3306` (default)
- Charset: `utf8mb4`
- DB size: **31.9 MB**

### Main data tables

| Table | Size | Rows | Notes |
|------|------|------|---------|
| `wp_options` | 10.1MB | 491 | Options + transients |
| `wp_posts` | 5.5MB | 1,915 | Articles + products |
| `wp_postmeta` | 2.5MB | 15,297 | Post metadata |
| `wp_acoofm_items` | 2.5MB | 877 | Media offload items |
| `wp_yoast_indexable` | 1.5MB | 763 | Yoast SEO index |
| `wp_yoast_seo_links` | 0.4MB | 2,630 | SEO links |
| `wp_users` | 0MB | **1 user** | There is only 1 admin |

---

## ⚠️ Issues to note

### Serious

1. **Main server disk 93% (3.5GB remaining)**
The site uses ~928MB, including 496MB of uploads. Check free space before backups,
plugin extraction, media processing, or other disk-intensive work.

2. **WordPress security keys USING DEFAULT VALUE**
`AUTH_KEY`, `SECURE_AUTH_KEY`, `LOGGED_IN_KEY`, `NONCE_KEY` and the salts are all `'put your unique phrase here'`.
→ Need to generate new keys from https://api.wordpress.org/secret-key/1.1/salt/

3. **No backup system**
Can't see the backup folder, Duplicator Pro is installed but the backups list is empty. There is no cron system to backup the database.

4. **wp-cron over HTTP, not through system cron**
WP-Cron is triggered by HTTP request (from proxy), not via crontab. Unstable for scheduled tasks.

### Moderate

5. **Cloudflare R2 configuration is not complete**
`ADVMO_CLOUDFLARE_R2_DOMAIN`, `BUCKET`, `ENDPOINT` are blank → media offload may not work properly.

6. **Site URL is HTTP, Home URL is HTTPS**
`WP_SITEURL` returns `http://mayaochaybo.vn` → may cause mixed content issues.

7. **No process manager** (PM2/Supervisor) to monitor containers.

### Minor

8. **PHP opcache** is enabled but there is no Redis/Memcached object cache.

---

## Important folder

```
/root/websites/
├── docker-compose.yml          # Docker Compose config
├── Dockerfile                   # PHP-FPM image build
├── nginx/
│   ├── sites/                   # Per-site Nginx configuration
│   │   └── mayaochaybo.vn.conf
│   └── cache/                   # FastCGI cache
└── sites/
    └── mayaochaybo.vn/
        ├── wp-config.php        # WP config (DB, keys, R2)
        ├── wp-content/
        │   ├── plugins/         # 12 plugins
        │   ├── themes/
        │   │   ├── flatsome/          # Parent theme
        │   │   └── flatsome-child/    # Active child theme
        │   └── uploads/         # 496MB media
        └── .env                 # DB information; not used by WordPress
```

### On proxy (10.10.0.56)

```
/etc/nginx/conf.d/mayaochaybo.vn.conf   # Proxy config → upstream 10.10.0.26
/etc/letsencrypt/live/mayaochaybo.vn/   # SSL certificates
/var/log/nginx/mayaochaybo.vn_access.log
/var/log/nginx/mayaochaybo.vn_error.log
```

---

## 🚨 Website's own cache

After editing the code, database, menu or theme of this website, always remove FastCGI
cache to see changes immediately. Cache automatically expires after 6 hours if it
is not cleared manually.

```bash
ssh root@10.10.0.26 "docker exec wp-nginx sh -c 'rm -rf /var/cache/nginx/mayaochaybo.vn/*'"
```

---

## Note when operating

- **Edit code**: SSH to `10.10.0.26`, edit file in `/root/websites/sites/mayaochaybo.vn/`. If outside the local network, SSH through proxy `10.10.0.56`.
- **Restart nginx**: `docker exec wp-nginx nginx -s reload` (no need to restart the container)
- **Restart PHP-FPM**: `docker restart wp-php` is a shared-service operation. Do
  not run it unless required, and state the cross-site impact first.
- **Delete FastCGI cache**: `docker exec wp-nginx sh -c 'rm -rf /var/cache/nginx/mayaochaybo.vn/*'`
- **Check nginx error**: `docker logs wp-nginx --tail 50`
- **Database**: Only accessible from internal sources (10.10.0.x). Do not expose to the internet.
- **Cloudflare**: SSL terminated at Cloudflare → Proxy receives HTTP (port 80), but has Let's Encrypt as fallback.
- **Manual WP-Cron**: `curl https://mayaochaybo.vn/wp-cron.php?doing_wp_cron=$(date +%s)` (run from proxy or main server if needed)

<!-- WEBSITE_REGISTRY_START -->
## Central website registry

Generated from the latest `website_configs` record. From this website folder,
run `ruby ../scripts/website_registry.rb sync domain=mayaochaybo.vn` to refresh only this website block. Local notes outside
the markers are preserved.

| Field | Value |
|-------|-------|
| Website registry ID | 29 |
| Configuration registry ID | 143 |
| Configuration status | pending |
| Display name | mayaochaybo-vn |
| Brand name | Not configured |
| WordPress | Yes |
| CDN enabled | Yes |
| N8N capable | No |
| Nginx cache status | HIT |
| Cloudflare cache status | DYNAMIC |
| Application port | 8004 |
| Root directory | /root/websites |
| WordPress content directory | /root/websites/sites/mayaochaybo.vn/wp-content |
| Source directory | /root/websites/sites/mayaochaybo.vn |
| Root folder | Not configured |
| Source folder | Not configured |
| WordPress content folder | Not configured |
| Website host registry ID | 18 |
| Website host private IP | 10.10.0.26 |
| Website host public IP | Not configured |
| Website host setup complete | Not configured |
| Proxy registry ID | 14 |
| Proxy private IP | 10.10.0.56 |
| Proxy public IP | 103.147.35.95 |
| Database host registry ID | 3 |
| Database endpoint | Not configured |
| Database host private IP | 10.10.0.52 |
| Database host public IP | Not configured |
| Database host type | local |
| Database container | ukw8w004c0s88gosw88ggswk |
| Cloudflare account registry ID | 4 |
| Cloudflare account ID | 31f48e75fd61f2011365efe121e99942 |

### Credential availability

| Credential | Stored in registry |
|------------|--------------------|
| Website admin credentials | Yes |
| Website database password | Yes |
| Database root password | Yes |
| Cloudflare API token | Yes |
| Cloudflare global API key | Yes |
| Cloudflare R2 credentials | Yes |

Credentials are intentionally excluded from documentation. Retrieve a
Cloudflare API token only when an explicit task requires it:

```bash
ruby ../scripts/website_registry.rb cloudflare-token mayaochaybo.vn
```

Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
<!-- WEBSITE_REGISTRY_END -->
