#!/usr/bin/env python3
"""Add deterministic sales text to an approved square football mockup."""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    from PIL import Image, ImageColor, ImageDraw, ImageFont, ImageOps
except ImportError as error:
    raise SystemExit("Pillow is required") from error


FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = FONT_CANDIDATES[::2] if bold else FONT_CANDIDATES[1::2]
    for candidate in candidates:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def fitting_font(draw: ImageDraw.ImageDraw, text: str, start_size: int, max_width: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate_size in range(start_size, max(14, start_size // 2) - 1, -1):
        candidate = font(candidate_size, bold=True)
        bounds = draw.textbbox((0, 0), text, font=candidate)
        if bounds[2] - bounds[0] <= max_width:
            return candidate
    return font(max(14, start_size // 2), bold=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--website", default="mayaobongda.vn")
    parser.add_argument("--hotline", default="0989 353 247")
    parser.add_argument("--accent", default="#0B4EA2")
    parser.add_argument("--title-position", choices=("top-left", "top-right"), default="top-right")
    parser.add_argument("--signature-position", choices=("bottom-left", "bottom-right"), default="bottom-right")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def anchored_box(position: str, canvas: int, width: int, height: int, margin: int) -> tuple[int, int, int, int]:
    x = margin if position.endswith("left") else canvas - margin - width
    y = margin if position.startswith("top") else canvas - margin - height
    return x, y, x + width, y + height


def main() -> None:
    args = parse_args()
    input_path = args.input.expanduser().resolve()
    output_path = args.output.expanduser().resolve()
    if not input_path.is_file():
        raise SystemExit(f"Input not found: {input_path}")
    if output_path.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output_path}")
    if output_path.suffix.lower() != ".webp":
        raise SystemExit("Output must be .webp")

    with Image.open(input_path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGBA")
    if image.width != image.height or image.width < 1200:
        raise SystemExit("Input must be square and at least 1200 px")

    size = image.width
    accent = ImageColor.getrgb(args.accent)
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    margin = round(size * 0.035)

    title_box = anchored_box(args.title_position, size, round(size * 0.43), round(size * 0.13), margin)
    draw.rounded_rectangle(title_box, radius=round(size * 0.018), fill=(255, 255, 255, 224))
    draw.rectangle((title_box[0], title_box[1], title_box[0] + round(size * 0.012), title_box[3]), fill=(*accent, 255))
    title_font = fitting_font(draw, args.title, round(size * 0.029), round(size * 0.38))
    sku_font = font(round(size * 0.016), bold=False)
    tx = title_box[0] + round(size * 0.027)
    draw.text((tx, title_box[1] + round(size * 0.022)), args.title, font=title_font, fill=(14, 28, 48, 255))
    draw.text((tx, title_box[1] + round(size * 0.075)), f"MÃ MẪU: {args.sku}", font=sku_font, fill=(*accent, 255))

    signature_box = anchored_box(args.signature_position, size, round(size * 0.36), round(size * 0.078), margin)
    draw.rounded_rectangle(signature_box, radius=round(size * 0.014), fill=(8, 22, 43, 220))
    main_font = font(round(size * 0.018), bold=True)
    sub_font = font(round(size * 0.014), bold=False)
    sx = signature_box[0] + round(size * 0.018)
    draw.text((sx, signature_box[1] + round(size * 0.013)), args.website, font=main_font, fill=(255, 255, 255, 255))
    draw.text((sx, signature_box[1] + round(size * 0.043)), f"HOTLINE: {args.hotline}", font=sub_font, fill=(221, 234, 250, 255))

    output = Image.alpha_composite(image, overlay).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path, format="WEBP", quality=100, method=6)
    print(output_path)


if __name__ == "__main__":
    main()
