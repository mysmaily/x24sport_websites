#!/usr/bin/env python3
"""Archive one validated print master into Mayaodongphuc category folders."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path


DEFAULT_ROOT = Path("/Volumes/Data/x24_project/mayaodongphuc.com.vn")
VOLUME_MOUNT = Path("/Volumes/Data")
MASTER_NAME = re.compile(r"^X24-DP-[0-9]{6}\.png$")
CATEGORY_SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("print_master", type=Path)
    parser.add_argument("--category", action="append", required=True)
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.print_master.expanduser().resolve()
    root = args.root.expanduser()

    if not source.is_file():
        raise SystemExit(f"ERROR: print master not found: {source}")
    if not MASTER_NAME.fullmatch(source.name):
        raise SystemExit("ERROR: filename must be exactly X24-DP-NNNNNN.png")

    categories = list(dict.fromkeys(args.category))
    invalid = [slug for slug in categories if not CATEGORY_SLUG.fullmatch(slug)]
    if invalid:
        raise SystemExit(f"ERROR: invalid category slug(s): {', '.join(invalid)}")

    if root == DEFAULT_ROOT and not os.path.ismount(VOLUME_MOUNT):
        raise SystemExit("ERROR: /Volumes/Data is not mounted; refusing to create an archive path")
    if not root.exists():
        if root == DEFAULT_ROOT:
            raise SystemExit(f"ERROR: archive root does not exist: {root}")
        root.mkdir(parents=True)
    if not os.access(root, os.W_OK):
        raise SystemExit(f"ERROR: archive root is not writable: {root}")

    source_hash = sha256(source)
    destinations = [root / slug / source.name for slug in categories]

    for destination in destinations:
        if destination.exists() and sha256(destination) != source_hash:
            raise SystemExit(f"ERROR: SKU conflict; refusing to overwrite different bytes: {destination}")

    results: list[dict[str, str]] = []
    for destination in destinations:
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists():
            action = "unchanged"
        else:
            with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as handle:
                temp_path = Path(handle.name)
            try:
                shutil.copy2(source, temp_path)
                os.replace(temp_path, destination)
            finally:
                temp_path.unlink(missing_ok=True)
            action = "copied"
        results.append({"category": destination.parent.name, "path": str(destination), "action": action})

    print(json.dumps({"sku": source.stem, "sha256": source_hash, "archives": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
