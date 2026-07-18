#!/usr/bin/env python3
"""Point a copied wp-config.php at the isolated archive database and host."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


DB_KEYS = {
    "DB_NAME": "name",
    "DB_USER": "user",
    "DB_PASSWORD": "password",
    "DB_HOST": "host",
}

BOOTSTRAP = """$mayaobongroArchiveDb = require '/etc/mayaobongro-wp/db.php';
"""

HOST_CONFIG = """// Archive host settings are deliberately separate from the production URL.
$mayaobongroArchiveHost = strtolower(preg_replace('/:\\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$mayaobongroArchiveOrigin = $mayaobongroArchiveHost === 'wp.mayaobongro.vn'
    ? 'https://wp.mayaobongro.vn'
    : 'https://mayaobongro.vn';
define('WP_HOME', $mayaobongroArchiveOrigin);
define('WP_SITEURL', $mayaobongroArchiveOrigin);
define('FORCE_SSL_ADMIN', true);
define('WP_ENVIRONMENT_TYPE', 'production');
"""


def configure(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if "mayaobongroArchiveDb" not in text:
        text = text.replace("<?php\n", "<?php\n" + BOOTSTRAP, 1)

    for constant, key in DB_KEYS.items():
        pattern = re.compile(rf"define\(\s*['\"]{constant}['\"]\s*,.*?\);", re.DOTALL)
        replacement = f"define('{constant}', $mayaobongroArchiveDb['{key}']);"
        text, count = pattern.subn(replacement, text, count=1)
        if count != 1:
            raise RuntimeError(f"Expected exactly one {constant} definition")

    if "mayaobongroArchiveOrigin" not in text:
        marker = "/* That's all, stop editing! Happy publishing. */"
        if marker not in text:
            raise RuntimeError("WordPress stop-editing marker not found")
        text = text.replace(marker, HOST_CONFIG + "\n" + marker, 1)

    path.write_text(text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("wp_config", type=Path)
    args = parser.parse_args()
    configure(args.wp_config)


if __name__ == "__main__":
    main()
