#!/usr/bin/env python3
"""Composite deterministic copy onto a catalog-reference football sales base."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

try:
    from PIL import Image, ImageColor, ImageDraw, ImageFont, ImageOps
except ImportError as error:
    raise SystemExit("Pillow is required") from error


SKU_RE = re.compile(r"^X24-BD-[0-9]{6}$")
FONT_CANDIDATES = {
    "bold": [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ],
    "regular": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ],
}
COLLARS = [
    ("crew", "Cổ tròn", 0.49),
    ("v-neck", "Cổ V", 0.67),
    ("polo", "Cổ polo", 0.85),
]


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    key = "bold" if bold else "regular"
    for candidate in FONT_CANDIDATES[key]:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def fit_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    start_size: int,
    max_width: int,
    *,
    bold: bool,
) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    minimum = max(14, start_size // 2)
    for candidate_size in range(start_size, minimum - 1, -1):
        candidate = get_font(candidate_size, bold=bold)
        bounds = draw.textbbox((0, 0), text, font=candidate)
        if bounds[2] - bounds[0] <= max_width:
            return candidate
    return get_font(minimum, bold=bold)


def centered_text(
    draw: ImageDraw.ImageDraw,
    center_x: int,
    y: int,
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill: tuple[int, ...],
) -> None:
    bounds = draw.textbbox((0, 0), text, font=font)
    width = bounds[2] - bounds[0]
    draw.text((center_x - width // 2, y), text, font=font, fill=fill)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--website", default="mayaobongda.vn")
    parser.add_argument("--hotline", default="0989 353 247")
    parser.add_argument("--selected-collar", choices=("crew", "v-neck", "polo"), default="v-neck")
    parser.add_argument("--sizes", nargs="+", default=["S", "M", "L", "XL", "2XL", "3XL", "4XL"])
    parser.add_argument("--accent", default="#6C38FF")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.input.expanduser().resolve()
    output = args.output.expanduser().resolve()
    if not source.is_file():
        raise SystemExit(f"Input not found: {source}")
    if output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output}")
    if output.suffix.lower() != ".webp":
        raise SystemExit("Output must be .webp")
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-NNNNNN")
    if not 3 <= len(args.sizes) <= 8:
        raise SystemExit("--sizes requires between 3 and 8 labels")

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGBA")
    if image.width != image.height or image.width < 1200:
        raise SystemExit("Input must be square and at least 1200 px")

    size = image.width
    accent = ImageColor.getrgb(args.accent)
    ink = (23, 19, 55, 255)
    muted = (64, 57, 94, 255)
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Header area reserved by the catalog-base prompt.
    header = (round(size * 0.39), round(size * 0.014), round(size * 0.97), round(size * 0.094))
    draw.rounded_rectangle(header, radius=round(size * 0.014), fill=(250, 250, 255, 224))
    draw.rectangle((header[0], header[1], header[0] + round(size * 0.009), header[3]), fill=(*accent, 255))
    title_font = fit_font(draw, args.title, round(size * 0.036), round(size * 0.52), bold=True)
    sku_font = get_font(round(size * 0.016), bold=False)
    draw.text((header[0] + round(size * 0.024), round(size * 0.025)), args.title, font=title_font, fill=ink)
    draw.text(
        (header[0] + round(size * 0.024), round(size * 0.066)),
        f"MÃ MẪU: {args.sku}",
        font=sku_font,
        fill=(*accent, 255),
    )

    # Collar section. The generated base supplies three blank thumbnail cards.
    heading_font = get_font(round(size * 0.017), bold=True)
    centered_text(draw, round(size * 0.67), round(size * 0.615), "TÙY CHỌN CỔ ÁO", heading_font, ink)
    collar_font = get_font(round(size * 0.014), bold=False)
    selected_font = get_font(round(size * 0.014), bold=True)
    for key, label, center in COLLARS:
        is_selected = key == args.selected_collar
        label_font = selected_font if is_selected else collar_font
        label_fill = (*accent, 255) if is_selected else muted
        centered_text(draw, round(size * center), round(size * 0.763), label, label_font, label_fill)
        if is_selected:
            cx = round(size * center)
            cy = round(size * 0.788)
            radius = round(size * 0.014)
            draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=(*accent, 255))
            draw.line(
                [
                    (cx - round(size * 0.006), cy),
                    (cx - round(size * 0.001), cy + round(size * 0.005)),
                    (cx + round(size * 0.007), cy - round(size * 0.006)),
                ],
                fill=(255, 255, 255, 255),
                width=max(2, round(size * 0.0025)),
                joint="curve",
            )

    # Size row is drawn deterministically over the reserved blank control zone.
    size_heading_font = get_font(round(size * 0.015), bold=True)
    draw.text((round(size * 0.39), round(size * 0.792)), "SIZE", font=size_heading_font, fill=ink)
    row_left = round(size * 0.40)
    row_right = round(size * 0.96)
    gap = round(size * 0.007)
    button_width = (row_right - row_left - gap * (len(args.sizes) - 1)) // len(args.sizes)
    button_top = round(size * 0.815)
    button_bottom = round(size * 0.872)
    button_font = get_font(round(size * 0.016), bold=True)
    for index, label in enumerate(args.sizes):
        left = row_left + index * (button_width + gap)
        right = left + button_width
        draw.rounded_rectangle(
            (left, button_top, right, button_bottom),
            radius=round(size * 0.010),
            fill=(250, 250, 255, 226),
            outline=(*accent, 150),
            width=max(1, round(size * 0.0015)),
        )
        centered_text(
            draw,
            (left + right) // 2,
            button_top + round(size * 0.014),
            label,
            button_font,
            ink,
        )

    # Footer contact panel.
    footer = (round(size * 0.39), round(size * 0.895), round(size * 0.97), round(size * 0.972))
    draw.rounded_rectangle(footer, radius=round(size * 0.014), fill=(250, 250, 255, 230), outline=(*accent, 110))
    website_font = get_font(round(size * 0.019), bold=True)
    contact_font = get_font(round(size * 0.017), bold=False)
    draw.text((round(size * 0.415), round(size * 0.915)), args.website, font=website_font, fill=ink)
    hotline_text = f"HOTLINE: {args.hotline}"
    hotline_font = fit_font(draw, hotline_text, round(size * 0.017), round(size * 0.29), bold=False)
    draw.text((round(size * 0.685), round(size * 0.917)), hotline_text, font=hotline_font, fill=ink)

    final = Image.alpha_composite(image, overlay).convert("RGB")
    output.parent.mkdir(parents=True, exist_ok=True)
    final.save(output, format="WEBP", quality=100, method=6)
    print(output)


if __name__ == "__main__":
    main()
