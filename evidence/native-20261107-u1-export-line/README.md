# Native check: Export result no longer replaces the scan verdict (U1, 2026-11-07, Claude Code via computer use)

Class: PASS_BOUNDED_NATIVE, one Windows machine, After Effects 2026 (26.5), docked in the left panel frame (about 240 px wide). Throwaway project made with `fixtures/JPFP_Session1_CreateFixtures.jsx`. Panel `src/JPFP_Session1_Panel.jsx` sha256 `a754df3eace3112be0940d5e9630f43997a073af088ec8302af4bae832612903` (installed in the After Effects `ScriptUI Panels` folder; the scanner `JPFP_Session1_Probe.jsx` is unchanged). Screenshots were viewed during the run and not saved; the observed text is recorded here.

## What changed (display only)
After Export, the status line used to be replaced by "Report exported.", so the scan verdict and its colour disappeared. The scan verdict now stays at the top and the export result has its own short line under the Export button. The scanner, report text and export behaviour are unchanged.

## Observed
1. Scan composition: **"Scan complete: review needed."** (amber), Text layers checked 9, Problems 0, Review needed 5, Not checked 4, Coverage gaps 1.
2. Export report... to a chosen `.txt`: the file was written (18,720 bytes). The top status stayed **"Scan complete: review needed."** and a green **"Report exported."** appeared under the Export button. The details area shows "Saved: <path>".
3. A first version that hid the new line until an export and then showed it did not draw in After Effects (a hidden, then shown statictext stayed empty). It was replaced by an always-present, initially blank line; unit tests were updated to match.

## Automated tests (test doubles, not host evidence)
`panel_wrapper` and `fixture_confirmation` 43/43 (one new test; assertions that the status becomes "Report exported." were changed on purpose), behavioral regressions 74/74, static checks pass, unittest 10/10.

## Not covered
Japanese UI after export, the cancelled and failed export lines natively, a floating palette, other widths, other After Effects builds. Gate unchanged: BLOCKED_NATIVE_VALIDATION; not approved for distribution.
