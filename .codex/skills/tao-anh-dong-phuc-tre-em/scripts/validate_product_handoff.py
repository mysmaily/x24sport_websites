#!/usr/bin/env python3
"""Validate Mayaodongphuc children's uniform handoff structure and checksums."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


PRODUCER = "tao-anh-dong-phuc-tre-em"
REQUIRED_TOP_LEVEL = {
    "schemaVersion", "producerSkill", "createdAt", "consumerPolicy", "publishingIntent", "sourceTransformations", "sourceReferences",
    "acceptedImages", "garmentFacts", "audiences", "useCases", "featureLock",
    "unsupportedClaims", "fidelityCaveats", "suggestedCategory", "copySeeds",
}
REQUIRED_GARMENT_FACTS = {
    "productType", "collar", "sleeves", "colors", "pattern",
    "approvedArtwork", "removedArtwork", "visibleSides",
}
FEATURE_KEYS = {"fabric", "design", "durability", "printing"}
EVIDENCE_LEVELS = {"provided", "visible", "restrained-default"}
INVENTORY_PREFIX = re.compile(
    r"^(?:ảnh chụp|hình ảnh|bảng catalog|catalog|poster|"
    r"(?:nhóm|ba|bốn|năm|sáu|bảy|\d+)\s+(?:người|người mẫu))\b",
    re.IGNORECASE,
)


def fail(message: str) -> None:
    raise SystemExit(f"ERROR {message}")


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def required_text(item: dict, key: str, location: str) -> str:
    value = str(item.get(key, "")).strip()
    if not value:
        fail(f"{location}.{key} is required")
    if INVENTORY_PREFIX.search(value):
        fail(f"{location}.{key} uses inventory-style copy: {value!r}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--image", action="append", default=[], type=Path)
    parser.add_argument("--require-default-set", action="store_true")
    args = parser.parse_args()

    if not args.manifest.is_file():
        fail(f"manifest not found: {args.manifest}")
    try:
        data = json.loads(args.manifest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"cannot parse manifest: {error}")
    if not isinstance(data, dict):
        fail("manifest root must be an object")
    missing = REQUIRED_TOP_LEVEL - data.keys()
    if missing:
        fail(f"missing top-level fields: {sorted(missing)}")
    if data["schemaVersion"] != "1.0":
        fail(f"unsupported schemaVersion: {data['schemaVersion']!r}")
    if data["producerSkill"] != PRODUCER:
        fail(f"unexpected producerSkill: {data['producerSkill']!r}")
    consumer_policy = data["consumerPolicy"]
    if not isinstance(consumer_policy, dict):
        fail("consumerPolicy must be an object")
    if consumer_policy.get("visualInspection") != "not-required-after-validation":
        fail("consumerPolicy.visualInspection must be 'not-required-after-validation'")

    publishing_intent = data["publishingIntent"]
    if not isinstance(publishing_intent, dict):
        fail("publishingIntent must be an object")
    action = publishing_intent.get("action")
    if action not in {"publish", "draft", "images-only"}:
        fail("publishingIntent.action must be publish, draft, or images-only")
    expected_defaults = {
        "tenantSlug": "mayaodongphuc",
        "domain": "mayaodongphuc.com.vn",
        "categorySlug": "dong-phuc-tre-em",
        "pricingMode": "quote-only",
        "isPurchasable": False,
        "stockStatus": "instock",
        "currency": "VND",
    }
    for key, expected in expected_defaults.items():
        if publishing_intent.get(key) != expected:
            fail(f"publishingIntent.{key} must be {expected!r}")

    transformations = data["sourceTransformations"]
    if not isinstance(transformations, list):
        fail("sourceTransformations must be an array")

    garment = data["garmentFacts"]
    if not isinstance(garment, dict):
        fail("garmentFacts must be an object")
    missing_facts = REQUIRED_GARMENT_FACTS - garment.keys()
    if missing_facts:
        fail(f"missing garmentFacts fields: {sorted(missing_facts)}")
    for index, transformation in enumerate(transformations):
        location = f"sourceTransformations[{index}]"
        if not isinstance(transformation, dict):
            fail(f"{location} must be an object")
        for key in ("field", "from", "to", "reason"):
            if not str(transformation.get(key, "")).strip():
                fail(f"{location}.{key} is required")
        if transformation["field"] == "sleeves":
            if "tay ngắn" not in str(transformation["to"]).casefold():
                fail(f"{location}.to must normalize sleeveless inputs to tay ngắn")
            if "tay ngắn" not in str(garment.get("sleeves", "")).casefold():
                fail("garmentFacts.sleeves must describe the normalized tay ngắn output")

    feature_lock = data["featureLock"]
    if not isinstance(feature_lock, dict) or FEATURE_KEYS - feature_lock.keys():
        fail("featureLock must contain fabric, design, durability, and printing")
    for key in sorted(FEATURE_KEYS):
        feature = feature_lock[key]
        if not isinstance(feature, dict) or not str(feature.get("copy", "")).strip():
            fail(f"featureLock.{key}.copy is required")
        if feature.get("evidenceLevel") not in EVIDENCE_LEVELS:
            fail(f"featureLock.{key}.evidenceLevel is invalid")

    images = data["acceptedImages"]
    if not isinstance(images, list) or not images:
        fail("acceptedImages must be a non-empty array")
    if args.require_default_set and len(images) != 3:
        fail("default set must contain exactly main, image-2, and catalog images")

    manifest_paths: set[Path] = set()
    roles: list[str] = []
    for index, item in enumerate(images):
        location = f"acceptedImages[{index}]"
        if not isinstance(item, dict):
            fail(f"{location} must be an object")
        image_path = Path(str(item.get("path", "")))
        if not image_path.is_absolute():
            fail(f"{location}.path must be absolute")
        image_path = image_path.resolve()
        if image_path in manifest_paths:
            fail(f"duplicate accepted image: {image_path}")
        manifest_paths.add(image_path)
        if not image_path.is_file():
            fail(f"accepted image not found: {image_path}")
        expected = str(item.get("sha256", "")).lower()
        if not re.fullmatch(r"[0-9a-f]{64}", expected):
            fail(f"invalid SHA-256 for accepted image: {image_path}")
        actual = file_sha256(image_path)
        if actual != expected:
            fail(f"checksum mismatch for {image_path}: expected {expected}, got {actual}")

        role = str(item.get("role", "")).strip()
        roles.append(role)
        if role not in {"product hero", "content-inline catalog", "content-inline lifestyle"}:
            fail(f"{location}.role is unsupported: {role!r}")
        alt = required_text(item, "altSeed", location)
        caption = str(item.get("captionSeed", "")).strip()
        placement = item.get("productPlacement")
        if not isinstance(placement, dict) or placement.get("gallery") is not True:
            fail(f"{location}.productPlacement.gallery must be true")
        if placement.get("contentEmbed") is True:
            caption = required_text(item, "captionSeed", location)
            if caption.casefold() == alt.casefold():
                fail(f"{location}.captionSeed must differ from altSeed")
            if not isinstance(placement.get("contentOrder"), int):
                fail(f"{location}.productPlacement.contentOrder must be an integer")
        elif caption and INVENTORY_PREFIX.search(caption):
            fail(f"{location}.captionSeed uses inventory-style copy: {caption!r}")
        if not isinstance(item.get("visualTags"), list) or not item["visualTags"]:
            fail(f"{location}.visualTags must be a non-empty array")

    if args.require_default_set:
        if roles != ["product hero", "content-inline lifestyle", "content-inline catalog"]:
            fail("default set roles must be product hero followed by content-inline lifestyle and content-inline catalog")
        if images[0].get("aspectRatio") != "1:1":
            fail("default main aspectRatio must be 1:1")
        if images[0]["productPlacement"].get("contentEmbed") is not False:
            fail("default main must not be embedded below product copy")
        if images[1].get("aspectRatio") != "1:1":
            fail("default image-2 aspectRatio must be 1:1")
        if images[1]["productPlacement"].get("contentEmbed") is not True:
            fail("default image-2 must be embedded below product copy")
        if images[1]["productPlacement"].get("contentOrder") != 1:
            fail("default image-2 contentOrder must be 1")
        if images[2].get("aspectRatio") != "5:4":
            fail("default catalog aspectRatio must be 5:4")
        if images[2]["productPlacement"].get("contentEmbed") is not True:
            fail("default catalog must be embedded below product copy")
        if images[2]["productPlacement"].get("contentOrder") != 2:
            fail("default catalog contentOrder must be 2")

    requested_paths = {path.resolve() for path in args.image}
    missing_from_manifest = requested_paths - manifest_paths
    if missing_from_manifest:
        fail(f"input images missing from manifest: {[str(path) for path in sorted(missing_from_manifest)]}")
    if args.require_default_set and requested_paths != manifest_paths:
        fail("default validation must pass exactly the three delivered publishing images")

    print(
        f"PASS manifest={args.manifest.resolve()} producer={PRODUCER} "
        f"images={len(images)} requested={len(requested_paths)} schema=1.0"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
