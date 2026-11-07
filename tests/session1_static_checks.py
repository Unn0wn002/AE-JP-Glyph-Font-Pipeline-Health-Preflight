from pathlib import Path
import subprocess
import tempfile
import py_compile

ROOT = Path(__file__).resolve().parents[1]
probe = ROOT / 'src' / 'JPFP_Session1_Probe.jsx'
panel = ROOT / 'src' / 'JPFP_Session1_Panel.jsx'
fixture = ROOT / 'fixtures' / 'JPFP_Session1_CreateFixtures.jsx'
expected = ROOT / 'fixtures' / 'EXPECTED_RESULTS.tsv'


def node_syntax_check(path: Path):
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    if lines and lines[0].startswith('#target'):
        text = '\n'.join(lines[1:]) + '\n'
    with tempfile.NamedTemporaryFile('w', suffix='.js', encoding='utf-8', delete=False) as tmp:
        tmp.write(text)
        tmp_path = tmp.name
    try:
        subprocess.run(['node', '--check', tmp_path], check=True)
    finally:
        Path(tmp_path).unlink(missing_ok=True)


node_syntax_check(probe)
node_syntax_check(panel)
node_syntax_check(fixture)
beta_diagnostics = sorted((ROOT / 'diagnostics' / 'beta').glob('*.jsx'))
for diagnostic in beta_diagnostics:
    node_syntax_check(diagnostic)
py_compile.compile(str(ROOT / 'scripts' / 'evaluate_native_beta.py'), doraise=True)

probe_text = probe.read_text(encoding='utf-8')
forbidden = [
    '.setValue(', '.setValueAtTime(', '.addText(', '.addComp(', '.addSolid(',
    'replaceFont(', 'app.beginUndoGroup', '.remove()'
]
found = [token for token in forbidden if token in probe_text]
assert not found, f'Potential AE project mutation token(s) found in read-only probe: {found}'

panel_text = panel.read_text(encoding='utf-8')
panel_found = [token for token in forbidden if token in panel_text]
assert not panel_found, f'Potential AE project mutation token(s) found in panel wrapper: {panel_found}'
assert 'eval("(function (alert) {' in panel_text and 'scanner(stubAlert)' in panel_text, 'Panel must run the unchanged scanner text with alert shadowed'
assert '$.evalFile' not in panel_text, 'Panel must not evalFile the scanner (global alert cannot be reassigned in AE 26.5)'

for required in ['numKeys', 'expressionEnabled', 'hasGlyphsFor', 'isSubstitute', 'characterRange']:
    assert required in probe_text, f'Missing required probe capability reference: {required}'

rows = expected.read_text(encoding='utf-8').splitlines()
assert len(rows) == 15, f'Expected 14 fixture rows plus header, got {len(rows)} total lines'

print('SESSION1_STATIC_CHECKS: PASS')
print('Node parse check: PASS (probe + fixture builder, after removing #target directive)')
print(f'Beta diagnostic parse checks: PASS ({len(beta_diagnostics)} scripts; not native execution)')
print('Native evidence evaluator compile check: PASS (not native acceptance)')
print('Read-only mutation-token scan: PASS')
print('Required API reference scan: PASS')
print('Fixture matrix rows: 14')
