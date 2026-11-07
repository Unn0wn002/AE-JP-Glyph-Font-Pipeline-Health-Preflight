# GL-02 native check of the final compact panel (prepared 2026-11-07, Claude Code; host steps by Aria)

Status: **PREPARED, NOTHING RUN.** All results below are NOT_RUN until Aria reports them. No result here comes from tests or mocks; automated tests cannot establish these outcomes.

## Identity recorded before touching the host (VERIFIED_THIS_SESSION, read-only)
- Source HEAD `eb4140064db965bd70f290fe79e317bf005cbc3b` (local, unpushed; docs-only on top of `1f1078d`); `git status --porcelain src` clean.
- `src/JPFP_Session1_Panel.jsx` sha256 `b58936426abc5f265abe5c47886c8099cf267557b1459b46bb444b2a07a8c756`
- `src/JPFP_Session1_Probe.jsx` sha256 `f93d221898e6dc75985e2fa5b7ffbde2850c2ebc39da889b21592c5f58d8156e` (same as the 2026-11-02 compact-view run)
- The panel hash differs from the 2026-11-02 compact-view record (`b4856027...`): the panel changed afterwards, so earlier panel checks are history, not evidence for this file.
- Installed copy: **none found** in `C:/Program Files/Adobe/Adobe After Effects 2026/Support Files/Scripts/ScriptUI Panels/` (no JPFP files; no `JPFP/` subfolder). After Effects was not running at the time of the check. AE file version 26.5 (exact build number is read from the AE About box at run time).
- Package for review (not used for this run): GL-03 ZIP sha256 `10dc1822...26c9`.

