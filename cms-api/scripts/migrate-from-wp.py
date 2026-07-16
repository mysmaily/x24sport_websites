#!/usr/bin/env python3
"""
WordPress Live → Payload CMS Product Migrator
Đọc sản phẩm trực tiếp từ WooCommerce REST API của website đang chạy,
download ảnh từ CDN, upload lên Payload CMS (R2).

Usage:
  # Test 3 sản phẩm (tenant tự động tạo nếu chưa có)
  python3 scripts/migrate-from-wp.py \
    --wp-url https://mayaobongda.vn \
    --cms-api http://10.10.0.28:3001 \
    --tenant-slug mayaobongda \
    --tenant-domain mayaobongda.vn \
    --sport football \
    --limit 3

  # Migrate toàn bộ
  python3 scripts/migrate-from-wp.py \
    --wp-url https://mayaobongda.vn \
    --cms-api http://10.10.0.28:3001 \
    --tenant-slug mayaobongda \
    --tenant-domain mayaobongda.vn \
    --sport football
"""
import argparse, json, os, re, sys, time
from io import BytesIO
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("❌ Cần cài requests: pip install requests")
    sys.exit(1)


# ============================================================
# HTML → Lexical Rich Text Converter
# ============================================================

def html_to_lexical(html_str):
    """Convert WordPress HTML description → Payload Lexical JSON."""
    if not html_str:
        return _empty_lexical()

    # Strip figure/img tags (images are in gallery)
    html_str = re.sub(r'<figure[^>]*>.*?</figure>', '', html_str, flags=re.DOTALL)
    html_str = re.sub(r'<img[^>]*/?>', '', html_str)
    html_str = html_str.strip()
    if not html_str:
        return _empty_lexical()

    # Split into paragraphs
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


def _empty_lexical():
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


# ============================================================
# Search Tag Extractor
# ============================================================

KNOWN_COLORS = [
    'trắng', 'đỏ', 'hồng', 'xanh navy', 'xanh ngọc', 'xanh đậm',
    'xanh da trời', 'xanh', 'vàng', 'cam', 'đen', 'tím', 'xám',
    'xanh lá', 'xanh neon', 'xanh cyan', 'xanh lime', 'xanh teal',
    'xanh dương', 'xanh ve chai', 'tím than', 'tím navy',
    'hồng nhạt', 'xám nhạt', 'vàng nghệ', 'đỏ burgundy', 'đỏ ruby',
    'xanh mint', 'xanh bích', 'kem', 'nổi bật',
]

def extract_search_tags(name, short_desc, wp_tags=None):
    """Extract search tags from product name, description, and WordPress tags."""
    text = f"{name} {short_desc}".lower()
    tags = [c for c in KNOWN_COLORS if c in text]

    # Add WordPress tags
    if wp_tags:
        for tag in wp_tags:
            tag_name = tag.get('name', '') if isinstance(tag, dict) else str(tag)
            if tag_name.strip():
                tags.append(tag_name.strip().lower())

    # Auto-detect gradient
    color_count = len([c for c in KNOWN_COLORS if c != 'nổi bật' and c in text])
    if color_count >= 2:
        tags.append('gradient')

    # Dedup preserving order
    seen = set()
    result = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            result.append({'value': t})
    return result


# ============================================================
# Payload CMS API Client
# ============================================================

