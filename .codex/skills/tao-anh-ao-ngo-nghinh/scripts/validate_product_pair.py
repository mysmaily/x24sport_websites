#!/usr/bin/env python3
"""Validate the production pair and optional 500px publishing preview."""

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
PREVIEW_NAME = re.compile(r"^(X24-DP-[0-9]{6})-print-preview\.webp$")
STUDENT_NAME = re.compile(r"^(X24-DP-[0-9]{6})-student-lifestyle\.webp$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def identify(path: Path) -> dict[str, object]:
    magick = shutil.which("magick")
    if not magick:
        fail("ImageMagick `magick` is required for validation")
    fmt = "%m|%w|%h|%x|%y|%U|%[channels]|%[opaque]|%[fx:p{0,0}.a]|%[fx:p{%[fx:w-1],0}.a]|%[fx:p{0,%[fx:h-1]}.a]|%[fx:p{%[fx:w-1],%[fx:h-1]}.a]"
    result = subprocess.run(
        [magick, "identify", "-format", fmt, str(path)],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        fail(f"cannot inspect {path.name}: {result.stderr.strip()}")
    parts = result.stdout.split("|")
    if len(parts) != 12:
        fail(f"unexpected identify output for {path.name}")
    return {
        "format": parts[0],
        "width": int(parts[1]),
        "height": int(parts[2]),
        "densityX": float(parts[3]),
        "densityY": float(parts[4]),
        "units": parts[5],
        "channels": parts[6],
        "opaque": parts[7],
        "cornerAlpha": [float(value) for value in parts[8:]],
    }


def has_alpha_channel(channels: object) -> bool:
    return "a" in str(channels).lower().split()[0]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--require-student-lifestyle", action="store_true")
    args = parser.parse_args()
    folder = args.folder.expanduser().resolve()
    if not folder.is_dir():
        fail(f"not a directory: {folder}")

    images = sorted(p for p in folder.iterdir() if p.suffix.lower() in {".png", ".webp", ".jpg", ".jpeg"})
    previews = [p for p in images if PREVIEW_NAME.fullmatch(p.name)]
    production_images = [p for p in images if p not in previews]
    if len(production_images) not in {2, 3}:
        fail(f"expected master, marketing, and optional student lifestyle, found {len(production_images)} files")
    if len(previews) > 1:
        fail("expected at most one SKU-print-preview.webp")

    masters = [p for p in production_images if MASTER_NAME.fullmatch(p.name)]
    marketing = [p for p in production_images if MARKETING_NAME.fullmatch(p.name)]
    students = [p for p in production_images if STUDENT_NAME.fullmatch(p.name)]
    if len(masters) != 1 or len(marketing) != 1:
        fail("expected one X24-DP-NNNNNN.png and one matching X24-DP-NNNNNN-marketing.webp")
    if len(students) > 1:
        fail("expected at most one X24-DP-NNNNNN-student-lifestyle.webp")
    if args.require_student_lifestyle and len(students) != 1:
        fail("student lifestyle is required")
    classified = set(masters + marketing + students)
    if classified != set(production_images):
        fail("product folder contains an unsupported image filename")

    master_sku = MASTER_NAME.fullmatch(masters[0].name).group(1)
    marketing_sku = MARKETING_NAME.fullmatch(marketing[0].name).group(1)
    if master_sku != marketing_sku:
        fail("print master and marketing filenames must use the same SKU")
    if students and STUDENT_NAME.fullmatch(students[0].name).group(1) != master_sku:
        fail("student lifestyle filename must use the same SKU")

    master_info = identify(masters[0])
    marketing_info = identify(marketing[0])
    student_info = identify(students[0]) if students else None

    if master_info["format"] != "PNG":
        fail("print master must be PNG")
    if (master_info["width"], master_info["height"]) != (4500, 4500):
        fail("print master must be 4500x4500")
    if not has_alpha_channel(master_info["channels"]) or str(master_info["opaque"]).lower() != "false":
        fail("print master must have a transparent alpha channel")
    if not all(float(alpha) == 0 for alpha in master_info["cornerAlpha"]):
        fail("all print-master corners must be fully transparent")
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

    if student_info:
        if student_info["format"] != "WEBP":
            fail("student lifestyle must be WebP")
        if student_info["width"] != student_info["height"]:
            fail("student lifestyle must be square")
        if int(student_info["width"]) < 1200:
            fail("student lifestyle must be at least 1200px")

    preview_report = None
    if previews:
        preview_sku = PREVIEW_NAME.fullmatch(previews[0].name).group(1)
        if preview_sku != master_sku:
            fail("print preview filename must use the same SKU")
        preview_info = identify(previews[0])
        if preview_info["format"] != "WEBP" or (preview_info["width"], preview_info["height"]) != (500, 500):
            fail("print preview must be exact 500x500 WebP")
        preview_report = {"file": previews[0].name, **preview_info}

    print(json.dumps({
        "ok": True,
        "folder": str(folder),
        "sku": master_sku,
        "printMaster": {"file": masters[0].name, **master_info},
        "marketing": {"file": marketing[0].name, **marketing_info},
        "studentLifestyle": ({"file": students[0].name, **student_info} if students else None),
        "printPreview": preview_report,
        "visualInspectionRequired": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
