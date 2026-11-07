#target aftereffects

/* Read-only diagnostic for the saved/reopened attempt2 disposable fixture.
   Writes a chosen evidence file only. No font inventory, setters, scanner, or viewer.
   Compare one run before reopening with one after reopening the SAME saved copy.
   Known target IDs/names come from fixture-setup-attempt2.txt, not guessed fonts.
*/
(function JPFP_Beta_Read_F02_Reference() {
    var COMP_ID = 1;
    var COMP_NAME = "JPFP_BETA_FIXTURES__DISPOSABLE";
    var LAYER_NAME = "[F02] VERIFIED_FIXTURE_CANDIDATE";
    var MISSING_PS = "JPFP_Session1_MissingFont_PS__DO_NOT_INSTALL";
    var lines = ["JPFP-F02-READONLY-REFERENCE-1"];
    function read(fn) {
        try { var v = fn(); return v === undefined || v === null ? { ok: false, value: "UNKNOWN", detail: "UNAVAILABLE" } : { ok: true, value: v, detail: "OK" }; }
        catch (e) { return { ok: false, value: "UNKNOWN", detail: "FAILED: " + String(e) }; }
    }
    function cell(v) {
        var s = String(v), out = "";
        for (var i = 0; i < s.length; i++) {
            var unit = s.charCodeAt(i), hex;
            if (unit === 92) { out += "\\\\"; }
            else if (unit < 32 || unit > 126) {
                hex = unit.toString(16).toUpperCase(); while (hex.length < 4) { hex = "0" + hex; }
                out += "\\u" + hex;
            } else { out += s.charAt(i); }
        }
        return out;
    }
    function row(values) { var out = []; for (var i = 0; i < values.length; i++) { out.push(cell(values[i])); } lines.push(out.join("\t")); }
    function property(label, fn) { var result = read(fn); row([label, result.value, result.detail]); return result; }
    function fontRow(label, font) {
        row([label, "postScriptName", read(function () { return font.postScriptName; }).value,
            "fontID", read(function () { return font.fontID; }).value, "isSubstitute", read(function () { return font.isSubstitute; }).value]);
    }
    if (!app.project) { alert("No project open; F02 diagnostic NOT_RUN."); return; }
    property("Generated host local", function () { return new Date().toString(); });
    property("AE version", function () { return app.version; });
    property("AE build", function () { return app.buildNumber; });
    property("AE locale", function () { return app.isoLanguage; });
    property("OS", function () { return $.os; });
    property("Project file", function () { return app.project.file ? app.project.file.fsName : "UNSAVED"; });
    var before = property("Project revision before", function () { return app.project.revision; });
    property("Project item count", function () { return app.project.numItems; });
    row(["Target", "compID", COMP_ID, "comp", COMP_NAME, "layer", LAYER_NAME, "requestedMissingPS", MISSING_PS]);

    var missing = read(function () { return app.fonts.missingOrSubstitutedFonts; });
    row(["app.fonts.missingOrSubstitutedFonts read", missing.detail]);
    if (missing.ok) {
        row(["app.fonts.missingOrSubstitutedFonts count", missing.value.length]);
        for (var mi = 0; mi < missing.value.length; mi++) { fontRow("MISSING_OR_SUBSTITUTED_REFERENCE " + mi, missing.value[mi]); }
    }
    var comp = read(function () { return app.project.itemByID(COMP_ID); });
    var established = false;
    if (!comp.ok || !(comp.value instanceof CompItem) || comp.value.name !== COMP_NAME) {
        row(["F02", "NOT_CHECKED", "Exact known composition ID/name unavailable; no fallback project scan"]);
    } else {
        var layer = read(function () { return comp.value.layer(LAYER_NAME); });
        if (!layer.ok) { row(["F02", "NOT_CHECKED", "Exact named layer unavailable", layer.detail]); }
        else {
            property("F02 layer ID", function () { return layer.value.id; });
            property("F02 layer index", function () { return layer.value.index; });
            var source = read(function () { return layer.value.property("ADBE Text Properties").property("ADBE Text Document"); });
            if (!source.ok) { row(["F02", "NOT_CHECKED", "Source Text unavailable", source.detail]); }
            else {
                property("F02 expressionEnabled", function () { return source.value.expressionEnabled; });
                property("F02 numKeys", function () { return source.value.numKeys; });
                var doc = read(function () { return source.value.value; });
                var text = doc.ok ? property("F02 fresh text", function () { return doc.value.text; }) : doc;
                if (doc.ok) { property("F02 fresh TextDocument.font", function () { return doc.value.font; }); }
                if (text.ok && typeof text.value === "string") {
                    established = text.value.length > 0;
                    for (var i = 0; i < text.value.length;) {
                        var units = 1, high = text.value.charCodeAt(i);
                        if (high >= 0xD800 && high <= 0xDBFF && i + 1 < text.value.length) {
                            var low = text.value.charCodeAt(i + 1); if (low >= 0xDC00 && low <= 0xDFFF) { units = 2; }
                        }
                        var end = i + units;
                        var font = read(function () { return doc.value.characterRange(i, end).fontObject; });
                        if (!font.ok) { established = false; row(["F02 CHAR", i, end, text.value.substr(i, units), "fontObject UNKNOWN", font.detail]); }
                        else {
                            var ps = read(function () { return font.value.postScriptName; }), sub = read(function () { return font.value.isSubstitute; });
                            row(["F02 CHAR", i, end, text.value.substr(i, units), "PS", ps.value, "id", read(function () { return font.value.fontID; }).value, "isSubstitute", sub.value]);
                            if (!ps.ok || ps.value !== MISSING_PS || !sub.ok || sub.value !== true) { established = false; }
                        }
                        i = end;
                    }
                    row(["F02 condition", established ? "MISSING_REFERENCE_ESTABLISHED" : "MISSING_REFERENCE_NOT_ESTABLISHED", "Observation only; no scanner test PASS inferred"]);
                } else { row(["F02", "NOT_CHECKED", "Fresh text unavailable or invalid"]); }
            }
        }
    }
    var after = property("Project revision after", function () { return app.project.revision; });
    row(["Project revision unchanged", before.ok && after.ok && typeof before.value === "number" && typeof after.value === "number" ? String(before.value === after.value) : "UNKNOWN"]);
    var out = File.saveDialog("Save F02 read-only reference evidence (before/after reopen)", "Text:*.txt");
    if (!out) { alert("F02 observation completed; export CANCELLED."); return; }
    try {
        out.encoding = "UTF-8"; out.lineFeed = "Windows";
        if (!out.open("w")) { throw new Error("open failed: " + out.error); }
        if (!out.write(lines.join("\n") + "\n")) { throw new Error("write failed: " + out.error); }
        if (!out.close()) { throw new Error("close failed: " + out.error); }
        alert("F02 read-only evidence saved: " + out.fsName + "\nMissing-reference condition: " + (established ? "ESTABLISHED" : "NOT ESTABLISHED") + "\nNo project setters/viewer calls ran.");
    } catch (e) { try { out.close(); } catch (ignored) {} alert("F02 evidence export FAILED: " + String(e)); }
}());
