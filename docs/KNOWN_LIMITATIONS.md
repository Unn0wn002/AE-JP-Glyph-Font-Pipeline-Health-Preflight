> **Historical status document (last updated 17 October 2026).** For current status see [PROJECT_STATUS.md](../PROJECT_STATUS.md). Content below is kept unchanged for history; known outdated: it says AE 26.5 was never run and export was blocked; current limits are in BETA_LIMITATIONS.md.

# Known Limitations

Current authoritative beta limitations (17 October 2026): [BETA_LIMITATIONS.md](BETA_LIMITATIONS.md). Gate: **BLOCKED_NATIVE_VALIDATION**. AE 26.5x89 is available and limited ASCII scanner smoke ran twice; full fixture validation and successful report export remain blocked by disabled script file writes and unresolved fixture setup. The statements below are historical and do not supersede current PROJECT_STATUS/TEST_RESULTS. Historical BIB fixture-write evidence does not establish scanner failure.

- After Effects 26.5 has not yet been executed for the Project 9-A native feasibility suite.
- The latest local attempt found AE 26.3x87 rather than 26.5.
- Exact rendered fallback-font identity remains UNKNOWN / CANNOT VERIFY.
- Glyph coverage does not prove shaping or visual correctness.
- Session 1 scans only the active composition.
- Animated/expression-driven Source Text is explicitly not checked.
- Unicode edge cases remain unverified.
- Nested/precomp traversal is deferred.
- Dedicated variable-font native fixture still needs to be added after baseline restoration.
- Large-project performance remains unmeasured.

- Current AE 26.5 test host cannot create text layers because of BIB 83::3; this blocks all text-based feasibility fixtures until the host/font environment is repaired.
- The solid-only read-only control is verified, but it is not evidence for text-layer diagnostic correctness.

- Basic ASCII text creation recovers after restart, but BIB 83::3 can recur during a more complex font/text sequence.
- The first triggering operation is not yet identified; the line reported at `endUndoGroup()` may only be where the host surfaces prior internal state corruption.
- Partial F01/F04 observations are not equivalent to a complete fixture-suite pass.
