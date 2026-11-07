# Native check: fixture builder fix and full panel run (2026-10-29, ~18:00-18:10 WIB)

Host: Windows 11 Pro, After Effects 26.5x89 (en_US). Panel `8c1e73c` installed; scanner unchanged (`f93d2218...8156e`). Earlier runs: `native-20261029-dock-panel/`, `native-20261029-dock-panel-run2/` (not edited).

## Root cause of the builder failure

Isolation scripts, each in a fresh throwaway project, with AE dialogs suppressed and results written to files:

| Script | Result |
| --- | --- |
| `isolate_empty_text.jsx`: `addText("")`, `addText()`, space-then-clear, plain text | all work (`isolate-result.txt`) |
| `isolate_font_on_empty.jsx`: set a Japanese font (BIZ-UDGothic) on empty and non-empty text | both work (`isolate-font-result.txt`) |
| `isolate_f02_f05.jsx`: F05 first, logging after every step | AE stops right after applying `AniMeVisionMB_EN` to "A漢B", at the next read of that layer's text; an AE alert appears even with dialogs suppressed (`isolate-f02-f05-result.txt`) |

The unchanged builder picked the glyph-gap font as the first installed font with Latin glyphs and no kanji. On this host that is `AniMeVisionMB_EN`, a third-party font. Applying it raises "Unknown BIB Error (83::3)" and leaves AE's text engine broken until AE restarts. Every text read after that fails, which explains the five unreadable layers, the failed plain `addText` later in the same session, and the repeating alerts. The same font and the same BIB 83::3 were already recorded on 2026-10-17 (`native-20261017-resumed/OBSERVATIONS.md`). The 2026-10-19 accepted fixture used Arial for F05.

My earlier guess (empty text at F06) was wrong and is corrected here.

## Fix

`fixtures/JPFP_Session1_CreateFixtures.jsx` now takes its Latin font and the glyph-gap font only from standard Windows fonts, in order: ArialMT, TimesNewRomanPSMT, Verdana, Tahoma, SegoeUI, Calibri, Georgia, TrebuchetMS. Each must still pass the same `hasGlyphsFor` checks. If none qualifies, F05 is named `__NO_CANDIDATE_FONT_FOUND` as before. A native AE error like this cannot be caught by script error handling, so avoiding the font is the only reliable guard.

## Native run with the fixed builder

| Check | Result | Evidence |
| --- | --- | --- |
| Builder completes, one run | PASS: F01-F12 and the 100-layer comp built, normal completion alert, no BIB error; F05 candidate ArialMT | observed |
| Scanner guard message shown inline (no active comp) | PASS: "Open/select a composition first" in red inside the panel, no pop-up | observed |
| Panel scan of the fixture comp | PASS: no dialogs; project revision unchanged (1188 -> 1188) | `panel-scan3-fixtures-report.txt` |
| Counters against the 2026-10-19 direct run (`native-20261019-zen/aggregate-run1.txt`) | 15 of 16 identical (layers, 9 static checked, 52 characters, 51 coverage verified, 1 skipped, 2 mixed-font, 5 review, 4 not checked). Different: Problems 0 vs 6 | comparison below |
| Export button | PASS: save dialog opened only on press; saved file byte-identical to the scan output; panel showed "Saved: ..." | `panel-export-report.txt` |

Problems 0 vs 6 is expected: the 2026-10-19 run used the separately authored genuine F02 fixture (an uninstalled real font, six substitute characters). This builder's F02 sets a made-up font name, which AE on this host does not report as a substitute. This is the documented reason the beta keeps a genuine F02 fixture; it is not a panel result.

## Limits

- `scripts/evaluate_native_beta.py` (the formal 14/14 evaluation with fresh-state snapshots and the genuine F02 binding) was not run. The 15/16 counter match is a comparison, not that evaluation.
- The 100-layer comp was built but not scanned.
- One host, one session.
