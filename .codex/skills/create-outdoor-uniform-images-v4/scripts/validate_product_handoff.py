#!/usr/bin/env python3
"""Validate a product-handoff manifest and its accepted image checksums."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


REQUIRED_TOP_LEVEL = {
    "schemaVersion",
    "producerSkill",
    "sourceReferences",
    "acceptedImages",
    "garmentFacts",
    "featureLock",
    "unsupportedClaims",
    "fidelityCaveats",
}
REQUIRED_GARMENT_FACTS = {
    "productType",
    "collar",
    "sleeves",
    "colors",
    "pattern",
    "approvedArtwork",
    "visibleSides",
}
FEATURE_KEYS = {"fabric", "design", "durability", "printing"}
EVIDENCE_LEVELS = {"provided", "visible", "restrained-default"}
PRODUCER_SKILLS = {"create-outdoor-uniform-images", "create-outdoor-uniform-images-v4"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fail(message: str) -> None:
    raise SystemExit(f"ERROR {message}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--image", action="append", default=[], type=Path)
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
    if data["producerSkill"] not in PRODUCER_SKILLS:
        fail(f"unexpected producerSkill: {data['producerSkill']!r}")

    garment = data["garmentFacts"]
    if not isinstance(garment, dict):
        fail("garmentFacts must be an object")
    missing_facts = REQUIRED_GARMENT_FACTS - garment.keys()
    if missing_facts:
        fail(f"missing garmentFacts fields: {sorted(missing_facts)}")

    feature_lock = data["featureLock"]
    if not isinstance(feature_lock, dict) or FEATURE_KEYS - feature_lock.keys():
        fail("featureLock must contain fabric, design, durability, and printing")
    for key in sorted(FEATURE_KEYS):
        value = feature_lock[key]
        if not isinstance(value, dict) or not str(value.get("copy", "")).strip():
            fail(f"featureLock.{key}.copy is required")
        if value.get("evidenceLevel") not in EVIDENCE_LEVELS:
            fail(f"featureLock.{key}.evidenceLevel is invalid")

    images = data["acceptedImages"]
    if not isinstance(images, list) or not images:
        fail("acceptedImages must be a non-empty array")

    manifest_paths: set[Path] = set()
    for index, item in enumerate(images):
        if not isinstance(item, dict):
            fail(f"acceptedImages[{index}] must be an object")
        image_path = Path(str(item.get("path", "")))
        if not image_path.is_absolute():
            fail(f"acceptedImages[{index}].path must be absolute")
        image_path = image_path.resolve()
        if image_path in manifest_paths:
            fail(f"duplicate accepted image: {image_path}")
        manifest_paths.add(image_path)
        if not image_path.is_file():
            fail(f"accepted image not found: {image_path}")
        expected = str(item.get("sha256", "")).lower()
        if len(expected) != 64 or any(char not in "0123456789abcdef" for char in expected):
            fail(f"invalid SHA-256 for accepted image: {image_path}")
        actual = sha256(image_path)
        if actual != expected:
            fail(f"checksum mismatch for {image_path}: expected {expected}, got {actual}")
        if not str(item.get("role", "")).strip():
            fail(f"acceptedImages[{index}].role is required")
        if not isinstance(item.get("visualTags"), list):
            fail(f"acceptedImages[{index}].visualTags must be an array")

    requested_paths = {path.resolve() for path in args.image}
    missing_from_manifest = requested_paths - manifest_paths
    if missing_from_manifest:
        fail(f"input images missing from manifest: {[str(path) for path in sorted(missing_from_manifest)]}")

    print(
        f"PASS manifest={args.manifest.resolve()} images={len(images)} "
        f"requested={len(requested_paths)} schema=1.0"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
