# Decision Log

## 2026-09-23 — Canonical repository reconciliation

Live GitHub inspection found that `Unn0wn002/JP-FONT-AND-GLYPH-PREFLIGHT` no longer exists. The live repository is:

`Unn0wn002/AE-JP-Glyph-Font-Pipeline-Health-Preflight`

It existed but was empty. The canonical Session 1 implementation was therefore restored from the existing Drive folder `Animation Projects / 9-A - JP Font and Glyph Preflight`.

## 2026-09-23 — Native attempt classification

The Codex native-test attempt reached After Effects host identification only and reported AE 26.3x87 instead of target AE 26.5. Functional fixtures did not run because the repository baseline was absent locally.

Decision: classify that session as BLOCKED / HOST VERSION MISMATCH. Do not narrow or reject product scope from this attempt.

Project recommendation remains CONTINUE TO NATIVE FEASIBILITY TEST.


## 2026-09-24 — AE 26.5 text-layer setup failure

Target host AE 26.5x89 was reached successfully. However, both the fixture builder and independent UI/script controls failed to create a text layer and produced BIB 83::3.

Decision:
- treat the current session as `HOST FAILED / FIXTURE SETUP BLOCKED` at the host text/font subsystem;
- do not classify Project 9-A itself as technically failed;
- do not modify the fixture implementation to work around an environment that cannot create text manually;
- first restore basic ASCII text-layer creation in AE 26.5;
- after host recovery, rerun F01/F02/F03/F05/R01 before making feasibility decisions.

Product gate remains `PROTOTYPE IN PROGRESS`. Project recommendation remains `CONTINUE`.


## 2026-09-24 — Recovery does not clear the fixture-triggered font failure

Restart restored basic text creation, so the AE 26.5 host is not permanently unable to create text. However, BIB 83::3 recurred during the multi-step fixture sequence.

Decision:
- keep Project 9-A at `PROTOTYPE IN PROGRESS`;
- continue technical validation;
- do not treat the partial F02/F03/F05 layers as successful controlled fixtures;
- do not modify the baseline builder until the first triggering operation is isolated;
- use a separate diagnostic tracer to distinguish fixture-body operations from `endUndoGroup()`.


## 2026-09-24 — Separate first BIB boundary from F06 empty-text anomaly

Decision:
- classify F04 addText as the LIKELY first BIB trigger boundary, not confirmed root cause;
- require a fresh-process standalone F04 reproduction before attributing causation to the F04 input itself;
- track F06 addText("") returning no layer as a separate anomaly;
- do not modify the baseline fixture until these two behaviors are independently reproduced.


## 2026-09-24 — Causal focus moves from F04 to F03 mixed-font path

F04 standalone did not reproduce BIB 83::3. F02 -> F04 also did not reproduce it. F03 -> F04 and F02+F03 -> F04 reproduced BIB only when the composition was opened/evaluated.

Decision:
- remove F04 string itself from the leading-cause hypothesis;
- retain F03 mixed-font path as the leading LIKELY contributor;
- do not yet attribute causation specifically to CharacterRange until F03-only control/treatment reproduces the difference;
- verify actual per-character font readback after range assignment, not only script success.


## 2026-09-24 — CharacterRange side effect becomes leading hypothesis

Matched F03 A/B testing produced BIB 83::3 only in the range-assignment treatment, while fresh property readback did not establish persisted AniMeVisionMB_EN formatting.

Decision:
- classify the current result as `CHARACTER RANGE SIDE EFFECT LIKELY`;
- do not describe this as a confirmed mixed-font rendering bug;
- isolate the CharacterRange setter from the subsequent `Source Text.setValue(tdRange)` call;
- retain Project 9-A at PROTOTYPE IN PROGRESS and CONTINUE.


## 2026-09-24 — Persisted mixed-font causation not established

The CharacterRange treatment reproduced BIB while the matched control did not, but fresh property readback still showed MS-Gothic for the target range. Therefore the evidence supports an API/host-state side effect, not a verified persisted AniMeVisionMB_EN run.

Decision:
- classify as CHARACTER RANGE SIDE EFFECT LIKELY;
- isolate direct CharacterRange setter from p.setValue(tdRange);
- require in-memory range readback and fresh Source Text property readback before/after composition display;
- preserve baseline fixture unchanged until the write semantics are proven.


## 2026-09-24 — CharacterRange setter alone is not the BIB trigger in matched test

The no-setValue diagnostic demonstrated local TextDocument mutation without persistence and without BIB 83::3.

Decision:
- classify the setter-only behavior as `LOCAL TEXTDOCUMENT MUTATION ONLY`;
- demote the CharacterRange setter itself from leading trigger;
- promote `p.setValue(tdRange)` to the leading LIKELY trigger for the earlier matched treatment;
- require one matched fresh-process confirmation before changing the fixture builder;
- preserve baseline implementation until that confirmation completes.


## 2026-09-24 — Property write is the matched differentiating operation

The no-setValue control was clean. The matched run with exactly one p.setValue(tdRange) later produced BIB 83::3 while still failing to persist the requested mixed range in fresh Source Text readback.

Decision:
- classify `PROPERTY SETVALUE HOST SIDE EFFECT CONFIRMED`;
- do not yet attribute the warning to synchronous execution inside p.setValue;
- isolate whether BIB can surface while the malformed/unpersisted state remains unopened and idle versus only after display/evaluation;
- do not modify the baseline fixture until this temporal boundary is resolved.
