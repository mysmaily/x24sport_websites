from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "choose_creative_direction.py"


class CreativeDirectionTests(unittest.TestCase):
    def run_direction(self, sku: str) -> dict[str, object]:
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--sku", sku],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def test_logo_source_is_selected_stably_for_sku(self) -> None:
        first = self.run_direction("X24-BD-000001")
        second = self.run_direction("X24-BD-000001")
        self.assertEqual(first["logoSource"], second["logoSource"])
        logo_source = first["logoSource"]
        self.assertIsInstance(logo_source, dict)
        self.assertRegex(str(logo_source["id"]), r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
        self.assertTrue(str(logo_source["path"]).startswith("assets/logo-references/"))

    def test_logo_source_varies_across_batch(self) -> None:
        logo_ids = {
            str(self.run_direction(f"X24-BD-{ff:02d}0001")["logoSource"]["id"])
            for ff in range(12)
        }
        self.assertGreater(len(logo_ids), 1)


if __name__ == "__main__":
    unittest.main()
