#target aftereffects
/* Read-only native evidence display. No fixtures, export, or project mutation. */
(function () {
    var lines = ["JPFP native state (read-only; not a complete fixture validation)"];
    function capture(label, read) {
        try { lines.push(label + " = " + String(read())); }
        catch (e) { lines.push(label + " = UNKNOWN: " + e.toString()); }
    }
    capture("AE version", function () { return app.version; });
    capture("AE build name", function () { return app.buildName; });
    capture("AE build number", function () { return app.buildNumber; });
    capture("Locale", function () { return app.isoLanguage; });
    capture("OS", function () { return $.os; });
    capture("Project items", function () { return app.project.numItems; });
    capture("Project revision", function () { return app.project.revision; });
    capture("Project file", function () { return app.project.file ? app.project.file.name : "UNSAVED_DISPOSABLE"; });
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { lines.push("Active composition = NONE"); }
    else {
        capture("Composition", function () { return comp.name; });
        capture("Composition ID", function () { return comp.id; });
        capture("Layer count", function () { return comp.numLayers; });
        capture("Time", function () { return comp.time; });
        for (var i = 1; i <= comp.numLayers && i <= 12; i++) {
            var layer = comp.layer(i);
            capture("Layer " + i + " ID/name", function () { return layer.id + " / " + layer.name; });
            var group = layer.property("ADBE Text Properties");
            if (group) {
                var p = group.property("ADBE Text Document");
                capture("Source Text", function () { return p.value.text; });
                capture("Keys/expression", function () { return p.numKeys + " / " + p.expressionEnabled; });
                capture("Font at [0,1)", function () {
                    var font = p.value.characterRange(0, 1).fontObject;
                    return font.postScriptName + " #" + font.fontID + " substitute=" + font.isSubstitute;
                });
            }
        }
    }
    alert(lines.join("\n"));
}());
