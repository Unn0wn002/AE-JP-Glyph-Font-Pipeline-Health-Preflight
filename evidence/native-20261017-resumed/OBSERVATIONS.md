# Resumed native validation — 17 October 2026

Gate: **BLOCKED_NATIVE_VALIDATION**. Twelve required rows PASS; F02 and full R01 remain BLOCKED. NOT_RUN/BLOCKED never means PASS. Working target 22 October 2026; official deadline unconfirmed. This record supersedes the disabled-write-preference blocker in the earlier evidence directory; earlier evidence is retained with its original source identity.

## Source, host and isolation

- Branch `beta/static-preflight-20261017`, resumed from commit `4d60013345cfc0966b6f33ee2cc1ee5108de27ae`. Final implementation commit `b5582c489534331eb893bc260bc2b0990243a386` is pushed. The following evidence/packaging commit is identified by this branch's Git history and the package BUILD_INFO.json; no self-referential commit hash is claimed here.
- All four successful acceptance scans used production SHA256 `f93d221898e6dc75985e2fa5b7ffbde2850c2ebc39da889b21592c5f58d8156e`. The prior Unicode-failed scan used `756a31affd8e782ae1e37835d058239e1271fc242a68db85077e51c15769fd33`. Raw native bytes are preserved by `.gitattributes`.
- Windows 11 Pro 10.0.26300 x64; AE 26.5x89/build89/en_US; Asia/Jakarta UTC+07. The user manually enabled script file writes. The assistant did not change security preferences.
- Only disposable projects were created, saved and reopened. Native `.aep` files are ignored local artifacts; their hashes are recorded in SHA256SUMS.txt. No production project, font installation, font cache, or replacement operation was used.
- Independent ASCII setup passed in fresh processes 33428 and 11424. Read-only product scanning was separate from every mutating fixture script. The scanner never invoked the builder.

## BIB checkpoint experiment

The original Phase A diagnostic ran unchanged in process 33428. Its local CharacterRange.fontObject setter changed the local range to AniMeVisionMB_EN; fresh Source Text still reported MS-Gothic. The log completed with `COMP_OPEN_REQUESTED NO` and `SCRIPT_COMPLETED_COMPOSITION_LEFT_UNOPENED`. BIB 83::3 was visibly present immediately after script completion, while the composition pane remained `(none)`, and remained visible through the fixed ten-second observation. See phase-a.txt and phase-a-warning-observation.txt.

This establishes **pre-display warning reproduction during the mutating fixture/property-write experiment**. It does not identify the first native internal failure and does not establish scanner failure. Phase B is **NOT_RUN (conditional prerequisite absent)** because Phase A already raised BIB. The affected disposable project was saved, the process exited, and independent ASCII creation passed in a fresh process before further work. The baseline fixture and old diagnostics remain unchanged.

Conservative cumulative investigation charge: original 15:37:47–15:49:08 WIB = 11m21s; first resume charged 15:53–16:00 = 7m; continuation charged 20:43–21:07 = 24m. Total **42m21s**, remaining **77m39s** of the two-hour cap. The intervening human interruption/idle interval is excluded. Native investigation stopped by 21:06:48 WIB. These rounded bounds include implementation/validation work and overstate time spent specifically investigating BIB.

## Fixture conditions and actual results

The new builder uses documented `.font` string setters in a new empty unsaved project, appends durable before/after mutation logs, and never opens a viewer or runs the scanner. This is a separate diagnostic, not a rewrite of the baseline fixture. Every usable condition was re-read from fresh Source Text in both independent scan snapshots.

Attempt 1 stopped after F09 because its raw supplementary-character log could not be encoded by ExtendScript. The partial project/log were preserved. The repaired evidence logger escapes surrogate units; fixture strings were unchanged. Attempt 2 created all 12 aggregate layers and 100 large-composition layers; see fixture-setup-attempt2.txt.

- F01/F04: fresh MS-Gothic #265; actual glyph queries true for all fixture characters.
- F02: requesting the nonexistent PS name persisted as Meiryo #292, `isSubstitute=false`, for all six characters. Exact read-only probes before and after reopening the saved project confirmed the same state and `missingOrSubstitutedFonts` count 0. Therefore the missing/substitute condition is **unestablished**, not a scanner false negative. F02 BLOCKED.
- F03: fresh persisted mixed runs MS-Gothic #265 on [0,4), ArialMT #7 on [4,7). The report correctly marks intentional mixed fonts REVIEW; no error is inferred.
- F05: ArialMT #7 directly reported ABC=true and 漢=false before assignment. Fresh applied A/B retained ArialMT; the middle character became Meiryo #292 with coverage=true. Both scans report those identities and mixed-font REVIEW. PASS is limited to this matrix's **observed applied-font reassignment experiment**. Native retained applied-gap reporting remains UNVALIDATED. No exact rendered fallback or shaping conclusion follows.
- F06: existing empty layer, zero code points and coverage. F07: U+2000B, one code point spanning [0,2). F08: U+306F/U+3099, two observations. F09: U+845B/U+E0100, three UTF-16 units; variation selector coverage skipped. Unicode review remains explicit.
- F10: two distinct Source Text keys at 0/1 seconds. F11: enabled expression returning 式で生成 with no expression error. Both are NOT_CHECKED by the product and contribute zero verified coverage.
- F12: raw independent checks show TextLayer=false, SolidSource=true and null text group; setup provenance confirms addSolid and the same layer ID. The wrapper's derived label NON_TEXT is coarser than the raw evidence. The evaluator requires the raw checks and setup provenance.
- L01: exactly 100 static layers, 日本語 N for N=1..100, all fresh MS-Gothic, exactly 592 code points. Both complete scans passed.
- Full R01: two aggregate reports and two large reports agree substantively, but the complete controlled fixture condition is absent because F02 is unestablished. **BLOCKED**, with partial repeatability evidence retained separately.

