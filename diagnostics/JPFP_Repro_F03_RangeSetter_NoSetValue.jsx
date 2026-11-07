#target aftereffects

/*
Project 9-A — F03 CharacterRange setter-only causal isolation.
DISPOSABLE PROJECT ONLY.

Purpose:
- Apply CharacterRange(4,7).fontObject = AniMeVisionMB_EN.
- Intentionally DO NOT call Source Text property setValue(tdRange).
- Compare in-memory TextDocument readback vs fresh Source Text property readback.
- Observe whether BIB 83::3 occurs during setter, composition evaluation, or display.

Run in a fresh AE 26.5 process/project after an independent ASCII smoke test passes.
*/

(function JPFP_F03_RangeSetter_NoSetValue() {
    var TOOL = "JPFP — F03 Range Setter WITHOUT setValue";
    var TEXT = "日本語 ABC";
    var JP_PS = "MS-Gothic";
    var LATIN_PS = "AniMeVisionMB_EN";

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
            if (typeof td.characterRange !== "function") {
                return "<characterRange-unavailable>";
            }
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
        "This test mutates only a disposable project.\n" +
        "It intentionally omits p.setValue(tdRange).\n" +
        "Run only in a fresh project. Continue?"
    )) {
        return;
    }

    var lines = [];
    function log(label, value) {
        lines.push(stamp() + "\t" + label + "\t" + clean(value));
    }

    log("CASE", "F03_RANGE_SETTER_NO_SETVALUE");
    log("HOST_AE_VERSION", safe(function () { return app.version; }, "<unavailable>"));
    log("HOST_BUILD", safe(function () { return app.buildNumber; }, "<unavailable>"));
    log("HOST_LOCALE", safe(function () { return app.isoLanguage; }, "<unavailable>"));
    log("HOST_OS", safe(function () { return $.os; }, "<unavailable>"));

    var comp = null;
    var layer = null;
    var p = null;
    var tdRange = null;
    var firstError = null;

    try {
        var fonts = flattenFonts();
        log("FONT_COUNT", fonts.length);

        var jpFont = findByPS(fonts, JP_PS);
        var latinFont = findByPS(fonts, LATIN_PS);

        log("JP_FONT", fontPS(jpFont));
        log("LATIN_FONT", fontPS(latinFont));

        if (!jpFont) { throw new Error("Required JP font not found: " + JP_PS); }
        if (!latinFont) { throw new Error("Required Latin font not found: " + LATIN_PS); }

        comp = app.project.items.addComp(
            "JPFP_F03_RANGE_SETTER_NO_SETVALUE__DISPOSABLE",
            1920, 1080, 1, 5, 30
        );
        log("COMP_CREATED", "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        log("BEFORE_ADD_TEXT", "layers=" + comp.numLayers + "; revision=" + app.project.revision);
        layer = comp.layers.addText(TEXT);
        log("AFTER_ADD_TEXT",
            "layers=" + comp.numLayers +
            "; revision=" + app.project.revision +
            "; returned=" + (layer ? "object" : "undefined/null"));

        if (!layer) { throw new Error("addText returned no layer"); }

        p = layer.property("ADBE Text Properties").property("ADBE Text Document");

        var tdWhole = p.value;
        tdWhole.fontObject = jpFont;
        p.setValue(tdWhole);
        log("AFTER_WHOLE_JP_FONT", "revision=" + app.project.revision);

        var propertyBefore = p.value;
        log("PROPERTY_READBACK_BEFORE_SETTER", describeDoc(propertyBefore));

        tdRange = p.value;
        log("LOCAL_DOC_BEFORE_SETTER", describeDoc(tdRange));

        log("BEFORE_RANGE_SETTER_ONLY", "revision=" + app.project.revision);
        tdRange.characterRange(4, 7).fontObject = latinFont;
        log("AFTER_RANGE_SETTER_ONLY", "revision=" + app.project.revision);

        // Critical: intentionally no p.setValue(tdRange) here.
        log("NO_SETVALUE", "p.setValue(tdRange) intentionally omitted");

        log("LOCAL_DOC_AFTER_SETTER", describeDoc(tdRange));

        var propertyAfterSetter = p.value;
        log("PROPERTY_READBACK_AFTER_SETTER", describeDoc(propertyAfterSetter));

        log("BEFORE_OPEN_IN_VIEWER",
            "layers=" + comp.numLayers + "; revision=" + app.project.revision);
        comp.openInViewer();
        log("AFTER_OPEN_IN_VIEWER",
            "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        log("LOCAL_DOC_AFTER_OPEN", describeDoc(tdRange));

        var propertyAfterOpen = p.value;
        log("PROPERTY_READBACK_AFTER_OPEN", describeDoc(propertyAfterOpen));

        log("RESULT", "SCRIPT_COMPLETED");
    } catch (e) {
        firstError = e;
        log("THROW",
            e.toString() +
            "; line=" + e.line +
            "; layers=" + safe(function () { return comp.numLayers; }, "<unavailable>") +
            "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>"));
        log("RESULT", "SCRIPT_EXCEPTION");
    }

    var out = File.saveDialog("Save F03 setter-only isolation log", "Text:*.txt");
    if (out) {
        if (!/\.txt$/i.test(out.name)) {
            out = new File(out.fsName + ".txt");
        }
        try {
            out.encoding = "UTF-8";
            out.lineFeed = "Windows";
            if (out.open("w")) {
                out.write(lines.join("\n"));
                out.close();
            }
        } catch (writeErr) {
            try { if (out.opened) { out.close(); } } catch (ignore) {}
        }
    }

    alert(
        TOOL + "\n\n" +
        "Script result: " + (firstError ? "SCRIPT_EXCEPTION" : "SCRIPT_COMPLETED") + "\n\n" +
        "Important: record BIB 83::3 independently from script completion.\n" +
        "Preserve LOCAL_DOC_* and PROPERTY_READBACK_* lines."
    );
}());
