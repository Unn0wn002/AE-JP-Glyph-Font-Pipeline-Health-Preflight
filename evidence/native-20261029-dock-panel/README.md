# Native check: dockable panel wrapper (2026-10-29, WIB)

Host: Windows 11 Pro, After Effects 26.5x89 (en_US). Operator: Aria with Claude (desktop control plus the user's own clicks).
Scope: `src/JPFP_Session1_Panel.jsx` only. The scanner `src/JPFP_Session1_Probe.jsx` is byte-identical to the beta tip `876541c` (SHA-256 `f93d2218...8156e`).
This is not a 14/14 acceptance run, and `scripts/evaluate_native_beta.py` was not run.

## Install

- Panel copied to `Scripts/ScriptUI Panels/`, scanner to `Scripts/ScriptUI Panels/JPFP/`, by the user in an elevated PowerShell.
- Installed files re-hashed against the staged copies before After Effects was used (`installed-SHA256.txt`, final panel bytes).
- The first install attempt silently did not copy anything; it was re-run and verified.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Panel listed in the Window menu | PASS | observed on screen |
| Scanner in `JPFP/` has no Window-menu entry of its own | PASS | observed: menu listed only `JPFP_Session1_Panel.jsx` beside the other panels |
| Panel docks (by hand, next to CutBridge) | PASS | observed |
| Dock position survives an AE restart | PASS | observed after relaunch at 16:52 |
| First design: reassign `$.global.alert` and `File.saveDialog` | FAIL on this host. The panel's own guard reported BLOCKED and did not run the scanner, so no dialogs appeared | panel message observed; `diag-result.txt` |
| `$.global.alert = stub` sticks | NO (silently ignored, no exception) | `diag-result.txt` |
| `File.saveDialog = stub` sticks and restores | YES | `diag-result.txt` |
| Revised design: scanner text evaluated with `alert` shadowed, `File.saveDialog` replaced | PASS for capture. The summary showed inline, "Scan complete", report written to the temp file with no save dialog and no scanner alert | panel observed; `panel-scan1-report.txt` |
| Panel output equals a direct File > Scripts run of the same scanner on the same comp | PASS. The two 4037-byte reports differ only in the generation time and elapsed ms | `panel-scan1-report.txt`, `direct-scan1-report.txt` |
| Project revision unchanged by the panel scan | true (82 -> 82), one observation | `panel-scan1-report.txt` |
| Export button (user-chosen save) | NOT_RUN | |
| Scan of readable fixtures, 14/14 comparison | NOT_RUN. See the host issue below | |

## Host issue found (not caused by the panel)

- `fixtures/JPFP_Session1_CreateFixtures.jsx` (unchanged beta file) stops after F05 on this host, twice in two fresh projects. AE shows "Unknown BIB Error. Probable invalid access, CT, 0 (83 :: 3)", then "Unable to execute script at line 147 ... TypeError: undefined is not an object" (line 147 is `app.endUndoGroup()` in the `finally`).
- The first project ended with two fixture comps; the cause of the second build was not established (possibly an extra confirm from automated key presses).
- All five built text layers are unreadable to the scanner (`TEXTDOCUMENT_READ_FAILED`, 0 characters examined) in both the panel and the direct run.
- A plain `addText` from `make_check_comp.jsx` (default font, no font changes) also raised an AE warning and the comp did not open, so the text engine in this AE session appears faulty. The 2026-10-19 run on the same AE build read 9 layers and 52 characters, so this is a session or machine state, not a fixed property of 26.5x89. Not diagnosed further.

## Limits

- The scanner now runs through `eval` of its text inside the panel, not as a loaded file. Its recorded 14/14 evidence covers its bytes; the equivalence of the two execution paths is shown here only on unreadable layers.
- Several AE dialogs could not be read by the automation (a screen overlay masked them) and were read or dismissed by the user.
- `diag_reassign.jsx` here is the second version. The first version wrote an empty file because `JSON` is undefined in this ExtendScript (`typeof JSON=undefined`); it was replaced in place, not retained.
