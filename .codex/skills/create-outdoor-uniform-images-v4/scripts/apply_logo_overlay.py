#!/usr/bin/env python3
"""Composite exactly one approved Mayaodongphuc logo PNG onto a photo."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


CORNERS = {"top-left", "top-right", "bottom-left", "bottom-right"}


def resized(asset: Image.Image, target_width: int) -> Image.Image:
    width, height = asset.size
    target_height = round(height * target_width / width)
    return asset.resize((target_width, target_height), Image.Resampling.LANCZOS)


def corner_xy(
    corner: str,
    canvas: tuple[int, int],
    item: tuple[int, int],
    margin: int,
) -> tuple[int, int]:
    canvas_w, canvas_h = canvas
    item_w, item_h = item
    x = margin if corner.endswith("left") else canvas_w - margin - item_w
    y = margin if corner.startswith("top") else canvas_h - margin - item_h
    return x, y


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--logo-asset", required=True, type=Path)
    parser.add_argument("--logo-corner", choices=sorted(CORNERS), default="bottom-right")
    parser.add_argument("--logo-width", type=float, default=0.12)
    parser.add_argument("--margin", type=float, default=0.03)
    args = parser.parse_args()

    for name, value in {
        "logo-width": args.logo_width,
        "margin": args.margin,
    }.items():
        if not 0 < value < 1:
            parser.error(f"--{name} must be between 0 and 1")

    base = Image.open(args.input).convert("RGBA")
    logo = Image.open(args.logo_asset).convert("RGBA")
    canvas_w, canvas_h = base.size
    margin = round(min(canvas_w, canvas_h) * args.margin)
    logo_scaled = resized(logo, round(canvas_w * args.logo_width))
    logo_xy = corner_xy(args.logo_corner, base.size, logo_scaled.size, margin)
    base.alpha_composite(logo_scaled, logo_xy)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(args.output, quality=95)
    print(f"WROTE {args.output} {canvas_w}x{canvas_h}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
