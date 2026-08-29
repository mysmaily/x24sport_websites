#!/usr/bin/env python3
"""Composite deterministic copy onto a catalog-reference football sales base."""

from __future__ import annotations

import argparse
import hashlib
import json
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
    ("crew", "Cổ tròn", 0.54),
    ("v-neck", "Cổ V", 0.72),
    ("polo", "Cổ polo", 0.90),
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
    *,
    stroke_width: int = 0,
    stroke_fill: tuple[int, ...] | None = None,
) -> None:
    bounds = draw.textbbox((0, 0), text, font=font)
    width = bounds[2] - bounds[0]
    draw.text(
        (center_x - width // 2, y),
        text,
        font=font,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--website", default="mayaobongda.vn")
    parser.add_argument("--hotline", default="0989 353 247")
    parser.add_argument("--collection", default="BỘ SƯU TẬP BÓNG ĐÁ 2026")
    parser.add_argument("--price", default="GIÁ TỪ 125.000Đ")
    parser.add_argument("--offer", default="IN TÊN + SỐ MIỄN PHÍ")
    parser.add_argument(
        "--material-line",
        default="VẢI MÈ THỂ THAO • THOÁNG MÁT • IN CHUYỂN NHIỆT",
    )
    parser.add_argument("--cta", default="XEM THÊM SẢN PHẨM")
    parser.add_argument("--model-number", default="24")
    parser.add_argument("--front-number", default="24")
    parser.add_argument("--player-name", default="TÊN CẦU THỦ")
    parser.add_argument("--player-number", default="24")
    parser.add_argument("--team-name", default="TÊN ĐỘI BÓNG")
    parser.add_argument("--proof", type=Path)
    parser.add_argument("--selected-collar", choices=("crew", "v-neck", "polo"), default="v-neck")
    parser.add_argument("--sizes", nargs="+", default=["S", "M", "L", "XL", "2XL", "3XL", "4XL"])
    parser.add_argument("--accent", default="#6C38FF")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.input.expanduser().resolve()
    output = args.output.expanduser().resolve()
    proof = args.proof.expanduser().resolve() if args.proof else output.with_name(f"{output.stem}-copy.json")
    if not source.is_file():
        raise SystemExit(f"Input not found: {source}")
    if output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output}")
    if proof.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {proof}")
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
    header = (round(size * 0.39), round(size * 0.014), round(size * 0.97), round(size * 0.089))
    draw.rounded_rectangle(header, radius=round(size * 0.014), fill=(250, 250, 255, 224))
    draw.rectangle((header[0], header[1], header[0] + round(size * 0.009), header[3]), fill=(*accent, 255))
    header_left = header[0] + round(size * 0.024)
    collection_font = fit_font(draw, args.collection, round(size * 0.012), round(size * 0.50), bold=True)
    title_font = fit_font(draw, args.title, round(size * 0.027), round(size * 0.52), bold=True)
    sku_font = fit_font(draw, f"MÃ MẪU: {args.sku}", round(size * 0.014), round(size * 0.20), bold=False)
    draw.text((header_left, round(size * 0.021)), args.collection, font=collection_font, fill=(*accent, 255))
    draw.text((header_left, round(size * 0.038)), args.title, font=title_font, fill=ink)
    draw.text(
        (header_left, round(size * 0.068)),
        f"MÃ MẪU: {args.sku}",
        font=sku_font,
        fill=muted,
    )

    # Price and offer are required sales information, not optional decoration.
    price_box = (round(size * 0.605), round(size * 0.065), round(size * 0.770), round(size * 0.085))
    offer_box = (round(size * 0.780), round(size * 0.065), round(size * 0.955), round(size * 0.085))
    draw.rounded_rectangle(price_box, radius=round(size * 0.009), fill=(*accent, 255))
    draw.rounded_rectangle(offer_box, radius=round(size * 0.009), fill=(255, 241, 202, 255))
    price_font = fit_font(draw, args.price, round(size * 0.0115), price_box[2] - price_box[0] - round(size * 0.016), bold=True)
    offer_font = fit_font(draw, args.offer, round(size * 0.0105), offer_box[2] - offer_box[0] - round(size * 0.014), bold=True)
    centered_text(draw, (price_box[0] + price_box[2]) // 2, round(size * 0.068), args.price, price_font, (255, 255, 255, 255))
    centered_text(draw, (offer_box[0] + offer_box[2]) // 2, round(size * 0.069), args.offer, offer_font, ink)

    # Personalization sample belongs only to the sales derivative. The front
    # and back print masters remain free of player names and numbers.
    garment_white = (248, 250, 255, 255)
    garment_stroke = (7, 30, 61, 210)
    model_number_font = get_font(round(size * 0.032), bold=True)
    centered_text(
        draw,
        round(size * 0.205),
        round(size * 0.270),
        args.model_number,
        model_number_font,
        garment_white,
        stroke_width=max(1, round(size * 0.0012)),
        stroke_fill=garment_stroke,
    )
    front_number_font = get_font(round(size * 0.032), bold=True)
    centered_text(
        draw,
        round(size * 0.535),
        round(size * 0.188),
        args.front_number,
        front_number_font,
        garment_white,
        stroke_width=max(1, round(size * 0.0012)),
        stroke_fill=garment_stroke,
    )
    player_name_font = fit_font(draw, args.player_name, round(size * 0.015), round(size * 0.19), bold=True)
    centered_text(
        draw,
        round(size * 0.825),
        round(size * 0.190),
        args.player_name,
        player_name_font,
        garment_white,
        stroke_width=max(1, round(size * 0.001)),
        stroke_fill=garment_stroke,
    )
    player_number_font = get_font(round(size * 0.070), bold=True)
    centered_text(
        draw,
        round(size * 0.825),
        round(size * 0.225),
        args.player_number,
        player_number_font,
        garment_white,
        stroke_width=max(1, round(size * 0.0015)),
        stroke_fill=garment_stroke,
    )
    team_name_font = fit_font(draw, args.team_name, round(size * 0.014), round(size * 0.19), bold=True)
    centered_text(
        draw,
        round(size * 0.825),
        round(size * 0.345),
        args.team_name,
        team_name_font,
        garment_white,
        stroke_width=max(1, round(size * 0.001)),
        stroke_fill=garment_stroke,
    )

    # Collar section. The generated base supplies three blank thumbnail cards.
    heading_font = get_font(round(size * 0.017), bold=True)
    heading_panel = (round(size * 0.625), round(size * 0.604), round(size * 0.815), round(size * 0.629))
    draw.rounded_rectangle(
        heading_panel,
        radius=round(size * 0.009),
        fill=(250, 250, 255, 235),
        outline=(*accent, 120),
    )
    centered_text(draw, round(size * 0.72), round(size * 0.608), "TÙY CHỌN CỔ ÁO", heading_font, ink)
    collar_font = get_font(round(size * 0.014), bold=False)
    selected_font = get_font(round(size * 0.014), bold=True)
    for key, label, center in COLLARS:
        is_selected = key == args.selected_collar
        label_font = selected_font if is_selected else collar_font
        label_fill = (*accent, 255) if is_selected else muted
        label_panel = (
            round(size * (center - 0.072)),
            round(size * 0.724),
            round(size * (center + 0.072)),
            round(size * 0.758),
        )
        draw.rounded_rectangle(label_panel, radius=round(size * 0.006), fill=(250, 250, 255, 222))
        centered_text(draw, round(size * center), round(size * 0.731), label, label_font, label_fill)
        if is_selected:
            cx = round(size * center)
            cy = round(size * 0.771)
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
    size_label = (round(size * 0.39), round(size * 0.780), round(size * 0.46), round(size * 0.806))
    draw.rounded_rectangle(size_label, radius=round(size * 0.008), fill=(250, 250, 255, 235))
    centered_text(draw, round(size * 0.425), round(size * 0.785), "SIZE", size_heading_font, ink)
    row_left = round(size * 0.40)
    row_right = round(size * 0.96)
    gap = round(size * 0.007)
    button_width = (row_right - row_left - gap * (len(args.sizes) - 1)) // len(args.sizes)
    button_top = round(size * 0.807)
    button_bottom = round(size * 0.855)
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

    # CTA and footer contact panel.
    cta = (round(size * 0.51), round(size * 0.870), round(size * 0.85), round(size * 0.904))
    draw.rounded_rectangle(cta, radius=round(size * 0.012), fill=(*accent, 255))
    cta_font = fit_font(draw, args.cta, round(size * 0.017), cta[2] - cta[0] - round(size * 0.025), bold=True)
    centered_text(draw, (cta[0] + cta[2]) // 2, round(size * 0.877), args.cta, cta_font, (255, 255, 255, 255))

    footer = (round(size * 0.39), round(size * 0.912), round(size * 0.97), round(size * 0.985))
    draw.rounded_rectangle(footer, radius=round(size * 0.014), fill=(250, 250, 255, 230), outline=(*accent, 110))
    material_font = fit_font(draw, args.material_line, round(size * 0.012), round(size * 0.52), bold=True)
    centered_text(draw, round(size * 0.68), round(size * 0.920), args.material_line, material_font, muted)
    website_font = get_font(round(size * 0.017), bold=True)
    draw.text((round(size * 0.415), round(size * 0.952)), args.website, font=website_font, fill=ink)
    hotline_text = f"HOTLINE: {args.hotline}"
    hotline_font = fit_font(draw, hotline_text, round(size * 0.016), round(size * 0.29), bold=False)
    draw.text((round(size * 0.685), round(size * 0.953)), hotline_text, font=hotline_font, fill=ink)

    final = Image.alpha_composite(image, overlay).convert("RGB")
    output.parent.mkdir(parents=True, exist_ok=True)
    final.save(output, format="WEBP", quality=100, method=6)
    proof.parent.mkdir(parents=True, exist_ok=True)
    proof.write_text(
        json.dumps(
            {
                "schemaVersion": "1.0",
                "layout": "catalog-reference",
                "sku": args.sku,
                "salesImage": str(output),
                "salesImageSha256": checksum(output),
                "renderedText": {
                    "collection": args.collection,
                    "title": args.title,
                    "skuLabel": f"MÃ MẪU: {args.sku}",
                    "price": args.price,
                    "offer": args.offer,
                    "modelNumber": args.model_number,
                    "frontNumber": args.front_number,
                    "playerName": args.player_name,
                    "playerNumber": args.player_number,
                    "teamName": args.team_name,
                    "collarHeading": "TÙY CHỌN CỔ ÁO",
                    "collarLabels": [label for _, label, _ in COLLARS],
                    "sizes": args.sizes,
                    "materialLine": args.material_line,
                    "cta": args.cta,
                    "website": args.website,
                    "hotline": f"HOTLINE: {args.hotline}",
                },
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(output)
    print(proof)


if __name__ == "__main__":
    main()
