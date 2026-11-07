# Native check: PR #3 + PR #4 combined builder (2026-10-29, ~18:47 WIB)

Recorded on a local-only integration branch (`local/integration-pr3-pr4-20261029`: PR #4 head `242cc3c` merged with PR #3 head `23a3109`); this folder was then carried onto PR #4 unchanged in content except this line.
Host: Windows 11 Pro, After Effects 26.5x89 (en_US), fresh AE process and new throwaway project. Panel `8c1e73c` installed; scanner unchanged (`f93d2218...8156e`).

## Merge

- Only conflict: `.github/workflows/beta-validation.yml`, where both PRs add a Node test step. Resolved by keeping both steps.
- The builder merged automatically: #3's guarded steps and readback confirmations, plus #4's standard-Windows Latin font list.
- 3 of #3's 10 tests failed after the merge because their test double used a Latin font named `Latin-PS`, which #4's allowlist never selects. Renamed the double to `ArialMT`; 10/10 pass. Test data change only.
- Local: static checks PASS, behavioral 74/74, panel tests 13/13, fixture tests 10/10, unittest OK; scanner bytes unchanged.

## Native result

| Check | Result | Evidence |
| --- | --- | --- |
| Combined builder, one run | PASS: completed with no AE error, F05 = ArialMT | `builder-readback-alert.txt` |
| #3 readback summary | 12 ACCEPTED (F01, F03-F07, F09-F12, L01, OPEN); 2 NOT ACCEPTED | `builder-readback-alert.txt` |
| F02 | NOT ACCEPTED: the made-up missing font name did not persist; AE reports BIZ-UDGothic | same |
| F08 | NOT ACCEPTED: BIZ-UDGothic requested, AE applied Meiryo to は + U+3099 | same; the scan also shows Meiryo for both characters |
| Panel scan of the combined fixtures | PASS: no dialogs, revision unchanged; all 17 counters and all 9 findings identical to the scan of #4's builder alone (`native-20261029-builder-fix/`) | `panel-scan-combined-report.txt` |

#3's readback correctly flags the two fixtures whose requested setup did not persist, instead of silently accepting them.

## Limits

- The builder alert was read from a screenshot after moving the dialog and transcribed by Claude; it is not a file written by AE.
- Formal `scripts/evaluate_native_beta.py` 14/14 evaluation not run; 100-layer comp not scanned.
- One host, one session.
