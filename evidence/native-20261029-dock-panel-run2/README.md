# Native check run 2: dockable panel on readable text (2026-10-29, ~17:55 WIB)

Follow-up to `evidence/native-20261029-dock-panel/` (not edited). Same host, After Effects 26.5x89, after a full AE restart. Panel `8c1e73c` installed, scanner unchanged (`f93d2218...8156e`).

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Plain `addText` works after the restart (new project, `make_check_comp.jsx`) | PASS, no AE warning | observed |
| Panel scan on readable text | PASS for capture and coverage: 2 static text layers, 23 characters, 23/23 coverage verified present, per-character font identity verified (Meiryo for Japanese, Times New Roman for Latin), one `MIXED_FONT_RUNS` review item, no dialogs | `panel-scan2-checkcomp-report.txt` |
| Fixture builder, third attempt | FAIL again; endless After Effects alerts, AE force-quit by Claude at the user's request (unsaved throwaway project only) | observed |
| Export button | NOT_RUN | |
| 14/14 comparison | NOT_RUN | |

## Fixture builder failure: likely cause

`fixtures/JPFP_Session1_CreateFixtures.jsx` always stops after F05. The next step is F06, `comp.layers.addText("")` (an empty text layer). On this AE build, creating an empty text layer appears to raise "Unknown BIB Error. Probable invalid access, CT, 0 (83 :: 3)"; the script then aborts, and AE reports the exception at line 147 (`app.endUndoGroup()` in the `finally`). The repeated alerts are consistent with AE re-raising the warning whenever the damaged comp or its layers are redrawn or read (the scanner also triggered one).

This is inferred from the stop point and the code, not proven by an isolated test. To confirm: in a new project, run one `addText("")` and nothing else. A builder fix would create F06 with a placeholder character and clear it through the TextDocument, inside its own try/catch, so one bad fixture cannot abort the rest.

The 2026-10-19 acceptance run scanned a retained fixture project (comp `JPFP_BETA_FIXTURES__DISPOSABLE`, sourced from `evidence/native-20261017-resumed/JPFP_BETA_VERIFIED_EXCEPT_F02.aep`), not this Session 1 builder's output. That project contains a readable empty F06 layer, so empty text layers can exist on this build; the suspect is creating one with `addText("")`.

## Limits

- One readable comp with default fonts, not the 14-row fixture matrix.
- The scanner runs through `eval` of its text inside the panel; the direct-run equality shown in run 1 was on unreadable layers only.
