# Session 1 Native Fixture Instructions

These instructions are for a disposable After Effects project. The fixture builder modifies the current project; the feasibility probe does not intentionally modify the AE project.

## Required sequence

1. Launch the Windows After Effects version you actually intend to test.
2. Create a **new throwaway project**. Do not open CutBridge or production work.
3. Run `JPFP_Session1_CreateFixtures.jsx` with **File > Scripts > Run Script File...**.
4. Record the alert text, especially the selected Japanese font, Latin font, and glyph-gap candidate.
5. With `JPFP_S1_FIXTURES__DISPOSABLE` active, run `JPFP_Session1_Probe.jsx`.
6. Export the report when prompted. If export fails, enable **Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network**, rerun, and record that the preference was required.
7. Run the probe a second time without editing the project. Confirm that project revision is reported unchanged on each scan and compare findings.
8. Activate `JPFP_S1_LARGE_100_TEXT__DISPOSABLE` and run the probe once. Record whether AE remains responsive and whether the report is complete.
9. Save screenshots only if useful; do not infer pass/fail from appearance alone. Preserve the exported report as evidence.

## Evidence to return

Provide the exported report(s), and state whether the fixture-builder alert named a glyph-gap candidate font. The report itself records AE version, build name/number, AE locale, OS, project revision before/after, coverage counts, findings, and observed per-character Font objects.

## Pass/fail boundary for Session 1

- A substitute/missing font can be considered **host-detectable** only if native AE returns the documented substitute state on F02.
- Character-level font identity can be considered **host-verified** only if F03 shows distinct per-character Font objects matching the two intentionally assigned runs.
- Character coverage can be considered **host-verified** only if `hasGlyphsFor()` executes in the actual host and results match F01/F04 plus the preselected gap condition for F05.
- **Exact rendered fallback font identity is not proven** merely because a coverage gap is detected. F05 exists specifically to observe whether AE exposes the fallback run, keeps the requested font identity, or behaves differently.
- F07–F09 remain edge cases unless their range and glyph behavior are independently verified.
