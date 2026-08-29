#!/usr/bin/env python3
"""Choose and optionally reserve a stable creative direction for an X24-BD SKU."""

from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import os
import re
from pathlib import Path


SKU_RE = re.compile(r"^X24-BD-[0-9]{6}$")
MOTIFS = ["velocity", "topographic", "orbit", "tactical-grid", "soundwave", "modular", "architectural", "energy-field"]
GEOMETRIES = ["diagonal-shards", "contour-bands", "radial-arcs", "split-field", "chevrons", "offset-grid", "wave-ribbons", "topographic-lines"]
ENERGIES = ["calm-technical", "balanced-athletic", "explosive-matchday"]
FRONT_LAYOUTS = ["shoulder-led", "diagonal-chest", "lower-body-rise", "side-convergence", "offset-center", "central-split"]
BACK_LAYOUTS = ["quiet-center-side-echo", "upper-frame-clean-core", "lower-accent-clean-number-zone", "asymmetric-side-return"]
ACCENTS = ["shoulder", "side-panels", "lower-hem", "diagonal-chest", "offset-center", "sleeve-echo"]
COLLARS = ["crew-neck", "v-neck", "folded-polo"]
PALETTES = [
    {"name": "deep-ocean", "colors": ["#071E3D", "#0B63CE", "#F5F8FF", "#44D7B6"]},
    {"name": "ember-night", "colors": ["#161616", "#D7263D", "#F46036", "#F7F3E8"]},
    {"name": "lime-graphite", "colors": ["#202428", "#8EDB00", "#E8F1F2", "#5C6770"]},
    {"name": "violet-electric", "colors": ["#24104F", "#6C38FF", "#16D9E3", "#F8FAFF"]},
    {"name": "forest-copper", "colors": ["#0E3B2E", "#2F7D52", "#D88345", "#F3E9D2"]},
    {"name": "ice-navy", "colors": ["#071A33", "#2C7BE5", "#BEE9F7", "#FFFFFF"]},
    {"name": "crimson-sand", "colors": ["#6B1020", "#C7354C", "#D9B382", "#FFF8EB"]},
    {"name": "teal-sun", "colors": ["#053B44", "#00A6A6", "#FFD166", "#F7FFF7"]},
]


def index(seed: bytes, label: str, size: int, offset: int = 0) -> int:
    digest = hashlib.sha256(seed + label.encode("utf-8") + str(offset).encode("ascii")).digest()
    return int.from_bytes(digest[:8], "big") % size


def make_direction(sku: str, offset: int) -> dict[str, object]:
    seed = sku.encode("ascii")
    direction: dict[str, object] = {
        "sku": sku,
        "motifFamily": MOTIFS[index(seed, "motif", len(MOTIFS), offset)],
        "geometry": GEOMETRIES[index(seed, "geometry", len(GEOMETRIES), offset)],
        "energy": ENERGIES[index(seed, "energy", len(ENERGIES), offset)],
        "frontLayout": FRONT_LAYOUTS[index(seed, "front", len(FRONT_LAYOUTS), offset)],
        "backLayout": BACK_LAYOUTS[index(seed, "back", len(BACK_LAYOUTS), offset)],
        "accentPlacement": ACCENTS[index(seed, "accent", len(ACCENTS), offset)],
        "collar": COLLARS[index(seed, "collar", len(COLLARS), offset)],
        "palette": PALETTES[index(seed, "palette", len(PALETTES), offset)],
        "edgeContinuity": "edge-coherent side bands; confirm exact seam alignment only on factory pattern",
    }
    palette = direction["palette"]
    palette_name = palette["name"] if isinstance(palette, dict) else str(palette)
    direction["uniquenessSignature"] = "|".join([
        str(direction["motifFamily"]), str(direction["geometry"]), str(direction["energy"]),
        str(direction["frontLayout"]), str(direction["backLayout"]),
        str(direction["accentPlacement"]), str(palette_name), str(direction["collar"]),
    ])
    return direction


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--registry", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-NNNNNN")
    if not args.registry:
        print(json.dumps(make_direction(args.sku, 0), ensure_ascii=False, indent=2))
        return

    registry = args.registry.expanduser().resolve()
    registry.parent.mkdir(parents=True, exist_ok=True)
    with registry.open("a+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        handle.seek(0)
        rows = []
        for line in handle:
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        for row in rows:
            if row.get("sku") == args.sku and row.get("uniquenessSignature"):
                print(json.dumps(row, ensure_ascii=False, indent=2))
                return
        used = {row.get("uniquenessSignature") for row in rows}
        direction = None
        for offset in range(10_000):
            candidate = make_direction(args.sku, offset)
            if candidate["uniquenessSignature"] not in used:
                direction = candidate
                break
        if direction is None:
            raise SystemExit("Could not find an unused creative signature")
        handle.seek(0, os.SEEK_END)
        handle.write(json.dumps(direction, ensure_ascii=False) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
        print(json.dumps(direction, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
