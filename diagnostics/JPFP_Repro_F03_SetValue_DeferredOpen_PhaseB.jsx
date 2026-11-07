#target aftereffects

/*
Project 9-A — F03 two-phase isolation, PHASE B.
Run in the SAME AE process/project after Phase A and the fixed unopened observation interval.

Purpose:
- Find the exact disposable comp created by Phase A.
- Record Source Text state before display.
- Open the composition.
- Record Source Text state immediately after openInViewer returns.
*/

(function JPFP_F03_DeferredOpen_PhaseB() {
    var TOOL = "JPFP — F03 Deferred Open Phase B";
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

    var out = File.saveDialog("Save Phase B deferred-open log BEFORE opening composition", "Text:*.txt");
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
    for (var i = 1; app.project && i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item && item instanceof CompItem && item.name === COMP_NAME) {
            comp = item;
            break;
        }
    }

    log("CASE", "F03_DEFERRED_OPEN_PHASE_B");
    log("HOST_AE_VERSION", safe(function () { return app.version; }, "<unavailable>"));
    log("HOST_BUILD", safe(function () { return app.buildNumber; }, "<unavailable>"));

    if (!comp) {
        log("RESULT", "TARGET_COMP_NOT_FOUND");
        flush();
        alert(TOOL + "\n\nTarget Phase A composition not found.");
        return;
    }

    var layer = safe(function () { return comp.layer(1); }, null);
    var p = layer ? layer.property("ADBE Text Properties").property("ADBE Text Document") : null;

    log("PRE_OPEN", "layers=" + comp.numLayers +
        "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>") +
        "; property=" + (p ? describeDoc(p.value) : "<no-source-text>"));

    flush();

    try {
        log("BEFORE_OPEN_IN_VIEWER", "revision=" + app.project.revision);
        comp.openInViewer();
        log("AFTER_OPEN_IN_VIEWER", "revision=" + app.project.revision);
        log("POST_OPEN_PROPERTY", p ? describeDoc(p.value) : "<no-source-text>");
        log("RESULT", "OPEN_RETURNED");
    } catch (e) {
        log("THROW_OPEN", e.toString() + "; line=" + e.line +
            "; revision=" + safe(function () { return app.project.revision; }, "<unavailable>"));
        log("RESULT", "OPEN_SCRIPT_EXCEPTION");
    }

    flush();

    // No final alert: return control immediately so any BIB surfacing after display
    // can be timed against the OPEN boundary without an alert-dismissal confounder.
}());
