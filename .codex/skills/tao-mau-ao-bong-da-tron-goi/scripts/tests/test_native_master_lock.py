from __future__ import annotations

import hashlib
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


SCRIPT = Path(__file__).resolve().parents[1] / "lock_native_print_master.py"
DEPRECATED_PREPARE = Path(__file__).resolve().parents[1] / "prepare_print_master.py"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class NativeMasterLockTests(unittest.TestCase):
    def make_source(self, folder: Path, name: str, size: tuple[int, int], color: str = "#174d3b") -> Path:
        source = folder / name
        Image.new("RGB", size, color).save(source)
        return source

    def run_lock(self, source: Path, output: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                str(source),
                str(output),
                "--width-px", "2336",
                "--height-px", "3504",
                "--target-aspect-ratio", "0.67",
                "--min-long-edge-px", "3504",
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def test_exact_native_master_is_copied_byte_identically(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            folder = Path(temp_name)
            source = self.make_source(folder, "native.png", (2336, 3504))
            output = folder / "print" / "X24-BD-000001-front-print.png"
            result = self.run_lock(source, output)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(sha256(source), sha256(output))
            self.assertIn('"scaleFactor": 1.0', result.stdout)
            self.assertIn('"resampled": false', result.stdout)

    def test_1024x1536_is_rejected_instead_of_locked_or_resized(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            folder = Path(temp_name)
            source = self.make_source(folder, "small.png", (1024, 1536))
            result = self.run_lock(source, folder / "out.png")
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Do not resize or upscale", result.stderr + result.stdout)

    def test_locked_master_cannot_be_replaced_by_different_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            folder = Path(temp_name)
            output = folder / "print.png"
            first = self.make_source(folder, "first.png", (2336, 3504), "#174d3b")
            second = self.make_source(folder, "second.png", (2336, 3504), "#9b1d20")
            self.assertEqual(self.run_lock(first, output).returncode, 0)
            result = self.run_lock(second, output)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Canonical master is immutable", result.stderr + result.stdout)
            self.assertEqual(sha256(first), sha256(output))

    def test_legacy_prepare_script_is_disabled(self) -> None:
        result = subprocess.run(
            [sys.executable, str(DEPRECATED_PREPARE)],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("do not resize, upscale", result.stderr + result.stdout)


if __name__ == "__main__":
    unittest.main()
