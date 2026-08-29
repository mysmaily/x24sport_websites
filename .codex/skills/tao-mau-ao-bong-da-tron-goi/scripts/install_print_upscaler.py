#!/usr/bin/env python3
"""Install the pinned official Real-ESRGAN macOS print upscaler in a user cache."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath


VERSION = "v0.2.5.0"
ARCHIVE_URL = (
    "https://github.com/xinntao/Real-ESRGAN/releases/download/"
    "v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip"
)
ARCHIVE_SHA256 = "e0ad05580abfeb25f8d8fb55aaf7bedf552c375b5b4d9bd3c8d59764d2cc333a"
REQUIRED_MEMBERS = {
    "realesrgan-ncnn-vulkan",
    "README_macos.md",
    "models/realesrgan-x4plus.param",
    "models/realesrgan-x4plus.bin",
    "models/realesrgan-x4plus-anime.param",
    "models/realesrgan-x4plus-anime.bin",
    "models/realesr-animevideov3-x4.param",
    "models/realesr-animevideov3-x4.bin",
}


def default_destination() -> Path:
    return Path.home() / "Library" / "Caches" / "x24sport" / f"realesrgan-ncnn-vulkan-{VERSION}"


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destination", type=Path, default=default_destination())
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def safe_member(name: str) -> bool:
    path = PurePosixPath(name)
    return not path.is_absolute() and ".." not in path.parts


def installed(destination: Path) -> bool:
    return all((destination / member).is_file() for member in REQUIRED_MEMBERS)


def validate_destination(destination: Path) -> None:
    protected = {
        Path("/").resolve(),
        Path.home().resolve(),
        (Path.home() / "Library").resolve(),
        (Path.home() / "Library" / "Caches").resolve(),
    }
    if destination in protected or not destination.name.startswith("realesrgan-ncnn-vulkan-"):
        raise SystemExit(
            "--destination must be a dedicated realesrgan-ncnn-vulkan-* cache directory, not a broad path"
        )


def main() -> None:
    args = parse_args()
    if platform.system() != "Darwin" or platform.machine() not in {"arm64", "x86_64"}:
        raise SystemExit("This pinned installer currently supports macOS arm64/x86_64 only")
    destination = args.destination.expanduser().resolve()
    validate_destination(destination)
    if installed(destination) and not args.force:
        print(json.dumps({"ok": True, "status": "already-installed", "destination": str(destination)}))
        return
    destination.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="x24-realesrgan-install-") as temp_name:
        temp = Path(temp_name)
        archive = temp / "realesrgan-macos.zip"
        with urllib.request.urlopen(ARCHIVE_URL, timeout=120) as response, archive.open("wb") as output:
            shutil.copyfileobj(response, output)
        actual_hash = checksum(archive)
        if actual_hash != ARCHIVE_SHA256:
            raise SystemExit(f"Archive checksum mismatch: expected {ARCHIVE_SHA256}, got {actual_hash}")

        staging = temp / "staging"
        staging.mkdir()
        with zipfile.ZipFile(archive) as bundle:
            available = {name for name in bundle.namelist() if safe_member(name)}
            missing = REQUIRED_MEMBERS - available
            if missing:
                raise SystemExit(f"Official archive is missing required files: {sorted(missing)}")
            for member in REQUIRED_MEMBERS:
                bundle.extract(member, staging)
        binary = staging / "realesrgan-ncnn-vulkan"
        binary.chmod(binary.stat().st_mode | 0o755)

        if destination.exists():
            if not args.force:
                raise SystemExit(f"Destination exists but is incomplete: {destination}; use --force")
            shutil.rmtree(destination)
        os.replace(staging, destination)

    print(json.dumps({
        "ok": True,
        "status": "installed",
        "version": VERSION,
        "archiveSha256": ARCHIVE_SHA256,
        "destination": str(destination),
    }, indent=2))


if __name__ == "__main__":
    main()
