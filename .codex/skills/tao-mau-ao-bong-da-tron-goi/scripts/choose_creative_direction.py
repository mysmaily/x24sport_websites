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


SKU_RE = re.compile(r"^X24-BD-[0-9]{2}(?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$")
MOTIFS = ["velocity", "topographic", "orbit", "tactical-grid", "soundwave", "modular", "architectural", "energy-field"]
GEOMETRIES = ["diagonal-shards", "contour-bands", "radial-arcs", "split-field", "chevrons", "offset-grid", "wave-ribbons", "topographic-lines"]
ENERGIES = ["calm-technical", "balanced-athletic", "explosive-matchday"]
FRONT_LAYOUTS = ["shoulder-led", "diagonal-chest", "lower-body-rise", "side-convergence", "offset-center", "central-split"]
BACK_LAYOUTS = ["quiet-center-side-echo", "upper-frame-clean-core", "lower-accent-clean-number-zone", "asymmetric-side-return"]
ACCENTS = ["shoulder", "side-panels", "lower-hem", "diagonal-chest", "offset-center", "sleeve-echo"]
COLLARS = ["crew-neck", "heart-neck", "folded-polo"]
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
DEFAULT_NAME_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-product-names.json"
DEFAULT_SALES_STYLE_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-sales-styles.json"
DEFAULT_SALES_COMPOSITION_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-sales-compositions.json"


def index(seed: bytes, label: str, size: int, offset: int = 0) -> int:
    digest = hashlib.sha256(seed + label.encode("utf-8") + str(offset).encode("ascii")).digest()
    return int.from_bytes(digest[:8], "big") % size


