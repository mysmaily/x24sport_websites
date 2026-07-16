#!/usr/bin/env python3
"""List source image URLs from a WordPress media REST endpoint as JSONL."""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path


def fetch_json(url: str) -> list[dict] | None:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 image-only-transfer-v6",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        try:
            error = json.loads(body)
        except json.JSONDecodeError:
            raise
        if exc.code == 400 and error.get("code") == "rest_post_invalid_page_number":
            return None
        raise


def image_record(item: dict) -> dict | None:
    mime = str(item.get("mime_type") or "")
    source_url = item.get("source_url")
    if not mime.startswith("image/") or not source_url:
        return None
    details = item.get("media_details") or {}
    return {
        "source_image_url": source_url,
        "source_media_id": item.get("id"),
        "source_filename": item.get("filename") or Path(urllib.parse.urlparse(source_url).path).name,
        "width": details.get("width"),
        "height": details.get("height"),
        "mime_type": mime,
    }


def keep_record(rec: dict, args: argparse.Namespace) -> bool:
    width = int(rec.get("width") or 0)
    height = int(rec.get("height") or 0)
    filename = str(rec.get("source_filename") or "").lower()
    if width < args.min_width or height < args.min_height:
        return False
    if args.square_only and width != height:
        return False
    if args.filename_contains and args.filename_contains.lower() not in filename:
        return False
    if args.product_filename_regex and not re.search(args.product_filename_regex, filename, re.I):
        return False
    return True


def product_key(rec: dict) -> str:
    filename = str(rec.get("source_filename") or "")
    stem = Path(filename).stem
    patterns = [
        r"(x24[-_ ]?cb[-_ ]?\d+)",
        r"(cb[-_ ]?\d+)",
        r"(x24[-_ ]?[a-z]+[-_ ]?\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, stem, re.I)
        if match:
            return re.sub(r"[^a-z0-9]+", "-", match.group(1).lower()).strip("-")
    return re.sub(r"[-_ ]?kieu\\d+$", "", stem, flags=re.I).lower()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://mayaochaybo.vn")
    parser.add_argument("--search", help="Optional WordPress media search string, e.g. AoChayBo")
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--per-page", type=int, default=100)
    parser.add_argument("--min-width", type=int, default=600)
    parser.add_argument("--min-height", type=int, default=600)
    parser.add_argument("--square-only", action="store_true", help="Keep only square images")
    parser.add_argument("--filename-contains", help="Keep only source filenames containing this text")
    parser.add_argument("--product-filename-regex", default=r"AoChayBo.*X24.*CB", help="Keep only filenames matching this regex")
    parser.add_argument("--dedupe-product", action="store_true", help="Keep one source image per inferred design/product key")
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    base = args.base_url.rstrip("/")
    records: list[dict] = []
    seen_keys: set[str] = set()
    page = 1
    while len(records) < args.limit:
        params = {"per_page": min(args.per_page, 100), "page": page, "media_type": "image"}
        if args.search:
            params["search"] = args.search
        url = f"{base}/wp-json/wp/v2/media?{urllib.parse.urlencode(params)}"
        try:
            items = fetch_json(url)
        except Exception as exc:
            print(f"failed to fetch {url}: {exc}", file=sys.stderr)
            return 1
        if not items:
            break
        for item in items:
            rec = image_record(item)
            if rec and keep_record(rec, args):
                key = product_key(rec)
                rec["source_product_key"] = key
                if args.dedupe_product and key in seen_keys:
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
        print(args.out)
    else:
        print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
