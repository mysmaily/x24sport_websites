#!/usr/bin/env python3
"""Allocate and reserve a unique six-digit X24-DP SKU."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


SKU_PATTERN = re.compile(r"X24-DP-([0-9]{6})")
MAX_SEQUENCE = 999_999
TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")
DEFAULT_ARCHIVE_ROOT = Path("/Volumes/Data/x24_project/mayaodongphuc.com.vn")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", required=True, type=Path)
    parser.add_argument("--root", type=Path, help="Legacy alias for --scan-root")
    parser.add_argument("--scan-root", action="append", default=[], type=Path, help="Folder to scan for existing SKU filenames")
    parser.add_argument("--start-number", type=int, help="First sequence to use only when no SKU exists yet")
    parser.add_argument("--at", help="Deprecated; accepted for older callers but no longer affects allocation")
    return parser.parse_args()


def full_sku(number: int) -> str:
    return f"X24-DP-{number:06d}"


def numbers_in_root(root: Path | None) -> set[int]:
    if not root or not root.exists():
        return set()
    found: set[int] = set()
    for path in root.rglob("*"):
        if path.is_file():
            found.update(int(match) for match in SKU_PATTERN.findall(path.name))
    return found


def numbers_in_text(value: str) -> set[int]:
    return {int(match) for match in SKU_PATTERN.findall(value)}


def scan_roots(args: argparse.Namespace) -> list[Path]:
    roots: list[Path] = []
    if args.root:
        roots.append(args.root)
    roots.extend(args.scan_root)
    if DEFAULT_ARCHIVE_ROOT.exists():
        roots.append(DEFAULT_ARCHIVE_ROOT)
    return roots


def main() -> None:
    args = parse_args()
    registry = args.registry.expanduser().resolve()
    registry.parent.mkdir(parents=True, exist_ok=True)
    existing_files: set[int] = set()
    for root in scan_roots(args):
        existing_files |= numbers_in_root(root.expanduser().resolve())

    with registry.open("a+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        handle.seek(0)
        seen = numbers_in_text(handle.read()) | existing_files
        if args.start_number is not None and (args.start_number < 0 or args.start_number > MAX_SEQUENCE):
            raise SystemExit("--start-number must be between 0 and 999999")
        first_candidate = max(seen) + 1 if seen else (args.start_number if args.start_number is not None else 1)
        if first_candidate > MAX_SEQUENCE:
            raise SystemExit("No unused six-digit X24-DP SKU remains in the 000000-999999 namespace")
        for number in range(first_candidate, MAX_SEQUENCE + 1):
            if number in seen:
                continue
            sku = full_sku(number)
            record = {
                "sku": sku,
                "allocatedAt": datetime.now(TIMEZONE).isoformat(timespec="seconds"),
                "allocationMode": "monotonic-six-digit",
            }
            handle.seek(0, os.SEEK_END)
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            print(sku)
            return
    raise SystemExit("No unused six-digit X24-DP SKU remains in the 000000-999999 namespace")


if __name__ == "__main__":
    main()
