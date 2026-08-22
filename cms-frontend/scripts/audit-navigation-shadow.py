#!/usr/bin/env python3
"""Compare rendered production and local shadow header controls tenant by tenant."""

from __future__ import annotations

import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, urlunsplit


TENANTS = {
    "rynosport": "rynosport.vn",
    "x24sport": "x24sport.vn",
    "pndsport": "pndsport.vn",
    "mayaodongphuc": "mayaodongphuc.com.vn",
    "dongphucx24": "dongphucx24.vn",
    "mayaocaulong": "mayaocaulong.vn",
    "mayaopickleball": "mayaopickleball.vn",
    "mayaobongchuyen": "mayaobongchuyen.vn",
    "mayaobongro": "mayaobongro.vn",
    "mayaochaybo": "mayaochaybo.vn",
    "mayaobongda": "mayaobongda.vn",
}


def normalized(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


class HeaderControlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.header_depth = 0
        self.active: list[dict[str, object]] = []
        self.controls: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "header":
            self.header_depth += 1
        if not self.header_depth or tag not in {"a", "button"}:
            return
        values = dict(attrs)
        self.active.append(
            {
                "tag": tag,
                "href": values.get("href") or "",
                "label": values.get("aria-label") or "",
                "text": [],
            }
        )

    def handle_data(self, data: str) -> None:
        if self.active:
            self.active[-1]["text"].append(data)  # type: ignore[union-attr]

    def handle_endtag(self, tag: str) -> None:
        if self.active and self.active[-1]["tag"] == tag:
            item = self.active.pop()
            text = normalized("".join(item["text"]))  # type: ignore[arg-type]
            label = text or normalized(str(item["label"]))
            self.controls.append((str(item["tag"]), str(item["href"]), label))
        if tag == "header" and self.header_depth:
            self.header_depth -= 1


def fetch(url: str, headers: dict[str, str]) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "X24 navigation audit", **headers})
    with urllib.request.urlopen(request, timeout=45) as response:
        if response.status != 200:
            raise RuntimeError(f"{url} returned {response.status}")
        return response.read().decode("utf-8")


def check_url(url: str) -> tuple[str, int | str]:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "X24 navigation audit"}, method="HEAD")
        with urllib.request.urlopen(request, timeout=45) as response:
            return url, response.status
    except Exception as error:  # The caller prints the exact failing URL.
        return url, str(error)


def controls(html: str) -> list[tuple[str, str, str]]:
    parser = HeaderControlParser()
    parser.feed(html)
    return parser.controls


def main() -> int:
    failures = 0
    same_origin_urls: set[str] = set()
    for slug, domain in TENANTS.items():
        production = controls(fetch(f"https://{domain}/", {}))
        shadow = controls(
            fetch(
                f"http://127.0.0.1:3020/{slug}/",
                {
                    "Host": "preview.invalid",
                    "x-x24-public-host": domain,
                    "x-x24-tenant-slug": slug,
                    "x-x24-tenant-domain": domain,
                    "x-x24-tenant-name": slug,
                },
            )
        )
        if production == shadow:
            print(f"PASS {slug}: {len(production)} header controls")
        else:
            failures += 1
            print(f"FAIL {slug}: production={len(production)} shadow={len(shadow)}")
            for index in range(max(len(production), len(shadow))):
                left = production[index] if index < len(production) else None
                right = shadow[index] if index < len(shadow) else None
                if left != right:
                    print(f"  [{index}] production={left!r} shadow={right!r}")
        for tag, href, _label in production:
            if tag != "a" or not href or href.startswith(("#", "mailto:", "tel:")):
                continue
            resolved = urlsplit(urljoin(f"https://{domain}/", href))
            if resolved.hostname not in {domain, f"www.{domain}"}:
                continue
            same_origin_urls.add(urlunsplit((resolved.scheme, resolved.netloc, resolved.path, resolved.query, "")))

    with ThreadPoolExecutor(max_workers=12) as executor:
        crawl_results = list(executor.map(check_url, sorted(same_origin_urls)))
    broken = [(url, status) for url, status in crawl_results if not isinstance(status, int) or not 200 <= status < 300]
    if broken:
        failures += 1
        print(f"FAIL URL crawl: {len(broken)}/{len(crawl_results)} non-2xx")
        for url, status in broken:
            print(f"  {status} {url}")
    else:
        print(f"PASS URL crawl: {len(crawl_results)} same-origin header URLs returned final 2xx")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
