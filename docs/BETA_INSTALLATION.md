# Beta installation and report export

Version: **0.1.0-beta.1**. Release gate: **BLOCKED_NATIVE_VALIDATION** until the native matrix is executed and reviewed. This procedure does not claim native validation passed.

## Requirements

- Adobe After Effects on the validation host. Record the exact version, build, locale, and OS in every evidence set; the historical target was AE 26.5x89.
- For the full intended checks, a host exposing `TextDocument.characterRange`, `CharacterRange.fontObject`, `FontObject.isSubstitute`, and `FontObject.hasGlyphsFor`. Unavailable APIs reduce checked scope and must be reported explicitly.
- A local writable destination for exported UTF-8 reports. If AE blocks file writing, review **Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network**. Record any preference change and restore it after testing if desired. Network access is not used by the scanner.

## Verify and extract

1. Obtain the ZIP and its adjacent `.zip.sha256` from the same build. Compare the archive SHA-256 with the supplied value. In Windows PowerShell:

   ```powershell
   Get-FileHash -Algorithm SHA256 -LiteralPath .\AE-JP-Glyph-Font-Preflight-0.1.0-beta.1.zip
   Get-Content -LiteralPath .\AE-JP-Glyph-Font-Preflight-0.1.0-beta.1.zip.sha256
   ```

2. Extract to a local folder. Inspect `BUILD_INFO.json` for the branch/commit and source snapshot digest. `working_tree_dirty: true` means the contents were packaged from uncommitted working changes. `SHA256SUMS` records every payload file plus `BUILD_INFO.json`; it does not checksum itself.
3. Run `src/JPFP_Session1_Probe.jsx` directly with **File > Scripts > Run Script File…**. No permanent AE script installation, font installation, or replacement is required.

## Optional dockable panel (partly validated natively)

`src/JPFP_Session1_Panel.jsx` hosts the unchanged scanner in a panel so results appear inside After Effects instead of pop-up dialogs. On After Effects 26.5x89 (2026-10-29, `evidence/native-20261029-dock-panel/`) the panel appeared in the Window menu, docked, kept its dock position after a restart, and captured the scanner's messages and report without pop-ups; its report matched a direct run of the scanner. A panel scan of the builder's fixtures matched 15 of 16 counters of the 2026-10-19 direct run (F02 differs because the builder cannot make a genuine missing font), and Export saved a byte-identical report (`evidence/native-20261029-builder-fix/`). **The formal 14/14 evaluation (`scripts/evaluate_native_beta.py`) has not been run on the panel.**

1. Copy `JPFP_Session1_Panel.jsx` into the installed After Effects `Scripts/ScriptUI Panels` folder and put `JPFP_Session1_Probe.jsx` in a `JPFP` subfolder of it (confirmed: in `JPFP` the scanner gets no Window-menu entry of its own; next to the panel it also works but was not checked for a menu entry). Restart After Effects, then open the panel from the **Window** menu.
2. Select ONE composition (or click inside its Timeline) and press **Scan composition**. Nothing is saved until you press **Export report...**. The main view shows only what you need:
   - one status line and five count lines (text layers checked, problems, review needed, not checked, coverage gaps; a zero count is grey);
   - **Show details** opens the description and the scanner's own text exactly as the scanner wrote it (it opens by itself when there is no report, the scan is blocked or there is an error);
   - the language button (**日本語** / **English**) switches the whole panel and is remembered; Japanese is the default.
   Status colours: **green** only when at least one text layer was checked and every count is zero with no skipped or failed coverage; **amber** for review needed, not checked, a coverage gap, or when NOTHING was checked (zero text layers is never green); **red** for problems; **grey** when the counts cannot be read. A green status still does not prove rendered fallback or shaping correctness.
   The panel scans the ACTIVE composition only: not other compositions, nested compositions, or animated / expression text. Scan each composition in turn.
   If it says "Open/select a composition first" while a composition is open, select exactly one composition in the Project panel, and do not stack the panel in the same tab group as the Composition viewer (that hides the viewer, so there is no active item).
3. If the panel reports `Blocked`, this AE build did not allow replacing the report-save dialog and the scan was not run; use the direct **Run Script File...** route above. (After Effects 26.5 does not allow reassigning `alert`, so the panel runs the scanner's text with its own `alert` shadowed instead.)

## Scan and export

1. Open the intended project and activate the composition to inspect. For beta acceptance testing use only a disposable project whose fixture conditions have already been independently verified.
2. Run the scanner. It checks static Source Text in that active composition; animated/expression layers are explicitly outside coverage.
3. Choose a `.txt` destination at the export dialog. The scanner reports `OK` only when writing and closing the report succeeds. Review the final alert for the export result and destination.
4. `CANCELLED` means no exported report was produced. Rerun and select a destination when evidence is needed. `FAILED` means export did not complete; preserve the alert/error, choose a writable destination or address the AE preference, and rerun. A partial file after failure is not valid evidence.
5. Read coverage counts before interpreting findings. `UNKNOWN`/`NOT_CHECKED`, skipped layers, failed reads, and Unicode review findings prevent an unrestricted safety claim. Zero findings only describes checks that actually ran.

## Remove

Delete the extracted beta folder when it is no longer needed. Retain exported reports separately as evidence. The scanner does not intentionally change the AE project; revision/state comparison is required in native validation because static inspection cannot prove host behavior.

## Source checkout versus installed archive

The archive omits mutating fixture builders, host-isolation diagnostics, and development tests. Native fixture preparation requires the source checkout and the [native protocol](NATIVE_BETA_VALIDATION.md). Use a disposable project for that preparation.
