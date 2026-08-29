from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


SCRIPT = Path(__file__).resolve().parents[1] / "prepare_print_master.py"
INSTALLER = Path(__file__).resolve().parents[1] / "install_print_upscaler.py"


class PrintMasterQualityGateTests(unittest.TestCase):
    def make_source(self, folder: Path, size: tuple[int, int]) -> Path:
        source = folder / "source.png"
        Image.new("RGB", size, "#174d3b").save(source)
        return source

    def run_prepare(self, source: Path, output: Path, *extra: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                str(source),
                str(output),
                "--target-aspect-ratio", "0.8",
                *extra,
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def test_lanczos_above_two_x_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            folder = Path(temp_name)
            result = self.run_prepare(
                self.make_source(folder, (20, 25)),
                folder / "out.png",
                "--target-long-edge-px", "100",
                "--upscale-engine", "lanczos",
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Lanczos-only upscale", result.stderr + result.stdout)

    def test_lanczos_under_two_x_writes_passing_provenance(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            folder = Path(temp_name)
            output = folder / "out.png"
            result = self.run_prepare(
                self.make_source(folder, (80, 100)),
                output,
                "--target-long-edge-px", "150",
                "--upscale-engine", "auto",
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            with Image.open(output) as image:
                self.assertEqual(image.info["x24.upscaleEngine"], "lanczos")
                self.assertEqual(image.info["x24.qualityGate"], "pass-native-or-lanczos-under-2x")

    def test_missing_realesrgan_points_to_pinned_installer(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            folder = Path(temp_name)
            result = self.run_prepare(
                self.make_source(folder, (20, 25)),
                folder / "out.png",
                "--target-long-edge-px", "100",
                "--upscale-engine", "auto",
                "--realesrgan-root", str(folder / "missing-upscaler"),
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("install_print_upscaler.py", result.stderr + result.stdout)

    def test_installer_rejects_broad_or_unrelated_destination(self) -> None:
        result = subprocess.run(
            [sys.executable, str(INSTALLER), "--destination", "/tmp/not-a-dedicated-cache"],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("dedicated realesrgan-ncnn-vulkan-*", result.stderr + result.stdout)


if __name__ == "__main__":
    unittest.main()
