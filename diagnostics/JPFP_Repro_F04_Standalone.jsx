#target aftereffects

/*
Project 9-A — minimal standalone reproducer for the first BIB 83::3 boundary.
DISPOSABLE PROJECT ONLY.

Purpose:
- Test whether the exact F04 input alone is sufficient to reproduce BIB 83::3.
- No font enumeration.
- No explicit font assignment.
- No missing-font setup.
- No CharacterRange operations.
- No undo group.
- No baseline fixture changes.

Run only in a fresh After Effects 26.5 process/project after an ASCII smoke test passes.
*/

(function JPFP_Repro_F04_Standalone() {
    var TOOL = "JPFP — F04 Standalone BIB Reproducer";
    var TEXT = "「日本語」—ABC・123！？";

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

    if (!app.project) {
        app.newProject();
    }

    if (!confirm(
        TOOL + "\n\n" +
        "This test creates one disposable composition and attempts exactly one addText call.\n" +
        "Use only in a fresh throwaway project. Continue?"
    )) {
        return;
    }

    var lines = [];
    function log(label, value) {
        lines.push(stamp() + "\t" + label + "\t" + clean(value));
    }

    log("HOST_AE_VERSION", safe(function () { return app.version; }, "<unavailable>"));
    log("HOST_BUILD", safe(function () { return app.buildNumber; }, "<unavailable>"));
    log("HOST_LOCALE", safe(function () { return app.isoLanguage; }, "<unavailable>"));
    log("HOST_OS", safe(function () { return $.os; }, "<unavailable>"));
    log("INPUT", TEXT);

    var comp = null;
    var layer = null;
    var thrown = null;
    var beforeMs = 0;
    var afterMs = 0;

    try {
        comp = app.project.items.addComp("JPFP_F04_STANDALONE__DISPOSABLE", 1920, 1080, 1, 5, 30);
        log("COMP_CREATED", "layers=" + comp.numLayers + "; revision=" + app.project.revision);

        log("BEFORE_ADD_TEXT", "layers=" + comp.numLayers + "; revision=" + app.project.revision);
        beforeMs = new Date().getTime();

        layer = comp.layers.addText(TEXT);

        afterMs = new Date().getTime();
        log("AFTER_ADD_TEXT",
            "layers=" + comp.numLayers +
            "; revision=" + app.project.revision +
            "; returned=" + (layer ? "object" : "undefined/null") +
            "; elapsed_ms=" + (afterMs - beforeMs));

        if (layer) {
            log("RETURNED_LAYER_NAME", safe(function () { return layer.name; }, "<unavailable>"));
            log("RETURNED_SOURCE_TEXT", safe(function () {
                return layer.property("ADBE Text Properties")
                    .property("ADBE Text Document").value.text;
            }, "<unavailable>"));
            log("RETURNED_FONT", safe(function () {
                var td = layer.property("ADBE Text Properties")
                    .property("ADBE Text Document").value;
                return td.fontObject ? td.fontObject.postScriptName : td.font;
            }, "<unavailable>"));
        }
    } catch (e) {
        thrown = e;
        afterMs = new Date().getTime();
        log("THROW_ADD_TEXT", e.toString() + "; line=" + e.line +
            "; layers=" + safe(function () { return comp.numLayers; }, "<unavailable>") +
            "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>") +
            "; elapsed_ms=" + (beforeMs ? (afterMs - beforeMs) : "<unavailable>"));
    }

    log("RESULT",
        thrown ? "SCRIPT_EXCEPTION" :
        layer ? "ADD_TEXT_RETURNED_LAYER" :
        "ADD_TEXT_RETURNED_NO_LAYER");

    var out = File.saveDialog("Save F04 standalone reproduction log", "Text:*.txt");
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
        "Result: " + (thrown ? "SCRIPT_EXCEPTION" : layer ? "ADD_TEXT_RETURNED_LAYER" : "ADD_TEXT_RETURNED_NO_LAYER") + "\n" +
        "Layers: " + safe(function () { return comp.numLayers; }, "<unavailable>") + "\n" +
        "Revision: " + safe(function () { return app.project.revision; }, "<unavailable>") + "\n\n" +
        "If BIB 83::3 appeared during addText, preserve a screenshot and note that separately; BIB may be a host warning rather than a JavaScript exception."
    );
}());
