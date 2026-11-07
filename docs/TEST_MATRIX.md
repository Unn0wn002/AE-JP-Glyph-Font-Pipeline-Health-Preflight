> **Historical status document (last updated 2026-09-24).** For current status see [PROJECT_STATUS.md](../PROJECT_STATUS.md). Content below is kept unchanged for history; known outdated: every row shows BLOCKED, but the native matrix later passed 14/14 (pending human review).

# Test Matrix

Target host: After Effects 26.5
Current native target-host state: NOT RUN

| ID | Scenario | Current state |
|---|---|---|
| F01 | Healthy Japanese + Latin | BLOCKED in latest native attempt |
| F02 | Missing font reference | BLOCKED |
| F03 | Mixed font runs | BLOCKED |
| F04 | JP + Latin punctuation | BLOCKED |
| F05 | Glyph-gap / fallback observability | BLOCKED |
| F06 | Empty text | BLOCKED |
| F07 | Supplementary CJK | BLOCKED |
| F08 | Combining dakuten | BLOCKED |
| F09 | Variation sequence | BLOCKED |
| F10 | Animated Source Text | BLOCKED |
| F11 | Expression Source Text | BLOCKED |
| F12 | Non-text layer | BLOCKED |
| L01 | 100 text layers | BLOCKED |
| R01 | Repeated scan / project integrity | BLOCKED |
| VF01 | Variable-font recognition | PLANNED; restored baseline does not yet include dedicated fixture |

Latest local host identity reported by Codex: AE 26.3x87, build 87, en_US on Windows build 26200.9457 AMD64. This is not target-host evidence for AE 26.5.


## Latest target-host attempt — 2026-09-24

Target AE 26.5x89 reached.

| Test | Latest state |
|---|---|
| Host identity | HOST VERIFIED |
| Static suite | PASS |
| Basic ASCII text creation | HOST FAILED — BIB 83::3 |
| F01-F12 | BLOCKED — text layer creation unavailable |
| R01 text-based repeatability | BLOCKED |
| Solid-only read-only control | HOST VERIFIED |
| L01 | BLOCKED |
| VF01 | NOT IMPLEMENTED IN RESTORED BASELINE |


## After restart recovery

| Test | Current state |
|---|---|
| Basic ASCII UI Text | HOST VERIFIED |
| Basic ASCII scripted addText | HOST VERIFIED |
| Partial R01 on five-layer composition | HOST VERIFIED |
| F01 | PARTIAL PASS only |
| F02 | INCONCLUSIVE |
| F03 | INCONCLUSIVE |
| F04 | PARTIAL PASS only |
| F05 | INCONCLUSIVE |
| F06-F12 | BLOCKED |
| L01 | BLOCKED |
| BIB 83::3 trigger isolation | IN PROGRESS |


## BIB isolation refinement

| Diagnostic | State |
|---|---|
| First warning operation boundary | LIKELY ISOLATED: F04 addText |
| F04 standalone causation | NOT YET CONFIRMED |
| F02 prior-state contribution | UNVERIFIED |
| F03 prior-state contribution | UNVERIFIED |
| F06 addText("") return behavior | HOST ANOMALY OBSERVED; standalone confirmation pending |


## F04/F02/F03 causal matrix

| Case | Result | State |
|---|---|---|
| F04 standalone | No BIB | F04 input alone NOT SUFFICIENT |
| F02 -> F04 | No BIB | F02 alone not reproducing |
| F03 -> F04 | BIB on composition open | F03 path LIKELY contributor |
| F02 + F03 -> F04 | BIB on composition open | Consistent with F03 path |
| F03 text-only control | PENDING | Next A/B |
| F03 CharacterRange treatment | PENDING | Next A/B |


## F03 CharacterRange A/B

| Case | Range 4_7 readback | BIB | Classification |
|---|---|---|---|
| Text-only control | MS-Gothic | No | Clean control |
| CharacterRange + setValue treatment | MS-Gothic | Yes | CharacterRange/API host-state side effect LIKELY |
| CharacterRange setter only, no setValue | PENDING | PENDING | Next experiment |


## CharacterRange setter A/B

| Case | BIB | 4_7 readback | State |
|---|---|---|---|
| F03 text-only control | No | MS-Gothic | HOST VERIFIED CLEAN CONTROL |
| CharacterRange + p.setValue(tdRange) | Yes | MS-Gothic | SIDE EFFECT LIKELY; mixed run NOT ESTABLISHED |
| CharacterRange setter without p.setValue | PENDING | PENDING | Next isolation |


## Setter vs property-write isolation

| Case | Local 4_7 | Fresh property 4_7 | BIB | State |
|---|---|---|---|---|
| Setter only, no p.setValue | AniMeVisionMB_EN | MS-Gothic | No | LOCAL TEXTDOCUMENT MUTATION ONLY |
| Setter + exactly one p.setValue(tdRange) | PENDING | PENDING | PENDING | Next matched confirmation |


## Property-write vs display isolation

| Experiment | Property write | Comp opened | BIB | State |
|---|---:|---:|---|---|
| Setter only | No | Yes | No | LOCAL TEXTDOCUMENT MUTATION ONLY |
| Setter + p.setValue | Yes | Yes | Yes, after script completion/display | HOST SIDE EFFECT CONFIRMED |
| Phase A: setter + p.setValue, no open, fixed idle | Yes | No | PENDING | Next test |
| Phase B: later open same comp | Already done | Yes | PENDING | Next test |
