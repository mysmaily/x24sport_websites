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
MOTIFS = [
    "velocity", "topographic", "orbit", "tactical-grid", "soundwave", "modular", "architectural", "energy-field",
    "classic-stripes", "brush-strokes", "marble-veins", "flame-trails", "tropical-leaf", "digital-camo",
    "retro-sport", "paint-splatter", "watercolor-flow", "heritage-sash", "sunburst", "racing-check",
    "gradient-ribbons", "micro-geometric", "ink-wave", "festival-color",
]
GEOMETRIES = [
    "diagonal-shards", "contour-bands", "radial-arcs", "split-field", "chevrons", "offset-grid",
    "wave-ribbons", "topographic-lines", "vertical-stripes", "horizontal-hoops", "quartered-blocks",
    "sash-band", "raglan-burst", "center-fade", "side-fade", "collar-radiance", "broken-grid",
    "oversized-floral-panels", "checker-accents", "painted-sweeps", "gradient-panels", "clean-color-blocks",
]
ENERGIES = ["calm-technical", "balanced-athletic", "explosive-matchday"]
FRONT_LAYOUTS = ["shoulder-led", "diagonal-chest", "lower-body-rise", "side-convergence", "offset-center", "central-split"]
BACK_LAYOUTS = ["quiet-center-side-echo", "upper-frame-clean-core", "lower-accent-clean-number-zone", "asymmetric-side-return"]
ACCENTS = ["shoulder", "side-panels", "lower-hem", "diagonal-chest", "offset-center", "sleeve-echo"]
COLLARS = ["crew-neck", "heart-neck", "folded-polo"]
COLLAR_LABELS = ["Cổ tròn", "Cổ Tim", "Cổ polo"]
GALLERY_CONTACT = {"website": "mayaobongda.vn", "hotline": "0989 353 247"}
COLOR_STRATEGIES = [
    "multi-color-gradient", "contrast-color-blocking", "light-base-bold-accent", "dark-base-bright-accent",
    "warm-cool-duotone", "triadic-pop", "retro-sport", "pastel-with-dark-anchor", "tonal-with-contrast-break",
    "white-base-color-splash", "split-complementary", "festival-mix",
]
PALETTES = [
    {"name": "deep-ocean", "colors": ["#071E3D", "#0B63CE", "#F5F8FF", "#44D7B6"]},
    {"name": "ember-night", "colors": ["#161616", "#D7263D", "#F46036", "#F7F3E8"]},
    {"name": "lime-graphite", "colors": ["#202428", "#8EDB00", "#E8F1F2", "#5C6770"]},
    {"name": "violet-electric", "colors": ["#24104F", "#6C38FF", "#16D9E3", "#F8FAFF"]},
    {"name": "forest-copper", "colors": ["#0E3B2E", "#2F7D52", "#D88345", "#F3E9D2"]},
    {"name": "ice-navy", "colors": ["#071A33", "#2C7BE5", "#BEE9F7", "#FFFFFF"]},
    {"name": "crimson-sand", "colors": ["#6B1020", "#C7354C", "#D9B382", "#FFF8EB"]},
    {"name": "teal-sun", "colors": ["#053B44", "#00A6A6", "#FFD166", "#F7FFF7"]},
    {"name": "white-carnival", "colors": ["#F8FAFC", "#111827", "#FF4D6D", "#FFD23F", "#00B4D8"]},
    {"name": "mango-aqua", "colors": ["#FFB703", "#FB5607", "#00B4D8", "#023047", "#FFFFFF"]},
    {"name": "mint-rose", "colors": ["#D8F3DC", "#52B788", "#FF6B9A", "#2B2D42", "#FFFFFF"]},
    {"name": "royal-gold", "colors": ["#102A83", "#FFD166", "#EF476F", "#F8F9FA"]},
    {"name": "retro-cream-green", "colors": ["#FFF6D6", "#1B4332", "#E76F51", "#2A9D8F", "#264653"]},
    {"name": "sky-coral", "colors": ["#E0FBFC", "#3D5A80", "#EE6C4D", "#98C1D9", "#FFFFFF"]},
    {"name": "black-rainbow-pop", "colors": ["#090A0F", "#FFFFFF", "#FF006E", "#3A86FF", "#FFBE0B"]},
    {"name": "lavender-lime", "colors": ["#E9D8FD", "#240046", "#70E000", "#00BBF9", "#FFFFFF"]},
    {"name": "ruby-mint", "colors": ["#8A1538", "#FF477E", "#06D6A0", "#F7FFF7", "#1B1B1E"]},
    {"name": "pearl-orange-blue", "colors": ["#F7F7FF", "#FF8500", "#006D77", "#83C5BE", "#111827"]},
]
DEFAULT_NAME_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-product-names.json"
DEFAULT_SALES_STYLE_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-sales-styles.json"
DEFAULT_SALES_COMPOSITION_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-sales-compositions.json"
DEFAULT_FEATURE_BADGE_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-sales-feature-badges.json"
DEFAULT_LOGO_SOURCE_LIBRARY = Path(__file__).resolve().parent.parent / "assets" / "football-logo-sources.json"
DEFAULT_LOGO_REFERENCE_DIR = Path(__file__).resolve().parent.parent / "assets" / "logo-references"
LOGO_DARK_PREFIX = "logo-dark-"
LOGO_WHITE_PREFIX = "logo-white-"
LOGO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
TEAM_PHOTO_FORMATIONS = [
    {"id": "single-row-five", "playerCount": 5, "promptNotes": "Use one compact standing row of five Vietnamese amateur football players, shoulder-to-shoulder, all jersey fronts readable."},
    {"id": "single-row-six", "playerCount": 6, "promptNotes": "Use one standing row of six Vietnamese amateur football players, slightly arced toward camera, all jersey fronts readable."},
    {"id": "two-row-seven", "playerCount": 7, "promptNotes": "Use a two-row team-photo formation: four standing behind, three crouching or kneeling in front."},
    {"id": "two-row-eight", "playerCount": 8, "promptNotes": "Use a two-row team-photo formation: five standing behind, three crouching or kneeling in front."},
    {"id": "two-row-nine", "playerCount": 9, "promptNotes": "Use a balanced two-row team-photo formation: five standing behind, four crouching or kneeling in front."},
    {"id": "two-row-ten", "playerCount": 10, "promptNotes": "Use a balanced two-row team-photo formation: six standing behind, four crouching or kneeling in front."},
    {"id": "two-row-eleven", "playerCount": 11, "promptNotes": "Use a classic full team-photo formation: six standing behind, five crouching or kneeling in front."},
]


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


