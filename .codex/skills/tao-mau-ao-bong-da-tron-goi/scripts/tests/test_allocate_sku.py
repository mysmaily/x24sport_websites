from __future__ import annotations

import json
import re
import runpy
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "allocate_sku.py"
SCRIPTS = SCRIPT.parent
NEW_SKU_RE = re.compile(
    r"^X24-BD-[0-9]{2}[0-5][0-9](?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$"
)


class AllocateSkuTests(unittest.TestCase):
    def allocate(self, registry: Path) -> str:
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--registry", str(registry)],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip()

    def test_allocates_distinct_ffmmhhdd_skus_without_server(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            registry = Path(temp_name) / "batch-registry.jsonl"
            first = self.allocate(registry)
            second = self.allocate(registry)

            self.assertRegex(first, NEW_SKU_RE)
            self.assertRegex(second, NEW_SKU_RE)
            self.assertNotEqual(first, second)

            records = [
                json.loads(line)
                for line in registry.read_text(encoding="utf-8").splitlines()
            ]
            self.assertEqual([record["sku"] for record in records], [first, second])
            self.assertTrue(all(record["format"] == "X24-BD-FFMMHHDD" for record in records))
            for record in records:
                suffix = record["sku"].removeprefix("X24-BD-")
                self.assertEqual(
                    record["components"],
                    {
                        "FF": suffix[:2],
                        "MM": suffix[2:4],
                        "HH": suffix[4:6],
                        "DD": suffix[6:8],
                    },
                )

    def test_consumers_require_new_format(self) -> None:
        for script_name in (
            "build_delivery_manifest.py",
            "validate_delivery.py",
            "deliver_print_masters.py",
            "choose_creative_direction.py",
        ):
            sku_re = runpy.run_path(str(SCRIPTS / script_name), run_name="sku_test")[
                "SKU_RE"
            ]
            self.assertIsNotNone(sku_re.fullmatch("X24-BD-00000001"), script_name)
            self.assertIsNone(sku_re.fullmatch("X24-BD-000001"), script_name)
            self.assertIsNone(sku_re.fullmatch("X24-BD-00600001"), script_name)


if __name__ == "__main__":
    unittest.main()
