# Beta demo checklist

Working target: **22 October 2026**. Official submission deadline: **unconfirmed**. A prepared demo is not native acceptance.

## Before recording

- [ ] Review `PROJECT_STATUS.md` and `TEST_RESULTS.md`; show `BLOCKED_NATIVE_VALIDATION` while any required native gate remains blocked.
- [ ] Record branch/commit and beta archive SHA-256 from the exact package being demonstrated.
- [ ] Record AE version/build, OS, locale, font identities, and fixture provenance.
- [ ] Use a disposable project. Complete mutating fixture setup separately from scanning. Verify each intended setup through a fresh Source Text/property readback.
- [ ] Follow the unresolved BIB checkpoint; do not silently rerun or edit the baseline mixed-font fixture. Stop additional investigation at two hours and record blocked work.
- [ ] Have exported native reports and before/after snapshots ready. Label the bundled sample **SYNTHETIC, NOT NATIVE** if it is shown.

## Short demonstration

1. Activate the verified static fixture composition; show its name and relevant layers.
2. Run `src/JPFP_Session1_Probe.jsx` through **Run Script File…** and export a report. Alternative: open the dockable panel, select one composition, press **Scan composition**, open **Show details**, then **Export report...** (an empty composition must show amber "nothing was checked", never green).
3. Show composition/layer/character location, applied-font identity, substitute or coverage-gap findings, and mixed-font review.
4. Show verified, skipped, failed, and unknown coverage explicitly. Explain that an unverified identity cannot count as verified glyph coverage.
5. Show animated and expression Source Text as not checked, and empty text as zero characters.
6. Show Unicode review findings and UTF-16 offsets. State that glyph coverage does not establish rendered fallback or shaping correctness.
7. Run the same scan again without edits; compare results, elapsed time, revisions, and the independent before/after state snapshot.
8. Demonstrate export cancellation and a controlled write failure in the disposable environment. Capture `CANCELLED` and `FAILED`; a missing/partial report is not an export pass.

## Before submission

- [ ] F01–F12, L01, R01 have verified conditions, expected/actual results, host/build, timing, repeatability, before/after state, and evidence paths.
- [ ] `NOT_RUN`, `BLOCKED`, `INCONCLUSIVE`, or historical partial results remain separate from pass counts.
- [ ] Source checks, behavioral regressions, packaging tests, and CI pass on the submitted commit.
- [ ] Rebuild package after the final commit; verify ZIP and internal payload hashes, installation steps, limitations, sample provenance, and review the PR.
- [ ] State the actual release gate. If native execution is still unavailable/incomplete, deliver the reviewable beta candidate with **BLOCKED_NATIVE_VALIDATION** and precise remaining native steps.
