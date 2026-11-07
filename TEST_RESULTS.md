> **Historical status document (last updated 19 October 2026).** For current status see [PROJECT_STATUS.md](PROJECT_STATUS.md). Content below is kept unchanged for history; known outdated: "PR #1 stays draft" (merged 2026-10-30) and no panel results after 19 October.

# TEST_RESULTS — Project 9-A

## Fresh genuine-fixture acceptance — 19 October 2026

**Fresh native matrix: F01–F12, L01 and full R01 PASS (14/14).** Evaluation is NATIVE_MATRIX_PASS_PENDING_REVIEW; the package remains BLOCKED_NATIVE_VALIDATION until required human evidence review. PR #1 stays draft. No merge or publication.

The user expressly authorized installing **only Zen Kaku Gothic New Regular on main AYAKUMI_NOZOMI**, superseding the earlier existing-font-only restriction solely for this face. The one TTF came from official googlefonts/zen-kakugothic commit 2705757e17e42954f3acbdf921ac0ae24d1270cd. Windows Font Viewer installed it per-user (HKCU; LocalAppData/Microsoft/Windows/Fonts), with no OS consent prompt. Downloaded and installed SHA-256: **b840cd07a67d89cacca44249ae49aa99ee7640eb5ce623be8d8983d6aabac801**. Windows and AE observe version **1.002**, actual PS **ZenKakuGothicNew-Regular**, main FontObject **#346/substitute=false**, with native coverage on all six 欠落フォント characters. No alternative font was installed. See evidence/native-20261019-zen/installation.json and AUTHORIZATION.txt.

Main authoring: AE **26.5x89/build89/en_US**, Windows 11 Pro **10.0.26300 x64**, OS/UI en-US. Only F02's font changed on a fresh disposable copy of the retained source. Six fresh reads after assignment and after save/close/reopen prove exact-font persistence without substitution and true coverage. Other sampled aggregate/L01 properties match after excluding only F02 character font metadata. The failed Cascadia attempt and original project remain unchanged; original SHA-256 is 5f64f70c6fa639447435e5869120068feb6e32a755a4ea0a58491babdddd8007.

Genuine ignored fixture: **artifacts/native/F02-operator/genuine-F02.aep**, SHA-256 **af3b1bd641a0955f63230f44b7e53987cddccd7099bffb832718f1ea7aa21306**, saved **19 October 2026, 16:35:34 WIB (UTC+07:00)**. Adjacent fixture-provenance.txt records source/font/host metadata, project hashes, composition **1**, F02 layer **14** and authoring evidence. Raw authoring and independent preservation reads are in evidence/native-20261019-zen/. AEP/TTF binaries stay ignored and outside the review package.

The existing Sandbox **3E6B83F9-7F9C-4** remains open: AE **26.5x89/build89/en_US**, Windows 11 Enterprise **24H2/build26100.9711 x64**, English (United States) display, UTC+07:00. No font was copied, installed or activated there; no cache/security setting changed by the agent. Previously enabled script writes worked. Substitute synchronization was frozen (freezeSyncSubstitutedFonts=true) before project open; automatic activation was not enabled. Exact-PS lookup was empty before open. Afterwards all six F02 characters report the real PS, **#320/substitute=true**, with matching missingOrSubstitutedFonts inventory. The substitute object's version6.51/location meiryo.ttc is an API observation, not an exact rendered-fallback claim. Required installed controls remain ArialMT #6/v7.06, Meiryo #266/v6.51 and MS-Gothic #239/v5.32.

Explorer transferred only the AEP, provenance and diagnostics. The received original was preserved before opening an unsaved disposable sandbox-work.aep. Both received original and disposable were returned to separate main receipt directories and match the authored hash; scanner/wrapper/provenance roundtrip hashes match too. A slow script-only binary hash calculation was canceled before any project open; its source, Execution halted message and screenshots remain evidence. A later bounded-memory diagnostic independently computed all26 Sandbox-origin export/state hashes in9 seconds (19:39:10–19:39:19 WIB). Every hash and byte count matches the returned main bytes, including all four reports and16 wrapper JSON files. See sandbox-origin-sha256.json and origin-hash-verification.json; the earlier transfer records retain their then-current observations.

Fresh prerequisite reads establish aggregate12 layers/11 text/9 static/52 static code points, exact F10 keys, evaluated F11 expression, raw F12 solid/null-group checks, and L01 composition26 with100 uniquely numbered static layers/592 code points. Hash-bound fixture-binding.json links the real provenance, authoring, native prerequisite, state and received bytes. The optional evaluator binding verifies byte hashes, host, real PS/missing inventory and current comp/layer/text/font/key/expression mappings. F05 uses fresh ArialMT ABC=true/漢=false and preserved saved reassignment; no fabricated historical markers. The new diagnostic/evaluator adaptation is retained. Production scanner, baseline builder and state wrapper remain unchanged.

