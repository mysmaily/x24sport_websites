#!/usr/bin/env python3
"""Deliver validated front/back print masters to the Mayaobongda volume."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit("Pillow is required") from error


SKU_RE = re.compile(r"^X24-BD-[0-9]{2}(?:[0-5][0-9])?(?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$")
DEFAULT_DESTINATION = Path("/Volumes/Data/x24_project/mayaobongda.vn")


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("folder", type=Path)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--destination-root", type=Path, default=DEFAULT_DESTINATION)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-FFMMHHDD or legacy X24-BD-FFHHDD")

    folder = args.folder.expanduser().resolve()
    destination = args.destination_root.expanduser().resolve()
    validator = Path(__file__).with_name("validate_delivery.py")
    validated = subprocess.run(
        [sys.executable, str(validator), str(folder)],
        capture_output=True,
        text=True,
        check=False,
    )
    if validated.returncode != 0:
        details = (validated.stderr or validated.stdout).strip()
        raise SystemExit(f"Delivery validation failed; nothing was copied: {details}")
    pairs = [
        (
            "front",
            folder / "print" / f"{args.sku}-front-print.png",
            destination / f"{args.sku}_truoc.png",
        ),
        (
            "back",
            folder / "print" / f"{args.sku}-back-print.png",
            destination / f"{args.sku}_sau.png",
        ),
    ]

    source_hashes: dict[str, str] = {}
    for role, source, target in pairs:
        if not source.is_file():
            raise SystemExit(f"Missing {role} print master: {source}")
        with Image.open(source) as image:
            image.load()
            if image.format != "PNG":
                raise SystemExit(f"{role} print master must be PNG")
        source_hashes[role] = checksum(source)
        if target.exists() and checksum(target) != source_hashes[role] and not args.overwrite:
            raise SystemExit(f"Refusing to overwrite different destination file: {target}")

    if not args.dry_run:
        destination.mkdir(parents=True, exist_ok=True)
        for role, source, target in pairs:
            if target.exists() and checksum(target) == source_hashes[role]:
                continue
            shutil.copy2(source, target)
            if checksum(target) != source_hashes[role]:
                raise SystemExit(f"Checksum verification failed after copying: {target}")

    print(json.dumps({
        "ok": True,
        "dryRun": bool(args.dry_run),
        "sku": args.sku,
        "destinationRoot": str(destination),
        "files": [
            {
                "role": role,
                "source": str(source),
                "destination": str(target),
                "sha256": source_hashes[role],
                "status": "planned" if args.dry_run else "verified",
            }
            for role, source, target in pairs
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