ACCEPTANCE.tsv combines independently expected matrix outcomes with actual status, conditions, host, timings, state, evidence and next steps. evaluation.json/.tsv are offline checks of the actual reports/snapshots, not additional native executions. comparison-supplement.json records hashes and detailed state/semantic comparisons. Its source-hash and warning assertions were checked externally against the frozen source and UI observations.

## Timings, repeatability and before/after state

| Run | Report | State directory | Scanner time | Wall including dialogs |
|---|---|---|---:|---:|
| Aggregate 1 | aggregate-final-run1.txt | 20261017-205935-488 | 11 ms | 41368 ms |
| Aggregate 2 | aggregate-final-run2.txt | 20261017-210024-370 | 11 ms | 37409 ms |
| Large 1 | large-final-run1.txt | 20261017-210119-787 | 143 ms | 42582 ms |
| Large 2 | large-final-run2.txt | 20261017-210212-326 | 129 ms | 36352 ms |

Scanner time excludes report dialogs. Wrapper wall time includes manual/UI interaction and must not be treated as scanner performance. AE remained responsive, every report was complete, and no BIB/JavaScript warning was observed during these scans.

Both aggregate runs: 52 examined = 51 verified present + 1 skipped + 0 failed; 0 problems / 5 review / 4 not-checked findings. Both large runs: 592 examined/verified present, zero skipped/failed/findings. Each pair matches except Generated and scan duration. All before/after and across-repeat sampled states are equal: revision1186, saved path, dirty=false, item/layer counts, IDs/names, selection, active comp/time, Source Text, keyframes, expression state and per-range font identity. No sampling truncation or unknown snapshot observations occurred. Unobserved properties and rendered pixels were not compared.

## Export defect, fix and cancellation

The first aggregate scan on prior source failed with `Character conversion error`, leaving a zero-byte file. The summary explicitly reported FAILED; independent sampled state was equal and revision unchanged. See unicode-export-failed-observation.txt and directory 20261017-205735-426. Both aggregate-run1.txt and aggregate-original-unicode-export-failed.txt preserve that zero-byte result; neither is a report PASS.

The product now serializes every surrogate UTF-16 unit as ASCII `\uXXXX` inside report cells. Code-point labels and UTF-16 ranges remain intact; original strings still reach the character/glyph APIs. A regression reproduces a rejecting encoder. Both native aggregate exports then succeeded with U+2000B/U+E0100 preserved as escaped pairs. All four final exports were complete UTF-8.

A separate final-source 100-layer scan cancelled the native save dialog and reported **CANCELLED**, with no successful report claim. Directory 20261017-210309-246 has unchanged sampled state/revision; final-source-export-cancelled.txt retains the summary. Native permission-denied failure from the earlier session and the Unicode failure above retain their own earlier source hashes. Final-source open/write/close failures are additionally covered by mocks; no security preference was toggled for testing.

## Reproduce offline evaluation

From the repository root, using Python 3.12+:

```powershell
python scripts/evaluate_native_beta.py --evidence-dir evidence/native-20261017-resumed --setup-log evidence/native-20261017-resumed/fixture-setup-attempt2.txt --fixture-report1 evidence/native-20261017-resumed/aggregate-final-run1.txt --fixture-report2 evidence/native-20261017-resumed/aggregate-final-run2.txt --fixture-state1 evidence/native-20261017-resumed/20261017-205935-488 --fixture-state2 evidence/native-20261017-resumed/20261017-210024-370 --large-report1 evidence/native-20261017-resumed/large-final-run1.txt --large-report2 evidence/native-20261017-resumed/large-final-run2.txt --large-state1 evidence/native-20261017-resumed/20261017-210119-787 --large-state2 evidence/native-20261017-resumed/20261017-210212-326
```

Exit 1 is intentional while F02/full R01 are BLOCKED. To finish: use a disposable project with a genuinely persisted missing font reference, verify requested identity plus fresh `isSubstitute=true` before scanning, then run the complete controlled suite twice without edits and capture/export both states/reports. No font installation/removal or binary project editing is required or authorized by this procedure. Retain the native gap branch limitation unless that distinct condition is also established.
