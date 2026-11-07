"""Offline binding regressions using retained native bytes; no AE execution."""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import evaluate_native_beta as evaluator

EVIDENCE = ROOT / "evidence/native-20261019-zen"
RUNS = ["20261019-165617-631", "20261019-165707-356", "20261019-165808-609", "20261019-192441-845"]


class GenuineNativeBindingTests(unittest.TestCase):
    def binding(self):
        return evaluator.read_genuine_binding(EVIDENCE / "fixture-binding.json")

    def altered_binding(self, key, mutate, rebind=False):
        directory = Path(self.enterContext(tempfile.TemporaryDirectory()))
        binding = json.loads((EVIDENCE / "fixture-binding.json").read_text(encoding="utf-8"))
        for reference in [value for value in binding.values() if isinstance(value, dict)]:
            shutil.copyfile(EVIDENCE / reference["path"], directory / reference["path"])
        reference = binding[key]
        file = directory / reference["path"]
        record = json.loads(file.read_text(encoding="utf-8-sig"))
        mutate(record)
        file.write_text(json.dumps(record), encoding="utf-8")
        if rebind:
            reference["sha256"] = hashlib.sha256(file.read_bytes()).hexdigest()
        target = directory / "fixture-binding.json"
        target.write_text(json.dumps(binding), encoding="utf-8")
        return target

    def test_actual_saved_and_missing_reference(self):
        binding = self.binding()
        self.assertEqual(binding["postScriptName"], "ZenKakuGothicNew-Regular")
        self.assertEqual(binding["records"]["validation"]["layerID"], 14)

    def test_sandbox_origin_export_hashes_match_retained_bytes(self):
        manifest = json.loads((EVIDENCE / "sandbox-origin-sha256.json").read_text(encoding="utf-8-sig"))
        self.assertEqual(manifest["host"], "3E6B83F9-7F9C-4")
        self.assertEqual(len(manifest["rows"]), 26)
        report_names = dict(zip("abcd", ["aggregate-run1", "aggregate-run2", "large-run1", "large-run2"]))
        for row in manifest["rows"]:
            name = row["path"]
            if name.startswith("F02RUN/"):
                name = name.removeprefix("F02RUN/")
                if name.endswith(".txt"):
                    name = report_names[name[0]] + ".txt"
            else:
                name = name.split("/", 3)[3]
            raw = (EVIDENCE / name).read_bytes()
            self.assertEqual(len(raw), row["bytes"], name)
            self.assertEqual(hashlib.sha256(raw).hexdigest(), row["sha256"], name)

    def test_evidence_byte_change_rejected(self):
        path = self.altered_binding("validation", lambda record: record.update(status="PASS"))
        with self.assertRaisesRegex(evaluator.Blocked, "hash mismatch"):
            evaluator.read_genuine_binding(path)

    def test_missing_inventory_required_even_with_updated_hash(self):
        path = self.altered_binding("validation", lambda record: record.update(missingInventory=[]), True)
        with self.assertRaisesRegex(evaluator.Blocked, "inventory absent"):
            evaluator.read_genuine_binding(path)

    def test_author_reopen_substitution_rejected(self):
        path = self.altered_binding("author", lambda record: record["afterReopen"][0].update(isSubstitute=True), True)
        with self.assertRaisesRegex(evaluator.Blocked, "persistence/coverage missing"):
            evaluator.read_genuine_binding(path)

    def test_current_layer_mapping_required(self):
        run = evaluator.read_run(EVIDENCE / RUNS[0], EVIDENCE / "aggregate-run1.txt")
        evaluator.bind_genuine_run(run, self.binding(), "fixture")
        altered = copy.deepcopy(run)
        altered["before"]["state"]["activeComposition"]["layers"][0]["id"]["value"] = -1
        with self.assertRaisesRegex(evaluator.Blocked, "layer mapping mismatch"):
            evaluator.bind_genuine_run(altered, self.binding(), "fixture")

    def test_retained_matrix_pass_still_requires_review(self):
        args = argparse.Namespace(evidence_dir=EVIDENCE, setup_log=None,
                                  fixture_binding=EVIDENCE / "fixture-binding.json")
        for kind, offset in [("fixture", 0), ("large", 2)]:
            for number in [1, 2]:
                setattr(args, f"{kind}_state{number}", EVIDENCE / RUNS[offset + number - 1])
                setattr(args, f"{kind}_report{number}", None)
        result = evaluator.evaluate(args)
        self.assertEqual([row["status"] for row in result["rows"]], ["PASS"] * 14)
        self.assertEqual(result["gate"], "NATIVE_MATRIX_PASS_PENDING_REVIEW")


if __name__ == "__main__":
    unittest.main()
