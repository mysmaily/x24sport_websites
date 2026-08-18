#!/usr/bin/env python3
"""Apply a designer-style Mayaodongphuc info panel to one outdoor image."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ORANGE = (242, 126, 36, 255)
WHITE = (255, 255, 255, 255)
MUTED = (235, 242, 236, 225)
DEEP_GREEN = (18, 45, 32, 172)
PANEL_STROKE = (255, 255, 255, 58)


def font_candidates(bold: bool) -> list[Path]:
    return [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/System/Library/Fonts/Supplemental/Helvetica Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Helvetica.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]


def load_font(size: int, bold: bool, preferred: Path | None = None) -> ImageFont.FreeTypeFont:
    candidates = ([preferred] if preferred else []) + font_candidates(bold)
    for candidate in candidates:
        if candidate and candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    raise SystemExit("No usable TrueType font found")


def scale(asset: Image.Image, target_width: int) -> Image.Image:
    target_height = round(asset.height * target_width / asset.width)
    return asset.resize((target_width, target_height), Image.Resampling.LANCZOS)


def rounded_blur_panel(
    base: Image.Image,
    overlay: Image.Image,
    box: tuple[int, int, int, int],
    radius: int,
) -> None:
    x0, y0, x1, y1 = box
    panel_w, panel_h = x1 - x0, y1 - y0

    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_mask = Image.new("L", (panel_w, panel_h), 0)
    ImageDraw.Draw(shadow_mask).rounded_rectangle((0, 0, panel_w, panel_h), radius=radius, fill=150)
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(max(10, radius // 2)))
    shadow.paste(Image.new("RGBA", (panel_w, panel_h), (0, 0, 0, 100)), (x0 + 8, y0 + 14), shadow_mask)
    overlay.alpha_composite(shadow)

    blurred = base.crop(box).filter(ImageFilter.GaussianBlur(16)).convert("RGBA")
    tint = Image.new("RGBA", (panel_w, panel_h), DEEP_GREEN)
    blurred = Image.alpha_composite(blurred, tint)

    mask = Image.new("L", (panel_w, panel_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, panel_w, panel_h), radius=radius, fill=230)
    overlay.paste(blurred, (x0, y0), mask)

    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle(box, radius=radius, outline=PANEL_STROKE, width=1)
    for step in range(8):
        alpha = 90 - step * 9
        draw.line((x0 + 1 + step, y0 + radius, x0 + 1 + step, y1 - radius), fill=(242, 126, 36, alpha), width=1)


def draw_icon(draw: ImageDraw.ImageDraw, kind: str, box: tuple[int, int, int, int], width: int) -> None:
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    pad = max(3, (x1 - x0) // 5)
    if kind == "fabric":
        for offset in (-1, 0, 1):
            y = cy + offset * max(4, (y1 - y0) // 6)
            draw.line([(x0 + pad, y), (cx - pad, y - pad), (cx + pad, y + pad), (x1 - pad, y)], fill=ORANGE, width=width, joint="curve")
    elif kind == "stretch":
        draw.line((x0 + pad, y1 - pad, x1 - pad, y0 + pad), fill=ORANGE, width=width)
        draw.line((x0 + pad, y1 - pad, x0 + pad * 3, y1 - pad), fill=ORANGE, width=width)
        draw.line((x1 - pad * 3, y0 + pad, x1 - pad, y0 + pad * 3), fill=ORANGE, width=width)
    elif kind == "fit":
        points = [(cx, y0 + pad), (x1 - pad, y0 + pad * 2), (x1 - pad * 2, y1 - pad), (cx, y1 - pad // 2), (x0 + pad * 2, y1 - pad), (x0 + pad, y0 + pad * 2), (cx, y0 + pad)]
        draw.line(points, fill=ORANGE, width=width, joint="curve")
        draw.line((cx - pad * 2, cy, cx - pad // 2, cy + pad * 2, cx + pad * 3, cy - pad * 2), fill=ORANGE, width=width, joint="curve")
    else:
        draw.rounded_rectangle((x0 + pad, cy - pad, x1 - pad, y1 - pad), radius=pad, outline=ORANGE, width=width)
        draw.rectangle((x0 + pad * 2, y0 + pad, x1 - pad * 2, cy), outline=ORANGE, width=width)
        draw.line((x0 + pad * 3, y1 - pad * 2, x1 - pad * 3, y1 - pad * 2), fill=ORANGE, width=width)


def draw_text_pair(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    title: str,
    detail: str,
    title_font: ImageFont.FreeTypeFont,
    detail_font: ImageFont.FreeTypeFont,
) -> None:
    draw.text((x, y), title, font=title_font, fill=WHITE)
    title_box = draw.textbbox((x, y), title, font=title_font)
    draw.text((x, title_box[3] + 5), detail, font=detail_font, fill=MUTED)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--logo-asset", required=True, type=Path)
    parser.add_argument("--font", type=Path)
    parser.add_argument("--font-bold", type=Path)
    parser.add_argument("--skip-hotline", action="store_true")
    parser.add_argument("--hotline", default="0989 353 247")
    args = parser.parse_args()

    if args.hotline != "0989 353 247":
        parser.error("--hotline must be exactly '0989 353 247'")

    base = Image.open(args.input).convert("RGBA")
    canvas_w, canvas_h = base.size
    unit = min(canvas_w, canvas_h)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    panel_x = round(unit * 0.028)
    panel_y = round(unit * 0.128)
    panel_w = round(unit * 0.292)
    panel_h = round(unit * (0.365 if args.skip_hotline else 0.42))
    panel_box = (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h)
    rounded_blur_panel(base, overlay, panel_box, round(unit * 0.028))

    title_font = load_font(round(unit * 0.020), True, args.font_bold)
    detail_font = load_font(round(unit * 0.0148), False, args.font)
    eyebrow_font = load_font(round(unit * 0.0105), True, args.font_bold)
    phone_font = load_font(round(unit * 0.014), True, args.font_bold)

    content_x = panel_x + round(unit * 0.026)
    top_y = panel_y + round(unit * 0.030)
    draw.text((content_x, top_y), "THÔNG TIN SẢN PHẨM", font=eyebrow_font, fill=(255, 255, 255, 150))
    draw.line((content_x, top_y + round(unit * 0.030), panel_x + panel_w - round(unit * 0.026), top_y + round(unit * 0.030)), fill=(255, 255, 255, 50), width=1)

    features = [
        ("fabric", "Vải thoáng mát", "Mềm nhẹ, dễ vận động"),
        ("stretch", "Co giãn tốt", "Thoải mái khi hoạt động"),
        ("fit", "Form đồng bộ", "Gọn gàng cho đội nhóm"),
        ("print", "Hình in sắc nét", "Màu in rõ, nổi bật"),
    ]
    row_y = top_y + round(unit * 0.056)
    row_gap = round(unit * 0.067)
    icon_box_size = round(unit * 0.037)
    for index, (kind, title, detail) in enumerate(features):
        y = row_y + index * row_gap
        icon_box = (content_x, y, content_x + icon_box_size, y + icon_box_size)
        draw.ellipse(icon_box, fill=(242, 126, 36, 38), outline=(242, 126, 36, 145), width=1)
        inner = round(unit * 0.006)
        draw_icon(
            draw,
            kind,
            (icon_box[0] + inner, icon_box[1] + inner, icon_box[2] - inner, icon_box[3] - inner),
            max(2, round(unit * 0.0022)),
        )
        draw_text_pair(draw, content_x + icon_box_size + round(unit * 0.014), y - round(unit * 0.003), title, detail, title_font, detail_font)

    if not args.skip_hotline:
        pill_h = round(unit * 0.042)
        pill_y = panel_y + panel_h - round(unit * 0.030) - pill_h
        pill_x = content_x
        pill_w = panel_w - round(unit * 0.052)
        draw.rounded_rectangle((pill_x, pill_y, pill_x + pill_w, pill_y + pill_h), radius=pill_h // 2, fill=(242, 126, 36, 210))
        draw.text((pill_x + round(unit * 0.022), pill_y + round(unit * 0.010)), args.hotline, font=phone_font, fill=WHITE)

    logo = Image.open(args.logo_asset).convert("RGBA")
    logo_scaled = scale(logo, round(unit * 0.125))
    logo_x = canvas_w - round(unit * 0.024) - logo_scaled.width
    logo_y = round(unit * 0.018)
    logo_shadow = Image.new("RGBA", logo_scaled.size, (0, 0, 0, 0))
    logo_shadow.alpha_composite(logo_scaled)
    logo_shadow = logo_shadow.filter(ImageFilter.GaussianBlur(8))
    overlay.paste(Image.new("RGBA", logo_scaled.size, (0, 0, 0, 60)), (logo_x + 4, logo_y + 6), logo_shadow.split()[-1])
    overlay.alpha_composite(logo_scaled, (logo_x, logo_y))

    result = Image.alpha_composite(base, overlay).convert("RGB")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.output, quality=95)
    print(f"WROTE {args.output} {canvas_w}x{canvas_h} designer-panel skip_hotline={args.skip_hotline}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
