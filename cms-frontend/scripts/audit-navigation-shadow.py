#!/usr/bin/env python3
"""Compare rendered production and local shadow header controls tenant by tenant."""

from __future__ import annotations

import re
import sys
import urllib.request
from html.parser import HTMLParser


TENANTS = {
    "rynosport": "rynosport.vn",
    "x24sport": "x24sport.vn",
    "pndsport": "pndsport.vn",
    "mayaodongphuc": "mayaodongphuc.com.vn",
    "dongphucx24": "dongphucx24.vn",
    "mayaocaulong": "mayaocaulong.vn",
    "mayaopickleball": "mayaopickleball.vn",
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


def controls(html: str) -> list[tuple[str, str, str]]:
    parser = HeaderControlParser()
    parser.feed(html)
    return parser.controls


def main() -> int:
    failures = 0
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
            continue
        failures += 1
        print(f"FAIL {slug}: production={len(production)} shadow={len(shadow)}")
        for index in range(max(len(production), len(shadow))):
            left = production[index] if index < len(production) else None
            right = shadow[index] if index < len(shadow) else None
            if left != right:
                print(f"  [{index}] production={left!r} shadow={right!r}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