Aggregate ran twice and L01 twice through the unchanged wrapper and normal dialogs, without intervening text/font/project edits. All four sampled before/after states match, revision **1463**, dirty=false; both substantive report pairs match after excluding generated timestamp and measured scan duration. Aggregate scanner times **13/12ms**, coverage51 verified/1 skipped/0 failed, six located substitute findings. L01 **279/163ms**, coverage592 verified/0 skipped/0 failed. Wall times including dialogs:49,520/60,856ms and8,790,914/69,860ms. First L01 includes interrupted human wait until19:23:58 WIB; raw wall time is retained, not treated as scanner performance. No BIB/AE/JS warning was observed at successful authoring, prerequisite, export and completion captures; the unattended wait was not continuously monitored. F11's derived ANIMATED and F12's NON_TEXT label discrepancies remain disclosed; authoritative raw checks are unchanged.

F05 PASS covers applied-font reassignment only. Its native retained applied-gap branch, exact rendered-fallback identity and shaping remain **UNVALIDATED**. Human evidence review remains required. This section supersedes earlier F02-blocked/existing-font-only handoffs for this expressly authorized fixture; historical evidence remains intact.

Closeout checks: static PASS; behavioral **74/74 PASS**; unittest **10/10 PASS** (seven genuine-binding/integrity and three package regressions); all six new diagnostic/helper sources parse; all **76 prior-manifest entries** and frozen scanner/builder/wrapper/source/failed-attempt/genuine-fixture hashes match. All26 Sandbox-origin hashes and byte counts match. CHECKS.json and SHA256SUMS.txt retain the current check record and evidence integrity. Final archive/CI binding is reported on draft PR #1 after the clean commit.

Conservative additional investigation charge **44m**:30m from16:30:21 through approximately16:58 WIB (rounded through17:00),6m for19:23:58–19:29:24 WIB, and8m for19:35:11–19:42:39 WIB including independent origin-hash verification/transfer. Human interruption and intervening/later repository closeout are excluded. Cumulative **108m21s**, remaining **11m39s** (6501+699=7200 seconds). SESSION.json retains interval accounting and limitations.



| ID | Fresh setup | Native result | Scope |
|---|---|---|---|
| F01 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F02 | VERIFIED | PASS | Six located substitute findings for real saved Zen reference |
| F03 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F04 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F05 | VERIFIED | PASS | Covered applied-font reassignment; retained gap/rendered identity/shaping UNVALIDATED |
| F06 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F07 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F08 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F09 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| F10 | VERIFIED | PASS | Two keys verified; product explicitly skips coverage |
| F11 | VERIFIED | PASS | Expression evaluated; product explicitly skips coverage |
| F12 | VERIFIED | PASS | Raw prerequisite and both current reports match |
| L01 | VERIFIED | PASS | 100 layers;592 code points;279/163ms |
| R01 | VERIFIED | PASS | Both aggregate/L01 report pairs equal; all four sampled states unchanged |

Fresh raw reports: aggregate-run1.txt / aggregate-run2.txt / large-run1.txt / large-run2.txt in evidence/native-20261019-zen/. The four timestamp directories there contain unchanged-wrapper before.json, after.json, comparison.json and run.json. All rows bind Sandbox AE26.5x89/build89/en_US and the declared genuine AEP; historical partial results below retain their original source/host binding.

## Current real-font native evidence — 19 October 2026

The user manually enabled Sandbox AE script writes, and a fresh inventory export succeeded at **14:55:43 WIB**. The earlier zero-byte permission-denied output and overwrite refusal were preserved; a unique `sandbox-host-inventory-v2.txt` was used. Main Windows and the existing Sandbox both execute AE **26.5x89/build89/en_US**. Main host `AYAKUMI_NOZOMI`: Windows 11 Pro `10.0.26300` x64, OS/UI `en-US`. Sandbox environment name `3E6B83F9-7F9C-4`: Windows 11 Enterprise **24H2/build26100.9711** x64 (read from Settings > System > About), display language **English (United States)**, region World, UTC+07:00. Settings were only read; the agent changed no security or font setting. Sandbox remains open.

