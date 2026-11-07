#target aftereffects
/* MUTATING NATIVE CONTROL. Empty disposable project only. Never a product scan. */
(function () {
    if (!app.project || app.project.numItems !== 0) {
        alert("BLOCKED: ASCII smoke requires an empty disposable project.");
        return;
    }
    var started = new Date().getTime();
    var lines = ["NATIVE ASCII CONTROL; mutating fixture setup, not scanner validation",
        "AE version\t" + app.version, "AE build\t" + app.buildNumber,
        "AE build name\t" + app.buildName, "Locale\t" + app.isoLanguage,
        "OS\t" + $.os, "Project items before\t" + app.project.numItems,
        "Revision before\t" + app.project.revision];
    try {
        var comp = app.project.items.addComp("JPFP_BETA_ASCII_SMOKE__DISPOSABLE", 640, 360, 1, 2, 24);
        var layer = comp.layers.addText("ABC 123");
        if (!layer) { throw new Error("addText returned no layer"); }
        var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
        lines.push("Actual Source Text\t" + p.value.text);
        lines.push("Layer count\t" + comp.numLayers);
        lines.push("Result\t" + (p.value.text === "ABC 123" && comp.numLayers === 1 ? "PASS" : "FAIL"));
        comp.openInViewer();
    } catch (e) {
        lines.push("Result\tFAIL", "Exception\t" + e.toString() + "; line=" + e.line);
    }
    lines.push("Project items after\t" + app.project.numItems,
        "Revision after\t" + app.project.revision,
        "Elapsed ms\t" + (new Date().getTime() - started));
    var root = new File($.fileName).parent.parent.parent;
    var folder = new Folder(root.fsName + "/evidence/native-20261017");
    try {
        if (!folder.exists && !folder.create()) { throw new Error("Cannot create evidence folder"); }
        var out = new File(folder.fsName + "/ascii-smoke.txt");
        out.encoding = "UTF-8";
        if (!out.open("w")) { throw new Error("Cannot open evidence log: " + out.error); }
        var written = out.write(lines.join("\n"));
        var closed = out.close();
        if (!written || !closed) { throw new Error("Log write/close failed"); }
        alert(lines.join("\n") + "\nLog export OK");
    } catch (exportError) {
        alert(lines.join("\n") + "\nLOG EXPORT FAILED: " + exportError.toString());
    }
}());
