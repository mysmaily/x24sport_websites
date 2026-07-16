#!/usr/bin/env python3
"""Pillow fallback for deterministic pickleball product image branding."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
LOGO_BADGE_PNG = ROOT / "image-references" / "logo-badge.png"
DOT_COLOR_PNG = ROOT / "image-references" / "dot-color.png"
CONTACT_PILL_PNG = ROOT / "image-references" / "contact-pill.png"


def load_asset(path: Path) -> Image.Image:
    if not path.exists():
        raise FileNotFoundError(f"overlay asset missing: {path}")
    return Image.open(path).convert("RGBA")


def fit_width(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * (width / image.width))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def fit_height(image: Image.Image, height: int) -> Image.Image:
    width = round(image.width * (height / image.height))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def fit_box(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(box, Image.Resampling.LANCZOS)
    return copy


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("side", nargs="?", default="right", choices=["left", "right"])
    args = parser.parse_args()

    source = Path(args.input)
    if not source.exists():
        print(f"Input not found: {source}", file=sys.stderr)
        return 1

    base = Image.open(source).convert("RGBA")
    scale = max(1200 / base.width, 1200 / base.height)
    resized = base.resize((round(base.width * scale), round(base.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - 1200) // 2
    top = (resized.height - 1200) // 2
    canvas = resized.crop((left, top, left + 1200, top + 1200))

    badge = fit_box(load_asset(LOGO_BADGE_PNG), (184, 184))
    dots = fit_height(load_asset(DOT_COLOR_PNG), 520)
    contact = fit_width(load_asset(CONTACT_PILL_PNG), 760)

    if args.side == "left":
        canvas.alpha_composite(dots, (28, (1200 - dots.height) // 2))
        canvas.alpha_composite(badge, (1200 - badge.width - 28, 28))
    else:
        canvas.alpha_composite(dots, (1200 - dots.width - 28, (1200 - dots.height) // 2))
        canvas.alpha_composite(badge, (28, 28))
    canvas.alpha_composite(contact, ((1200 - contact.width) // 2, 1200 - contact.height - 28))

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, "WEBP", quality=84, method=6)
    print(f"Wrote {output}")
    print("branding.logo_source=logo-badge.png")
    print("branding.overlay_assets=prebuilt_png")
    print("branding.contact_overlay_present=true")
    print("branding.color_dots_present=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
