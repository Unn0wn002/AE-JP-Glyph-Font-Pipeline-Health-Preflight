# Native check: honest status, counters and narrow-dock layout of the AE Glyph panel (2026-11-02, Claude Sonnet 5.5)

Class: PASS_BOUNDED_NATIVE for the docked panel on one machine (After Effects 26.5x89, Windows). The scanner `JPFP_Session1_Probe.jsx` is unchanged (sha256 `f93d2218...8156e`); only the panel wrapper changed (sha256 `ad9007e5...1504f2`). Disposable project: fixtures from `fixtures/JPFP_Session1_CreateFixtures.jsx` plus two throwaway comps made by a scratch script; nothing was saved. The panel and the scanner were installed in the per-user `ScriptUI Panels` folder (`JPFP` subfolder for the scanner) and After Effects was restarted after each change.

## Defects found by looking at the real panel
| # | Finding (before) | Evidence | Fix (display only) |
|---|---|---|---|
| 1 | **False green.** The status said "Scan complete" in green although the scanner's own summary said 5 to review and 4 not checked. | `01` | The colour now follows the scanner's counts: green only when problems, review, not-checked and skipped/failed coverage are all zero; amber for review / not checked / coverage gaps; red for problems; grey when the counts cannot be read. Four count lines (zero stays grey) sit under the status. |
| 2 | **"Open/select a composition first" with a composition open.** Reproduced when two items were selected in the Project panel, and when the panel shares a tab group with the Composition viewer (the viewer is hidden, so there is no active item). Selecting ONE composition works. | `03` | The panel adds a note under the message explaining both causes. (An earlier hint "click in the Timeline" was dropped: not verified.) |
| 3 | **Status cut off in a narrow dock** ("Scan complete: review needed. / スキャン完了：確認が" ended at the edge). | `02` | The bilingual status is two short lines (English, Japanese). |
| 4 | Export status showed a long path that a narrow dock cuts off; Export had never been run natively. | `05` | Short status ("Report exported. / レポートを出力しました。"); the path or error goes under the scanner text. |

## Results (new panel, docked about 230 px wide beside Project)
| Check | Result | Evidence |
|---|---|---|
| Fixture composition, one composition selected: amber "Scan complete: review needed." / スキャン完了：確認が必要です。; Problems 0, Review needed 5, Not checked 4, Coverage gaps 1; nothing cut off | PASS_BOUNDED_NATIVE | `04` |
| Export report: Save dialog, file written (18,720 bytes, begins "JP FONT AND GLYPH PREFLIGHT — STATIC-TEXT BETA REPORT", project revision unchanged), status "Report exported." in green | PASS_BOUNDED_NATIVE (first native Export run) | `05` |
| Plain Japanese + Latin text layer: amber, Review needed 1 (a mixed-font run is a review item by design, never an all-clear) | PASS_BOUNDED_NATIVE | `06` |
| Latin-only text layer: green "Scan complete: no findings in the checked text." / スキャン完了：確認範囲に検出なし。, all counters 0 (grey), coverage 17/0/0 | PASS_BOUNDED_NATIVE | `07` |
| No composition: amber "No report produced" with the panel note explaining the cause (seen with an intermediate build of the same note; the final build differs only in layout) | PASS_BOUNDED_NATIVE | `03` |
| Red state (problems > 0) | NOT_RUN natively; unit-tested. The fixture's missing-font case (F02) is not accepted on this machine. | `tests/panel_wrapper.test.cjs` |
| Floating window with the new layout; Japanese wording review | NOT_RUN | n/a |

Unit tests: panel wrapper 22/22 (13 before the work), static checks, behavioral 74/74 (mock host) and unittest 10/10 pass.

## Notes
- The scanner text still contains "Export: OK C:\...\Temp\JPFP_panel_report.txt". That is the temporary file the panel captures, not the user's export; the panel note says nothing is saved until Export is pressed.
- The panel's tab name is the file name (`JPFP_Session1_Panel`); renaming the file would change install instructions and recorded hashes, so it is left as is.