**A genuine F02 fixture is still BLOCKED after one real-font authoring attempt.** Actual inventories contain **345 main / 319 Sandbox fonts**, with all three control PS identities present in Sandbox: `ArialMT` #6/version7.06, `Meiryo` #266/version6.51 and `MS-Gothic` #239/version5.32, all substitute=false. The 26 main-only PS identities include no font reporting coverage for the entire `欠落フォント` string. Selected existing real candidate **CascadiaCode-Regular**, version **2407.024**, main FontObject #57/substitute=false, is absent by exact PS in Sandbox and reports all-six coverage=false. On a disposable copy of the retained source, its documented font-name assignment returned **Meiryo** even on the local TextDocument. All six fresh character reads, both before and after save, show **Meiryo #292 / substitute=false**. This is an authoring/fixture-condition blocker, not a scanner false negative.

Saved the failed experiment as ignored `artifacts/native/F02-operator/F02-authoring-attempt.aep`, SHA-256 **6ff25c66e07821469f45d88437e652afddcab03e794cc616795a802923452fb8**, at **14:59:32 WIB** with `attempt-provenance.txt`. It is **not** `genuine-F02.aep`; no genuine fixture/provenance was fabricated. The original source remains SHA-256 `5f64f70c6fa639447435e5869120068feb6e32a755a4ea0a58491babdddd8007`. Raw all-composition before/after samples match exactly: aggregate12 layers/9 static/52 static code points; L01 100 static/592. F10 retains two keys at0/1s; F11 raw expression=true/keys0/error empty/evaluated `式で生成`. The copied wrapper's derived F11 label says ANIMATED despite those raw properties; preserve that label discrepancy without treating it as a production-scanner failure. No BIB was observed in this attempt or at the post-alert unopened-comp capture; historical BIB limitations remain.

Explorer clipboard transfer works **both directions**. The returned v1 probe matches its original SHA-256 `3c9568ba2157b760bba1200e60673458d12f1a332170c2eda5c15bff9f793b5c`. The successful Sandbox inventory and screenshots are preserved on main Windows in `evidence/native-20261019-resumed/`; local transferred-copy hashes match. A Sandbox-origin SHA-256 of the generated inventory was not independently computed and is not claimed. `SESSION.json`, `author-before.json`, `author-after-assignment.json`, `author-outcome.json`, `font-comparison.json`, executed helper sources and attempt provenance retain the observations. Project/font binaries stay in ignored policy locations; no font was transferred, installed, removed, activated or cache-modified. Sandbox's observed freezeSyncSubstitutedFonts=false was not changed, and no missing-reference project was opened there.

Dependent native work stopped: **no genuine fixture transfer/open, substitute inventory proof, binding adaptation, scanner run or acceptance evaluation**. Retained original-host/source results remain **F01, F03–F12, L01 PASS; F02/full R01 BLOCKED (12/14)**; this continuation adds zero native PASS rows. F05's native retained applied-gap, exact rendered-fallback and shaping remain UNVALIDATED. Production scanner, baseline builder, state wrapper and existing evaluator/inspector remain frozen. No invented-font setter or equivalent setup retry was performed.

Conservative native interval **14:51:19–15:02:06 WIB**, charged **12m**; cumulative **64m21s**, remaining **55m39s**. Prior human wait and later repository checks/packaging are excluded. Next prerequisite: a controlled saved reference using a real pre-existing font that actually persists on all six F02 characters and is unavailable in validation. Current main-only candidates do not report full-string coverage, and the single tested candidate was reassigned. Do not install/remove fonts, force invented identities, waive mismatch, or repeat equivalent setters. After a suitable genuine saved fixture exists, retain real provenance, bind diagnostics to its actual PS/fresh IDs, reverify every condition in Sandbox and run the two aggregate/two large scans unchanged. Keep PR#1 draft and **BLOCKED_NATIVE_VALIDATION**; no merge or publication.

Local checks PASS: static suite; behavioral mocks **74/74**; package regressions **3/3**; new executed JSX parses **2/2**; all **61 prior manifest entries**, raw F02/F10/F11 checks, sampled composition preservation, frozen sources, budget consistency and whitespace. These are not new native acceptance. See `evidence/native-20261019-resumed/CHECKS.json`. Rebuild the archive from the final clean commit; BUILD_INFO.json and Git history bind the exact revision without a self-referential hash.

This section supersedes earlier pending script-write and unavailable-environment statements below; earlier raw evidence/history is retained.

## Dual-host access evidence — 19 October 2026

