#!/usr/bin/env python3
"""Verify exact status, redirect, canonical, and robots behavior from a CSV manifest."""

from __future__ import annotations

import argparse
import csv
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        return None


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.canonical: str | None = None
        self.robots: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value for key, value in attrs if value is not None}
        if tag.lower() == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical = values.get("href")
        if tag.lower() == "meta" and values.get("name", "").lower() in {"robots", "googlebot"}:
            self.robots.append(values.get("content", ""))


@dataclass
class Result:
    line: int
    path: str
    ok: bool
    details: list[str]


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description=__doc__)
    command.add_argument("manifest", help="CSV manifest path, or - for stdin")
    command.add_argument("--base-url", required=True, help="Origin URL, e.g. http://127.0.0.1:3004")
    command.add_argument("--host", help="Optional public Host header for origin verification")
    command.add_argument("--timeout", type=float, default=15.0)
    command.add_argument("--user-agent", default="X24Sport-URL-Contract/1.0")
    return command


def read_rows(manifest: str) -> list[dict[str, str]]:
    if manifest == "-":
        return list(csv.DictReader(sys.stdin))
    with Path(manifest).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def normalized_absolute(value: str, public_origin: str) -> str:
    return urljoin(public_origin.rstrip("/") + "/", value)


def verify(row: dict[str, str], line: int, args: argparse.Namespace) -> Result:
    path = row.get("path", "").strip()
    details: list[str] = []
    if not path.startswith("/"):
        return Result(line, path, False, ["path must begin with /"])

    expected_status = int(row.get("expected_status", "200") or "200")
    expected_canonical = row.get("expected_canonical", "").strip()
    expected_location = row.get("expected_location", "").strip()
    expected_indexability = (row.get("indexability", "") or "ignore").strip().lower()
    request_url = urljoin(args.base_url.rstrip("/") + "/", path.lstrip("/"))
    headers = {"User-Agent": args.user_agent, "Accept": "text/html,application/xhtml+xml"}
    if args.host:
        headers["Host"] = args.host

    public_origin = args.host
    if public_origin:
        public_origin = "https://" + public_origin
    else:
        split = urlsplit(args.base_url)
        public_origin = f"{split.scheme}://{split.netloc}"

    status = 0
    response_headers = None
    body = b""
    try:
        response = build_opener(NoRedirect).open(Request(request_url, headers=headers), timeout=args.timeout)
        status = response.status
        response_headers = response.headers
        body = response.read()
    except HTTPError as error:
        status = error.code
        response_headers = error.headers
        body = error.read()
    except URLError as error:
        return Result(line, path, False, [f"request failed: {error.reason}"])

    if status != expected_status:
        details.append(f"status {status}, expected {expected_status}")

    if 300 <= status < 400:
        location = response_headers.get("Location", "") if response_headers else ""
        if not expected_location:
            details.append(f"unexpected redirect location={location or '<missing>'}")
        else:
            expected_redirect = normalized_absolute(expected_location, public_origin)
            actual_redirect = normalized_absolute(location, public_origin) if location else None
            if actual_redirect != expected_redirect:
                details.append(
                    f"redirect location {actual_redirect or '<missing>'}, expected {expected_redirect}"
                )

    content_type = response_headers.get_content_type() if response_headers else ""
    parsed = MetadataParser()
    if content_type in {"text/html", "application/xhtml+xml"} and body:
        parsed.feed(body.decode(response_headers.get_content_charset() or "utf-8", errors="replace"))

    if expected_canonical:
        expected = normalized_absolute(expected_canonical, public_origin)
        actual = normalized_absolute(parsed.canonical, public_origin) if parsed.canonical else None
        if actual != expected:
            details.append(f"canonical {actual or '<missing>'}, expected {expected}")

    robots_values = [value.lower() for value in parsed.robots]
    if response_headers:
        robots_values.extend(value.lower() for value in response_headers.get_all("X-Robots-Tag", []))
    has_noindex = any("noindex" in value for value in robots_values)
    if expected_indexability == "index" and has_noindex:
        details.append("unexpected noindex")
    if expected_indexability == "noindex" and not has_noindex:
        details.append("expected noindex is missing")

    return Result(line, path, not details, details)


def main() -> int:
    args = parser().parse_args()
    rows = read_rows(args.manifest)
    required = {"path", "expected_status"}
    if rows and not required.issubset(rows[0]):
        missing = ", ".join(sorted(required - set(rows[0])))
        print(f"manifest missing columns: {missing}", file=sys.stderr)
        return 2
    if not rows:
        print("manifest contains no URL rows", file=sys.stderr)
        return 2

    results = [verify(row, line, args) for line, row in enumerate(rows, start=2)]
    failures = [result for result in results if not result.ok]
    for result in failures:
        print(f"FAIL line={result.line} path={result.path} :: {'; '.join(result.details)}")
    print(f"checked={len(results)} passed={len(results) - len(failures)} failed={len(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
