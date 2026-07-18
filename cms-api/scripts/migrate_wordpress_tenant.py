#!/usr/bin/env python3
"""Idempotently migrate WordPress products and public content into a Payload tenant."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlsplit

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
except ImportError as error:  # pragma: no cover - operational dependency guard
    raise SystemExit("Install requests before running this migrator") from error


ALLOWED_TAGS = {
    "a",
    "b",
    "blockquote",
    "br",
    "caption",
    "code",
    "div",
    "em",
    "figcaption",
    "figure",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
}
VOID_TAGS = {"br", "hr", "img"}
GLOBAL_ATTRIBUTES = {"class"}
TAG_ATTRIBUTES = {
    "a": {"href", "rel", "target", "title"},
    "img": {"alt", "height", "loading", "src", "title", "width"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan", "scope"},
}
SAFE_SCHEMES = {"", "http", "https", "mailto", "tel"}


def text_value(value: Any) -> str:
    if isinstance(value, dict):
        value = value.get("rendered", "")
    return html.unescape(str(value or ""))


class PlainText(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def plain_text(value: str) -> str:
    parser = PlainText()
    parser.feed(value or "")
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


class Sanitizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.output: list[str] = []
        self.open_tags: list[str] = []
        self.blocked_depth = 0
        self.removed_tags: set[str] = set()

    @staticmethod
    def safe_url(value: str) -> bool:
        value = html.unescape(value).strip()
        if value.startswith(("#", "/")) and not value.startswith("//"):
            return True
        return urlsplit(value).scheme.lower() in SAFE_SCHEMES

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "iframe", "object", "embed", "form"}:
            self.blocked_depth += 1
            self.removed_tags.add(tag)
            return
        if self.blocked_depth:
            return
        if tag not in ALLOWED_TAGS:
            self.removed_tags.add(tag)
            return

        allowed = GLOBAL_ATTRIBUTES | TAG_ATTRIBUTES.get(tag, set())
        clean_attrs: list[str] = []
        for name, value in attrs:
            name = name.lower()
            if name not in allowed or value is None or name.startswith("on"):
                continue
            if name in {"href", "src"} and not self.safe_url(value):
                continue
            if name in {"width", "height", "colspan", "rowspan"} and not value.isdigit():
                continue
            if name == "target" and value not in {"_blank", "_self"}:
                continue
            clean_attrs.append(f'{name}="{html.escape(value, quote=True)}"')

        if tag == "a" and any(item.startswith('target="_blank"') for item in clean_attrs):
            rel_values = next((item for item in clean_attrs if item.startswith("rel=")), "")
            if "noopener" not in rel_values:
                clean_attrs = [item for item in clean_attrs if not item.startswith("rel=")]
                clean_attrs.append('rel="noopener noreferrer"')

        suffix = " " + " ".join(clean_attrs) if clean_attrs else ""
        self.output.append(f"<{tag}{suffix}>")
        if tag not in VOID_TAGS:
            self.open_tags.append(tag)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "iframe", "object", "embed", "form"}:
            if self.blocked_depth:
                self.blocked_depth -= 1
            return
        if self.blocked_depth or tag not in ALLOWED_TAGS or tag in VOID_TAGS:
            return
        if tag in self.open_tags:
            while self.open_tags:
                current = self.open_tags.pop()
                self.output.append(f"</{current}>")
                if current == tag:
                    break

    def handle_data(self, data: str) -> None:
        if not self.blocked_depth:
            self.output.append(html.escape(data, quote=False))

    def handle_entityref(self, name: str) -> None:
        if not self.blocked_depth:
            self.output.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        if not self.blocked_depth:
            self.output.append(f"&#{name};")

    def result(self) -> str:
        while self.open_tags:
            self.output.append(f"</{self.open_tags.pop()}>")
        return "".join(self.output).strip()


def sanitize_html(value: str) -> tuple[str, set[str]]:
    parser = Sanitizer()
    parser.feed(value or "")
    parser.close()
    return parser.result(), parser.removed_tags


def checksum(data: dict[str, Any]) -> str:
    encoded = json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def api_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=5,
        connect=5,
        read=5,
        status=5,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET", "HEAD", "OPTIONS", "POST", "PATCH"}),
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=8, pool_maxsize=8)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers["User-Agent"] = "X24Sport-WordPress-Migrator/2.0"
    return session


@dataclass
class MigrationStats:
    created: int = 0
    updated: int = 0
    unchanged: int = 0
    skipped: int = 0
    failed: int = 0
    removed_tags: set[str] = field(default_factory=set)


class WordPressSource:
    def __init__(self, base_url: str, basic_user: str | None, basic_password: str | None):
        self.base_url = base_url.rstrip("/")
        self.session = api_session()
        if basic_user and basic_password:
            self.session.auth = (basic_user, basic_password)

    def fetch(self, content_type: str, limit: int | None = None) -> list[dict[str, Any]]:
        endpoint = {"product": "product", "page": "pages", "post": "posts"}[content_type]
        records: list[dict[str, Any]] = []
        page = 1
        while True:
            params: dict[str, Any] = {
                "page": page,
                "per_page": min(100, limit or 100),
                "status": "publish",
                "_embed": "wp:featuredmedia",
            }
            response = self.session.get(
                f"{self.base_url}/wp-json/wp/v2/{endpoint}", params=params, timeout=90
            )
            response.raise_for_status()
            batch = response.json()
            records.extend(batch)
            print(f"source type={content_type} page={page} batch={len(batch)} total={len(records)}")
            if limit and len(records) >= limit:
                return records[:limit]
            total_pages = int(response.headers.get("X-WP-TotalPages", "1"))
            if page >= total_pages or not batch:
                return records
            page += 1
            time.sleep(0.1)


class PayloadTarget:
    def __init__(self, base_url: str, email: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.session = api_session()
        response = self.session.post(
            f"{self.base_url}/api/users/login",
            json={"email": email, "password": password},
            timeout=30,
        )
        response.raise_for_status()
        self.session.headers["Authorization"] = f"Bearer {response.json()['token']}"

    def ensure_tenant(self, slug: str, domain: str, dry_run: bool = False) -> dict[str, Any]:
        response = self.session.get(
            f"{self.base_url}/api/tenants",
            params={"where[slug][equals]": slug, "limit": 1, "depth": 0},
            timeout=30,
        )
        response.raise_for_status()
        docs = response.json().get("docs", [])
        if docs:
            return docs[0]
        if dry_run:
            return {"id": "dry-run", "slug": slug}
        response = self.session.post(
            f"{self.base_url}/api/tenants",
            json={
                "name": "May Áo Bóng Rổ",
                "slug": slug,
                "domains": [{"domain": domain}],
                "brand": {
                    "headline": "Trang phục bóng rổ thiết kế riêng",
                    "subheadline": "Thiết kế và đặt may đồng phục bóng rổ cho đội, câu lạc bộ và trường học.",
                    "primaryColor": "#111827",
                    "accentColor": "#e65100",
                    "style": "flevo-inspired",
                },
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json().get("doc", response.json())

    def upsert(
        self,
        collection: str,
        data: dict[str, Any],
        identity_key: str,
        dry_run: bool,
    ) -> str:
        response = self.session.get(
            f"{self.base_url}/api/{collection}",
            params={"where[tenantSourceKey][equals]": identity_key, "limit": 1, "depth": 0},
            timeout=30,
        )
        response.raise_for_status()
        docs = response.json().get("docs", [])
        if docs and docs[0].get("sourceChecksum") == data["sourceChecksum"]:
            return "unchanged"
        if dry_run:
            return "updated" if docs else "created"
        if docs:
            response = self.session.patch(
                f"{self.base_url}/api/{collection}/{docs[0]['id']}", json=data, timeout=60
            )
            result = "updated"
        else:
            response = self.session.post(
                f"{self.base_url}/api/{collection}", json=data, timeout=60
            )
            result = "created"
        response.raise_for_status()
        return result


def featured_images(record: dict[str, Any]) -> list[dict[str, Any]]:
    media = record.get("_embedded", {}).get("wp:featuredmedia", [])
    images: list[dict[str, Any]] = []
    for item in media:
        url = item.get("source_url")
        if not url:
            continue
        details = item.get("media_details") or {}
        images.append(
            {
                "url": url,
                "alt": item.get("alt_text") or plain_text(text_value(record.get("title"))),
                "width": details.get("width"),
                "height": details.get("height"),
            }
        )
    return images


def normalize_record(record: dict[str, Any], content_type: str) -> tuple[dict[str, Any], set[str]]:
    title = plain_text(text_value(record.get("title")))
    raw_content = text_value(record.get("content"))
    raw_excerpt = text_value(record.get("excerpt"))
    clean_content, removed_tags = sanitize_html(raw_content)
    clean_excerpt, excerpt_removed = sanitize_html(raw_excerpt)
    removed_tags.update(excerpt_removed)
    link = record.get("link") or ""
    legacy_path = urlsplit(link).path
    if not legacy_path.startswith("/"):
        raise ValueError(f"Invalid legacy path for source id={record.get('id')}")

    common: dict[str, Any] = {
        "title": title,
        "slug": record["slug"],
        "legacyPath": legacy_path,
        "contentHtml": clean_content,
        "excerpt": plain_text(clean_excerpt),
        "publicationStatus": record.get("status", "publish"),
        "sourceSystem": "wordpress",
        "sourceId": str(record["id"]),
        "sourceModifiedAt": record.get("modified_gmt") or record.get("modified"),
    }

    if content_type == "product":
        data: dict[str, Any] = {
            "name": common.pop("title"),
            **{key: value for key, value in common.items() if key != "excerpt"},
            "sport": "basketball",
            "shortDescription": plain_text(clean_excerpt)[:1000]
            or plain_text(clean_content)[:1000],
            "legacyImages": featured_images(record),
        }
    else:
        data = {**common, "kind": content_type}

    data["sourceChecksum"] = checksum(data)
    return data, removed_tags


def write_snapshot(directory: Path, content_type: str, records: Iterable[dict[str, Any]]) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"wordpress-{content_type}.jsonl"
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")


def read_snapshot(directory: Path, content_type: str) -> list[dict[str, Any]]:
    path = directory / f"wordpress-{content_type}.jsonl"
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def self_test() -> None:
    dirty = '<h2 class="x" onclick="bad()">Title</h2><script>alert(1)</script><p>A <a href="javascript:bad()">link</a></p>'
    clean, removed = sanitize_html(dirty)
    assert "onclick" not in clean
    assert "javascript" not in clean
    assert "alert" not in clean
    assert clean == '<h2 class="x">Title</h2><p>A <a>link</a></p>'
    assert "script" in removed
    assert plain_text("<p>Áo <strong>bóng rổ</strong></p>") == "Áo bóng rổ"
    print("migrator self-test passed")


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wp-url", default="https://mayaobongro.vn")
    parser.add_argument("--cms-api", default="http://10.10.0.28:3001")
    parser.add_argument("--tenant-slug", default="mayaobongro")
    parser.add_argument("--tenant-domain", default="mayaobongro.vn")
    parser.add_argument("--types", default="product,page,post")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--snapshot-dir", type=Path)
    parser.add_argument("--snapshot-input", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--snapshot-only", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = arguments()
    if args.self_test:
        self_test()
        return 0

    content_types = [item.strip() for item in args.types.split(",") if item.strip()]
    invalid = set(content_types) - {"product", "page", "post"}
    if invalid:
        raise SystemExit(f"Unsupported content types: {', '.join(sorted(invalid))}")

    source = WordPressSource(
        args.wp_url,
        os.environ.get("WP_BASIC_USER"),
        os.environ.get("WP_BASIC_PASSWORD"),
    )
    source_records: dict[str, list[dict[str, Any]]] = {}
    for content_type in content_types:
        if args.snapshot_input:
            records = read_snapshot(args.snapshot_input, content_type)
            if args.limit:
                records = records[: args.limit]
            print(f"snapshot type={content_type} total={len(records)}")
        else:
            records = source.fetch(content_type, args.limit)
        source_records[content_type] = records
        if args.snapshot_dir:
            write_snapshot(args.snapshot_dir, content_type, records)

    normalized: list[tuple[str, dict[str, Any], set[str]]] = []
    paths: dict[str, str] = {}
    for content_type, records in source_records.items():
        for record in records:
            data, removed = normalize_record(record, content_type)
            path = data["legacyPath"]
            identity = f"{content_type}:{data['sourceId']}"
            if path == "/" and content_type == "page":
                continue
            if path in paths:
                raise RuntimeError(f"Route collision {path}: {paths[path]} and {identity}")
            paths[path] = identity
            normalized.append((content_type, data, removed))

    print(f"normalized={len(normalized)} unique_paths={len(paths)}")
    if args.snapshot_only:
        return 0

    email = os.environ.get("CMS_EMAIL")
    password = os.environ.get("CMS_PASSWORD")
    if not email or not password:
        raise SystemExit("CMS_EMAIL and CMS_PASSWORD are required outside snapshot-only mode")

    target = PayloadTarget(args.cms_api, email, password)
    tenant = target.ensure_tenant(args.tenant_slug, args.tenant_domain, args.dry_run)
    tenant_id = tenant["id"]
    stats = MigrationStats()

    for index, (content_type, data, removed) in enumerate(normalized, start=1):
        collection = "products" if content_type == "product" else "web-content"
        data["tenant"] = tenant_id
        identity_key = f"{tenant_id}:wordpress:{data['sourceId']}"
        try:
            outcome = target.upsert(collection, data, identity_key, args.dry_run)
            setattr(stats, outcome, getattr(stats, outcome) + 1)
            stats.removed_tags.update(removed)
        except Exception as error:  # continue to produce a complete reconciliation report
            stats.failed += 1
            response_detail = ""
            if isinstance(error, requests.HTTPError) and error.response is not None:
                try:
                    payload = error.response.json()
                    response_detail = f" response={json.dumps(payload, ensure_ascii=False)}"
                except ValueError:
                    response_detail = f" response={error.response.text[:500]}"
            print(
                f"ERROR type={content_type} source_id={data['sourceId']} slug={data['slug']} "
                f"error={error}{response_detail}",
                file=sys.stderr,
            )
        if index % 25 == 0 or index == len(normalized):
            print(
                f"progress={index}/{len(normalized)} created={stats.created} "
                f"updated={stats.updated} unchanged={stats.unchanged} failed={stats.failed}"
            )

    print(
        json.dumps(
            {
                "tenant": args.tenant_slug,
                "dryRun": args.dry_run,
                "created": stats.created,
                "updated": stats.updated,
                "unchanged": stats.unchanged,
                "failed": stats.failed,
                "removedTags": sorted(stats.removed_tags),
            },
            ensure_ascii=False,
        )
    )
    return 1 if stats.failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
