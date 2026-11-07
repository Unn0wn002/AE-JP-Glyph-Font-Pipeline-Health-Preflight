#target aftereffects
// Throwaway-project only. Isolates which way of making an empty text layer fails on this AE build.
// AE warning dialogs are suppressed during each attempt so a bad variant cannot loop; results go to a file.
(function () {
    var lines = ["aeVersion=" + app.version];
    function readText(layer) {
        try { return "text=[" + layer.property("ADBE Text Properties").property("ADBE Text Document").value.text + "]"; }
        catch (e) { return "read THREW: " + e; }
    }
    function attempt(label, build) {
        var comp = app.project.items.addComp("ISOLATE_" + label, 640, 360, 1, 2, 30);
        app.beginSuppressDialogs();
        var layer = null, err = "";
        try { layer = build(comp); } catch (e) { err = String(e); }
        app.endSuppressDialogs(false);
        lines.push(label + "\tlayers=" + comp.numLayers + "\tthrew=" + (err || "no") + "\t" + (layer ? readText(layer) : "no layer"));
    }
    app.beginUndoGroup("isolate empty text");
    try {
        attempt("A_addText_empty", function (c) { return c.layers.addText(""); });
        attempt("B_addText_noarg", function (c) { return c.layers.addText(); });
        attempt("C_space_then_clear", function (c) {
            var l = c.layers.addText(" ");
            var p = l.property("ADBE Text Properties").property("ADBE Text Document");
            var td = p.value; td.text = ""; p.setValue(td);
            return l;
        });
        attempt("D_addText_plain", function (c) { return c.layers.addText("x"); });
    } finally {
        app.endUndoGroup();
    }
    var f = new File("C:/Users/unn0w/Downloads/02_Projects/_glyph_panel_qa_20261029/isolate-result.txt");
    f.encoding = "UTF-8";
    if (f.open("w")) { f.write(lines.join("\n") + "\n"); f.close(); }
}());
