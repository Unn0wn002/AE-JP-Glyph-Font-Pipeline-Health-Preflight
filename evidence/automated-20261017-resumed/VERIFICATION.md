# Final source verification

Implementation commit: b5582c489534331eb893bc260bc2b0990243a386, branch beta/static-preflight-20261017.
Production SHA256: f93d221898e6dc75985e2fa5b7ffbde2850c2ebc39da889b21592c5f58d8156e.
Runtime: Node24.19.0, bundled Python3.12.14, Windows11Pro10.0.26300x64.

Actual local commands/results:

```text
python tests/session1_static_checks.py                  PASS
node tests/behavioral_regressions.cjs                   PASS74/74
python -m unittest discover -s tests -p "test_*.py"       PASS3/3
```

The static suite also parses five beta diagnostics and compiles the offline native-evidence evaluator. None of these automated checks is native acceptance. Raw stdout/stderr logs are adjacent; PowerShell capture may include a UTF-16 BOM.

[GitHub CI run39039773692](https://github.com/Unn0wn002/AE-JP-Glyph-Font-Pipeline-Health-Preflight/actions/runs/39039773692) completed SUCCESS on the implementation commit. Static checks, production mock regressions, package tests, deterministic archive construction and upload ran remotely. Final evidence/packaging commit checks are separate and shown on PR#1.

Native evidence is separately retained in ../native-20261017-resumed/. The native suite remains BLOCKED_NATIVE_VALIDATION because F02/full R01 lack the complete controlled condition; 12 other rows passed within their documented limits. The final local archive must be built after the evidence commit, from a clean checkout; BUILD_INFO.json identifies those exact source bytes and the packaging commit.
