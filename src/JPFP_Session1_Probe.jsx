#target aftereffects

/*
JP Font and Glyph Preflight — static-text beta.
READ-ONLY with respect to the AE project; active composition only.
Applied-font coverage never proves rendered fallback or shaping correctness.
Animated/expression Source Text is outside scope. No base-font guesses are used.
*/
(function JPFP_Session1_Probe() {
    var TOOL = "JP Font and Glyph Preflight — Static-text Beta";
    var SCHEMA = "JPFP-BETA-REPORT-2";
    var UNKNOWN = "UNKNOWN";

    function pad2(n) { return n < 10 ? "0" + n : String(n); }
    function nowStamp() {
        var d = new Date();
        return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
            "T" + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    }
    function errorText(e) { try { return String(e); } catch (ignored) { return "Error detail unavailable"; } }
    function read(fn) {
        try {
            var value = fn();
            if (value === undefined || value === null) { return { state: "UNAVAILABLE", value: null, detail: "Property/API unavailable" }; }
            return { state: "OK", value: value, detail: "" };
        } catch (e) { return { state: "FAILED", value: null, detail: errorText(e) }; }
    }
    function typed(result, type) {
        if (result.state === "OK" && typeof result.value !== type) { return { state: "FAILED", value: null, detail: "Invalid type; expected " + type }; }
        return result;
    }
    function readRevision(project) {
        var result = typed(read(function () { return project.revision; }), "number");
        if (result.state === "OK" && (!isFinite(result.value) || result.value < 0 || Math.floor(result.value) !== result.value)) {
            return { state: "FAILED", value: null, detail: "Invalid project revision" };
        }
        return result;
    }
    function valueOrUnknown(result) { return result.state === "OK" ? result.value : UNKNOWN; }
    function readDescription(result) { return result.state + (result.detail ? ": " + result.detail : ""); }
    function hex4(n) {
        var s = Number(n).toString(16).toUpperCase();
        while (s.length < 4) { s = "0" + s; }
        return s;
    }
    function cleanCell(value) {
        var s = value === undefined || value === null ? UNKNOWN : String(value);
        // Escape backslashes first: a literal backslash-n must differ from a newline.
        s = s.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            if (c < 32 || (c >= 127 && c <= 159) || c === 0x2028 || c === 0x2029) { out += "\\u" + hex4(c); }
            // AE's file encoder can reject even valid surrogate pairs. Preserve
            // their UTF-16 units as ASCII escapes; API queries use original text.
            else if (c >= 0xD800 && c <= 0xDFFF) { out += "\\u" + hex4(c); }
            else { out += s.charAt(i); }
        }
        return out;
    }
    function cells(row) {
        var escaped = [];
        for (var i = 0; i < row.length; i++) { escaped.push(cleanCell(row[i])); }
        return escaped.join("\t");
    }
    function codePointInfo(str, index) {
        var first = str.charCodeAt(index);
        var info = { text: str.charAt(index), units: 1, codePoint: first, label: "U+" + hex4(first), supplementary: false, malformed: false };
        if (first >= 0xD800 && first <= 0xDBFF) {
            var second = index + 1 < str.length ? str.charCodeAt(index + 1) : 0;
            if (second >= 0xDC00 && second <= 0xDFFF) {
                var cp = ((first - 0xD800) * 0x400) + (second - 0xDC00) + 0x10000;
                info.text = str.substr(index, 2); info.units = 2; info.codePoint = cp;
                info.label = "U+" + cp.toString(16).toUpperCase(); info.supplementary = true;
            } else { info.malformed = true; }
        } else if (first >= 0xDC00 && first <= 0xDFFF) { info.malformed = true; }
        return info;
    }
    function isCombiningCodePoint(cp) {
        return (cp >= 0x0300 && cp <= 0x036F) || (cp >= 0x1AB0 && cp <= 0x1AFF) ||
            (cp >= 0x1DC0 && cp <= 0x1DFF) || (cp >= 0x20D0 && cp <= 0x20FF) ||
            (cp >= 0xFE20 && cp <= 0xFE2F) || cp === 0x3099 || cp === 0x309A;
    }
    function isVariationSelector(cp) { return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF); }
    function isNonGlyphCodePoint(cp) {
        return cp < 32 || (cp >= 127 && cp <= 159) || isVariationSelector(cp) ||
            (cp >= 0x200B && cp <= 0x200F) || (cp >= 0x2028 && cp <= 0x202E) ||
            (cp >= 0x2060 && cp <= 0x206F) || cp === 0xFEFF;
    }
    function inspectFont(font) {
        var id = read(function () { return font.fontID; });
        var ps = typed(read(function () { return font.postScriptName; }), "string");
        var sub = typed(read(function () { return font.isSubstitute; }), "boolean");
        var family = typed(read(function () { return font.familyName; }), "string");
        var style = typed(read(function () { return font.styleName; }), "string");
        var location = typed(read(function () { return font.location; }), "string");
        var validId = id.state === "OK" && ((typeof id.value === "number" && isFinite(id.value)) || (typeof id.value === "string" && id.value.length > 0));
        var validPS = ps.state === "OK" && ps.value.length > 0;
        if (!validId && id.state === "OK") { id = { state: "FAILED", value: null, detail: "Invalid fontID" }; }
        if (!validPS && ps.state === "OK") { ps = { state: "FAILED", value: null, detail: "Empty PostScript name" }; }
        var key = validId ? "ID:" + id.value : (validPS ? "PS:" + ps.value : null);
        var summary = "PS=" + (validPS ? ps.value : UNKNOWN) + "; family=" + valueOrUnknown(family) +
            "; style=" + valueOrUnknown(style) + "; id=" + (validId ? id.value : UNKNOWN) +
            "; substitute=" + (sub.state === "OK" ? String(sub.value) : UNKNOWN) + "; location=" + valueOrUnknown(location);
        var unknown = [];
        if (!validId) { unknown.push("fontID " + readDescription(id)); }
        if (!validPS) { unknown.push("postScriptName " + readDescription(ps)); }
        if (family.state !== "OK") { unknown.push("familyName " + readDescription(family)); }
        if (style.state !== "OK") { unknown.push("styleName " + readDescription(style)); }
        if (location.state !== "OK") { unknown.push("location " + readDescription(location)); }
        return { key: key, uniqueId: validId, summary: summary, substitute: sub, unknown: unknown };
    }
    function writeReport(lines) {
        var out = null;
        var opened = false;
        var failure = "";
        try {
            out = File.saveDialog("Export JP Font/Glyph Preflight beta report", "Text:*.txt");
            if (!out) { return { status: "CANCELLED", detail: "User cancelled export; no report was saved." }; }
            if (!/\.txt$/i.test(out.name)) { out = new File(out.fsName + ".txt"); }
            out.encoding = "UTF-8"; out.lineFeed = "Windows";
            if (out.open("w") !== true) { return { status: "FAILED", detail: "Could not open output file: " + (out.error || "unknown file error") }; }
            opened = true;
            if (out.write(lines.join("\n")) !== true) { failure = "Report write failed: " + (out.error || "write returned false"); }
            var closeOK = out.close();
            opened = false;
            if (closeOK !== true) { failure += (failure ? "; " : "") + "Report close failed: " + (out.error || "close returned false"); }
            if (failure) { return { status: "FAILED", detail: failure + ". The selected file may be incomplete." }; }
            return { status: "OK", detail: out.fsName };
        } catch (e) {
            failure += (failure ? "; " : "") + errorText(e);
            if (out && opened) {
                try { if (out.close() !== true) { failure += "; cleanup close failed"; } }
                catch (closeErr) { failure += "; cleanup close failed: " + errorText(closeErr); }
            }
            return { status: "FAILED", detail: failure + ". The selected file may be incomplete." };
        }
    }

    var projectRead = read(function () { return app.project; });
    if (projectRead.state !== "OK") { alert(TOOL + "\n\nNo readable project is open. / プロジェクトを開いてください。"); return; }
    var project = projectRead.value;
    var compRead = read(function () { return project.activeItem; });
    if (compRead.state !== "OK" || !(compRead.value instanceof CompItem)) { alert(TOOL + "\n\nOpen/select a composition first. / コンポジションを開いて選択してください。"); return; }
    var comp = compRead.value;
    var compName = valueOrUnknown(typed(read(function () { return comp.name; }), "string"));
    var compId = valueOrUnknown(read(function () { return comp.id; }));
    var revisionBefore = readRevision(project);
    var startMs = new Date().getTime();
    var findings = [], characterRows = [], layerRows = [];
    var counters = {
        totalLayers: UNKNOWN, textLayers: 0, staticTextLayers: 0, animatedTextLayers: 0,
        expressionTextLayers: 0, unknownTextLayers: 0, emptyTextLayers: 0, nonTextLayers: 0,
        charactersExamined: 0, charactersCoverageVerified: 0, charactersCoveragePresent: 0,
        charactersCoverageAbsent: 0, charactersCoverageSkipped: 0, charactersCoverageFailed: 0,
        mixedFontLayers: 0, mixedFontUnknownLayers: 0, problemFindings: 0, reviewFindings: 0, notCheckedFindings: 0
    };
    var hasCharacterRange = false, hasGlyphApi = false;
    function finding(severity, code, ctx, start, end, ch, font, detail) {
        findings.push([severity, code, compId, compName, ctx ? ctx.id : "", ctx ? ctx.index : "", ctx ? ctx.name : "",
            start, end, ch ? ch.label : "", ch ? ch.text : "", font || "", detail]);
    }
    function layerRow(ctx, state, mixed, detail) { layerRows.push(["LAYER", compId, compName, ctx.id, ctx.index, ctx.name, state, mixed, detail]); }
    var layerCountRead = typed(read(function () { return comp.numLayers; }), "number");
    if (layerCountRead.state === "OK" && (!isFinite(layerCountRead.value) || layerCountRead.value < 0 || Math.floor(layerCountRead.value) !== layerCountRead.value)) {
        layerCountRead = { state: "FAILED", value: null, detail: "Invalid composition layer count" };
    }
    if (layerCountRead.state !== "OK") { finding("NOT_CHECKED", "COMPOSITION_LAYERS_UNKNOWN", null, "", "", null, null, readDescription(layerCountRead)); }
    else { counters.totalLayers = layerCountRead.value; }

    for (var li = 1; layerCountRead.state === "OK" && li <= layerCountRead.value; li++) {
        var layerRead = read(function () { return comp.layer(li); });
        var ctx = { id: UNKNOWN, index: li, name: UNKNOWN };
        if (layerRead.state !== "OK") {
            counters.unknownTextLayers++;
            finding("NOT_CHECKED", "LAYER_READ_FAILED", ctx, "", "", null, null, readDescription(layerRead));
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Layer inaccessible"); continue;
        }
        var layer = layerRead.value;
        ctx.id = valueOrUnknown(read(function () { return layer.id; }));
        ctx.name = valueOrUnknown(typed(read(function () { return layer.name; }), "string"));
        var noTextGroup = false;
        var propsRead = read(function () {
            var group = layer.property("ADBE Text Properties");
            noTextGroup = group === null;
            return group;
        });
        var knownTextLayer = typeof TextLayer !== "undefined" && layer instanceof TextLayer;
        if (propsRead.state === "UNAVAILABLE" && noTextGroup && !knownTextLayer) {
            counters.nonTextLayers++;
            layerRow(ctx, "NON_TEXT", "NOT_APPLICABLE", "No text property group (non-text layer)");
            continue;
        }
        var sourceRead = propsRead.state === "OK" ? read(function () { return propsRead.value.property("ADBE Text Document"); }) : propsRead;
        if (sourceRead.state !== "OK") {
            counters.unknownTextLayers++;
            finding("NOT_CHECKED", sourceRead.state === "FAILED" ? "SOURCE_TEXT_PROPERTY_READ_FAILED" : "SOURCE_TEXT_PROPERTY_UNKNOWN", ctx, "", "", null, null, readDescription(sourceRead));
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Source Text property inaccessible"); continue;
        }
        counters.textLayers++;
        var sourceText = sourceRead.value;
        var exprRead = typed(read(function () { return sourceText.expressionEnabled; }), "boolean");
        if (exprRead.state !== "OK") {
            counters.unknownTextLayers++;
            finding("NOT_CHECKED", "SOURCE_TEXT_CLASSIFICATION_UNKNOWN", ctx, "", "", null, null, "expressionEnabled " + readDescription(exprRead));
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Expression classification UNKNOWN"); continue;
        }
        if (exprRead.value === true) {
            counters.expressionTextLayers++;
            finding("NOT_CHECKED", "SOURCE_TEXT_EXPRESSION", ctx, "", "", null, null, "Source Text expression is enabled; all expression states are outside beta scope.");
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Expression Source Text"); continue;
        }
        var keysRead = typed(read(function () { return sourceText.numKeys; }), "number");
        if (keysRead.state === "OK" && (!isFinite(keysRead.value) || keysRead.value < 0 || Math.floor(keysRead.value) !== keysRead.value)) {
            keysRead = { state: "FAILED", value: null, detail: "Invalid Source Text keyframe count" };
        }
        if (keysRead.state !== "OK") {
            counters.unknownTextLayers++;
            finding("NOT_CHECKED", "SOURCE_TEXT_CLASSIFICATION_UNKNOWN", ctx, "", "", null, null, "numKeys " + readDescription(keysRead));
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Animation classification UNKNOWN"); continue;
        }
        if (keysRead.value > 0) {
            counters.animatedTextLayers++;
            finding("NOT_CHECKED", "SOURCE_TEXT_ANIMATED", ctx, "", "", null, null, "Source Text has keyframes; animated states are outside beta scope.");
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Animated Source Text"); continue;
        }
        var docRead = read(function () { return sourceText.value; });
        var textRead = docRead.state === "OK" ? typed(read(function () { return docRead.value.text; }), "string") : docRead;
        if (textRead.state !== "OK") {
            counters.unknownTextLayers++;
            finding("NOT_CHECKED", docRead.state === "OK" ? "TEXT_READ_FAILED" : "TEXTDOCUMENT_READ_FAILED", ctx, "", "", null, null, readDescription(textRead));
            layerRow(ctx, "NOT_CHECKED", UNKNOWN, "Text unreadable"); continue;
        }
        counters.staticTextLayers++;
        var doc = docRead.value, text = textRead.value;
        if (text.length === 0) {
            counters.emptyTextLayers++;
            finding("NOT_CHECKED", "EMPTY_TEXT", ctx, "", "", null, null, "Empty static Source Text: no character font or glyph query applicable; mixed fonts NOT_CHECKED.");
            layerRow(ctx, "EMPTY_TEXT", "NOT_CHECKED", "No character coverage applicable"); continue;
        }
        var rangeApi = typed(read(function () { return doc.characterRange; }), "function");
        if (rangeApi.state === "OK") { hasCharacterRange = true; }
        var fontKeys = {}, fontCount = 0, fontUnknowns = 0, uniqueFontIdsOnly = true;
        for (var i = 0; i < text.length;) {
            var ch = codePointInfo(text, i), end = i + ch.units;
            var coverage = "NOT_CHECKED", identity = UNKNOWN, substitute = UNKNOWN;
            var summary = "fontObject=" + UNKNOWN, detail = "", charFont = null, fontInfo = null;
            counters.charactersExamined++;
            if (ch.malformed) {
                finding("REVIEW_NEEDED", "MALFORMED_UTF16", ctx, i, end, ch, null, "Unpaired UTF-16 surrogate; glyph coverage NOT_CHECKED and range API not queried.");
                detail = "Malformed UTF-16; coverage NOT_CHECKED";
            } else {
                if (ch.supplementary || isCombiningCodePoint(ch.codePoint) || isVariationSelector(ch.codePoint) || ch.codePoint === 0x200C || ch.codePoint === 0x200D) {
                    finding("REVIEW_NEEDED", "UNICODE_SEQUENCE_EDGE_CASE", ctx, i, end, ch, null, "Supplementary/combining/selector/joiner text requires native visual review; code-point coverage does not establish shaping correctness.");
                }
                if (rangeApi.state !== "OK") {
                    detail = "characterRange " + readDescription(rangeApi);
                    finding("NOT_CHECKED", rangeApi.state === "FAILED" ? "CHARACTER_RANGE_API_READ_FAILED" : "CHARACTER_RANGE_API_UNAVAILABLE", ctx, i, end, ch, null, detail);
                } else {
                    var rangeRead = read(function () { return doc.characterRange(i, end); });
                    if (rangeRead.state !== "OK") {
                        detail = "characterRange " + readDescription(rangeRead);
                        finding("NOT_CHECKED", "CHARACTER_RANGE_FAILED", ctx, i, end, ch, null, detail);
                    } else {
                        var charFontRead = read(function () { return rangeRead.value.fontObject; });
                        if (charFontRead.state !== "OK") {
                            detail = "CharacterRange.fontObject " + readDescription(charFontRead);
                            finding("NOT_CHECKED", charFontRead.state === "FAILED" ? "CHARACTER_FONT_READ_FAILED" : "CHARACTER_FONT_UNAVAILABLE", ctx, i, end, ch, null, detail);
                        } else {
                            charFont = charFontRead.value; fontInfo = inspectFont(charFont); summary = fontInfo.summary;
                            if (fontInfo.key !== null) { identity = "VERIFIED"; }
                            else {
                                detail = "Applied FontObject identifier UNKNOWN; no glyph query performed";
                                finding("NOT_CHECKED", "FONT_IDENTITY_UNKNOWN", ctx, i, end, ch, null, detail);
                            }
                            if (fontInfo.unknown.length > 0) { finding("NOT_CHECKED", "FONT_METADATA_UNKNOWN", ctx, i, end, ch, summary, fontInfo.unknown.join("; ")); }
                            substitute = fontInfo.substitute.state === "OK" ? (fontInfo.substitute.value ? "TRUE" : "FALSE") : UNKNOWN;
                            if (substitute === "TRUE") { finding("PROBLEM_FOUND", "SUBSTITUTE_FONT_REFERENCE", ctx, i, end, ch, summary, "AE reports a substitute font reference; this does not identify the rendered fallback font."); }
                            else if (substitute === UNKNOWN) { finding("NOT_CHECKED", "SUBSTITUTE_STATUS_UNKNOWN", ctx, i, end, ch, summary, "isSubstitute " + readDescription(fontInfo.substitute)); }
                        }
                    }
                }
                if (identity === "VERIFIED") {
                    if (isNonGlyphCodePoint(ch.codePoint)) {
                        detail = "Control, formatting, joiner, or variation-selector code point: standalone glyph coverage NOT_CHECKED";
                        finding("NOT_CHECKED", "NON_GLYPH_CODEPOINT", ctx, i, end, ch, summary, detail);
                    } else {
                        var glyphApi = typed(read(function () { return charFont.hasGlyphsFor; }), "function");
                        if (glyphApi.state === "OK") {
                            hasGlyphApi = true;
                            var glyphRead = typed(read(function () { return charFont.hasGlyphsFor(ch.text); }), "boolean");
                            if (glyphRead.state === "OK") {
                                coverage = glyphRead.value ? "VERIFIED_PRESENT" : "VERIFIED_ABSENT";
                                if (!glyphRead.value) { finding("PROBLEM_FOUND", "FONT_REPORTS_NO_GLYPH", ctx, i, end, ch, summary, "The directly observed applied FontObject reports a coverage gap; rendered fallback and shaping are not established."); }
                            } else {
                                coverage = "FAILED"; detail = "hasGlyphsFor " + readDescription(glyphRead);
                                finding("NOT_CHECKED", "GLYPH_QUERY_FAILED", ctx, i, end, ch, summary, detail);
                            }
                        } else {
                            coverage = glyphApi.state === "FAILED" ? "FAILED" : "NOT_CHECKED";
                            detail = "hasGlyphsFor " + readDescription(glyphApi);
                            finding("NOT_CHECKED", glyphApi.state === "FAILED" ? "GLYPH_API_READ_FAILED" : "GLYPH_API_UNAVAILABLE", ctx, i, end, ch, summary, detail);
                        }
                    }
                }
            }
            if (fontInfo && identity === "VERIFIED") {
                // A PS-only observation may be the same font as a later ID-based
                // observation. Only distinct unique IDs establish mixed fonts.
                if (fontInfo.uniqueId) {
                    var key = "$" + fontInfo.key;
                    if (!fontKeys[key]) { fontKeys[key] = true; fontCount++; }
                } else { uniqueFontIdsOnly = false; }
            } else { fontUnknowns++; }
            if (coverage === "VERIFIED_PRESENT" || coverage === "VERIFIED_ABSENT") {
                counters.charactersCoverageVerified++;
                if (coverage === "VERIFIED_PRESENT") { counters.charactersCoveragePresent++; } else { counters.charactersCoverageAbsent++; }
            } else if (coverage === "FAILED") { counters.charactersCoverageFailed++; }
            else { counters.charactersCoverageSkipped++; }
            characterRows.push(["CHAR", compId, compName, ctx.id, ctx.index, ctx.name, i, end, ch.label, ch.text, identity, coverage, substitute, summary, detail]);
            i = end;
        }
        var mixed = fontUnknowns > 0 || !uniqueFontIdsOnly ? UNKNOWN : "SINGLE_FONT";
        if (fontCount > 1) {
            mixed = fontUnknowns > 0 || !uniqueFontIdsOnly ? "MIXED_WITH_UNKNOWNS" : "MIXED";
            counters.mixedFontLayers++;
            finding("REVIEW_NEEDED", "MIXED_FONT_RUNS", ctx, "", "", null, null, "Multiple applied font identities observed; intentional mixed fonts are a review item, not an error.");
        }
        if (fontUnknowns > 0 || !uniqueFontIdsOnly) {
            counters.mixedFontUnknownLayers++;
            finding("NOT_CHECKED", "MIXED_FONT_STATUS_UNKNOWN", ctx, "", "", null, null, "Complete mixed-font classification unavailable: unresolved character identity or unavailable unique fontID.");
        }
        layerRow(ctx, "STATIC_TEXT", mixed, "UTF-16 length=" + text.length + "; unknown character fonts=" + fontUnknowns);
    }
    for (var fi = 0; fi < findings.length; fi++) {
        if (findings[fi][0] === "PROBLEM_FOUND") { counters.problemFindings++; }
        else if (findings[fi][0] === "REVIEW_NEEDED") { counters.reviewFindings++; }
        else if (findings[fi][0] === "NOT_CHECKED") { counters.notCheckedFindings++; }
    }
    var revisionAfter = readRevision(project);
    var unchanged = revisionBefore.state === "OK" && revisionAfter.state === "OK" ? String(revisionBefore.value === revisionAfter.value) : UNKNOWN;
    var lines = [];
    function metric(label, value) { lines.push(cells([label, value])); }
    lines.push("JP FONT AND GLYPH PREFLIGHT — STATIC-TEXT BETA REPORT");
    metric("Report schema", SCHEMA); metric("Generated (host local time)", nowStamp());
    metric("Scan elapsed milliseconds", new Date().getTime() - startMs);
    lines.push(""); lines.push("HOST / 実行環境");
    metric("AE version", valueOrUnknown(read(function () { return app.version; })));
    metric("AE build name", valueOrUnknown(read(function () { return app.buildName; })));
    metric("AE build number", valueOrUnknown(read(function () { return app.buildNumber; })));
    metric("AE locale", valueOrUnknown(read(function () { return app.isoLanguage; })));
    metric("OS", valueOrUnknown(read(function () { return $.os; })));
    metric("Project revision before", valueOrUnknown(revisionBefore)); metric("Project revision after", valueOrUnknown(revisionAfter));
    metric("Project revision unchanged", unchanged);
    metric("Revision before read", readDescription(revisionBefore)); metric("Revision after read", readDescription(revisionAfter));
    lines.push(""); lines.push("SCOPE AND COVERAGE / 検査範囲");
    metric("Active composition only", true); metric("Composition ID", compId); metric("Composition", compName);
    metric("Composition time sampled", valueOrUnknown(read(function () { return comp.time; })));
    metric("Total layers", counters.totalLayers); metric("Text layers", counters.textLayers);
    metric("Static text layers checked", counters.staticTextLayers);
    metric("Expression text layers NOT CHECKED", counters.expressionTextLayers);
    metric("Animated text layers NOT CHECKED", counters.animatedTextLayers);
    metric("Unreadable/unclassified layers NOT CHECKED", counters.unknownTextLayers);
    metric("Empty text layers", counters.emptyTextLayers); metric("Non-text layers (not applicable)", counters.nonTextLayers);
    metric("Characters examined", counters.charactersExamined);
    metric("Characters coverage verified", counters.charactersCoverageVerified);
    metric("Characters coverage verified present", counters.charactersCoveragePresent);
    metric("Characters coverage verified absent", counters.charactersCoverageAbsent);
    metric("Characters coverage skipped", counters.charactersCoverageSkipped);
    metric("Characters coverage failed", counters.charactersCoverageFailed);
    metric("Mixed-font layers observed", counters.mixedFontLayers);
    metric("Mixed-font classification incomplete layers", counters.mixedFontUnknownLayers);
    metric("TextDocument.characterRange observed", hasCharacterRange); metric("FontObject.hasGlyphsFor observed", hasGlyphApi);
    metric("Problems", counters.problemFindings); metric("Review needed", counters.reviewFindings); metric("Not checked findings", counters.notCheckedFindings);
    lines.push(""); lines.push("FINDINGS / 検出結果");
    lines.push("severity\tcode\tcompId\tcomp\tlayerId\tlayerIndex\tlayerName\tstart\tend\tcodePoint\tcharacter\tfont\tdetail");
    for (var f = 0; f < findings.length; f++) { lines.push(cells(findings[f])); }
    if (findings.length === 0) { lines.push("NO_FINDINGS_IN_CHECKED_SCOPE\tNo finding produced. Coverage counters define which checks ran; this is not a native validation PASS."); }
    lines.push(""); lines.push("LAYER OBSERVATIONS / レイヤー観測");
    lines.push("type\tcompId\tcomp\tlayerId\tlayerIndex\tlayerName\tsourceText\tmixedFonts\tdetail");
    for (var l = 0; l < layerRows.length; l++) { lines.push(cells(layerRows[l])); }
    lines.push(""); lines.push("CHARACTER FONT OBSERVATIONS / 文字フォント観測");
    lines.push("type\tcompId\tcomp\tlayerId\tlayerIndex\tlayerName\tstart\tend\tcodePoint\tcharacter\tfontIdentity\tcoverage\tsubstitute\tfontSummary\tdetail");
    for (var r = 0; r < characterRows.length; r++) { lines.push(cells(characterRows[r])); }
    lines.push(""); lines.push("INTERPRETATION / 解釈");
    lines.push("Character offsets are zero-based UTF-16 [start,end); supplementary pairs remain one observation. These are not grapheme boundaries.");
    lines.push("fontIdentity VERIFIED requires direct CharacterRange.fontObject plus a readable fontID or PostScript name. Base TextDocument font is never substituted for an unreadable character font.");
    lines.push("VERIFIED_PRESENT/VERIFIED_ABSENT mean hasGlyphsFor returned a boolean for that applied font and code point. They do not prove rendered fallback or shaping correctness.");
    lines.push("NOT_CHECKED means no reliable query was made; FAILED means the glyph API getter/query failed or returned an invalid value. Neither is PASS.");
    lines.push("UNKNOWN records unavailable or failed reads. Complete mixed-font classification needs unique font IDs for every character; intentional mixing is REVIEW_NEEDED.");
    lines.push("Animated/expression Source Text, whole-project scanning, font installation/replacement, rendered-fallback identification, and full shaping validation are outside beta scope.");
    lines.push("Project revision equality is one observation, not proof of all project/UI state invariance; UNKNOWN never means unchanged/PASS.");
    var exportResult = writeReport(lines);
    alert(TOOL + "\n\nComposition / コンポ: " + cleanCell(compName) +
        "\nStatic text layers checked: " + counters.staticTextLayers +
        "\nProblems: " + counters.problemFindings + "; review needed: " + counters.reviewFindings + "; not checked: " + counters.notCheckedFindings +
        "\nCoverage verified/skipped/failed: " + counters.charactersCoverageVerified + "/" + counters.charactersCoverageSkipped + "/" + counters.charactersCoverageFailed +
        "\nProject revision unchanged: " + unchanged + "\n\nExport: " + exportResult.status + "\n" + exportResult.detail +
        "\n\nCoverage is not rendered fallback or shaping correctness. UNKNOWN/NOT_CHECKED/FAILED never means PASS.");
}());