class PayloadCMS:
    def __init__(self, api_url, email, password):
        self.api = api_url.rstrip('/')
        self.session = requests.Session()
        self.token = self._login(email, password)
        self.session.headers.update({
            'Authorization': f'Bearer {self.token}'
        })

    def _login(self, email, password):
        r = requests.post(
            f'{self.api}/api/users/login',
            json={'email': email, 'password': password},
            timeout=15
        )
        r.raise_for_status()
        data = r.json()
        if 'token' not in data:
            raise RuntimeError(f"Login failed: {data}")
        print(f"✅ CMS login OK (user: {data.get('user', {}).get('email', email)})")
        return data['token']

    # ---- Tenant management ----

    def find_tenant(self, slug):
        """Look up tenant by slug. Returns tenant dict or None."""
        r = self.session.get(
            f'{self.api}/api/tenants',
            params={'where[slug][equals]': slug, 'limit': '1'}
        )
        r.raise_for_status()
        docs = r.json().get('docs', [])
        return docs[0] if docs else None

    def ensure_tenant(self, slug, domain, name, accent_color, headline, subheadline):
        """Find existing tenant or create a new one. Returns tenant dict."""
        existing = self.find_tenant(slug)
        if existing:
            print(f"✅ Tenant '{slug}' đã tồn tại (id={existing['id']})")
            return existing

        print(f"🆕 Đang tạo tenant '{slug}'...")
        r = self.session.post(
            f'{self.api}/api/tenants',
            json={
                'name': name,
                'slug': slug,
                'domains': [{'domain': domain}],
                'brand': {
                    'headline': headline,
                    'subheadline': subheadline,
                    'primaryColor': '#111827',
                    'accentColor': accent_color,
                    'style': 'flevo-inspired',
                }
            }
        )
        r.raise_for_status()
        doc = r.json().get('doc', r.json())
        print(f"✅ Tenant created: id={doc['id']} slug={doc['slug']}")
        return doc

    # ---- Products ----

    def product_exists(self, sku):
        """Check if product with given SKU already exists."""
        r = self.session.get(
            f'{self.api}/api/products',
            params={'where[sku][equals]': sku, 'limit': '1'}
        )
        r.raise_for_status()
        return r.json().get('totalDocs', 0) > 0

    def upload_media(self, image_url, alt_text, tenant_id):
        """
        Download image from WordPress CDN → upload to Payload Media (R2).
        Returns: {'id': int, 'url': str, 'filename': str}
        """
        # Download from WordPress CDN
        img_resp = requests.get(image_url, timeout=30, headers={
            'User-Agent': 'WP-Migrator/1.0'
        })
        img_resp.raise_for_status()

        # Determine filename and mime type
        parsed = urlparse(image_url)
        filename = os.path.basename(parsed.path).split('?')[0]
        if not filename or '.' not in filename:
            filename = 'image.jpg'
        ext = filename.rsplit('.', 1)[-1].lower()
        mime_map = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
                     'webp': 'image/webp', 'gif': 'image/gif'}
        mime = mime_map.get(ext, 'image/jpeg')

        # Upload to Payload
        r = self.session.post(
            f'{self.api}/api/media',
            files={'file': (filename, BytesIO(img_resp.content), mime)},
            data={'_payload': json.dumps({'alt': alt_text, 'tenant': tenant_id})}
        )
        r.raise_for_status()
        data = r.json()
        if 'doc' not in data:
            raise RuntimeError(f"Media upload failed: {data}")
        return data['doc']

    def create_product(self, data):
        """Create product in Payload CMS."""
        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}
        r = self.session.post(
            f'{self.api}/api/products',
            json=data
        )
        r.raise_for_status()
        result = r.json()
        if 'doc' not in result:
            raise RuntimeError(f"Product creation failed: {result}")
        return result['doc']


# ============================================================
# WordPress WooCommerce API Client
# ============================================================

class WordPressWC:
    def __init__(self, wp_url, consumer_key, consumer_secret):
        self.api = wp_url.rstrip('/') + '/wp-json/wc/v3'
        self.auth = (consumer_key, consumer_secret)

    def get_products(self, page=1, per_page=100):
        r = requests.get(
            f'{self.api}/products',
            auth=self.auth,
            params={'page': page, 'per_page': per_page, 'status': 'publish'},
            timeout=30
        )
        r.raise_for_status()
        return r.json()

    def get_all_products(self):
        """Fetch all published products with pagination."""
        products = []
        page = 1
        while True:
            batch = self.get_products(page=page)
            if not batch:
                break
            products.extend(batch)
            sys.stdout.write(f"\r  📄 Page {page}: {len(batch)} products (total: {len(products)})")
            sys.stdout.flush()
            if len(batch) < 100:
                break
            page += 1
            time.sleep(0.3)
        print()
        return products


