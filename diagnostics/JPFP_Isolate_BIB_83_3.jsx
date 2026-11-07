#target aftereffects

/*
Project 9-A — diagnostic tracer for Unknown BIB Error 83::3.
DISPOSABLE TEST PROJECT ONLY.

Purpose:
- Reproduce the Session 1 fixture-builder sequence with granular BEFORE/AFTER logging.
- Preserve the baseline fixture builder unchanged.
- Identify the first operation that throws, aborts, or is followed by the host BIB warning.

This diagnostic intentionally mutates a throwaway project by creating comps/layers.
*/

(function JPFP_Isolate_BIB_83_3() {
    var TOOL = "JPFP — Isolate BIB 83::3";

    function safe(fn, fallback) {
        try { return fn(); } catch (e) { return fallback; }
    }

    function stamp() {
        var d = new Date();
        function p(n) { return n < 10 ? "0" + n : String(n); }
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
            "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }

    function clean(v) {
        return String(v === undefined ? "<undefined>" : v === null ? "<null>" : v)
            .replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
    }

    var logFile = File.saveDialog("Save JPFP BIB 83::3 diagnostic log", "Text:*.txt");
    if (!logFile) {
        alert(TOOL + "\n\nCancelled: a persistent log is required.");
        return;
    }
    if (!/\.txt$/i.test(logFile.name)) {
        logFile = new File(logFile.fsName + ".txt");
    }

    function append(line) {
        try {
            logFile.encoding = "UTF-8";
            logFile.lineFeed = "Windows";
            if (!logFile.open("a")) { return; }
            logFile.writeln(stamp() + "\t" + line);
            logFile.close();
        } catch (e) {
            try { if (logFile.opened) { logFile.close(); } } catch (ignore) {}
        }
    }

    function compState(comp) {
        if (!comp) { return "comp=<none>"; }
        return "comp=" + clean(comp.name) +
            "; layers=" + safe(function () { return comp.numLayers; }, "<unavailable>") +
            "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>");
    }

    function fontSummary(fontObj) {
        if (!fontObj) { return "<no-font>"; }
        return "PS=" + clean(safe(function () { return fontObj.postScriptName; }, "<unavailable>")) +
            "; family=" + clean(safe(function () { return fontObj.nativeFamilyName; }, safe(function () { return fontObj.familyName; }, "<unavailable>"))) +
            "; style=" + clean(safe(function () { return fontObj.nativeStyleName; }, safe(function () { return fontObj.styleName; }, "<unavailable>"))) +
            "; id=" + clean(safe(function () { return fontObj.fontID; }, "<unavailable>")) +
            "; substitute=" + clean(safe(function () { return fontObj.isSubstitute; }, "<unavailable>"));
    }

    function fatalStep(name, comp, fn) {
        append("BEFORE\t" + name + "\t" + compState(comp));
        try {
            var value = fn();
            append("AFTER\t" + name + "\t" + compState(comp));
            return value;
        } catch (e) {
            append("THROW\t" + name + "\t" + clean(e.toString()) + "\t" + compState(comp));
            throw e;
        }
    }

    function caughtStep(name, comp, fn, fallback) {
        append("BEFORE\t" + name + "\t" + compState(comp));
        try {
            var value = fn();
            append("AFTER\t" + name + "\tresult=" + clean(value) + "\t" + compState(comp));
            return value;
        } catch (e) {
            append("CAUGHT\t" + name + "\t" + clean(e.toString()) + "\t" + compState(comp));
            return fallback;
        }
    }

    function allFontsFlat() {
        var groups = caughtStep("FONT_ENUM_app.fonts.allFonts", null, function () {
            return app.fonts.allFonts;
        }, []);
        var out = [];
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].length; j++) {
                out.push(groups[i][j]);
            }
        }
        append("INFO\tFONT_ENUM_FLAT_COUNT\t" + out.length);
        return out;
    }

    function supports(fontObj, s) {
        if (!fontObj || typeof fontObj.hasGlyphsFor !== "function") { return null; }
        try { return fontObj.hasGlyphsFor(s); } catch (e) { return null; }
    }

    function findFont(fonts, predicate) {
        for (var i = 0; i < fonts.length; i++) {
            try {
                if (predicate(fonts[i])) { return fonts[i]; }
            } catch (e) {}
        }
        return null;
    }

    function rawAddText(comp, name, text) {
        var layer = fatalStep(name + ".addText", comp, function () {
            return comp.layers.addText(text);
        });
        fatalStep(name + ".setName", comp, function () {
            layer.name = name;
            return true;
        });
        return layer;
    }

    function setPosition(comp, layer, name, y) {
        fatalStep(name + ".setPosition", comp, function () {
            layer.property("ADBE Transform Group").property("ADBE Position").setValue([120, y]);
            return true;
        });
    }

    function setWholeFontCaught(comp, layer, name, fontObj) {
        return caughtStep(name + ".setWholeFont", comp, function () {
            if (!fontObj) { return "NO_FONT"; }
            var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
            var td = p.value;
            td.fontObject = fontObj;
            p.setValue(td);
            return "OK:" + fontSummary(fontObj);
        }, "FAILED");
    }

    function addFixtureText(comp, name, text, fontObj, y) {
        append("INFO\t" + name + ".INPUT\ttext=" + clean(text) + "\tfont=" + fontSummary(fontObj));
        var layer = rawAddText(comp, name, text);
        setPosition(comp, layer, name, y);
        setWholeFontCaught(comp, layer, name, fontObj);
        append("INFO\t" + name + ".DONE\t" + compState(comp));
        return layer;
    }

    if (!confirm(
        TOOL + "\n\n" +
        "This script WILL mutate the current project.\n" +
        "Run only in a fresh throwaway project. Continue?"
    )) {
        append("CANCELLED\tuser_declined");
        return;
    }

    if (!app.project) {
        fatalStep("PROJECT.newProject", null, function () {
            app.newProject();
            return true;
        });
    }

    append("HOST\tAE=" + clean(safe(function () { return app.version; }, "<unavailable>")) +
        "\tbuild=" + clean(safe(function () { return app.buildNumber; }, "<unavailable>")) +
        "\tlocale=" + clean(safe(function () { return app.isoLanguage; }, "<unavailable>")) +
        "\tOS=" + clean(safe(function () { return $.os; }, "<unavailable>")));

    if (!safe(function () { return !!app.fonts; }, false)) {
        append("FATAL\tapp.fonts unavailable");
        alert(TOOL + "\n\napp.fonts unavailable.");
        return;
    }

    var fonts = allFontsFlat();

    append("BEFORE\tFONT_SELECT_JP");
    var jpFont = findFont(fonts, function (f) {
        return supports(f, "日本語。") === true;
    });
    append("AFTER\tFONT_SELECT_JP\t" + fontSummary(jpFont));

    append("BEFORE\tFONT_SELECT_LATIN");
    var latinFont = findFont(fonts, function (f) {
        return supports(f, "ABC123") === true &&
            (!jpFont || safe(function () { return f.fontID; }, 0) !== safe(function () { return jpFont.fontID; }, -1));
    });
    append("AFTER\tFONT_SELECT_LATIN\t" + fontSummary(latinFont));

    append("BEFORE\tFONT_SELECT_LATIN_NO_KANJI");
    var latinNoKanji = findFont(fonts, function (f) {
        return supports(f, "ABC") === true && supports(f, "漢") === false;
    });
    append("AFTER\tFONT_SELECT_LATIN_NO_KANJI\t" + fontSummary(latinNoKanji));

    if (!jpFont) {
        append("FATAL\tNo JP font candidate");
        alert(TOOL + "\n\nNo Japanese-capable font candidate found.\nLog: " + logFile.fsName);
        return;
    }
    if (!latinFont) { latinFont = jpFont; }

    append("SELECTED\tjp=" + fontSummary(jpFont));
    append("SELECTED\tlatin=" + fontSummary(latinFont));
    append("SELECTED\tlatinNoKanji=" + fontSummary(latinNoKanji));

    var comp = null;
    var undoOpen = false;
    var mainError = null;
    try {
        fatalStep("UNDO.beginUndoGroup", null, function () {
            app.beginUndoGroup("JPFP BIB 83::3 Isolation Trace");
            undoOpen = true;
            return true;
        });

        comp = fatalStep("COMP.addComp", null, function () {
            return app.project.items.addComp("JPFP_BIB83_TRACE__DISPOSABLE", 1920, 1080, 1, 10, 30);
        });

        var y = 90;
        var step = 85;

        addFixtureText(comp, "[F01] GOOD_JP", "日本語の字幕です。ABC 123", jpFont, y); y += step;

        var missingLayer = addFixtureText(comp, "[F02] MISSING_FONT_REFERENCE", "欠落フォント", jpFont, y); y += step;
        caughtStep("[F02].assignMissingPostScriptName", comp, function () {
            var mp = missingLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var mtd = mp.value;
            mtd.font = "JPFP_Session1_MissingFont_PS__DO_NOT_INSTALL";
            mp.setValue(mtd);
            return "OK";
        }, "FAILED");

        var mixed = addFixtureText(comp, "[F03] MIXED_FONTS", "日本語 ABC", jpFont, y); y += step;
        caughtStep("[F03].setRangeFont_4_7", comp, function () {
            var p3 = mixed.property("ADBE Text Properties").property("ADBE Text Document");
            var td3 = p3.value;
            td3.characterRange(4, 7).fontObject = latinFont;
            p3.setValue(td3);
            return "OK:" + fontSummary(latinFont);
        }, "FAILED");

        addFixtureText(comp, "[F04] JP_LATIN_PUNCT", "「日本語」—ABC・123！？", jpFont, y); y += step;

        var gap = addFixtureText(comp, "[F05] GLYPH_GAP_EXPERIMENT", "A漢B", jpFont, y); y += step;
        if (latinNoKanji) {
            setWholeFontCaught(comp, gap, "[F05].candidateLatinNoKanji", latinNoKanji);
            caughtStep("[F05].renameCandidate", comp, function () {
                gap.name += "__CANDIDATE=" + safe(function () { return latinNoKanji.postScriptName; }, "unknown");
                return gap.name;
            }, "FAILED");
        } else {
            caughtStep("[F05].renameNoCandidate", comp, function () {
                gap.name += "__NO_CANDIDATE_FONT_FOUND";
                return gap.name;
            }, "FAILED");
        }

        addFixtureText(comp, "[F06] EMPTY_TEXT", "", jpFont, y); y += step;
        addFixtureText(comp, "[F07] SUPPLEMENTARY_CJK", "𠀋", jpFont, y); y += step;
        addFixtureText(comp, "[F08] COMBINING_DAKUTEN", "は\u3099", jpFont, y); y += step;
        addFixtureText(comp, "[F09] VARIATION_SEQUENCE", "葛\uDB40\uDD00", jpFont, y); y += step;

        var animated = addFixtureText(comp, "[F10] ANIMATED_SOURCE_TEXT", "静的", jpFont, y); y += step;
        fatalStep("[F10].setValueAtTime_0", comp, function () {
            var ap = animated.property("ADBE Text Properties").property("ADBE Text Document");
            var a0 = ap.value;
            ap.setValueAtTime(0, a0);
            return true;
        });
        fatalStep("[F10].setValueAtTime_1", comp, function () {
            var ap = animated.property("ADBE Text Properties").property("ADBE Text Document");
            var a1 = ap.value;
            a1.text = "動的";
            ap.setValueAtTime(1, a1);
            return true;
        });

        var expr = addFixtureText(comp, "[F11] EXPRESSION_SOURCE_TEXT", "式", jpFont, y); y += step;
        caughtStep("[F11].enableExpression", comp, function () {
            var ep = expr.property("ADBE Text Properties").property("ADBE Text Document");
            ep.expression = '"式で生成"';
            ep.expressionEnabled = true;
            return "OK";
        }, "FAILED");

        var solid = fatalStep("[F12].addSolid", comp, function () {
            return comp.layers.addSolid([0.3, 0.3, 0.3], "[F12] NON_TEXT_LAYER", 200, 80, 1);
        });
        fatalStep("[F12].setPosition", comp, function () {
            solid.property("ADBE Transform Group").property("ADBE Position").setValue([1500, 900]);
            return true;
        });

        var large = fatalStep("L01.addComp", null, function () {
            return app.project.items.addComp("JPFP_BIB83_LARGE_100_TEXT__DISPOSABLE", 1920, 1080, 1, 10, 30);
        });
        for (var n = 0; n < 100; n++) {
            var lname = "[L01." + (n + 1) + "] ADD_TEXT";
            var layer = rawAddText(large, lname, "日本語 " + (n + 1));
            setWholeFontCaught(large, layer, lname, jpFont);
        }

        append("COMPLETE_BODY\tAll diagnostic body operations completed.");
    } catch (fatalErr) {
        mainError = fatalErr;
        append("FATAL_ABORT_BODY\t" + clean(fatalErr.toString()) + "\t" + compState(comp));
    } finally {
        if (undoOpen) {
            append("BEFORE\tUNDO.endUndoGroup\t" + compState(comp));
            try {
                app.endUndoGroup();
                append("AFTER\tUNDO.endUndoGroup\t" + compState(comp));
            } catch (undoErr) {
                append("THROW\tUNDO.endUndoGroup\t" + clean(undoErr.toString()) + "\t" + compState(comp));
                if (!mainError) { mainError = undoErr; }
            }
        }
    }

    if (mainError) {
        alert(
            TOOL + "\n\nDiagnostic sequence stopped.\n" +
            "Review the final log entries to distinguish the body operation from endUndoGroup.\n\n" +
            "Error: " + mainError.toString() + "\n\nLog:\n" + logFile.fsName
        );
    } else {
        append("COMPLETE\tDiagnostic sequence and endUndoGroup completed.");
        alert(
            TOOL + "\n\nDiagnostic sequence completed.\n" +
            "Review the log and note the exact timing of any BIB warning.\n\nLog:\n" + logFile.fsName
        );
    }
}());
