"""Evaluate retained native beta reports against independent fresh-state snapshots.

No AE execution or writes occur on import. Only an explicit CLI invocation writes
evaluation JSON/TSV. Missing evidence/conditions are BLOCKED; observed mismatches
after a verified condition are FAIL. This never evaluates rendered fallback or shaping.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

EXPECTED = {
    "F01": "日本語の字幕です。ABC 123", "F02": "欠落フォント",
    "F03": "日本語 ABC", "F04": "「日本語」—ABC・123！？", "F05": "A漢B",
    "F06": "", "F07": "𠀋", "F08": "は\u3099", "F09": "葛\U000e0100",
}
MISSING_PS = "JPFP_Session1_MissingFont_PS__DO_NOT_INSTALL"
REQUIRED_IDS = [f"F{number:02}" for number in range(1, 13)] + ["L01", "R01"]


class Blocked(Exception):
    pass


def known(observation, description):
    if not isinstance(observation, dict) or observation.get("status") != "OK" or "value" not in observation:
        raise Blocked(f"{description} UNKNOWN/missing: {observation}")
    return observation["value"]


def require(condition, description):
    if not condition:
        raise Blocked(description)


def read_genuine_binding(path):
    """Bind an imported real fixture to retained authoring and validation bytes."""
    binding = json.loads(path.read_text(encoding="utf-8-sig"))
    require(binding.get("schema") == "JPFP-GENUINE-BINDING-1", "Unsupported genuine fixture binding")
    records = {}
    for key in ["provenance", "author", "validation", "state", "transfer"]:
        reference = binding.get(key, {})
        file = path.parent / reference.get("path", "")
        require(file.is_file(), f"Genuine {key} evidence absent")
        raw = file.read_bytes()
        require(hashlib.sha256(raw).hexdigest() == reference.get("sha256"), f"Genuine {key} evidence hash mismatch")
        records[key] = json.loads(raw.decode("utf-8-sig"))
    provenance, author, validation = (records[key] for key in ["provenance", "author", "validation"])
    ps = binding.get("postScriptName")
    require(isinstance(ps, str) and bool(ps) and ps == provenance.get("font", {}).get("postScriptName"), "Declared real font identity mismatch")
    require(author.get("status") == "AUTHORING_PERSISTENCE_VERIFIED", "Genuine authoring persistence not verified")
    require(author.get("otherConditionsPreservedAfterAssignment") is True and author.get("otherConditionsPreservedAfterReopen") is True,
            "Authoring changed other sampled fixture conditions")
    for phase in ["afterAssignment", "afterReopen"]:
        chars = author.get(phase, [])
        require(len(chars) == 6 and "".join(c.get("text", "") for c in chars) == EXPECTED["F02"] and
                all(c.get("postScriptName") == ps and c.get("isSubstitute") is False and c.get("hasGlyph") is True for c in chars),
                f"Genuine authoring {phase} character persistence/coverage missing")
    require(validation.get("status") == "GENUINE_MISSING_REFERENCE_OBSERVED" and validation.get("fontBefore") == [],
            "Validation did not establish absence before opening")
    transfer = records["transfer"]
    require(transfer.get("method") == "Sandbox received original and unsaved disposable returned to main; SHA-256 computed on returned bytes" and
            transfer.get("receivedOriginalSHA256") == provenance.get("projectSHA256") == transfer.get("receivedWorkSHA256") and
            transfer.get("sourceFilesMatchReturned") is True,
            "Received original/disposable hashes differ from author provenance")
    chars = validation.get("f02", [])
    require(len(chars) == 6 and "".join(c.get("text", "") for c in chars) == EXPECTED["F02"] and
            all(c.get("postScriptName") == ps and c.get("isSubstitute") is True for c in chars),
            "Native missing font does not cover all six intended characters")
    ids = {c.get("fontID") for c in chars}
    require(len(ids) == 1 and any(f.get("postScriptName") == ps and f.get("fontID") in ids and f.get("isSubstitute") is True
                                for f in validation.get("missingInventory", [])), "Matching missing-font inventory absent")
    require(not any(f.get("isSubstitute") is False for f in validation.get("fontAfter", [])), "Real font installed in validation")
    require(records["state"] == validation.get("afterOpen"), "Independent validation state differs from declared raw state")
    return {**binding, "records": records, "binding_sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def bind_genuine_run(run, binding, kind):
    validation = binding["records"]["validation"]
    require(all(str(run["host"][key]) == str(validation["host"][key]) for key in run["host"]), "Scan host differs from native prerequisite host")
    name = "JPFP_BETA_FIXTURES__DISPOSABLE" if kind == "fixture" else "JPFP_BETA_L01__DISPOSABLE"
    matches = [s["state"]["activeComposition"] for s in binding["records"]["state"] if known(s["state"]["activeComposition"]["name"], "Prerequisite comp name") == name]
    require(len(matches) == 1, "Genuine prerequisite composition mapping absent/ambiguous")
    expected, actual = matches[0], run["before"]["state"]["activeComposition"]
    require(known(actual["id"], "Scan composition ID") == known(expected["id"], "Prerequisite composition ID"), "Genuine composition ID mismatch")
    require(len(actual["layers"]) == len(expected["layers"]), "Genuine layer count mismatch")
    for before, scanned in zip(expected["layers"], actual["layers"]):
        for field in ["id", "name"]:
            require(known(before[field], "Bound layer " + field) == known(scanned[field], "Scanned layer " + field), "Genuine layer mapping mismatch")
        require(before.get("sourceText") == scanned.get("sourceText"), "Scanned text/font/key/expression state differs from native prerequisite")
    run["genuine_binding"] = binding


def decode_cell(text):
    # Scanner escaping is intentionally not Python's unicode_escape codec.
    pattern = re.compile(r"\\(\\|n|r|t|u[0-9A-Fa-f]{4})")
    decoded = pattern.sub(lambda match: {"\\": "\\", "n": "\n", "r": "\r", "t": "\t"}.get(
        match.group(1), chr(int(match.group(1)[1:], 16)) if match.group(1).startswith("u") else match.group(1)), text)
    # JSON snapshots normalize valid surrogate pairs to scalar characters. Match
    # that representation while preserving any unpaired unit without replacement.
    return decoded.encode("utf-16-le", errors="surrogatepass").decode("utf-16-le", errors="surrogatepass")


def read_report(path):
    if not path or not path.is_file():
        raise Blocked(f"Report missing: {path}")
    text = path.read_text(encoding="utf-8-sig")
    require("SYNTHETIC" not in text[:300].upper() and "MOCK" not in text[:300].upper(), f"Synthetic report cannot be native evidence: {path}")
    lines = text.splitlines()
    metrics, tables = {}, {"characters": [], "layers": [], "findings": []}
    header, kind = None, None
    for line in lines:
        if not line:
            header, kind = None, None
            continue
        cells = [decode_cell(cell) for cell in line.split("\t")]
        if cells[0] == "severity":
            header, kind = cells, "findings"
        elif cells[0] == "type" and "coverage" in cells:
            header, kind = cells, "characters"
        elif cells[0] == "type" and "sourceText" in cells:
            header, kind = cells, "layers"
        elif header:
            if len(cells) == len(header):
                tables[kind].append(dict(zip(header, cells)))
            elif not cells[0].startswith("NO_FINDINGS_"):
                raise Blocked(f"Truncated/malformed {kind} table: {path}")
        elif len(cells) == 2:
            metrics[cells[0]] = cells[1]
    require(metrics.get("Report schema") == "JPFP-BETA-REPORT-2", f"Missing/unsupported report schema: {path}")
    require("Project revision equality is one observation" in text, f"Report interpretation/footer incomplete: {path}")
    require("do not prove rendered fallback or shaping correctness" in text, f"Coverage limitation absent: {path}")
    try:
        require(int(metrics["Scan elapsed milliseconds"]) >= 0, f"Negative scanner duration: {path}")
        counts = {key: int(metrics[key]) for key in ["Characters examined", "Characters coverage verified", "Characters coverage verified present", "Characters coverage verified absent", "Characters coverage skipped", "Characters coverage failed"]}
    except (KeyError, ValueError) as error:
        raise Blocked(f"Coverage metrics missing/invalid: {path}: {error}") from error
    errors = []
    rows = tables["characters"]
    statuses = {status: sum(row.get("coverage") == status for row in rows) for status in ["VERIFIED_PRESENT", "VERIFIED_ABSENT", "NOT_CHECKED", "FAILED"]}
    if len(rows) != counts["Characters examined"] or sum(statuses.values()) != len(rows):
        errors.append("Character rows/statuses do not reconcile to examined count")
    for label, actual in [("Characters coverage verified", statuses["VERIFIED_PRESENT"] + statuses["VERIFIED_ABSENT"]),
                          ("Characters coverage verified present", statuses["VERIFIED_PRESENT"]),
                          ("Characters coverage verified absent", statuses["VERIFIED_ABSENT"]),
                          ("Characters coverage skipped", statuses["NOT_CHECKED"]), ("Characters coverage failed", statuses["FAILED"])]:
        if counts[label] != actual:
            errors.append(f"{label} does not reconcile to character rows")
    if any(row["coverage"].startswith("VERIFIED_") and row.get("fontIdentity") != "VERIFIED" for row in rows):
        errors.append("Verified coverage attached to unknown font identity")
    return {"path": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "metrics": metrics, **tables, "errors": errors, "text": text}


def read_run(directory, report_path):
    require(directory is not None and directory.is_dir(), f"State directory missing: {directory}")
    parts = {}
    for name in ["before", "after", "comparison", "run"]:
        path = directory / f"{name}.json"
        require(path.is_file(), f"Wrapper evidence missing: {path}")
        try:
            parts[name] = json.loads(path.read_text(encoding="utf-8-sig"))
        except (ValueError, OSError) as error:
            raise Blocked(f"Invalid wrapper JSON {path}: {error}") from error
    comparison, run = parts["comparison"], parts["run"]
    require(run.get("schema") == "JPFP-NATIVE-STATE-1", f"Unknown wrapper schema in {directory}")
    require(isinstance(comparison.get("scannerWallMsIncludingDialogs"), (int, float)) and comparison["scannerWallMsIncludingDialogs"] >= 0,
            f"Missing/invalid wrapper scanner wall timing: {directory}")
    require(run.get("scannerEvaluation", {}).get("status") == "OK", f"Production scanner evaluation failed: {directory}")
    for which in ["before", "after"]:
        require(parts[which].get("sampling", {}).get("truncated") is False, f"Snapshot truncation unknown/true: {directory}/{which}")
    require(comparison.get("anySamplingTruncated") is False, f"Wrapper sampled state incomplete: {directory}")
    host = {key: known(run.get("host", {}).get(key), f"Host {key}") for key in ["version", "buildName", "buildNumber", "locale", "os"]}
    report = read_report(report_path)
    errors = list(report["errors"])
    before, after = parts["before"]["state"], parts["after"]["state"]
    for label, key in [("AE version", "version"), ("AE build name", "buildName"), ("AE build number", "buildNumber"), ("AE locale", "locale"), ("OS", "os")]:
        if report["metrics"].get(label) != str(host[key]):
            errors.append(f"Report host {label} differs from independent wrapper")
    if before != after or comparison.get("exactSampledStateEqual") is not True:
        errors.append("Independent before/after sampled project state differs")
    if known(comparison.get("revisionUnchanged"), "Wrapper revision comparison") is not True:
        errors.append("Wrapper revision changed")
    for which, state in [("before", before), ("after", after)]:
        project = state.get("project", {})
        for field in ["revision", "dirty", "numItems"]:
            known(project.get(field), f"{which} project {field}")
        comp = state.get("activeComposition", {})
        for field in ["id", "name", "time", "numLayers", "selectedLayers"]:
            known(comp.get(field), f"{which} active comp {field}")
        require(len(comp.get("layers", [])) == known(comp.get("numLayers"), "Composition layer count"), "Layer snapshot count incomplete")
        for layer in comp["layers"]:
            for field in ["id", "name", "selected", "active", "selectedProperties"]:
                known(layer.get(field), f"{which} layer {layer.get('index')} {field}")
    for label, value in [("Composition ID", known(before["activeComposition"]["id"], "Comp ID")),
                         ("Composition", known(before["activeComposition"]["name"], "Comp name")),
                         ("Project revision before", known(before["project"]["revision"], "Before revision")),
                         ("Project revision after", known(after["project"]["revision"], "After revision")),
                         ("Total layers", known(before["activeComposition"]["numLayers"], "Layer count"))]:
        if report["metrics"].get(label) != str(value):
            errors.append(f"Report {label} differs from fresh wrapper state")
    if report["metrics"].get("Project revision unchanged") != "true":
        errors.append("Report does not establish unchanged revision")
    return {"directory": str(directory), **parts, "report": report, "host": host, "errors": errors}


def fixture_layer(run, fixture_id):
    matches = [layer for layer in run["before"]["state"]["activeComposition"]["layers"] if re.match(r"^\[" + fixture_id + r"\](?:\s|$)", known(layer.get("name"), "Layer name"))]
    require(len(matches) == 1, f"{fixture_id}: expected one uniquely named fixture layer; found {len(matches)}")
    return matches[0]


def source(layer):
    result = layer.get("sourceText", {})
    known(result.get("expressionEnabled"), "Source Text expressionEnabled")
    known(result.get("numKeys"), "Source Text numKeys")
    return result


def current_document(layer):
    result = source(layer).get("current", {})
    require(result.get("truncated") is False, "Current document sampling truncated/missing")
    known(result.get("text"), "Fresh current text")
    return result


def static_document(layer, expected):
    require(layer.get("kind") == "TEXT", "Fixture not independently identified as text")
    src = source(layer)
    require(known(src["expressionEnabled"], "Expression state") is False, "Fixture unexpectedly expression-driven")
    require(known(src["numKeys"], "Key count") == 0 and src.get("classification") == "STATIC", "Fixture not independently static")
    doc = current_document(layer)
    require(known(doc["text"], "Fixture text") == expected, f"Fixture text differs from expected {expected!r}")
    expected_points, offset = [], 0
    for char in expected:
        units = len(char.encode("utf-16-le", errors="surrogatepass")) // 2
        expected_points.append((offset, offset + units, f"U+{ord(char):04X}", char))
        offset += units
    chars = doc.get("characters", [])
    actual_points = [(row.get("start"), row.get("end"), row.get("codePoint"), row.get("text")) for row in chars]
    require(actual_points == expected_points, "Fresh character snapshot ranges/code points/text incomplete or invalid")
    return chars


def linked_report(run, layer):
    layer_id = str(known(layer["id"], "Layer ID"))
    rows = [row for row in run["report"]["layers"] if row.get("layerId") == layer_id]
    require(len(rows) == 1, "Product layer observation missing/duplicate")
    return rows[0], [row for row in run["report"]["characters"] if row.get("layerId") == layer_id], [row for row in run["report"]["findings"] if row.get("layerId") == layer_id]


def match_characters(run, layer, fresh):
    layer_row, rows, findings = linked_report(run, layer)
    errors = []
    if len(rows) != len(fresh):
        return ["Product character rows differ from fresh snapshot count"]
    for row, observation in zip(rows, fresh):
        for report_field, state_field in [("start", "start"), ("end", "end"), ("codePoint", "codePoint"), ("character", "text")]:
            if row.get(report_field) != str(observation[state_field]):
                errors.append(f"Product {report_field} differs at {observation['start']}")
        identifier = known(observation.get("fontID"), "Fresh character fontID")
        substitute = known(observation.get("isSubstitute"), "Fresh substitute state")
        # Selectors are intentionally not standalone glyph checks in the product.
        cp = int(observation["codePoint"][2:], 16)
        selector = 0xFE00 <= cp <= 0xFE0F or 0xE0100 <= cp <= 0xE01EF
        expected_coverage = "NOT_CHECKED" if selector else "VERIFIED_PRESENT" if known(observation.get("hasGlyphsFor"), "Fresh glyph result") is True else "VERIFIED_ABSENT"
        if row.get("fontIdentity") != "VERIFIED" or row.get("coverage") != expected_coverage:
            errors.append(f"Product identity/coverage differs at {observation['start']}: expected {expected_coverage}")
        if row.get("substitute") != ("TRUE" if substitute else "FALSE"):
            errors.append(f"Product substitute state differs at {observation['start']}")
        if f"; id={identifier};" not in row.get("fontSummary", ""):
            errors.append(f"Product applied fontID differs at {observation['start']}")
    return errors


def gap_experiment_branch(chars, setup_text, binding=None):
    """Distinguish a retained applied gap from independently observed reassignment."""
    if binding:
        evidence = binding["records"]["validation"].get("gapCandidate", {})
        require(evidence.get("ABC") is True and evidence.get("han") is False, "Fresh genuine F05 candidate API evidence absent")
        candidate_id, candidate_ps = evidence.get("fontID"), evidence.get("postScriptName")
        ids = [known(c.get("fontID"), "F05 font ID") for c in chars]
        ps = [known(c.get("postScriptName"), "F05 PS") for c in chars]
        glyphs = [known(c.get("hasGlyphsFor"), "F05 glyph") for c in chars]
        require(all(known(c.get("isSubstitute"), "F05 substitute") is False for c in chars), "F05 substitute/unknown applied run")
        require(ids[0] == ids[2] == candidate_id and ps[0] == ps[2] == candidate_ps and glyphs[0] is True and glyphs[2] is True,
                "F05 side characters do not retain native candidate")
        if ids[1] == candidate_id and ps[1] == candidate_ps and glyphs[1] is False:
            return "RETAINED_APPLIED_GAP", "Native retained applied gap observed; exact rendered fallback and shaping remain UNVALIDATED."
        require(ids[1] != candidate_id and glyphs[1] is True, "F05 middle neither retained gap nor covered distinct applied font")
        # The imported saved project retains the original observed reassignment;
        # bind_genuine_run matches all current raw properties to the independent
        # prerequisite, and author evidence proves other sampled state preserved.
        return "OBSERVED_APPLIED_FONT_REASSIGNMENT", "Preserved saved reassignment with fresh candidate API and A/B/middle readback. Native retained applied-gap, exact rendered-fallback identity and shaping remain UNVALIDATED."
    candidate = None
    api_proven = False
    experiment_line = None
    reassignment_recorded = False
    for line in setup_text.splitlines():
        fields = [decode_cell(field) for field in line.split("\t")]
        if "CANDIDATES" in fields:
            for field in fields:
                if field.startswith("Gap=") and "#" in field:
                    candidate = field[4:].rsplit("#", 1)
        if "FRESH_GAP_EXPERIMENT" in fields and "F05" in fields:
            experiment_line = fields
        if "OBSERVED_REASSIGNMENT" in fields and "F05" in fields:
            reassignment_recorded = True
    require(candidate is not None, "F05 candidate PS/fontID provenance missing in setup log")
    candidate_ps, candidate_id = candidate
    for line in setup_text.splitlines():
        fields = [decode_cell(field) for field in line.split("\t")]
        if "GAP_CANDIDATE_API" in fields and candidate_ps in fields and "ABC=true" in fields and "漢=false" in fields:
            api_proven = True
    require(api_proven, "F05 candidate ABC=true/漢=false API evidence absent or does not match selected candidate")
    ids = [str(known(c.get("fontID"), "F05 fontID")) for c in chars]
    ps = [known(c.get("postScriptName"), "F05 PostScript name") for c in chars]
    glyphs = [known(c.get("hasGlyphsFor"), "F05 glyph result") for c in chars]
    require(all(known(c.get("isSubstitute"), "F05 substitute") is False for c in chars), "F05 actual applied run contains substitute/unknown state")
    require(ids[0] == ids[2] == candidate_id and ps[0] == ps[2] == candidate_ps and glyphs[0] is True and glyphs[2] is True,
            "F05 fresh A/B side characters do not retain verified candidate with true coverage")
    if ids[1] == candidate_id and ps[1] == candidate_ps and glyphs[1] is False:
        return "RETAINED_APPLIED_GAP", "Native applied-gap branch verified; exact rendered fallback and shaping remain unvalidated."
    require(ids[1] != candidate_id and glyphs[1] is True, "F05 neither retained applied-gap nor known covered reassignment condition established")
    require(experiment_line is not None and "candidate=" + candidate_ps + "#" + candidate_id in experiment_line and
            "candidateABC=true" in experiment_line and "candidate漢=false" in experiment_line and
            "sideCandidateRetained=true" in experiment_line and reassignment_recorded,
            "F05 fresh middle-font reassignment provenance incomplete")
    return "OBSERVED_APPLIED_FONT_REASSIGNMENT", "Fresh covered middle-character applied FontObject reassignment observed. Native retained applied-gap branch remains UNVALIDATED; exact rendered fallback and shaping remain unvalidated."


def evaluate_fixture(run, fixture_id, setup_text):
    layer = fixture_layer(run, fixture_id)
    binding = run.get("genuine_binding")
    if fixture_id in EXPECTED:
        chars = static_document(layer, EXPECTED[fixture_id])
        if fixture_id == "F01":
            require(all(known(c.get("isSubstitute"), "F01 substitute") is False and known(c.get("hasGlyphsFor"), "F01 glyph") is True for c in chars), "F01 healthy-font full-text condition not established")
        elif fixture_id == "F02":
            if binding:
                validation = binding["records"]["validation"]
                require(known(layer["id"], "F02 layer ID") == validation.get("layerID") and
                        known(run["before"]["state"]["activeComposition"]["id"], "F02 comp ID") == validation.get("compositionID"), "Genuine F02 ID mapping mismatch")
                require(all(known(c.get("postScriptName"), "F02 actual PS") == binding["postScriptName"] for c in chars), "F02 PS differs from real saved reference")
            else:
                require(MISSING_PS in setup_text and re.search(r"F02|MISSING_FONT_REFERENCE", setup_text, re.I), "F02 missing-font assignment provenance absent from setup log")
            require(all(known(c.get("isSubstitute"), "F02 substitute") is True for c in chars), "F02 missing reference did not persist as substitute for all characters")
        elif fixture_id == "F03":
            ids = [known(c.get("fontID"), "F03 fontID") for c in chars]
            require(len(set(ids[:4])) == 1 and len(set(ids[4:7])) == 1 and ids[0] != ids[4], "F03 distinct intended JP/Latin persisted runs not established")
            require(all(known(c.get("isSubstitute"), "F03 substitute") is False and known(c.get("hasGlyphsFor"), "F03 glyph") is True for c in chars), "F03 healthy intentional mixed-font condition not established")
        elif fixture_id == "F05":
            gap_branch, gap_note = gap_experiment_branch(chars, setup_text, binding)
            run.setdefault("observations", {})[fixture_id] = gap_branch + ": " + gap_note
        errors = match_characters(run, layer, chars)
        layer_row, rows, findings = linked_report(run, layer)
        codes = [finding.get("code") for finding in findings]
        if fixture_id == "F01" and any(f.get("severity") == "PROBLEM_FOUND" for f in findings):
            errors.append("Healthy F01 received a problem finding")
        if fixture_id == "F02" and sum(code == "SUBSTITUTE_FONT_REFERENCE" for code in codes) != len(chars):
            errors.append("F02 substitute findings do not locate every verified substitute character")
        if fixture_id == "F03":
            if not any(f.get("code") == "MIXED_FONT_RUNS" and f.get("severity") == "REVIEW_NEEDED" for f in findings):
                errors.append("Intentional F03 mix lacks review finding")
            if any(f.get("code") == "MIXED_FONT_RUNS" and f.get("severity") == "PROBLEM_FOUND" for f in findings):
                errors.append("Intentional F03 mix incorrectly classified as an error")
        if fixture_id == "F05":
            gap_findings = [f for f in findings if f.get("code") == "FONT_REPORTS_NO_GLYPH" and f.get("start") == "1" and f.get("codePoint") == "U+6F22" and f.get("severity") == "PROBLEM_FOUND"]
            if gap_branch == "RETAINED_APPLIED_GAP" and not gap_findings:
                errors.append("Verified F05 middle-character gap lacks located problem finding")
            if gap_branch == "OBSERVED_APPLIED_FONT_REASSIGNMENT":
                if gap_findings:
                    errors.append("F05 covered reassignment incorrectly reported as applied-font gap")
                if not any(f.get("code") == "MIXED_FONT_RUNS" and f.get("severity") == "REVIEW_NEEDED" for f in findings):
                    errors.append("F05 observed reassigned middle font lacks mixed-font review")
        if fixture_id == "F06" and (rows or layer_row.get("sourceText") != "EMPTY_TEXT" or "EMPTY_TEXT" not in codes):
            errors.append("F06 not explicitly empty/zero-character in product")
        edge = {"F07": "U+2000B", "F08": "U+3099", "F09": "U+E0100"}.get(fixture_id)
        if edge and not any(f.get("code") == "UNICODE_SEQUENCE_EDGE_CASE" and f.get("codePoint") == edge and f.get("severity") == "REVIEW_NEEDED" for f in findings):
            errors.append(f"{fixture_id} lacks located Unicode review")
    elif fixture_id in ["F10", "F11"]:
        src = source(layer)
        if fixture_id == "F10":
            require(known(src["expressionEnabled"], "F10 expression") is False and known(src["numKeys"], "F10 keys") == 2, "F10 expected two non-expression keys")
            keys = src.get("keys", [])
            require(len(keys) == 2 and not src.get("keysTruncated"), "F10 key snapshot incomplete")
            values = [(known(key.get("time"), "F10 key time"), known(key.get("document", {}).get("text"), "F10 key text")) for key in keys]
            require(values == [(0, "静的"), (1, "動的")], f"F10 key conditions differ: {values}")
            code = "SOURCE_TEXT_ANIMATED"
        else:
            require(known(src["expressionEnabled"], "F11 enabled") is True and known(src.get("expressionError"), "F11 expressionError") == "", "F11 expression disabled or error")
            require(known(current_document(layer)["text"], "F11 evaluated text") == "式で生成", "F11 expression result not established")
            code = "SOURCE_TEXT_EXPRESSION"
        layer_row, rows, findings = linked_report(run, layer)
        errors = []
        if rows or layer_row.get("sourceText") != "NOT_CHECKED" or not any(f.get("code") == code and f.get("severity") == "NOT_CHECKED" for f in findings):
            errors.append(f"{fixture_id} not explicitly skipped without character coverage")
    else:
        checks = layer.get("kindChecks", {})
        require(known(checks.get("solidSource"), "F12 raw SolidSource check") is True and
                known(checks.get("textLayer"), "F12 raw TextLayer check") is False and
                layer.get("sourceText", {}).get("classification") == "NOT_APPLICABLE" and
                layer.get("sourceText", {}).get("reason") == "KNOWN_NON_TEXT_LAYER_WITH_NULL_TEXT_GROUP",
                "F12 independently verified raw solid/non-text/null-group condition absent")
        layer_id = str(known(layer.get("id"), "F12 layer ID"))
        provenance = [[decode_cell(field) for field in line.split("\t")] for line in setup_text.splitlines()]
        require(binding is not None or any("FRESH_NONTEXT_READBACK" in fields and "F12" in fields and "layerId=" + layer_id in fields and "textGroup=null" in fields for fields in provenance),
                "F12 fresh non-text setup provenance does not match native layer ID")
        if layer.get("kind") != "SOLID":
            run.setdefault("observations", {})[fixture_id] = "Wrapper derived kind label is " + str(layer.get("kind")) + "; authoritative raw SolidSource=true, TextLayer=false and null text group plus matching setup readback establish the solid condition. This diagnostic label discrepancy is not a product scanner failure."
        layer_row, rows, findings = linked_report(run, layer)
        errors = [] if layer_row.get("sourceText") == "NON_TEXT" and not rows else ["F12 product non-text classification/character rows incorrect"]
    return errors


def evaluate_large(run):
    layers = run["before"]["state"]["activeComposition"]["layers"]
    require(len(layers) == 100, "L01 does not have exactly 100 layers")
    numbers, errors = [], []
    for layer in layers:
        name = known(layer.get("name"), "L01 name")
        match = re.fullmatch(r"\[LARGE\] JP_TEXT_(\d+)", name) or re.fullmatch(r"\[L01/(\d+)\] VERIFIED_FIXTURE_CANDIDATE", name)
        require(match is not None, f"L01 unexpected layer name: {name}")
        number = int(match.group(1)); numbers.append(number)
        chars = static_document(layer, f"日本語 {number}")
        errors.extend(match_characters(run, layer, chars))
    require(sorted(numbers) == list(range(1, 101)), "L01 numbers missing/duplicated")
    metrics = run["report"]["metrics"]
    for field, expected in [("Characters examined", "592"), ("Total layers", "100"), ("Static text layers checked", "100")]:
        if metrics.get(field) != expected:
            errors.append(f"L01 {field}: expected {expected}, got {metrics.get(field)}")
    return errors


def semantic_report(report):
    volatile = {"Generated (host local time)", "Scan elapsed milliseconds"}
    return {"metrics": {key: value for key, value in report["metrics"].items() if key not in volatile},
            **{key: report[key] for key in ["layers", "characters", "findings"]}}


def evaluate(args):
    root = args.evidence_dir
    setup_text = args.setup_log.read_text(encoding="utf-8-sig") if args.setup_log and args.setup_log.is_file() else ""
    binding, binding_error = None, None
    if getattr(args, "fixture_binding", None):
        try:
            binding = read_genuine_binding(args.fixture_binding)
        except (Blocked, OSError, KeyError, TypeError, ValueError) as error:
            binding_error = str(error)
    loaded, load_errors = {}, {}
    for kind in ["fixture", "large"]:
        for number in [1, 2]:
            key = f"{kind}{number}"
            report = getattr(args, f"{kind}_report{number}") or root / f"{'aggregate' if kind == 'fixture' else 'large'}-run{number}.txt"
            try:
                require(binding_error is None, "Genuine binding invalid: " + str(binding_error))
                loaded[key] = read_run(getattr(args, f"{kind}_state{number}"), report)
                if binding:
                    bind_genuine_run(loaded[key], binding, kind)
            except (Blocked, OSError, KeyError, TypeError, ValueError) as error:
                loaded.pop(key, None)
                load_errors[key] = str(error)
    rows, condition_complete = [], True
    for test_id in REQUIRED_IDS[:-1]:
        kind = "large" if test_id == "L01" else "fixture"
        blockers, errors, details, observations = [], [], [], []
        for number in [1, 2]:
            key = f"{kind}{number}"
            if key in load_errors:
                blockers.append(f"run{number}: {load_errors[key]}"); continue
            run = loaded[key]
            try:
                actual_errors = evaluate_large(run) if test_id == "L01" else evaluate_fixture(run, test_id, setup_text)
                errors.extend(f"run{number}: {error}" for error in run["errors"] + actual_errors)
                details.append(f"run{number}: {run['report']['metrics'].get('Scan elapsed milliseconds', 'UNKNOWN')} ms scanner; {run['comparison'].get('scannerWallMsIncludingDialogs', 'UNKNOWN')} ms including dialogs")
                if test_id in run.get("observations", {}):
                    observations.append(f"run{number}: {run['observations'][test_id]}")
            except (Blocked, KeyError, TypeError, ValueError) as error:
                blockers.append(f"run{number}: {error}")
        status = "BLOCKED" if blockers else "FAIL" if errors else "PASS"
        if test_id.startswith("F") and blockers:
            condition_complete = False
        rows.append({"id": test_id, "status": status, "fixture_condition": "BLOCKED" if blockers else "VERIFIED", "blockers": blockers, "mismatches": errors, "timing": details, "observations": observations})
    blockers, errors = [], []
    if not condition_complete:
        blockers.append("All F01–F12 fixture conditions must be independently established in both runs before full R01")
    for key in ["fixture1", "fixture2", "large1", "large2"]:
        if key in load_errors:
            blockers.append(f"{key}: {load_errors[key]}")
    if not blockers:
        for number in [1, 2]:
            metrics = loaded[f"fixture{number}"]["report"]["metrics"]
            for field, expected in [("Total layers", "12"), ("Text layers", "11"), ("Static text layers checked", "9"),
                                    ("Animated text layers NOT CHECKED", "1"), ("Expression text layers NOT CHECKED", "1"),
                                    ("Empty text layers", "1"), ("Non-text layers (not applicable)", "1"),
                                    ("Unreadable/unclassified layers NOT CHECKED", "0"), ("Characters examined", "52")]:
                if metrics.get(field) != expected:
                    errors.append(f"Fixture run{number} {field}: expected {expected}, got {metrics.get(field)}")
        for kind in ["fixture", "large"]:
            first, second = loaded[f"{kind}1"], loaded[f"{kind}2"]
            errors.extend(first["errors"] + second["errors"])
            if semantic_report(first["report"]) != semantic_report(second["report"]):
                errors.append(f"{kind} reports differ beyond generated timestamp/scan duration")
            if first["before"]["state"] != second["before"]["state"]:
                errors.append(f"{kind} sampled fixture state differs between repeated runs")
    rows.append({"id": "R01", "status": "BLOCKED" if blockers else "FAIL" if errors else "PASS", "fixture_condition": "BLOCKED" if blockers else "VERIFIED", "blockers": blockers, "mismatches": errors, "timing": [], "observations": []})
    # Retain reproducible observations even when incomplete fixture conditions
    # correctly block full R01. These fields never promote an acceptance row.
    repeats = {}
    for kind in ["fixture", "large"]:
        if all(f"{kind}{number}" in loaded for number in [1, 2]):
            first, second = loaded[f"{kind}1"], loaded[f"{kind}2"]
            repeats[kind] = {
                "substantive_report_equality": semantic_report(first["report"]) == semantic_report(second["report"]),
                "excluded_volatile_fields": ["Generated (host local time)", "Scan elapsed milliseconds"],
                "before_state_equality_across_runs": first["before"]["state"] == second["before"]["state"],
                "after_state_equality_across_runs": first["after"]["state"] == second["after"]["state"],
                "before_after_state_equality": [run["before"]["state"] == run["after"]["state"] for run in [first, second]],
                "scanner_elapsed_ms": [int(run["report"]["metrics"]["Scan elapsed milliseconds"]) for run in [first, second]],
                "scanner_wall_ms_including_dialogs": [run["comparison"]["scannerWallMsIncludingDialogs"] for run in [first, second]],
                "same_host": first["host"] == second["host"],
                "interpretation": "Observed repeatability only; does not override missing fixture conditions or the separately evaluated full R01 status.",
            }
        else:
            repeats[kind] = {"observations_available": False, "blockers": [load_errors[f"{kind}{number}"] for number in [1, 2] if f"{kind}{number}" in load_errors]}
    all_pass = all(row["status"] == "PASS" for row in rows)
    return {"schema": "JPFP-NATIVE-EVALUATION-1", "gate": "NATIVE_MATRIX_PASS_PENDING_REVIEW" if all_pass else "BLOCKED_NATIVE_VALIDATION", "rows": rows,
            "genuine_binding_sha256": binding["binding_sha256"] if binding else None,
            "repeatability_observations": repeats,
            "evidence": {key: {"state_directory": run["directory"], "report": run["report"]["path"], "report_sha256": run["report"]["sha256"], "host": run["host"]} for key, run in loaded.items()},
            "limitations": ["Offline evidence evaluation; human review of setup provenance, warnings, responsiveness and source hashes remains required.", "Native coverage does not establish rendered fallback or shaping correctness.", "If wrapper project.file is UNKNOWN/UNAVAILABLE, the saved path is unobserved; equality does not prove all unobserved state invariance."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence-dir", type=Path, required=True)
    parser.add_argument("--setup-log", type=Path)
    parser.add_argument("--fixture-binding", type=Path, help="Hash-bound real saved fixture provenance and independent native prerequisite JSON")
    for kind in ["fixture", "large"]:
        for number in [1, 2]:
            parser.add_argument(f"--{kind}-report{number}", type=Path)
            parser.add_argument(f"--{kind}-state{number}", type=Path)
    parser.add_argument("--output-json", type=Path)
    parser.add_argument("--output-tsv", type=Path)
    args = parser.parse_args()
    result = evaluate(args)
    json_path = args.output_json or args.evidence_dir / "evaluation.json"
    tsv_path = args.output_tsv or args.evidence_dir / "evaluation.tsv"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    tsv_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    def cell(value):
        return str(value).replace("\\", "\\\\").replace("\t", "\\t").replace("\r", "\\r").replace("\n", "\\n")
    columns = ["id", "status", "fixture_condition", "blockers", "mismatches", "timing", "observations"]
    lines = ["\t".join(columns)]
    lines.extend("\t".join(cell(row[key]) if key in ["id", "status", "fixture_condition"] else cell("; ".join(row[key])) for key in columns) for row in result["rows"])
    tsv_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(result["gate"])
    for row in result["rows"]:
        print(f"{row['id']} {row['status']}: " + "; ".join(row["blockers"] + row["mismatches"]))
    return 0 if all(row["status"] == "PASS" for row in result["rows"]) else 1


if __name__ == "__main__":
    sys.exit(main())
