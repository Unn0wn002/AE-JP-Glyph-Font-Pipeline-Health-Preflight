# Native validation observations — 17 October 2026

Status: **BLOCKED_NATIVE_VALIDATION**. These are observed UI/accessibility transcripts, not exported scanner reports. No F01–F12, L01, or full R01 pass is claimed.

## Host and setup

- Windows inventory: Microsoft Windows 11 Pro, version 10.0.26300, build 26300, 64-bit.
- Installed AfterFX.exe version: 26.5. Live script readback: AE `26.5x89`, build name `26.5x89`, build number `89`, locale `en_US`, `$.os = Windows/64 10.0`.
- No AE process was running at initial inventory. Started the installed application; observed an empty, unsaved project. No existing project was opened.
- BIB investigation budget began 15:37:47 WIB (08:37:47 UTC); hard stop 17:37:47 WIB. No additional mixed-font write experiment has been performed. The existing two-phase checkpoint remains unresolved.
- Two CLI `-r` dispatch attempts produced neither a visible result nor a log; they are NOT_RUN, not native passes. The script was subsequently selected through File > Scripts > Run Script File.

## ASCII creation control

Executed `diagnostics/beta/JPFP_Beta_ASCII_Smoke.jsx` in the empty disposable project. This is mutating setup, separate from the product scanner.

Observed one composition `JPFP_BETA_ASCII_SMOKE__DISPOSABLE`, one visible text layer `ABC 123`. The script then raised:

> Unable to execute script at line 31. Permission denied (is Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network enabled?)

The failure occurred at evidence-folder creation after text creation/display. No log was exported. The diagnostic was then hardened to display log-export failure explicitly; that revised mutating script has not been rerun. Do not treat the failed logging attempt as a scanner failure or fixture-suite pass.

## Read-only state inspection before product scan

Executed `diagnostics/beta/JPFP_Beta_ReadOnly_State.jsx` through AE's script menu. Its alert/accessibility text reported:

```text
AE version = 26.5x89
AE build name = 26.5x89
AE build number = 89
Locale = en_US
OS = Windows/64 10.0
Project items = 1
Project revision = 32
Project file = UNSAVED_DISPOSABLE
Composition = JPFP_BETA_ASCII_SMOKE__DISPOSABLE
Composition ID = 1
Layer count = 1
Time = 0
Layer 1 ID/name = 13 / ABC 123
Source Text = ABC 123
Keys/expression = 0 / false
Font at [0,1) = TimesNewRomanPSMT #236 substitute=false
```

This proves only this ASCII control's stated conditions. It does not establish Japanese coverage, mixed formatting, F02 substitution, F05's gap, Unicode semantics, or the 100-layer fixture.

## Frozen production scanner smoke (two runs)

Scanner SHA-256: `6cd8267587286cb7754a8e60f0707d2b008c349826f7c641f2a6f81929029b06`. Executed the unmodified production JSX through File > Scripts > Run Script File on the independently verified ASCII composition above.

| Observation | Run 1 | Run 2 |
|---|---|---|
| Static text layers checked | 1 | 1 |
| Coverage verified/skipped/failed | 7/0/0 | 7/0/0 |
| Problems/review/not-checked findings | 0/0/0 | 0/0/0 |
| Project revision unchanged (scanner) | true | true |
| Export actual | FAILED: ReferenceError permission denied | CANCELLED: user cancelled, no report saved |
| Dispatch through export-dialog UI snapshot | 1910 ms | 1594 ms |

The measured intervals include UI input and state-capture overhead; they are not scanner-only runtime measurements. Scanner-only timing could not be retained because export failed/cancelled. Run 1's AE progress text showed 14 seconds including export interaction; this is not scan performance.

The selected run-1 destination `ascii-beta-attempt.txt` exists as a **zero-byte partial file**, not a valid report. Retained native outcome text: `production-smoke-export-failed.txt` and `production-smoke-export-cancelled.txt`. An independent second execution of the read-only state inspector after both scans returned the same fields as the before-state: revision 32, one item, comp ID 1/name unchanged, one layer ID 13/name unchanged, text `ABC 123`, keys 0, expression false, first-character font `TimesNewRomanPSMT #236`, substitute false, time 0, unsaved disposable project. See `state-after-two-scans.txt`.

This establishes limited ASCII smoke and failure/cancellation feedback only. No complete native reports were retained; detailed semantic report equality, successful native export, F01–F12, L01, and full R01 remain BLOCKED/NOT_RUN. No BIB warning was observed in this limited attempt. No mixed-font fixture writes were attempted. Native investigation stopped at 15:45:18 WIB (08:45:18 UTC), 7 minutes 31 seconds after the recorded start, below the two-hour cap.

## Final-source recheck after mixed-font accounting repair

Final source SHA-256: `756a31affd8e782ae1e37835d058239e1271fc242a68db85077e51c15769fd33`. A final review found that intermittent fontID failure could count a PostScript-keyed and ID-keyed observation of one font as mixed. The final source counts distinct mixed fonts only from successfully observed unique IDs, while PostScript-only observations preserve incomplete mixed classification. The behavioral suite was extended to 73/73 PASS.

Executed the final source once more on the unchanged verified ASCII control. Actual: 1 static layer, 7/0/0 verified/skipped/failed coverage, 0/0/0 findings, project revision unchanged true, export CANCELLED. Dispatch-to-export-dialog snapshot: 1398ms including UI/capture overhead, not scanner-only timing. Retained `final-source-smoke-cancelled.txt` records the actual accessibility transcript and final source hash. The earlier independent before/after comparison applies to the two pre-final runs; full fixture repeatability remains BLOCKED. This final check does not rerun the disabled-write failure path.

Native investigation finally stopped 15:49:08 WIB (08:49:08 UTC), **11m21s cumulative elapsed**, below two hours. The earlier 7m31s stop was followed only by this final-source smoke/review correction. No mixed-font writes/BIB reproduction or security preference changes were attempted.

## Blocker and next action

AE's file-write preference is disabled. User was asked asynchronously to enable it manually; the assistant cannot change in-app security settings under the computer-use skill. No setting was changed. While this remains disabled, retain BLOCKED_NATIVE_VALIDATION and do not substitute mocked reports for native exports.

After the user enables writes: follow `docs/NATIVE_BETA_VALIDATION.md`, restart into an empty disposable project, run the ASCII control, and resume the existing Phase A/10-second interval/Phase B BIB checkpoint before changing or executing the baseline mixed-font fixture path. Verify each condition through fresh Source Text readback. Keep expected/actual results, two reports per required case, timing, state snapshots, and exact tested source SHA. Never turn a setup failure or missing evidence into PASS.
