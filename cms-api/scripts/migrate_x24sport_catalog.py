#!/usr/bin/env python3
"""Snapshot and idempotently import the complete x24sport.vn WooCommerce catalog."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import mimetypes
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import requests

from migrate_wordpress_tenant import api_session, checksum, plain_text, sanitize_html


SOURCE_SYSTEM = "wordpress"
MEDIA_SOURCE_SYSTEM = "wordpress-media"
SPORT_ROOTS = {
    70: ("football", "bong-da"),
    71: ("volleyball", "bong-chuyen"),
    72: ("badminton", "cau-long"),
    73: ("basketball", "bong-ro"),
    74: ("pickleball", "pickleball"),
    216: ("running", "chay-bo"),
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.write_bytes(canonical_json(value) + b"\n")


def fetch_pages(session: requests.Session, url: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    page = 1
    while True:
        response = session.get(url, params={**params, "page": page, "per_page": 100}, timeout=90)
        response.raise_for_status()
        batch = response.json()
        output.extend(batch)
        pages = int(response.headers.get("X-WP-TotalPages", "1"))
        print(f"snapshot endpoint={urlsplit(url).path} page={page}/{pages} records={len(output)}")
        if page >= pages or not batch:
            return output
        page += 1


def create_snapshot(source_url: str, directory: Path) -> dict[str, Any]:
    directory.mkdir(parents=True, exist_ok=True)
    paths = [directory / name for name in ("store-products.json", "product-categories.json", "wp-products.json")]
    if any(path.exists() for path in paths):
        raise RuntimeError(f"Snapshot directory already contains catalog files: {directory}")

    session = api_session()
    base = source_url.rstrip("/")
    store_products = fetch_pages(session, f"{base}/wp-json/wc/store/v1/products", {"orderby": "id", "order": "asc"})
    categories = fetch_pages(
        session, f"{base}/wp-json/wp/v2/product_cat",
        {"hide_empty": "true", "orderby": "id", "order": "asc"},
    )
    wp_products = fetch_pages(
        session, f"{base}/wp-json/wp/v2/product",
        {"status": "publish", "orderby": "id", "order": "asc"},
    )
    if len(store_products) != len(wp_products):
        raise RuntimeError(f"Product API mismatch: store={len(store_products)} wordpress={len(wp_products)}")
    for path, data in zip(paths, (store_products, categories, wp_products)):
        write_json(path, data)

    wp_by_id = {int(item["id"]): item for item in wp_products}
    contract = directory / "url-contract.csv"
    with contract.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["source_id", "slug", "source_url", "legacy_path"])
        for product in store_products:
            meta = wp_by_id[int(product["id"])]
            source_link = meta.get("link") or product.get("permalink") or ""
            writer.writerow([product["id"], product["slug"], source_link, urlsplit(source_link).path])

    manifest = {
        "sourceUrl": base,
        "createdAt": now_iso(),
        "counts": {
            "products": len(store_products),
            "categories": len(categories),
            "wpProducts": len(wp_products),
            "images": len({int(image["id"]) for product in store_products for image in product.get("images", [])}),
        },
        "files": {path.name: file_sha256(path) for path in paths + [contract]},
    }
    manifest["snapshotChecksum"] = checksum(manifest)
    write_json(directory / "manifest.json", manifest)
    print(json.dumps(manifest, ensure_ascii=False))
    return manifest


def load_snapshot(directory: Path) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    for name, expected in manifest["files"].items():
        if file_sha256(directory / name) != expected:
            raise RuntimeError(f"Snapshot checksum mismatch: {name}")
    return (
        manifest,
        json.loads((directory / "store-products.json").read_text(encoding="utf-8")),
        json.loads((directory / "product-categories.json").read_text(encoding="utf-8")),
        json.loads((directory / "wp-products.json").read_text(encoding="utf-8")),
    )


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


class Payload:
    def __init__(self, base_url: str, email: str, password: str, dry_run: bool):
        self.base_url = base_url.rstrip("/")
        self.session = api_session()
        response = self.session.post(
            f"{self.base_url}/api/users/login", json={"email": email, "password": password}, timeout=30
        )
        response.raise_for_status()
        self.token = response.json()["token"]
        self.session.headers["Authorization"] = f"Bearer {self.token}"
        self.dry_run = dry_run

    def find(self, collection: str, field: str, value: Any) -> dict[str, Any] | None:
        response = self.session.get(
            f"{self.base_url}/api/{collection}",
            params={f"where[{field}][equals]": value, "limit": 1, "depth": 0}, timeout=45,
        )
        response.raise_for_status()
        docs = response.json().get("docs", [])
        return docs[0] if docs else None

    def upsert(self, collection: str, data: dict[str, Any], existing: dict[str, Any] | None) -> tuple[str, dict[str, Any]]:
        if existing and existing.get("sourceChecksum") == data.get("sourceChecksum"):
            return "unchanged", existing
        if self.dry_run:
            return ("updated" if existing else "created"), existing or {"id": f"dry-{collection}-{data.get('sourceId')}"}
        if existing:
            response = self.session.patch(f"{self.base_url}/api/{collection}/{existing['id']}", json=data, timeout=90)
            outcome = "updated"
        else:
            response = self.session.post(f"{self.base_url}/api/{collection}", json=data, timeout=90)
            outcome = "created"
        response.raise_for_status()
        body = response.json()
        return outcome, body.get("doc", body)

    def create_run(self, data: dict[str, Any]) -> dict[str, Any] | None:
        if self.dry_run:
            return None
        response = self.session.post(f"{self.base_url}/api/migration-runs", json=data, timeout=30)
        response.raise_for_status()
        body = response.json()
        return body.get("doc", body)

    def finish_run(self, run_id: Any, data: dict[str, Any]) -> None:
        if self.dry_run or not run_id:
            return
        response = self.session.patch(f"{self.base_url}/api/migration-runs/{run_id}", json=data, timeout=30)
        response.raise_for_status()


def category_depth(item: dict[str, Any], by_id: dict[int, dict[str, Any]]) -> int:
    depth, current, seen = 0, item, set()
    while int(current.get("parent") or 0):
        parent = int(current["parent"])
        if parent in seen or parent not in by_id:
            break
        seen.add(parent)
        depth += 1
        current = by_id[parent]
    return depth


def root_category(category_id: int, by_id: dict[int, dict[str, Any]]) -> int:
    current, seen = category_id, set()
    while current in by_id and int(by_id[current].get("parent") or 0):
        if current in seen:
            break
        seen.add(current)
        current = int(by_id[current]["parent"])
    return current


def category_path(category: dict[str, Any]) -> str:
    link = str(category.get("link") or "")
    return urlsplit(link).path if link else f"/danh-muc-san-pham/{category['slug']}/"


def price_value(prices: dict[str, Any], field: str) -> float | None:
    raw = prices.get(field)
    if raw in (None, ""):
        return None
    return float(raw) / (10 ** int(prices.get("currency_minor_unit") or 0))


def rewrite_media_urls(value: str, media_map: dict[str, str]) -> str:
    rewritten = value
    for source_url, target_url in media_map.items():
        if source_url in rewritten:
            rewritten = rewritten.replace(source_url, target_url)
    return rewritten


def safe_product(
    product: dict[str, Any],
    meta: dict[str, Any],
    category_ids: list[Any],
    sport: str,
    media_map: dict[str, str],
) -> dict[str, Any]:
    description, _ = sanitize_html(
        rewrite_media_urls(str(product.get("description") or ""), media_map)
    )
    short_html, _ = sanitize_html(
        rewrite_media_urls(str(product.get("short_description") or ""), media_map)
    )
    prices = product.get("prices") or {}
    current = price_value(prices, "price")
    regular = price_value(prices, "regular_price")
    sale = price_value(prices, "sale_price")
    source_link = meta.get("link") or product.get("permalink") or ""
    images = [
        {
            "url": image.get("src"),
            "alt": image.get("alt") or product.get("name"),
            **({"width": image["width"]} if image.get("width") else {}),
            **({"height": image["height"]} if image.get("height") else {}),
        }
        for image in product.get("images", []) if image.get("src")
    ]
    seo = meta.get("yoast_head_json") or {}
    data: dict[str, Any] = {
        "name": plain_text(str(product.get("name") or "")),
        "slug": product["slug"],
        "sku": product.get("sku") or None,
        "sport": sport,
        "productType": product.get("type") if product.get("type") in {"simple", "variable", "grouped", "external"} else "simple",
        "price": current,
        "compareAtPrice": regular if regular and current is not None and regular > current else None,
        "regularPrice": regular,
        "salePrice": sale,
        "currency": prices.get("currency_code") or "VND",
        "stockStatus": "onbackorder" if product.get("is_on_backorder") else ("instock" if product.get("is_in_stock") else "outofstock"),
        "isPurchasable": bool(product.get("is_purchasable")),
        "isOnBackorder": bool(product.get("is_on_backorder")),
        "shortDescription": plain_text(short_html)[:4000],
        "contentHtml": description,
        "legacyPath": urlsplit(source_link).path,
        "publicationStatus": meta.get("status") or "publish",
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": str(product["id"]),
        "sourceModifiedAt": meta.get("modified_gmt") or meta.get("modified"),
        "sourceCreatedAt": meta.get("date_gmt") or meta.get("date"),
        "seoTitle": seo.get("title"),
        "metaDescription": seo.get("description"),
        "canonicalOverride": seo.get("canonical"),
        "legacyImages": images,
        "sourceTags": [
            {"name": tag["name"], "slug": tag["slug"]}
            for tag in product.get("tags", []) if tag.get("name") and tag.get("slug")
        ],
        "attributes": [
            {"name": attr["name"], "values": [{"value": value} for value in attr.get("terms", [])]}
            for attr in product.get("attributes", []) if attr.get("name")
        ],
        "categories": category_ids,
    }
    data["sourceChecksum"] = checksum(data)
    return data


def collect_images(products: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    images: dict[int, dict[str, Any]] = {}
    for product in products:
        for image in product.get("images", []):
            if image.get("id") and image.get("src"):
                images[int(image["id"])] = {**image, "fallbackAlt": product.get("name")}
    return images


def collect_color_terms(products: list[dict[str, Any]]) -> tuple[dict[int, dict[str, Any]], dict[int, set[int]]]:
    terms: dict[int, dict[str, Any]] = {}
    product_terms: dict[int, set[int]] = {}
    for product in products:
        product_id = int(product["id"])
        for attribute in product.get("attributes", []):
            if attribute.get("taxonomy") != "pa_mau-sac":
                continue
            for term in attribute.get("terms", []):
                term_id = int(term["id"])
                terms[term_id] = term
                product_terms.setdefault(product_id, set()).add(term_id)
    return terms, product_terms


def upload_media(target: Payload, tenant_id: Any, image: dict[str, Any]) -> tuple[int, str, Any]:
    source_id = int(image["id"])
    identity = f"{tenant_id}:{MEDIA_SOURCE_SYSTEM}:{source_id}"
    existing = target.find("media", "tenantSourceKey", identity)
    if existing:
        return source_id, "unchanged", existing["id"]
    if target.dry_run:
        return source_id, "created", f"dry-media-{source_id}"
    download = requests.get(image["src"], timeout=90, headers={"User-Agent": "X24Sport-Catalog-Migrator/1.0"})
    download.raise_for_status()
    extension = Path(urlsplit(image["src"]).path).suffix.lower()
    if not extension:
        extension = mimetypes.guess_extension(download.headers.get("Content-Type", "")) or ".jpg"
    filename = f"wp-{source_id}{extension[:8]}"
    content_type = download.headers.get("Content-Type") or mimetypes.guess_type(filename)[0] or "image/jpeg"
    content_checksum = hashlib.sha256(download.content).hexdigest()
    payload = {
        "tenant": tenant_id,
        "alt": image.get("alt") or image.get("fallbackAlt") or f"X24Sport image {source_id}",
        "sourceSystem": MEDIA_SOURCE_SYSTEM,
        "sourceId": str(source_id),
        "sourceUrl": image["src"],
        "sourceChecksum": content_checksum,
    }
    response = requests.post(
        f"{target.base_url}/api/media",
        headers={"Authorization": f"Bearer {target.token}"},
        data={"_payload": json.dumps(payload, ensure_ascii=False)},
        files={"file": (filename, download.content, content_type)}, timeout=120,
    )
    response.raise_for_status()
    body = response.json()
    return source_id, "created", body.get("doc", body)["id"]


def migrate(args: argparse.Namespace) -> int:
    manifest, products, categories, wp_products = load_snapshot(args.snapshot_input)
    email, password = parse_credentials(args.credentials)
    target = Payload(args.cms_api, email, password, args.dry_run)
    tenant = target.find("tenants", "slug", args.tenant_slug)
    if not tenant:
        raise RuntimeError(f"Tenant does not exist: {args.tenant_slug}")
    tenant_id = tenant["id"]
    run_key = f"{args.tenant_slug}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    run = target.create_run({
        "tenant": tenant_id, "runId": run_key, "mode": "dry-run" if args.dry_run else "import",
        "status": "running", "sourceUrl": manifest["sourceUrl"],
        "snapshotChecksum": manifest["snapshotChecksum"], "startedAt": now_iso(),
    })
    counts: dict[str, int] = {}
    errors: list[dict[str, Any]] = []

    def mark(kind: str, outcome: str) -> None:
        key = f"{kind}_{outcome}"
        counts[key] = counts.get(key, 0) + 1

    try:
        media_map: dict[str, str] = {}
        if args.media_map:
            media_records = json.loads(args.media_map.read_text(encoding="utf-8"))
            media_map = {
                str(item["sourceUrl"]): str(item["targetUrl"])
                for item in media_records
                if item.get("sourceUrl") and item.get("targetUrl")
            }

        by_id = {int(item["id"]): item for item in categories}
        category_docs: dict[int, Any] = {}
        for category in sorted(categories, key=lambda item: (category_depth(item, by_id), int(item["id"]))):
            source_id = int(category["id"])
            parent_id = int(category.get("parent") or 0)
            data = {
                "tenant": tenant_id,
                "name": plain_text(str(category.get("name") or "")),
                "slug": category["slug"],
                "parent": category_docs.get(parent_id),
                "group": (
                    "type"
                    if args.default_sport
                    else ("sport" if category["slug"] in {slug for _, slug in SPORT_ROOTS.values()} else "type")
                ),
                "description": plain_text(str(category.get("description") or ""))[:4000],
                "legacyPath": category_path(category),
                "sourceSystem": "wordpress-product-category",
                "sourceId": str(source_id),
                "productCount": int(category.get("count") or 0),
                "order": category_depth(category, by_id) * 1000 + source_id,
            }
            data["sourceChecksum"] = checksum(data)
            existing = target.find(
                "product-categories", "tenantSourceKey",
                f"{tenant_id}:wordpress-product-category:{source_id}",
            )
            if not existing:
                existing = target.find("product-categories", "tenantSlugKey", f"{tenant_id}:{category['slug']}")
            outcome, doc = target.upsert("product-categories", data, existing)
            category_docs[source_id] = doc["id"]
            mark("categories", outcome)

        broad_ids: dict[str, Any] = {}
        for sport, slug in SPORT_ROOTS.values():
            broad = target.find("product-categories", "tenantSlugKey", f"{tenant_id}:{slug}")
            if broad:
                broad_ids[sport] = broad["id"]

        color_terms, product_color_terms = collect_color_terms(products)
        color_docs: dict[int, Any] = {}
        for term_id, term in sorted(color_terms.items()):
            data = {
                "tenant": tenant_id,
                "name": plain_text(str(term.get("name") or "")),
                "slug": term["slug"],
                "group": "color",
                "legacyPath": f"/mau-sac/{term['slug']}/",
                "sourceSystem": "wordpress-product-attribute",
                "sourceId": str(term_id),
                "productCount": sum(term_id in values for values in product_color_terms.values()),
                "order": 5000 + term_id,
            }
            data["sourceChecksum"] = checksum(data)
            existing = target.find(
                "product-categories",
                "tenantSourceKey",
                f"{tenant_id}:wordpress-product-attribute:{term_id}",
            )
            outcome, doc = target.upsert("product-categories", data, existing)
            color_docs[term_id] = doc["id"]
            mark("colors", outcome)

        images = collect_images(products)
        media_ids: dict[int, Any] = {}
        if not args.skip_media:
            with ThreadPoolExecutor(max_workers=args.media_workers) as pool:
                futures = {pool.submit(upload_media, target, tenant_id, image): source_id for source_id, image in images.items()}
                for index, future in enumerate(as_completed(futures), start=1):
                    source_id = futures[future]
                    try:
                        _, outcome, media_id = future.result()
                        media_ids[source_id] = media_id
                        mark("media", outcome)
                    except Exception as error:
                        errors.append({"type": "media", "sourceId": source_id, "error": str(error)[:500]})
                        mark("media", "failed")
                    if index % 50 == 0 or index == len(futures):
                        print(f"media progress={index}/{len(futures)} counts={counts}")

        meta_by_id = {int(item["id"]): item for item in wp_products}
        for index, product in enumerate(products, start=1):
            source_id = int(product["id"])
            try:
                source_category_ids = [
                    int(item["id"]) for item in product.get("categories", [])
                    if int(item["id"]) in category_docs
                ]
                roots = [root_category(item, by_id) for item in source_category_ids]
                sport = args.default_sport or next(
                    (SPORT_ROOTS[root][0] for root in roots if root in SPORT_ROOTS),
                    "other",
                )
                relation_ids = list(dict.fromkeys(
                    [category_docs[item] for item in source_category_ids]
                    + [color_docs[item] for item in product_color_terms.get(source_id, set())]
                    + ([broad_ids[sport]] if sport in broad_ids else [])
                ))
                data = safe_product(
                    product,
                    meta_by_id[source_id],
                    relation_ids,
                    sport,
                    media_map,
                )
                data["tenant"] = tenant_id
                data["gallery"] = [
                    media_ids[int(image["id"])] for image in product.get("images", [])
                    if int(image.get("id") or 0) in media_ids
                ]
                data["sourceChecksum"] = checksum({key: value for key, value in data.items() if key != "tenant"})
                existing = target.find("products", "tenantSourceKey", f"{tenant_id}:{SOURCE_SYSTEM}:{source_id}")
                if not existing:
                    existing = target.find("products", "tenantSlugKey", f"{tenant_id}:{product['slug']}")
                outcome, _ = target.upsert("products", data, existing)
                mark("products", outcome)
            except Exception as error:
                errors.append({"type": "product", "sourceId": source_id, "slug": product.get("slug"), "error": str(error)[:500]})
                mark("products", "failed")
            if index % 25 == 0 or index == len(products):
                print(f"products progress={index}/{len(products)} counts={counts}")

        status = "failed" if errors else "completed"
        target.finish_run(run and run.get("id"), {
            "status": status, "finishedAt": now_iso(), "counts": counts, "errors": errors,
        })
        report = {
            "runId": run_key, "status": status, "dryRun": args.dry_run,
            "tenant": args.tenant_slug, "snapshotChecksum": manifest["snapshotChecksum"],
            "counts": counts, "errors": errors,
        }
        write_json(args.report, report)
        print(json.dumps(report, ensure_ascii=False))
        return 1 if errors else 0
    except Exception as error:
        target.finish_run(run and run.get("id"), {
            "status": "failed", "finishedAt": now_iso(), "counts": counts,
            "errors": errors + [{"type": "fatal", "error": str(error)[:500]}],
        })
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-url", default="https://x24sport.vn")
    parser.add_argument("--cms-api", default="http://10.10.0.28:3001")
    parser.add_argument("--tenant-slug", default="x24sport")
    parser.add_argument("--snapshot-dir", type=Path)
    parser.add_argument("--snapshot-input", type=Path)
    parser.add_argument("--snapshot-only", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-media", action="store_true")
    parser.add_argument(
        "--default-sport",
        choices=("badminton", "volleyball", "football", "basketball", "running", "pickleball", "other"),
    )
    parser.add_argument("--media-map", type=Path)
    parser.add_argument("--media-workers", type=int, default=4)
    parser.add_argument("--credentials", type=Path, default=Path("/root/sports-cms/admin-credentials.txt"))
    parser.add_argument("--report", type=Path, default=Path("x24sport-migration-report.json"))
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.snapshot_dir:
        create_snapshot(args.source_url, args.snapshot_dir)
        if args.snapshot_only:
            return 0
    if not args.snapshot_input:
        if args.snapshot_dir:
            args.snapshot_input = args.snapshot_dir
        else:
            raise SystemExit("Use --snapshot-input, or create one with --snapshot-dir")
    return migrate(args)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except Exception as error:
        print(f"FATAL: {error}", file=sys.stderr)
        raise
