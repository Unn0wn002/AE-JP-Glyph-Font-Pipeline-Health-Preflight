# Checkpoint — AE 26.5 Text-Layer Host Blocker

Date: 2026-09-24
Project: 9-A — AE JP Glyph & Font-Pipeline Health Preflight
Gate: PROTOTYPE IN PROGRESS
Decision: CONTINUE

## HOST VERIFIED

- After Effects 26.5x89, build 89, en_US.
- Windows 11 Home Single Language 10.0.26200.9457 AMD64.
- Static suite PASS on the Windows test machine.
- Solid-only probe control exported two matching reports.
- Solid-only probe left project revision unchanged at 33 -> 33 on both runs.

## HOST FAILED / SETUP BLOCKED

- Fixture builder could not create its first text layer.
- Minimal scripted addText("ABC 123") control also failed.
- Manual AE UI Text tool reproduced the same BIB 83::3 warning.
- Therefore F01-F12, text-based R01 and L01 did not execute.

## UNKNOWN / CANNOT VERIFY

- Glyph coverage reliability.
- Missing/substitute-font observability.
- Mixed-font CharacterRange behavior.
- Exact rendered fallback identity.
- Unicode edge cases.
- Text-layer read-only repeatability.
- Large-project text performance.

## DIAGNOSTIC INTERPRETATION

Adobe documents 83::3 in connection with an unreadable/corrupt font dictionary. Official troubleshooting prioritizes:
1. restart the computer and After Effects;
2. rebuild Adobe font database/cache files;
3. if unresolved, isolate/remove bad or corrupt fonts and rebuild the cache again.

The current evidence does not establish which specific font or cache entry is defective.

## NEXT TASK

Restore creation of one plain ASCII text layer in a fresh AE 26.5 disposable project. Do not rerun the full fixture suite until that smoke test succeeds.
