#!/usr/bin/env python3
"""Validate v0.4-safe pickleball transfer manifest JSONL records."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ADVANCED = {"postprocessed", "compressed", "backed_up", "media_uploaded", "product_updated", "verified"}
MUTATED = {"media_uploaded", "product_updated", "verified"}
FINAL = {"verified"}


def check_record(rec: dict[str, Any], idx: int) -> list[str]:
    e: list[str] = []
    if rec.get("schema_version") != "0.4-safe":
        e.append("schema_version must be 0.4-safe")
    if rec.get("operation_mode") != "update_existing_product":
        e.append("operation_mode must be update_existing_product")
    if rec.get("destination_site") != "mayaopickleball.vn":
        e.append("destination_site must be mayaopickleball.vn")
    if not rec.get("destination_product_id"):
        e.append("destination_product_id is required; never create a product")
    if rec.get("selection_mode") not in {"single_url", "bulk_scan"}:
        e.append("selection_mode must be single_url or bulk_scan")

    assets = rec.get("assets") or {}
    a = assets.get("image_a") or {}
    b = assets.get("image_b") or {}
    if not a:
        e.append("assets.image_a is required")
    if not b:
        e.append("assets.image_b is required")

    for label, asset in (("Image A", a), ("Image B", b)):
        if not asset.get("style"):
            e.append(f"{label}: style is required")
        if not asset.get("image_filter_tags"):
            e.append(f"{label}: image_filter_tags must describe the visible garment variant")
    if a.get("style") and b.get("style") and a.get("style") == b.get("style"):
        e.append("Image A and Image B must not use the same garment style")
    for label, asset in (("Image A", a), ("Image B", b)):
        style = str(asset.get("style") or "").lower()
        tags = {str(tag).lower() for tag in (asset.get("image_filter_tags") or [])}
        bad_male_styles = {"male_collared_no_sleeve", "male_collared_tank", "male_tank_collared"}
        if style in bad_male_styles or any(style.startswith(bad + "_") for bad in bad_male_styles):
            e.append(f"{label}: male no-sleeve/tank style must not be collared")
        if {"nam", "có cổ", "không tay"}.issubset(tags) or {"nam", "có cổ", "3 lỗ"}.issubset(tags):
            e.append(f"{label}: male no-sleeve/tank tags must not include có cổ")

    status = rec.get("status")
    if status in ADVANCED:
        for label, asset in (("Image A", a), ("Image B", b)):
            branding = asset.get("branding") or {}
            if branding.get("logo_source") not in {"svg", "png"}:
                e.append(f"{label}: official logo_source must be svg or png")
            if branding.get("contact_overlay_present") is not True:
                e.append(f"{label}: contact overlay missing")
            if branding.get("color_dots_present") is not True:
                e.append(f"{label}: color dots missing")

    if status in MUTATED:
        backup = rec.get("old_product_records") or rec.get("old_product_record_path")
        if not backup:
            e.append("old product backup is required before mutation")
        if not a.get("media_id"):
            e.append("Image A media_id is required after media upload")
        if not b.get("media_id"):
            e.append("Image B media_id is required after media upload")

    if status in FINAL:
        v = rec.get("verification") or {}
        if v.get("same_product_id_confirmed") is not True:
            e.append("verified record must confirm same product ID")
        if v.get("public_html_checked") is not True:
            e.append("verified record must confirm public HTML checked")

    return [f"record {idx}: {msg}" for msg in e]


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("manifest", type=Path)
    args = p.parse_args()

    errors: list[str] = []
    for i, line in enumerate(args.manifest.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"record {i}: invalid JSON: {exc}")
            continue
        errors.extend(check_record(rec, i))

    if errors:
        print("Manifest validation FAILED:", file=sys.stderr)
        for err in errors:
            print("  - " + err, file=sys.stderr)
        return 1
    print("Manifest OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
