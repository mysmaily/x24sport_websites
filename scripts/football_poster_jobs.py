#!/usr/bin/env python3
"""Build image-generation job specs for X24Sport football kit posters."""

from __future__ import annotations

import argparse
import html
import json
import random
import re
import sys
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LOGO_PAGE = "https://x24sport.vn/danh-muc/dich-vu/"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "tmp/imagegen/football-poster-jobs"

BACKGROUND_STYLES = [
    {
        "slug": "light-stadium-glow",
        "tone": "light",
        "prompt": "light poster background with clean white and pale silver gradients, soft stadium light haze, faint pitch-line geometry, and subtle cool glow",
    },
    {
        "slug": "light-speed-streaks",
        "tone": "light",
        "prompt": "light poster background with white/pale grey base, dynamic diagonal speed streaks, subtle motion lines, and restrained sport-energy accents",
    },
    {
        "slug": "light-editorial-sweep",
        "tone": "light",
        "prompt": "light editorial sports catalog background with pearl white gradient, broad sweeping curves, soft shadow depth, and clean premium negative space",
    },
    {
        "slug": "light-technical-grid",
        "tone": "light",
        "prompt": "light technical performance background with white and icy grey gradients, faint dot grid, fine diagonal mesh, and subtle field-marking lines",
    },
    {
        "slug": "light-color-burst",
        "tone": "light",
        "prompt": "light high-energy poster background with clean white base, controlled color burst accents sampled from the kit, soft flares, and airy catalog spacing",
    },
    {
        "slug": "light-studio-floor",
        "tone": "light",
        "prompt": "bright studio poster background with soft floor reflection, pale gradient wall, gentle vignette, and realistic product-catalog lighting",
    },
    {
        "slug": "dark-stadium-night",
        "tone": "dark",
        "prompt": "dark night-stadium poster background with deep navy and charcoal gradients, distant floodlights, subtle turf texture, and premium sports drama",
    },
    {
        "slug": "dark-neon-diagonal",
        "tone": "dark",
        "prompt": "dark poster background with charcoal/navy gradient, sharp diagonal neon light streaks, restrained glow, and modern football-drop energy",
    },
    {
        "slug": "dark-premium-studio",
        "tone": "dark",
        "prompt": "dark premium studio background with black-to-charcoal gradient, soft rim light, quiet fabric texture, and clean product-focused depth",
    },
    {
        "slug": "dark-tactical-grid",
        "tone": "dark",
        "prompt": "dark tactical sports background with deep navy base, faint formation/grid lines, subtle dot matrix, and disciplined catalog composition",
    },
    {
        "slug": "dark-smoke-spotlight",
        "tone": "dark",
        "prompt": "dark dramatic spotlight background with charcoal smoke haze, soft stadium beams, controlled vignette, and crisp product contrast",
    },
    {
        "slug": "dark-color-energy",
        "tone": "dark",
        "prompt": "dark high-energy background with black/navy base, controlled accent glows sampled from the kit colors, diagonal action streaks, and premium poster depth",
    },
]


def read_inputs(args: argparse.Namespace) -> list[str]:
    values: list[str] = []
    if args.input_file:
        values.extend(
            line.strip()
            for line in Path(args.input_file).read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.strip().startswith("#")
        )
    values.extend(args.images)
    if not values:
        raise SystemExit("No input images provided. Use --input-file or pass image paths/URLs.")
    return values


def is_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


def download(url: str, dest_dir: Path, fallback_stem: str) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
        suffix = ".jpg"
    safe_stem = re.sub(r"[^a-zA-Z0-9_.-]+", "-", Path(parsed.path).stem or fallback_stem)
    dest = dest_dir / f"{safe_stem}{suffix}"
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 X24Sport image workflow"})
    with urlopen(request, timeout=30) as response:
        dest.write_bytes(response.read())
    return dest


def normalize_image_url(raw: str) -> str | None:
    value = html.unescape(raw)
    value = unquote(value)
    match = re.search(r"https?://[^\"'<> )]+?\.(?:png|webp|jpe?g)", value, flags=re.I)
    if not match:
        return None
    return match.group(0)


