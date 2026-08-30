#!/usr/bin/env python3
"""Allocate an X24-BD SKU as centisecond + minute + hour + day."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


SKU_PATTERN = re.compile(r"X24-BD-([0-9]{8}|[0-9]{6})")
TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", required=True, type=Path)
    parser.add_argument("--scan-root", action="append", default=[], type=Path)
    return parser.parse_args()


def suffixes_in_path(root: Path) -> set[str]:
    if not root.exists():
        return set()
    found: set[str] = set()
    for path in root.rglob("*"):
        if path.is_file():
            found.update(SKU_PATTERN.findall(path.name))
    return found


def suffixes_in_text(value: str) -> set[str]:
    return set(SKU_PATTERN.findall(value))


def timed_suffix(now: datetime, fraction: int | None = None) -> str:
    centisecond = now.microsecond // 10_000 if fraction is None else fraction
    return f"{centisecond:02d}{now:%M%H%d}"


def main() -> None:
    args = parse_args()
    registry = args.registry.expanduser().resolve()
    registry.parent.mkdir(parents=True, exist_ok=True)
    scanned: set[str] = set()
    for root in args.scan_root:
        scanned |= suffixes_in_path(root.expanduser().resolve())

    with registry.open("a+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        handle.seek(0)
        seen = suffixes_in_text(handle.read()) | scanned
        now = datetime.now(TIMEZONE)
        initial_fraction = now.microsecond // 10_000
        suffix = ""
        for step in range(100):
            candidate_fraction = (initial_fraction + step) % 100
            candidate = timed_suffix(now, candidate_fraction)
            if candidate not in seen:
                suffix = candidate
                break
        if not suffix:
            raise SystemExit(
                f"All 100 centisecond slots are used for minute/hour/day {now:%M/%H/%d}"
            )

        sku = f"X24-BD-{suffix}"
        handle.seek(0, os.SEEK_END)
        handle.write(json.dumps({
            "sku": sku,
            "allocatedAt": now.isoformat(timespec="milliseconds"),
            "allocationMode": "centisecond-minute-hour-day",
            "format": "X24-BD-FFMMHHDD",
            "components": {
                "FF": suffix[:2],
                "MM": suffix[2:4],
                "HH": suffix[4:6],
                "DD": suffix[6:8],
            },
        }, ensure_ascii=False) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
        print(sku)


if __name__ == "__main__":
    main()