def load_sales_style_library(path: Path) -> list[dict[str, object]]:
    try:
        rows = json.loads(path.expanduser().resolve().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SystemExit(f"Could not read sales-style library: {error}") from error
    if not isinstance(rows, list) or len(rows) != 5:
        raise SystemExit("Sales-style library must contain exactly 5 entries")
    ids: set[str] = set()
    result: list[dict[str, object]] = []
    for row in rows:
        if not isinstance(row, dict):
            raise SystemExit("Each sales-style entry must be an object")
        style_id = row.get("id")
        name = row.get("name")
        prompt_notes = row.get("promptNotes")
        if not isinstance(style_id, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", style_id):
            raise SystemExit("Each sales-style id must be lowercase kebab-case")
        if not isinstance(name, str) or not name.strip():
            raise SystemExit("Each sales-style entry needs a nonblank name")
        if not isinstance(prompt_notes, str) or not prompt_notes.strip():
            raise SystemExit("Each sales-style entry needs nonblank promptNotes")
        if style_id in ids:
            raise SystemExit("Sales-style library contains duplicate ids")
        ids.add(style_id)
        result.append(row)
    return result


def load_sales_composition_library(path: Path) -> list[dict[str, object]]:
    try:
        rows = json.loads(path.expanduser().resolve().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SystemExit(f"Could not read sales-composition library: {error}") from error
    if not isinstance(rows, list) or len(rows) != 5:
        raise SystemExit("Sales-composition library must contain exactly 5 entries")
    ids: set[str] = set()
    result: list[dict[str, object]] = []
    for row in rows:
        if not isinstance(row, dict):
            raise SystemExit("Each sales-composition entry must be an object")
        composition_id = row.get("id")
        name = row.get("name")
        prompt_notes = row.get("promptNotes")
        if not isinstance(composition_id, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", composition_id):
            raise SystemExit("Each sales-composition id must be lowercase kebab-case")
        if not isinstance(name, str) or not name.strip():
            raise SystemExit("Each sales-composition entry needs a nonblank name")
        if not isinstance(prompt_notes, str) or not prompt_notes.strip():
            raise SystemExit("Each sales-composition entry needs nonblank promptNotes")
        if composition_id in ids:
            raise SystemExit("Sales-composition library contains duplicate ids")
        ids.add(composition_id)
        result.append(row)
    return result


def choose_sales_style(sku: str, library: list[dict[str, object]]) -> dict[str, object]:
    return library[index(sku.encode("ascii"), "sales-style", len(library))]


def choose_sales_composition(sku: str, library: list[dict[str, object]]) -> dict[str, object]:
    return library[index(sku.encode("ascii"), "sales-composition", len(library))]


def make_direction(
    sku: str,
    offset: int,
    sales_style_library: list[dict[str, object]],
    sales_composition_library: list[dict[str, object]],
) -> dict[str, object]:
    seed = sku.encode("ascii")
    sales_style = choose_sales_style(sku, sales_style_library)
    sales_composition = choose_sales_composition(sku, sales_composition_library)
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
        "salesStyle": sales_style,
        "salesComposition": sales_composition,
        "edgeContinuity": "edge-coherent side bands; confirm exact seam alignment only on factory pattern",
    }
    palette = direction["palette"]
    palette_name = palette["name"] if isinstance(palette, dict) else str(palette)
    direction["uniquenessSignature"] = "|".join([
        str(direction["motifFamily"]), str(direction["geometry"]), str(direction["energy"]),
        str(direction["frontLayout"]), str(direction["backLayout"]),
        str(direction["accentPlacement"]), str(palette_name), str(direction["collar"]),
        str(sales_style["id"]), str(sales_composition["id"]),
    ])
    return direction


def load_name_library(path: Path) -> list[dict[str, str]]:
    try:
        rows = json.loads(path.expanduser().resolve().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SystemExit(f"Could not read product-name library: {error}") from error
    if not isinstance(rows, list) or len(rows) != 40:
        raise SystemExit("Product-name library must contain exactly 40 entries")
    names: set[str] = set()
    slugs: set[str] = set()
    result: list[dict[str, str]] = []
    for row in rows:
        if not isinstance(row, dict):
            raise SystemExit("Each product-name entry must be an object")
        name = row.get("name")
        slug = row.get("slug")
        if not isinstance(name, str) or not name.strip() or len(name.split()) > 2:
            raise SystemExit("Each product name must contain one or two English words")
        if not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            raise SystemExit("Each product-name slug must be lowercase kebab-case")
        if name in names or slug in slugs:
            raise SystemExit("Product-name library contains duplicates")
        names.add(name)
        slugs.add(slug)
        result.append({"name": name, "slug": slug})
    return result


def choose_product_name(
    sku: str,
    registry_rows: list[dict[str, object]],
    library: list[dict[str, str]],
) -> dict[str, str]:
    usage = {row["name"]: 0 for row in library}
    for row in registry_rows:
        name = row.get("productName")
        if isinstance(name, str) and name in usage:
            usage[name] += 1
    minimum = min(usage.values())
    available = [row for row in library if usage[row["name"]] == minimum]
    return available[index(sku.encode("ascii"), "product-name", len(available))]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--registry", type=Path)
    parser.add_argument("--name-library", type=Path, default=DEFAULT_NAME_LIBRARY)
    parser.add_argument("--sales-style-library", type=Path, default=DEFAULT_SALES_STYLE_LIBRARY)
    parser.add_argument("--sales-composition-library", type=Path, default=DEFAULT_SALES_COMPOSITION_LIBRARY)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-FFHHDD")
    name_library = load_name_library(args.name_library)
    sales_style_library = load_sales_style_library(args.sales_style_library)
    sales_composition_library = load_sales_composition_library(args.sales_composition_library)
    if not args.registry:
        direction = make_direction(args.sku, 0, sales_style_library, sales_composition_library)
        selected_name = choose_product_name(args.sku, [], name_library)
        direction["productName"] = selected_name["name"]
        direction["productSlug"] = selected_name["slug"]
        print(json.dumps(direction, ensure_ascii=False, indent=2))
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
                if not row.get("productName"):
                    # Legacy rows without a stored name still need stable retry
                    # behavior even as later registry usage counts change.
                    selected_name = choose_product_name(args.sku, [], name_library)
                    row["productName"] = selected_name["name"]
                    row["productSlug"] = selected_name["slug"]
                if not row.get("salesStyle"):
                    row["salesStyle"] = choose_sales_style(args.sku, sales_style_library)
                if not row.get("salesComposition"):
                    row["salesComposition"] = choose_sales_composition(args.sku, sales_composition_library)
                print(json.dumps(row, ensure_ascii=False, indent=2))
                return
        used = {row.get("uniquenessSignature") for row in rows}
        direction = None
        for offset in range(10_000):
            candidate = make_direction(args.sku, offset, sales_style_library, sales_composition_library)
            if candidate["uniquenessSignature"] not in used:
                direction = candidate
                break
        if direction is None:
            raise SystemExit("Could not find an unused creative signature")
        selected_name = choose_product_name(args.sku, rows, name_library)
        direction["productName"] = selected_name["name"]
        direction["productSlug"] = selected_name["slug"]
        handle.seek(0, os.SEEK_END)
        handle.write(json.dumps(direction, ensure_ascii=False) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
        print(json.dumps(direction, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
