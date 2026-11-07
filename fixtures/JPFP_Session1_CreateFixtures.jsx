#target aftereffects

/*
Project 9-A — Session 1 disposable fixture builder.
WARNING: THIS SCRIPT MODIFIES THE CURRENT PROJECT.
Run only in a new/throwaway test project. It creates fixture compositions and layers.
The product scanner itself remains read-only.
*/

(function JPFP_Session1_CreateFixtures() {
    var ok = confirm(
        "JP Font/Glyph Preflight Session 1 fixture builder\n\n" +
        "This script WILL MODIFY the current AE project by creating test compositions/layers.\n" +
        "Run only in a new/throwaway project. Continue?\n\n" +
        "このスクリプトはテスト用コンポとレイヤーを作成します。新規テストプロジェクトでのみ実行してください。"
    );
    if (!ok) { return; }

    function safe(fn, fallback) { try { return fn(); } catch (e) { return fallback; } }

    // JPFP-FIXTURE-HELPERS-BEGIN
    // A setter returning without an exception is NOT proof the requested state persisted.
    // Each fixture is accepted only after a fresh Source Text readback matches the request.
    function fontIdentity(fontObj) {
        if (!fontObj) { return null; }
        try { if (fontObj.postScriptName) { return String(fontObj.postScriptName); } } catch (e) {}
        return null;
    }
    function freshTextDocument(layer) {
        try { return layer.property("ADBE Text Properties").property("ADBE Text Document").value; } catch (e) { return null; }
    }
    function confirmResult(requested, observed, reason) {
        var confirmed = requested !== null && requested !== undefined && requested === observed;
        return {
            confirmed: confirmed,
            requested: requested,
            observed: observed,
            reason: confirmed ? "" : (reason || "fresh Source Text readback differs from the request")
        };
    }
    function confirmWholeFont(layer, fontObj) {
        var requested = fontIdentity(fontObj);
        if (!requested) { return confirmResult(null, null, "requested font identity unavailable"); }
        var doc = freshTextDocument(layer);
        if (!doc) { return confirmResult(requested, null, "fresh Source Text readback failed"); }
        var observed = null;
        try { observed = fontIdentity(doc.fontObject); } catch (e) {}
        return confirmResult(requested, observed);
    }
    function confirmRangeFont(layer, start, end, fontObj) {
        var requested = fontIdentity(fontObj);
        if (!requested) { return confirmResult(null, null, "requested font identity unavailable"); }
        var doc = freshTextDocument(layer);
        if (!doc) { return confirmResult(requested, null, "fresh Source Text readback failed"); }
        if (typeof doc.characterRange !== "function") { return confirmResult(requested, null, "characterRange unavailable for readback"); }
        var observed = null;
        try { observed = fontIdentity(doc.characterRange(start, end).fontObject); } catch (e) {}
        return confirmResult(requested, observed);
    }
    function confirmFontName(layer, fontName) {
        var doc = freshTextDocument(layer);
        if (!doc) { return confirmResult(fontName, null, "fresh Source Text readback failed"); }
        var observed = null;
        try { observed = doc.font === undefined || doc.font === null ? null : String(doc.font); } catch (e) {}
        return confirmResult(fontName, observed);
    }
    // One guarded step per fixture: a failing fixture is recorded and the rest still run.
    function createStepRunner() {
        var results = [];
        var order = [];
        var current = null;
        var needs = {};
        return {
            results: results,
            run: function (id, fn, needsReadback) {
                order.push(id);
                needs[id] = needsReadback === true;
                current = id;
                try {
                    fn();
                    results.push({ fixture: id, kind: "STEP", status: "COMPLETED", detail: "" });
                } catch (e) {
                    results.push({ fixture: id, kind: "STEP", status: "FAILED", detail: String(e) });
                }
                current = null;
            },
            confirm: function (label, outcome) {
                results.push({
                    fixture: current, kind: "READBACK", label: label,
                    status: outcome.confirmed ? "CONFIRMED" : "UNCONFIRMED",
                    detail: outcome.confirmed ? "" : outcome.reason + " (requested=" + outcome.requested + ", observed=" + outcome.observed + ")"
                });
            },
            accepted: function (id) {
                var completed = false, confirmed = 0, rejected = 0;
                for (var i = 0; i < results.length; i++) {
                    var r = results[i];
                    if (r.fixture !== id) { continue; }
                    if (r.kind === "STEP") { completed = r.status === "COMPLETED"; }
                    else if (r.status === "CONFIRMED") { confirmed++; }
                    else { rejected++; }
                }
                return completed && rejected === 0 && (!needs[id] || confirmed > 0);
            },
            report: function () {
                var lines = [];
                for (var i = 0; i < order.length; i++) {
                    var id = order[i];
                    var detail = [];
                    for (var j = 0; j < results.length; j++) {
                        var r = results[j];
                        if (r.fixture === id && r.status !== "COMPLETED" && r.status !== "CONFIRMED") { detail.push(r.status + (r.label ? " " + r.label : "") + (r.detail ? ": " + r.detail : "")); }
                    }
                    var ok = this.accepted(id);
                    lines.push(id + ": " + (ok ? "ACCEPTED" : "NOT ACCEPTED" + (detail.length ? " - " + detail.join("; ") : " - no readback confirmation")));
                }
                return lines;
            }
        };
    }
    // JPFP-FIXTURE-HELPERS-END
    function allFontsFlat() {
        var out = [];
        var groups = safe(function () { return app.fonts.allFonts; }, []);
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].length; j++) { out.push(groups[i][j]); }
        }
        return out;
    }
    function findFont(predicate) {
        var fonts = allFontsFlat();
        for (var i = 0; i < fonts.length; i++) {
            try { if (predicate(fonts[i])) { return fonts[i]; } } catch (e) {}
        }
        return null;
    }
    function supports(fontObj, s) {
        if (!fontObj || typeof fontObj.hasGlyphsFor !== "function") { return null; }
        try { return fontObj.hasGlyphsFor(s); } catch (e) { return null; }
    }
    function setWholeFont(layer, fontObj) {
        if (!fontObj) { return false; }
        var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var td = p.value;
        try { td.fontObject = fontObj; p.setValue(td); return true; } catch (e) { return false; }
    }
    var runner = createStepRunner();
    var MISSING_FONT_NAME = "JPFP_Session1_MissingFont_PS__DO_NOT_INSTALL";
    function addText(comp, name, text, fontObj, y) {
        var layer = comp.layers.addText(text);
        if (!layer) { throw new Error("addText returned no layer for " + name); }
        layer.name = name;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([120, y]);
        setWholeFont(layer, fontObj);
        if (fontObj) { runner.confirm("whole-layer font", confirmWholeFont(layer, fontObj)); }
        return layer;
    }
    function setRangeFont(layer, start, end, fontObj) {
        if (!fontObj) { return false; }
        var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var td = p.value;
        if (typeof td.characterRange !== "function") { return false; }
        try {
            td.characterRange(start, end).fontObject = fontObj;
            p.setValue(td);
            return true;
        } catch (e) { return false; }
    }

    if (!app.project) { app.newProject(); }
    if (!app.fonts) {
        alert("app.fonts is unavailable. AE 24.0+ is required for these fixtures.");
        return;
    }

    // Latin fonts are taken only from standard Windows fonts. Picking the first matching installed font chose
    // AniMeVisionMB_EN on one host, which raised AE "Unknown BIB Error (83::3)" and broke the text engine until restart.
    var SAFE_LATIN_PS = ["ArialMT", "TimesNewRomanPSMT", "Verdana", "Tahoma", "SegoeUI", "Calibri", "Georgia", "TrebuchetMS"];
    function findSafeLatin(predicate) {
        for (var k = 0; k < SAFE_LATIN_PS.length; k++) {
            var wanted = SAFE_LATIN_PS[k];
            var f = findFont(function (x) { return safe(function () { return x.postScriptName; }, "") === wanted; });
            if (f && predicate(f)) { return f; }
        }
        return null;
    }

    var jpFont = findFont(function (f) { return supports(f, "日本語。") === true; });
    var latinFont = findSafeLatin(function (f) { return supports(f, "ABC123") === true; });
    var latinNoKanji = findSafeLatin(function (f) { return supports(f, "ABC") === true && supports(f, "漢") === false; });

    if (!jpFont) {
        alert("No installed font was found that reports glyph support for 日本語。 via hasGlyphsFor(). Cannot build deterministic JP fixtures.");
        return;
    }
    if (!latinFont) { latinFont = jpFont; }

    app.beginUndoGroup("JPFP Session 1 Create Fixtures");
    try {
        var comp = app.project.items.addComp("JPFP_S1_FIXTURES__DISPOSABLE", 1920, 1080, 1, 10, 30);
        var y = 90;
        var step = 85;

        runner.run("F01", function () { addText(comp, "[F01] GOOD_JP", "日本語の字幕です。ABC 123", jpFont, y); }, true);
        y += step;

        runner.run("F02", function () {
            var missingLayer = addText(comp, "[F02] MISSING_FONT_REFERENCE", "欠落フォント", jpFont, y);
            try {
                var mp = missingLayer.property("ADBE Text Properties").property("ADBE Text Document");
                var mtd = mp.value;
                mtd.font = MISSING_FONT_NAME;
                mp.setValue(mtd);
            } catch (missingErr) {
                missingLayer.name += "__SETUP_FAILED";
                throw missingErr;
            }
            runner.confirm("missing font reference", confirmFontName(missingLayer, MISSING_FONT_NAME));
        }, true);
        y += step;

        // F03 is the fixture associated with the BIB 83::3 host warning. It is isolated so that
        // a failure here cannot prevent the unrelated fixtures after it from being created.
        runner.run("F03", function () {
            var mixed = addText(comp, "[F03] MIXED_FONTS", "日本語 ABC", jpFont, y);
            setRangeFont(mixed, 4, 7, latinFont);
            runner.confirm("range 4-7 font", confirmRangeFont(mixed, 4, 7, latinFont));
        }, true);
        y += step;

        runner.run("F04", function () { addText(comp, "[F04] JP_LATIN_PUNCT", "「日本語」—ABC・123！？", jpFont, y); }, true);
        y += step;

        runner.run("F05", function () {
            var gap = addText(comp, "[F05] GLYPH_GAP_EXPERIMENT", "A漢B", jpFont, y);
            if (latinNoKanji) {
                setWholeFont(gap, latinNoKanji);
                gap.name += "__CANDIDATE=" + safe(function(){ return latinNoKanji.postScriptName; }, "unknown");
                runner.confirm("glyph-gap candidate font", confirmWholeFont(gap, latinNoKanji));
            } else {
                gap.name += "__NO_CANDIDATE_FONT_FOUND";
                runner.confirm("glyph-gap candidate font", { confirmed: false, requested: null, observed: null, reason: "no installed candidate font found; the glyph-gap condition was not established" });
            }
        }, true);
        y += step;

        runner.run("F06", function () { addText(comp, "[F06] EMPTY_TEXT", "", jpFont, y); });
        y += step;
        runner.run("F07", function () { addText(comp, "[F07] SUPPLEMENTARY_CJK", "𠀋", jpFont, y); });
        y += step;
        runner.run("F08", function () { addText(comp, "[F08] COMBINING_DAKUTEN", "は\u3099", jpFont, y); });
        y += step;
        runner.run("F09", function () { addText(comp, "[F09] VARIATION_SEQUENCE", "葛\uDB40\uDD00", jpFont, y); });
        y += step;

        runner.run("F10", function () {
            var animated = addText(comp, "[F10] ANIMATED_SOURCE_TEXT", "静的", jpFont, y);
            var ap = animated.property("ADBE Text Properties").property("ADBE Text Document");
            var a0 = ap.value;
            ap.setValueAtTime(0, a0);
            var a1 = ap.value;
            a1.text = "動的";
            ap.setValueAtTime(1, a1);
        });
        y += step;

        runner.run("F11", function () {
            var expr = addText(comp, "[F11] EXPRESSION_SOURCE_TEXT", "式", jpFont, y);
            var ep = expr.property("ADBE Text Properties").property("ADBE Text Document");
            try { ep.expression = '"式で生成"'; ep.expressionEnabled = true; } catch (exprErr) { expr.name += "__SETUP_FAILED"; throw exprErr; }
        });
        y += step;

        runner.run("F12", function () {
            var solid = comp.layers.addSolid([0.3,0.3,0.3], "[F12] NON_TEXT_LAYER", 200, 80, 1);
            solid.property("ADBE Transform Group").property("ADBE Position").setValue([1500, 900]);
        });

        runner.run("L01", function () {
            var large = app.project.items.addComp("JPFP_S1_LARGE_100_TEXT__DISPOSABLE", 1920, 1080, 1, 10, 30);
            for (var n = 0; n < 100; n++) {
                var l = large.layers.addText("日本語 " + (n + 1));
                l.name = "[LARGE] JP_TEXT_" + (n + 1);
                setWholeFont(l, jpFont);
            }
        });

        runner.run("OPEN", function () { comp.openInViewer(); });
        alert(
            "Session 1 fixture setup finished. A fixture is usable ONLY if it says ACCEPTED (persisted readback confirmed).\n\n" +
            runner.report().join("\n") + "\n\n" +
            "JP font: " + safe(function(){return jpFont.postScriptName;},"unknown") + "\n" +
            "Latin font: " + safe(function(){return latinFont.postScriptName;},"unknown") + "\n" +
            "Glyph-gap candidate: " + (latinNoKanji ? safe(function(){return latinNoKanji.postScriptName;},"unknown") : "NOT FOUND") + "\n\n" +
            "Run JPFP_Session1_Probe.jsx on JPFP_S1_FIXTURES__DISPOSABLE, then on JPFP_S1_LARGE_100_TEXT__DISPOSABLE."
        );
    } finally {
        app.endUndoGroup();
    }
}());