def load_feature_badge_library(path: Path) -> list[dict[str, object]]:
    try:
        rows = json.loads(path.expanduser().resolve().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SystemExit(f"Could not read feature-badge library: {error}") from error
    if not isinstance(rows, list) or len(rows) < 4:
        raise SystemExit("Feature-badge library must contain at least 4 entries")
    ids: set[str] = set()
    result: list[dict[str, object]] = []
    for row in rows:
        if not isinstance(row, dict):
            raise SystemExit("Each feature-badge entry must be an object")
        badge_id = row.get("id")
        label = row.get("label")
        if not isinstance(badge_id, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", badge_id):
            raise SystemExit("Each feature-badge id must be lowercase kebab-case")
        if not isinstance(label, str) or not label.strip():
            raise SystemExit("Each feature-badge entry needs a nonblank label")
        if badge_id in ids:
            raise SystemExit("Feature-badge library contains duplicate ids")
        ids.add(badge_id)
        result.append(row)
    return result


def logo_id_from_path(path: Path) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-")
    return normalized or "logo-reference"


def display_name_from_path(path: Path) -> str:
    return " ".join(part.capitalize() for part in re.split(r"[-_]+", path.stem) if part) or path.name


def relative_or_absolute(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def load_logo_metadata(path: Path) -> dict[str, dict[str, object]]:
    try:
        rows = json.loads(path.expanduser().resolve().read_text(encoding="utf-8"))
    except OSError:
        return {}
    except json.JSONDecodeError as error:
        raise SystemExit(f"Could not read logo-source library: {error}") from error
    if not isinstance(rows, list):
        raise SystemExit("Logo-source library must be a list")
    metadata: dict[str, dict[str, object]] = {}
    for row in rows:
        if not isinstance(row, dict):
            raise SystemExit("Each logo-source entry must be an object")
        logo_id = row.get("id")
        name = row.get("name")
        path_value = row.get("path")
        prompt_notes = row.get("promptNotes")
        if not isinstance(logo_id, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", logo_id):
            raise SystemExit("Each logo-source id must be lowercase kebab-case")
        if not isinstance(name, str) or not name.strip():
            raise SystemExit("Each logo-source entry needs a nonblank name")
        if not isinstance(path_value, str) or not path_value.startswith("assets/logo-references/"):
            raise SystemExit("Each logo-source entry needs a local assets/logo-references path")
        if not isinstance(prompt_notes, str) or not prompt_notes.strip():
            raise SystemExit("Each logo-source entry needs nonblank promptNotes")
        if path_value in metadata:
            raise SystemExit("Logo-source library contains duplicate ids")
        metadata[path_value] = row
    return metadata


def load_logo_source_library(path: Path, reference_dir: Path) -> list[dict[str, object]]:
    skill_root = Path(__file__).resolve().parent.parent
    logo_dir = reference_dir.expanduser().resolve()
    if not logo_dir.is_dir():
        raise SystemExit(f"Logo reference directory does not exist: {logo_dir}")
    metadata = load_logo_metadata(path)
    image_paths = sorted(candidate for candidate in logo_dir.iterdir() if candidate.suffix.lower() in LOGO_EXTENSIONS)
    contrast_paths = [
        candidate
        for candidate in image_paths
        if candidate.name.startswith(LOGO_DARK_PREFIX) or candidate.name.startswith(LOGO_WHITE_PREFIX)
    ]
    candidate_paths = contrast_paths or image_paths
    ids: set[str] = set()
    result: list[dict[str, object]] = []
    for logo_path in candidate_paths:
        relative_path = relative_or_absolute(logo_path.resolve(), skill_root)
        row = dict(metadata.get(relative_path, {}))
        row.setdefault("id", logo_id_from_path(logo_path))
        row.setdefault("name", display_name_from_path(logo_path))
        row.setdefault("path", relative_path)
        row.setdefault("absolutePath", str(logo_path.resolve()))
        row.setdefault("usage", "exact local chest badge reference for sales and team images only")
        row.setdefault("placement", "left chest or upper chest on the worn front jersey and front product view")
        if logo_path.name.startswith(LOGO_DARK_PREFIX):
            row.setdefault("logoTone", "dark")
            row.setdefault("contrastRole", "use on light or bright chest zones")
            row.setdefault("preferredFor", ["light-chest-zone", "bright-kits", "white-kits"])
            row.setdefault(
                "promptNotes",
                "Use this dark logo variant only on light or bright chest zones so the crest remains readable. Keep it small, integrated on fabric, and out of the print masters.",
            )
        elif logo_path.name.startswith(LOGO_WHITE_PREFIX):
            row.setdefault("logoTone", "white")
            row.setdefault("contrastRole", "use on dark or saturated chest zones")
            row.setdefault("preferredFor", ["dark-chest-zone", "saturated-kits", "black-kits"])
            row.setdefault(
                "promptNotes",
                "Use this white logo variant only on dark or saturated chest zones so the crest remains readable. Keep it small, integrated on fabric, and out of the print masters.",
            )
        else:
            row.setdefault("logoTone", "generic")
            row.setdefault("contrastRole", "use only when no dark/white contrast pool is available")
            row.setdefault("preferredFor", ["general-football"])
            row.setdefault(
                "promptNotes",
                "Use this local sample as a small fictional customer crest on the chest. Keep it subordinate to the jersey design, integrated on fabric, and out of the print masters.",
            )
        logo_id = row["id"]
        if not isinstance(logo_id, str) or logo_id in ids:
            raise SystemExit("Logo-source library contains duplicate ids")
        ids.add(logo_id)
        result.append(row)
    if not result:
        raise SystemExit("Logo reference directory must contain at least 1 image")
    return result


def choose_sales_style(sku: str, library: list[dict[str, object]]) -> dict[str, object]:
    return library[index(sku.encode("ascii"), "sales-style", len(library))]


def choose_sales_composition(sku: str, library: list[dict[str, object]]) -> dict[str, object]:
    return library[index(sku.encode("ascii"), "sales-composition", len(library))]


def choose_team_photo(sku: str) -> dict[str, object]:
    return TEAM_PHOTO_FORMATIONS[index(sku.encode("ascii"), "team-photo", len(TEAM_PHOTO_FORMATIONS))]


def hex_luminance(value: str) -> float:
    match = re.fullmatch(r"#?([0-9a-fA-F]{6})", value.strip())
    if not match:
        return 0.5
    raw = match.group(1)
    rgb = [int(raw[channel:channel + 2], 16) / 255 for channel in (0, 2, 4)]
    linear = [
        component / 12.92 if component <= 0.04045 else ((component + 0.055) / 1.055) ** 2.4
        for component in rgb
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def estimate_chest_zone_from_palette(palette: object) -> str:
    if not isinstance(palette, dict):
        return "unknown"
    colors = palette.get("colors")
    if not isinstance(colors, list) or not colors or not isinstance(colors[0], str):
        return "unknown"
    return "dark" if hex_luminance(colors[0]) < 0.38 else "light"


def choose_logo_source(sku: str, library: list[dict[str, object]], chest_zone: str = "unknown") -> dict[str, object]:
    if chest_zone == "dark":
        preferred = [row for row in library if row.get("logoTone") == "white"]
    elif chest_zone == "light":
        preferred = [row for row in library if row.get("logoTone") == "dark"]
    else:
        preferred = []
    candidates = preferred or library
    return candidates[index(sku.encode("ascii"), f"logo-source-{chest_zone}", len(candidates))]


def make_direction(
    sku: str,
    offset: int,
    sales_style_library: list[dict[str, object]],
    sales_composition_library: list[dict[str, object]],
    feature_badge_library: list[dict[str, object]],
    logo_source_library: list[dict[str, object]],
) -> dict[str, object]:
    seed = sku.encode("ascii")
    sales_style = choose_sales_style(sku, sales_style_library)
    sales_composition = choose_sales_composition(sku, sales_composition_library)
    palette = PALETTES[index(seed, "palette", len(PALETTES), offset)]
    estimated_chest_zone = estimate_chest_zone_from_palette(palette)
    direction: dict[str, object] = {
        "sku": sku,
        "motifFamily": MOTIFS[index(seed, "motif", len(MOTIFS), offset)],
        "geometry": GEOMETRIES[index(seed, "geometry", len(GEOMETRIES), offset)],
        "energy": ENERGIES[index(seed, "energy", len(ENERGIES), offset)],
        "frontLayout": FRONT_LAYOUTS[index(seed, "front", len(FRONT_LAYOUTS), offset)],
        "backLayout": BACK_LAYOUTS[index(seed, "back", len(BACK_LAYOUTS), offset)],
        "accentPlacement": ACCENTS[index(seed, "accent", len(ACCENTS), offset)],
        "collar": COLLARS[index(seed, "collar", len(COLLARS), offset)],
        "colorStrategy": COLOR_STRATEGIES[index(seed, "color-strategy", len(COLOR_STRATEGIES), offset)],
        "palette": palette,
        "salesStyle": sales_style,
        "salesComposition": sales_composition,
        "teamPhoto": choose_team_photo(sku),
        "logoSource": choose_logo_source(sku, logo_source_library, estimated_chest_zone),
        "logoContrastPolicy": {
            "estimatedChestZone": estimated_chest_zone,
            "darkChestUse": "logo-white-*",
            "lightChestUse": "logo-dark-*",
            "selection": "stable random within the contrast-correct group",
            "promptNotes": "Before writing design-spec.json, confirm the actual front chest zone. Use a logo-white-* file on dark/saturated chest zones and a logo-dark-* file on light/bright chest zones. If the final chest zone differs from the palette estimate, switch logoSource to a stable file from the correct group.",
        },
        "featureBadges": feature_badge_library,
        "salesHardConstraints": {
            "collarLabels": COLLAR_LABELS,
            "collarCount": 3,
            "additionalCollarVariantsAllowed": False,
            "galleryContact": GALLERY_CONTACT,
            "galleryContactRequiredOn": ["sales"],
            "promptNotes": "Keep commercial copy minimal. Render mayaobongda.vn and 0989 353 247 clearly on the sales image.",
        },
        "creativeGuardrail": "Do not default to a Tron/neon one-tone look. Use the selected motif, geometry, colorStrategy and palette to create varied football kit language with clear base, contrast and accent roles.",
        "edgeContinuity": "edge-coherent side bands; confirm exact seam alignment only on factory pattern",
    }
    palette = direction["palette"]
    palette_name = palette["name"] if isinstance(palette, dict) else str(palette)
    direction["uniquenessSignature"] = "|".join([
        str(direction["motifFamily"]), str(direction["geometry"]), str(direction["energy"]),
        str(direction["frontLayout"]), str(direction["backLayout"]),
        str(direction["accentPlacement"]), str(direction["colorStrategy"]), str(palette_name), str(direction["collar"]),
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
    parser.add_argument("--feature-badge-library", type=Path, default=DEFAULT_FEATURE_BADGE_LIBRARY)
    parser.add_argument("--logo-source-library", type=Path, default=DEFAULT_LOGO_SOURCE_LIBRARY)
    parser.add_argument("--logo-reference-dir", type=Path, default=DEFAULT_LOGO_REFERENCE_DIR)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-FFHHDD")
    name_library = load_name_library(args.name_library)
    sales_style_library = load_sales_style_library(args.sales_style_library)
    sales_composition_library = load_sales_composition_library(args.sales_composition_library)
    feature_badge_library = load_feature_badge_library(args.feature_badge_library)
    logo_source_library = load_logo_source_library(args.logo_source_library, args.logo_reference_dir)
    if not args.registry:
        direction = make_direction(args.sku, 0, sales_style_library, sales_composition_library, feature_badge_library, logo_source_library)
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
                if not row.get("teamPhoto"):
                    row["teamPhoto"] = choose_team_photo(args.sku)
                palette = row.get("palette")
                chest_zone = estimate_chest_zone_from_palette(palette)
                logo_source = row.get("logoSource")
                logo_by_path = {item.get("path"): item for item in logo_source_library}
                if not isinstance(logo_source, dict) or logo_source.get("path") not in logo_by_path:
                    row["logoSource"] = choose_logo_source(args.sku, logo_source_library, chest_zone)
                else:
                    # Upgrade older registry rows so imagegen always receives a
                    # concrete local file, not only prompt metadata.
                    row["logoSource"] = dict(logo_by_path[logo_source.get("path")])
                if not row.get("logoContrastPolicy"):
                    row["logoContrastPolicy"] = {
                        "estimatedChestZone": chest_zone,
                        "darkChestUse": "logo-white-*",
                        "lightChestUse": "logo-dark-*",
                        "selection": "stable random within the contrast-correct group",
                        "promptNotes": "Before writing design-spec.json, confirm the actual front chest zone. Use a logo-white-* file on dark/saturated chest zones and a logo-dark-* file on light/bright chest zones. If the final chest zone differs from the palette estimate, switch logoSource to a stable file from the correct group.",
                    }
                row["salesHardConstraints"] = {
                    "collarLabels": COLLAR_LABELS,
                    "collarCount": 3,
                    "additionalCollarVariantsAllowed": False,
                    "galleryContact": GALLERY_CONTACT,
                    "galleryContactRequiredOn": ["sales"],
                    "promptNotes": "Keep commercial copy minimal. Render mayaobongda.vn and 0989 353 247 clearly on the sales image.",
                }
                if not row.get("featureBadges"):
                    row["featureBadges"] = feature_badge_library
                if not row.get("colorStrategy"):
                    row["colorStrategy"] = COLOR_STRATEGIES[index(args.sku.encode("ascii"), "color-strategy", len(COLOR_STRATEGIES))]
                if not row.get("creativeGuardrail"):
                    row["creativeGuardrail"] = "Do not default to a Tron/neon one-tone look. Use the selected motif, geometry, colorStrategy and palette to create varied football kit language with clear base, contrast and accent roles."
                print(json.dumps(row, ensure_ascii=False, indent=2))
                return
        used = {row.get("uniquenessSignature") for row in rows}
        direction = None
        for offset in range(10_000):
            candidate = make_direction(args.sku, offset, sales_style_library, sales_composition_library, feature_badge_library, logo_source_library)
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
