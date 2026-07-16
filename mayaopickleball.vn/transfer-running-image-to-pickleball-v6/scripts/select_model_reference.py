#!/usr/bin/env python3
"""Select a model face reference from the local skill pool."""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFERENCE_ROOT = ROOT / "model-references"
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def references_for(gender: str) -> list[Path]:
    folder = REFERENCE_ROOT / gender
    if not folder.exists():
        return []
    return sorted(path for path in folder.iterdir() if path.is_file() and path.suffix.lower() in EXTENSIONS)


def rng_for(seed: str | None) -> random.Random:
    if not seed:
        return random.Random()
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return random.Random(int(digest[:16], 16))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gender", choices=["female", "male"], default="female")
    parser.add_argument("--seed", help="Stable seed such as wave id, product id, or product code")
    parser.add_argument("--list", action="store_true", help="List available references for the gender")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON")
    args = parser.parse_args()

    refs = references_for(args.gender)
    if args.list:
        for ref in refs:
            print(ref)
        return 0

    if not refs:
        message = f"no {args.gender} model references found in {REFERENCE_ROOT / args.gender}"
        if args.json:
            print(json.dumps({"gender": args.gender, "selected": None, "available": 0, "error": message}))
        else:
            print(message, file=sys.stderr)
        return 1

    selected = rng_for(args.seed).choice(refs)
    if args.json:
        print(json.dumps({"gender": args.gender, "selected": str(selected), "available": len(refs)}, ensure_ascii=False))
    else:
        print(selected)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