Both native AE environments were accessed on 19 October 2026. Main Windows launched successfully and reports AE `26.5x89`, build `89`, `en_US`, on Windows 11 Pro `10.0.26300` x64 (OS/UI locale `en-US`). Sandbox was already open with AE at an empty project; its About dialog reports **26.5.0 (Build 89)**. Sandbox scripting/OS locale and exact OS build remain **NOT_VERIFIED**. Explorer clipboard file transfer **into Sandbox works**; reverse transfer and transferred-byte hashes are not yet verified.

The Sandbox read-only inventory probe executed but its evidence-file write failed with **Permission denied**, explicitly naming **Allow Scripts to Write Files and Access Network**. The agent did not change that security preference. The user said “let me enable it first”; completion is pending. Keep the existing Sandbox open. Manual next action: enable that preference in **Sandbox AE**, confirm, then retry the already transferred `sandbox-probe.jsx` via File > Scripts > Run Script File. Preserve/copy its output back and verify hashes before comparing fonts. Main inventory contains 345 FontObjects; its raw `fontActivation` row actually reads `fontsWithDefaultDesignAxes`, so it establishes no automatic-activation state.

No cross-host font difference or control-font availability is established yet. No `.aep` was opened/edited/saved, no F02 font was selected, no genuine fixture/provenance was created, and no acceptance scan or evaluator adaptation ran. This stop is due to the observed write prerequisite, not the initial absence of fixture files. The production scanner, state wrapper and baseline fixture builder remain unchanged. All 53 files in the prior evidence manifest verify, including the retained source project. New evidence is in `evidence/native-20261019-dual-host/RECOVERY.json`, the main inventory/OS record, executed probe sources and two Sandbox screenshots, all preserved on main Windows.

Retained results remain **F01, F03–F12, L01 PASS; F02 and full R01 BLOCKED (12/14)**, with their original source/host binding. New native acceptance: **NOT_RUN**. F05's retained applied-gap, exact rendered-fallback and shaping limits remain **UNVALIDATED**. Conservative native charge **6m** (14:33:18–approximately 14:38:45 WIB); cumulative **52m21s**, remaining **67m39s**. Human wait for the preference action and repository documentation/checks/packaging are excluded. Resume the investigation clock at the next native action. PR #1 stays open/draft, gate **BLOCKED_NATIVE_VALIDATION**; no merge or publication.

Local closeout checks: static PASS, behavioral mock regressions **74/74 PASS**, package regressions **3/3 PASS**, executed probe-source parse checks **2/2 PASS**, frozen-source/prior-evidence/budget integrity and whitespace PASS. These checks establish no native acceptance. See `evidence/native-20261019-dual-host/CHECKS.json`. Rebuild the review archive from the final clean committed revision; Git history and BUILD_INFO.json identify that revision.

Earlier records below are retained history; this continuation supersedes earlier claims that no separate environment was available. After the write prerequisite is resolved, use main Windows for authoring and Sandbox for validation, as requested.

## Current beta evidence — 19 October 2026

Latest intake from `f2292223e57cee72cbc9b5beee6c8e06bbe21b98`: **no new native execution or acceptance evaluation**. Required `artifacts/native/F02-operator/genuine-F02.aep` and `fixture-provenance.txt` are absent. AE 2026 is listed installed but not running/no window; fresh AE access/build is NOT_VERIFIED and no separate authoring environment was available in inspected surfaces. Stopped before launch, setup, adaptation or scan. The six retained project hashes match prior intake; scanner and baseline builder remain frozen. Evidence: `evidence/native-20261019-fixture-intake/INTAKE.json`. The table below retains earlier source-bound evidence: **F01, F03–F12, L01 PASS; F02 and full R01 BLOCKED**. F05's native retained applied-gap, rendered fallback and shaping remain UNVALIDATED. Conservative additional intake charge 2m; cumulative **46m21s**, remaining **73m39s**. Unchanged engineering/native suites were not repeated locally for this documentation-only intake.

**Overall: BLOCKED_NATIVE_VALIDATION.** Working target 22 October 2026; official submission deadline unconfirmed. This section supersedes historical environment and current-gate claims below. `NOT_RUN` and `BLOCKED` are never PASS.

Continuation from `e4c34d4`: **no new native execution**. Targeted inventory found only the six prior disposable `.aep` files, all matching retained hashes, and no `.aepx` or attached project fixture. F02 remains BLOCKED (genuine unavailable-font condition absent); complete R01 remains BLOCKED. Existing 12 PASS rows and raw evidence are preserved. No setter retry, installed-font/cache change, binary edit, missing-font resolution or scanner/tool code change occurred. See `evidence/native-20261017-fixture-intake/INTAKE.json` and the single operator handoff in `docs/NATIVE_BETA_VALIDATION.md`. The old synthetic identity/provenance assumptions must be explicitly rebound to the genuine fixture when it arrives; current tooling is not asserted to validate arbitrary real identities. Additional intake charge2m; cumulative44m21s, remaining75m39s.

