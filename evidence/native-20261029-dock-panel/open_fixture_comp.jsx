#target aftereffects
// Opens the fixture comp in the viewer and writes the project's comp/layer inventory. No project edits.
(function () {
    var lines = [], target = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (it instanceof CompItem) {
            var names = [];
            for (var j = 1; j <= it.numLayers; j++) { names.push(it.layer(j).name); }
            lines.push(it.name + "\tlayers=" + it.numLayers + "\t" + names.join(" | "));
            if (it.name === "JPFP_S1_FIXTURES__DISPOSABLE" && !target) { target = it; }
        }
    }
    if (target) { target.openInViewer(); lines.push("OPENED " + target.name); } else { lines.push("FIXTURE COMP NOT FOUND"); }
    var f = new File("C:/Users/unn0w/Downloads/02_Projects/_glyph_panel_qa_20261029/project-inventory.txt");
    f.encoding = "UTF-8";
    if (f.open("w")) { f.write(lines.join("\n") + "\n"); f.close(); }
}());
