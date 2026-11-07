# PROJECT_STATUS — Project 9-A

## Current status — 2026-11-06 (authoritative)

Reconciled on 2026-11-06 from the files cited on each line. Nothing was tested, built or run in a host today. Newest native evidence: 2026-11-02.

**Version / candidate**
- 0.1.0-beta.1 (`CHANGELOG.md`) on `main` at `1f1078d` (merge of PR #10, 2026-11-02). Local `main` equals `origin/main` (`1f1078d`; read-only `git rev-parse`, 2026-11-06). Exact-head CI "Beta validation" succeeded for `1f1078d` (`D:/Work/Projects/_docs/AUDIT_20261104/AE-JP-Glyph-Font-Pipeline-Health-Preflight-github.json`, checked 2026-11-04).

**Release state and approvals**
- Human evidence review RECORDED 2026-11-07 by Aria (owner): evidence accepted for the 14/14 matrices (`evidence/native-20261019-zen/`, `evidence/native-20261030-panel-sandbox/`; their SHA256SUMS re-hashed clean on 2026-11-07), and the F05 limit accepted (applied-font reassignment only; retained applied-gap branch, rendered fallback and shaping stay UNVALIDATED). Scope: a human review of the recorded native evidence only. It is not a release approval, grants no distribution permission, and the other evidence folders in `docs/HUMAN_EVIDENCE_REVIEW_PACK.md` were not separately re-reviewed in this record (USER_STATED decision; `D:/Work/Projects/_docs/PLAN_20261106/AE-JP-Glyph-Font-Pipeline-Health-Preflight/runs/GL-01_20261107-1235.md`).
- Package gate: the packager's gate constant still reads `BLOCKED_NATIVE_VALIDATION` and the `dist/` build is stale; not changed by this review. Not released; distribution NOT approved (`docs/BETA_LIMITATIONS.md`, `AGENTS.md`).
- The beta package in `dist/` is STALE: `dist/AE-JP-Glyph-Font-Preflight-0.1.0-beta.1/BUILD_INFO.json` records commit `d173be4` and `working_tree_dirty: true`. It must be rebuilt from the final clean commit (not done).

**Completed gates**
- Native matrix F01–F12, L01, R01: 14/14 PASS, `NATIVE_MATRIX_PASS_PENDING_REVIEW` (HISTORICAL_RECORDED). Main PC 2026-10-19: `evidence/native-20261019-zen/`. Through the dockable panel in Windows Sandbox 2026-10-30: `evidence/native-20261030-panel-sandbox/`. F05 covers applied-font reassignment only.
- Panel honest status, count lines, narrow dock and the first native Export: PASS_BOUNDED_NATIVE, docked, one machine (`evidence/native-20261102-honest-status/README.md`).
- Zero-checked amber (never green with 0 layers checked): PASS_BOUNDED_NATIVE, floating (`evidence/native-20261102-zero-checked/README.md`).
- Compact view, one language at a time, details toggle, narrow width: PASS_BOUNDED_NATIVE, floating (`evidence/native-20261102-compact-view/README.md`).
- Merged to `main`: PR #1 (2026-10-30) and PRs #5–#10 (2026-11-02) (`git log --merges`).

**Remaining gates (NOT_RUN / BLOCKED / UNVALIDATED)**
- Human evidence review: DONE 2026-11-07 (accepted; see Release state above). No longer a blocker.
- Latest panel build (`b5893642...c756`), 2026-11-07 GL-02: docked and dock persistence after an owner restart, scan/Export OK, project revision unchanged, and details auto-opening with no composition are PASS_BOUNDED_NATIVE (`evidence/native-20261107-gl02-compact-panel/README.md`). Still NOT_RUN natively: red state (problems > 0; no genuine missing font available), Export from the closed compact layout, and the error/blocked path.
- Rendered fallback identity, shaping and the F05 retained applied-gap branch: UNVALIDATED. Animated/expression text is skipped by design (`docs/BETA_LIMITATIONS.md`).
- Fixture-builder guards AE-05/AE-06: native run NOT_RUN (`CHANGELOG.md`, Unreleased 2026-10-29).
- Clean package rebuild from the final commit: NOT_RUN (`dist/AE-JP-Glyph-Font-Preflight-0.1.0-beta.1/BUILD_INFO.json`).

**Open defects**
- The 2026-11-04 audit records no code defect for this project. Its P2 code findings concern Unicode Guard and the Premiere CCX verifiers. The P2 status-drift finding applies here (README said 12/14 with F02 blocked); this section and the 2026-11-06 README fix address it (`D:/Work/Projects/_docs/AUDIT_20261104/README.md`).
- Open design decision: multi-composition scanning is not supported (active composition only); a scan-all button is not built (`evidence/native-20261102-compact-view/README.md`).
- The installed panel wrapper differs from the source only by CRLF/LF. Normalized text is equal, so this is not a defect (`D:/Work/Projects/_docs/AUDIT_20261104/glyph-installed-line-ending-review.json`).

**Latest automated test result** (from the 2026-11-04 audit run; not re-run today; test doubles, not native evidence)
- Static checks PASS; behavioral 74/74; fixture/panel 42/42; unittest 10/10; all 296 tracked-file hashes unchanged (`D:/Work/Projects/_docs/AUDIT_20261104/README.md`, `D:/Work/Projects/_docs/AUDIT_20261104/AE-JP-Glyph-Font-Pipeline-Health-Preflight/results.jsonl`).

**Where evidence lives**
- Native: `evidence/native-YYYYMMDD-*/` (newest: `evidence/native-20261102-compact-view/`). History: `checkpoints/`. Audit logs: `D:/Work/Projects/_docs/AUDIT_20261104/AE-JP-Glyph-Font-Pipeline-Health-Preflight/`.

**Status documents**
- This section of `PROJECT_STATUS.md` is CURRENT and authoritative. The sections below it are HISTORICAL.
- `TEST_RESULTS.md`: HISTORICAL (19 Oct 2026). Its row-level matrix detail is still valid evidence. Bannered.
- `docs/TEST_MATRIX.md`: HISTORICAL/stale (September 2026; every row BLOCKED). Bannered.
- `docs/KNOWN_LIMITATIONS.md`: HISTORICAL/stale (from before AE 26.5). Bannered. Current limits: `docs/BETA_LIMITATIONS.md` (CURRENT).
- `docs/NATIVE_BETA_VALIDATION.md`: CURRENT as the row definitions. Its 19 Oct status header ("PR #1 stays draft") is superseded by this section.
- `docs/HUMAN_EVIDENCE_REVIEW_PACK.md`: CURRENT review pack. It uses the old `C:\Users\unn0w\Downloads\02_Projects\` root; translate with `D:\Work\Projects\_docs\PATH_MAP_20261103.md`.
- `CHANGELOG.md`: CURRENT for release notes. `PROJECT_LOG.md`, `docs/WORK_LOG.md`, `docs/DECISION_LOG.md`: dated logs (history). The "stale branch" and "NOT pushed" statements in `PROJECT_LOG.md` are outdated; its 2026-11-06 entry corrects them.

**Next recommended step**
- With owner approval for the AE restart, run the three NOT_RUN panel checks (GL-02), and rebuild the package from a clean commit (GL-03).

## Earlier status entries (historical — superseded by the section above, kept unchanged)

## Panel update — 2 November 2026

The dockable panel wrapper (scanner unchanged, hash `f93d2218...8156e`) was reworked after looking at it in After Effects: status colour follows the scanner's counts (no false green; zero text layers checked is amber), count lines, a note explaining "Open/select a composition first", a compact main view with a Show/Hide details area, and one language at a time (button, remembered). Native evidence (floating panel, one machine): `evidence/native-20261102-honest-status/`, `evidence/native-20261102-zero-checked/`, `evidence/native-20261102-compact-view/`. The panel scans the ACTIVE composition only (documented limit). Docked after a restart, Export in the new layout and the red state are NOT_RUN natively for this build. The release gate below is unchanged: `BLOCKED_NATIVE_VALIDATION` until the human evidence review (`docs/HUMAN_EVIDENCE_REVIEW_PACK.md`).

## Current genuine F02 and fresh native matrix — 19 October 2026

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


## Current real-font attempt — 19 October 2026, 15:02 WIB

The user manually enabled Sandbox AE script writes, and a fresh inventory export succeeded at **14:55:43 WIB**. The earlier zero-byte permission-denied output and overwrite refusal were preserved; a unique `sandbox-host-inventory-v2.txt` was used. Main Windows and the existing Sandbox both execute AE **26.5x89/build89/en_US**. Main host `AYAKUMI_NOZOMI`: Windows 11 Pro `10.0.26300` x64, OS/UI `en-US`. Sandbox environment name `3E6B83F9-7F9C-4`: Windows 11 Enterprise **24H2/build26100.9711** x64 (read from Settings > System > About), display language **English (United States)**, region World, UTC+07:00. Settings were only read; the agent changed no security or font setting. Sandbox remains open.

**A genuine F02 fixture is still BLOCKED after one real-font authoring attempt.** Actual inventories contain **345 main / 319 Sandbox fonts**, with all three control PS identities present in Sandbox: `ArialMT` #6/version7.06, `Meiryo` #266/version6.51 and `MS-Gothic` #239/version5.32, all substitute=false. The 26 main-only PS identities include no font reporting coverage for the entire `欠落フォント` string. Selected existing real candidate **CascadiaCode-Regular**, version **2407.024**, main FontObject #57/substitute=false, is absent by exact PS in Sandbox and reports all-six coverage=false. On a disposable copy of the retained source, its documented font-name assignment returned **Meiryo** even on the local TextDocument. All six fresh character reads, both before and after save, show **Meiryo #292 / substitute=false**. This is an authoring/fixture-condition blocker, not a scanner false negative.

Saved the failed experiment as ignored `artifacts/native/F02-operator/F02-authoring-attempt.aep`, SHA-256 **6ff25c66e07821469f45d88437e652afddcab03e794cc616795a802923452fb8**, at **14:59:32 WIB** with `attempt-provenance.txt`. It is **not** `genuine-F02.aep`; no genuine fixture/provenance was fabricated. The original source remains SHA-256 `5f64f70c6fa639447435e5869120068feb6e32a755a4ea0a58491babdddd8007`. Raw all-composition before/after samples match exactly: aggregate12 layers/9 static/52 static code points; L01 100 static/592. F10 retains two keys at0/1s; F11 raw expression=true/keys0/error empty/evaluated `式で生成`. The copied wrapper's derived F11 label says ANIMATED despite those raw properties; preserve that label discrepancy without treating it as a production-scanner failure. No BIB was observed in this attempt or at the post-alert unopened-comp capture; historical BIB limitations remain.

Explorer clipboard transfer works **both directions**. The returned v1 probe matches its original SHA-256 `3c9568ba2157b760bba1200e60673458d12f1a332170c2eda5c15bff9f793b5c`. The successful Sandbox inventory and screenshots are preserved on main Windows in `evidence/native-20261019-resumed/`; local transferred-copy hashes match. A Sandbox-origin SHA-256 of the generated inventory was not independently computed and is not claimed. `SESSION.json`, `author-before.json`, `author-after-assignment.json`, `author-outcome.json`, `font-comparison.json`, executed helper sources and attempt provenance retain the observations. Project/font binaries stay in ignored policy locations; no font was transferred, installed, removed, activated or cache-modified. Sandbox's observed freezeSyncSubstitutedFonts=false was not changed, and no missing-reference project was opened there.

Dependent native work stopped: **no genuine fixture transfer/open, substitute inventory proof, binding adaptation, scanner run or acceptance evaluation**. Retained original-host/source results remain **F01, F03–F12, L01 PASS; F02/full R01 BLOCKED (12/14)**; this continuation adds zero native PASS rows. F05's native retained applied-gap, exact rendered-fallback and shaping remain UNVALIDATED. Production scanner, baseline builder, state wrapper and existing evaluator/inspector remain frozen. No invented-font setter or equivalent setup retry was performed.

Conservative native interval **14:51:19–15:02:06 WIB**, charged **12m**; cumulative **64m21s**, remaining **55m39s**. Prior human wait and later repository checks/packaging are excluded. Next prerequisite: a controlled saved reference using a real pre-existing font that actually persists on all six F02 characters and is unavailable in validation. Current main-only candidates do not report full-string coverage, and the single tested candidate was reassigned. Do not install/remove fonts, force invented identities, waive mismatch, or repeat equivalent setters. After a suitable genuine saved fixture exists, retain real provenance, bind diagnostics to its actual PS/fresh IDs, reverify every condition in Sandbox and run the two aggregate/two large scans unchanged. Keep PR#1 draft and **BLOCKED_NATIVE_VALIDATION**; no merge or publication.

Local checks PASS: static suite; behavioral mocks **74/74**; package regressions **3/3**; new executed JSX parses **2/2**; all **61 prior manifest entries**, raw F02/F10/F11 checks, sampled composition preservation, frozen sources, budget consistency and whitespace. These are not new native acceptance. See `evidence/native-20261019-resumed/CHECKS.json`. Rebuild the archive from the final clean commit; BUILD_INFO.json and Git history bind the exact revision without a self-referential hash.

This section supersedes earlier pending script-write and unavailable-environment statements below; earlier raw evidence/history is retained.

## Dual-host continuation — 19 October 2026, 14:38 WIB

Both native AE environments were accessed on 19 October 2026. Main Windows launched successfully and reports AE `26.5x89`, build `89`, `en_US`, on Windows 11 Pro `10.0.26300` x64 (OS/UI locale `en-US`). Sandbox was already open with AE at an empty project; its About dialog reports **26.5.0 (Build 89)**. Sandbox scripting/OS locale and exact OS build remain **NOT_VERIFIED**. Explorer clipboard file transfer **into Sandbox works**; reverse transfer and transferred-byte hashes are not yet verified.

The Sandbox read-only inventory probe executed but its evidence-file write failed with **Permission denied**, explicitly naming **Allow Scripts to Write Files and Access Network**. The agent did not change that security preference. The user said “let me enable it first”; completion is pending. Keep the existing Sandbox open. Manual next action: enable that preference in **Sandbox AE**, confirm, then retry the already transferred `sandbox-probe.jsx` via File > Scripts > Run Script File. Preserve/copy its output back and verify hashes before comparing fonts. Main inventory contains 345 FontObjects; its raw `fontActivation` row actually reads `fontsWithDefaultDesignAxes`, so it establishes no automatic-activation state.

No cross-host font difference or control-font availability is established yet. No `.aep` was opened/edited/saved, no F02 font was selected, no genuine fixture/provenance was created, and no acceptance scan or evaluator adaptation ran. This stop is due to the observed write prerequisite, not the initial absence of fixture files. The production scanner, state wrapper and baseline fixture builder remain unchanged. All 53 files in the prior evidence manifest verify, including the retained source project. New evidence is in `evidence/native-20261019-dual-host/RECOVERY.json`, the main inventory/OS record, executed probe sources and two Sandbox screenshots, all preserved on main Windows.

Retained results remain **F01, F03–F12, L01 PASS; F02 and full R01 BLOCKED (12/14)**, with their original source/host binding. New native acceptance: **NOT_RUN**. F05's retained applied-gap, exact rendered-fallback and shaping limits remain **UNVALIDATED**. Conservative native charge **6m** (14:33:18–approximately 14:38:45 WIB); cumulative **52m21s**, remaining **67m39s**. Human wait for the preference action and repository documentation/checks/packaging are excluded. Resume the investigation clock at the next native action. PR #1 stays open/draft, gate **BLOCKED_NATIVE_VALIDATION**; no merge or publication.

Local closeout checks: static PASS, behavioral mock regressions **74/74 PASS**, package regressions **3/3 PASS**, executed probe-source parse checks **2/2 PASS**, frozen-source/prior-evidence/budget integrity and whitespace PASS. These checks establish no native acceptance. See `evidence/native-20261019-dual-host/CHECKS.json`. Rebuild the review archive from the final clean committed revision; Git history and BUILD_INFO.json identify that revision.

Earlier records below are retained history; this continuation supersedes earlier claims that no separate environment was available. After the write prerequisite is resolved, use main Windows for authoring and Sandbox for validation, as requested.

## Current gate — 19 October 2026

Continuation from `f2292223e57cee72cbc9b5beee6c8e06bbe21b98`: local HEAD and remote PR #1 head match; the checkout was clean and the PR remains open/draft. Both required operator files are absent. Windows app discovery lists Adobe After Effects 2026 as installed, not running, with no open window; no separate authoring environment was available in the inspected surfaces. Fresh native access/build is **NOT_VERIFIED**. Native work stopped at intake without launching AE, opening a project, adapting tools or scanning. The six retained project hashes and frozen scanner/baseline builder are unchanged. See `evidence/native-20261019-fixture-intake/INTAKE.json`. Retained native results remain **12 PASS, F02/full R01 BLOCKED**; F05's retained applied-gap, rendered-fallback and shaping limits remain UNVALIDATED. Intake is conservatively charged 2m: cumulative **46m21s**, **73m39s remain**. Documentation/checks/packaging are separate from native investigation. The operator handoff below remains the next action.

**0.1.0-beta.1: BLOCKED_NATIVE_VALIDATION.** Implementation and local checks are complete; native evaluation now records **12 required rows PASS, F02 and full R01 BLOCKED**. Working target: **22 October 2026**; official submission deadline **unconfirmed**. This section supersedes historical environment/gate statements below and the earlier disabled-write-preference blocker.

- Repository: `Unn0wn002/AE-JP-Glyph-Font-Pipeline-Health-Preflight`; clean clone from `main` baseline `c70ce9121a1636c972f6bc7a6ee2f88978c1506f` into this task's `repository/` directory. Work branch: `beta/static-preflight-20261017`. No prior local checkout or unrelated changes were modified.
- Scope: read-only static Source Text in the active composition; direct applied-font identity/coverage, substitute findings, intentional mixed-font review, explicit unknowns, and UTF-8 report export. Automatic font replacement/installation, whole-project traversal, full animated/expression evaluation, rendered-fallback identity, and shaping correctness are excluded.
- Confirmed audit defect repaired: failed/unavailable `CharacterRange.fontObject` no longer falls back to `TextDocument.fontObject`. Failed source/classification/API reads remain UNKNOWN/NOT_CHECKED; no guessed character font increments verified coverage.
- Reports (`JPFP-BETA-REPORT-2`) locate comp/layer IDs and names, UTF-16 character ranges/code points, character-font/substitute/coverage states, incomplete mixed classification, verified/skipped/failed counts, and revision-read unknowns. Export cancellation, failed getters, false writes/closes, and exceptions are explicit outcomes. A native character-conversion failure exposed a serializer defect; the final source escapes every surrogate code unit as ASCII `\uXXXX`, including valid pairs, preserving scalar labels/ranges and Source Text. Four fresh final-source native exports succeeded; earlier failed/partial files remain failed evidence.
- Automated evidence: **74/74 production-JSX behavioral regressions PASS**, static suite PASS, **3/3 package tests PASS**. Resumed implementation commit `b5582c4` completed GitHub CI SUCCESS, run39039773692, including archive build/upload. Final evidence/packaging checks are visible in the draft PR. Local and mocked checks do not establish native acceptance.
- Native host: Windows 11 Pro `10.0.26300` x64; AE `26.5x89`, build `89`, locale `en_US`. The user manually enabled script writes. The final aggregate fixture composition was scanned/exported twice: 52 examined code points, coverage **51 verified / 1 skipped / 0 failed**, zero problems, five review findings, four not-checked findings; scanner time **11/11 ms**. The skipped character is the variation selector. L01 scanned/exported twice: **100 independently verified static layers, 592/0/0 coverage**, zero findings; scanner time **143/129 ms**. These durations exclude the export dialogs and are observations, not performance guarantees.
- Fresh independent before/after snapshots matched on all four final scans, revision **1186 → 1186**. Aggregate and large report pairs match semantically after excluding only generation time and scan duration; sampled states also match across repeats, with no UNKNOWN observations. Final-source export cancellation was separately observed with unchanged sampled state. `evidence/native-20261017-resumed/evaluation.json`, `evaluation.tsv`, and `comparison-supplement.json` retain the evaluation, counts, timings, hashes, and limits. Sampled equality is not proof of all unobserved project state.
- Native outcomes: **F01, F03–F12, L01 PASS**. F05 PASS records a verified applied-font reassignment experiment: candidate ArialMT #7 reports ABC=true/漢=false; fresh A/B retain it, while the middle character reports covered Meiryo #292. The **native retained applied-gap branch remains UNVALIDATED**, and exact rendered fallback/shaping are not established. F12's wrapper-derived kind label says NON_TEXT while its authoritative raw checks report SolidSource=true/TextLayer=false and null text group; matching setup readback establishes the solid condition. This diagnostic-label discrepancy is not a scanner failure.
- Remaining blockers: **F02** could not establish the deliberately missing reference as an exposed substitute. Fresh reads before and after save/reopen showed Meiryo #292, substitute=false for every F02 character, with zero missing/substituted font objects. This is a fixture-condition blocker, not a scanner false negative. **Full R01** remains BLOCKED until all F01–F12 conditions, including F02, are established and repeated; current semantic/state repeatability remains valid partial evidence.
- BIB checkpoint: original Phase A reproduced BIB `83::3` after script return with the composition unopened, including the fixed observation interval. The warning can surface before display; synchronous failure inside `setValue` is not established. Conditional Phase B is **NOT_RUN**, not PASS. The warned process was discarded; fresh ASCII controls passed and the separate documented font-name setter builder/final scans completed without observed BIB. Historical baseline fixture and isolation diagnostics remain unchanged.
- Native investigation stopped **21:06:48 WIB**. Conservative charged time: initial **11m21s** + first resumed **7m** + continuation **24m** = **42m21s**, leaving **77m39s** of the two-hour cap. Approximately 4h43 of human idle time is excluded; the charged upper bound includes native work and intervening implementation. No font-cache repair, installation, replacement, whole-project scan, or production-project mutation occurred.
- Final tested scanner SHA-256: `f93d221898e6dc75985e2fa5b7ffbde2850c2ebc39da889b21592c5f58d8156e`. Resumed implementation commit: `b5582c489534331eb893bc260bc2b0990243a386` (pushed). Pre-resume HEAD: `4d60013345cfc0966b6f33ee2cc1ee5108de27ae`. The final archive's `BUILD_INFO.json` and `git log` identify the following evidence/package revision without a self-referential checkpoint hash.
- Beta material: `docs/BETA_INSTALLATION.md`, `docs/BETA_LIMITATIONS.md`, `docs/BETA_DEMO_CHECKLIST.md`, `docs/NATIVE_BETA_VALIDATION.md`, synthetic `examples/BETA_SAMPLE_REPORT.txt`, and deterministic `scripts/package_beta.py`. The archive omits all mutating fixture/diagnostic JSX and labels the native gate BLOCKED_NATIVE_VALIDATION.

Latest continuation from `e4c34d4`: repository-only intake found no new operator-provided genuine `.aep`; the six existing projects match their retained hashes. No AE setup, scan, font change or new native acceptance ran. F02/full R01 remain BLOCKED; the prior 12 PASS rows retain their original evidence/source binding. The protocol now accepts a real declared missing identity and identifies the old helper/evaluator assumptions; no scanner or acceptance-tool code was changed. Bounded intake charged an additional 2m: cumulative44m21s, **75m39s remain**. Documentation and packaging time is separate from native investigation.

Next action: the operator prepares one saved genuine missing-reference copy and provenance as specified in [the F02 handoff](docs/NATIVE_BETA_VALIDATION.md#current-f02-operator-handoff--genuine-saved-reference-required), placing it at `artifacts/native/F02-operator/genuine-F02.aep`. Once received, bind evidence tooling to its real identity/item mapping, prove fresh substitute=true/inventory, then repeat the complete controlled suite on the unchanged scanner. Keep the PR draft and BLOCKED_NATIVE_VALIDATION pending acceptance and evidence review. No merge/publication is authorized. Branch/SHA handoff is recorded in `checkpoints/BETA_2026-10-17.md`; rebuilt package BUILD_INFO.json identifies the final clean documentation commit.

## Historical record

Last updated: 2026-09-15, Session 1

## Live state inspected

- Project folder: `9-A - JP Font and Glyph Preflight`.
- Existing implementation before Session 1: none found.
- Existing project file before Session 1: handoff DOCX only.
- CutBridge: not accessed or modified.
- Research master workbook: not accessed or modified.

## Environment

### Development runtime available to this assistant

- OS: Debian GNU/Linux 13 (trixie), x86_64.
- Python: 3.13.5.
- Node.js: 22.16.0.
- npm: 10.9.2.
- Git: 2.47.3.
- Adobe After Effects executable: not present in this runtime.
- Native AE execution: **NOT AVAILABLE / NOT RUN**.

### User target host

- Intended OS: Windows.
- Exact installed Windows version: **UNVERIFIED**.
- Exact installed AE version/build: **UNVERIFIED**. The probe records `app.version`, `app.buildName`, and `app.buildNumber` when run.
- Current public Adobe release noted during research: AE 26.5 (September 2026), but this is not assumed to be the user's installed version.

## Capability matrix

| Capability | Documentation/API status | Session 1 product status |
|---|---|---|
| Read active composition text layers | Established AE scripting capability | PROTOTYPE IMPLEMENTED; NATIVE NOT RUN |
| Detect static vs keyframed/expression Source Text | Established property APIs | PROTOTYPE IMPLEMENTED; NATIVE NOT RUN |
| Read first-character font identity | `TextDocument.fontObject`, AE 24.0+ | VERIFIED IN DOCS; NATIVE NOT RUN |
| Read per-character/range font identity | `TextDocument.characterRange()` / `CharacterRange`, AE 24.3+ | VERIFIED IN DOCS; NATIVE NOT RUN |
| Identify font references missing/substituted on project open | `FontObject.isSubstitute`; `app.fonts.missingOrSubstitutedFonts`, AE 24.0+ | VERIFIED IN DOCS; NATIVE NOT RUN |
| Map used project fonts to layer IDs/times | `Project.usedFonts`, AE 24.5+ | VERIFIED IN DOCS; not yet needed by active-comp probe |
| Query whether a Font object has glyphs for characters | `FontObject.hasGlyphsFor()`, AE 25.1+ | VERIFIED IN DOCS; PROTOTYPE IMPLEMENTED; NATIVE NOT RUN |
| Detect mixed font runs | Per-character Font objects make this derivable | PROTOTYPE IMPLEMENTED as REVIEW NEEDED; NATIVE NOT RUN |
| Identify exact fallback font visually rendered for a missing glyph | Public docs describe default script fallback but do not establish a per-rendered-glyph fallback identity API | **UNVERIFIED / CORE NATIVE EXPERIMENT** |
| Prove shaping/rendering correctness from glyph coverage | Not supported by glyph-coverage query alone | UNSUPPORTED as a claim |
| Supplementary-plane, combining, variation sequence correctness | APIs exist but indexing/shaping semantics need native evidence | REVIEW NEEDED / UNTESTED |
| Nested-comp traversal | Technically scriptable | DEFERRED |
| Automatic font replacement/install | APIs/host mechanisms exist | DEFERRED BY SCOPE |

## Feasibility decision after documentation review

**CONTINUE TO NATIVE FEASIBILITY TEST.** The product is not blocked at the documentation stage. AE 25.1+ exposes enough public API to test a useful character-level preflight: per-character applied font identity, substitute-font references, and whether the applied Font object reports glyph coverage.

However, the stronger promise "detect the exact unexpected fallback font AE rendered" remains unproven. The beta scope must not include that claim unless the native F05 experiment demonstrates a reliable observable signal.

## Proposed honest fallback scope if exact rendered fallback identity is not observable

A still-differentiated product can report:

1. Missing/substitute font references and affected characters/layers.
2. Characters for which the **applied Font object** reports no glyph coverage.
3. Mixed font runs as review items, not errors.
4. Explicitly skipped animated/expression text and Unicode edge cases.
5. Active-comp coverage and exportable delivery preflight evidence.

This is narrower than "detect every fallback" but materially more useful than a basic missing-font inventory if native accuracy is repeatable.

## Next concrete task

Run the Session 1 disposable fixtures and read-only probe in the actual Windows AE installation, then ingest the exported report and convert the capability matrix from NATIVE NOT RUN to verified/partial/failed based only on evidence.


## 2026-09-23 recovery update

- Canonical live repository: `Unn0wn002/AE-JP-Glyph-Font-Pipeline-Health-Preflight`.
- Repository baseline restored from canonical Drive after live GitHub was found empty.
- Restored core artifacts passed static verification.
- Latest Codex native attempt identified AE `26.3x87` build `87`, locale `en_US`, not target AE 26.5.
- No functional native fixture executed in that attempt.
- Session classification: `BLOCKED / HOST VERSION MISMATCH`.
- Product gate remains `PROTOTYPE IN PROGRESS`.
- Product recommendation remains `CONTINUE TO NATIVE FEASIBILITY TEST`; no product-level NARROW conclusion is supported by the blocked attempt.


## 2026-09-24 native AE 26.5 attempt

- Target host identity is now HOST VERIFIED: After Effects `26.5x89`, build `89`, locale `en_US`.
- Windows host: Windows 11 Home Single Language `10.0.26200.9457`, AMD64.
- Static suite on the Windows test machine: PASS, 14 fixture rows.
- Fixture setup failed before any text fixture could execute because After Effects could not create a text layer.
- The same text-layer creation failure reproduced independently through a minimal `addText("ABC 123")` control and through the After Effects UI Text tool.
- After Effects raised BIB `83::3` during text creation.
- A solid-only control successfully ran the read-only probe twice. Both reports observed one non-text layer, zero text layers, and project revision `33 -> 33`; reports matched apart from generation time.
- This verifies a narrow non-text read-only control only. It does not verify text diagnostics or full R01.
- F01-F12, L01 and text-based R01 remain BLOCKED by host text/font pipeline failure.
- VF01 remains not implemented in the restored baseline.
- Session decision: `CONTINUE`, with immediate work narrowed to restoring basic text-layer creation in the AE 26.5 host.
- Development gate remains `PROTOTYPE IN PROGRESS`.


## 2026-09-24 host recovery + partial fixture evidence

- After a Windows restart, AE 26.5 successfully created ASCII text `ABC 123` through both the UI Text Tool and `comp.layers.addText()`.
- No Adobe font-cache files were changed and no fonts were removed before that recovery.
- Root cause remains UNKNOWN because BIB `83::3` recurred later during the Session 1 fixture-builder sequence.
- The partial fixture project contained five static text layers before setup aborted.
- The read-only probe ran twice on that partial composition: five static text layers, 47 glyph queries, and project revision `99 -> 99` on both runs.
- The two partial probe reports matched after removing generation time.
- F01 and F04 produced no findings within the partial scan.
- F02, F03, and F05 setup conditions were not established, so their zero findings are inconclusive.
- Partial-composition R01 is HOST VERIFIED for repeatability/read-only behavior only.
- F06-F12 and L01 remain BLOCKED.
- Next task: isolate the first fixture-builder operation associated with BIB 83::3 before modifying baseline fixture logic.


## 2026-09-24 first BIB boundary isolated

- Diagnostic tracer syntax check passed before host execution.
- Fresh-process ASCII smoke test passed before the tracer.
- Selected fonts: JP = `MS-Gothic`; Latin = `AniMeVisionMB_EN`; glyph-gap candidate = `AniMeVisionMB_EN`.
- No earlier caught scripting exception occurred before the first BIB warning.
- The last completed operation before the first BIB warning was `[F03].setRangeFont_4_7`.
- The warning appeared while `[F04] JP_LATIN_PUNCT.addText` was in progress, before its AFTER log entry.
- After the warning was dismissed, F04 addText completed and subsequent F04 operations completed.
- This isolates the first warning boundary to F04 addText, but causation remains LIKELY rather than CONFIRMED because prior F02/F03 state may be contributory.
- A separate later anomaly was observed at F06: `addText("")` returned without creating a sixth layer, and the following setName dereference threw because the returned layer value was undefined.
- Added `diagnostics/JPFP_Repro_F04_Standalone.jsx` to test the exact F04 string in isolation, without font enumeration, font assignment, missing-font setup, CharacterRange changes, or an undo group.


## 2026-09-24 F04 standalone + causal matrix

- Standalone F04 test passed in a fresh AE 26.5x89 process after an ASCII control.
- Exact F04 text `「日本語」—ABC・123！？` created one layer without BIB 83::3; Source Text and MS-Gothic read back correctly.
- Therefore the F04 string alone is NOT SUFFICIENT to reproduce the prior warning.
- Causal matrix results:
  - F02 -> F04: no BIB during script or composition open.
  - F03 -> F04: F04 layer inserted without warning during script; BIB 83::3 appeared when opening/evaluating the composition.
  - F02 + F03 -> F04: same composition-open BIB behavior.
- Current inference: the F03 path, especially mixed-font range assignment, is associated with the BIB warning; F02 alone is not.
- Causation is still not confirmed because the F03 text layer itself must be separated from the CharacterRange assignment.
- Added two isolated A/B diagnostics:
  - `diagnostics/JPFP_Repro_F03_TextOnly_Control.jsx`
  - `diagnostics/JPFP_Repro_F03_RangeAssignment.jsx`
- Both diagnostics log per-range font readback before composition display, so an apparent successful assignment is not accepted without verifying the actual resulting font state.


## 2026-09-24 F03 control/treatment A/B

- F03 text-only control: no BIB warning; range readback remained MS-Gothic throughout.
- F03 CharacterRange treatment: BIB 83::3 reproduced while composition was displayed/evaluated.
- The treatment's range assignment produced no scripting exception and no project-revision increment.
- Fresh Source Text readback after assignment still reported MS-Gothic for range 4_7; persisted AniMeVisionMB_EN mixed formatting was NOT established.
- Classification: `CHARACTER RANGE SIDE EFFECT LIKELY` (Case B), not persisted mixed-font rendering failure.
- Official CharacterRange documentation describes the object as an accessor to its TextDocument instance; its examples mutate CharacterRange attributes directly. TextDocument examples generally commit Source Text changes with property.setValue(). This makes the subsequent `p.setValue(tdRange)` a separate operation that must be isolated rather than assumed necessary.
- Added `diagnostics/JPFP_Repro_F03_RangeSetter_NoSetValue.jsx` to apply only the CharacterRange setter, intentionally omit `p.setValue(tdRange)`, and compare local TextDocument vs fresh Source Text property readback before and after composition display.


## 2026-09-24 CharacterRange A/B result

- Control (F03 text-only, whole font MS-Gothic) completed without BIB 83::3.
- Treatment ran in a separate fresh AE 26.5x89 process and differed only by attempting CharacterRange(4,7).fontObject = AniMeVisionMB_EN followed by p.setValue(tdRange).
- Treatment produced BIB 83::3 during/after composition display.
- No JavaScript exception occurred in the treatment.
- Fresh property readback after the treatment still reported MS-Gothic for 0_3, 4_7, and whole-layer font.
- Project revision remained unchanged across BEFORE_RANGE_ASSIGN and AFTER_RANGE_ASSIGN.
- Current classification: CHARACTER RANGE SIDE EFFECT LIKELY. Persisted mixed-font rendering was NOT established.
- Current docs describe CharacterRange as an accessor to TextDocument and show direct range writes without a subsequent Property.setValue(TextDocument); therefore p.setValue(tdRange) must be isolated as a separate operation before the baseline fixture is changed.


## 2026-09-24 no-setValue CharacterRange result

- Canonical diagnostic `JPFP_Repro_F03_RangeSetter_NoSetValue.jsx` ran in a fresh AE 26.5x89 process after a passing ASCII control.
- Local TextDocument / CharacterRange readback changed range 4_7 from MS-Gothic to AniMeVisionMB_EN.
- Fresh Source Text `p.value` remained MS-Gothic for range 4_7 immediately after the setter and after `openInViewer()`.
- Project revision remained 33 across the setter.
- No BIB 83::3 warning was observed through script completion and five seconds after dismissal of the final script alert.
- Classification: `LOCAL TEXTDOCUMENT MUTATION ONLY`.
- Leading hypothesis: the subsequent `p.setValue(tdRange)` used in the earlier treatment is the likely trigger, but this is not yet confirmed as a sufficient cause.
- Added matched confirmation diagnostic: `diagnostics/JPFP_Repro_F03_RangeSetter_WithPropertySetValue.jsx`.


## 2026-09-24 matched property-write confirmation

- Matched fresh-process diagnostic added exactly one `p.setValue(tdRange)` after the previously clean local CharacterRange setter.
- The property write returned without JavaScript exception.
- Local TextDocument retained `4_7 = AniMeVisionMB_EN`.
- Fresh Source Text `p.value` remained `4_7 = MS-Gothic` after the property write and after `openInViewer()`.
- Project revision remained 33 across the write.
- BIB `83::3` surfaced only after the diagnostic had completed and its final alert was dismissed, while the composition was displayed.
- Classification: `PROPERTY SETVALUE HOST SIDE EFFECT CONFIRMED`.
- This establishes the property-write path as the differentiating operation against the no-setValue control, but does not prove the internal error occurred synchronously inside `p.setValue`.
- Added two-phase deferred-display diagnostics so property write and host display/evaluation can be separated temporally.
