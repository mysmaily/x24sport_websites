#!/usr/bin/env python3
"""Validate runtime env for the pickleball transfer skill without leaking secrets.

This script checks that required variables exist and prints redacted fingerprints only.
It does not perform network requests; use the runner's canary phase for REST auth checks.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path
from typing import Dict, Iterable, Tuple

ALIASES = {
    "WORDPRESS_APPLICATION_PASSWORD": ["WORDPRESS_APPLICATION_PASSWORD", "APPLICATION_PASSWORD"],
    "WOOCOMMERCE_CONSUMER_KEY": ["WOOCOMMERCE_CONSUMER_KEY", "WooCommerce_KEY", "WOOCOMMERCE_KEY"],
    "WOOCOMMERCE_CONSUMER_SECRET": ["WOOCOMMERCE_CONSUMER_SECRET", "WooCommerce_KEY_SECRET", "WOOCOMMERCE_KEY_SECRET"],
    "WORDPRESS_USERNAME": ["WORDPRESS_USERNAME"],
    "WORDPRESS_BASE_URL": ["WORDPRESS_BASE_URL"],
}

REQUIRED_DESTINATION = [
    "WORDPRESS_BASE_URL",
    "WORDPRESS_USERNAME",
    "WORDPRESS_APPLICATION_PASSWORD",
    "WOOCOMMERCE_CONSUMER_KEY",
    "WOOCOMMERCE_CONSUMER_SECRET",
]


def parse_env_file(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value
    return values


def get_value(values: Dict[str, str], canonical: str) -> Tuple[str | None, str | None]:
    for name in ALIASES.get(canonical, [canonical]):
        value = values.get(name) or os.environ.get(name)
        if value:
            return value, name
    return None, None


def redact(value: str) -> str:
    if len(value) <= 4:
        return "present:****"
    if value.startswith(("ck_", "cs_")) and len(value) > 12:
        return f"present:{value[:3]}...{value[-4:]}"
    if re.match(r"https?://", value):
        return value
    return f"present:****{value[-4:]}"


def validate_url(value: str) -> bool:
    return value.startswith("https://") and "mayaopickleball.vn" in value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", default=".runtime/wordpress-api.env")
    parser.add_argument("--target", default="destination", choices=["destination"])
    args = parser.parse_args()

    env_path = Path(args.env_file)
    values = parse_env_file(env_path)

    missing = []
    resolved = {}
    source_names = {}
    for key in REQUIRED_DESTINATION:
        value, source_name = get_value(values, key)
        if not value:
            missing.append(key)
        else:
            resolved[key] = value
            source_names[key] = source_name

    if missing:
        print("Missing required runtime variables:")
        for key in missing:
            print(f"- {key}")
        print("\nCreate .runtime/wordpress-api.env from .env.example, or export the variables in the shell.")
        return 1

    if not validate_url(resolved["WORDPRESS_BASE_URL"]):
        print("WORDPRESS_BASE_URL must be an https://mayaopickleball.vn URL for this destination skill.")
        return 1

    print("Runtime env check passed. Redacted config:")
    for key in REQUIRED_DESTINATION:
        alias_note = "" if source_names[key] == key else f" via {source_names[key]}"
        print(f"- {key}{alias_note}: {redact(resolved[key])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
