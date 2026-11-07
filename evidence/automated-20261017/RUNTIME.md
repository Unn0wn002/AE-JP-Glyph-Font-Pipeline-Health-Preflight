# Local check environment

17 October 2026, Windows 11 Pro 10.0.26300 x64. Node 24.19.0; Python 3.12.14; Git 2.53.0.windows.3.

The PATH `python` command resolves to an unavailable Microsoft Store alias. Checks used the existing bundled interpreter at `C:/Users/unn0w/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`; no runtime was installed.

Required checks ran against frozen scanner SHA-256 `756a31affd8e782ae1e37835d058239e1271fc242a68db85077e51c15769fd33`:

```text
python tests/session1_static_checks.py
node tests/behavioral_regressions.cjs
python -m unittest discover -s tests -p 'test_*.py'
git diff --check
```

Final results: static PASS, production-JSX mock behavioral 73/73 PASS, package 3/3 PASS, whitespace PASS. The initial 71-case combined check took approximately 0.64 seconds; final behavior/static checks were rerun after the mixed-font repair. These are local automated checks; remote CI has its own result, and none establish native fixture acceptance.

CI declares Node 22 and Python 3.12. Package construction uses no third-party dependencies. Installed ZIP identity, manifest and native validation gate are in generated BUILD_INFO.json/SHA256SUMS and the adjacent archive `.sha256`.
