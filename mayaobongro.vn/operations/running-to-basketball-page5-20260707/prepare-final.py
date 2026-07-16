#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
LOGO_PATH = ROOT.parents[1] / "image-references" / "logo.png"
CONTACT_TEXT = "mayaobongro.vn | Hotline/Zalo: 0989.353.247"


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def trim_logo(logo: Image.Image) -> Image.Image:
    rgba = logo.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if red > 244 and green > 244 and blue > 244:
                pixels[x, y] = (red, green, blue, 0)
                continue
            if alpha > 0:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if min_x > max_x or min_y > max_y:
        return rgba
    pad = 12
    return rgba.crop((
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(width, max_x + pad + 1),
        min(height, max_y + pad + 1),
    ))


def stamp(source_path: Path, output_path: Path) -> None:
    base = Image.open(source_path).convert("RGBA").resize((1000, 1000), Image.Resampling.LANCZOS)
    logo = trim_logo(Image.open(LOGO_PATH))
    target_width = round(base.width * 0.20)
    target_height = round(logo.height * (target_width / logo.width))
    logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    alpha = logo.getchannel("A").point(lambda value: int(value * 0.88))
    logo.putalpha(alpha)
    margin = round(base.width * 0.035)
    base.alpha_composite(logo, (margin, margin))

    draw = ImageDraw.Draw(base, "RGBA")
    font = load_font(round(base.width * 0.028), bold=True)
    bbox = draw.textbbox((0, 0), CONTACT_TEXT, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    pad_x = round(base.width * 0.024)
    pad_y = round(base.height * 0.010)
    pill_width = text_width + pad_x * 2
    pill_height = text_height + pad_y * 2
    pill_x = round((base.width - pill_width) / 2)
    pill_y = base.height - pill_height - round(base.height * 0.026)
    radius = round(pill_height * 0.28)
    draw.rounded_rectangle(
        (pill_x, pill_y, pill_x + pill_width, pill_y + pill_height),
        radius=radius,
        fill=(42, 45, 49, 145),
        outline=(245, 245, 245, 210),
        width=max(2, round(base.width * 0.002)),
    )
    text_x = pill_x + pad_x
    text_y = pill_y + round((pill_height - text_height) / 2) - 2
    draw.text((text_x + 2, text_y + 2), CONTACT_TEXT, font=font, fill=(0, 0, 0, 150))
    draw.text((text_x, text_y), CONTACT_TEXT, font=font, fill=(255, 255, 255, 245))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(output_path, "WEBP", quality=86, method=6)


def make_contact_sheet(jobs: list[dict]) -> None:
    thumb_w, thumb_h = 260, 260
    label_h = 54
    cols = 4
    rows = (len(jobs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), "#f3f4f6")
    draw = ImageDraw.Draw(sheet)
    font = load_font(15, bold=True)
    small = load_font(12)
    for index, job in enumerate(jobs):
        final_path = ROOT / job["final"]
        im = Image.open(final_path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = (index % cols) * thumb_w
        y = (index // cols) * (thumb_h + label_h)
        sheet.paste(im, (x, y))
        label = f"{job['product_code']} {job['audience']}"
        gender = f"{job['model_composition']} → {job['expected_gender_lead']}"
        draw.rectangle((x, y + thumb_h, x + thumb_w, y + thumb_h + label_h), fill="#111827")
        draw.text((x + 8, y + thumb_h + 7), label, font=font, fill="#ffffff")
        draw.text((x + 8, y + thumb_h + 30), gender, font=small, fill="#d1d5db")
    page_label = "page5" if "page5" in ROOT.name else ROOT.name
    out = ROOT / "verification" / f"contact-sheet-{page_label}.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, "JPEG", quality=90)


def main() -> None:
    jobs = json.loads((ROOT / "jobs.json").read_text(encoding="utf-8"))
    summary = []
    for job in jobs:
        source_path = ROOT / job["generated"]
        output_path = ROOT / job["final"]
        stamp(source_path, output_path)
        summary.append({
            "id": job["id"],
            "product_code": job["product_code"],
            "audience": job["audience"],
            "model_composition": job["model_composition"],
            "expected_gender_lead": job["expected_gender_lead"],
            "final": job["final"],
            "bytes": output_path.stat().st_size,
        })
    (ROOT / "final-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    make_contact_sheet(jobs)
    page_label = "page5" if "page5" in ROOT.name else ROOT.name
    print(json.dumps({
        "final_images": len(summary),
        "female_led_expected": sum(1 for item in summary if item["expected_gender_lead"] == "female"),
        "contact_sheet": f"verification/contact-sheet-{page_label}.jpg",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
