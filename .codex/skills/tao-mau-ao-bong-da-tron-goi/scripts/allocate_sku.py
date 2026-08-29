#!/usr/bin/env python3
"""Allocate and reserve a unique monotonic X24-BD six-digit SKU."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


SKU_PATTERN = re.compile(r"X24-BD-([0-9]{6})")
MAX_SEQUENCE = 999_999
TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", required=True, type=Path)
    parser.add_argument("--scan-root", action="append", default=[], type=Path)
    parser.add_argument("--start-number", type=int, default=1)
    return parser.parse_args()


def numbers_in_path(root: Path) -> set[int]:
    if not root.exists():
        return set()
    found: set[int] = set()
    for path in root.rglob("*"):
        if path.is_file():
            found.update(int(value) for value in SKU_PATTERN.findall(path.name))
    return found


def numbers_in_text(value: str) -> set[int]:
    return {int(match) for match in SKU_PATTERN.findall(value)}


def main() -> None:
    args = parse_args()
    if not 0 <= args.start_number <= MAX_SEQUENCE:
        raise SystemExit("--start-number must be between 0 and 999999")

    registry = args.registry.expanduser().resolve()
    registry.parent.mkdir(parents=True, exist_ok=True)
    scanned: set[int] = set()
    for root in args.scan_root:
        scanned |= numbers_in_path(root.expanduser().resolve())

    with registry.open("a+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        handle.seek(0)
        seen = numbers_in_text(handle.read()) | scanned
        candidate = max(seen) + 1 if seen else args.start_number
        if candidate > MAX_SEQUENCE:
            raise SystemExit("No unused X24-BD SKU remains")
        sku = f"X24-BD-{candidate:06d}"
        handle.seek(0, os.SEEK_END)
        handle.write(json.dumps({
            "sku": sku,
            "allocatedAt": datetime.now(TIMEZONE).isoformat(timespec="seconds"),
            "allocationMode": "monotonic-six-digit",
        }, ensure_ascii=False) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
        print(sku)


if __name__ == "__main__":
    main()
