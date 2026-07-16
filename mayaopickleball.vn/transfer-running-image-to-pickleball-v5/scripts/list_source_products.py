#!/usr/bin/env python3
"""List source WooCommerce products as JSONL records for image-only transfer."""
from __future__ import annotations

import argparse
import html
import json
import sys
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any


def fetch_json(url: str) -> tuple[list[dict[str, Any]] | None, dict[str, str]]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 image-only-transfer-v5",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            headers = {k.lower(): v for k, v in response.headers.items()}
            return json.loads(response.read().decode("utf-8")), headers
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        try:
            error = json.loads(body)
        except json.JSONDecodeError:
            raise
        if exc.code == 400 and error.get("code") in {"rest_post_invalid_page_number", "woocommerce_rest_product_invalid_page_number"}:
            return None, {}
        raise


def filename_from_url(url: str) -> str:
    return Path(urllib.parse.urlparse(url).path).name


def product_record(product: dict[str, Any]) -> dict[str, Any] | None:
    images = product.get("images") or []
    if not images:
        return None
    primary = images[0]
    source_url = primary.get("src") or primary.get("thumbnail")
    if not source_url:
        return None
    product_id = product.get("id")
    slug = str(product.get("slug") or f"product-{product_id}")
    source_key = f"product-{product_id}" if product_id else slug
    gallery = []
    for image in images:
        src = image.get("src") or image.get("thumbnail")
        if not src:
            continue
        gallery.append({
            "id": image.get("id"),
            "src": src,
            "filename": filename_from_url(src),
            "name": image.get("name"),
            "alt": image.get("alt"),
        })
    return {
        "source_product_key": source_key,
        "source_product_id": product_id,
        "source_product_slug": slug,
        "source_product_name": html.unescape(str(product.get("name") or "")),
        "source_product_url": product.get("permalink"),
        "source_product_type": product.get("type"),
        "source_sku": product.get("sku"),
        "source_image_url": source_url,
        "source_media_id": primary.get("id"),
        "source_filename": filename_from_url(source_url),
        "source_gallery": gallery,
        "source_category_slugs": [str(cat.get("slug")) for cat in product.get("categories") or [] if cat.get("slug")],
        "source_tag_slugs": [str(tag.get("slug")) for tag in product.get("tags") or [] if tag.get("slug")],
        "width": None,
        "height": None,
        "mime_type": None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://mayaochaybo.vn")
    parser.add_argument("--limit", type=int, default=10000)
    parser.add_argument("--per-page", type=int, default=100)
    parser.add_argument("--search", help="Optional Woo Store product search")
    parser.add_argument("--category", help="Optional Woo Store category ID")
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    base = args.base_url.rstrip("/")
    records: list[dict[str, Any]] = []
    seen_keys: set[str] = set()
    skipped_no_image = 0
    page = 1
    while len(records) < args.limit:
        params: dict[str, Any] = {"per_page": min(args.per_page, 100), "page": page}
        if args.search:
            params["search"] = args.search
        if args.category:
            params["category"] = args.category
        url = f"{base}/wp-json/wc/store/v1/products?{urllib.parse.urlencode(params)}"
        try:
            products, _headers = fetch_json(url)
        except Exception as exc:
            print(f"failed to fetch {url}: {exc}", file=sys.stderr)
            return 1
        if not products:
            break
        for product in products:
            rec = product_record(product)
            if rec is None:
                skipped_no_image += 1
                continue
            key = str(rec["source_product_key"])
            if key in seen_keys:
                continue
            seen_keys.add(key)
            records.append(rec)
            if len(records) >= args.limit:
                break
        page += 1

    lines = [json.dumps(rec, ensure_ascii=False) for rec in records]
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
        print(json.dumps({"out": str(args.out), "products": len(records), "skipped_no_image": skipped_no_image}, ensure_ascii=False))
    else:
        print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
