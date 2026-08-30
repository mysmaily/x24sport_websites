from __future__ import annotations

import json
import subprocess
import sys
import tempfile
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
        with tempfile.TemporaryDirectory() as temp_name:
            logo_dir = Path(temp_name) / "logo-references"
            logo_dir.mkdir()
            for index in range(5):
                (logo_dir / f"x24sport-round-badge-test-{index}.png").write_bytes(b"placeholder")
            logo_ids = {
                str(
                    self.run_direction_with_logo_dir(f"X24-BD-{ff:02d}0001", logo_dir)[
                        "logoSource"
                    ]["id"]
                )
                for ff in range(12)
            }
            self.assertGreater(len(logo_ids), 1)

    def run_direction_with_logo_dir(self, sku: str, logo_dir: Path) -> dict[str, object]:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--sku",
                sku,
                "--logo-source-library",
                str(logo_dir.parent / "missing-metadata.json"),
                "--logo-reference-dir",
                str(logo_dir),
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def test_logo_source_prefers_round_badges_when_present(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            logo_dir = Path(temp_name) / "logo-references"
            logo_dir.mkdir()
            raw_logo = logo_dir / "raw-logo.png"
            badge_logo = logo_dir / "x24sport-round-badge-test.png"
            raw_logo.write_bytes(b"placeholder")
            badge_logo.write_bytes(b"placeholder")
            direction = self.run_direction_with_logo_dir("X24-BD-000001", logo_dir)
            self.assertEqual(direction["logoSource"]["path"], str(badge_logo.resolve()))

    def test_logo_source_pool_scans_reference_folder(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            logo_dir = Path(temp_name) / "logo-references"
            logo_dir.mkdir()
            first_logo = logo_dir / "fresh-club-a.webp"
            second_logo = logo_dir / "fresh-club-b.png"
            first_logo.write_bytes(b"placeholder")
            second_logo.write_bytes(b"placeholder")
            direction = self.run_direction_with_logo_dir("X24-BD-000001", logo_dir)
            self.assertIn(
                direction["logoSource"]["path"],
                {str(first_logo.resolve()), str(second_logo.resolve())},
            )


if __name__ == "__main__":
    unittest.main()
