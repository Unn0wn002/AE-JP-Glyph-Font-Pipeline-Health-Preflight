# Genuine-F02 native matrix through the dockable panel, Windows Sandbox - 2026-10-30 (WIB)

Result: `NATIVE_MATRIX_PASS_PENDING_REVIEW`, 14/14 rows PASS (`evaluation.json`, `evaluator-stdout.txt`). This awaits owner review; it is not a release approval.

## Environment

- Windows Sandbox guest `4E7B2FAA-A2EC-4`, After Effects 26.5x89, en_US (`sandbox-preflight.json`). Config `F02-panel-sandbox.wsb`: networking on (Creative Cloud sign-in), vGPU disabled (GPU sharing crashes the Sandbox on this host with 0x80370106).
- After Effects was installed through Creative Cloud with the owner's account in a fresh Sandbox. An earlier Sandbox on 2026-10-29 contained a third-party license patch; it was discarded unused and no run was made on it.
- Panel `JPFP_Session1_Panel.jsx` (`3b7f2b29...`) and probe (`f93d2218...`) were copied into the Sandbox's `ScriptUI Panels` folder by Claude via `wsb exec`; installed hashes matched the sent hashes. No extra fonts installed.

## Run

1. `sandbox-preflight-fast.jsx` via File > Scripts > Run Script File: `GENUINE_MISSING_REFERENCE_OBSERVED`; F02 resolves to `ZenKakuGothicNew-Regular` with `isSubstitute: true`.
2. Four panel runs in runbook order (fixture x2, large x2). Each: BEFORE script (`BEFORE_OK`), panel **Scan**, panel **Export report...** to `exports\`, AFTER script (`AFTER_OK equal=true`).
3. After Effects quit with Ctrl+Q; no save prompt appeared. Returned `sandbox-work.aep` is byte-identical to the received original (`af3b1bd6...`).

## Differences from the runbook and the 2026-10-19 run

- Operator: Claude drove the Sandbox, not a person. The host's screen-capture filter masks the Sandbox window, so a temporary helper inside the Sandbox (run with `wsb exec` as the logged-in user) captured the guest screen and sent mouse clicks and keystrokes (`SetCursorPos`/`mouse_event`, `SendKeys`). The panel buttons, menus and file dialogs were used as a person would use them. The helper lived in `run\_ctl\` and was deleted before collection; it is not part of the returned files.
- The panel was floating, not docked, during the runs. Docking itself was verified natively on 2026-10-29 (`native-20261029-dock-panel`).
- `transfer-preflight.json` says hashes were computed "after the Sandbox closed". That text is a fixed string in `collect_and_evaluate.py`; in this run After Effects had quit but the Sandbox VM was still running when the files were hashed. The mapped folder holds the same bytes either way.
- Scanner route and BEFORE/AFTER snapshot method are as listed in the kit `RUNBOOK.md` ("Known differences from 2026-10-19").