| Check | Evidence class | Actual result |
|---|---|---|
| Production JSX parse + read-only token/API checks + independent 14-row fixture matrix + beta diagnostic parses + evaluator compile | AUTOMATED LOCAL | PASS; `evidence/automated-20261017-resumed/static-checks.txt` |
| Behavioral regression suite | AUTOMATED MOCK AE | PASS 74/74; final evidence `evidence/automated-20261017-resumed/behavioral-regressions.txt`; includes native Unicode encoder rejection regression |
| Deterministic package, payload manifest, missing-input failure, changed-payload sensitivity | AUTOMATED LOCAL | PASS 3/3; `evidence/automated-20261017-resumed/package-tests.txt` |
| Native host identity | NATIVE AE | AE 26.5x89/build89/en_US; Windows 11 Pro 10.0.26300 x64 |
| ASCII creation control | NATIVE MUTATING SETUP | One `ABC 123` text layer created in a new disposable project; evidence logging denied. Not a product or fixture-suite PASS. |
| Pre-final production scanner, ASCII run 1 | NATIVE LIMITED SMOKE | 1 static layer; coverage 7/0/0; findings 0/0/0; revision unchanged; export FAILED/permission denied; zero-byte partial file retained |
| Pre-final production scanner, ASCII run 2 | NATIVE LIMITED SMOKE | Same summary counts/revision; export CANCELLED; no successful report saved |
| Earlier source after mixed-font accounting fix, ASCII smoke | NATIVE LIMITED SMOKE | Same 7/0/0 coverage, 0/0/0 findings, unchanged revision; export CANCELLED; final-source-smoke-cancelled.txt in original directory |
| Independent ASCII before/after snapshot | NATIVE LIMITED OBSERVATION | Same revision32, item count1, comp ID1, layer ID13, names/text/font, time0, keys0, expression=false, unsaved disposable state |
| Required F01, F03–F12 | NATIVE AE, RESUMED | PASS with independently verified conditions in both final runs; F05 PASS limited to observed applied-font reassignment, native retained-gap branch UNVALIDATED |
| Required F02 | NATIVE AE, RESUMED | BLOCKED; requested missing reference persisted as installed Meiryo #292, substitute=false; same after reopen, missing inventory count0 |
| Required L01 | NATIVE AE, RESUMED | PASS twice; exactly100 static text layers /592 code points, complete reports, no warning or state change |
| Required full R01 | NATIVE AE, RESUMED | BLOCKED by unestablished F02; aggregate and large report pairs/state match, retained as partial repeatability evidence |
| Successful report export | NATIVE AE, RESUMED | PASS four times on final source after Unicode serialization repair; user enabled writes manually |
| Export failure and cancellation | NATIVE AE + MOCK AE | Native prior-source permission/Unicode failures correctly FAILED and left zero-byte files; final-source cancellation correctly CANCELLED with unchanged state; final-source failure branches PASS in mocks |
| GitHub CI | REMOTE AUTOMATION | Resumed implementation b5582c489534331eb893bc260bc2b0990243a386 PASS, run39039773692; final evidence/packaging revision's actual conclusion is visible in PR checks |

Behavioral cases execute the production IIFE with deliberate failed/unavailable/invalid getters, healthy base-font traps, direct glyph true/false/invalid/error results, missing range APIs, unavailable metadata/substitute/revision, intentional mixed fonts, skipped animation/expressions without reading evaluated text, empty/non-text cases, supplementary/combining/variation/joiner/malformed UTF-16, escaped report cells, false/throwing open/write/close, cancellation, read-only mutation traps, and stable repeated observations. They cannot prove native font/render behavior.

Local runtime: Node 24.19.0; bundled Python 3.12.14. Final source SHA256 `f93d221898e6dc75985e2fa5b7ffbde2850c2ebc39da889b21592c5f58d8156e`; original ASCII/failed Unicode source `756a31affd8e782ae1e37835d058239e1271fc242a68db85077e51c15769fd33`. Earlier source-labelled evidence remains valid only for those earlier bytes. Final serialization escapes every surrogate code unit without changing original glyph-query strings or UTF-16 offsets.

