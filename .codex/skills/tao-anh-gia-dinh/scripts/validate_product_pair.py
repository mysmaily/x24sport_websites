#!/usr/bin/env python3
"""Validate a family-shirt image set before handoff or publishing."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


MASTER_NAME = re.compile(r"^(X24-DP-[0-9]{6})\.png$")
MARKETING_NAME = re.compile(r"^(X24-DP-[0-9]{6})-marketing\.webp$")
FAMILY_NAME = re.compile(r"^(X24-DP-[0-9]{6})-family-lifestyle\.webp$")
PREVIEW_NAME = re.compile(r"^(X24-DP-[0-9]{6})-print-preview\.webp$")


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
    return (
        normalized.startswith("srgb(255,255,255)")
        or normalized.startswith("srgba(255,255,255,1")
        or normalized in {"white", "gray(255)"}
    )


def require_square_webp(info: dict[str, object], label: str, min_size: int) -> None:
    if info["format"] != "WEBP":
        fail(f"{label} must be WebP")
    if info["width"] != info["height"]:
        fail(f"{label} must be square")
    if int(info["width"]) < min_size:
        fail(f"{label} must be at least {min_size}px")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--require-family-lifestyle", action="store_true")
    args = parser.parse_args()

    folder = args.folder.expanduser().resolve()
    if not folder.is_dir():
        fail(f"not a directory: {folder}")

    images = sorted(p for p in folder.iterdir() if p.suffix.lower() in {".png", ".webp", ".jpg", ".jpeg"})
    masters = [p for p in images if MASTER_NAME.fullmatch(p.name)]
    marketing = [p for p in images if MARKETING_NAME.fullmatch(p.name)]
    family = [p for p in images if FAMILY_NAME.fullmatch(p.name)]
    previews = [p for p in images if PREVIEW_NAME.fullmatch(p.name)]
    classified = set(masters + marketing + family + previews)

    if len(masters) != 1 or len(marketing) != 1:
        fail("expected one X24-DP-NNNNNN.png and one matching X24-DP-NNNNNN-marketing.webp")
    if args.require_family_lifestyle and len(family) != 1:
        fail("family lifestyle is required")
    if len(family) > 1:
        fail("expected at most one X24-DP-NNNNNN-family-lifestyle.webp")
    if len(previews) > 1:
        fail("expected at most one X24-DP-NNNNNN-print-preview.webp")
    if classified != set(images):
        fail("product folder contains an unsupported image filename")

    sku = MASTER_NAME.fullmatch(masters[0].name).group(1)
    for item, regex, label in (
        (marketing[0], MARKETING_NAME, "marketing"),
        (family[0] if family else None, FAMILY_NAME, "family lifestyle"),
        (previews[0] if previews else None, PREVIEW_NAME, "print preview"),
    ):
        if item and regex.fullmatch(item.name).group(1) != sku:
            fail(f"{label} filename must use the same SKU")

    master_info = identify(masters[0])
    marketing_info = identify(marketing[0])
    family_info = identify(family[0]) if family else None
    preview_info = identify(previews[0]) if previews else None

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

    require_square_webp(marketing_info, "marketing image", 1200)
    if family_info:
        require_square_webp(family_info, "family lifestyle", 1200)
    if preview_info:
        if (preview_info["format"], preview_info["width"], preview_info["height"]) != ("WEBP", 500, 500):
            fail("print preview must be exact 500x500 WebP")

    print(json.dumps({
        "ok": True,
        "folder": str(folder),
        "sku": sku,
        "printMaster": {"file": masters[0].name, **master_info},
        "marketing": {"file": marketing[0].name, **marketing_info},
        "familyLifestyle": ({"file": family[0].name, **family_info} if family_info else None),
        "printPreview": ({"file": previews[0].name, **preview_info} if preview_info else None),
        "visualInspectionRequired": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
