# WordPress → Next.js + Payload CMS Migration Guide

> Hướng dẫn chuyển website WordPress/WooCommerce sang hệ thống multi-tenant Next.js + Payload CMS.
> **Nguyên tắc:** Migrate trực tiếp từ website WordPress đang chạy — lấy đúng URL, tiêu đề, nội dung, ảnh, tag.

> [!IMPORTANT]
> Đây là tài liệu thiết kế lịch sử, không phải production runbook. Với migration
> `mayao*.vn`, phải dùng
> `.codex/skills/migrate-wordpress-to-x24sport-tenant/SKILL.md`. Nếu URL hiện tại
> có thể tái tạo trên Next.js, URL đó phải được phục vụ trực tiếp bằng `200`; không
> chuyển sang cấu trúc `/san-pham/<slug>/` chỉ để khớp template mới.

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Bước 1: Tạo Next.js frontend cho tenant mới](#2-bước-1-tạo-nextjs-frontend)
3. [Bước 2: Tạo tenant trong Payload CMS](#3-bước-2-tạo-tenant-trong-payload-cms)
4. [Bước 3: Migrate sản phẩm từ WordPress live → Payload](#4-bước-3-migrate-sản-phẩm)
5. [Bước 4: Bảo toàn URL cũ (redirect map)](#5-bước-4-bảo-toàn-url-cũ)
6. [Bước 5: Deploy frontend lên production](#6-bước-5-deploy-frontend)
7. [Bước 6: Switch & verify](#7-bước-6-switch--verify)
8. [Site-specific plans](#8-site-specific-plans)
9. [Troubleshooting](#9-troubleshooting)
10. [Script: migrator hoàn chỉnh](#10-script-hoàn-chỉnh)

---

## 1. Tổng quan

```
                  ┌──────────────────────┐
                  │   WordPress LIVE      │
                  │  (WooCommerce + CDN)  │
                  │  mayaobongda.vn       │
                  └─────────┬────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         (1) WP REST   (2) Download   (3) Đọc tags,
          API lấy       ảnh từ CDN    categories,
          products      (wp-content/   meta
          (JSON)        uploads/)
              │             │             │
              ▼             ▼             ▼
         ┌──────────────────────────────────┐
         │        MIGRATION SCRIPT          │
         │  - HTML → Lexical converter      │
         │  - Search tag extractor          │
         │  - Idempotent (skip by SKU)      │
         └──────────────┬───────────────────┘
                        │
              ┌─────────┼─────────┐
              │                   │
         (4) Upload ảnh     (5) POST product
          → R2 storage       → Payload CMS
              │                   │
              ▼                   ▼
         ┌──────────────────────────────────┐
         │       Payload CMS + R2           │
         │  static.x24sport.vn/<tenant>/    │
         └──────────────┬───────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │    Next.js Frontend (tenant)     │
         │    mayaobongda.vn                │
         └──────────────────────────────────┘
```

### Dữ liệu lấy từ WordPress live

| Dữ liệu | Nguồn | Format |
|---------|-------|--------|
| Tên, slug, SKU, giá | WooCommerce REST API `/wp-json/wc/v3/products` | JSON |
| Description (HTML) | WooCommerce API | HTML |
| Short description | WooCommerce API | Text |
| Categories & tags | WooCommerce API + WordPress terms | JSON |
| Ảnh sản phẩm (gallery) | CDN/website URL (từ API) | Download → re-upload |
| Meta data | WordPress post meta (nếu cần) | Key-value |

---

## 2. Bước 1: Tạo Next.js frontend

### 2.1 Copy từ template `mayaocaulong.vn/`

```bash
cp -r mayaocaulong.vn/ <domain-moi>/
cd <domain-moi>
pnpm install
```

### 2.2 Những file phải sửa

| File | Thay đổi |
|------|----------|
| `package.json` | `name` → `<tenant>-frontend`, port trong `dev` script |
| `Dockerfile` | `EXPOSE <port>` |
| `.env.example` | `TENANT_SLUG=<slug>` |
| `src/app/layout.tsx` | `metadata`: title + description cho sport mới |
| `src/app/styles.css` | `:root` variables: `--accent`, `--accent-dark`, `--court`, `--court-soft` (đổi màu theo sport) |
| `src/lib/content.ts` | `getTenantSlug()`: thêm `if (host?.includes('<domain>')) return '<slug>'`. Đổi fallback data |
| `src/lib/catalog-filters.ts` | Filter slugs + tags cho sport mới |
| `src/app/_components/site-header.tsx` | Brand name (2 chữ viết tắt), nav links, catalog dropdown |
| `src/app/_components/info-pages.tsx` | Brand name, email, footer info |
| `src/app/_components/contact.ts` | Số phone (nếu khác) |
| `src/app/page.tsx` | Toàn bộ content: headline, hero, testimonials, FAQs |
| `src/app/san-pham/page.tsx` | Metadata |
| `src/app/san-pham/[slug]/page.tsx` | Brand name, specs |
| Các info pages | Tên file + nội dung |

### 2.3 Bảng màu theo sport

| Sport | `--accent` | `--court` | `--court-soft` |
|-------|-----------|----------|---------------|
| Pickleball | `#2e7d32` | `#1b5e20` | `#dcedc8` |
| Bóng đá | `#1565c0` | `#0d47a1` | `#e3f2fd` |
| Bóng rổ | `#e65100` | `#bf360c` | `#fbe9e7` |
| Bóng chuyền | `#f6c445` | `#e6a800` | `#fff8e1` |
| Cầu lông | `#df3f32` | `#aa2119` | `#fce4e4` |

### 2.4 Build local verify

```bash
cd <domain>
pnpm build   # Phải pass, 0 errors
```

---

## 3. Bước 2: Tạo tenant trong Payload CMS

**Script tự động làm bước này — không cần làm thủ công.**

Script `migrate-from-wp.py` sẽ tự động:
1. Kiểm tra tenant đã tồn tại chưa (theo `--tenant-slug`)
2. Nếu chưa có → tự động tạo với brand info phù hợp
3. Nếu đã có → dùng luôn

```bash
# Script tự tạo tenant + migrate sản phẩm trong 1 lệnh:
python3 scripts/migrate-from-wp.py \
  --wp-url https://mayaobongda.vn \
  --cms-api http://10.10.0.28:3001 \
  --tenant-slug mayaobongda \
  --tenant-domain mayaobongda.vn \
  --sport football \
  --limit 3
```

Nếu muốn tạo tenant thủ công (không qua script):

```bash
TOKEN=$(curl -s -X POST http://<cms>:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hacadostore.local","password":"<password>"}' | jq -r '.token')

curl -s -X POST http://<cms>:3001/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "May Ao Bong Da",
    "slug": "mayaobongda",
    "domains": [{"domain": "mayaobongda.vn"}],
    "brand": {
      "headline": "Ao bong da dat may cho CLB & doi nhom",
      "subheadline": "Form nhe, mau sac net, in ten so va logo cho cau lac bo.",
      "primaryColor": "#111827",
      "accentColor": "#1565c0",
      "style": "flevo-inspired"
    }
  }' | jq '.doc.id'
```

---

## 4. Bước 3: Migrate sản phẩm

### 4.1 Quy trình cho mỗi sản phẩm

```
1. Đọc product từ WooCommerce API → name, slug, sku, price, description (HTML), 
   short_description, images[], categories[], tags[]
   
2. Check Payload: GET /api/products?where[sku][equals]=<SKU>
   → Tồn tại → SKIP
   → Chưa có → tiếp tục

3. Với mỗi ảnh trong product.images[]:
   a. Lấy URL ảnh từ WordPress CDN (VD: https://<domain>/wp-content/uploads/...)
   b. Download ảnh về buffer
   c. Upload lên Payload Media API với tenant ID
   d. Lưu media ID

4. Convert description HTML → Lexical rich text

5. Extract search tags từ:
   a. WordPress product tags (từ API)
   b. Tên sản phẩm (parse màu sắc)
   c. Short description

6. POST /api/products → tạo sản phẩm mới
```

### 4.2 Ảnh: download từ WordPress CDN → upload lên R2

**Nguyên tắc:** Lấy URL ảnh trực tiếp từ website WordPress đang chạy, không cần file local.

```python
import requests
from io import BytesIO

def migrate_product_images(wp_product, cms_api, token, tenant_id):
    """
    wp_product: dict từ WooCommerce API
    Returns: list of Payload media IDs
    """
    media_ids = []
    
    for img in wp_product.get('images', []):
        # 1. Lấy URL ảnh từ WordPress
        image_url = img['src']  # URL đầy đủ từ CDN/wp-content
        
        # 2. Download ảnh về memory (không cần lưu file)
        r = requests.get(image_url, timeout=30)
        r.raise_for_status()
        
        # 3. Upload lên Payload Media API
        alt_text = img.get('alt') or wp_product['name']
        
        resp = requests.post(
            f"{cms_api}/api/media",
            headers={"Authorization": f"Bearer {token}"},
            files={
                "file": (
                    image_url.split('/')[-1],  # filename
                    BytesIO(r.content),         # binary data
                    f"image/{image_url.split('.')[-1]}"  # mime type
                )
            },
            data={
                "_payload": json.dumps({
                    "alt": alt_text,
                    "tenant": tenant_id
                })
            }
        )
        media_id = resp.json()['doc']['id']
        media_ids.append(media_id)
        print(f"  🖼️  {image_url.split('/')[-1]} → media id={media_id}")
    
    return media_ids
```

**Điểm quan trọng:**
- Ảnh được download trực tiếp từ URL WordPress đang chạy (CDN hoặc wp-content)
- Upload thẳng lên Payload → tự động lưu vào R2 với tenant prefix
- Không cần lưu ảnh xuống local, xử lý hoàn toàn in-memory
- Payload response trả về URL mới trên `static.x24sport.vn/<tenant>/...`

### 4.3 HTML description → Lexical converter

```python
import re, json

def html_to_lexical(html_str: str) -> dict:
    """Convert WordPress HTML description → Payload Lexical rich text."""
    if not html_str:
        return empty_lexical()
    
    # Strip <figure><img> — ảnh đã vào gallery
    html_str = re.sub(r'<figure[^>]*>.*?</figure>', '', html_str, flags=re.DOTALL)
    html_str = re.sub(r'<img[^>]*/?>', '', html_str)
    html_str = html_str.strip()
    if not html_str:
        return empty_lexical()
    
    # Split thành paragraphs
    raw_paras = re.split(r'</?p[^>]*>', html_str)
    raw_paras = [p.strip() for p in raw_paras if p.strip()]
    
    children = []
    for para in raw_paras:
        parts = []
        rest = para
        
        while rest:
            # Parse <strong>
            bm = re.match(r'^(.*?)<strong>(.*?)</strong>(.*)', rest, re.DOTALL)
            # Parse <em>
            em = re.match(r'^(.*?)<em>(.*?)</em>(.*)', rest, re.DOTALL)
            
            if bm and (not em or bm.start() <= em.start()):
                if bm.group(1).strip():
                    parts.append({'type': 'text', 'text': bm.group(1).strip(), 'version': 1})
                if bm.group(2).strip():
                    parts.append({'type': 'text', 'text': bm.group(2).strip(), 'bold': True, 'version': 1})
                rest = bm.group(3)
            elif em:
                if em.group(1).strip():
                    parts.append({'type': 'text', 'text': em.group(1).strip(), 'version': 1})
                if em.group(2).strip():
                    parts.append({'type': 'text', 'text': em.group(2).strip(), 'italic': True, 'version': 1})
                rest = em.group(3)
            else:
                if rest.strip():
                    parts.append({'type': 'text', 'text': rest.strip(), 'version': 1})
                rest = ''
        
        children.append({
            'type': 'paragraph', 'format': '', 'direction': None,
            'indent': 0, 'version': 1,
            'children': parts or [{'type': 'text', 'text': '', 'version': 1}]
        })
    
    return {
        'root': {
            'type': 'root', 'format': '', 'direction': None,
            'indent': 0, 'version': 1,
            'children': children
        }
    }

def empty_lexical():
    return {
        'root': {
            'type': 'root', 'format': '', 'direction': None,
            'indent': 0, 'version': 1,
            'children': [{
                'type': 'paragraph', 'format': '', 'direction': None,
                'indent': 0, 'version': 1,
                'children': [{'type': 'text', 'text': '', 'version': 1}]
            }]
        }
    }
```

### 4.4 Search tag extractor

```python
KNOWN_COLORS = [
    'trắng', 'đỏ', 'hồng', 'xanh navy', 'xanh ngọc', 'xanh đậm',
    'xanh da trời', 'xanh', 'vàng', 'cam', 'đen', 'tím', 'xám',
    'xanh lá', 'xanh neon', 'xanh cyan', 'xanh lime', 'xanh teal',
    'xanh dương', 'xanh ve chai', 'tím than', 'tím navy',
    'hồng nhạt', 'xám nhạt', 'vàng nghệ', 'đỏ burgundy', 'đỏ ruby',
    'xanh mint', 'xanh bích', 'kem', 'nổi bật',
]

def extract_search_tags(name: str, short_desc: str, wp_tags: list = None) -> list:
    """Extract search tags từ tên sản phẩm, mô tả, và WordPress tags."""
    text = f"{name} {short_desc}".lower()
    tags = [c for c in KNOWN_COLORS if c in text]
    
    # Thêm WordPress tags (giữ nguyên tên tag)
    if wp_tags:
        for tag in wp_tags:
            tag_name = tag.get('name', '') if isinstance(tag, dict) else str(tag)
            if tag_name.strip():
                tags.append(tag_name.strip().lower())
    
    # Auto gradient nếu có ≥2 màu
    color_count = len([c for c in KNOWN_COLORS if c != 'nổi bật' and c in text])
    if color_count >= 2:
        tags.append('gradient')
    
    # Dedup, giữ thứ tự
    seen = set()
    result = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            result.append({'value': t})
    return result
```

### 4.5 Chạy test 1-3 sản phẩm trước

```bash
# Test 3 sản phẩm (tenant tự động tạo nếu chưa có)
python3 migrate.py \
  --wp-url https://mayaobongda.vn \
  --cms-api http://10.10.0.28:3001 \
  --tenant-slug mayaobongda \
  --tenant-domain mayaobongda.vn \
  --sport football \
  --limit 3
```

Sau đó verify trên frontend:
- `/san-pham` → thấy sản phẩm mới
- `/san-pham/<slug>` → ảnh hiển thị, mô tả đúng, giá đúng
- `/san-pham?filter=đỏ` → catalog filter hoạt động

---

## 5. Bước 4: Bảo toàn URL cũ

### 5.1 Redirect map (Nginx)

Sinh tự động từ danh sách sản phẩm đã migrate:

```python
# Dùng WooCommerce API lấy tất cả slugs
# Với mỗi product: old_slug → /san-pham/<old_slug>
for product in all_products:
    print(f"location = /{product['slug']}/ {{ return 301 /san-pham/{product['slug']}; }}")
```

### 5.2 Redirect cho shop/category pages

```nginx
# Trong Nginx conf
location = /shop/        { return 301 /san-pham; }
location = /shop          { return 301 /san-pham; }
location /danh-muc/       { return 301 /san-pham; }
location /product-category/ { return 301 /san-pham; }
location /product-tag/    { return 301 /san-pham; }
```

### 5.3 Redirect WordPress uploads → R2

Nếu đã migrate toàn bộ ảnh sang R2:
```nginx
location /wp-content/uploads/ {
    return 301 https://static.x24sport.vn/<tenant-slug>/;
}
```

---

## 6. Bước 5: Deploy frontend

### 6.1 Build Docker image

```bash
cd <domain>/
docker build -t <domain>-next:current .
```

### 6.2 Run container

**Nếu cùng host với CMS (10.10.0.28):**
```bash
# Thêm vào docker-compose.yml:
#   <service-name>:
#     build: ./<domain>/
#     environment:
#       PAYLOAD_API_URL: http://cms-api:3001
#       PORT: <port>
#       TENANT_SLUG: <slug>
#     ports:
#       - "<port>:<port>"

docker compose up -d --build <service-name>
```

**Nếu khác host:**
```bash
docker run -d --name <domain>-next --restart unless-stopped \
  -e PAYLOAD_API_URL=http://10.10.0.28:3001 \
  -e TENANT_SLUG=<slug> \
  -e PORT=3004 \
  -p 8000:3004 \
  <domain>-next:current
```

### 6.3 Cập nhật Nginx proxy (10.10.0.56)

```nginx
server {
    server_name <domain>.vn;

    # Redirect WordPress URLs → Next.js URLs
    include /etc/nginx/conf.d/<domain>-redirects.conf;

    location / {
        proxy_pass http://<nextjs-host>:<host-port>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.4 ⚠️ 2 lỗi deploy phổ biến

| Lỗi | Triệu chứng | Fix |
|-----|-------------|-----|
| `PAYLOAD_API_URL` sai | Frontend chỉ hiện fallback data (3 sản phẩm mẫu) | Cùng host Docker: `http://cms-api:3001`. Khác host: `http://10.10.0.28:3001` |
| Thiếu `PORT` env var | Connection reset, curl fail | Thêm `-e PORT=3004` vào docker run (phải khớp với EXPOSE) |

---

## 7. Bước 6: Switch & verify

### 7.1 Verify checklist

```bash
# 1. Frontend alive
curl -sI https://<domain>.vn/ | head -3

# 2. Sản phẩm từ CMS (không phải fallback)
curl -s https://<domain>.vn/san-pham | grep -c "SKU-REAL"  # > 0

# 3. Product detail
curl -sI https://<domain>.vn/san-pham/<slug> | grep "200"

# 4. Ảnh trên R2
curl -sI https://static.x24sport.vn/<tenant>/<image>.webp | grep "200"

# 5. Redirect cũ → mới
curl -sI https://<domain>.vn/<old-product-slug>/ | grep "301"

# 6. Mobile responsive — check manual
# 7. Không có error trong logs
ssh <host> 'docker logs --tail=50 <container>'
```

### 7.2 Keep WordPress backup

```nginx
# wp.<domain>.vn → WordPress cũ (không index)
server {
    server_name wp.<domain>.vn;
    add_header X-Robots-Tag "noindex, nofollow" always;
    location / {
        proxy_pass http://<old-wp-host>;
    }
}
```

---

## 8. Site-specific plans

### 8.1 mayaobongda.vn (Bóng đá — 250 SP)

| Mục | Giá trị |
|-----|--------|
| WordPress host | `10.10.0.58` |
| WP API URL | `https://mayaobongda.vn/wp-json/wc/v3/` |
| Ảnh nguồn | `https://mayaobongda.vn/wp-content/uploads/...` |
| Accent màu | `#1565c0` (xanh dương) |
| Sport | `football` |
| Slug pattern | `ao-bong-da-...` (dài, mô tả) |
| Ưu tiên deploy host | `10.10.0.28` (cùng CMS) |

### 8.2 mayaobongro.vn (Bóng rổ — 479 SP)

| Mục | Giá trị |
|-----|--------|
| WordPress host | `10.10.0.26` |
| WP API URL | `https://mayaobongro.vn/wp-json/wc/v3/` |
| Ảnh nguồn | `https://mayaobongro.vn/wp-content/uploads/...` |
| Ảnh generated sẵn | ✅ Có ~944 webp trong operations → nên dùng ảnh này thay vì ảnh WP cũ |
| Accent màu | `#e65100` (cam) |
| Sport | `basketball` |
| SKU pattern | `X24-BR-XXX` |
| Slug pattern | `bo-quan-ao-bong-ro-...` |
| Ưu tiên deploy host | `10.10.0.28` (cùng CMS) |

### 8.3 mayaopickleball.vn (Pickleball — 600 SP) ✅ ĐÃ MIGRATE

| Mục | Giá trị |
|-----|--------|
| WordPress host | `10.10.0.27` |
| Deploy host | `10.10.0.27` (giữ nguyên host) |
| Accent | `#2e7d32` |
| Sport | `pickleball` |
| Status | ✅ 1 SP test OK, sẵn sàng bulk |

---

## 9. Troubleshooting

| # | Triệu chứng | Nguyên nhân | Fix |
|---|------------|-------------|-----|
| 1 | Frontend chỉ hiện 3 SP mẫu | `PAYLOAD_API_URL` không reachable | Sửa thành IP thật hoặc Docker hostname đúng |
| 2 | `curl` bị connection reset | PORT env var thiếu/không khớp | `-e PORT=3004` khớp với port mapping |
| 3 | Upload media 500 "require tenant" | Dùng `-F 'tenant=3'` (form string) | Dùng `-F '_payload={"tenant":3,...}'` |
| 4 | Ảnh upload sai tenant folder | Tenant ID sai | Check `GET /api/tenants` lấy đúng ID |
| 5 | Catalog filter không lọc được | `searchTags` rỗng hoặc tag không khớp | Extract tags từ tên SP + WP tags |
| 6 | DB schema conflict local | Drizzle version mismatch | Dùng REST API thay vì Payload local API |
| 7 | WordPress API 401 unauthorized | Thiếu WooCommerce API key | Tạo API key trong WooCommerce → Settings → Advanced → REST API |

---

## 10. Script hoàn chỉnh

Script Python migrate sản phẩm từ WordPress live → Payload CMS.

**Tính năng:**
- Đọc sản phẩm trực tiếp từ WooCommerce REST API
- Download ảnh từ WordPress CDN → upload lên Payload Media (R2)
- Convert HTML description → Lexical rich text
- Extract search tags từ tên SP + WordPress tags
- Idempotent: skip sản phẩm đã tồn tại (theo SKU)
- Chạy được với `--limit N` để test trước

### Cài đặt

```bash
pip install requests
```

### Sử dụng

```bash
# Test 3 sản phẩm
python3 migrate.py \
  --wp-url https://mayaobongda.vn \
  --cms-api http://10.10.0.28:3001 \
  --tenant-id 4 \
  --sport football \
  --limit 3

# Migrate toàn bộ
python3 migrate.py \
  --wp-url https://mayaobongda.vn \
  --cms-api http://10.10.0.28:3001 \
  --tenant-id 4 \
  --sport football
```

### Source code

```python
#!/usr/bin/env python3
"""
WordPress Live → Payload CMS Product Migrator
Dùng WooCommerce REST API + Payload REST API.
Không cần file local — tất cả lấy trực tiếp từ website đang chạy.
"""
import argparse, json, os, re, sys, time
from io import BytesIO
import requests

# ============================================================
# HTML → Lexical Converter
# ============================================================

def html_to_lexical(html_str):
    if not html_str:
        return empty_lexical()
    html_str = re.sub(r'<figure[^>]*>.*?</figure>', '', html_str, flags=re.DOTALL)
    html_str = re.sub(r'<img[^>]*/?>', '', html_str)
    html_str = html_str.strip()
    if not html_str:
        return empty_lexical()
    raw_paras = re.split(r'</?p[^>]*>', html_str)
    raw_paras = [p.strip() for p in raw_paras if p.strip()]
    children = []
    for para in raw_paras:
        parts = []
        rest = para
        while rest:
            bm = re.match(r'^(.*?)<strong>(.*?)</strong>(.*)', rest, re.DOTALL)
            em = re.match(r'^(.*?)<em>(.*?)</em>(.*)', rest, re.DOTALL)
            if bm and (not em or bm.start() <= em.start()):
                if bm.group(1).strip():
                    parts.append({'type':'text','text':bm.group(1).strip(),'version':1})
                if bm.group(2).strip():
                    parts.append({'type':'text','text':bm.group(2).strip(),'bold':True,'version':1})
                rest = bm.group(3)
            elif em:
                if em.group(1).strip():
                    parts.append({'type':'text','text':em.group(1).strip(),'version':1})
                if em.group(2).strip():
                    parts.append({'type':'text','text':em.group(2).strip(),'italic':True,'version':1})
                rest = em.group(3)
            else:
                if rest.strip():
                    parts.append({'type':'text','text':rest.strip(),'version':1})
                rest = ''
        children.append({
            'type':'paragraph','format':'','direction':None,'indent':0,'version':1,
            'children': parts or [{'type':'text','text':'','version':1}]
        })
    return {'root':{'type':'root','format':'','direction':None,'indent':0,'version':1,'children':children}}

def empty_lexical():
    return {'root':{'type':'root','format':'','direction':None,'indent':0,'version':1,
        'children':[{'type':'paragraph','format':'','direction':None,'indent':0,'version':1,
        'children':[{'type':'text','text':'','version':1}]}]}}

# ============================================================
# Search Tag Extractor
# ============================================================

KNOWN_COLORS = [
    'trắng','đỏ','hồng','xanh navy','xanh ngọc','xanh đậm','xanh da trời','xanh',
    'vàng','cam','đen','tím','xám','xanh lá','xanh neon','xanh cyan','xanh lime',
    'xanh teal','xanh dương','xanh ve chai','tím than','tím navy','hồng nhạt',
    'xám nhạt','vàng nghệ','đỏ burgundy','đỏ ruby','xanh mint','xanh bích','kem','nổi bật',
]

def extract_search_tags(name, short_desc, wp_tags=None):
    text = f"{name} {short_desc}".lower()
    tags = [c for c in KNOWN_COLORS if c in text]
    if wp_tags:
        for tag in wp_tags:
            tn = tag.get('name','') if isinstance(tag, dict) else str(tag)
            if tn.strip():
                tags.append(tn.strip().lower())
    if len([c for c in KNOWN_COLORS if c != 'nổi bật' and c in text]) >= 2:
        tags.append('gradient')
    seen = set()
    result = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            result.append({'value': t})
    return result

# ============================================================
# API Helpers
# ============================================================

class PayloadCMS:
    def __init__(self, api_url, email, password):
        self.api = api_url.rstrip('/')
        self.token = self._login(email, password)
        self.session = requests.Session()
        self.session.headers.update({'Authorization': f'Bearer {self.token}'})

    def _login(self, email, password):
        r = requests.post(f'{self.api}/api/users/login',
            json={'email': email, 'password': password})
        r.raise_for_status()
        return r.json()['token']

    def product_exists(self, sku):
        r = self.session.get(f'{self.api}/api/products',
            params={'where[sku][equals]': sku, 'limit': '1'})
        return r.json().get('totalDocs', 0) > 0

    def upload_media(self, image_url, alt_text, tenant_id):
        """Download ảnh từ URL → upload lên Payload (qua R2)"""
        # Download từ WordPress CDN
        img_resp = requests.get(image_url, timeout=30)
        img_resp.raise_for_status()
        filename = image_url.split('/')[-1].split('?')[0]
        ext = filename.split('.')[-1].lower() if '.' in filename else 'jpg'
        mime = f'image/{ext}' if ext in ('jpg','jpeg','png','webp','gif') else 'image/jpeg'

        # Upload lên Payload
        r = self.session.post(f'{self.api}/api/media',
            files={'file': (filename, BytesIO(img_resp.content), mime)},
            data={'_payload': json.dumps({'alt': alt_text, 'tenant': tenant_id})})
        r.raise_for_status()
        return r.json()['doc']

    def create_product(self, data):
        r = self.session.post(f'{self.api}/api/products', json=data)
        r.raise_for_status()
        return r.json()['doc']


class WordPressWC:
    def __init__(self, wp_url, consumer_key, consumer_secret):
        self.api = wp_url.rstrip('/') + '/wp-json/wc/v3'
        self.auth = (consumer_key, consumer_secret)

    def get_products(self, page=1, per_page=100):
        r = requests.get(f'{self.api}/products',
            auth=self.auth,
            params={'page': page, 'per_page': per_page, 'status': 'publish'})
        r.raise_for_status()
        return r.json()

    def get_all_products(self):
        products = []
        page = 1
        while True:
            batch = self.get_products(page=page)
            if not batch:
                break
            products.extend(batch)
            print(f"  📄 Page {page}: {len(batch)} products (total: {len(products)})")
            if len(batch) < 100:
                break
            page += 1
            time.sleep(0.3)
        return products


# ============================================================
# Main
# ============================================================

def main():
    p = argparse.ArgumentParser(description='WordPress Live → Payload CMS Migrator')
    p.add_argument('--wp-url', required=True, help='WordPress site URL (VD: https://mayaobongda.vn)')
    p.add_argument('--wp-key', help='WooCommerce Consumer Key (or env WC_KEY)')
    p.add_argument('--wp-secret', help='WooCommerce Consumer Secret (or env WC_SECRET)')
    p.add_argument('--cms-api', required=True, help='Payload CMS API URL')
    p.add_argument('--cms-email', default='admin@hacadostore.local')
    p.add_argument('--cms-password', help='CMS password (or env CMS_PASSWORD)')
    p.add_argument('--tenant-id', type=int, required=True, help='Tenant ID in Payload CMS')
    p.add_argument('--sport', required=True, choices=['badminton','volleyball','football','basketball','running','pickleball'])
    p.add_argument('--limit', type=int, default=0, help='Limit products (0=all)')
    p.add_argument('--skip-images', action='store_true', help='Skip image upload')
    args = p.parse_args()

    # Credentials
    wp_key = args.wp_key or os.environ.get('WC_KEY')
    wp_secret = args.wp_secret or os.environ.get('WC_SECRET')
    cms_password = args.cms_password or os.environ.get('CMS_PASSWORD')
    if not wp_key or not wp_secret:
        print("❌ Cần WooCommerce API key. Set --wp-key/--wp-secret hoặc env WC_KEY/WC_SECRET")
        print("   Tạo key: WordPress Admin → WooCommerce → Settings → Advanced → REST API")
        sys.exit(1)
    if not cms_password:
        print("❌ Cần CMS password. Set --cms-password hoặc env CMS_PASSWORD")
        sys.exit(1)

    # Connect
    print(f"🔌 Kết nối WordPress: {args.wp_url}")
    wc = WordPressWC(args.wp_url, wp_key, wp_secret)
    print(f"🔌 Kết nối Payload CMS: {args.cms_api}")
    cms = PayloadCMS(args.cms_api, args.cms_email, cms_password)

    # Fetch products
    print("\n📥 Đang lấy sản phẩm từ WordPress...")
    all_products = wc.get_all_products()
    if args.limit > 0:
        all_products = all_products[:args.limit]
    print(f"   Tổng: {len(all_products)} sản phẩm\n")

    created = 0
    skipped = 0
    for i, wp_prod in enumerate(all_products):
        sku = wp_prod.get('sku', '')
        name = wp_prod.get('name', 'No Name')

        if not sku:
            print(f"⚠️  [{i+1}/{len(all_products)}] '{name}' — KHÔNG CÓ SKU, bỏ qua")
            continue

        if cms.product_exists(sku):
            print(f"⏭️  [{i+1}/{len(all_products)}] SKU {sku} — đã tồn tại, skip")
            skipped += 1
            continue

        print(f"📦 [{i+1}/{len(all_products)}] {name} (SKU: {sku})")

        # Migrate images
        media_ids = []
        if not args.skip_images:
            for img in wp_prod.get('images', []):
                try:
                    doc = cms.upload_media(
                        img['src'],
                        img.get('alt') or name,
                        args.tenant_id
                    )
                    media_ids.append(doc['id'])
                    print(f"  🖼️  {doc['url'][:70]}...")
                except Exception as e:
                    print(f"  ❌ Upload ảnh lỗi: {e}")

        # Build product payload
        description_html = wp_prod.get('description', '')
        payload = {
            'name': name,
            'slug': wp_prod.get('slug', ''),
            'sku': sku,
            'sport': args.sport,
            'price': int(float(wp_prod.get('regular_price', '0') or '200000')),
            'shortDescription': re.sub(r'<[^>]+>', '', wp_prod.get('short_description', '')),
            'description': html_to_lexical(description_html),
            'searchTags': extract_search_tags(
                name,
                wp_prod.get('short_description', ''),
                wp_prod.get('tags', [])
            ),
            'gallery': media_ids,
            'badges': [{'label': 'Đặt may'}, {'label': 'In tên số'}],
            'featured': True,
            'tenant': args.tenant_id,
        }
        if wp_prod.get('sale_price'):
            payload['compareAtPrice'] = int(float(wp_prod['sale_price']))
        payload = {k: v for k, v in payload.items() if v is not None}

        # Create product
        try:
            doc = cms.create_product(payload)
            print(f"  ✅ id={doc['id']} slug={doc['slug']} gallery={len(media_ids)} imgs")
            created += 1
        except Exception as e:
            print(f"  ❌ Tạo product lỗi: {e}")

        time.sleep(0.5)  # Rate limit

    print(f"\n{'='*50}")
    print(f"✅ Done: {created} created | ⏭️ {skipped} skipped | 📦 {len(all_products)} total")

if __name__ == '__main__':
    main()
```

### Cách lấy WooCommerce API Key

1. Vào WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Click "Add Key"
3. Description: `Migration Script`, User: admin, Permissions: Read
4. Copy Consumer Key và Consumer Secret
5. Set environment variables:
```bash
export WC_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export WC_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export CMS_PASSWORD='<retrieve-from-approved-secret-source>'
```

---

> **Last updated:** 2026-07-15
> **Đã migrate:** mayaopickleball.vn (pickleball, 1 SP test OK)
> **Kế hoạch:** mayaobongda.vn (football, 250 SP) | mayaobongro.vn (basketball, 479 SP)
