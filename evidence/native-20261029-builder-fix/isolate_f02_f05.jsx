#target aftereffects
// Throwaway-project only. Isolates the builder's F02 (missing font name) and F05 (Latin-only font on "A漢B")
// steps, each followed by an ordinary addText + font step. Logs to a file after every step, so the last
// line shows where AE stopped. AE warnings suppressed per step.
(function () {
    var LOG = new File("C:/Users/unn0w/Downloads/02_Projects/_glyph_panel_qa_20261029/isolate-f02-f05-result.txt");
    function log(s) { LOG.encoding = "UTF-8"; if (LOG.open("a")) { LOG.write(s + "\n"); LOG.close(); } }
    LOG.encoding = "UTF-8"; if (LOG.open("w")) { LOG.close(); }
    log("aeVersion=" + app.version);
    var only = ($.global.JPFP_ISOLATE_ONLY || "BOTH");
    function findFont(pred) {
        var g = app.fonts.allFonts;
        for (var i = 0; i < g.length; i++) { for (var j = 0; j < g[i].length; j++) {
            try { if (pred(g[i][j])) { return g[i][j]; } } catch (e) {}
        } }
        return null;
    }
    var jp = findFont(function (f) { return f.hasGlyphsFor("日本語。") === true; });
    var latinNoKanji = findFont(function (f) { return f.hasGlyphsFor("ABC") === true && f.hasGlyphsFor("漢") === false; });
    log("jpFont=" + (jp ? jp.postScriptName : "none") + "\tlatinNoKanji=" + (latinNoKanji ? latinNoKanji.postScriptName : "none"));
    function readText(layer) {
        try { return "text=[" + layer.property("ADBE Text Properties").property("ADBE Text Document").value.text + "]"; }
        catch (e) { return "read THREW: " + e; }
    }
    function step(label, fn) {
        var err = "";
        log(label + "\tSTART");
        app.beginSuppressDialogs();
        try { fn(); } catch (e) { err = String(e); }
        app.endSuppressDialogs(false);
        log(label + "\tthrew=" + (err || "no"));
    }
    function followUp(comp, label) {
        var l = null;
        step(label + "_followup_addText", function () { l = comp.layers.addText("後続 ABC"); });
        step(label + "_followup_font", function () { var p = l.property("ADBE Text Properties").property("ADBE Text Document"); var td = p.value; td.fontObject = jp; p.setValue(td); });
        log(label + "_followup_read\t" + (l ? readText(l) : "no layer"));
    }
    app.beginUndoGroup("isolate F02 F05");
    try {
        // F05 first: it is the step right before the builder stops.
        var c5 = app.project.items.addComp("ISOLATE_F05", 640, 360, 1, 2, 30), l5 = null;
        step("F05_addText", function () { l5 = c5.layers.addText("A漢B"); });
        step("F05_set_latinNoKanji", function () { var p = l5.property("ADBE Text Properties").property("ADBE Text Document"); var td = p.value; td.fontObject = latinNoKanji; p.setValue(td); });
        log("F05_read\t" + readText(l5));
        followUp(c5, "F05");

        var c2 = app.project.items.addComp("ISOLATE_F02", 640, 360, 1, 2, 30), l2 = null;
        step("F02_addText", function () { l2 = c2.layers.addText("欠落フォント"); });
        step("F02_set_missing_font", function () { var p = l2.property("ADBE Text Properties").property("ADBE Text Document"); var td = p.value; td.font = "JPFP_Session1_MissingFont_PS__DO_NOT_INSTALL"; p.setValue(td); });
        log("F02_read\t" + readText(l2));
        followUp(c2, "F02");
    } finally {
        app.endUndoGroup();
    }
    log("DONE");
}());
