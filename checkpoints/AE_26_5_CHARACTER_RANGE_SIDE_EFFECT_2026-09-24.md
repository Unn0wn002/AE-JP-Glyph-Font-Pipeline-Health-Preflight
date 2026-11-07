# Checkpoint — CharacterRange Side Effect Likely

Date: 2026-09-24
Gate: PROTOTYPE IN PROGRESS
Decision: CONTINUE

## VERIFIED
- Control and treatment ran in separate fresh AE 26.5x89 processes.
- Both were preceded by passing ASCII smoke controls.
- F03 text-only control produced no BIB 83::3.
- F03 CharacterRange treatment produced BIB 83::3 while the composition was being displayed/evaluated.
- Treatment assignment produced no scripting exception.
- Project revision did not change at the range-assignment boundary.
- Fresh Source Text readback after treatment still reported MS-Gothic for range 4_7.
- Persisted AniMeVisionMB_EN mixed formatting was not established.

## CLASSIFICATION
CHARACTER RANGE SIDE EFFECT LIKELY.

This is not yet a confirmed persisted mixed-font rendering defect.

## DOCUMENTATION NOTE
Current scripting documentation describes CharacterRange as an accessor to its TextDocument instance and demonstrates direct writes to range attributes. TextDocument property changes are commonly committed through Source Text property setValue(). Therefore the range setter and subsequent p.setValue(tdRange) must be isolated as separate causal operations.

## NEXT DIAGNOSTIC
`diagnostics/JPFP_Repro_F03_RangeSetter_NoSetValue.jsx`

The script:
- creates only one F03 layer;
- applies whole-layer MS-Gothic;
- obtains a local TextDocument;
- executes CharacterRange(4,7).fontObject = AniMeVisionMB_EN;
- intentionally omits p.setValue(tdRange);
- logs in-memory TextDocument range readback;
- logs fresh Source Text property readback;
- opens the composition;
- logs both states again.

## DECISION MATRIX
- No BIB without setValue -> p.setValue(tdRange) becomes leading trigger.
- BIB without setValue -> CharacterRange setter/accessor itself becomes leading trigger.
- Local tdRange shows AniMeVision but fresh property stays MS-Gothic -> setter mutates local TextDocument state without persisting to Source Text.
- Fresh property shows AniMeVision without setValue -> CharacterRange accessor has live/persistent behavior and needs deeper API semantics validation.