Current native evidence: `evidence/native-20261017-resumed/OBSERVATIONS.md`, `ACCEPTANCE.tsv`, `evaluation.json/.tsv`, `comparison-supplement.json`, raw reports and timestamped independent snapshots. Final aggregate scanner times11/11ms; large143/129ms. Wall times including dialogs41368/37409ms and42582/36352ms respectively. Both pairs match excluding generation time/scan duration; before/after and across-repeat sampled state match, revision1186, dirty=false, no unknown snapshot observations/truncation. This proves sampled invariance only; no rendered/shaping claim or invented performance threshold. Earlier limited evidence stays in `evidence/native-20261017/`.

The original Phase A reproduced BIB83::3 before display after mutating property writes; fresh Source Text still lacked the intended mixed run. Phase B NOT_RUN because the no-warning prerequisite failed. That is fixture-write evidence, not scanner failure. After preserving/restarting and passing independent ASCII, a separate string-setter diagnostic established persisted mixed fonts; no BIB appeared in its final setup/scans. Baseline fixtures and historical diagnostics remain unchanged. Conservative cumulative active-work charge42m21s, remaining77m39s of the two-hour investigation cap; human idle excluded. Next: obtain a disposable project with a genuinely persisted missing reference, verify fresh substitute=true, then rerun complete controlled acceptance twice. Keep the package/draft PR gated BLOCKED_NATIVE_VALIDATION until then.

## Historical record

Last updated: 2026-09-15, Session 1

## Evidence classes

- **DOC VERIFIED** — current public documentation explicitly describes the capability.
- **AUTOMATED LOCAL** — executed outside AE in the assistant's Linux runtime; cannot prove host behavior.
- **NATIVE AE** — executed inside the actual After Effects host.
- **NOT RUN** — no execution evidence exists.

## Session 1 results

| Test | Evidence class | Result | Notes |
|---|---|---|---|
| Project-folder live-state inspection | Drive live read | PASS | Handoff DOCX was the only pre-existing item; no prior 9-A implementation found. |
| Assistant runtime OS/tool inventory | Local runtime | PASS | Debian 13, Python 3.13.5, Node 22.16.0, npm 10.9.2, Git 2.47.3. |
| AE executable available in assistant runtime | Local runtime | FAIL / EXPECTED | No After Effects executable found; Linux runtime cannot establish native AE behavior. |
| Current font-object/substitute APIs documented | DOC VERIFIED | PASS | `app.fonts`, `FontObject.isSubstitute`, missing/substituted inventory documented from AE 24.0+. |
| Per-character formatting API documented | DOC VERIFIED | PASS | `TextDocument.characterRange()` / CharacterRange documented from AE 24.3+. |
| Used-font layer/time mapping documented | DOC VERIFIED | PASS | `Project.usedFonts` documented from AE 24.5+. |
| Character glyph coverage API documented | DOC VERIFIED | PASS | `FontObject.hasGlyphsFor()` documented from AE 25.1+. |
| Exact rendered fallback font API identified | Documentation review | NOT VERIFIED | Default font mapping exists, but no reliable per-glyph rendered-fallback identity API was established from public docs. |
| Session 1 probe + fixture-builder parse check | AUTOMATED LOCAL | PASS | Node syntax check passed after removing the ExtendScript `#target` preprocessor line. This does not prove AE runtime compatibility. |
| Read-only mutation-token scan on product probe | AUTOMATED LOCAL | PASS | No project-mutating methods from the defined denylist were found in the probe; file export remains intentional. |
| Fixture expected-results matrix integrity | AUTOMATED LOCAL | PASS | 14 fixture/test rows present. |
| Session 1 probe host execution | NATIVE AE | NOT RUN | Requires user's Windows AE host. |
| F01 GOOD_JP | NATIVE AE | NOT RUN | Expected matrix prepared. |
| F02 MISSING_FONT_REFERENCE | NATIVE AE | NOT RUN | Core missing/substitute verification. |
| F03 MIXED_FONTS | NATIVE AE | NOT RUN | Core per-character font identity verification. |
| F05 GLYPH_GAP_EXPERIMENT | NATIVE AE | NOT RUN | Core differentiator/fallback-semantics experiment. |
| Unicode edge fixtures | NATIVE AE | NOT RUN | Supplementary, combining, variation sequences. |
| Repeated scan / no project mutation | NATIVE AE | NOT RUN | Probe records project revision before/after. |
| Large 100-text-layer fixture | NATIVE AE | NOT RUN | Responsiveness/completeness observation only. |

## Important interpretation

Documentation verification proves that the named public API exists at the stated version boundary; it does not prove that this prototype uses it correctly in the user's host or that the host returns the expected semantics for every font technology.