def scrape_logo_candidates(category_url: str, pages: int) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for page in range(1, pages + 1):
        url = category_url if page == 1 else f"{category_url.rstrip('/')}/?page={page}"
        request = Request(url, headers={"User-Agent": "Mozilla/5.0 X24Sport image workflow"})
        try:
            with urlopen(request, timeout=30) as response:
                body = response.read().decode("utf-8", errors="ignore")
        except Exception as exc:  # pragma: no cover - surfaced in CLI output.
            print(f"warning: could not fetch {url}: {exc}", file=sys.stderr)
            continue

        for raw in re.findall(r"https?://[^\"'<> )]+?\.(?:png|webp|jpe?g)", body, flags=re.I):
            normalized = normalize_image_url(raw)
            if not normalized:
                continue
            if "Asset-1-1200x158" in normalized:
                continue
            if "/x24sport/wp-" not in normalized:
                continue
            if normalized not in seen:
                found.append(normalized)
                seen.add(normalized)
    return found


def choose_background(index: int, mode: str, rng: random.Random) -> str:
    if mode in {"dark", "light"}:
        return mode
    if mode == "alternate":
        return "dark" if index % 2 == 0 else "light"
    return rng.choice(["dark", "light"])


def background_pool(mode: str) -> list[dict[str, str]]:
    if mode in {"dark", "light"}:
        return [style for style in BACKGROUND_STYLES if style["tone"] == mode]
    return BACKGROUND_STYLES


