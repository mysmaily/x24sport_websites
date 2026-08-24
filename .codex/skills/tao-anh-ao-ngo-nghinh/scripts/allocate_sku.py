#!/usr/bin/env python3
"""Allocate and reserve a unique X24-DP-HHSSMM SKU."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo


SKU_PATTERN = re.compile(r"X24-DP-[0-9]{6}")
TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", required=True, type=Path)
    parser.add_argument("--root", type=Path)
    parser.add_argument("--at", help="ISO timestamp used as the first candidate")
    return parser.parse_args()


def start_time(value: str | None) -> datetime:
    if not value:
        return datetime.now(TIMEZONE)
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=TIMEZONE)
    return parsed.astimezone(TIMEZONE)


def sku_for(moment: datetime) -> str:
    return f"X24-DP-{moment.strftime('%H%S%M')}"


def skus_in_root(root: Path | None) -> set[str]:
    if not root or not root.exists():
        return set()
    found: set[str] = set()
    for path in root.rglob("*"):
        if path.is_file():
            found.update(SKU_PATTERN.findall(path.name))
    return found


def main() -> None:
    args = parse_args()
    registry = args.registry.expanduser().resolve()
    registry.parent.mkdir(parents=True, exist_ok=True)
    existing_files = skus_in_root(args.root.expanduser().resolve() if args.root else None)

    with registry.open("a+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        handle.seek(0)
        seen = set(SKU_PATTERN.findall(handle.read())) | existing_files
        candidate_time = start_time(args.at)
        for offset in range(24 * 60 * 60):
            sku = sku_for(candidate_time + timedelta(seconds=offset))
            if sku in seen:
                continue
            record = {
                "sku": sku,
                "allocatedAt": datetime.now(TIMEZONE).isoformat(timespec="seconds"),
            }
            handle.seek(0, os.SEEK_END)
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            print(sku)
            return
    raise SystemExit("No unused X24-DP-HHSSMM SKU remains in the 24-hour namespace")


if __name__ == "__main__":
    main()
