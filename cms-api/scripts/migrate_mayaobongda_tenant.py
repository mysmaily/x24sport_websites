#!/usr/bin/env python3
"""Snapshot and import mayaobongda.vn into the shared Payload CMS tenant."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import requests

from migrate_wordpress_tenant import api_session, checksum, plain_text, sanitize_html, text_value


SOURCE_SYSTEM = "wordpress"
SOURCE_URL = "https://mayaobongda.vn"
TENANT_SLUG = "mayaobongda"
TENANT_DOMAINS = ["mayaobongda.vn", "next.mayaobongda.vn"]
CATEGORY_SOURCE_SYSTEM = "wordpress-product-category"
TAG_SOURCE_SYSTEM = "wordpress-product-tag"
SETTINGS = {
    "siteName": "May Ao Bong Da",
    "contactPhone": "0989 353 247",
    "zaloUrl": "https://zalo.me/0989353247",
    "navigation": [
        {"label": "Trang chu", "href": "/"},
        {"label": "Shop", "href": "/shop/"},
        {"label": "Ao thiet ke", "href": "/ao-thiet-ke/"},
        {"label": "Ao khong logo", "href": "/ao-khong-logo/"},
        {"label": "Chat lieu vai", "href": "/chat-lieu-vai/"},
        {"label": "Tin tuc", "href": "/blog/"},
    ],
}
SYSTEM_PAGE_SLUGS = {
    "cart",
    "checkout",
    "my-account",
    "sample-page",
    "wishlist",
    "gio-hang",
    "thanh-toan",
    "tai-khoan",
    "shop",
    "cua-hang",
}


def parse_credentials(path: Path) -> tuple[str, str]:
    raw = path.read_text(encoding="utf-8").strip()
    try:
        data = json.loads(raw)
        email, password = data.get("email"), data.get("password")
    except json.JSONDecodeError:
        fields: dict[str, str] = {}
        for line in raw.splitlines():
            match = re.match(r"\s*(email|password)\s*[:=]\s*(.+?)\s*$", line, re.I)
            if match:
                fields[match.group(1).lower()] = match.group(2)
        email, password = fields.get("email"), fields.get("password")
    if not email or not password:
        raise RuntimeError(f"Could not parse CMS credentials file: {path}")
    return str(email), str(password)


def fetch_pages(session: requests.Session, url: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    page = 1
    while True:
        response = session.get(url, params={**params, "page": page, "per_page": 100}, timeout=90)
        response.raise_for_status()
        batch = response.json()
        output.extend(batch)
        pages = int(response.headers.get("X-WP-TotalPages", "1"))
        print(f"snapshot endpoint={urlsplit(url).path} page={page}/{pages} total={len(output)}")
        if page >= pages or not batch:
            return output
        page += 1


class PayloadClient:
    def __init__(self, base_url: str, email: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.session = api_session()
        response = self.session.post(
            f"{self.base_url}/api/users/login",
            json={"email": email, "password": password},
            timeout=30,
        )
        response.raise_for_status()
        token = response.json()["token"]
        self.session.headers["Authorization"] = f"Bearer {token}"

    def find_one(self, collection: str, params: dict[str, Any]) -> dict[str, Any] | None:
        response = self.session.get(
            f"{self.base_url}/api/{collection}",
            params={**params, "limit": 1, "depth": 0},
            timeout=45,
        )
        response.raise_for_status()
        docs = response.json().get("docs", [])
        return docs[0] if docs else None

    def create(self, collection: str, data: dict[str, Any]) -> dict[str, Any]:
        response = self.session.post(f"{self.base_url}/api/{collection}", json=data, timeout=90)
        response.raise_for_status()
        body = response.json()
        return body.get("doc", body)

    def update(self, collection: str, doc_id: Any, data: dict[str, Any]) -> dict[str, Any]:
        response = self.session.patch(f"{self.base_url}/api/{collection}/{doc_id}", json=data, timeout=90)
        response.raise_for_status()
        body = response.json()
        return body.get("doc", body)

    def upsert(self, collection: str, data: dict[str, Any], existing: dict[str, Any] | None) -> tuple[str, dict[str, Any]]:
        if existing and existing.get("sourceChecksum") == data.get("sourceChecksum"):
            return "unchanged", existing
        return (
            ("updated", self.update(collection, existing["id"], data))
            if existing
            else ("created", self.create(collection, data))
        )

    def ensure_tenant(self) -> dict[str, Any]:
        existing = self.find_one("tenants", {"where[slug][equals]": TENANT_SLUG})
        if existing:
            return existing
        return self.create("tenants", {
            "name": "May Ao Bong Da",
            "slug": TENANT_SLUG,
            "domains": [{"domain": value} for value in TENANT_DOMAINS],
            "brand": {
                "headline": "May ao bong da thiet ke truc tiep tai xuong",
                "subheadline": "Mau ao bong da, ao khong logo va bo do thi dau cho doi bong, cau lac bo, cong ty va giai phong trao.",
                "primaryColor": "#101820",
                "accentColor": "#f15a24",
                "style": "flevo-inspired",
            },
        })

    def ensure_store_settings(self, tenant_id: Any) -> None:
        existing = self.find_one("store-settings", {"where[tenant][equals]": tenant_id})
        data = {**SETTINGS, "tenant": tenant_id}
        if existing:
            self.update("store-settings", existing["id"], data)
        else:
            self.create("store-settings", data)


def source_path(value: str) -> str:
    return urlsplit(value).path if value else ""


def build_media_maps(path: Path | None) -> tuple[dict[str, str], dict[str, Any]]:
    if not path:
      return {}, {}
    records = json.loads(path.read_text(encoding="utf-8"))
    url_map: dict[str, str] = {}
    media_ids: dict[str, Any] = {}
    for record in records:
        source_url = str(record.get("sourceUrl") or "")
        target_url = str(record.get("targetUrl") or "")
        media_id = record.get("mediaId")
        if not source_url or not target_url or not media_id:
            continue
        path_only = source_path(source_url)
        if not path_only:
            continue
        variants = {
            source_url,
            f"https://mayaobongda.vn{path_only}",
            f"https://cdn.mayaobongda.vn{path_only}",
        }
        for variant in variants:
            url_map[variant] = target_url
        media_ids[path_only] = media_id
    return url_map, media_ids


def rewrite_media_urls(value: str, media_map: dict[str, str]) -> str:
    rewritten = value
    for source_url in sorted(media_map, key=len, reverse=True):
        if source_url in rewritten:
            rewritten = rewritten.replace(source_url, media_map[source_url])
    return rewritten


def normalize_excerpt(value: Any, media_map: dict[str, str]) -> str:
    clean_html, _ = sanitize_html(rewrite_media_urls(text_value(value), media_map))
    return plain_text(clean_html)


def should_import_page(page: dict[str, Any]) -> bool:
    path = source_path(str(page.get("link") or ""))
    slug = str(page.get("slug") or "")
    if path == "/" or slug in SYSTEM_PAGE_SLUGS:
        return False
    blocked_fragments = ("/gio-hang", "/thanh-toan", "/tai-khoan", "/wishlist", "/my-account", "/checkout", "/cart")
    return not any(fragment in path for fragment in blocked_fragments)


def taxonomy_payload(
    tenant_id: Any,
    record: dict[str, Any],
    index: int,
    *,
    group: str,
    source_system: str,
) -> dict[str, Any]:
    payload = {
        "tenant": tenant_id,
        "name": plain_text(str(record.get("name") or "")),
        "slug": record["slug"],
        "group": group,
        "description": plain_text(str(record.get("description") or ""))[:4000],
        "legacyPath": source_path(str(record.get("link") or "")),
        "sourceSystem": source_system,
        "sourceId": str(record["id"]),
        "productCount": int(record.get("count") or 0),
        "order": index,
    }
    payload["sourceChecksum"] = checksum(payload)
    return payload


def content_payload(
    tenant_id: Any,
    record: dict[str, Any],
    *,
    kind: str,
    media_map: dict[str, str],
) -> dict[str, Any]:
    content_html, _ = sanitize_html(rewrite_media_urls(text_value(record.get("content")), media_map))
    excerpt = normalize_excerpt(record.get("excerpt"), media_map)
    payload = {
        "tenant": tenant_id,
        "title": plain_text(text_value(record.get("title"))),
        "slug": record["slug"],
        "kind": kind,
        "legacyPath": source_path(str(record.get("link") or "")),
        "contentHtml": content_html,
        "excerpt": excerpt[:4000],
        "publicationStatus": record.get("status") or "publish",
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": str(record["id"]),
        "sourceModifiedAt": record.get("modified_gmt") or record.get("modified"),
    }
    payload["sourceChecksum"] = checksum(payload)
    return payload


def price_value(prices: dict[str, Any], field: str) -> float | None:
    raw = prices.get(field)
    if raw in (None, ""):
        return None
    return float(raw) / (10 ** int(prices.get("currency_minor_unit") or 0))


def product_payload(
    tenant_id: Any,
    store_product: dict[str, Any],
    wp_product: dict[str, Any],
    *,
    category_ids: list[Any],
    gallery_ids: list[Any],
    media_map: dict[str, str],
) -> dict[str, Any]:
    content_html, _ = sanitize_html(rewrite_media_urls(str(store_product.get("description") or ""), media_map))
    short_html, _ = sanitize_html(rewrite_media_urls(str(store_product.get("short_description") or ""), media_map))
    prices = store_product.get("prices") or {}
    current = price_value(prices, "price")
    regular = price_value(prices, "regular_price")
    sale = price_value(prices, "sale_price")
    yoast = wp_product.get("yoast_head_json") or {}
    images = [
        {
            "url": image.get("src"),
            "alt": image.get("alt") or store_product.get("name"),
            **({"width": image["thumbnail"] and None} if False else {}),
        }
        for image in store_product.get("images", [])
        if image.get("src")
    ]
    payload = {
        "tenant": tenant_id,
        "name": plain_text(str(store_product.get("name") or "")),
        "slug": store_product["slug"],
        "sku": store_product.get("sku") or None,
        "sport": "football",
        "productType": store_product.get("type") if store_product.get("type") in {"simple", "variable", "grouped", "external"} else "simple",
        "price": current,
        "compareAtPrice": regular if regular and current is not None and regular > current else None,
        "regularPrice": regular,
        "salePrice": sale,
        "currency": prices.get("currency_code") or "VND",
        "stockStatus": "onbackorder" if store_product.get("is_on_backorder") else ("instock" if store_product.get("is_in_stock") else "outofstock"),
        "isPurchasable": bool(store_product.get("is_purchasable")),
        "isOnBackorder": bool(store_product.get("is_on_backorder")),
        "shortDescription": plain_text(short_html)[:4000],
        "contentHtml": content_html,
        "legacyPath": source_path(str(wp_product.get("link") or store_product.get("permalink") or "")),
        "publicationStatus": wp_product.get("status") or "publish",
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": str(store_product["id"]),
        "sourceModifiedAt": wp_product.get("modified_gmt") or wp_product.get("modified"),
        "sourceCreatedAt": wp_product.get("date_gmt") or wp_product.get("date"),
        "seoTitle": yoast.get("title"),
        "metaDescription": yoast.get("description"),
        "canonicalOverride": yoast.get("canonical"),
        "legacyImages": [
            {
                "url": image.get("src"),
                "alt": image.get("alt") or store_product.get("name"),
            }
            for image in store_product.get("images", [])
            if image.get("src")
        ],
        "gallery": gallery_ids,
        "sourceTags": [
            {"name": tag["name"], "slug": tag["slug"]}
            for tag in store_product.get("tags", [])
            if tag.get("name") and tag.get("slug")
        ],
        "searchTags": [
            {"value": value}
            for value in sorted({
                *(tag.get("name") or "" for tag in store_product.get("tags", [])),
                *(category.get("name") or "" for category in store_product.get("categories", [])),
            })
            if value
        ],
        "categories": category_ids,
    }
    payload["sourceChecksum"] = checksum(payload)
    return payload


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def snapshot(output_dir: Path) -> dict[str, list[dict[str, Any]]]:
    output_dir.mkdir(parents=True, exist_ok=True)
    session = api_session()
    base = SOURCE_URL.rstrip("/")
    sources = {
        "store-products": fetch_pages(session, f"{base}/wp-json/wc/store/v1/products", {"orderby": "id", "order": "asc"}),
        "wp-products": fetch_pages(session, f"{base}/wp-json/wp/v2/product", {"status": "publish", "orderby": "id", "order": "asc"}),
        "product-categories": fetch_pages(session, f"{base}/wp-json/wp/v2/product_cat", {"orderby": "id", "order": "asc"}),
        "product-tags": fetch_pages(session, f"{base}/wp-json/wp/v2/product_tag", {"orderby": "id", "order": "asc"}),
        "pages": fetch_pages(session, f"{base}/wp-json/wp/v2/pages", {"status": "publish", "orderby": "id", "order": "asc"}),
        "posts": fetch_pages(session, f"{base}/wp-json/wp/v2/posts", {"status": "publish", "orderby": "id", "order": "asc"}),
    }
    for name, records in sources.items():
        write_json(output_dir / f"{name}.json", records)
    return sources


def load_snapshot(output_dir: Path) -> dict[str, list[dict[str, Any]]]:
    return {
        name: json.loads((output_dir / f"{name}.json").read_text(encoding="utf-8"))
        for name in ("store-products", "wp-products", "product-categories", "product-tags", "pages", "posts")
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cms-api", default="https://cms.x24sport.vn")
    parser.add_argument("--credentials", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--media-map", type=Path)
    parser.add_argument("--ensure-tenant-only", action="store_true")
    args = parser.parse_args()

    email, password = parse_credentials(args.credentials)
    client = PayloadClient(args.cms_api, email, password)
    tenant = client.ensure_tenant()
    client.ensure_store_settings(tenant["id"])
    print(json.dumps({"tenant": TENANT_SLUG, "tenantId": tenant["id"], "domains": TENANT_DOMAINS}, ensure_ascii=False))
    if args.ensure_tenant_only:
        return 0

    if (args.output_dir / "store-products.json").exists():
        sources = load_snapshot(args.output_dir)
    else:
        sources = snapshot(args.output_dir)

    media_map, media_ids = build_media_maps(args.media_map)

    category_doc_ids: dict[tuple[str, str], Any] = {}
    counts: dict[str, int] = {}

    def mark(name: str, outcome: str) -> None:
        key = f"{name}_{outcome}"
        counts[key] = counts.get(key, 0) + 1

    for index, record in enumerate(sources["product-categories"], start=1):
        payload = taxonomy_payload(tenant["id"], record, index, group="type", source_system=CATEGORY_SOURCE_SYSTEM)
        existing = client.find_one("product-categories", {"where[tenantSourceKey][equals]": f"{tenant['id']}:{CATEGORY_SOURCE_SYSTEM}:{record['id']}"})
        outcome, doc = client.upsert("product-categories", payload, existing)
        category_doc_ids[(CATEGORY_SOURCE_SYSTEM, str(record["id"]))] = doc["id"]
        mark("product_categories", outcome)

    for index, record in enumerate(sources["product-tags"], start=1):
        payload = taxonomy_payload(tenant["id"], record, 10_000 + index, group="tag", source_system=TAG_SOURCE_SYSTEM)
        existing = client.find_one("product-categories", {"where[tenantSourceKey][equals]": f"{tenant['id']}:{TAG_SOURCE_SYSTEM}:{record['id']}"})
        outcome, doc = client.upsert("product-categories", payload, existing)
        category_doc_ids[(TAG_SOURCE_SYSTEM, str(record["id"]))] = doc["id"]
        mark("product_tags", outcome)

    wp_products = {str(record["id"]): record for record in sources["wp-products"]}
    for index, record in enumerate(sources["store-products"], start=1):
        wp_product = wp_products.get(str(record["id"]))
        if not wp_product:
            continue
        category_ids = [
            category_doc_ids[(CATEGORY_SOURCE_SYSTEM, str(item["id"]))]
            for item in record.get("categories", [])
            if (CATEGORY_SOURCE_SYSTEM, str(item["id"])) in category_doc_ids
        ] + [
            category_doc_ids[(TAG_SOURCE_SYSTEM, str(item["id"]))]
            for item in record.get("tags", [])
            if (TAG_SOURCE_SYSTEM, str(item["id"])) in category_doc_ids
        ]
        gallery_ids = [
            media_ids[source_path(str(image.get("src") or ""))]
            for image in record.get("images", [])
            if source_path(str(image.get("src") or "")) in media_ids
        ]
        payload = product_payload(
            tenant["id"],
            record,
            wp_product,
            category_ids=list(dict.fromkeys(category_ids)),
            gallery_ids=list(dict.fromkeys(gallery_ids)),
            media_map=media_map,
        )
        existing = client.find_one("products", {"where[tenantSourceKey][equals]": f"{tenant['id']}:{SOURCE_SYSTEM}:{record['id']}"})
        outcome, _ = client.upsert("products", payload, existing)
        mark("products", outcome)
        if index % 25 == 0 or index == len(sources["store-products"]):
            print(json.dumps({"productsProcessed": index, "counts": counts}, ensure_ascii=False))

    for record in sources["pages"]:
        if not should_import_page(record):
            continue
        payload = content_payload(tenant["id"], record, kind="page", media_map=media_map)
        existing = client.find_one("web-content", {"where[tenantSourceKey][equals]": f"{tenant['id']}:{SOURCE_SYSTEM}:{record['id']}"})
        outcome, _ = client.upsert("web-content", payload, existing)
        mark("pages", outcome)

    for record in sources["posts"]:
        payload = content_payload(tenant["id"], record, kind="post", media_map=media_map)
        existing = client.find_one("web-content", {"where[tenantSourceKey][equals]": f"{tenant['id']}:{SOURCE_SYSTEM}:{record['id']}"})
        outcome, _ = client.upsert("web-content", payload, existing)
        mark("posts", outcome)

    print(json.dumps({"tenant": TENANT_SLUG, "counts": counts}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
