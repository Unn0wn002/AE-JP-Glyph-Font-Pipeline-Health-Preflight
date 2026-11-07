# AE Glyph: human evidence review pack (2026-11-02)

Everything a reviewer needs, with full paths. Project folder:
`C:\Users\unn0w\Downloads\02_Projects\AE-JP-Glyph-Font-Pipeline-Health-Preflight\` (called `<P>` below).

## What is being decided
The project status says the package stays `BLOCKED_NATIVE_VALIDATION` until a person reviews the native evidence. The reviewer decides:
1. Is the native evidence believable and complete for what it claims (14 of 14 rows PASS: F01-F12, L01, R01)?
2. Is the one documented limit acceptable? F05 passed only for applied-font reassignment; its retained gap branch, exact rendered-fallback identity and shaping stay UNVALIDATED.
3. Record the answer (see the end). This is not a release approval.

## Read in this order
| # | What | Path | What to look for |
|---|---|---|---|
| 1 | Current status and gate | `<P>\PROJECT_STATUS.md` (top section "Current genuine F02 and fresh native matrix") | The claim: 14/14 PASS, pending your review |
| 2 | Row-by-row results table | `<P>\TEST_RESULTS.md` (table with F01-F12, L01, R01) | Each row has a verified setup, a native result and a stated scope |
| 3 | What each row means | `<P>\docs\NATIVE_BETA_VALIDATION.md` | The definition of F01-F12, L01, R01 |
| 4 | What the product does NOT claim | `<P>\docs\BETA_LIMITATIONS.md` and `<P>\docs\KNOWN_LIMITATIONS.md` | Static text only; no rendered-fallback or shaping proof |
| 5 | The final 14/14 run (Windows Sandbox, via the panel, 30 Oct) | `<P>\evidence\native-20261030-panel-sandbox\README.md`, `evaluation.tsv`, `evaluation.json`, `aggregate-run1.txt`, `aggregate-run2.txt`, `fixture-provenance.txt` | All 14 rows PASS; two runs agree; project unchanged |
| 6 | The earlier 14/14 run on the main PC (19 Oct) | `<P>\evidence\native-20261019-zen\` (`evaluation.tsv`, `aggregate-run1.txt`, `aggregate-run2.txt`, screenshots `*-export.png`) | Same result on a second environment; the genuine missing-font fixture F02 |
| 7 | The real missing-font fixture (how F02 was made) | `<P>\evidence\native-20261019-resumed\`, `<P>\evidence\native-20261019-fixture-intake\` | Not a simulated condition |
| 8 | The panel today (UI checks) | `<P>\evidence\native-20261029-dock-panel\`, `<P>\evidence\native-20261102-honest-status\` (README + 7 screenshots) | Docked panel works; status colour follows the counts |
| 9 | Integrity of the evidence | each folder's `SHA256SUMS.txt` | Hashes of every file |

## Try it yourself (about 10 minutes, optional)
The panel is already installed on this machine:
- `C:\Users\unn0w\AppData\Roaming\Adobe\After Effects\26.5\Scripts\ScriptUI Panels\JPFP_Session1_Panel.jsx` and `...\ScriptUI Panels\JPFP\JPFP_Session1_Probe.jsx`
- Steps: `<P>\docs\BETA_DEMO_CHECKLIST.md` ("Short demonstration"). Use a throwaway project. To build the test comps run `<P>\fixtures\JPFP_Session1_CreateFixtures.jsx` (File > Scripts > Run Script File) in a NEW project, then open Window > JPFP_Session1_Panel and press Scan with ONE composition selected.
- Expected on the fixture comp: amber "Scan complete: review needed.", Problems 0, Review needed 5, Not checked 4, Coverage gaps 1 (this machine does not accept the missing-font fixture F02). Press **Show details** to see the scanner's own text; the language button switches Japanese / English. An empty composition must show amber "nothing was checked", never green.
- The panel scans ONE active composition at a time (documented limit).

## The package
`<P>\dist\AE-JP-Glyph-Font-Preflight-0.1.0-beta.1.zip` and `...zip.sha256` (SHA-256 `afe9fc4d7ce2f7cea84fce9e02831e01c7be65bc5cd6fef802a7d63e7ce64e1e`), built from `main` at `d173be4` (includes the compact view, language switch and zero-checked fix). Installation steps: `<P>\docs\BETA_INSTALLATION.md`. A synthetic sample report (NOT native evidence): `<P>\examples\BETA_SAMPLE_REPORT.txt`.

## Record the decision
Add one dated line to `<P>\PROJECT_LOG.md` and to `<P>\PROJECT_STATUS.md`: reviewer name, date, "evidence accepted" or "not accepted" and why, and whether the F05 limit is accepted. If you want, tell Claude the sentence and it will edit, commit and open the PR.
