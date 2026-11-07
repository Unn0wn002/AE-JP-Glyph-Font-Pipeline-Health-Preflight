# Work Log — Project 9-A

## 2026-09-23 — Repository recovery after blocked native attempt

Objective: reconcile the Codex native-test report with live GitHub/Drive state and restore the authoritative test baseline.

Canonical Drive folder:
`Animation Projects / 9-A - JP Font and Glyph Preflight`

Canonical live repository:
`Unn0wn002/AE-JP-Glyph-Font-Pipeline-Health-Preflight`

Live repository state on inspection:
- private;
- default branch main;
- empty;
- no branches/commits.

Prior repository name `Unn0wn002/JP-FONT-AND-GLYPH-PREFLIGHT` was not found in live GitHub.

Native attempt supplied by user/Codex:
- AE version/build: 26.3x87 / build 87;
- locale: en_US;
- Windows build: 26200.9457 AMD64;
- target mismatch: AE 26.5 unavailable;
- functional tests: not run;
- no host failures established;
- all functional cases blocked.

Recovery performed:
- restored README, status, test results and changelog from canonical Drive;
- restored read-only probe;
- restored disposable fixture builder;
- restored expected-results matrix;
- restored native fixture instructions;
- restored static test;
- restored Session 1 checkpoint;
- established docs and gitignore in the live repository.

Static tests actually executed after recovery:
- JSX Node parse: PASS;
- read-only mutation-token scan: PASS;
- required API reference scan: PASS;
- expected matrix integrity: PASS (14 rows).

Integrity verification:
- GitHub blob SHA exactly matched Drive/local raw artifact git-blob hashes for the probe, fixture builder, expected matrix and static test.

Decision:
- latest native session = BLOCKED / HOST VERSION MISMATCH;
- product gate remains PROTOTYPE IN PROGRESS;
- product decision remains CONTINUE TO NATIVE FEASIBILITY TEST;
- no product-level NARROW or REJECT conclusion is supported.

Next task:
1. sync/clone the restored repository on the Windows PC;
2. rerun static tests;
3. either run preliminary functional tests on AE 26.3 as non-target evidence or install/use AE 26.5 for target-host validation;
4. preserve and return raw reports.


## 2026-09-24 — AE 26.5 host reached; text subsystem blocker

Native evidence supplied from the Windows test machine:

- After Effects: 26.5x89, build 89, en_US.
- Windows: Windows 11 Home Single Language 10.0.26200.9457 AMD64.
- Repository remained on main at starting/ending HEAD 8a78ef7a7c3d1105f53f0a2ee759f9f7711ef5f8 for the local attempt.
- Static suite passed with exit code 0.
- Fixture builder reached composition creation, then text creation failed with BIB 83::3 before the success alert.
- Independent scripted ASCII text creation also failed.
- Manual UI Text tool reproduced the same warning.
- Therefore the blocker is not established as a fixture-script defect; the host text/font environment itself is unable to create a text layer.
- A solid-only disposable control verified that the probe can inspect a non-text composition without changing project revision: 33 -> 33 on two runs.
- Text diagnostics, glyph coverage, fallback observability, Unicode edge cases and performance remain untested.
- Evidence directory reported by the local operator: artifacts/native-ae-26.5/20260924-150038.

External troubleshooting correlation:
- Adobe documents error 83::3 as a font-dictionary problem commonly caused by corrupt in-memory font information, corrupt Adobe font database cache files, or a bad/corrupt font.
- Immediate engineering task is host/font-pipeline recovery, then a single ASCII text-layer smoke test before rerunning the fixture suite.

Decision: CONTINUE. Do not change product scope from this host-environment blocker.


## 2026-09-24 — Restart recovered ASCII text; fixture still triggers 83::3

Reported native sequence:
- Restart restored basic UI and scripted ASCII text creation in AE 26.5x89.
- No cache deletion or font removal was required.
- Crash Repair Options appeared and the operator selected Continue.
- Session 1 builder then created five text layers before BIB 83::3 recurred.
- Reported error line corresponded to `app.endUndoGroup()`, which does not prove that endUndoGroup was the first failing operation.
- Partial probe runs were repeatable and non-mutating at project revision 99 -> 99, with five static layers and 47 glyph queries.
- F01/F04 were clean only within the partial composition; F02/F03/F05 were not validly established.
- Local working copy remained at older HEAD 8a78ef7a7c3d1105f53f0a2ee759f9f7711ef5f8 and preserved two pre-existing edits.

