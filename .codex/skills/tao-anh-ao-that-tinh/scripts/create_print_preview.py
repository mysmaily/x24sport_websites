#!/usr/bin/env python3
"""Create an exact 500x500 WebP website preview from a heartbreak-shirt print master."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path


MASTER_NAME = re.compile(r"^(X24-DP-[0-9]{6})\.png$")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("print_master", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    source = args.print_master.expanduser().resolve()
    if not source.is_file():
        raise SystemExit(f"ERROR: print master not found: {source}")
    match = MASTER_NAME.fullmatch(source.name)
    if not match:
        raise SystemExit("ERROR: print master filename must be exactly X24-DP-NNNNNN.png")
    sku = match.group(1)
    output = (args.output.expanduser() if args.output else source.with_name(f"{sku}-print-preview.webp")).resolve()
    if output.name != f"{sku}-print-preview.webp":
        raise SystemExit(f"ERROR: output filename must be {sku}-print-preview.webp")

    magick = shutil.which("magick")
    if not magick:
        raise SystemExit("ERROR: ImageMagick `magick` is required")

    output.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(suffix=".webp", dir=output.parent)
    os.close(fd)
    temp = Path(temp_name)
    try:
        result = subprocess.run(
            [
                magick,
                str(source),
                "-background", "white",
                "-alpha", "remove",
                "-alpha", "off",
                "-filter", "Lanczos",
                "-resize", "500x500^",
                "-gravity", "center",
                "-extent", "500x500",
                "-strip",
                "-quality", "100",
                str(temp),
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            raise SystemExit(f"ERROR: ImageMagick failed: {result.stderr.strip()}")
        if output.exists():
            if sha256(output) != sha256(temp):
                raise SystemExit(f"ERROR: preview conflict; refusing to overwrite different bytes: {output}")
            action = "unchanged"
        else:
            os.replace(temp, output)
            action = "created"
        print(f"{action} {output} sha256={sha256(output)}")
    finally:
        temp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
