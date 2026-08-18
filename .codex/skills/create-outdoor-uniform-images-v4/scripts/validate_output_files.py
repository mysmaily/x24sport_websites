#!/usr/bin/env python3
"""Validate count, readability, dimensions, and exact duplicates in PNG/JPEG sets."""

from __future__ import annotations

import argparse
import hashlib
import struct
import sys
from pathlib import Path


def image_size(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        header = handle.read(32)
        if header.startswith(b"\x89PNG\r\n\x1a\n"):
            return struct.unpack(">II", header[16:24])
        if header[:2] != b"\xff\xd8":
            raise ValueError("unsupported format; expected PNG or JPEG")
        handle.seek(2)
        while True:
            marker_start = handle.read(1)
            if not marker_start:
                break
            if marker_start != b"\xff":
                continue
            marker = handle.read(1)
            while marker == b"\xff":
                marker = handle.read(1)
            if marker in {b"\xd8", b"\xd9"}:
                continue
            length_raw = handle.read(2)
            if len(length_raw) != 2:
                break
            length = struct.unpack(">H", length_raw)[0]
            if marker and marker[0] in range(0xC0, 0xC4):
                data = handle.read(5)
                if len(data) != 5:
                    break
                height, width = struct.unpack(">HH", data[1:5])
                return width, height
            handle.seek(length - 2, 1)
    raise ValueError("could not read dimensions")


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--expected", type=int)
    parser.add_argument("--min-side", type=int, default=1024)
    args = parser.parse_args()

    errors: list[str] = []
    if args.expected is not None and len(args.files) != args.expected:
        errors.append(f"expected {args.expected} files, received {len(args.files)}")

    hashes: dict[str, Path] = {}
    for path in args.files:
        if not path.is_file():
            errors.append(f"missing file: {path}")
            continue
        try:
            width, height = image_size(path)
            if min(width, height) < args.min_side:
                errors.append(f"undersized: {path} is {width}x{height}")
            file_hash = digest(path)
            if file_hash in hashes:
                errors.append(f"exact duplicate: {path} and {hashes[file_hash]}")
            else:
                hashes[file_hash] = path
            print(f"OK {path} {width}x{height}")
        except (OSError, ValueError, struct.error) as exc:
            errors.append(f"unreadable {path}: {exc}")

    if errors:
        for error in errors:
            print(f"ERROR {error}", file=sys.stderr)
        return 1
    print("PASS file-level validation; visual quality gates are still required")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
