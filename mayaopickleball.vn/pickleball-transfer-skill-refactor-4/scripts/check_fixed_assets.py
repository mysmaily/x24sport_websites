#!/usr/bin/env python3
"""Check fixed non-secret assets/constants for pickleball transfer skill.

This script is intentionally profile-free. SKILL.md is the source of truth.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOGO_SVG = ROOT / "image-references" / "logo.svg"
LOGO_PNG = ROOT / "image-references" / "logo.png"
CONTACT = "mayaopickleball.vn | Hotline/Zalo: 0989.353.247"
DOTS = ["Trắng", "Đen", "Hồng", "Đỏ", "Vàng", "Xanh Blue", "Green", "+"]


def main() -> int:
    errors: list[str] = []

    if not LOGO_SVG.exists() and not LOGO_PNG.exists():
        errors.append(f"official logo missing: expected {LOGO_SVG} or {LOGO_PNG}")

    if CONTACT != "mayaopickleball.vn | Hotline/Zalo: 0989.353.247":
        errors.append("contact overlay text was changed without updating the skill")

    if DOTS != ["Trắng", "Đen", "Hồng", "Đỏ", "Vàng", "Xanh Blue", "Green", "+"]:
        errors.append("color dots do not match required fixed values")

    if errors:
        print("Fixed asset preflight FAILED:", file=sys.stderr)
        for e in errors:
            print("  - " + e, file=sys.stderr)
        print("Plain text X24 watermark fallback is forbidden.", file=sys.stderr)
        return 1

    source = "svg" if LOGO_SVG.exists() else "png"
    print(f"Fixed assets OK: logo_source={source} contact=present color_dots=present")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
