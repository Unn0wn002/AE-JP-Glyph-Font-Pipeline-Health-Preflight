# Checkpoint — Property setValue Host Side Effect Confirmed

Date: 2026-09-24
Gate: PROTOTYPE IN PROGRESS
Decision: CONTINUE

## HOST VERIFIED
- AE 26.5x89, build 89.
- Fresh ASCII smoke passed.
- Local CharacterRange setter changed local 4_7 to AniMeVisionMB_EN.
- Fresh Source Text remained 4_7 = MS-Gothic.
- Exactly one p.setValue(tdRange) returned with no JavaScript exception.
- Fresh Source Text still remained MS-Gothic after the write and after openInViewer.
- Project revision stayed 33 across the write.
- BIB 83::3 surfaced later, after script completion, while the composition was displayed.

## CLASSIFICATION
PROPERTY SETVALUE HOST SIDE EFFECT CONFIRMED.

This does not prove the warning is thrown synchronously inside p.setValue. It proves that the matched run with the property write differs from the clean setter-only run and later enters a BIB-warning host state.

## NEXT EXPERIMENT
Use the two-phase diagnostics:
- diagnostics/JPFP_Repro_F03_SetValue_NoOpen_PhaseA.jsx
- diagnostics/JPFP_Repro_F03_SetValue_DeferredOpen_PhaseB.jsx

Protocol:
1. fresh AE 26.5 process;
2. ASCII smoke passes;
3. fresh empty project;
4. run Phase A;
5. observe host for a fixed 10-second interval with the target comp unopened;
6. if no BIB occurs, run Phase B in the same AE process/project;
7. record whether first BIB appears before any display, at open/display, or not at all.

Do not modify the baseline fixture until this temporal boundary is resolved.