def choose_background_style(index: int, mode: str, rng: random.Random) -> dict[str, str]:
    if mode == "alternate":
        tone = choose_background(index, mode, rng)
        pool = background_pool(tone)
        return pool[(index // 2) % len(pool)]
    pool = background_pool(mode)
    return rng.choice(pool)


def prompt_for_job(
    *,
    source_image: str,
    background_style: dict[str, str],
    chest_logo: Path,
    jersey_number: str,
) -> str:
    if background_style["tone"] == "dark":
        contrast = "Use bright high-contrast text."
    else:
        contrast = "Use dark high-contrast text."

    return f"""Use case: ads-marketing
Asset type: square e-commerce football kit poster generated from a product reference image
Input images:
- Source apparel image: {source_image}
- Random chest logo reference: {chest_logo}

Primary request: Convert the source apparel design into a premium X24Sport football kit poster. The source image may come from basketball, pickleball, badminton, running, or another sport; treat it as an apparel-design reference, not as a sport-context reference.
Sport conversion: preserve the shirt design accurately, but remove or convert non-football sport details. Basketball balls become football/soccer balls; basketball courts, hoops, paddles, rackets, nets, and sport-specific props become football pitch/stadium or neutral studio details. Do not keep basketball/pickleball/badminton props or symbols unless they are part of a small source logo being replaced by the random chest badge.
Poster layout: square 1:1 split layout. Left half shows one Vietnamese adult male football player wearing the converted kit, full body, confident catalog pose. Right half shows front jersey mockup, back jersey mockup, solid-color shorts mockup, collar options, size row, and footer.
Background style: {background_style["prompt"]}. {contrast}
Background composition: make the whole square feel like one cohesive poster, not two unrelated vertical halves. The left model area and right catalog area may have different contrast levels, but they should share the same gradient language, light direction, accent colors, and atmospheric depth.
Top title: show text exactly "Football 2026 Collection" centered at the top of the right half. No top logo or brand badge. Treat it as a custom sports-poster title lockup, not default typed text: use premium display lettering, confident tracking, subtle outline/shadow or metallic/ink texture when appropriate, and designer-level spacing. It should feel like football campaign typography, elegant and intentional, without dominating the product.
Kit design: preserve the source image's main color blocking and design DNA, adapted into a football jersey. Prioritize balanced shirt proportions, clean seams, symmetrical shoulders, natural sleeve length, and premium product mockup quality. On the worn model, make the jersey photorealistic with natural fabric wrinkles, fabric tension around chest/waist/shoulders, sleeve folds, hem shadows, contact shadows under arms, and realistic drape. Avoid flat AI-painted clothing. Keep a round-neck base on the main displayed kit unless a collar option swatch is shown.
Chest logo: use the random chest logo reference as the left-chest team badge inspiration. The right chest must always show jersey number "{jersey_number}".
Back jersey: show "TÊN CẦU THỦ" above a large number "{jersey_number}" and "TÊN ĐỘI BÓNG" below.
Shorts: Shorts are one solid color. No pattern, no gradient, no decorative print, no stripes, no contrast side panels, no contrast waistband, no contrast hem trim, no piping, no colored cuffs. Choose a single color that fits the source kit palette. The only allowed visual marks on the shorts are the number "{jersey_number}" and natural fabric wrinkles/shadows.
Collar options: include a polished strip titled exactly "TÙY CHỌN CỔ ÁO" with five cards: "Cổ tròn", "Cổ V viền", "Cổ V chéo", "Cổ V phối", "Cổ polo". Match the swatches to the current kit palette. Center the entire collar-options group horizontally inside the right panel.
Size row: show boxes exactly "S" "M" "L" "XL" "2XL" "3XL" "4XL". Center the entire size row horizontally inside the right panel, aligned to the same center axis as the collar-options group.
Footer: show "XEM THÊM SẢN PHẨM" and compact text "X24SPORT.VN | HOTLINE: 0989 353 247".
Constraints: male Vietnamese model only; no female model; no pickleball paddle; no source-site watermark/logo; no top logo; no X24 logo at the top; all text must be readable; product mockups must stay prominent and visually balanced; worn kit must have realistic fabric shadows and wrinkles.
Avoid: default office-document font, plain typed-looking headline, flat AI clothing, plastic-smooth jersey, patterned shorts, gradient shorts, contrast-trim shorts, striped shorts, missing chest/shorts number, missing random chest logo, Brazil branding, distorted Vietnamese text, oversized footer, watermark, top logo, unbalanced shirt mockups, warped jersey proportions."""


def build_jobs(args: argparse.Namespace) -> list[dict[str, object]]:
    rng = random.Random(args.seed)
    output_dir = Path(args.output_dir)
    source_dir = output_dir / "sources"
    chest_dir = output_dir / "chest-logos"

    source_inputs = read_inputs(args)
    logo_urls = scrape_logo_candidates(args.logo_source_url, args.logo_pages)
    if not logo_urls:
        raise SystemExit(f"No chest-logo candidates found at {args.logo_source_url}")

    jobs: list[dict[str, object]] = []
    for index, original in enumerate(source_inputs, start=1):
        source_path = download(original, source_dir, f"source-{index}") if is_url(original) else Path(original).expanduser().resolve()
        background_style = choose_background_style(index - 1, args.background, rng)
        chest_logo_url = rng.choice(logo_urls)
        chest_logo_path = download(chest_logo_url, chest_dir, f"chest-logo-{index}")
        prompt = prompt_for_job(
            source_image=str(source_path),
            background_style=background_style,
            chest_logo=chest_logo_path,
            jersey_number=args.number,
        )
        jobs.append(
            {
                "id": f"football-poster-{index:03d}",
                "source_input": original,
                "source_image": str(source_path),
                "background": background_style["tone"],
                "background_style": background_style["slug"],
                "background_prompt": background_style["prompt"],
                "chest_logo_source_url": chest_logo_url,
                "chest_logo": str(chest_logo_path),
                "jersey_number": args.number,
                "referenced_image_paths": [str(source_path), str(chest_logo_path)],
                "prompt": prompt,
            }
        )
    return jobs


def write_outputs(jobs: list[dict[str, object]], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = output_dir / "jobs.json"
    jsonl_path = output_dir / "jobs.jsonl"
    manifest_path.write_text(json.dumps({"jobs": jobs}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with jsonl_path.open("w", encoding="utf-8") as handle:
        for job in jobs:
            handle.write(json.dumps(job, ensure_ascii=False) + "\n")
    print(f"Wrote {len(jobs)} jobs")
    print(f"Manifest: {manifest_path}")
    print(f"JSONL: {jsonl_path}")


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("images", nargs="*", help="Input image paths or URLs.")
    parser.add_argument("--input-file", help="Text file with one image path or URL per line.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Directory for downloaded refs and job specs.")
    parser.add_argument("--background", choices=["auto", "alternate", "dark", "light"], default="auto", help="Choose from a varied poster background pool.")
    parser.add_argument("--seed", type=int, default=24, help="Seed for repeatable random choices.")
    parser.add_argument("--number", default="24", help="Jersey and shorts number.")
    parser.add_argument("--logo-source-url", default=DEFAULT_LOGO_PAGE, help="Category page used for random chest-logo references.")
    parser.add_argument("--logo-pages", type=int, default=3, help="How many category pages to scrape for chest-logo references.")
    return parser.parse_args(list(argv))


def main(argv: Iterable[str]) -> int:
    args = parse_args(argv)
    jobs = build_jobs(args)
    write_outputs(jobs, Path(args.output_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