Engineering response:
- baseline fixture builder remains unchanged;
- added `diagnostics/JPFP_Isolate_BIB_83_3.jsx` to trace BEFORE/AFTER/THROW around font selection, per-fixture addText, font assignment, CharacterRange assignment, empty-text creation, dynamic text operations, large-comp creation, and undo-group boundaries;
- diagnostic is for disposable projects only;
- next evidence target is the first operation adjacent to the BIB warning/abort, followed by a minimal reproducer.


## 2026-09-24 — First BIB operation boundary isolated

Uploaded native evidence was reviewed directly.

Observed sequence:
- AE 26.5x89 / build 89 / en_US.
- ASCII addText smoke passed before tracer.
- Tracer enumerated 306 fonts.
- Selected JP font: MS-Gothic.
- Selected Latin and no-Kanji candidate: AniMeVisionMB_EN.
- F01, F02 and F03 layer creation completed.
- F02 nonexistent PostScript assignment returned OK.
- F03 CharacterRange(4,7) fontObject assignment to AniMeVisionMB_EN returned OK.
- First BIB warning appeared after BEFORE [F04] JP_LATIN_PUNCT.addText and before AFTER for that operation.
- After warning dismissal, F04 addText completed.
- F05 completed including assignment to AniMeVisionMB_EN.
- F06 addText("") returned with no new layer, then setName threw TypeError because the returned value was undefined.
- endUndoGroup completed successfully.

Interpretation:
- first warning boundary = F04 addText, LIKELY trigger;
- causation not confirmed because earlier F02/F03 state could have primed the host;
- F06 is a separate reproducible-looking host/API anomaly and should not be conflated with the first BIB event.

Repository action:
- baseline fixture builder remains unchanged;
- added diagnostics/JPFP_Repro_F04_Standalone.jsx as the next minimal experiment.


## 2026-09-24 — F04 ruled out as sufficient cause; F03 path isolated

Native results supplied from separate fresh AE 26.5x89 processes:

1. F04 standalone:
   - ASCII control passed;
   - exact F04 addText returned a layer in 13 ms;
   - layer count 0 -> 1;
   - revision 25 -> 32;
   - Source Text exact;
   - font readback MS-Gothic;
   - no BIB during addText or composition open.

2. F02 -> F04:
   - missing-font assignment returned OK;
   - F04 inserted;
   - no BIB during script or composition open.

3. F03 -> F04:
   - CharacterRange assignment returned successfully;
   - F04 inserted;
   - no BIB during script;
   - BIB 83::3 appeared on composition open/evaluation.

4. F02 + F03 -> F04:
   - both prior assignments returned successfully;
   - F04 inserted;
   - no BIB during script;
   - BIB 83::3 appeared on composition open/evaluation.

Interpretation:
- F04 input is not sufficient cause.
- F02 alone is not sufficient in this matrix.
- F03 path is the common reproducing predecessor.
- The next A/B must distinguish an F03 text layer using MS-Gothic from the CharacterRange(4,7) assignment to AniMeVisionMB_EN.
- Because prior tracer range assignment reported OK without a project-revision increment, readback of per-range font identity is mandatory.

Repository action:
- added F03 text-only control reproducer;
- added F03 range-assignment treatment reproducer;
- baseline fixture remains unchanged.


## 2026-09-24 — F03 CharacterRange side-effect A/B

Native A/B supplied from separate fresh AE 26.5x89 processes:

Control:
- ASCII smoke PASS.
- F03 text layer with whole-layer MS-Gothic.
- Readback before/control: 0_3=MS-Gothic; 4_7=MS-Gothic; whole=MS-Gothic.
- openInViewer completed.
- No BIB warning.

Treatment:
- independent ASCII smoke PASS.
- Same F03 text and whole-layer MS-Gothic.
- Before assignment: all ranges MS-Gothic.
- CharacterRange(4,7).fontObject assignment to AniMeVisionMB_EN returned without a scripting exception.
- Revision before/after range assignment remained unchanged.
- Fresh Source Text readback after assignment+setValue still reported MS-Gothic for 4_7 and whole layer.
- BIB 83::3 appeared while the one-layer composition was being displayed/evaluated.
- Script completed after warning dismissal.

