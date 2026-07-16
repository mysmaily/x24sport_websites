#!/usr/bin/env python3
"""Run the V6 image-only migration batch with resume support."""
from __future__ import annotations

import argparse
import base64
import concurrent.futures
import fcntl
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = ROOT.parent
DEFAULT_WAVE = SITE_ROOT / "operations" / "transfer-running-image-to-pickleball-v6-batch-20260710"
CONVERTED_SOURCES = SITE_ROOT / "operations" / "transfer-running-image-to-pickleball-converted-sources.jsonl"
SOURCE_BASE = "https://mayaochaybo.vn"
DEST_BASE = "https://mayaopickleball.vn"
STATIC_CATEGORY_IDS = [95, 96, 71, 70]
STATIC_TAG_IDS = [97, 98, 99, 100, 101]
TERMINAL_STATUSES = {"verified", "skipped_duplicate", "visual_rejected"}
TRANSFER_SCHEMA = "transfer-running-image-to-pickleball-v6"
FORBIDDEN = [
    "chạy bộ",
    "runner",
    "running",
    "marathon",
    "race",
    "trail",
    "5k",
    "10k",
    "half marathon",
    "đường chạy",
    "giải chạy",
    "finisher",
    "mayaochaybo",
    "aochaybo",
    "omnia",
]


def run(cmd: list[str], cwd: Path | None = None, env: dict[str, str] | None = None, capture: bool = False) -> str:
    display: list[str] = []
    redact_next = False
    for part in cmd:
        value = str(part)
        if redact_next:
            display.append("***REDACTED***")
            redact_next = False
            continue
        if value in {"-u", "--user", "-H", "--header"}:
            display.append(value)
            if value in {"-u", "--user"}:
                redact_next = True
            continue
        if value.lower().startswith("authorization:"):
            display.append("Authorization: ***REDACTED***")
            continue
        display.append(value)
    print("+ " + " ".join(display), flush=True)
    result = subprocess.run(cmd, cwd=cwd, env=env, text=True, capture_output=capture, check=True)
    return result.stdout if capture else ""


def load_env(path: Path) -> dict[str, str]:
    env = os.environ.copy()
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env.setdefault(key.strip(), value.strip().strip("'\""))
    return env


def auth_header(user: str, password: str) -> str:
    return "Basic " + base64.b64encode(f"{user}:{password}".encode()).decode()


