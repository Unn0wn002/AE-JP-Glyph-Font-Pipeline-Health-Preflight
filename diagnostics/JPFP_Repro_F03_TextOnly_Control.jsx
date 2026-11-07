#target aftereffects

/*
Project 9-A — F03-only causal isolation.
DISPOSABLE PROJECT ONLY.
Run in a fresh AE 26.5 process/project after an ASCII smoke test passes.
*/

(function JPFP_F03_Isolation() {
    var TOOL = "JPFP — F03 Text-Only Control";
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
            if (typeof td.characterRange !== "function") { return "<characterRange-unavailable>"; }
            return fontPS(td.characterRange(start, end).fontObject);
        }, "<range-read-failed>");
    }

    if (!app.project) { app.newProject(); }

    if (!confirm(
        TOOL + "\n\n" +
        "This test mutates only a disposable project.\n" +
        "Run in a fresh project. Continue?"
    )) {
        return;
    }

    var lines = [];
    function log(label, value) {
        lines.push(stamp() + "\t" + label + "\t" + clean(value));
    }

    log("CASE", "F03_TEXT_ONLY_CONTROL");
    log("HOST_AE_VERSION", safe(function () { return app.version; }, "<unavailable>"));
    log("HOST_BUILD", safe(function () { return app.buildNumber; }, "<unavailable>"));
    log("HOST_LOCALE", safe(function () { return app.isoLanguage; }, "<unavailable>"));
    log("HOST_OS", safe(function () { return $.os; }, "<unavailable>"));

    var comp = null;
    var layer = null;
    var firstError = null;

    try {
        var fonts = flattenFonts();
        log("FONT_COUNT", fonts.length);

        var jpFont = findByPS(fonts, JP_PS);
        var latinFont = findByPS(fonts, LATIN_PS);

        log("JP_FONT", fontPS(jpFont));
        log("LATIN_FONT", fontPS(latinFont));

        if (!jpFont) { throw new Error("Required JP font not found: " + JP_PS); }
        

        comp = app.project.items.addComp("JPFP_F03_TEXT_ONLY__DISPOSABLE", 1920, 1080, 1, 5, 30);
        log("COMP_CREATED", "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        log("BEFORE_ADD_TEXT", "layers=" + comp.numLayers + "; revision=" + app.project.revision);
        layer = comp.layers.addText(TEXT);
        log("AFTER_ADD_TEXT", "layers=" + comp.numLayers + "; revision=" + app.project.revision +
            "; returned=" + (layer ? "object" : "undefined/null"));

        if (!layer) { throw new Error("addText returned no layer"); }

        var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var td = p.value;
        td.fontObject = jpFont;
        p.setValue(td);
        log("AFTER_WHOLE_JP_FONT", "revision=" + app.project.revision);

        var beforeRead = p.value;
        log("READBACK_BEFORE_RANGE",
            "0_3=" + rangeFontPS(beforeRead, 0, 3) +
            "; 4_7=" + rangeFontPS(beforeRead, 4, 7) +
            "; whole=" + fontPS(safe(function () { return beforeRead.fontObject; }, null)));

        
        log("NO_RANGE_ASSIGNMENT", "control");
        var afterRead = p.value;
        log("READBACK_CONTROL",
            "0_3=" + rangeFontPS(afterRead, 0, 3) +
            "; 4_7=" + rangeFontPS(afterRead, 4, 7) +
            "; whole=" + fontPS(safe(function () { return afterRead.fontObject; }, null)));
        

        log("BEFORE_OPEN_IN_VIEWER", "layers=" + comp.numLayers + "; revision=" + app.project.revision);
        comp.openInViewer();
        log("AFTER_OPEN_IN_VIEWER", "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        log("FINAL_SOURCE_TEXT", safe(function () { return p.value.text; }, "<unavailable>"));
        log("RESULT", "SCRIPT_COMPLETED");
    } catch (e) {
        firstError = e;
        log("THROW", e.toString() + "; line=" + e.line +
            "; layers=" + safe(function () { return comp.numLayers; }, "<unavailable>") +
            "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>"));
        log("RESULT", "SCRIPT_EXCEPTION");
    }

    var out = File.saveDialog("Save F03 isolation log", "Text:*.txt");
    if (out) {
        if (!/\.txt$/i.test(out.name)) { out = new File(out.fsName + ".txt"); }
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
        "Script result: " + (firstError ? "SCRIPT_EXCEPTION" : "SCRIPT_COMPLETED") + "\n" +
        "If BIB 83::3 appeared while opening/evaluating the composition, record it separately with a screenshot.\n" +
        "Do not infer pass/fail from script completion alone."
    );
}());
