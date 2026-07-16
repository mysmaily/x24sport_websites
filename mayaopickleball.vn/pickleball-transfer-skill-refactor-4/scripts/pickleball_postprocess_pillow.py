#!/usr/bin/env python3
"""Pillow fallback for deterministic pickleball product image branding."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
LOGO_PNG = ROOT / "image-references" / "logo.png"
CONTACT_TEXT = "mayaopickleball.vn | Hotline/Zalo: 0989.353.247"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if path and Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def rounded_layer(size: tuple[int, int], radius: int, fill: tuple[int, int, int, int], outline: tuple[int, int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=fill, outline=outline, width=2)
    return layer


def circular_layer(diameter: int, fill: tuple[int, int, int, int], outline: tuple[int, int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse((1, 1, diameter - 2, diameter - 2), fill=fill, outline=outline, width=2)
    return layer


def make_badge() -> Image.Image:
    if not LOGO_PNG.exists():
        raise FileNotFoundError(f"official logo missing: {LOGO_PNG}")
    badge = circular_layer(184, (255, 255, 255, 108), (255, 255, 255, 218))
    logo = Image.open(LOGO_PNG).convert("RGBA")
    alpha_box = logo.getchannel("A").getbbox()
    if alpha_box:
        logo = logo.crop(alpha_box)
    logo.thumbnail((170, 132), Image.Resampling.LANCZOS)
    alpha = logo.getchannel("A").point(lambda px: int(px * 0.94))
    logo.putalpha(alpha)
    badge.alpha_composite(logo, ((badge.width - logo.width) // 2, (badge.height - logo.height) // 2))
    return badge


def make_dots() -> Image.Image:
    dots = Image.new("RGBA", (64, 520), (0, 0, 0, 0))
    draw = ImageDraw.Draw(dots)
    chips = [
        ((255, 255, 255, 255), (85, 85, 85, 255)),
        ((0, 0, 0, 255), (255, 255, 255, 255)),
        ((255, 143, 189, 255), (255, 255, 255, 255)),
        ((229, 57, 53, 255), (255, 255, 255, 255)),
        ((255, 212, 59, 255), (119, 119, 119, 255)),
        ((30, 136, 229, 255), (255, 255, 255, 255)),
        ((67, 160, 71, 255), (255, 255, 255, 255)),
    ]
    for idx, (fill, outline) in enumerate(chips):
        y = 32 + idx * 64
        draw.ellipse((12, y - 20, 52, y + 20), fill=fill, outline=outline, width=2)
    draw.rounded_rectangle((12, 468, 52, 508), radius=14, fill=(255, 255, 255, 255), outline=(85, 85, 85, 255), width=2)
    plus_font = font(34, bold=True)
    draw.text((32, 487), "+", fill=(34, 34, 34, 255), font=plus_font, anchor="mm")
    return dots


def make_contact() -> Image.Image:
    contact = rounded_layer((760, 58), 29, (30, 30, 30, 138), (255, 255, 255, 210))
    draw = ImageDraw.Draw(contact)
    draw.text((contact.width // 2, contact.height // 2), CONTACT_TEXT, fill=(255, 255, 255, 255), font=font(28, bold=True), anchor="mm")
    return contact


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

    badge = make_badge()
    dots = make_dots()
    contact = make_contact()

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
    print("branding.logo_source=png")
    print("branding.contact_overlay_present=true")
    print("branding.color_dots_present=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
