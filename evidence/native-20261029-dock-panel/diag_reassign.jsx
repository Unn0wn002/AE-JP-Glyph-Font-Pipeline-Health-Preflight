#target aftereffects
// Read-only diagnostic: can $.global.alert and File.saveDialog be reassigned and restored? No project access.
// Every step is logged as plain text lines; any error is logged instead of raised.
(function () {
    var lines = [];
    function log(s) { lines.push(String(s)); }
    function attempt(label, fn) { try { fn(); } catch (e) { log(label + " THREW: " + e); } }
    attempt("version", function () { log("aeVersion=" + app.version + " build=" + app.buildName + " " + app.buildNumber); });
    function probe(label, holder, key) {
        var original, stub = function () { return "stub"; };
        attempt(label + " read", function () { original = holder[key]; log(label + " typeofBefore=" + (typeof original)); });
        attempt(label + " assign", function () { holder[key] = stub; });
        attempt(label + " sticks", function () { log(label + " sticks=" + (holder[key] === stub)); });
        attempt(label + " restore", function () { holder[key] = original; });
        attempt(label + " restored", function () { log(label + " restored=" + (holder[key] === original)); });
    }
    probe("$.global.alert", $.global, "alert");
    probe("File.saveDialog", File, "saveDialog");
    attempt("globalIsThis", function () { log("globalIsThis=" + ($.global === this)); });
    attempt("bareAlert", function () { log("bareAlertSameAsGlobal=" + (alert === $.global.alert)); });
    attempt("JSON", function () { log("typeof JSON=" + (typeof JSON)); });
    var f = new File("C:/Users/unn0w/Downloads/02_Projects/_glyph_panel_qa_20261029/diag-result.txt");
    f.encoding = "UTF-8";
    if (f.open("w")) { f.write(lines.join("\n") + "\n"); f.close(); }
}());