`FontObject.hasGlyphsFor()` can establish that a Font object reports glyph coverage for supplied characters. It does not, by itself, prove which fallback glyph/font was rendered, shaping correctness, or visual equivalence.


## 2026-09-23 recovery verification

| Test | Evidence class | Result | Notes |
|---|---|---|---|
| Restored probe blob integrity | Drive/local vs GitHub | PASS | Git blob SHA matched exactly. |
| Restored fixture-builder blob integrity | Drive/local vs GitHub | PASS | Git blob SHA matched exactly. |
| Restored expected matrix blob integrity | Drive/local vs GitHub | PASS | Git blob SHA matched exactly. |
| Restored static-test blob integrity | Drive/local vs GitHub | PASS | Git blob SHA matched exactly. |
| Static suite after repository recovery | AUTOMATED LOCAL | PASS | Node parse, mutation-token scan, required API references, 14-row fixture matrix. |
| Latest Windows AE host identity | NATIVE HOST IDENTITY | VERSION MISMATCH | AE 26.3x87 build 87, en_US; target is AE 26.5. |
| Functional native fixtures in latest attempt | NATIVE AE | BLOCKED / NOT RUN | Repository baseline was absent locally at time of attempt. |

No false-positive or false-negative rate may be calculated from the blocked native attempt.


## 2026-09-24 — Target-host attempt

| Test | Evidence class | Result | Notes |
|---|---|---|---|
| AE target host identity | NATIVE AE | HOST VERIFIED | AE 26.5x89, build 89, en_US. |
| Windows host identity | Native environment | VERIFIED | Windows 11 Home Single Language 10.0.26200.9457 AMD64. |
| Static suite on test PC | AUTOMATED LOCAL | PASS | Exit 0; parse, read-only token scan, required API references, 14 fixture rows. |
| Basic scripted text creation | NATIVE AE | HOST FAILED | Minimal addText("ABC 123") control inserted no text layer; BIB 83::3 observed. |
| Basic UI text creation | NATIVE AE | HOST FAILED | UI Text tool raised the same BIB 83::3 warning. |
| Fixture builder setup | NATIVE AE | HOST FAILED / SETUP BLOCKED | Composition created, but text-layer creation failed before success alert. |
| Solid-only probe run 1 | NATIVE AE | HOST VERIFIED | 1 non-text layer, 0 text layers, project revision 33 -> 33. |
| Solid-only probe run 2 | NATIVE AE | HOST VERIFIED | Same observed state; matched run 1 apart from generation time. |
| Full text-based R01 | NATIVE AE | BLOCKED | No text fixture could be created. |
| F01-F12 | NATIVE AE | BLOCKED | Host could not create text layers. |
| L01 | NATIVE AE | BLOCKED | 100-layer text fixture could not be built. |
| VF01 | Implementation state | NOT IMPLEMENTED | Dedicated variable-font fixture absent from restored baseline. |

No false-positive or false-negative rate is meaningful because the controlled text fixtures did not execute.


## 2026-09-24 — Recovery and partial fixture run

| Test | Evidence class | Result | Notes |
|---|---|---|---|
| UI ASCII text after restart | NATIVE AE | HOST VERIFIED | Created one layer with Source Text `ABC 123`. |
| Scripted ASCII `addText` after restart | NATIVE AE | HOST VERIFIED | Layer count 0 -> 1; Source Text `ABC 123`. |
| Fixture builder after restart | NATIVE AE | PARTIAL / HOST FAILED | Five text layers existed before BIB 83::3 aborted setup. First triggering operation not yet isolated. |
| Partial probe run 1 | NATIVE AE | HOST VERIFIED | 5 static layers; 47 glyph queries; project revision 99 -> 99. |
| Partial probe run 2 | NATIVE AE | HOST VERIFIED | Same checked scope and findings; revision 99 -> 99. |
| Partial R01 | NATIVE AE | HOST VERIFIED | Reports match after generated timestamp is excluded. |
| F01 partial | NATIVE AE | PARTIAL PASS | No finding within the partial scan only. |
| F04 partial | NATIVE AE | PARTIAL PASS | No finding within the partial scan only. |
| F02/F03/F05 | NATIVE AE | INCONCLUSIVE | Intended setup conditions were not proven before builder failure. |
| F06-F12 | NATIVE AE | BLOCKED | Builder stopped before these fixtures completed. |
| L01 | NATIVE AE | BLOCKED | Large text fixture not reached. |

False-positive/false-negative counts remain undefined for the intended fixture suite because the controlled setup conditions were incomplete.


## 2026-09-24 — BIB trigger isolation

