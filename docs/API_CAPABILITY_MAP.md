# API Capability Map

Last reconciled: 2026-09-24

| Capability | State |
|---|---|
| Font identity / substitute state | DOCUMENTED; prototype implemented; target-host test NOT RUN |
| Per-character font/style access | DOCUMENTED; prototype implemented; target-host test NOT RUN |
| Project used-font mapping | DOCUMENTED; not yet exercised by Session 1 probe |
| FontObject.hasGlyphsFor | DOCUMENTED; prototype implemented; target-host test NOT RUN |
| Exact rendered fallback font identity | UNKNOWN / CANNOT VERIFY |
| Shaping/render correctness from coverage | UNKNOWN / CANNOT VERIFY |
| Unicode supplementary/combining/variation semantics | UNVERIFIED |
| Variable-font recognition | REQUIRED BY PROJECT; dedicated fixture not yet present in restored Session 1 baseline |
| Read-only project integrity | STATICALLY CHECKED; native R01 NOT RUN |
| Large-project performance | NOT RUN |

Target-host authority remains After Effects 26.5 native execution.


## CharacterRange write-semantics note — 2026-09-24

Current scripting documentation describes CharacterRange as an accessor to its TextDocument and demonstrates direct CharacterRange attribute mutation without an additional Source Text Property.setValue call.

Native AE 26.5 evidence currently shows:
- matched text-only control: clean;
- CharacterRange.fontObject attempt followed by p.setValue(tdRange): BIB 83::3;
- fresh readback remained MS-Gothic for the target range.

Status: WRITE SEMANTICS UNDER HOST TEST. Do not claim CharacterRange mixed-font write reliability yet.


## Host-observed CharacterRange persistence behavior

AE 26.5x89 host evidence now shows that assigning `CharacterRange.fontObject` on a local `TextDocument` can change that local object's range readback while a fresh Source Text `p.value` remains unchanged. No project revision increment or BIB warning was observed in the setter-only run.

Current state:
- local CharacterRange mutation: HOST VERIFIED;
- persistence to Source Text without Property.setValue: NOT OBSERVED;
- property write with `p.setValue(tdRange)`: leading LIKELY BIB trigger, confirmation pending.

Do not claim reliable mixed-font write support until the matched property-write test completes.


## Property setValue side-effect evidence

Matched AE 26.5x89 evidence:
- local CharacterRange setter alone: no BIB;
- same setter plus one Source Text `p.setValue(tdRange)`: BIB later surfaced during host display/evaluation;
- the requested mixed-font range still did not appear in fresh Source Text readback;
- project revision did not change at the write boundary.

Status: `PROPERTY SETVALUE HOST SIDE EFFECT CONFIRMED` for this tested font/range/path. Synchronous failure inside Property.setValue is NOT established; display/evaluation timing remains under isolation.
