# Checkpoint — F03 Mixed-Font Path Is Leading BIB Hypothesis

Date: 2026-09-24
Gate: PROTOTYPE IN PROGRESS
Decision: CONTINUE

## VERIFIED
- F04 standalone exact string passed with no BIB 83::3.
- F02 -> F04 passed with no BIB.
- F03 -> F04 reproduced BIB 83::3 on composition open/evaluation.
- F02 + F03 -> F04 reproduced the same composition-open BIB behavior.
- All cases used fresh AE 26.5x89 processes with passing ASCII controls.
- Baseline fixture builder was not modified.

## CURRENT INTERPRETATION
- F04 input itself is not sufficient to trigger the warning.
- F02 missing-font setup alone is not sufficient in the tested path.
- The F03 mixed-font path is the leading LIKELY contributor.
- CharacterRange assignment itself is not yet confirmed because the F03 text layer must be tested with and without that assignment under otherwise matched conditions.

## NEW DIAGNOSTICS
- diagnostics/JPFP_Repro_F03_TextOnly_Control.jsx
- diagnostics/JPFP_Repro_F03_RangeAssignment.jsx

Both use:
- text: 日本語 ABC
- whole-layer JP font: MS-Gothic
- treatment Latin font: AniMeVisionMB_EN

Both log per-range font readback before opening the composition.

## NEXT TASK
Run the two diagnostics in separate fresh AE 26.5 processes, each preceded by a passing ASCII smoke test.

For each case preserve:
- full log;
- screenshot if BIB appears;
- READBACK_BEFORE_RANGE;
- READBACK_CONTROL or READBACK_AFTER_RANGE;
- whether BIB appears during script, openInViewer, or after script completion.

If control is clean and treatment reproduces BIB with readback proving 4_7 = AniMeVisionMB_EN, CharacterRange mixed-font assignment becomes the leading independently reproduced trigger.
