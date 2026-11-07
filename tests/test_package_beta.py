"""Package integrity tests; no After Effects acceptance claims."""

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "package_beta.py"
SPEC = importlib.util.spec_from_file_location("package_beta", MODULE_PATH)
package_beta = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(package_beta)


class BetaPackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "repository"
        self.root.mkdir()
        for name in package_beta.PAYLOAD_PATHS:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(f"Synthetic fixture for {name}\n", encoding="utf-8")
        # A mutating script must not leak into the installation payload.
        (self.root / "fixtures" / "unlisted_mutating_builder.jsx").write_text("addText('DO NOT SHIP')")
        self.git = patch.object(package_beta, "git_metadata", return_value={
            "branch": "beta/test", "commit": "a" * 40, "working_tree_dirty": False,
        })
        self.git.start()
        self.addCleanup(self.git.stop)

    def test_archive_and_manifests_are_reproducible_and_complete(self):
        first, sidecar = package_beta.build_package(self.root, self.root / "dist-one")
        second, _ = package_beta.build_package(self.root, self.root / "dist-two")
        self.assertEqual(first.read_bytes(), second.read_bytes())
        expected_hash = hashlib.sha256(first.read_bytes()).hexdigest()
        self.assertEqual(sidecar.read_text().strip(), f"{expected_hash}  {first.name}")
        with zipfile.ZipFile(first) as archive:
            self.assertEqual(set(archive.namelist()), set(package_beta.PAYLOAD_PATHS) | {"BUILD_INFO.json", "SHA256SUMS"})
            manifest = archive.read("SHA256SUMS").decode("utf-8").splitlines()
            self.assertEqual(len(manifest), len(package_beta.PAYLOAD_PATHS) + 1)
            for row in manifest:
                checksum, name = row.split("  ", 1)
                self.assertEqual(checksum, hashlib.sha256(archive.read(name)).hexdigest())
            metadata = json.loads(archive.read("BUILD_INFO.json"))
            self.assertEqual(metadata["native_validation_status"], "BLOCKED_NATIVE_VALIDATION")
            self.assertEqual(metadata["sample_report_evidence"], "SYNTHETIC_NOT_NATIVE")
            self.assertEqual(metadata["commit"], "a" * 40)
            self.assertFalse(metadata["working_tree_dirty"])

    def test_missing_required_payload_fails_before_writing(self):
        (self.root / package_beta.PAYLOAD_PATHS[0]).unlink()
        output = self.root / "dist"
        with self.assertRaisesRegex(FileNotFoundError, "Required beta payload missing"):
            package_beta.build_package(self.root, output)
        self.assertFalse(output.exists())

    def test_changed_payload_changes_snapshot_and_package_hash(self):
        first, _ = package_beta.build_package(self.root, self.root / "dist-one")
        with zipfile.ZipFile(first) as archive:
            snapshot_before = json.loads(archive.read("BUILD_INFO.json"))["source_snapshot_sha256"]
        (self.root / "src/JPFP_Session1_Probe.jsx").write_text("Changed scanner contents\n", encoding="utf-8")
        second, _ = package_beta.build_package(self.root, self.root / "dist-two")
        with zipfile.ZipFile(second) as archive:
            snapshot_after = json.loads(archive.read("BUILD_INFO.json"))["source_snapshot_sha256"]
        self.assertNotEqual(snapshot_before, snapshot_after)
        self.assertNotEqual(first.read_bytes(), second.read_bytes())


if __name__ == "__main__":
    unittest.main()