# ============================================================
# Main
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description='WordPress Live → Payload CMS Product Migrator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test 3 sản phẩm (tenant tự động tạo nếu chưa có)
  python3 scripts/migrate-from-wp.py \
    --wp-url https://mayaobongda.vn \
    --cms-api http://10.10.0.28:3001 \
    --tenant-slug mayaobongda \
    --tenant-domain mayaobongda.vn \
    --sport football \
    --limit 3

  # Migrate toàn bộ
  python3 scripts/migrate-from-wp.py \
    --wp-url https://mayaobongda.vn \
    --cms-api http://10.10.0.28:3001 \
    --tenant-slug mayaobongda \
    --tenant-domain mayaobongda.vn \
    --sport football

WooCommerce API Key: Tạo trong WP Admin → WooCommerce → Settings → Advanced → REST API
        """
    )

    # WordPress
    parser.add_argument('--wp-url', required=True,
                        help='WordPress site URL (e.g. https://mayaobongda.vn)')
    parser.add_argument('--wp-key', help='WooCommerce Consumer Key (or env WC_KEY)')
    parser.add_argument('--wp-secret', help='WooCommerce Consumer Secret (or env WC_SECRET)')

    # Payload CMS
    parser.add_argument('--cms-api', required=True,
                        help='Payload CMS API URL (e.g. http://10.10.0.28:3001)')
    parser.add_argument('--cms-email', default='admin@hacadostore.local')
    parser.add_argument('--cms-password', help='CMS password (or env CMS_PASSWORD)')

    # Migration settings
    parser.add_argument('--tenant-slug', required=True,
                        help='Tenant slug (e.g. mayaobongda). Auto-creates if not found.')
    parser.add_argument('--tenant-domain', required=True,
                        help='Tenant domain (e.g. mayaobongda.vn)')
    parser.add_argument('--tenant-name', default=None,
                        help='Tenant display name (auto-generated from domain if omitted)')
    parser.add_argument('--tenant-accent', default='#1565c0',
                        help='Accent color hex (default: #1565c0)')
    parser.add_argument('--sport', required=True,
                        choices=['badminton', 'volleyball', 'football', 'basketball', 'running', 'pickleball'],
                        help='Sport for this tenant')
    parser.add_argument('--limit', type=int, default=0,
                        help='Limit number of products (0=all). Use 3 for testing.')
    parser.add_argument('--skip-images', action='store_true',
                        help='Skip image upload (products created without gallery)')

    args = parser.parse_args()

    # Resolve credentials
    wp_key = args.wp_key or os.environ.get('WC_KEY')
    wp_secret = args.wp_secret or os.environ.get('WC_SECRET')
    cms_password = args.cms_password or os.environ.get('CMS_PASSWORD')

    if not wp_key or not wp_secret:
        print("❌ Cần WooCommerce API key.")
        print("   Tạo key: WordPress Admin → WooCommerce → Settings → Advanced → REST API")
        print("   Rồi set: export WC_KEY=ck_xxx  WC_SECRET=cs_xxx")
        print("   Hoặc dùng: --wp-key ck_xxx --wp-secret cs_xxx")
        sys.exit(1)

    if not cms_password:
        print("❌ Cần CMS password.")
        print("   Set: export CMS_PASSWORD=xxx")
        print("   Hoặc dùng: --cms-password xxx")
        sys.exit(1)

    # Connect
    print(f"🔌 WordPress: {args.wp_url}")
    wc = WordPressWC(args.wp_url, wp_key, wp_secret)

    print(f"🔌 Payload CMS: {args.cms_api}")
    cms = PayloadCMS(args.cms_api, args.cms_email, cms_password)

    # Ensure tenant exists
    slug = args.tenant_slug
    domain = args.tenant_domain
    name = args.tenant_name or domain.replace('.vn', '').replace('.com', '').title().replace('-', ' ')

    # Auto-generate Vietnamese brand name
    sport_names = {
        'football': 'Bóng Đá', 'basketball': 'Bóng Rổ', 'volleyball': 'Bóng Chuyền',
        'badminton': 'Cầu Lông', 'pickleball': 'Pickleball', 'running': 'Chạy Bộ',
    }
    sport_vi = sport_names.get(args.sport, args.sport.title())
    if not args.tenant_name:
        name = f'May Ao {sport_vi}'

    print(f"\n🔍 Tenant: slug={slug} domain={domain}")
    tenant = cms.ensure_tenant(
        slug=slug,
        domain=domain,
        name=name,
        accent_color=args.tenant_accent,
        headline=f'Áo {sport_vi.lower()} đặt may cho CLB & đội nhóm',
        subheadline=f'Form nhẹ, màu sắc nét, in tên số và logo cho câu lạc bộ {sport_vi.lower()}.',
    )
    tenant_id = tenant['id']
    print()

    # Fetch all products
    print("📥 Đang lấy sản phẩm từ WordPress...")
    all_products = wc.get_all_products()
    total = len(all_products)

    if args.limit > 0:
        all_products = all_products[:args.limit]
        print(f"   🔒 Giới hạn: {args.limit}/{total} sản phẩm")
    print()

    # Migrate
    created = 0
    skipped = 0
    errors = 0

    for i, wp_prod in enumerate(all_products):
        sku = wp_prod.get('sku', '').strip()
        name = wp_prod.get('name', 'No Name')
        idx = f"[{i+1}/{len(all_products)}]"

        # Validate SKU
        if not sku:
            print(f"⚠️  {idx} '{name}' — KHÔNG CÓ SKU, bỏ qua")
            errors += 1
            continue

        # Check if already exists (idempotent)
        if cms.product_exists(sku):
            print(f"⏭️  {idx} {sku} — đã tồn tại, skip")
            skipped += 1
            continue

        print(f"📦 {idx} {name}")
        print(f"   SKU: {sku} | Price: {wp_prod.get('regular_price', 'N/A')} | Images: {len(wp_prod.get('images', []))}")

        # Upload images
        media_ids = []
        if not args.skip_images:
            for img in wp_prod.get('images', []):
                img_url = img.get('src', '')
                if not img_url:
                    continue
                try:
                    doc = cms.upload_media(img_url, img.get('alt') or name, tenant_id)
                    media_ids.append(doc['id'])
                    print(f"   🖼️  → media #{doc['id']}: {doc.get('url', '?')[:80]}")
                except Exception as e:
                    print(f"   ❌ Upload lỗi ({img_url[:60]}...): {e}")

        # Build product payload
        description_html = wp_prod.get('description', '')
        slug = wp_prod.get('slug', '')
        if not slug:
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

        payload = {
            'name': name,
            'slug': slug,
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
            'tenant': tenant_id,
        }

        # Sale price → compareAtPrice
        sale_price = wp_prod.get('sale_price')
        if sale_price and sale_price != '0' and sale_price != '':
            payload['compareAtPrice'] = int(float(sale_price))

        # Create product
        try:
            doc = cms.create_product(payload)
            print(f"   ✅ Created: id={doc['id']} slug={doc['slug']}")
            created += 1
        except Exception as e:
            print(f"   ❌ Tạo sản phẩm lỗi: {e}")
            errors += 1

        # Rate limit
        time.sleep(0.5)

    # Summary
    print(f"\n{'='*55}")
    print(f"✅ Created: {created}")
    print(f"⏭️  Skipped (đã tồn tại): {skipped}")
    print(f"❌ Errors: {errors}")
    print(f"📦 Total processed: {len(all_products)}")
    print(f"{'='*55}")

    if created > 0:
        print(f"\n🔗 Kiểm tra: {args.wp_url}/san-pham")

if __name__ == '__main__':
    main()