Interpretation:
- range-assignment path is the differentiating factor;
- persisted mixed-font formatting was not proven;
- leading hypothesis is CharacterRange API / TextDocument host-state side effect, potentially involving the subsequent Source Text property setValue;
- next test must omit p.setValue(tdRange) and compare local TextDocument state with fresh property readback.

Repository action:
- added diagnostics/JPFP_Repro_F03_RangeSetter_NoSetValue.jsx;
- baseline fixture and product probe unchanged.


## 2026-09-24 — CharacterRange setter vs property write now separated

A/B native evidence:
- Control: one F03 text layer, whole MS-Gothic, no CharacterRange write, no BIB.
- Treatment: same setup plus CharacterRange(4,7).fontObject = AniMeVisionMB_EN and p.setValue(tdRange).
- Treatment only produced BIB 83::3.
- Treatment range readback remained MS-Gothic for 4_7.
- BEFORE_RANGE_ASSIGN and AFTER_RANGE_ASSIGN both observed project revision 33.
- Script completed; BIB surfaced while composition/log UI was displayed.

Documentation review:
- CharacterRange is documented as an accessor to the TextDocument instance.
- Published examples mutate CharacterRange attributes directly without calling Source Text Property.setValue afterward.

Engineering decision:
- do not interpret the treatment as a persisted mixed-font rendering failure;
- do not yet change baseline fixture;
- isolate CharacterRange.fontObject setter without the later p.setValue(tdRange).

Repository action:
- added diagnostics/JPFP_Repro_F03_Range_NoPropertySetValue.jsx.


## 2026-09-24 — No-setValue result proves local-only CharacterRange mutation

Native result:
- clean test workspace at bdfddf28286af49a02ef53b15db0f158d6dc2fcb;
- AE 26.5x89 on Windows 11 build 26200;
- static node check PASS after removing only #target in a temporary copy;
- ASCII addText smoke PASS;
- before setter: local and fresh property range 4_7 = MS-Gothic;
- after CharacterRange setter, without p.setValue(tdRange): local range 4_7 = AniMeVisionMB_EN;
- fresh property range 4_7 remained MS-Gothic;
- after openInViewer, local remained AniMeVisionMB_EN while fresh property remained MS-Gothic;
- revision remained 33;
- no BIB 83::3 and no diagnostic exception.

Interpretation:
- direct CharacterRange setter mutates the local TextDocument object but does not persist to Source Text in this tested path;
- setter alone did not reproduce the warning;
- p.setValue(tdRange) becomes the leading candidate for the earlier BIB, but sufficiency is not yet proven.

Repository action:
- added a matched confirmation diagnostic that differs from the successful no-setValue test by exactly one Source Text property write: diagnostics/JPFP_Repro_F03_RangeSetter_WithPropertySetValue.jsx.


## 2026-09-24 — Property setValue host side effect confirmed

Matched native run:
- AE 26.5x89;
- fresh ASCII control PASS;
- new disposable project revision 1 before diagnostic;
- local range setter changed 4_7 to AniMeVisionMB_EN;
- fresh Source Text remained MS-Gothic;
- exactly one p.setValue(tdRange) returned with no exception;
- fresh Source Text still remained MS-Gothic;
- project revision remained 33;
- openInViewer returned;
- first BIB 83::3 surfaced only after the final script alert was dismissed and the composition was displayed.

Interpretation:
- the property-write path is now the matched differentiating operation versus the clean no-setValue run;
- the requested mixed-font state still was not persisted;
- warning surfacing is asynchronous relative to the script operation boundary;
- do not claim synchronous p.setValue failure or universal AE defect.

Repository action:
- added diagnostics/JPFP_Repro_F03_SetValue_NoOpen_PhaseA.jsx;
- added diagnostics/JPFP_Repro_F03_SetValue_DeferredOpen_PhaseB.jsx;
- Phase A performs the setter + one p.setValue but never opens the comp and returns without a final alert;
- Phase B opens the existing comp later in the same AE process, also without a final alert.
