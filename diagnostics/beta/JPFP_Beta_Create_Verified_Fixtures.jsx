#target aftereffects

/* MUTATING DIAGNOSTIC ONLY. Never call from the read-only product scanner.
   Requires a NEW, EMPTY, UNSAVED disposable project. Does not open any viewer.
   Standard fixtures are committed/read back before F03's range write is tried LAST.
   Stop on any BIB warning, preserve the setup log/project, then follow checkpoints.
   An asynchronous native warning cannot reliably be detected by ExtendScript.
   Documented font string setters are a distinct test path, not a claim that the
   documented read/write fontObject setters are invalid.
   References:
   https://ae-scripting.docsforadobe.dev/text/textdocument/#textdocumentfont
   https://ae-scripting.docsforadobe.dev/text/textdocument/#textdocumentfontobject
   https://ae-scripting.docsforadobe.dev/text/characterrange/#differences-from-textdocument
*/
(function JPFP_Beta_Create_Verified_Fixtures() {
    var TITLE = "JPFP beta disposable fixture builder";
    var MISSING_PS = "JPFP_Session1_MissingFont_PS__DO_NOT_INSTALL";
    var logFile = null;
    var results = [];
    var caseResults = {};
    var fixtureComp = null;
    var stop = false;
    function err(e) { try { return String(e); } catch (ignored) { return "Error detail unavailable"; } }
    function cell(v) {
        var s = String(v === undefined || v === null ? "UNKNOWN" : v).replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var unit = s.charCodeAt(i);
            if (unit >= 0xD800 && unit <= 0xDFFF) {
                var hex = unit.toString(16).toUpperCase();
                while (hex.length < 4) { hex = "0" + hex; }
                out += "\\u" + hex;
            } else { out += s.charAt(i); }
        }
        return out;
    }
    function read(fn) { try { var v = fn(); return v === undefined || v === null ? "UNKNOWN" : v; } catch (e) { return "UNKNOWN(" + err(e) + ")"; } }
    function stamp() { return new Date().toString(); }
    function append(fields) {
        var escaped = [];
        for (var i = 0; i < fields.length; i++) { escaped.push(cell(fields[i])); }
        try {
            if (!logFile.open("a")) { throw new Error("open append failed: " + logFile.error); }
            if (!logFile.write(escaped.join("\t") + "\n")) { throw new Error("write failed: " + logFile.error); }
            if (!logFile.close()) { throw new Error("close failed: " + logFile.error); }
        } catch (e) {
            stop = true;
            try { logFile.close(); } catch (ignored) {}
            throw new Error("FATAL_LOG_FAILURE: " + err(e));
        }
    }
    function mutate(label, fn) {
        if (stop) { throw new Error("STOP_REQUESTED"); }
        append([stamp(), "BEFORE_MUTATION", label]);
        try {
            var v = fn();
            append([stamp(), "AFTER_MUTATION", label]);
            return v;
        } catch (e) {
            if (/BIB|83\s*::\s*3|FATAL_LOG_FAILURE/i.test(err(e))) { stop = true; }
            append([stamp(), "MUTATION_EXCEPTION", label, err(e), "stop=" + stop]);
            throw e;
        }
    }
    function requireCondition(ok, detail) { if (!ok) { throw new Error("SETUP_NOT_VERIFIED: " + detail); } }
    function blocked(detail) { throw new Error("SETUP_BLOCKED: " + detail); }
    function glyph(font, text) {
        try {
            if (typeof font.hasGlyphsFor !== "function") { return "UNKNOWN"; }
            var v = font.hasGlyphsFor(text);
            return typeof v === "boolean" ? v : "UNKNOWN";
        } catch (e) { return "UNKNOWN(" + err(e) + ")"; }
    }
    function point(text, index) {
        var cp = text.charCodeAt(index), units = 1;
        if (cp >= 0xD800 && cp <= 0xDBFF && index + 1 < text.length) {
            var low = text.charCodeAt(index + 1);
            if (low >= 0xDC00 && low <= 0xDFFF) { cp = ((cp - 0xD800) * 0x400) + low - 0xDC00 + 0x10000; units = 2; }
        }
        return { cp: cp, units: units, text: text.substr(index, units) };
    }
    function choose(fonts, duplicates, preferred, predicate, allowOther) {
        var pi, j;
        for (pi = 0; pi < preferred.length; pi++) {
            for (j = 0; j < fonts.length; j++) {
                if (fonts[j].ps === preferred[pi] && duplicates["$" + fonts[j].ps] === 1 && predicate(fonts[j])) { return fonts[j]; }
            }
        }
        if (allowOther) {
            for (j = 0; j < fonts.length; j++) { if (duplicates["$" + fonts[j].ps] === 1 && predicate(fonts[j])) { return fonts[j]; } }
        }
        return null;
    }
    function source(layer) { return layer.property("ADBE Text Properties").property("ADBE Text Document"); }
    function compFor(id) {
        if (id === "L01") { return mutate(id + " addComp", function () { return app.project.items.addComp("JPFP_BETA_L01__DISPOSABLE", 1920, 1080, 1, 4, 30); }); }
        if (!fixtureComp) {
            fixtureComp = mutate("Aggregate F01-F12 addComp", function () { return app.project.items.addComp("JPFP_BETA_FIXTURES__DISPOSABLE", 1920, 2160, 1, 4, 30); });
        }
        return fixtureComp;
    }
    function addText(comp, id, text) {
        var layer = mutate(id + " addText", function () { return comp.layers.addText(text); });
        mutate(id + " layer.name", function () { layer.name = "[" + id + "] VERIFIED_FIXTURE_CANDIDATE"; });
        if (id.charAt(0) === "F") {
            var row = parseInt(id.substr(1), 10);
            mutate(id + " layer position", function () { layer.property("ADBE Transform Group").property("ADBE Position").setValue([450, 100 + (row - 1) * 160]); });
        }
        return layer;
    }
    function applyFont(layer, font, id) {
        if (!font) { blocked("No independently queried candidate font for " + id); }
        var p = source(layer), td = p.value;
        mutate(id + " local TextDocument.font=" + font.ps, function () { td.font = font.ps; });
        append([stamp(), "LOCAL_FONT_READBACK", id, read(function () { return td.font; }), read(function () { return td.fontObject.fontID; })]);
        mutate(id + " Source Text setValue", function () { p.setValue(td); });
    }
    function inspectStatic(layer, id, expectedText, expectedFont, requireCovered) {
        // Every verification reads a NEW Source Text value, never the local edited td.
        var p = source(layer), td = p.value;
        requireCondition(p.expressionEnabled === false && p.numKeys === 0, id + " is not static");
        requireCondition(td.text === expectedText, id + " fresh text mismatch");
        var observations = [], ids = {}, unique = 0;
        for (var i = 0; i < expectedText.length;) {
            var ch = point(expectedText, i), end = i + ch.units;
            var f = td.characterRange(i, end).fontObject;
            requireCondition(!!f, id + " fresh character font unavailable at " + i);
            var fid = f.fontID, ps = f.postScriptName, sub = f.isSubstitute;
            requireCondition(typeof fid === "number" && isFinite(fid) && typeof ps === "string" && typeof sub === "boolean", id + " character font metadata unknown at " + i);
            var covered = glyph(f, ch.text);
            observations.push(i + ":" + end + "/U+" + ch.cp.toString(16).toUpperCase() + "/id=" + fid + "/PS=" + ps + "/sub=" + sub + "/glyph=" + covered);
            if (!ids["$" + fid]) { ids["$" + fid] = true; unique++; }
            if (expectedFont) { requireCondition(fid === expectedFont.id && ps === expectedFont.ps && sub === false, id + " requested font was not retained at " + i + ": " + ps + "#" + fid); }
            if (requireCovered) { requireCondition(covered === true, id + " applied font coverage not true at " + i); }
            i = end;
        }
        append([stamp(), "FRESH_STATIC_READBACK", id, "compId=" + layer.containingComp.id, "layerId=" + layer.id, "text=" + td.text,
            "expressionEnabled=" + p.expressionEnabled, "numKeys=" + p.numKeys, "fontIDs=" + unique, observations.join(" | ")]);
        return { doc: td, property: p, uniqueFonts: unique, observations: observations };
    }
    function runCase(id, expected, fn) {
        if (stop) { return; }
        append([stamp(), "CASE_BEGIN", id, expected]);
        var start = new Date().getTime();
        try {
            var outcome = fn();
            var status = id === "F05" && outcome === "SETUP_OBSERVED_REASSIGNMENT" ? outcome : "SETUP_VERIFIED";
            caseResults[id] = status;
            results.push(id + " " + status);
            append([stamp(), "CASE_RESULT", id, status, "elapsed_ms=" + (new Date().getTime() - start), "Not a scanner/native acceptance PASS"]);
        } catch (e) {
            if (/BIB|83\s*::\s*3|FATAL_LOG_FAILURE/i.test(err(e))) { stop = true; }
            var status = /SETUP_BLOCKED/.test(err(e)) ? "SETUP_BLOCKED" : "SETUP_FAILED";
            caseResults[id] = status;
            results.push(id + " " + status);
            append([stamp(), "CASE_RESULT", id, status, "elapsed_ms=" + (new Date().getTime() - start), err(e), "stop=" + stop]);
        }
    }

    if (!app.project || app.project.numItems !== 0 || app.project.file !== null || app.project.renderQueue.numItems !== 0) {
        alert(TITLE + "\n\nSTOP: open a NEW, EMPTY, UNSAVED disposable project. Existing projects are not modified."); return;
    }
    logFile = File.saveDialog("Save durable MUTATING fixture setup log before creation", "Text:*.txt");
    if (!logFile) { return; }
    logFile.encoding = "UTF-8"; logFile.lineFeed = "Windows";
    try {
        if (!logFile.open("w")) { throw new Error("Cannot open setup log: " + logFile.error); }
        if (!logFile.write("JPFP-BETA-FIXTURE-SETUP-1\n")) { throw new Error("Cannot write setup log: " + logFile.error); }
        if (!logFile.close()) { throw new Error("Cannot close setup log: " + logFile.error); }
        append([stamp(), "HOST", "AE=" + app.version, "build=" + app.buildNumber, "buildName=" + app.buildName, "locale=" + app.isoLanguage, "OS=" + $.os]);
        append([stamp(), "BEFORE_STATE", "project.file=null", "numItems=" + app.project.numItems, "revision=" + app.project.revision, "activeItem=" + read(function () { return app.project.activeItem; })]);
        append([stamp(), "POLICY", "No scanner invocation; no openInViewer; .font strings only; F03 range mutation LAST. If any native BIB UI appears STOP and preserve log/project."]);

        var fonts = [], duplicates = {}, rawCount = 0;
        var groups = app.fonts.allFonts;
        for (var gi = 0; gi < groups.length; gi++) {
            for (var fi = 0; fi < groups[gi].length; fi++) {
                rawCount++;
                try {
                    var f = groups[gi][fi], ps = f.postScriptName, fid = f.fontID;
                    if (typeof ps !== "string" || !ps.length || typeof fid !== "number" || !isFinite(fid) || f.isSubstitute !== false) { continue; }
                    fonts.push({ object: f, ps: ps, id: fid });
                    duplicates["$" + ps] = (duplicates["$" + ps] || 0) + 1;
                } catch (fontError) {}
            }
        }
        var goodText = "日本語の字幕です。ABC 123", punctText = "「日本語」—ABC・123！？";
        var jpPreferred = ["MS-Gothic", "Meiryo", "YuGothic-Regular", "MS-Mincho"];
        var latinPreferred = ["ArialMT", "TimesNewRomanPSMT", "Calibri", "Verdana", "Arial-BoldMT"];
        var jp = choose(fonts, duplicates, jpPreferred, function (x) { return glyph(x.object, goodText + punctText) === true; }, true);
        var latin = choose(fonts, duplicates, latinPreferred, function (x) { return !!jp && x.id !== jp.id && glyph(x.object, "ABC") === true; }, false);
        var gap = choose(fonts, duplicates, latinPreferred, function (x) { return glyph(x.object, "ABC") === true && glyph(x.object, "漢") === false; }, false);
        append([stamp(), "CANDIDATES", "enumerated=" + rawCount, "eligible=" + fonts.length,
            "JP=" + (jp ? jp.ps + "#" + jp.id : "NONE"), "Latin=" + (latin ? latin.ps + "#" + latin.id : "NONE"), "Gap=" + (gap ? gap.ps + "#" + gap.id : "NONE")]);
        if (gap) { append([stamp(), "GAP_CANDIDATE_API", gap.ps, "ABC=" + glyph(gap.object, "ABC"), "漢=" + glyph(gap.object, "漢")]); }

        runCase("F01", "Static JP; direct applied-font coverage true for every character; no substitute", function () {
            if (!jp) { blocked("No non-substitute unique-PS font reports full F01/F04 coverage"); }
            var c = compFor("F01"), l = addText(c, "F01", goodText); applyFont(l, jp, "F01"); inspectStatic(l, "F01", goodText, jp, true);
        });
        runCase("F02", "Deliberately missing PS; fresh per-character isSubstitute true", function () {
            requireCondition(typeof app.fonts.getFontsByPostScriptName === "function", "Missing-font lookup API unavailable");
            var existing = app.fonts.getFontsByPostScriptName(MISSING_PS);
            requireCondition(existing.length === 0, "Deliberate missing PS unexpectedly exists before setup");
            append([stamp(), "MISSING_REFERENCE_PRECONDITION", MISSING_PS, "matching_fonts=0"]);
            var c = compFor("F02"), l = addText(c, "F02", "欠落フォント"), p = source(l), td = p.value;
            mutate("F02 local TextDocument.font missing PS", function () { td.font = MISSING_PS; });
            mutate("F02 Source Text setValue", function () { p.setValue(td); });
            var observed = inspectStatic(l, "F02", "欠落フォント", null, false), fresh = observed.doc;
            for (var i = 0; i < fresh.text.length; i++) {
                var f = fresh.characterRange(i, i + 1).fontObject;
                append([stamp(), "FRESH_MISSING_REFERENCE_READBACK", "F02", "start=" + i, "end=" + (i + 1), "requestedPS=" + MISSING_PS,
                    "actualPS=" + f.postScriptName, "fontID=" + f.fontID, "isSubstitute=" + f.isSubstitute, "freshDocument.font=" + fresh.font]);
                requireCondition(f.isSubstitute === true && f.postScriptName === MISSING_PS, "Missing-reference substitute not exposed at " + i);
            }
        });
        runCase("F04", "Static JP/Latin punctuation; full direct applied-font coverage", function () {
            if (!jp) { blocked("No verified JP candidate"); }
            var c = compFor("F04"), l = addText(c, "F04", punctText); applyFont(l, jp, "F04"); inspectStatic(l, "F04", punctText, jp, true);
        });
        runCase("F05", "A漢B; API-false candidate retained or verified fresh middle-character reassignment observed", function () {
            if (!gap) { blocked("No preferred non-substitute font reports ABC=true and 漢=false"); }
            requireCondition(glyph(gap.object, "ABC") === true && glyph(gap.object, "漢") === false, "Candidate ABC=true/漢=false condition changed");
            var c = compFor("F05"), l = addText(c, "F05", "A漢B"); applyFont(l, gap, "F05");
            var observed = inspectStatic(l, "F05", "A漢B", null, false), mid = observed.doc.characterRange(1, 2).fontObject;
            var left = observed.doc.characterRange(0, 1).fontObject, right = observed.doc.characterRange(2, 3).fontObject;
            var retainedSides = left.fontID === gap.id && left.postScriptName === gap.ps && left.isSubstitute === false &&
                right.fontID === gap.id && right.postScriptName === gap.ps && right.isSubstitute === false;
            var actualMiddleGlyph = glyph(mid, "漢");
            append([stamp(), "FRESH_GAP_EXPERIMENT", "F05", "candidate=" + gap.ps + "#" + gap.id, "candidateABC=true", "candidate漢=false",
                "A=" + left.postScriptName + "#" + left.fontID, "漢=" + mid.postScriptName + "#" + mid.fontID,
                "B=" + right.postScriptName + "#" + right.fontID, "middleGlyph=" + actualMiddleGlyph, "sideCandidateRetained=" + retainedSides]);
            if (retainedSides && mid.fontID !== gap.id && mid.isSubstitute === false && actualMiddleGlyph === true) {
                append([stamp(), "OBSERVED_REASSIGNMENT", "F05", "Fresh applied FontObject changed for middle character; rendered fallback identity/shaping not established"]);
                return "SETUP_OBSERVED_REASSIGNMENT";
            }
            if (!retainedSides || mid.fontID !== gap.id || mid.postScriptName !== gap.ps || actualMiddleGlyph !== false) {
                blocked("Fresh middle character did not retain verified gap candidate; actual=" + mid.postScriptName + "#" + mid.fontID + ", 漢=" + glyph(mid, "漢"));
            }
            requireCondition(mid.isSubstitute === false, "Gap fixture became substitute instead of applied-font gap");
        });
        runCase("F06", "Fresh static Source Text empty; no invented character coverage", function () {
            var c = compFor("F06"), l = addText(c, "F06", "EMPTY_PLACEHOLDER"), p = source(l), td = p.value;
            mutate("F06 local TextDocument.text empty", function () { td.text = ""; });
            mutate("F06 Source Text setValue empty", function () { p.setValue(td); });
            inspectStatic(l, "F06", "", null, false);
        });
        var unicodeCases = [["F07", "\uD840\uDC0B"], ["F08", "は\u3099"], ["F09", "葛\uDB40\uDD00"]];
        for (var ui = 0; ui < unicodeCases.length; ui++) {
            (function (id, text) {
                runCase(id, "Exact static Unicode sequence; fresh font observations; shaping/fallback unproven", function () {
                    if (!jp) { blocked("No verified JP candidate"); }
                    var c = compFor(id), l = addText(c, id, text); applyFont(l, jp, id); inspectStatic(l, id, text, null, false);
                });
            }(unicodeCases[ui][0], unicodeCases[ui][1]));
        }
        runCase("F10", "Fresh Source Text has exactly two keys: 静的 at0, 動的 at1", function () {
            if (!jp) { blocked("No verified JP candidate"); }
            var c = compFor("F10"), l = addText(c, "F10", "静的"); applyFont(l, jp, "F10");
            var p = source(l), first = p.value;
            mutate("F10 setValueAtTime 0", function () { p.setValueAtTime(0, first); });
            var second = p.value;
            mutate("F10 local text dynamic", function () { second.text = "動的"; });
            mutate("F10 local font string", function () { second.font = jp.ps; });
            mutate("F10 setValueAtTime 1", function () { p.setValueAtTime(1, second); });
            var fresh = source(l);
            append([stamp(), "FRESH_ANIMATION_READBACK", "F10", "numKeys=" + fresh.numKeys, "expressionEnabled=" + fresh.expressionEnabled,
                "key1=" + fresh.keyTime(1) + ":" + fresh.keyValue(1).text, "key2=" + fresh.keyTime(2) + ":" + fresh.keyValue(2).text]);
            requireCondition(fresh.numKeys === 2 && fresh.expressionEnabled === false && fresh.keyTime(1) === 0 && fresh.keyTime(2) === 1 && fresh.keyValue(1).text === "静的" && fresh.keyValue(2).text === "動的", "Animated fixture condition not established");
        });
        runCase("F11", "Fresh Source Text expression enabled and returns 式で生成", function () {
            if (!jp) { blocked("No verified JP candidate"); }
            var c = compFor("F11"), l = addText(c, "F11", "式"); applyFont(l, jp, "F11");
            var p = source(l);
            mutate("F11 expression assignment", function () { p.expression = '"式で生成"'; });
            mutate("F11 expressionEnabled", function () { p.expressionEnabled = true; });
            var fresh = source(l), output = fresh.value.text;
            append([stamp(), "FRESH_EXPRESSION_READBACK", "F11", "expressionEnabled=" + fresh.expressionEnabled, "numKeys=" + fresh.numKeys, "expressionError=" + fresh.expressionError, "text=" + output]);
            requireCondition(fresh.expressionEnabled === true && fresh.numKeys === 0 && fresh.expressionError === "" && output === "式で生成", "Expression fixture condition not established");
        });
        runCase("F12", "One native non-text solid; null text property group", function () {
            var c = compFor("F12"), l = mutate("F12 addSolid", function () { return c.layers.addSolid([0.3, 0.3, 0.3], "[F12] NON_TEXT_LAYER", 200, 80, 1); });
            mutate("F12 layer position", function () { l.property("ADBE Transform Group").property("ADBE Position").setValue([450, 1860]); });
            requireCondition(!(l instanceof TextLayer) && l.property("ADBE Text Properties") === null, "Non-text fixture condition not established");
            append([stamp(), "FRESH_NONTEXT_READBACK", "F12", "compId=" + c.id, "layerId=" + l.id, "numLayers=" + c.numLayers, "textGroup=null"]);
        });
        runCase("L01", "100 independently verified static JP text layers; timing belongs to separate scanner run", function () {
            if (!jp) { blocked("No verified JP candidate"); }
            var c = compFor("L01");
            for (var n = 0; n < 100; n++) {
                var id = "L01/" + (n + 1), text = "日本語 " + (n + 1), l = addText(c, id, text);
                applyFont(l, jp, id); inspectStatic(l, id, text, jp, true);
            }
            requireCondition(c.numLayers === 100, "Large fixture does not have exactly100 layers");
            append([stamp(), "FRESH_LARGE_READBACK", "L01", "compId=" + c.id, "numLayers=" + c.numLayers]);
        });

        // Keep this historically risky range mutation LAST, after standard fixtures.
        runCase("F03", "日本語 ABC with two retained non-substitute fontIDs; intentional mixed review only", function () {
            if (!jp || !latin || jp.id === latin.id) { blocked("Two distinct conventional fonts with verified coverage unavailable"); }
            var c = compFor("F03"), l = addText(c, "F03", "日本語 ABC"); applyFont(l, jp, "F03 baseline");
            inspectStatic(l, "F03 baseline", "日本語 ABC", jp, true);
            var p = source(l), td = p.value;
            mutate("F03 local CharacterRange[4,7).font=" + latin.ps, function () { td.characterRange(4, 7).font = latin.ps; });
            append([stamp(), "LOCAL_MIXED_READBACK", "F03", "0:4=" + read(function () { return td.characterRange(0, 4).font; }), "4:7=" + read(function () { return td.characterRange(4, 7).font; })]);
            mutate("F03 Source Text setValue mixed", function () { p.setValue(td); });
            var observed = inspectStatic(l, "F03", "日本語 ABC", null, true), fresh = observed.doc;
            for (var i = 0; i < fresh.text.length; i++) {
                var f = fresh.characterRange(i, i + 1).fontObject, expected = i < 4 ? jp : latin;
                requireCondition(f.fontID === expected.id && f.postScriptName === expected.ps && f.isSubstitute === false, "Mixed font not retained at " + i);
            }
            requireCondition(observed.uniqueFonts === 2, "Mixed fixture does not retain exactly2 fontIDs");
        });
        var complete = !!fixtureComp && fixtureComp.numLayers === 12;
        for (var ci = 1; ci <= 12; ci++) {
            var caseId = "F" + (ci < 10 ? "0" : "") + ci;
            if (caseResults[caseId] !== "SETUP_VERIFIED" && !(caseId === "F05" && caseResults[caseId] === "SETUP_OBSERVED_REASSIGNMENT")) { complete = false; }
        }
        append([stamp(), "AGGREGATE_SETUP", complete ? "SETUP_COMPLETE" : "SETUP_INCOMPLETE", "composition=" + (fixtureComp ? fixtureComp.name : "NONE"),
            "compId=" + (fixtureComp ? fixtureComp.id : "UNKNOWN"), "numLayers=" + (fixtureComp ? fixtureComp.numLayers : "UNKNOWN"),
            "COMPLETE requires exactly12 layers and all F01-F12 verified, allowing F05 SETUP_OBSERVED_REASSIGNMENT; setup status is not native acceptance PASS"]);
        append([stamp(), "R01_SETUP", "Scan aggregate JPFP_BETA_FIXTURES__DISPOSABLE twice without edits in separate scanner executions; no repeated scan ran in this builder"]);
        append([stamp(), "AFTER_STATE", "numItems=" + app.project.numItems, "revision=" + app.project.revision, "activeItem=" + read(function () { return app.project.activeItem; }), "openInViewer_requested=NO", "stop=" + stop]);
        append([stamp(), "SETUP_SUMMARY", results.join("; "), "Scanner/native acceptance has NOT RUN"]);
        alert(TITLE + "\n\n" + results.join("\n") + "\n\nLog: " + logFile.fsName + "\nNo composition was opened and no production scan ran.\nIf a BIB warning appeared, stop and preserve this disposable project/log before recovery.");
    } catch (fatal) {
        alert(TITLE + "\n\nSTOP: " + err(fatal) + "\nPreserve the disposable project and log. No scanner run is authorized by fixture setup status.");
    }
}());
