#target aftereffects

/*
Project 9-A — F03 two-phase isolation, PHASE A.
DISPOSABLE PROJECT ONLY.

Purpose:
- Reproduce the local CharacterRange setter + exactly one Source Text p.setValue(tdRange).
- DO NOT open the composition.
- Return control to AE silently so the host can be observed while the composition remains unopened.
*/

(function JPFP_F03_SetValue_NoOpen_PhaseA() {
    var TOOL = "JPFP — F03 setValue No-Open Phase A";
    var TEXT = "日本語 ABC";
    var JP_PS = "MS-Gothic";
    var LATIN_PS = "AniMeVisionMB_EN";
    var COMP_NAME = "JPFP_F03_SETVALUE_DEFERRED_OPEN__DISPOSABLE";

    function safe(fn, fallback) {
        try { return fn(); } catch (e) { return fallback; }
    }

    function clean(v) {
        return String(v === undefined ? "<undefined>" : v === null ? "<null>" : v)
            .replace(/\r/g, "\\r")
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t");
    }

    function stamp() {
        var d = new Date();
        function p(n) { return n < 10 ? "0" + n : String(n); }
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
            "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }

    function flattenFonts() {
        var out = [];
        var groups = app.fonts.allFonts;
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].length; j++) {
                out.push(groups[i][j]);
            }
        }
        return out;
    }

    function findByPS(fonts, ps) {
        for (var i = 0; i < fonts.length; i++) {
            try {
                if (fonts[i].postScriptName === ps) { return fonts[i]; }
            } catch (e) {}
        }
        return null;
    }

    function fontPS(fontObj) {
        if (!fontObj) { return "<no-font>"; }
        return safe(function () { return fontObj.postScriptName; }, "<unavailable>");
    }

    function rangeFontPS(td, start, end) {
        return safe(function () {
            return fontPS(td.characterRange(start, end).fontObject);
        }, "<range-read-failed>");
    }

    function describeDoc(td) {
        if (!td) { return "<no-text-document>"; }
        return "0_3=" + rangeFontPS(td, 0, 3) +
            "; 4_7=" + rangeFontPS(td, 4, 7) +
            "; whole=" + fontPS(safe(function () { return td.fontObject; }, null)) +
            "; text=" + clean(safe(function () { return td.text; }, "<unavailable>"));
    }

    if (!app.project) { app.newProject(); }

    if (!confirm(
        TOOL + "\n\n" +
        "This creates one disposable F03 text layer, performs one p.setValue(tdRange), " +
        "and intentionally leaves the composition unopened.\n\nContinue?"
    )) {
        return;
    }

    var out = File.saveDialog("Save Phase A diagnostic log BEFORE the experiment", "Text:*.txt");
    if (!out) { return; }
    if (!/\.txt$/i.test(out.name)) { out = new File(out.fsName + ".txt"); }

    var lines = [];
    function log(label, value) {
        lines.push(stamp() + "\t" + label + "\t" + clean(value));
    }
    function flush() {
        try {
            out.encoding = "UTF-8";
            out.lineFeed = "Windows";
            if (out.open("w")) {
                out.write(lines.join("\n"));
                out.close();
            }
        } catch (e) {
            try { if (out.opened) { out.close(); } } catch (ignore) {}
        }
    }

    var comp = null;
    var layer = null;
    var p = null;
    var tdRange = null;
    var firstError = null;

    log("CASE", "F03_SETTER_PLUS_SETVALUE_NO_OPEN_PHASE_A");
    log("HOST_AE_VERSION", safe(function () { return app.version; }, "<unavailable>"));
    log("HOST_BUILD", safe(function () { return app.buildNumber; }, "<unavailable>"));
    log("HOST_LOCALE", safe(function () { return app.isoLanguage; }, "<unavailable>"));
    log("HOST_OS", safe(function () { return $.os; }, "<unavailable>"));

    try {
        var fonts = flattenFonts();
        var jpFont = findByPS(fonts, JP_PS);
        var latinFont = findByPS(fonts, LATIN_PS);

        log("JP_FONT", fontPS(jpFont));
        log("LATIN_FONT", fontPS(latinFont));

        if (!jpFont) { throw new Error("Required JP font not found: " + JP_PS); }
        if (!latinFont) { throw new Error("Required Latin font not found: " + LATIN_PS); }

        comp = app.project.items.addComp(COMP_NAME, 1920, 1080, 1, 5, 30);
        log("COMP_CREATED", "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        layer = comp.layers.addText(TEXT);
        if (!layer) { throw new Error("addText returned no layer"); }
        log("AFTER_ADD_TEXT", "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        p = layer.property("ADBE Text Properties").property("ADBE Text Document");

        var whole = p.value;
        whole.fontObject = jpFont;
        p.setValue(whole);
        log("AFTER_WHOLE_JP_FONT", "revision=" + app.project.revision);
        log("PROPERTY_BEFORE_SETTER", describeDoc(p.value));

        tdRange = p.value;
        log("LOCAL_BEFORE_SETTER", describeDoc(tdRange));
        log("BEFORE_RANGE_SETTER", "revision=" + app.project.revision);
        tdRange.characterRange(4, 7).fontObject = latinFont;
        log("AFTER_RANGE_SETTER", "revision=" + app.project.revision);
        log("LOCAL_AFTER_SETTER", describeDoc(tdRange));
        log("PROPERTY_AFTER_SETTER", describeDoc(p.value));

        log("BEFORE_PROPERTY_SETVALUE", "revision=" + app.project.revision);
        p.setValue(tdRange);
        log("AFTER_PROPERTY_SETVALUE", "revision=" + app.project.revision);

        log("LOCAL_AFTER_SETVALUE", describeDoc(tdRange));
        log("PROPERTY_AFTER_SETVALUE", describeDoc(p.value));

        log("COMP_OPEN_REQUESTED", "NO");
        log("PHASE_A_RESULT", "SCRIPT_COMPLETED_COMPOSITION_LEFT_UNOPENED");
    } catch (e) {
        firstError = e;
        log("THROW", e.toString() + "; line=" + e.line +
            "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>"));
        log("PHASE_A_RESULT", "SCRIPT_EXCEPTION");
    }

    flush();

    // Critical: no openInViewer and no final alert.
    // Control returns directly to AE so Codex can observe the unopened host state.
}());
