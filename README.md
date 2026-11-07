# AE JP Glyph / Font Preflight

**0.1.0-beta.1 — BLOCKED_NATIVE_VALIDATION.** The native matrix F01–F12, L01 and R01 passed 14/14 (2026-10-19 and 2026-10-30) and is pending the required human evidence review; not released. See PROJECT_STATUS.md for current status. Working target: **22 October 2026**; the official submission deadline is unconfirmed.

Run the read-only scanner on **static Source Text in the active composition** to report substitute-font references, applied-font glyph coverage, intentional mixed-font runs for review, and explicit unknown or skipped coverage. Export the result as UTF-8 text. A coverage gap does not establish the font AE actually rendered; glyph coverage does not prove shaping or visual correctness.

## Run the beta

1. Extract the beta archive and read [installation instructions](docs/BETA_INSTALLATION.md) and [limitations](docs/BETA_LIMITATIONS.md).
2. In After Effects, open the intended composition.
3. Choose **File > Scripts > Run Script File…** and select `src/JPFP_Session1_Probe.jsx`.
4. Choose an export destination and review the report's scope, failed/skipped counts, findings, and character observations. Cancelling export is reported as `CANCELLED`; export failure is `FAILED`, never successful export.

Panel route: the dockable panel (see [installation instructions](docs/BETA_INSTALLATION.md)) runs the same scanner and shows a compact status, five count lines and optional details, in Japanese or English. It scans one active composition at a time.

The scanner does not replace or install fonts, edit Source Text, save the project, scan other compositions, or fully evaluate animated/expression text. Missing or failed property/API reads must remain `UNKNOWN`/`NOT_CHECKED`; a whole-layer font must not be guessed as a verified character font.

## Validation and evidence

- [PROJECT_STATUS.md](PROJECT_STATUS.md) and [TEST_RESULTS.md](TEST_RESULTS.md) record the current gate and actual execution evidence.
- [Native beta validation](docs/NATIVE_BETA_VALIDATION.md) defines F01–F12, L01, R01, fixture readback, timing, state integrity, and the BIB checkpoint boundary.
- [Demo checklist](docs/BETA_DEMO_CHECKLIST.md) provides a short review sequence.
- [Sample report](examples/BETA_SAMPLE_REPORT.txt) is **synthetic, not native evidence**.
- [Expected outcomes](fixtures/EXPECTED_RESULTS.tsv) are expectations, not passes.

Historical BIB `83::3` arose on a mutating mixed-font fixture/property-write path. The unchanged Phase A diagnostic now reproduced the warning before display; fresh Source Text did not establish that requested mixed run. This does not establish scanner failure. The baseline fixture remains unchanged. A separate diagnostic established persisted mixed fonts through documented font-name setters, followed by read-only scans in a disposable project. See the [resumed evidence](evidence/native-20261017-resumed/OBSERVATIONS.md) for exact conditions, successful Unicode exports, timings, repeated state comparisons, and remaining limitations.

## Development and packaging

From the [source repository](https://github.com/Unn0wn002/AE-JP-Glyph-Font-Pipeline-Health-Preflight), with Python 3.10+ and Node.js installed:

```text
python tests/session1_static_checks.py
node tests/behavioral_regressions.cjs
python -m unittest discover -s tests -p "test_*.py"
python scripts/package_beta.py --output-dir dist
```

The package script uses only Python's standard library. It creates a reproducible ZIP, an adjacent archive SHA-256 file, an internal per-file `SHA256SUMS`, and `BUILD_INFO.json` with branch, commit, source snapshot digest, and validation status. The installed archive contains the scanner and review material; mutating fixture JSX and diagnostics stay in the source repository. Rebuild after the final commit so package metadata identifies the committed revision.

## User guide

See [USER_GUIDE.md](USER_GUIDE.md) for what it does, install, use, reading the result and removal.

## License

MIT. See [LICENSE](LICENSE). This beta is not approved for distribution; the license covers the source only.
