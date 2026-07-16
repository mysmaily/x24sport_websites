#!/usr/bin/env python3
"""Ensure WooCommerce product tags exist and return their IDs."""
from __future__ import annotations

import argparse
import base64
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def auth_header() -> str:
    key = os.environ["WOOCOMMERCE_CONSUMER_KEY"]
    secret = os.environ["WOOCOMMERCE_CONSUMER_SECRET"]
    return "Basic " + base64.b64encode(f"{key}:{secret}".encode()).decode()


def request_json(url: str, method: str = "GET", payload: dict[str, Any] | None = None) -> Any:
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", auth_header())
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 image-only-transfer-v5")
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        if exc.code == 403:
            raise RuntimeError(f"403 Forbidden from {url}: {body[:500]}") from exc
        raise


def slugify(value: str) -> str:
    replacements = {
        "đ": "d",
        "Đ": "d",
    }
    for src, dest in replacements.items():
        value = value.replace(src, dest)
    normalized = value.lower()
    normalized = normalized.replace("á", "a").replace("à", "a").replace("ả", "a").replace("ã", "a").replace("ạ", "a")
    normalized = normalized.replace("ă", "a").replace("ắ", "a").replace("ằ", "a").replace("ẳ", "a").replace("ẵ", "a").replace("ặ", "a")
    normalized = normalized.replace("â", "a").replace("ấ", "a").replace("ầ", "a").replace("ẩ", "a").replace("ẫ", "a").replace("ậ", "a")
    normalized = normalized.replace("é", "e").replace("è", "e").replace("ẻ", "e").replace("ẽ", "e").replace("ẹ", "e")
    normalized = normalized.replace("ê", "e").replace("ế", "e").replace("ề", "e").replace("ể", "e").replace("ễ", "e").replace("ệ", "e")
    normalized = normalized.replace("í", "i").replace("ì", "i").replace("ỉ", "i").replace("ĩ", "i").replace("ị", "i")
    normalized = normalized.replace("ó", "o").replace("ò", "o").replace("ỏ", "o").replace("õ", "o").replace("ọ", "o")
    normalized = normalized.replace("ô", "o").replace("ố", "o").replace("ồ", "o").replace("ổ", "o").replace("ỗ", "o").replace("ộ", "o")
    normalized = normalized.replace("ơ", "o").replace("ớ", "o").replace("ờ", "o").replace("ở", "o").replace("ỡ", "o").replace("ợ", "o")
    normalized = normalized.replace("ú", "u").replace("ù", "u").replace("ủ", "u").replace("ũ", "u").replace("ụ", "u")
    normalized = normalized.replace("ư", "u").replace("ứ", "u").replace("ừ", "u").replace("ử", "u").replace("ữ", "u").replace("ự", "u")
    normalized = normalized.replace("ý", "y").replace("ỳ", "y").replace("ỷ", "y").replace("ỹ", "y").replace("ỵ", "y")
    parts = ["".join(ch if ch.isalnum() else "-" for ch in normalized)]
    return "-".join("".join(parts).split()).strip("-")


def ensure_tag(base: str, name: str) -> dict[str, Any]:
    search_url = f"{base}/wp-json/wc/v3/products/tags?{urllib.parse.urlencode({'search': name, 'per_page': 100})}"
    candidates = request_json(search_url)
    for item in candidates:
        if str(item.get("name") or "").casefold() == name.casefold():
            return {"id": item["id"], "name": item["name"], "slug": item.get("slug"), "created": False}
    payload = {"name": name, "slug": slugify(name)}
    try:
        item = request_json(f"{base}/wp-json/wc/v3/products/tags", method="POST", payload=payload)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        try:
            error = json.loads(body)
        except json.JSONDecodeError:
            raise
        if error.get("code") != "term_exists":
            raise RuntimeError(body) from exc
        tag_id = error.get("data", {}).get("resource_id")
        item = request_json(f"{base}/wp-json/wc/v3/products/tags/{tag_id}")
    return {"id": item["id"], "name": item["name"], "slug": item.get("slug"), "created": True}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tags", nargs="*", help="Tag names to ensure")
    parser.add_argument("--tags-json", type=Path, help="JSON file containing a list of tag names")
    parser.add_argument("--env-file", type=Path, default=Path("../.runtime/wordpress-api.env"))
    parser.add_argument("--base-url", default=None)
    args = parser.parse_args()

    load_env(args.env_file)
    base = (args.base_url or os.environ.get("WORDPRESS_BASE_URL") or "https://mayaopickleball.vn").rstrip("/")
    tag_names = list(args.tags)
    if args.tags_json:
        tag_names.extend(json.loads(args.tags_json.read_text(encoding="utf-8")))
    seen: set[str] = set()
    results = []
    for name in tag_names:
        clean = " ".join(str(name).split())
        if not clean or clean.casefold() in seen:
            continue
        seen.add(clean.casefold())
        results.append(ensure_tag(base, clean))
    print(json.dumps(results, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