## Expected outcomes (written before the run)
| ID | Step | Expected |
|---|---|---|
| E1 | Install the two files, restart AE, open Window > panel, dock it as a tab (not in the Composition viewer's tab group) | Panel opens docked; after closing and reopening AE the panel is still docked in the same place |
| E2 | Disposable project from `fixtures/JPFP_Session1_CreateFixtures.jsx`, activate `JPFP_S1_FIXTURES__DISPOSABLE`, press Scan | Compact main view: one status line, five count lines, Show details, Export; description and scanner text hidden |
| E3 | Same scan: status colour | **Red** because problems > 0 (F02 missing font); the problems count is greater than 0 |
| E4 | Press Export report... from the compact layout, choose a `.txt` in a disposable folder | "Report exported." status; file exists, UTF-8, content equals the report in details; project revision unchanged |
| E5 | With no composition selected (close the viewer or select nothing) and press Scan | Details open by themselves with the reason; no green; no pop-up |
| E6 | Scanner read-only boundary | Project not modified by the scan (revision unchanged; no unsaved-change marker caused by the scan) |

## Host checklist for Aria (each install/restart needs her own yes; I do not launch or restart After Effects)
1. Tell me the AE exact version and build (Help > About) and whether AE is closed.
2. Copy `src/JPFP_Session1_Panel.jsx` into the `ScriptUI Panels` folder and `src/JPFP_Session1_Probe.jsx` into a new `JPFP` subfolder there (Program Files may need administrator rights; tell me if you want to do the copy yourself).
3. Start AE, create a NEW throwaway project, run `JPFP_Session1_CreateFixtures.jsx` (File > Scripts > Run Script File...), open Window > the panel, dock it.
4. Activate the fixtures composition and Scan. Screenshot the compact view (E2, E3). Press Export, save to a disposable folder, screenshot the status (E4).
5. Close and restart AE (E1 persistence); screenshot the dock position. Then select nothing active and Scan (E5).
6. Send the screenshots and the exported report path; I will hash them and record results as PASS_BOUNDED_NATIVE, FAIL or NOT_RUN. Anything unexpected becomes an investigate-first defect, never an automatic PASS.

## Results
E1 to E6: **NOT_RUN**.

## Partial results reported 2026-11-07 14:18 (host steps by Aria; AE 26.5x89, build 89, en_US, Windows; screenshot `01`, export `02`)
Report `02` is byte-identical (sha256 `b52f6ff9b870b46dd839921b2f7e4b0eb6443503ed977e69356feeab488a8042`, 18,794 bytes) to the file the panel wrote to `C:/Users/unn0w/AppData/Local/Temp/JPFP_panel_report.txt` and to the copy Aria placed at `tests/disposable file.txt` (an untracked file inside the repo's tests folder; left in place). Screenshot `01` sha256 `deb3c862a0593849e3cdfebfebae7cbe973cc33fc91dce33188eba6fd661e87a`.

| ID | Result | Observation |
|---|---|---|
| E1 | PARTIAL: docked before restart PASS_BOUNDED_NATIVE; persistence after restart NOT_RUN | Panel is a tab beside Project in the left frame, not in the viewer's tab group. Restart not yet reported. |
| E2 | PARTIAL | Five count lines, Show/Hide details, Export visible. In the screenshot the details were already open, so the default closed compact view was not captured. |
| E3 | **NOT_EXERCISED** | Problems = 0, so no red state. Report lines 104 to 109: F02 text got applied font BIZ-UDGothic with substitute=false, i.e. this host replaced the nonexistent font and the builder cannot create a genuine missing font (as already documented). Counts 0 problems / 5 review / 4 not checked / 1 coverage gap match the amber display. Red with problems>0 stays NOT_RUN natively. |
| E4 | PARTIAL PASS_BOUNDED_NATIVE | "Report exported." and "Export: OK" shown; file exists; text report; exported with the details area open, not the closed compact view. |
| E5 | NOT_RUN | not yet reported |
| E6 | PASS_BOUNDED_NATIVE (one scan) | Project revision before 1214, after 1214, unchanged = true. One observation, not proof of all state. |

Scan numbers (report header): text layers checked 9; expression 1 and animated 1 not checked; empty 1; characters 52 examined; coverage verified 51 / skipped 1 / failed 0; scan 13 ms.

## Result reported after the restart (screenshot `03`, sha256 below)
- **E1: PASS_BOUNDED_NATIVE for dock persistence.** After Aria restarted After Effects (the restart itself is USER_STATED, not independently observed), the panel is again a tab beside Project in the left frame, same place as before. The panel loaded from the installed files and shows "Ready.", Scan and language buttons, a closed "Show details", and Export greyed out. This also captures the **default closed compact view** (E2: now PASS_BOUNDED_NATIVE for the closed layout before a scan).
- The language stayed English with the button "日本語"; the default is Japanese, so this is consistent with the remembered choice (it was English before the restart).
- Observation: the title bar reads "Untitled Project.aep *" and the fixtures composition `JPFP_S1_FIXTURES__DISPOSABLE` is open. How the composition is present after the restart (rebuilt by Aria or recovered by AE) was not reported; it does not affect the dock result.
- Screenshot `03-after-restart-docked.png` sha256 `285b70c6ce200cab4708a9ba9789c9e32f43f07391917aad720614524ed93882`.
- E5 (no active composition) is still NOT_RUN.

## E5 and final summary (screenshot `04`, sha256 `429db61312b674ddd326165d70efa0c4b1d39bfd316fd38eef1a64cc0e06f552`)
- **E5: PASS_BOUNDED_NATIVE.** With the composition viewer closed and no active composition, Scan produced "No report produced." (amber), the details area opened by itself (button reads "Hide details"; it was closed before the scan), the text reads "Open/select a composition first. / コンポジションを開いて選択してください。" plus the panel note about tab groups, Export stayed greyed out, and no pop-up is visible. Closing the viewer let the panel widen to the full frame; that is layout, not a defect.
- **Final for GL-02 (2026-11-07, AE 26.5x89, one machine, panel `b5893642...c756`, scanner `f93d2218...156e`): PARTIAL.**
  - PASS_BOUNDED_NATIVE: docked tab, dock persistence after a (USER_STATED) restart, closed compact view, scan counts equal to the exported report, Export OK, project revision unchanged (1214), details auto-open on no composition.
  - NOT_EXERCISED / NOT_RUN: red status with problems > 0 (no genuine missing font available; F02 was replaced by BIZ-UDGothic, substitute=false); Export pressed from the closed compact layout (the export was done with details open); an error or blocked path natively.
  - No defect found. Nothing here changes the gate: `BLOCKED_NATIVE_VALIDATION` and no distribution approval.
  - The GL-03 package (commit `eb41400`) contains the same panel and scanner hashes, so it needs no rebuild for this result.
