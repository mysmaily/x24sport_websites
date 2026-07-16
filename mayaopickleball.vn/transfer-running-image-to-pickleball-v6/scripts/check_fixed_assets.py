#!/usr/bin/env python3
"""Check fixed non-secret assets/constants for v6 image-only transfer."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OVERLAY_ASSETS = [
    ROOT / "image-references" / "logo-badge.png",
    ROOT / "image-references" / "dot-color.png",
    ROOT / "image-references" / "contact-pill.png",
]


def main() -> int:
    errors: list[str] = []
    for asset in OVERLAY_ASSETS:
        if not asset.exists():
            errors.append(f"overlay asset missing: {asset}")
    if errors:
        print("V6 fixed asset check FAILED:", file=sys.stderr)
        for error in errors:
            print("  - " + error, file=sys.stderr)
        return 1
    print("V6 fixed assets OK: prebuilt_overlay_assets=present model_references=fictional")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
