#target aftereffects
// Throwaway-project only: adds one comp with two plain text layers (default font, no font changes) and opens it.
(function () {
    app.beginUndoGroup("JPFP panel check comp");
    try {
        var comp = app.project.items.addComp("JPFP_PANEL_CHECK__DISPOSABLE", 1920, 1080, 1, 5, 30);
        comp.layers.addText("ABC 123").name = "[C02] LATIN";
        comp.layers.addText("日本語の字幕です。ABC 123").name = "[C01] JP";
        comp.openInViewer();
    } finally {
        app.endUndoGroup();
    }
}());
