"""Build a deterministic, dependency-free review package; not native validation."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

VERSION = "0.1.0-beta.1"
ARCHIVE_NAME = f"AE-JP-Glyph-Font-Preflight-{VERSION}.zip"
VALIDATION_STATUS = "BLOCKED_NATIVE_VALIDATION"
PAYLOAD_PATHS = (
    "README.md",
    "PROJECT_STATUS.md",
    "TEST_RESULTS.md",
    "src/JPFP_Session1_Probe.jsx",
    "src/JPFP_Session1_Panel.jsx",
    "docs/BETA_INSTALLATION.md",
    "docs/BETA_LIMITATIONS.md",
    "docs/BETA_DEMO_CHECKLIST.md",
    "docs/NATIVE_BETA_VALIDATION.md",
    "examples/BETA_SAMPLE_REPORT.txt",
    "fixtures/EXPECTED_RESULTS.tsv",
)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_metadata(repo_root: Path) -> dict:
    def git(*args: str) -> str:
        return subprocess.check_output(
            ["git", "-C", str(repo_root), *args], text=True, encoding="utf-8"
        ).strip()

    return {
        "branch": git("rev-parse", "--abbrev-ref", "HEAD"),
        "commit": git("rev-parse", "HEAD"),
        "working_tree_dirty": bool(git("status", "--porcelain", "--untracked-files=normal")),
    }


def build_package(repo_root: Path, output_dir: Path) -> tuple[Path, Path]:
    repo_root = repo_root.resolve()
    output_dir = output_dir.resolve()
    # Read every required input before creating an output directory.
    payload = {}
    for relative in sorted(PAYLOAD_PATHS):
        source = repo_root / relative
        if not source.is_file():
            raise FileNotFoundError(f"Required beta payload missing: {relative}")
        if source.is_symlink() or not source.resolve().is_relative_to(repo_root):
            raise ValueError(f"Beta payload must be a regular in-repository file: {relative}")
        payload[relative] = source.read_bytes()

    source_manifest = "".join(f"{digest(data)}  {name}\n" for name, data in payload.items())
    info = {
        "tool": "AE JP Glyph / Font Preflight",
        "version": VERSION,
        "native_validation_status": VALIDATION_STATUS,
        "scope": "Read-only static Source Text in the active composition",
        "sample_report_evidence": "SYNTHETIC_NOT_NATIVE",
        "source_snapshot_sha256": digest(source_manifest.encode("utf-8")),
        "source_snapshot_definition": "SHA-256 of sorted payload SHA256SUMS before generated metadata",
        **git_metadata(repo_root),
    }
    payload["BUILD_INFO.json"] = (json.dumps(info, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
    payload = dict(sorted(payload.items()))
    payload["SHA256SUMS"] = "".join(
        f"{digest(data)}  {name}\n" for name, data in payload.items()
    ).encode("utf-8")

    output_dir.mkdir(parents=True, exist_ok=True)
    archive = output_dir / ARCHIVE_NAME
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_STORED) as bundle:
        for name, data in sorted(payload.items()):
            member = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            member.create_system = 3
            member.external_attr = 0o100644 << 16
            member.compress_type = zipfile.ZIP_STORED
            bundle.writestr(member, data)
    checksum = archive.with_suffix(archive.suffix + ".sha256")
    checksum.write_text(f"{digest(archive.read_bytes())}  {archive.name}\n", encoding="utf-8", newline="\n")
    return archive, checksum


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path("dist"))
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    archive, checksum = build_package(root, args.output_dir)
    print(f"BETA_PACKAGE: {archive}")
    print(f"SHA256: {checksum.read_text(encoding='utf-8').strip()}")
    print(f"NATIVE_GATE: {VALIDATION_STATUS}")


if __name__ == "__main__":
    main()
