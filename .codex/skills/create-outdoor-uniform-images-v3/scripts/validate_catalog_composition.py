#!/usr/bin/env python3
"""Validate basic catalog-board composition beyond file dimensions."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageStat


def region_stats(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[float, float]:
    crop = image.crop(box).convert("L")
    stat = ImageStat.Stat(crop)
    return stat.mean[0], stat.stddev[0]


def ink_coverage(image: Image.Image, box: tuple[int, int, int, int]) -> float:
    crop = image.crop(box).convert("RGB")
    pixels = crop.getdata()
    total = len(pixels)
    if total == 0:
        return 0.0
    ink = 0
    for red, green, blue in pixels:
        # Dark typography, burgundy accents, and orange icons count as deliberate content.
        if red < 190 or green < 190 or blue < 190:
            ink += 1
    return ink / total


def band_uniformity(image: Image.Image, box: tuple[int, int, int, int]) -> float:
    _, stddev = region_stats(image, box)
    return stddev


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--aspect", choices=("3:2", "1:1"), default="3:2")
    parser.add_argument("--min-side", type=int, default=1024)
    parser.add_argument("--require-left-panel-features", action="store_true")
    parser.add_argument("--forbid-footer-band", action="store_true")
    args = parser.parse_args()

    errors: list[str] = []
    image = Image.open(args.image).convert("RGB")
    width, height = image.size
    if min(width, height) < args.min_side:
        errors.append(f"undersized: {width}x{height}")
    ratio = width / height
    target = 1.5 if args.aspect == "3:2" else 1.0
    if abs(ratio - target) > 0.025:
        errors.append(f"wrong aspect: {width}x{height}, expected {args.aspect}")

    if args.require_left_panel_features:
        left_box = (0, round(height * 0.46), round(width * 0.30), round(height * 0.90))
        coverage = ink_coverage(image, left_box)
        if coverage < 0.055:
            errors.append(f"left editorial panel looks underused: ink coverage {coverage:.3f}")
        print(f"left_panel_ink_coverage={coverage:.3f}")

    if args.forbid_footer_band:
        footer_box = (0, round(height * 0.90), width, height)
        uniformity = band_uniformity(image, footer_box)
        if uniformity < 32:
            errors.append(f"bottom 10% looks like a uniform footer band: luminance stddev {uniformity:.2f}")
        print(f"footer_luminance_stddev={uniformity:.2f}")

    if errors:
        for error in errors:
            print(f"ERROR {error}", file=sys.stderr)
        return 1
    print(f"PASS composition validation {args.image} {width}x{height}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
