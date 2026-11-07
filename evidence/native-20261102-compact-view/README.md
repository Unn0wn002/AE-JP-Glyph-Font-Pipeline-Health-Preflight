# Native check: compact view, one language at a time, details toggle (2026-11-02, Claude Sonnet 5.5)

Class: PASS_BOUNDED_NATIVE for the floating panel on one machine (After Effects 26.5x89, Windows). The scanner `JPFP_Session1_Probe.jsx` is unchanged (sha256 `f93d2218...8156e`); the panel wrapper is sha256 `b4856027...feda`. Run with File > Scripts > Run Script File against the owner's open project (a single composition `Comp 1` with one mixed Japanese and Latin text layer); nothing was changed or saved, and the test window was closed afterwards.

## Owner feedback this answers (`owner-feedback\`)
The owner tried the plugin and asked for: (1) one language at a time instead of English and Japanese on every line, (2) a way to show or hide the description and details, with the main view showing only what is needed, and asked (3) whether it really works on several compositions.

## What changed (panel wrapper only)
- **One language at a time**, with a button that names the OTHER language (日本語 / English). The choice is saved in After Effects' settings; Japanese is the default, as in the other After Effects panels. Switching redraws the status, counts, buttons, details and notes without scanning again. The scanner's own text is shown exactly as the scanner wrote it.
- **Compact main view**: scan button + language button, one status line, the count lines, "Show details / Hide details", Export. The description and the scanner's text are in the details area, closed by default. The details open by themselves when there is no report, a block or an error, so the reason is always visible.
- Everything from earlier today stays: colour follows the counts, nothing-checked is amber, never green without a checked layer, export status short with the path in the details.
- The description now says in plain words: ACTIVE composition only; other compositions, nested compositions and animated / expression text are not scanned.

## Question 3: does it work on several compositions?
No, by design. The scanner reads only the active composition (`app.project.activeItem`) and the project documents "No recursive precomposition or whole-project scan" (`docs/BETA_LIMITATIONS.md`, `docs/KNOWN_LIMITATIONS.md`). To cover several compositions, scan each one in turn. A "scan all compositions" button would have to open each composition in the viewer, which changes what the user sees, so it is NOT built; it is a design decision for the owner.

## Results
| Check | Result | Evidence |
|---|---|---|
| Compact main view in Japanese after a scan: amber status, five count lines, "詳細を表示", Export; no description or scanner text | PASS_BOUNDED_NATIVE | `01` |
| Show details: description (Japanese) and the scanner text appear; the window grows; "詳細を隠す" | PASS_BOUNDED_NATIVE | `02` |
| Language button to English: everything English, no new scan | PASS_BOUNDED_NATIVE | `03` |
| Narrow window (about 220 px): compact view and details both fit, nothing cut off | PASS_BOUNDED_NATIVE | `04`, `05` |
| Details open by themselves on a no-report / error result | NOT_RUN natively; unit-tested | `tests/panel_wrapper.test.cjs` |
| Docked after an After Effects restart (the owner's session was open and was left alone); red state natively; Export in the new layout natively | NOT_RUN | n/a |
| Unit tests: panel wrapper 32/32, behavioral 74/74 (mock host), unittest 10/10, static checks | PASS (test doubles) | `tests/` |

The installed panel file in `ScriptUI Panels` is this version; a session that was already open keeps the old one until After Effects is restarted.
