# AE JP Glyph / Font Preflight: user guide

Host: Adobe After Effects 2026 (tested on 26.5). Status: beta, not released.

## What it does
Checks the static Source Text of the **active composition** for font and glyph risks that matter for Japanese text: missing or substituted fonts, mixed fonts, characters the applied font may not cover, and Unicode edge cases. It is read-only.

## What it does not do
It does not scan other or nested compositions, animated or expression text, or prove how text will render. It does not fix anything.

## Install
1. Copy `src/JPFP_Session1_Panel.jsx` into After Effects' `Scripts/ScriptUI Panels` folder (for the application folder this needs administrator rights).
2. Copy `src/JPFP_Session1_Probe.jsx` into a subfolder named `JPFP` inside that same folder. The panel looks for the scanner there.
3. Restart After Effects and open the panel from the **Window** menu. Dock it as a tab. Do not put it in the same tab group as the Composition viewer, or the viewer is hidden.
4. To export a report, After Effects must allow scripts to write files (Preferences > Scripting & Expressions).

## Use
1. Select exactly one composition (or click inside its Timeline).
2. Press **Scan composition**. Nothing is saved yet.
3. Read the status and the five counts: text layers checked, problems, review needed, not checked, coverage gaps. **Show details** opens the full scanner text.
4. Press **Export report...** to save the text report where you choose.
5. The language button switches Japanese and English; the choice is remembered.

## Reading the result
Green only when at least one text layer was checked and every count is zero. Amber means something needs review, was not checked, or nothing was checked (zero text layers is never green). Red means a problem was found. Grey means the counts could not be read. Green does not prove rendering or shaping.

## Remove
Delete `JPFP_Session1_Panel.jsx` and the `JPFP` folder from the `ScriptUI Panels` folder, then restart After Effects. (Removal has not been tested natively.)

## Limits
- Active composition only; static Source Text only.
- A deliberately missing font could not be created on the test machine, so the red "problems" state has not been observed natively.
- Beta, not released and not approved for distribution. Verified on one Windows machine only; no macOS, other-build or clean-profile claim is made (see `PROJECT_STATUS.md`).
- The Japanese wording has not had a native-speaker review.
- A scan describes what was checked. It never certifies the final output of your project.

Full status and evidence: `PROJECT_STATUS.md`. Licence: MIT (see `LICENSE`).
