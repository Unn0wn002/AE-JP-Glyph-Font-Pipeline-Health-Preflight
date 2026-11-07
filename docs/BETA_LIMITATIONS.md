# Beta scope and limitations

**Release gate: BLOCKED_NATIVE_VALIDATION.** Native acceptance rows are independent from static and mocked behavioral regressions. A row with no verified setup, no actual execution, or missing evidence is `NOT_RUN`, `BLOCKED`, or `INCONCLUSIVE`, never `PASS`.

## Checked scope

- Static Source Text in the active composition only.
- The applied character Font object returned by the host, substitute-font state, and that Font object's reported glyph coverage when the required reads and queries succeed.
- Mixed applied fonts as a review finding; intentional mixed fonts are not automatically errors.
- Explicit character identity and UTF-16 start/end offsets, with Unicode sequence review findings.
- UTF-8 text report export, including cancellation and failure feedback.
- Report text cells escape every surrogate code unit as ASCII `\uXXXX`, including valid pairs. The `codePoint` column retains the original scalar label and offsets remain UTF-16 units; escaping does not change the project text or establish shaping correctness.

## Unknown and unchecked scope

- Failed or unavailable Source Text, animation/expression-state, character-range, font, substitute-state, or glyph reads are explicit unknown/not-checked observations. A base-font fallback must never increase verified character coverage.
- Animated Source Text and expression-enabled Source Text are skipped. A snapshot is not full animated-text validation.
- No recursive precomposition or whole-project scan. Counts describe only the active composition and its observed layer/property state.
- `hasGlyphsFor()` reports a Font object's coverage. It does not identify an exact rendered fallback font or establish shaping, ligatures, grapheme behavior, kerning, visual equivalence, or layout correctness.
- Supplementary CJK, combining dakuten, variation selectors, and malformed surrogate text require careful native review. UTF-16 offsets are not user-perceived grapheme indices.
- An empty static text layer has zero character coverage by definition; it is not evidence that fonts or glyph APIs were exercised.
- Unavailable revision/state reads cannot establish project integrity. Equal revision values alone are not a complete proof of unchanged state; compare the separate native before/after snapshot.
- Variable-font-specific behavior, automatic replacement/installation, project repair, and large-project performance guarantees are outside this beta.

## Native evidence boundary

Historical native work reached AE 26.5x89 and partial F01/F04/R01 observations, with other fixture conditions incomplete. It does not validate the current scanner or all F01–F12/L01/R01 rows. BIB `83::3` was associated with mutating mixed-font fixture/property writes; the requested persisted mixed font was not established. That history does not prove failure of read-only scanning.

Preserve the baseline fixture builder and follow the September 24 property-write/deferred-display checkpoint. The separate beta diagnostic builder uses a different documented font-name setter path and fresh readback; successful setup on that path does not clear the historical fontObject/property-write hazard. Limit additional BIB investigation to two hours and retain warnings and failed attempts. See [native validation](NATIVE_BETA_VALIDATION.md) for the three diagnostic scripts, wrapper evidence, and offline evaluator.

F02 remains BLOCKED when the host does not persist the deliberately missing reference as an exposed substitute. A fixture setter returning successfully is insufficient, and setup failure is not scanner failure. F05 may verify that a known glyph-gap candidate was reassigned to a different covered applied FontObject for the middle character. That is an observable experiment result with mixed-font review; the native retained applied-gap branch remains UNVALIDATED unless separately executed with verified conditions. Neither branch establishes exact rendered fallback.

A native character-conversion error during report export is an export failure. Preserve its partial file and source SHA; rerun all required reports after a serialization change. Passing checks or reports from an earlier SHA cannot validate changed code. Until all 14 native rows pass with complete evidence and review, keep **BLOCKED_NATIVE_VALIDATION**.
