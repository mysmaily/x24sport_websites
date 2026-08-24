#!/usr/bin/env python3
"""Validate the two-file output contract for one playful-shirt product."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def identify(path: Path) -> dict[str, object]:
    magick = shutil.which("magick")
    if not magick:
        fail("ImageMagick `magick` is required for validation")
    fmt = "%m|%w|%h|%x|%y|%U|%[pixel:p{0,0}]|%[pixel:p{%[fx:w-1],0}]|%[pixel:p{0,%[fx:h-1]}]|%[pixel:p{%[fx:w-1],%[fx:h-1]}]"
    result = subprocess.run(
        [magick, "identify", "-format", fmt, str(path)],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        fail(f"cannot inspect {path.name}: {result.stderr.strip()}")
    parts = result.stdout.split("|")
    if len(parts) != 10:
        fail(f"unexpected identify output for {path.name}")
    return {
        "format": parts[0],
        "width": int(parts[1]),
        "height": int(parts[2]),
        "densityX": float(parts[3]),
        "densityY": float(parts[4]),
        "units": parts[5],
        "corners": parts[6:],
    }


def is_white(pixel: str) -> bool:
    normalized = pixel.lower().replace(" ", "")
    return normalized.startswith("srgb(255,255,255)") or normalized.startswith("srgba(255,255,255,1") or normalized in {"white", "gray(255)"}


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: validate_product_pair.py /absolute/path/to/product-folder")
    folder = Path(sys.argv[1]).expanduser().resolve()
    if not folder.is_dir():
        fail(f"not a directory: {folder}")

    images = sorted(p for p in folder.iterdir() if p.suffix.lower() in {".png", ".webp", ".jpg", ".jpeg"})
    if len(images) != 2:
        fail(f"expected exactly 2 published images, found {len(images)}")

    masters = [p for p in images if p.name.endswith("-print-master.png")]
    marketing = [p for p in images if p.name.endswith("-marketing.webp")]
    if len(masters) != 1 or len(marketing) != 1:
        fail("expected one *-print-master.png and one *-marketing.webp")

    master_info = identify(masters[0])
    marketing_info = identify(marketing[0])

    if master_info["format"] != "PNG":
        fail("print master must be PNG")
    if (master_info["width"], master_info["height"]) != (4500, 4500):
        fail("print master must be 4500x4500")
    if not all(is_white(str(pixel)) for pixel in master_info["corners"]):
        fail("all print-master corners must be pure white")
    if master_info["units"] == "PixelsPerCentimeter":
        if min(float(master_info["densityX"]), float(master_info["densityY"])) < 118:
            fail("print master density must be at least 300 DPI")
    elif min(float(master_info["densityX"]), float(master_info["densityY"])) < 299:
        fail("print master density must be at least 300 DPI")

    if marketing_info["format"] != "WEBP":
        fail("marketing image must be WebP")
    if marketing_info["width"] != marketing_info["height"]:
        fail("marketing image must be square")
    if int(marketing_info["width"]) < 1200:
        fail("marketing image must be at least 1200px")

    print(json.dumps({
        "ok": True,
        "folder": str(folder),
        "printMaster": {"file": masters[0].name, **master_info},
        "marketing": {"file": marketing[0].name, **marketing_info},
        "visualInspectionRequired": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
