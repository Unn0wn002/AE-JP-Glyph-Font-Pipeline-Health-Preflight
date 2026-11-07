# Native check: an empty scan must not look like an all-clear (2026-11-02, Claude Sonnet 5.5)

Class: PASS_BOUNDED_NATIVE (floating panel, After Effects 26.5x89, one machine). Found by the owner, who ran the installed panel on a composition with no text and sent a screenshot.

## Defect
`01-before-owner-screenshot-green-with-zero-layers.png`: composition `Comp 1`, "Static text layers checked: 0", coverage 0/0/0, and the panel showed a GREEN "Scan complete: no findings in the checked text." This was a regression from the status change merged earlier the same day (green when all counts are zero): zero counts are meaningless when nothing was checked.

## Fix (panel wrapper only; the scanner is unchanged)
- The scanner's line "Static text layers checked: N" is read. Green now needs N greater than 0 AND every count zero AND no skipped or failed coverage.
- N = 0: amber, "Scan complete: nothing was checked." / スキャン完了：検査対象なし。, a "Text layers checked: 0" line, and a note under the scanner text explaining that no static text layers were found and what is not scanned.
- N not readable (unknown format) with all counts zero: grey, never green. Problems still show red and review / not checked / gaps still amber without that line.
- A new first count line "Text layers checked: N / 検査レイヤー: N" shows the scope.

## Results
| Check | Result | Evidence |
|---|---|---|
| The owner's own case (`Comp 1`, five image layers, no text), scanned with the fixed panel run from `Run Script File` against the owner's open project (nothing was changed or saved): amber "Scan complete: nothing was checked." plus Japanese line; "Text layers checked: 0" amber; other counts 0 | PASS_BOUNDED_NATIVE | `02-after-amber-nothing-was-checked.jpg` |
| Latin-only text layer still green with layers checked 1 (earlier run, previous build of the same logic) | PASS_BOUNDED_NATIVE | `evidence/native-20261102-honest-status/07-latin-only-green.jpg` |
| Unit tests: panel wrapper 25/25 (3 new), static checks, behavioral 74/74 (mock host), unittest 10/10 | PASS (test doubles) | `tests/panel_wrapper.test.cjs` |
| The fixed panel docked after a restart of After Effects; green with the new first count line on a text layer | NOT_RUN (the owner's After Effects session was left running; the installed file is the fixed one and loads on the next start) | n/a |

## Note
The installed copy in `C:\Users\unn0w\AppData\Roaming\Adobe\After Effects\26.5\Scripts\ScriptUI Panels\JPFP_Session1_Panel.jsx` is the fixed version (sha256 `eb57644f...`); an After Effects session that was already open keeps the old one until it is restarted.
