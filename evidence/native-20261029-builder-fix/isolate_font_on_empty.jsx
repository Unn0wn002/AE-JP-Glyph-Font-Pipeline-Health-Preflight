#target aftereffects
// Throwaway-project only. Isolates setting fontObject on empty vs non-empty text, as the fixture builder does.
// AE warning dialogs are suppressed during each attempt; results go to a file.
(function () {
    var lines = ["aeVersion=" + app.version];
    function jpFont() {
        var g = app.fonts.allFonts;
        for (var i = 0; i < g.length; i++) { for (var j = 0; j < g[i].length; j++) {
            try { if (g[i][j].hasGlyphsFor("日本語。") === true) { return g[i][j]; } } catch (e) {}
        } }
        return null;
    }
    var font = jpFont();
    lines.push("jpFont=" + (font ? font.postScriptName : "none"));
    function readText(layer) {
        try { return "text=[" + layer.property("ADBE Text Properties").property("ADBE Text Document").value.text + "]"; }
        catch (e) { return "read THREW: " + e; }
    }
    function attempt(label, text) {
        var comp = app.project.items.addComp("ISOLATE_FONT_" + label, 640, 360, 1, 2, 30);
        var layer = comp.layers.addText(text), err = "", warn = "";
        app.beginSuppressDialogs();
        try {
            var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
            var td = p.value; td.fontObject = font; p.setValue(td);
        } catch (e) { err = String(e); }
        try { app.endSuppressDialogs(false); } catch (e2) { warn = String(e2); }
        var exists = false; try { exists = (comp.numLayers === 1 && layer.name.length > 0); } catch (e3) { exists = "THREW " + e3; }
        lines.push(label + "\tthrew=" + (err || "no") + "\tendSuppress=" + (warn || "ok") + "\tlayerAlive=" + exists + "\t" + readText(layer));
    }
    app.beginUndoGroup("isolate font on empty");
    try {
        attempt("E_font_on_nonempty", "日本語");
        attempt("F_font_on_empty", "");
    } finally {
        app.endUndoGroup();
    }
    var f = new File("C:/Users/unn0w/Downloads/02_Projects/_glyph_panel_qa_20261029/isolate-font-result.txt");
    f.encoding = "UTF-8";
    if (f.open("w")) { f.write(lines.join("\n") + "\n"); f.close(); }
}());