def request_json(url: str, method: str = "GET", payload: dict[str, Any] | None = None, auth: str | None = None) -> Any:
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method, headers={"User-Agent": "v6-run-all/1.0", "Accept": "application/json"})
    if auth:
        req.add_header("Authorization", auth)
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def request_bytes(url: str) -> tuple[int, str, bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": "v6-run-all/1.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.status, response.headers.get("content-type") or "", response.read()


def download_file(url: str, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    last_error: Exception | None = None
    for _ in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 image-only-transfer-v6"})
            with urllib.request.urlopen(request, timeout=60) as response:
                output.write_bytes(response.read())
            return
        except Exception as exc:  # network/CDN flakiness
            last_error = exc
            time.sleep(2)
    try:
        run(["curl", "-L", "--fail", "--retry", "5", "--retry-delay", "2", "--max-time", "90", "-A", "Mozilla/5.0 image-only-transfer-v6", "-o", str(output), url])
        return
    except Exception as exc:
        raise RuntimeError(f"failed to download {url}: {last_error}; curl fallback: {exc}") from exc


def manifest_records(wave_dir: Path) -> list[dict[str, Any]]:
    path = wave_dir / "manifest.jsonl"
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def source_signature(url: str | None) -> str | None:
    if not url:
        return None
    return hashlib.sha256(url.strip().encode("utf-8")).hexdigest()


def append_converted_source(record: dict[str, Any], wave_dir: Path) -> None:
    url = str(record.get("source_image_url") or "")
    signature = source_signature(url)
    entry = {
        "schema_version": "0.5-converted-source",
        "source_site": str(record.get("source_site") or SOURCE_BASE.replace("https://", "")),
        "source_product_key": record.get("source_product_key"),
        "source_product_id": record.get("source_product_id"),
        "source_product_slug": record.get("source_product_slug"),
        "source_product_url": record.get("source_product_url"),
        "source_image_url": url,
        "source_signature": signature,
        "destination_site": "mayaopickleball.vn",
        "destination_product_id": record.get("new_product_id"),
        "destination_product_url": record.get("product_url"),
        "destination_sku": record.get("product_code"),
        "wave_dir": str(wave_dir),
        "converted_at": utc_now(),
    }
    CONVERTED_SOURCES.parent.mkdir(parents=True, exist_ok=True)
    lock_path = CONVERTED_SOURCES.with_suffix(CONVERTED_SOURCES.suffix + ".lock")
    with lock_path.open("w", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        existing = []
        if CONVERTED_SOURCES.exists():
            existing = [json.loads(line) for line in CONVERTED_SOURCES.read_text(encoding="utf-8").splitlines() if line.strip()]
        seen = {
            (str(item.get("source_product_key") or ""), str(item.get("source_signature") or ""))
            for item in existing
        }
        marker = (str(entry.get("source_product_key") or ""), str(entry.get("source_signature") or ""))
        if marker not in seen:
            with CONVERTED_SOURCES.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


def sync_converted_sources_from_wave(wave_dir: Path) -> None:
    for record in manifest_records(wave_dir):
        if record.get("status") != "verified":
            continue
        if not record.get("source_image_url") or not record.get("new_product_id"):
            continue
        append_converted_source(record, wave_dir)


def write_patch(path: Path, data: dict[str, Any]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return path


def mark(wave_dir: Path, key: str, status: str, patch: dict[str, Any] | None = None, error: str | None = None) -> None:
    cmd = [sys.executable, str(ROOT / "scripts" / "v6_wave.py"), "mark", "--wave-dir", str(wave_dir), "--source-product-key", key, "--status", status]
    if patch is not None:
        patch_path = write_patch(wave_dir / "tmp" / f"{key}-{status}.json", patch)
        cmd.extend(["--patch-json", str(patch_path)])
    if error is not None:
        cmd.extend(["--error", error])
    run(cmd)


def next_record(wave_dir: Path) -> dict[str, Any] | None:
    out = run([sys.executable, str(ROOT / "scripts" / "v6_wave.py"), "next", "--wave-dir", str(wave_dir)], capture=True)
    data = json.loads(out)
    if data.get("done"):
        return None
    return data


def pending_records(wave_dir: Path, limit: int) -> list[dict[str, Any]]:
    records = [record for record in manifest_records(wave_dir) if record.get("status") not in TERMINAL_STATUSES]
    if not records:
        return []
    status_order = {
        "product_created": 10,
        "media_uploaded": 20,
        "postprocessed": 30,
        "visual_approved": 40,
        "images_generated": 50,
        "prompts_ready": 60,
        "source_discovered": 70,
        "reserved": 80,
        "source_downloaded": 90,
        "analyzed": 100,
    }
    records.sort(key=lambda record: (status_order.get(str(record.get("status")), 999), 0 if record.get("last_error") else 1, int(record.get("source_index") or 0)))
    return records[:limit]


def manual_imagegen_queue(records: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    ready: list[dict[str, Any]] = []
    unsafe_unclaimed: list[dict[str, Any]] = []
    for record in records:
        if record.get("status") != "prompts_ready":
            continue
        item = {
            "source_product_key": record.get("source_product_key"),
            "product_code": record.get("product_code"),
            "new_product_id": record.get("new_product_id"),
            "reservation_sku": record.get("reservation_sku"),
            "product_url": record.get("product_url"),
            "prompts": list((record.get("artifacts") or {}).get("responses") or []),
        }
        if record.get("new_product_id"):
            ready.append(item)
        else:
            unsafe_unclaimed.append(item)
    return {"ready": ready, "unsafe_unclaimed": unsafe_unclaimed}


def infer_colors(filename: str, analysis: dict[str, Any] | None = None) -> list[str]:
    text = filename.lower()
    mapping = [
        ("hong", "hồng"),
        ("do", "đỏ"),
        ("den", "đen"),
        ("trang", "trắng"),
        ("vang", "vàng"),
        ("cam", "cam"),
        ("tim", "tím"),
        ("xanhngoc", "xanh ngọc"),
        ("xanhbich", "xanh"),
        ("xanhvechai", "xanh"),
        ("xanhya", "xanh"),
        ("xanh", "xanh"),
    ]
    colors: list[str] = []
    for needle, color in mapping:
        if needle in text and color not in colors:
            colors.append(color)
    if analysis:
        for color in analysis.get("base_colors") or []:
            if color not in colors:
                colors.append(color)
    return colors[:3] or ["nổi bật"]


def color_tags(colors: list[str]) -> list[str]:
    tags = [f"màu {color}" for color in colors if color != "nổi bật"]
    if len(colors) >= 2 and "nổi bật" not in colors:
        tags.append(f"{colors[0].split()[0]} {colors[1].split()[0]}")
    return tags


def slugify_ascii(value: str) -> str:
    replacements = {
        "đ": "d",
        "á": "a", "à": "a", "ả": "a", "ã": "a", "ạ": "a",
        "ă": "a", "ắ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
        "â": "a", "ấ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
        "é": "e", "è": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
        "ê": "e", "ế": "e", "ề": "e", "ể": "e", "ễ": "e", "ệ": "e",
        "í": "i", "ì": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
        "ó": "o", "ò": "o", "ỏ": "o", "õ": "o", "ọ": "o",
        "ô": "o", "ố": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
        "ơ": "o", "ớ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
        "ú": "u", "ù": "u", "ủ": "u", "ũ": "u", "ụ": "u",
        "ư": "u", "ứ": "u", "ừ": "u", "ử": "u", "ữ": "u", "ự": "u",
        "ý": "y", "ỳ": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
    }
    text = value.lower()
    for src, dest in replacements.items():
        text = text.replace(src, dest)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def next_product_code(current_code: str, used_skus: set[str]) -> str:
    match = re.match(r"^([A-Z0-9]+-[A-Z0-9]+-)(\d+)$", current_code)
    if not match:
        raise ValueError(f"unsupported product code format: {current_code}")
    prefix, number_text = match.groups()
    width = len(number_text)
    number = int(number_text)
    candidate = current_code
    while candidate in used_skus:
        number += 1
        candidate = f"{prefix}{number:0{width}d}"
    return candidate


def products_for_sku(sku: str, env: dict[str, str]) -> list[dict[str, Any]]:
    return request_json(
        f"{DEST_BASE}/wp-json/wc/v3/products?{urllib.parse.urlencode({'sku': sku, 'status': 'any'})}",
        auth=auth_header(env["WOOCOMMERCE_CONSUMER_KEY"], env["WOOCOMMERCE_CONSUMER_SECRET"]),
    )


def product_code_conflicts(record: dict[str, Any], code: str, env: dict[str, str]) -> list[dict[str, Any]]:
    current_id = int(record.get("new_product_id") or 0)
    products = products_for_sku(code, env)
    return [product for product in products if int(product.get("id") or 0) != current_id]


def available_product_code(record: dict[str, Any], env: dict[str, str]) -> tuple[str, list[str]]:
    used: set[str] = set()
    conflicts_seen: list[str] = []
    candidate = str(record["product_code"])
    while True:
        conflicts = product_code_conflicts(record, candidate, env)
        if not conflicts:
            return candidate, conflicts_seen
        used.add(candidate)
        conflicts_seen.append(candidate)
        candidate = next_product_code(candidate, used)


SCENE_VARIANTS = [
    "open-air pickleball court beside a small Vietnamese sportswear storefront, morning daylight, low fence, trees and apartment blocks softened in the background, an X24 Sport shop sign naturally visible off to one side",
    "covered pickleball court with translucent roof, side benches and water station, soft afternoon light, Vietnamese urban neighborhood beyond the fence, a small X24 Sport advertising board in the far background",
    "club-style pickleball court beside a small cafe seating area, a few plastic chairs and plants blurred in the background, relaxed weekend training mood, an incidental X24 Sport storefront sign behind the court",
    "quiet court at a community sports center, clean blue-green surface, perimeter banners, trees and parked motorbikes far off to one side, one background banner reads X24 Sport",
    "indoor-outdoor pickleball facility with roof columns and side netting, neutral service counter in the distance, background kept soft and secondary, an X24 Sport promotional sign near the entrance",
    "sunny court near a park-edge sports shop, greenery and walkway behind the fence, no road-running cues, apparel remains the product focus, an X24 Sport storefront sign appears casually in the background",
    "tournament-style pickleball court with simple spectator benches and shade canopy, shallow depth of field, a small X24 Sport sponsor board naturally visible behind the fence",
    "minimal clean court background, strong net and court-line geometry, distant Vietnamese street edge softened by depth of field, an incidental X24 Sport shop sign at the street edge",
]


POSE_VARIANTS = [
    "male on left and female on right, both three-quarter-front, eyes looking slightly off-camera to the same side, heads turned naturally toward the court",
    "female on left and male on right, both front or three-quarter-front, male looks toward camera while female glances to the side, relaxed catalog posture",
    "male slightly forward and female slightly behind, male three-quarter-front, female three-quarter-back or back-facing with a gentle over-shoulder head turn; only the female may show her back",
    "female slightly forward and male slightly behind, female front or three-quarter-front, male front-facing with head turned aside; no one turns fully away",
    "standing apart across a clean diagonal court line, male right side and female left side, both torsos visible, heads looking in different natural directions",
    "walking slowly side by side along the net, alternating left-right placement, heads turned toward each other in a casual conversation, no action swing",
    "female three-quarter-back near the net to show the back continuation of the garment, male front-facing beside her; female may look back over shoulder, male must not turn his back",
]


CAMERA_VARIANTS = [
    "medium catalog framing from upper thigh upward, prioritizing shirt pattern, collar, shoulders, and torso details",
    "medium catalog framing from upper thigh upward, prioritizing shirt pattern, collar, shoulders, and torso details",
    "medium-full framing from knees upward, enough court context while keeping apparel details prominent",
    "medium-full framing from knees upward, enough court context while keeping apparel details prominent",
    "slightly closer commercial crop from waist to head, strong focus on garment construction and chest pattern",
    "slightly closer commercial crop from waist to head, strong focus on garment construction and chest pattern",
    "occasional wide full-body catalog shot showing both models from head to shoes, full outfit and footwear visible, apparel still large enough to inspect",
]
WIDE_CAMERA_MARKER = "wide full-body"


def seeded_choice(options: list[str], seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return options[int(digest[:8], 16) % len(options)]


def camera_for_slot(source_key: str, slot: str) -> str:
    camera = seeded_choice(CAMERA_VARIANTS, f"{source_key}:{slot}:camera")
    if slot == "b":
        camera_a = seeded_choice(CAMERA_VARIANTS, f"{source_key}:a:camera")
        if WIDE_CAMERA_MARKER in camera_a and WIDE_CAMERA_MARKER in camera:
            non_wide = [variant for variant in CAMERA_VARIANTS if WIDE_CAMERA_MARKER not in variant]
            return seeded_choice(non_wide, f"{source_key}:{slot}:camera:fallback-non-wide")
    return camera


def pose_guardrails_for_slot(slot: str) -> str:
    if slot == "a":
        return (
            "Vary the model placement naturally: male may stand left, right, slightly forward, or slightly behind; "
            "female may stand left, right, slightly forward, or slightly behind. Eye direction and head turn may vary: "
            "toward camera, toward each other, or slightly off-camera toward the court. Only the female may be "
            "three-quarter-back or back-facing, and when she is back-facing she should use a tasteful over-shoulder "
            "head turn so the collar, sleeves, and back panel remain visible. The male must never be fully back-facing; "
            "keep him front or three-quarter-front so the shirt front and X24 chest mark are readable."
        )
    return (
        "Vary the model placement naturally: male may stand left, right, slightly forward, or slightly behind; "
        "female may stand left, right, slightly forward, or slightly behind. Eye direction and head turn may vary: "
        "toward camera, toward each other, or slightly off-camera toward the court. Image B should usually keep the "
        "female front or three-quarter-front so her collared no-sleeve construction is clear; only the female may be "
        "three-quarter-back when the pose specifically asks for it. The male must never be fully back-facing; keep his "
        "round-neck no-sleeve front readable."
    )


def female_b_neckline(source_key: str) -> str:
    return "Female must wear a no-sleeve collared pickleball tank top: real folded polo collar, clean short placket, no sleeve tube, broad shoulder coverage, high minimal arm opening, and no exposed armpit."


def product_image_order(source_key: str) -> list[int]:
    digest = hashlib.sha256(f"{source_key}:featured-image-order".encode("utf-8")).hexdigest()
    return [1, 0] if int(digest[:8], 16) % 2 else [0, 1]


def generate_prompt(record: dict[str, Any], slot: str, colors: list[str]) -> str:
    color_text = ", ".join(colors)
    key = record["source_product_key"].upper()
    scene = seeded_choice(SCENE_VARIANTS, f"{record['source_product_key']}:{slot}:scene")
    pose = seeded_choice(POSE_VARIANTS, f"{record['source_product_key']}:{slot}:pose")
    pose_guardrails = pose_guardrails_for_slot(slot)
    camera = camera_for_slot(record["source_product_key"], slot)
    if slot == "a":
        variant = "Image A garment rule: both male and female wear short-sleeve collared pickleball shirts with true folded polo collars, clean short plackets, real sleeve tubes, broad athletic shoulders, and the same source-derived colorway/pattern map. Image A must not be sleeveless and must not use round necks."
        neckline = "Image A: both models require true folded polo collars with short clean plackets. Do not create zipper collars, mandarin tabs, faux plackets, broken hybrid collars, round necks, or sleeveless armholes."
    else:
        female_neckline = female_b_neckline(record["source_product_key"])
        variant = f"Image B garment rule: male wears a no-sleeve round-neck pickleball tank top with no collar and no sewn sleeve tubes. {female_neckline} Both Image B tops keep the same source-derived colorway/pattern map as Image A, but the collar/sleeve construction intentionally changes by the Image B rule. The no-sleeve outer garment edge must form one clean, mostly straight vertical-to-diagonal line from the lower waist/side seam up to the shoulder cap, with no inward scoop, no curved bite at the armpit, and no side edge bending inward. No exposed armpit, no racerback cut, no stringer tank, no narrow shoulder straps, no armhole scooped inward toward the chest or back."
        neckline = "Image B: male must be round-neck and no-sleeve. Female must be collared and no-sleeve, with a true folded polo collar and a clean short placket. Do not create short sleeves on either model, and do not create zipper collars, mandarin tabs, faux plackets, broken hybrid collars, deep tank tops, or a no-collar female top."
    identity = "Create fictional adult Vietnamese pickleball models: one male and one female. Keep them attractive, athletic, natural, and product-focused without using any real person, local face reference, celebrity, employee, customer, or scraped social-media face."
    return f"""Create a photorealistic square 1:1 WooCommerce product image for mayaopickleball.vn.

Use image 1 only as a garment-design reference. Preserve the apparel design language: dominant colors {color_text}, source-like graphic map, gradients, splatter/texture density, panel placement, accent placement, and small X24 chest mark area. Remove and do not recreate all source text/logos/domains/watermarks including RUN, Running Shirt Collection, source product code {key}, mayaochaybo, old hotline, color label, old catalog footer/header, and running cues.

Product consistency rule: Image A and Image B for this product must show the same SKU, same colorway, same pattern map, same accent placement, and same small X24 chest mark. A/B garment construction differs only by the fixed neckline/sleeve rules: Image A has short sleeves and collars for both models; Image B has no sleeve tubes, male round neck, and female collared no-sleeve tank top. Do not invent a second shirt design, alternate color placement, different stripe direction, or unrelated pattern layout between A and B.

{identity}

Garment style: {variant}. Both wear coordinated pickleball shorts or skort in the same source-derived palette; do not default to plain black unless black is a major source color. Authentic court-sport fabric, realistic folds, relaxed athletic torso. Armhole construction must look feasible for a Vietnamese apparel factory: shoulder seam stays near the natural shoulder edge, shoulder fabric remains wide and stable, the side panel/armhole edge runs as one clean straight line from waist to shoulder, the arm opening is high and minimal, and the side seam rises high enough that the underarm and side torso are not exposed. Add only a small X24 mark on visible shirt fronts; no other readable garment text.

Neckline and armhole quality rule: {neckline} For no-sleeve garments, do not create a deep-cut tank top, bodybuilding singlet, loose armhole, cutaway shoulder, curved underarm scoop, inward armpit bite, or exposed-armpit design.

Scene: {scene}. The pickleball court must be unmistakable through net, court lines, fencing, and court surface. Include either a sportswear storefront or an advertising sign that clearly reads "X24 Sport" as an incidental background element; keep it natural, secondary, and not blocking the apparel. No other readable background text.

Pose and model direction: {pose}. {pose_guardrails} Product-selling posture, relaxed confidence, blank pickleball paddle optional with no logos/text. Apparel is the main focus. Camera/framing: {camera}. Use wide full-body framing only when selected by the camera instruction; otherwise keep the current medium product-selling crop.

Style: photorealistic commercial Vietnamese pickleball sportswear photography, natural daylight, realistic anatomy/hands/fabric. Do not add official logo badge, bottom contact pill, color dots, or watermark; these are added later.

Avoid: male back-facing pose, both models back-facing, running pose, race bib, finish line, medals, old catalog frame, source logos/text, oversexualized pose, distorted hands, random unreadable text, mismatched Image A/B pattern design, alternate colorway between A/B, different pattern layout between A/B, zipper collar, mandarin collar, crew-neck zipper hybrid, round-neck placket hybrid, deep tank top, oversized armhole, exposed armpit, curved inward armpit scoop, side edge bending inward at the armpit, shoulder fabric eaten away into the neckline."""


def call_openai_image(prompt: str, source: Path, output: Path, env: dict[str, str]) -> None:
    api_key = env.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY missing; cannot run one-command image generation")
    model = env.get("OPENAI_IMAGE_MODEL", "gpt-image-1.5")
    tmp_json = output.with_suffix(".openai.json")
    cmd = [
        "curl", "-sS", "--max-time", env.get("OPENAI_IMAGE_TIMEOUT", "300"),
        "-X", "POST", "https://api.openai.com/v1/images/edits",
        "-H", f"Authorization: Bearer {api_key}",
        "-F", f"model={model}",
        "-F", "size=1024x1024",
        "-F", f"quality={env.get('OPENAI_IMAGE_QUALITY', 'medium')}",
        "-F", "output_format=png",
        "-F", f"image[]=@{source}",
    ]
    cmd.extend(["-F", f"prompt={prompt}"])
    raw = run(cmd, capture=True)
    tmp_json.write_text(raw, encoding="utf-8")
    data = json.loads(raw)
    if "error" in data:
        raise RuntimeError(json.dumps(data["error"], ensure_ascii=False))
    b64 = data["data"][0]["b64_json"]
    output.write_bytes(base64.b64decode(b64))


def postprocess(input_path: Path, output_path: Path) -> None:
    bundled = Path("/Users/hoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
    py = bundled if bundled.exists() else Path(sys.executable)
    run([str(py), str(ROOT / "scripts" / "pickleball_postprocess_pillow.py"), str(input_path), str(output_path), "right"], cwd=ROOT)


def ensure_tags(tag_names: list[str], env: dict[str, str], output_dir: Path) -> list[dict[str, Any]]:
    out = output_dir / "tag-ensure-response.json"
    cmd = [sys.executable, str(ROOT / "scripts" / "ensure_product_tags.py"), "--env-file", str(SITE_ROOT / ".runtime" / "wordpress-api.env")]
    cmd.extend(tag_names)
    text = run(cmd, cwd=ROOT, env=env, capture=True)
    out.write_text(text, encoding="utf-8")
    return json.loads(text)


BASE_TAG_NAMES = [
    "áo pickleball có cổ",
    "áo pickleball cổ tròn",
    "áo pickleball không tay",
    "áo pickleball nam",
    "áo pickleball nữ",
]


def tag_names_for_record(record: dict[str, Any]) -> list[str]:
    colors = infer_colors(str(record.get("source_filename") or ""), record.get("visual_analysis"))
    return BASE_TAG_NAMES + color_tags(colors)


def tag_cache_for_wave(wave_dir: Path, env: dict[str, str]) -> dict[str, dict[str, Any]]:
    cache_path = wave_dir / "tag-cache.json"
    cached: dict[str, dict[str, Any]] = {}
    if cache_path.exists():
        raw = json.loads(cache_path.read_text(encoding="utf-8"))
        cached = {str(item["name"]).casefold(): item for item in raw if item.get("name")}

    wanted: list[str] = []
    seen: set[str] = set()
    for record in manifest_records(wave_dir):
        if record.get("status") == "verified":
            continue
        for name in tag_names_for_record(record):
            key = name.casefold()
            if key in seen:
                continue
            seen.add(key)
            wanted.append(name)

    missing = [name for name in wanted if name.casefold() not in cached]
    if missing:
        tags = ensure_tags(missing, env, wave_dir)
        for tag in tags:
            cached[str(tag["name"]).casefold()] = tag
        cache_path.write_text(json.dumps(list(cached.values()), ensure_ascii=False, indent=2), encoding="utf-8")
    return cached


def upload_media(path: Path, filename: str, env: dict[str, str]) -> dict[str, Any]:
    user = env["WORDPRESS_USERNAME"]
    password = env["WORDPRESS_APPLICATION_PASSWORD"]
    cmd = [
        "curl", "-sS", "--max-time", "60",
        "-u", f"{user}:{password}",
        "-H", "Content-Type: image/webp",
        "-H", f"Content-Disposition: attachment; filename={filename}",
        "--data-binary", f"@{path}",
        f"{DEST_BASE}/wp-json/wp/v2/media",
    ]
    return json.loads(run(cmd, capture=True))


def create_product(payload: dict[str, Any], env: dict[str, str]) -> dict[str, Any]:
    return request_json(
        f"{DEST_BASE}/wp-json/wc/v3/products",
        method="POST",
        payload=payload,
        auth=auth_header(env["WOOCOMMERCE_CONSUMER_KEY"], env["WOOCOMMERCE_CONSUMER_SECRET"]),
    )


def update_product(product_id: int, payload: dict[str, Any], env: dict[str, str]) -> dict[str, Any]:
    return request_json(
        f"{DEST_BASE}/wp-json/wc/v3/products/{product_id}",
        method="POST",
        payload=payload,
        auth=auth_header(env["WOOCOMMERCE_CONSUMER_KEY"], env["WOOCOMMERCE_CONSUMER_SECRET"]),
    )


def reservation_sku(signature: str) -> str:
    return f"x24-transfer-{signature[:18]}"


def transfer_meta(record: dict[str, Any], status: str | None = None) -> list[dict[str, str]]:
    url = str(record.get("source_image_url") or "")
    meta = [
        {"key": "_x24_transfer_source_image_url", "value": url},
        {"key": "_x24_transfer_source_product_key", "value": str(record.get("source_product_key") or "")},
        {"key": "_x24_transfer_source_product_id", "value": str(record.get("source_product_id") or "")},
        {"key": "_x24_transfer_source_product_url", "value": str(record.get("source_product_url") or "")},
        {"key": "_x24_transfer_source_signature", "value": str(source_signature(url) or "")},
        {"key": "_x24_transfer_schema", "value": TRANSFER_SCHEMA},
    ]
    if status:
        meta.extend([
            {"key": "_x24_transfer_claim_status", "value": status},
            {"key": "_x24_transfer_claim_updated_at", "value": utc_now()},
        ])
    return meta


def product_meta_value(product: dict[str, Any], key: str) -> str | None:
    for item in product.get("meta_data") or []:
        if item.get("key") == key:
            return str(item.get("value") or "")
    return None


def find_transfer_product(record: dict[str, Any], env: dict[str, str]) -> dict[str, Any] | None:
    signature = source_signature(str(record.get("source_image_url") or ""))
    source_product_id = str(record.get("source_product_id") or "")
    page = 1
    while True:
        products = request_json(
            f"{DEST_BASE}/wp-json/wc/v3/products?{urllib.parse.urlencode({'per_page': 100, 'page': page, 'status': 'any'})}",
            auth=auth_header(env["WOOCOMMERCE_CONSUMER_KEY"], env["WOOCOMMERCE_CONSUMER_SECRET"]),
        )
        if not products:
            return None
        for product in products:
            if signature and product_meta_value(product, "_x24_transfer_source_signature") == signature:
                return product
            if source_product_id and product_meta_value(product, "_x24_transfer_source_product_id") == source_product_id:
                return product
        page += 1


def reserve_product(record: dict[str, Any], env: dict[str, str]) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    existing = find_transfer_product(record, env)
    if existing:
        return None, existing
    signature = source_signature(str(record.get("source_image_url") or "")) or hashlib.sha256(str(record.get("source_product_key") or "").encode("utf-8")).hexdigest()
    payload = {
        "name": f"[Đang tạo] {record['product_code']} từ {record.get('source_product_key')}",
        "slug": f"dang-tao-{slugify_ascii(str(record.get('source_product_key') or record['product_code']))}",
        "type": "simple",
        "status": "draft",
        "sku": reservation_sku(signature),
        "regular_price": "0",
        "description": "<p>Sản phẩm đang được hệ thống tạo ảnh và nội dung.</p>",
        "short_description": "<p>Đang xử lý.</p>",
        "catalog_visibility": "hidden",
        "meta_data": transfer_meta(record, "running"),
    }
    try:
        return create_product(payload, env), None
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        try:
            error = json.loads(body)
        except json.JSONDecodeError:
            raise
        if exc.code == 400 and ("sku" in json.dumps(error).lower() or "unique" in json.dumps(error).lower()):
            return None, find_transfer_product(record, env) or {"duplicate_error": error}
        raise RuntimeError(json.dumps(error, ensure_ascii=False)) from exc


def verify_product_fast(product_id: int, env: dict[str, str]) -> dict[str, Any]:
    product = request_json(
        f"{DEST_BASE}/wp-json/wc/v3/products/{product_id}",
        auth=auth_header(env["WOOCOMMERCE_CONSUMER_KEY"], env["WOOCOMMERCE_CONSUMER_SECRET"]),
    )
    meta_data = [
        item for item in product.get("meta_data", [])
        if not str(item.get("key") or "").startswith("_x24_transfer_")
    ]
    fields = json.dumps({k: product.get(k) for k in ["name", "slug", "sku", "description", "short_description", "categories", "tags", "images"]} | {"meta_data": meta_data}, ensure_ascii=False).lower()
    return {
        "rest_product_status": 200,
        "product_id": product.get("id"),
        "product_url": product.get("permalink"),
        "shopper_fields_forbidden_hits": [term for term in FORBIDDEN if term in fields],
        "public_category_deferred_to_batch": True,
    }


def product_payload(record: dict[str, Any], media_ids: list[int], media_urls: list[str], tag_ids: list[int], colors: list[str]) -> dict[str, Any]:
    code = record["product_code"]
    color_title = " ".join(c.title() for c in colors if c != "nổi bật") or "Nổi Bật"
    name = f"Bộ Quần Áo Pickleball {code} {color_title} Năng Động"
    slug_color = "-".join(slugify_ascii(c) for c in colors if c != "nổi bật") or "noi-bat"
    slug = f"bo-quan-ao-pickleball-{code.lower().replace('-', '-')}-{slug_color}-nang-dong"
    color_copy = ", ".join(colors)
    image_alts = [
        f"Bộ quần áo pickleball {code} {color_copy} nam nữ áo có cổ tay ngắn",
        f"Bộ quần áo pickleball {code} {color_copy} nam cổ tròn nữ có cổ không tay",
    ]
    image_order = product_image_order(str(record.get("source_product_key") or code))
    gallery_images = [
        {"id": media_ids[src_idx], "position": position, "alt": image_alts[src_idx]}
        for position, src_idx in enumerate(image_order)
    ]
    featured_media_id = media_ids[image_order[0]]
    short = f"Bộ quần áo pickleball {code} nổi bật với tông {color_copy}, gồm ảnh nam nữ áo có cổ tay ngắn và ảnh nam cổ tròn không tay phối nữ có cổ không tay, phù hợp luyện tập, câu lạc bộ hoặc đồng phục đội nhóm."
    desc = f"""
<p><strong>{name}</strong> được phát triển từ ngôn ngữ thiết kế thể thao nổi bật với tông {color_copy}. Bố cục họa tiết được làm mới cho pickleball, giữ cảm giác năng lượng trên sân nhưng loại bỏ toàn bộ dấu hiệu của ảnh nguồn cũ.</p>
<figure><img src="{media_urls[0]}" alt="{image_alts[0]}" /></figure>
<p>Kiểu áo có cổ tay ngắn cho cả nam và nữ giữ cảm giác lịch sự, dễ mặc khi làm đồng phục câu lạc bộ hoặc đội nhóm.</p>
<p>Biến thể không ống tay phối rõ hai form: nam cổ tròn và nữ có cổ dạng tanktop thể thao. Hai ảnh vẫn giữ cùng tông màu, cùng bố cục họa tiết và cùng nhận diện X24 để khách dễ hiểu đây là cùng một mã thiết kế.</p>
<figure><img src="{media_urls[1]}" alt="{image_alts[1]}" /></figure>
<p>{code} phù hợp cho nhóm bạn, câu lạc bộ pickleball, đội phong trào hoặc sự kiện nội bộ cần đồng phục riêng. X24 Sport có thể tư vấn phối size nam nữ, thêm tên đội, số áo hoặc logo để tạo bộ trang phục đồng nhất và chuyên nghiệp.</p>
""".strip()
    payload = {
        "name": name,
        "slug": slug,
        "type": "simple",
        "status": "publish",
        "sku": code,
        "catalog_visibility": "visible",
        "regular_price": "200000",
        "sale_price": "135000",
        "description": desc,
        "short_description": short,
        "categories": [{"id": i} for i in STATIC_CATEGORY_IDS],
        "tags": [{"id": i} for i in sorted(set(STATIC_TAG_IDS + tag_ids))],
        "images": gallery_images,
        "meta_data": transfer_meta(record, "completed") + [
            {"key": "_yoast_wpseo_focuskw", "value": f"bộ quần áo pickleball {color_copy}"},
            {"key": "_yoast_wpseo_metadesc", "value": f"Bộ quần áo pickleball {code} tông {color_copy}, có ảnh nam nữ áo có cổ tay ngắn và ảnh nam cổ tròn phối nữ có cổ không tay, phù hợp câu lạc bộ và đồng phục đội nhóm."},
            {"key": "_yoast_wpseo_opengraph-title", "value": name},
            {"key": "_yoast_wpseo_opengraph-description", "value": f"Trang phục pickleball {code} tông {color_copy}, dễ tùy chỉnh cho đội nhóm."},
            {"key": "_yoast_wpseo_twitter-title", "value": name},
            {"key": "_yoast_wpseo_twitter-description", "value": f"Bộ quần áo pickleball {code} cho nam nữ, nổi bật trên sân và phù hợp đồng phục câu lạc bộ."},
            {"key": "_thumbnail_id", "value": str(featured_media_id)},
            {"key": "_x24_transfer_featured_slot", "value": "B" if image_order[0] == 1 else "A"},
        ],
    }
    shopper_payload = dict(payload)
    shopper_payload["meta_data"] = [
        item for item in payload.get("meta_data", [])
        if not str(item.get("key") or "").startswith("_x24_transfer_")
    ]
    shopper = json.dumps(shopper_payload, ensure_ascii=False).lower()
    hits = [term for term in FORBIDDEN if term in shopper]
    if hits:
        raise RuntimeError("forbidden shopper terms: " + ", ".join(hits))
    return payload


def verify_public_batch(wave_dir: Path, source_keys: list[str], env: dict[str, str]) -> None:
    records = {
        str(record.get("source_product_key")): record
        for record in manifest_records(wave_dir)
        if record.get("status") == "verified" and record.get("source_product_key") in source_keys
    }
    if not records:
        return

    _, _, cat_bytes = request_bytes(f"{DEST_BASE}/product-category/ao-pickleball/?v6_verify=1")
    category_html = cat_bytes.decode("utf-8", errors="ignore")
    report_path = wave_dir / "batch-public-verification.jsonl"

    for key, record in records.items():
        product_url = str(record.get("product_url") or "")
        if not product_url:
            continue
        status, _, html_bytes = request_bytes(product_url + "?v6_verify=1")
        html = html_bytes.decode("utf-8", errors="ignore")
        media_urls: list[str] = []
        for mid in record.get("new_media_ids") or []:
            media = request_json(f"{DEST_BASE}/wp-json/wp/v2/media/{mid}", auth=auth_header(env["WORDPRESS_USERNAME"], env["WORDPRESS_APPLICATION_PASSWORD"]))
            media_urls.append(media["source_url"])
        slug = urllib.parse.urlparse(product_url).path.strip("/")
        batch_public = {
            "public_product_status": status,
            "category_contains_product_slug": slug in category_html,
            "public_contains_images": [url in html for url in media_urls],
        }
        if not batch_public["category_contains_product_slug"] or not all(batch_public["public_contains_images"]):
            raise RuntimeError(f"batch public verification failed for {key}: " + json.dumps(batch_public, ensure_ascii=False))
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with report_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps({"source_product_key": key, **batch_public}, ensure_ascii=False) + "\n")
        qa = dict(record.get("qa") or {})
        qa["batch_public"] = batch_public
        mark(wave_dir, key, "verified", {"qa": qa})


def init_wave(wave_dir: Path, refresh_source: bool = False) -> None:
    wave_dir.mkdir(parents=True, exist_ok=True)
    source_jsonl = wave_dir / "source-images.jsonl"
    if refresh_source and source_jsonl.exists():
        source_jsonl.replace(wave_dir / f"source-images.previous-{int(time.time())}.jsonl")
    if not source_jsonl.exists():
        run([
            sys.executable, str(ROOT / "scripts" / "list_source_products.py"),
            "--base-url", SOURCE_BASE,
            "--limit", "10000",
            "--out", str(source_jsonl),
        ], cwd=ROOT)
    run([
        sys.executable, str(ROOT / "scripts" / "v6_wave.py"), "init",
        "--wave-dir", str(wave_dir),
        "--source-jsonl", str(source_jsonl),
        "--product-code-start", "24",
        "--converted-sources", str(CONVERTED_SOURCES),
    ], cwd=ROOT)


def process_record(
    record: dict[str, Any],
    wave_dir: Path,
    env: dict[str, str],
    image_provider: str,
    tag_cache: dict[str, dict[str, Any]] | None = None,
    auto_approve_generated_images: bool = False,
    dry_run: bool = False,
) -> None:
    key = record["source_product_key"]
    code = record["product_code"]
    item_dir = wave_dir / "products" / key
    source_dir = item_dir / "source"
    generated_dir = item_dir / "generated"
    final_dir = item_dir / "final"
    source_dir.mkdir(parents=True, exist_ok=True)
    generated_dir.mkdir(parents=True, exist_ok=True)
    final_dir.mkdir(parents=True, exist_ok=True)
    source_path = source_dir / str(record["source_filename"])
    colors = infer_colors(str(record.get("source_filename") or ""), record.get("visual_analysis"))

    if dry_run:
        print(json.dumps({"dry_run_next": key, "product_code": code, "colors": colors}, ensure_ascii=False, indent=2))
        return

    try:
        if record["status"] != "source_discovered" and not record.get("new_product_id"):
            print(f"Reserving destination product for existing in-flight record {key}")
            reserved, duplicate = reserve_product(record, env)
            if duplicate:
                duplicate_id = duplicate.get("id") if isinstance(duplicate, dict) else None
                duplicate_url = duplicate.get("permalink") if isinstance(duplicate, dict) else None
                mark(wave_dir, key, "skipped_duplicate", {
                    "duplicate_product_id": duplicate_id,
                    "duplicate_product_url": duplicate_url,
                    "qa": {"duplicate_transfer_claim": True},
                })
                print(f"Skipped duplicate source {key}; existing product={duplicate_id or 'unknown'}")
                return
            mark(wave_dir, key, str(record["status"]), {
                "new_product_id": reserved["id"],
                "product_url": reserved.get("permalink"),
                "reservation_sku": reserved.get("sku"),
            })
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)

        if record["status"] == "source_discovered":
            print(f"Reserving destination product for {key}")
            reserved, duplicate = reserve_product(record, env)
            if duplicate:
                duplicate_id = duplicate.get("id") if isinstance(duplicate, dict) else None
                duplicate_url = duplicate.get("permalink") if isinstance(duplicate, dict) else None
                mark(wave_dir, key, "skipped_duplicate", {
                    "duplicate_product_id": duplicate_id,
                    "duplicate_product_url": duplicate_url,
                    "qa": {"duplicate_transfer_claim": True},
                })
                print(f"Skipped duplicate source {key}; existing product={duplicate_id or 'unknown'}")
                return
            mark(wave_dir, key, "reserved", {
                "new_product_id": reserved["id"],
                "product_url": reserved.get("permalink"),
                "reservation_sku": reserved.get("sku"),
                "artifacts": {"item_dir": f"products/{key}", "source": None, "generated": [], "final": [], "payload": None, "responses": []},
            })
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)

        if record["status"] == "reserved":
            print(f"Downloading {key}")
            download_file(record["source_image_url"], source_path)
            mark(wave_dir, key, "source_downloaded", {"artifacts": {"item_dir": f"products/{key}", "source": f"products/{key}/source/{source_path.name}", "generated": [], "final": [], "payload": None, "responses": []}})
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)

        if record.get("new_product_id") and record["status"] in {"source_downloaded", "analyzed", "prompts_ready"}:
            available_code, conflicted_codes = available_product_code(record, env)
            if available_code != record["product_code"]:
                print(f"Reassigning {key} product code {record['product_code']} -> {available_code} before prompt/image generation", flush=True)
                qa = dict(record.get("qa") or {})
                qa["sku_reassigned"] = {"from": record["product_code"], "to": available_code, "conflicted_codes": conflicted_codes}
                mark(wave_dir, key, str(record["status"]), {"product_code": available_code, "qa": qa})
                record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)
                code = str(record["product_code"])

        gen_a = generated_dir / f"{code.lower()}-image-a.png"
        gen_b = generated_dir / f"{code.lower()}-image-b.png"
        final_a = final_dir / f"{code.lower()}-anh-1.webp"
        final_b = final_dir / f"{code.lower()}-anh-2.webp"

        if record["status"] in {"source_downloaded", "analyzed", "prompts_ready"}:
            print(f"Generating images for {key} / {code}")
            prompt_a = generate_prompt(record, "a", colors)
            prompt_b = generate_prompt(record, "b", colors)
            prompt_a_path = item_dir / f"{code.lower()}-prompt-a.txt"
            prompt_b_path = item_dir / f"{code.lower()}-prompt-b.txt"
            prompt_a_path.write_text(prompt_a, encoding="utf-8")
            prompt_b_path.write_text(prompt_b, encoding="utf-8")
            if image_provider == "manual-imagegen":
                mark(wave_dir, key, "prompts_ready", {
                    "visual_analysis": {"base_colors": colors, "design_notes": ["prompts prepared for default Codex imagegen"]},
                    "model_references": {"female": None, "male": None, "mode": "fictional"},
                    "artifacts": {
                        "item_dir": f"products/{key}",
                        "source": f"products/{key}/source/{source_path.name}",
                        "generated": [],
                        "final": [],
                        "payload": None,
                        "responses": [f"products/{key}/{prompt_a_path.name}", f"products/{key}/{prompt_b_path.name}"],
                    },
                })
                print(
                    f"prompts_ready for {key}; use default Codex imagegen with {prompt_a_path} and {prompt_b_path}, "
                    "then place outputs in generated/ and mark images_generated.",
                    flush=True,
                )
                return
            call_openai_image(prompt_a, source_path, gen_a, env)
            call_openai_image(prompt_b, source_path, gen_b, env)
            mark(wave_dir, key, "images_generated", {"visual_analysis": {"base_colors": colors, "design_notes": ["generated from source image only"]}, "model_references": {"female": None, "male": None, "mode": "fictional"}, "artifacts": {"item_dir": f"products/{key}", "source": f"products/{key}/source/{source_path.name}", "generated": [f"products/{key}/generated/{gen_a.name}", f"products/{key}/generated/{gen_b.name}"], "final": [], "payload": None, "responses": []}})
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)
            if not auto_approve_generated_images:
                print(
                    f"images_generated for {key}; visually approve outputs, then mark visual_approved before publishing.",
                    flush=True,
                )
                return

        if record["status"] == "images_generated" and not auto_approve_generated_images:
            print(f"{key} is waiting for visual approval; not publishing.", flush=True)
            return

        if record["status"] in {"images_generated", "visual_approved"}:
            print(f"Postprocessing {key}")
            postprocess(gen_a, final_a)
            postprocess(gen_b, final_b)
            tag_names = tag_names_for_record(record)
            if tag_cache is None:
                tags = ensure_tags(tag_names, env, item_dir)
            else:
                tags = [tag_cache[name.casefold()] for name in tag_names if name.casefold() in tag_cache]
            mark(wave_dir, key, "postprocessed", {
                "tag_names": [t["name"] for t in tags],
                "tag_ids": [t["id"] for t in tags],
                "category_ids": STATIC_CATEGORY_IDS,
                "artifacts": {"item_dir": f"products/{key}", "source": f"products/{key}/source/{source_path.name}", "generated": [f"products/{key}/generated/{gen_a.name}", f"products/{key}/generated/{gen_b.name}"], "final": [f"products/{key}/final/{final_a.name}", f"products/{key}/final/{final_b.name}"], "payload": None, "responses": ["tag-cache.json"] if tag_cache is not None else [f"products/{key}/tag-ensure-response.json"]},
            })
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)

        media_ids = list(record.get("new_media_ids") or [])
        media_urls: list[str] = []
        if record["status"] == "postprocessed":
            print(f"Uploading media for {key}")
            uploaded = []
            for idx, final in enumerate([final_a, final_b], start=1):
                media = upload_media(final, f"{code.lower()}-anh-{idx}.webp", env)
                uploaded.append(media)
            media_ids = [m["id"] for m in uploaded]
            media_urls = [m["source_url"] for m in uploaded]
            for idx, media in enumerate(uploaded, start=1):
                (item_dir / f"media-upload-{idx}.json").write_text(json.dumps(media, ensure_ascii=False, indent=2), encoding="utf-8")
            mark(wave_dir, key, "media_uploaded", {"new_media_ids": media_ids})
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)
        else:
            for mid in media_ids:
                media = request_json(f"{DEST_BASE}/wp-json/wp/v2/media/{mid}", auth=auth_header(env["WORDPRESS_USERNAME"], env["WORDPRESS_APPLICATION_PASSWORD"]))
                media_urls.append(media["source_url"])

        if record["status"] == "media_uploaded":
            print(f"Updating reserved product for {key}")
            if not media_urls:
                for mid in media_ids:
                    media = request_json(f"{DEST_BASE}/wp-json/wp/v2/media/{mid}", auth=auth_header(env["WORDPRESS_USERNAME"], env["WORDPRESS_APPLICATION_PASSWORD"]))
                    media_urls.append(media["source_url"])
            available_code, conflicted_codes = available_product_code(record, env)
            if available_code != record["product_code"]:
                print(f"Reassigning {key} product code {record['product_code']} -> {available_code}; existing SKU conflict", flush=True)
                qa = dict(record.get("qa") or {})
                qa["sku_reassigned"] = {"from": record["product_code"], "to": available_code, "conflicted_codes": conflicted_codes}
                mark(wave_dir, key, "media_uploaded", {"product_code": available_code, "qa": qa})
                record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)
            payload = product_payload(record, media_ids, media_urls, list(record.get("tag_ids") or []), colors)
            payload_path = item_dir / "product-payload.json"
            payload_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            if record.get("new_product_id"):
                product = update_product(int(record["new_product_id"]), payload, env)
                response_name = "product-update-response.json"
            else:
                product = create_product(payload, env)
                response_name = "product-create-response.json"
            (item_dir / response_name).write_text(json.dumps(product, ensure_ascii=False, indent=2), encoding="utf-8")
            mark(wave_dir, key, "product_created", {"new_product_id": product["id"], "product_url": product["permalink"], "artifacts": {"item_dir": f"products/{key}", "source": f"products/{key}/source/{source_path.name}", "generated": [f"products/{key}/generated/{gen_a.name}", f"products/{key}/generated/{gen_b.name}"], "final": [f"products/{key}/final/{final_a.name}", f"products/{key}/final/{final_b.name}"], "payload": f"products/{key}/product-payload.json", "responses": [f"products/{key}/{response_name}"]}})
            record = next(r for r in manifest_records(wave_dir) if r["source_product_key"] == key)

        if record["status"] == "product_created":
            print(f"Fast-verifying {key}")
            qa = verify_product_fast(int(record["new_product_id"]), env)
            if qa["shopper_fields_forbidden_hits"]:
                raise RuntimeError("verification failed: " + json.dumps(qa, ensure_ascii=False))
            mark(wave_dir, key, "verified", {"qa": qa})
            append_converted_source(record, wave_dir)
            print(f"Fast-verified {key} -> {record['product_url']}")

    except Exception as exc:
        mark(wave_dir, key, record.get("status") or "source_discovered", error=str(exc))
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    parser.add_argument("--env-file", type=Path, default=SITE_ROOT / ".runtime" / "wordpress-api.env")
    parser.add_argument("--max-items", type=int, help="Limit items for this run; omitted means all pending")
    parser.add_argument("--concurrency", type=int, default=1, help="Number of products to process in parallel")
    parser.add_argument("--image-provider", choices=["manual-imagegen", "openai-api"], default="manual-imagegen", help="Default prepares prompts for Codex imagegen; openai-api calls OpenAI image API")
    parser.add_argument("--auto-approve-generated-images", action="store_true", help="Skip the visual approval gate and publish generated images automatically")
    parser.add_argument("--sleep", type=float, default=2.0)
    parser.add_argument("--refresh-source", action="store_true", help="Force refresh source-images.jsonl before adding new manifest records")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--list-imagegen-ready", action="store_true", help="List prompts that are safe for manual Codex imagegen; fails if unclaimed prompt records exist")
    args = parser.parse_args()

    env = load_env(args.env_file)
    init_wave(args.wave_dir, refresh_source=args.refresh_source)
    if not args.dry_run:
        sync_converted_sources_from_wave(args.wave_dir)
    if args.list_imagegen_ready:
        queue = manual_imagegen_queue(manifest_records(args.wave_dir))
        print(json.dumps(queue, ensure_ascii=False, indent=2))
        if queue["unsafe_unclaimed"]:
            print("Unsafe manual imagegen queue: run ./run-all.sh --max-items 1 until these records are reserved or skipped.", file=sys.stderr)
            return 2
        return 0
    tag_cache = None
    if args.concurrency < 1:
        raise SystemExit("--concurrency must be >= 1")
    processed = 0
    while True:
        batch_size = args.concurrency
        if args.max_items:
            batch_size = min(batch_size, args.max_items - processed)
        if batch_size <= 0:
            print(f"Stopped after --max-items={args.max_items}")
            return 0
        records = pending_records(args.wave_dir, batch_size)
        if not records:
            print("All records verified.")
            return 0
        batch_source_keys = [str(record.get("source_product_key")) for record in records]
        if args.dry_run:
            for record in records:
                process_record(record, args.wave_dir, env, args.image_provider, auto_approve_generated_images=args.auto_approve_generated_images, dry_run=True)
            return 0
        if args.concurrency == 1:
            process_record(records[0], args.wave_dir, env, args.image_provider, tag_cache, args.auto_approve_generated_images)
        else:
            if args.image_provider == "manual-imagegen":
                print(f"Preparing {len(records)} products for manual Codex imagegen with concurrency={args.concurrency}", flush=True)
                for record in records:
                    process_record(record, args.wave_dir, env, args.image_provider, tag_cache, args.auto_approve_generated_images)
                print("Manual imagegen prompts are ready. Use Codex imagegen for each prompts_ready item, then rerun.", flush=True)
                processed += len(records)
                if args.max_items and processed >= args.max_items:
                    print(f"Stopped after --max-items={args.max_items}")
                return 0
            print(f"Processing {len(records)} products with concurrency={args.concurrency}", flush=True)
            with concurrent.futures.ThreadPoolExecutor(max_workers=args.concurrency) as executor:
                futures = [
                    executor.submit(
                        process_record,
                        record,
                        args.wave_dir,
                        env,
                        args.image_provider,
                        tag_cache,
                        args.auto_approve_generated_images,
                    )
                    for record in records
                ]
                for future in concurrent.futures.as_completed(futures):
                    future.result()
        verify_public_batch(args.wave_dir, batch_source_keys, env)
        processed += len(records)
        if args.max_items and processed >= args.max_items:
            print(f"Stopped after --max-items={args.max_items}")
            return 0
        time.sleep(args.sleep)


if __name__ == "__main__":
    raise SystemExit(main())
