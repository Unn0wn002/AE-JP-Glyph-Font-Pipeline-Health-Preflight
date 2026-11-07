# CHANGELOG — Project 9-A

## Unreleased — 2026-10-29

- Fixture builder only: a font setter counts as successful only when a fresh readback matches (AE-05), and each fixture runs in its own guarded step so one failure cannot stop the rest, including `addText("")` returning no layer (AE-06). Failed fixtures are reported as NOT ACCEPTED with readback evidence.
- The scanner (`src/JPFP_Session1_Probe.jsx`) is unchanged: its read-failure, expression/keyframe, base-font and revision guards already existed in 0.1.0-beta.1.
- Added `tests/fixture_confirmation.test.js` (10 test-double tests, Node `vm`). They are not host evidence; no After Effects run was made for this change, and the fixture builder was not re-run natively.

## 0.1.0-beta.1 — 2026-10-17

- Hardened direct character-font, Source Text/classification/API and revision reads; removed guessed base-font coverage and project-wide font listing.
- Added located coverage/identity/substitute/mixed/Unicode observations and explicit skipped/failed/export outcomes.
- Added 73 production-JSX mock regressions, CI, deterministic beta packaging, install/limitations/demo/native-acceptance instructions and a labelled synthetic report.
- Retained limited AE 26.5x89 ASCII smoke observations, failed/cancelled native export outcomes and independent state. Required native fixtures remain BLOCKED_NATIVE_VALIDATION. Preserved baseline BIB fixture checkpoints.

## 2026-09-15 — Session 1 feasibility scaffold

### Added

- Isolated project folders for source, fixtures, tests, checkpoints, and `Research and Riset` work logs.
- Read-only feasibility scanner `JPFP_Session1_Probe.jsx`.
- Disposable native fixture builder `JPFP_Session1_CreateFixtures.jsx`.
- Independent expected-results matrix covering supported JP, missing font, mixed fonts, punctuation, glyph-gap experiment, empty text, non-text, animated/expression text, supplementary-plane characters, combining marks, variation sequences, repeated scans, and a 100-text-layer composition.
- Native test instructions.
- Required continuity files: `README.md`, `PROJECT_STATUS.md`, `TEST_RESULTS.md`, `CHANGELOG.md`.

### Research findings

- Confirmed documented public APIs for font objects/substitute state, per-character formatting, project used-font mapping, and font glyph coverage at AE 24.0/24.3/24.5/25.1 version boundaries respectively.
- Exact rendered fallback-font identity remains unverified and is the primary native feasibility question.

### Testing

- Native After Effects tests: **NOT RUN** because the assistant runtime is Debian Linux and has no AE executable.
- No compatibility claim has been made for the user's installed AE build.

- 2026-11-02: honest status, count lines, no-composition note and narrow-dock layout for the panel (display only; scanner unchanged). Native docked check PASS_BOUNDED_NATIVE incl. the first native Export run; red state NOT_RUN natively. 22 panel tests, 74 behavioral, 10 unittest pass. Evidence `evidence/native-20261102-honest-status/`.

- 2026-11-02: zero-checked fix: a scan of a composition with no static text (Static text layers checked: 0) is amber "nothing was checked", never green; green needs at least one layer checked and all counts zero; first count line "Text layers checked". 25 panel tests pass. Native check on the owner's Comp 1 (floating run, project untouched). Evidence `evidence/native-20261102-zero-checked/`.

- 2026-11-02: compact view: one language at a time (button, saved in AE settings, Japanese default), details area (description + scanner text) hidden by default and opened automatically on no-report/block/error, count lines kept. 32 panel tests pass. Native floating check PASS_BOUNDED_NATIVE incl. narrow width. Evidence `evidence/native-20261102-compact-view/`.
