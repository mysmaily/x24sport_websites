#!/usr/bin/env python3
"""Fast rendered-HTML audit for X24Sport public pages using only stdlib."""

from __future__ import annotations

import argparse
import json
import sys
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.html_lang = ""
        self.in_title = False
        self.title_parts: list[str] = []
        self.h1_count = 0
        self.images = 0
        self.images_missing_alt = 0
        self.anchors = 0
        self.anchors_missing_href = 0
        self.meta: dict[str, str] = {}
        self.canonicals: list[str] = []
        self.in_json_ld = False
        self.json_ld_parts: list[str] = []
        self.json_ld_blocks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or "") for key, value in attrs}
        tag = tag.lower()
        if tag == "html":
            self.html_lang = values.get("lang", "").strip()
        elif tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta":
            key = (values.get("name") or values.get("property") or "").lower()
            if key:
                self.meta[key] = values.get("content", "").strip()
        elif tag == "link":
            rels = {part.lower() for part in values.get("rel", "").split()}
            if "canonical" in rels:
                self.canonicals.append(values.get("href", "").strip())
        elif tag == "img":
            self.images += 1
            if "alt" not in values:
                self.images_missing_alt += 1
        elif tag == "a":
            self.anchors += 1
            if not values.get("href", "").strip():
                self.anchors_missing_href += 1
        elif tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self.in_json_ld = True
            self.json_ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.in_json_ld:
            self.json_ld_blocks.append("".join(self.json_ld_parts).strip())
            self.in_json_ld = False
            self.json_ld_parts = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.in_json_ld:
            self.json_ld_parts.append(data)


def emit(level: str, message: str) -> None:
    print(f"{level:<5} {message}")


def schema_types(value: object) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        item_type = value.get("@type")
        if isinstance(item_type, str):
            found.add(item_type)
        elif isinstance(item_type, list):
            found.update(str(item) for item in item_type)
        for child in value.values():
            found.update(schema_types(child))
    elif isinstance(value, list):
        for child in value:
            found.update(schema_types(child))
    return found


def audit(url: str, allow_noindex: bool, timeout: float) -> int:
    request = Request(url, headers={"User-Agent": "X24SportSiteAudit/1.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            status = response.status
            final_url = response.geturl()
            content_type = response.headers.get_content_type()
            charset = response.headers.get_content_charset() or "utf-8"
            body = response.read().decode(charset, errors="replace")
    except HTTPError as exc:
        emit("FAIL", f"HTTP {exc.code}: {url}")
        return 1
    except (URLError, TimeoutError) as exc:
        emit("FAIL", f"Request failed: {exc}")
        return 1

    failures = 0
    emit("PASS", f"HTTP {status}; final URL {final_url}")
    if content_type != "text/html":
        emit("FAIL", f"Expected text/html, got {content_type}")
        return 1

    parser = PageParser()
    parser.feed(body)
    title = " ".join("".join(parser.title_parts).split())

    def require(condition: bool, success: str, failure: str) -> None:
        nonlocal failures
        if condition:
            emit("PASS", success)
        else:
            failures += 1
            emit("FAIL", failure)

    require(bool(parser.html_lang), f"HTML language: {parser.html_lang}", "Missing html[lang]")
    require(bool(title), f"Title: {title}", "Missing or empty title")
    require(parser.h1_count >= 1, f"H1 count: {parser.h1_count}", "Missing main H1")
    if parser.h1_count > 1:
        emit("WARN", f"Multiple H1 elements ({parser.h1_count}); confirm page hierarchy")

    require(len(parser.canonicals) == 1, "One canonical link", f"Expected one canonical, found {len(parser.canonicals)}")
    if len(parser.canonicals) == 1:
        canonical = parser.canonicals[0]
        require(bool(urlparse(canonical).scheme and urlparse(canonical).netloc), f"Absolute canonical: {canonical}", f"Canonical is not absolute: {canonical}")

    require(bool(parser.meta.get("viewport")), "Viewport metadata present", "Missing viewport metadata")
    description = parser.meta.get("description", "")
    if description:
        emit("PASS", f"Meta description present ({len(description)} chars)")
    else:
        emit("WARN", "Missing meta description; Google may derive a snippet from page text")

    robots = " ".join((parser.meta.get("robots", ""), parser.meta.get("googlebot", ""))).lower()
    if "noindex" in robots and not allow_noindex:
        failures += 1
        emit("FAIL", f"Page contains noindex: {robots.strip()}")
    elif "noindex" in robots:
        emit("PASS", "Intentional noindex allowed")
    else:
        emit("PASS", "No noindex directive found")

    require(parser.images_missing_alt == 0, f"All {parser.images} img elements define alt", f"{parser.images_missing_alt}/{parser.images} img elements are missing alt")
    if parser.anchors_missing_href:
        emit("WARN", f"{parser.anchors_missing_href}/{parser.anchors} anchor elements lack href")
    else:
        emit("PASS", f"All {parser.anchors} anchor elements define href")

    invalid_json_ld = 0
    types: set[str] = set()
    for block in parser.json_ld_blocks:
        try:
            types.update(schema_types(json.loads(block)))
        except json.JSONDecodeError:
            invalid_json_ld += 1
    require(invalid_json_ld == 0, f"JSON-LD parses; types: {', '.join(sorted(types)) or 'none'}", f"Invalid JSON-LD blocks: {invalid_json_ld}")

    if failures:
        emit("FAIL", f"Audit completed with {failures} blocking issue(s)")
        return 1
    emit("PASS", "Audit completed without blocking issues")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", help="Public or local rendered page URL")
    parser.add_argument("--allow-noindex", action="store_true", help="Allow an intentional noindex directive")
    parser.add_argument("--timeout", type=float, default=20.0, help="Request timeout in seconds")
    args = parser.parse_args()
    return audit(args.url, args.allow_noindex, args.timeout)


if __name__ == "__main__":
    sys.exit(main())