| Test | Evidence class | Result | Notes |
|---|---|---|---|
| Tracer static syntax check | AUTOMATED LOCAL | PASS | Node check exited 0 after removing only #target directive in temporary copy. |
| Pre-tracer ASCII smoke | NATIVE AE | HOST VERIFIED | `ABC 123` created one text layer. |
| Font selection | NATIVE AE | OBSERVED | JP MS-Gothic; Latin/glyph-gap candidate AniMeVisionMB_EN. |
| First BIB boundary | NATIVE AE | LIKELY ISOLATED | Warning appeared during F04 addText before AFTER entry; no earlier CAUGHT exception. |
| F04 completion after warning dismissal | NATIVE AE | OBSERVED | F04 layer ultimately created and font assignment completed. |
| F06 empty-text call | NATIVE AE | HOST ANOMALY | addText("") returned without adding layer; next setName threw TypeError because layer was undefined. |
| Undo-group close | NATIVE AE | PASS | endUndoGroup completed, so it was not the first warning boundary in this run. |

Next confirmation test is the exact F04 string in isolation.


## 2026-09-24 — F04 standalone and F02/F03 causal matrix

| Test | Result | Interpretation |
|---|---|---|
| F04 standalone | PASS / NO BIB | F04 string alone is insufficient under fresh-process conditions. |
| F02 -> F04 | PASS / NO BIB | Missing-font assignment alone did not reproduce the warning. |
| F03 -> F04 | BIB ON COMPOSITION OPEN | F03 path associated with warning; F04 addText itself completed. |
| F02 + F03 -> F04 | BIB ON COMPOSITION OPEN | Adding F02 did not remove the F03-associated warning. |

Current evidence supports F03-path association, not yet the specific CharacterRange operation as causal.


## 2026-09-24 — F03 CharacterRange control/treatment A/B

| Test | Result | Evidence |
|---|---|---|
| F03 text-only control | NO BIB | 0_3=MS-Gothic; 4_7=MS-Gothic; whole=MS-Gothic; composition displayed normally. |
| F03 range treatment | BIB 83::3 | Warning occurred during/after composition evaluation/display; script still completed. |
| Treatment range readback before assignment | MS-Gothic | Expected baseline. |
| Treatment assignment call | SCRIPT SUCCESS | No exception; project revision remained unchanged. |
| Treatment range readback after assignment+setValue | MS-Gothic | Persisted AniMeVisionMB_EN range not established. |

Classification: CHARACTER RANGE SIDE EFFECT LIKELY. The evidence does not support a claim that AE rendered a verified persisted mixed-font run.


## 2026-09-24 — CharacterRange A/B isolation

| Case | Result | Readback | Interpretation |
|---|---|---|---|
| F03 text-only control | NO BIB | 0_3=MS-Gothic; 4_7=MS-Gothic; whole=MS-Gothic | Clean control. |
| F03 range treatment + p.setValue(tdRange) | BIB 83::3 | 0_3=MS-Gothic; 4_7=MS-Gothic; whole=MS-Gothic | CharacterRange path side effect likely; persisted mixed-font state not proven. |

Both cases used separate fresh AE 26.5x89 processes and passed independent ASCII controls.


## 2026-09-24 — CharacterRange setter without property write

| Test | Result | Evidence |
|---|---|---|
| ASCII smoke | PASS | Fresh host text path healthy. |
| Local CharacterRange setter | PASS | Local 4_7 became AniMeVisionMB_EN. |
| Fresh property after setter | UNCHANGED | 4_7 remained MS-Gothic. |
| Fresh property after openInViewer | UNCHANGED | 4_7 remained MS-Gothic. |
| Project revision across setter | UNCHANGED | 33 -> 33. |
| BIB 83::3 | NOT OBSERVED | Through script completion plus 5-second post-alert observation. |
| JavaScript exception | NONE | Diagnostic completed. |

Classification: LOCAL TEXTDOCUMENT MUTATION ONLY.


## 2026-09-24 — Matched property setValue confirmation

| Step | Result |
|---|---|
| ASCII smoke | PASS |
| Local CharacterRange setter | Local 4_7 = AniMeVisionMB_EN |
| Fresh property after setter | 4_7 = MS-Gothic |
| p.setValue(tdRange) | Returned; no JavaScript exception |
| Fresh property after setValue | 4_7 = MS-Gothic |
| Project revision | 33 before and after write |
| openInViewer | Returned |
| First BIB 83::3 | After final script alert dismissal while comp displayed |
| Script exception | NONE |

Classification: PROPERTY SETVALUE HOST SIDE EFFECT CONFIRMED.
