#target aftereffects

/*
JP Font and Glyph Preflight — dockable panel wrapper (beta).
Hosts the UNCHANGED scanner src/JPFP_Session1_Probe.jsx inside a ScriptUI panel.
The scanner is run unchanged with its alert() shadowed and its report-save dialog replaced, so both are
captured and shown in the panel instead of popping up; the report is saved only when Export is pressed.
This wrapper never touches the AE project. It only writes one temporary report file.
Display: one language at a time (Japanese or English, remembered), a compact main view (status and counts) and an
optional details area (description and the scanner's own text). The scanner's text itself is shown as the scanner wrote it.
Install: put this file in Scripts/ScriptUI Panels and the scanner next to it or in a JPFP subfolder.
*/
(function JPFP_Session1_Panel(thisObj) {
    var TOOL = "JP Font/Glyph Preflight (beta panel)";
    var PROBE_NAME = "JPFP_Session1_Probe.jsx";
    var SETTINGS_SECTION = "JPFPGlyphPanel";
    var NL = String.fromCharCode(10);

    // ---- Texts: every user-facing sentence of the panel in English and Japanese (the scanner's own text is not here) ----
    var TEXT = {
        en: {
            desc: "Static-text scan of the ACTIVE composition only. Read-only. It does not scan other compositions, nested compositions, or animated / expression text.",
            scan: "Scan composition", langButton: "日本語", detailsShow: "Show details", detailsHide: "Hide details", exportButton: "Export report...",
            ready: "Ready.", scanning: "Scanning...",
            doneOk: "Scan complete: no findings in the checked text.", doneWarn: "Scan complete: review needed.", doneBad: "Scan complete: problems found.",
            doneNothing: "Scan complete: nothing was checked.", doneUnknown: "Scan complete. Open details to read the report.",
            noReport: "No report produced.", blocked: "Blocked: open details for the message.", error: "Error: open details for the message.",
            chipLayers: "Text layers checked: {n}", chipProblems: "Problems: {n}", chipReview: "Review needed: {n}", chipNotChecked: "Not checked: {n}", chipGaps: "Coverage gaps: {n}",
            noteLabel: "Panel note:",
            hintNoComp: "No composition is active. Select ONE composition in the Project panel, then scan again. If this panel shares a tab group with the Composition viewer, move it to its own group so the composition stays visible.",
            hintNothing: "No static text layers were found in this composition, so nothing was checked. Animated or expression text and non-text layers are not scanned. Add static text, or select another composition.",
            hintReady: "Report ready. Nothing is saved until you press Export report...",
            exportOk: "Report exported.", exportCancelled: "Export cancelled.", exportFailed: "Export failed.",
            probeMissing: "Scanner {name} not found next to the panel or in a JPFP folder.", probeUnreadable: "Could not read the scanner file.",
            dialogBlocked: "This After Effects build does not allow capturing the report dialog; scan not run.",
            noOutcome: "Scanner finished without an outcome message; treat the result as incomplete.", scannerRaised: "Scanner raised: {detail}", restoreFailed: " [saveDialog restore failed]",
            noReportToExport: "No report to export yet.", exportCancelledDetail: "Export cancelled; no file saved.", openFailed: "Could not open output file: {detail}",
            unknownFileError: "unknown file error", writeFailed: "Report write/close failed; the file may be incomplete: {path}", saved: "Saved: {path}", exportRaised: "Export failed: {detail}",
            dialogTitle: "Export JP Font/Glyph Preflight beta report"
        },
        ja: {
            desc: "アクティブなコンポのみの静的テキスト検査です（読み取り専用）。他のコンポ、ネストされたコンポ、アニメーションやエクスプレッションのテキストは検査しません。",
            scan: "コンポをスキャン", langButton: "English", detailsShow: "詳細を表示", detailsHide: "詳細を隠す", exportButton: "レポートを出力...",
            ready: "準備完了。", scanning: "スキャン中...",
            doneOk: "スキャン完了：確認範囲に検出なし。", doneWarn: "スキャン完了：確認が必要です。", doneBad: "スキャン完了：問題があります。",
            doneNothing: "スキャン完了：検査対象なし。", doneUnknown: "スキャン完了。詳細を開いてレポートを確認してください。",
            noReport: "レポートなし。", blocked: "ブロック：詳細を開いてメッセージを確認してください。", error: "エラー：詳細を開いてメッセージを確認してください。",
            chipLayers: "検査レイヤー: {n}", chipProblems: "問題: {n}", chipReview: "要確認: {n}", chipNotChecked: "未確認: {n}", chipGaps: "カバレッジ不足: {n}",
            noteLabel: "パネルのメモ:",
            hintNoComp: "アクティブなコンポがありません。プロジェクトパネルでコンポを1つだけ選んでから、もう一度スキャンしてください。このパネルがコンポジションビューアと同じタブグループにある場合は、コンポが見えるように別のグループへ移動してください。",
            hintNothing: "このコンポには静的テキストレイヤーがないため、何も検査されていません。アニメーションやエクスプレッションのテキスト、テキスト以外のレイヤーは検査されません。静的テキストを追加するか、別のコンポを選んでください。",
            hintReady: "レポート準備完了。保存は「レポートを出力...」を押したときだけです。",
            exportOk: "レポートを出力しました。", exportCancelled: "出力を取り消しました。", exportFailed: "出力に失敗しました。",
            probeMissing: "スキャナ {name} がパネルの隣または JPFP フォルダに見つかりません。", probeUnreadable: "スキャナを読み込めません。",
            dialogBlocked: "この After Effects ではレポートのダイアログを捕捉できないため、スキャンを実行しませんでした。",
            noOutcome: "スキャナが結果メッセージなしで終了しました。結果は不完全として扱ってください。", scannerRaised: "スキャナでエラーが発生しました: {detail}", restoreFailed: "［saveDialog の復元に失敗］",
            noReportToExport: "出力するレポートがまだありません。", exportCancelledDetail: "出力を取り消しました。ファイルは保存されていません。", openFailed: "出力ファイルを開けませんでした: {detail}",
            unknownFileError: "不明なファイルエラー", writeFailed: "レポートの書き込みまたは終了に失敗しました。ファイルが不完全な可能性があります: {path}", saved: "保存しました: {path}", exportRaised: "出力に失敗しました: {detail}",
            dialogTitle: "JP Font/Glyph Preflight ベータレポートを出力"
        }
    };

    function safeSetting(read, fallback) { try { return read(); } catch (ignored) { return fallback; } }
    var lang = safeSetting(function () {
        var value = app.settings.haveSetting(SETTINGS_SECTION, "lang") ? app.settings.getSetting(SETTINGS_SECTION, "lang") : "ja";
        return (value === "en" || value === "ja") ? value : "ja";
    }, "ja");
    // Fills {name} style placeholders; a missing key falls back to English, then to the key.
    function T(key, params) {
        var table = TEXT[lang] || TEXT.en;
        var template = table[key];
        if (template === undefined) { template = TEXT.en[key]; }
        if (template === undefined) { return key; }
        if (params) {
            for (var name in params) {
                if (params.hasOwnProperty(name)) { template = template.split("{" + name + "}").join(String(params[name])); }
            }
        }
        return template;
    }

    function errorText(e) { try { return String(e); } catch (ignored) { return "Error detail unavailable"; } }

    function locateProbe() {
        var here = null;
        try { here = new File($.fileName).parent; } catch (e) { return null; }
        if (!here) { return null; }
        var candidates = [new File(here.fsName + "/JPFP/" + PROBE_NAME), new File(here.fsName + "/" + PROBE_NAME)];
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i].exists) { return candidates[i]; }
        }
        return null;
    }

    function tempReportFile() { return new File(Folder.temp.fsName + "/JPFP_panel_report.txt"); }

    function readText(file) {
        try {
            file.encoding = "UTF-8";
            if (file.open("r") !== true) { return null; }
            var text = file.read();
            file.close();
            return text;
        } catch (e) {
            try { file.close(); } catch (ignored) {}
            return null;
        }
    }

    // Returns { state: "DONE"|"BLOCKED"|"ERROR", alerts: [], report: string|null, details: [{ key, params }] }.
    // The details are text keys, so a language switch can redraw them.
    function runScan() {
        var probe = locateProbe();
        if (!probe) {
            return { state: "ERROR", alerts: [], report: null, details: [{ key: "probeMissing", params: { name: PROBE_NAME } }] };
        }
        var tmp = tempReportFile();
        try {
            // Truncate any stale report so an old file can never be mistaken for this scan's output.
            tmp.encoding = "UTF-8";
            if (tmp.open("w") === true) { tmp.close(); }
        } catch (ignoredTruncate) { try { tmp.close(); } catch (ignoredClose) {} }

        var alerts = [];
        var originalDialog = File.saveDialog;
        function stubAlert(message) { alerts.push(String(message)); }
        function stubDialog() { return tmp; }
        var outcome = { state: "DONE", alerts: alerts, report: null, details: [] };
        try {
            // alert() cannot be reassigned in After Effects 26.5, so the scanner text runs with its own `alert` shadowed.
            var source = readText(probe);
            if (source === null || !source.length) {
                outcome.state = "ERROR";
                outcome.details.push({ key: "probeUnreadable" });
            } else {
                source = source.replace(/^﻿/, "").replace(/^#target[^\r\n]*/, "");
                File.saveDialog = stubDialog;
                if (File.saveDialog !== stubDialog) {
                    outcome.state = "BLOCKED";
                    outcome.details.push({ key: "dialogBlocked" });
                } else {
                    // eval runs ONLY the installed scanner file (never user data or text read from a project) so that its alert()
                    // can be shadowed; see the comment above. The scanner itself is the unchanged, hash-recorded probe.
                    var scanner = eval("(function (alert) {\n" + source + "\n})");
                    scanner(stubAlert);
                }
            }
        } catch (e) {
            outcome.state = "ERROR";
            outcome.details.push({ key: "scannerRaised", params: { detail: errorText(e) } });
        } finally {
            try { File.saveDialog = originalDialog; } catch (restoreDialogErr) { outcome.details.push({ key: "restoreFailed" }); }
        }
        if (outcome.state === "DONE") {
            var text = tmp.exists ? readText(tmp) : null;
            outcome.report = (text && text.length) ? text : null;
            if (!alerts.length) {
                outcome.state = "ERROR";
                outcome.details.push({ key: "noOutcome" });
            }
        }
        return outcome;
    }

    // Returns { ok, cancelled, key, params }: the detail is a text key so a language switch can redraw it.
    function exportReport(reportText) {
        if (!reportText) { return { ok: false, cancelled: false, key: "noReportToExport" }; }
        var out = null;
        try {
            out = File.saveDialog(T("dialogTitle"), "Text:*.txt");
            if (!out) { return { ok: false, cancelled: true, key: "exportCancelledDetail" }; }
            if (!/\.txt$/i.test(out.name)) { out = new File(out.fsName + ".txt"); }
            out.encoding = "UTF-8"; out.lineFeed = "Windows";
            if (out.open("w") !== true) { return { ok: false, cancelled: false, key: "openFailed", params: { detail: (out.error || T("unknownFileError")) } }; }
            var wrote = out.write(reportText);
            var closed = out.close();
            if (wrote !== true || closed !== true) { return { ok: false, cancelled: false, key: "writeFailed", params: { path: out.fsName } }; }
            return { ok: true, cancelled: false, key: "saved", params: { path: out.fsName } };
        } catch (e) {
            try { if (out) { out.close(); } } catch (ignored) {}
            return { ok: false, cancelled: false, key: "exportRaised", params: { detail: errorText(e) } };
        }
    }

    // Reads the counts out of the scanner's own summary text (display only; the scanner is unchanged). Returns
    // { parsed: false } when the text does not contain them, so an unknown format is never shown as a result.
    function summarizeAlerts(text) {
        var counts = /Problems:\s*(\d+);\s*review needed:\s*(\d+);\s*not checked:\s*(\d+)/i.exec(text);
        if (!counts) { return { parsed: false }; }
        var coverage = /Coverage verified\/skipped\/failed:\s*(\d+)\/(\d+)\/(\d+)/i.exec(text);
        var layers = /Static text layers checked:\s*(\d+)/i.exec(text);
        return {
            parsed: true,
            layersChecked: layers ? Number(layers[1]) : null,
            problems: Number(counts[1]), review: Number(counts[2]), notChecked: Number(counts[3]),
            coverageGaps: coverage ? Number(coverage[2]) + Number(coverage[3]) : 0
        };
    }

    // The status colour follows the counts: green only when at least one text layer was checked and nothing needs a look;
    // amber for review / not checked / coverage gaps or when NOTHING was checked; red for problems; grey when the counts or
    // the number of checked layers could not be read. "No findings" in an empty scan must never look like an all-clear.
    function toneFor(summary) {
        if (!summary.parsed) { return "INFO"; }
        if (summary.problems > 0) { return "BAD"; }
        if (summary.review > 0 || summary.notChecked > 0 || summary.coverageGaps > 0) { return "WARN"; }
        if (summary.layersChecked === 0) { return "WARN"; }
        if (summary.layersChecked === null) { return "INFO"; }
        return "OK";
    }

    function statusKeyFor(summary) {
        var tone = toneFor(summary);
        if (summary.parsed && summary.layersChecked === 0 && tone === "WARN") { return "doneNothing"; }
        if (tone === "OK") { return "doneOk"; }
        if (tone === "WARN") { return "doneWarn"; }
        if (tone === "BAD") { return "doneBad"; }
        return "doneUnknown";
    }

    function buildUI(host) {
        var win = (host instanceof Panel) ? host : new Window("palette", TOOL, undefined, { resizeable: true });
        if (!win) { return win; }
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.margins = 10;
        win.spacing = 8;

        // Main view: scan + language, one status line, the counts, a details toggle and Export.
        var topRow = win.add("group");
        topRow.orientation = "row";
        topRow.alignChildren = ["fill", "center"];
        var scan = topRow.add("button", undefined, T("scan"));
        scan.alignment = ["fill", "center"];
        var langButton = topRow.add("button", undefined, T("langButton"));
        langButton.alignment = ["right", "center"];
        try { langButton.preferredSize.width = 68; } catch (ignoredLangWidth) {}
        var status = win.add("statictext", undefined, T("ready"));
        status.alignment = ["fill", "top"];

        // Count lines under the status; a zero count stays grey. Hidden until a scan produced counts.
        var chips = win.add("group");
        chips.orientation = "column";
        chips.alignChildren = ["left", "top"];
        chips.spacing = 2;
        var chipLayers = chips.add("statictext", undefined, "");
        var chipProblems = chips.add("statictext", undefined, "");
        var chipReview = chips.add("statictext", undefined, "");
        var chipNotChecked = chips.add("statictext", undefined, "");
        var chipGaps = chips.add("statictext", undefined, "");
        chipLayers.characters = chipProblems.characters = chipReview.characters = chipNotChecked.characters = chipGaps.characters = 36;

        // Details (hidden by default): the description and the scanner's own text.
        var detailsToggle = win.add("button", undefined, T("detailsShow"));
        var details = win.add("group");
        details.orientation = "column";
        details.alignChildren = ["fill", "top"];
        details.spacing = 6;
        var description = details.add("statictext", undefined, T("desc"), { multiline: true });
        var results = details.add("edittext", undefined, "", { multiline: true, readonly: true, scrolling: true });
        results.preferredSize = [300, 200];

        var exportButton = win.add("button", undefined, T("exportButton"));
        exportButton.enabled = false;
        var lastReport = null;

        // Readability: bold lines coloured by outcome (OK green, WARN amber, BAD red, INFO grey). Display only.
        var TONE_RGB = { OK: [0.40, 0.85, 0.50, 1], WARN: [1, 0.78, 0.30, 1], BAD: [1, 0.42, 0.42, 1], INFO: [0.85, 0.85, 0.85, 1] };
        function paint(element, tone, size) {
            try { element.graphics.font = ScriptUI.newFont(element.graphics.font.name, "BOLD", size); } catch (ignoredFont) {}
            try {
                var gfx = element.graphics;
                gfx.foregroundColor = gfx.newPen(gfx.PenType.SOLID_COLOR, TONE_RGB[tone] || TONE_RGB.INFO, 1);
            } catch (ignoredColor) {}
        }
        // Shows or hides a block and gives it a height: hidden blocks take no room in the column.
        function showBlock(element, show, height) {
            try {
                element.visible = show;
                element.preferredSize.height = show ? height : 0;
                element.maximumSize.height = show ? 10000 : 0;
            } catch (ignoredBlock) {}
        }
        function relayout() { try { win.layout.layout(true); } catch (ignoredLayout) {} }

        // What is shown is described by this state, so a language switch can redraw it without scanning again.
        var view = { statusKey: "ready", tone: "INFO", summary: null, alertsText: "", details: [], notes: [], exportDetail: null, detailsOpen: false, exportKey: null, exportTone: "INFO" };

        function applyChips() {
            var summary = view.summary;
            if (!summary || !summary.parsed) {
                chipLayers.text = chipProblems.text = chipReview.text = chipNotChecked.text = chipGaps.text = "";
                showBlock(chips, false, 0);
                return;
            }
            showBlock(chips, true, 90);
            chipLayers.text = summary.layersChecked === null ? "" : T("chipLayers", { n: summary.layersChecked });
            chipProblems.text = T("chipProblems", { n: summary.problems });
            chipReview.text = T("chipReview", { n: summary.review });
            chipNotChecked.text = T("chipNotChecked", { n: summary.notChecked });
            chipGaps.text = T("chipGaps", { n: summary.coverageGaps });
            paint(chipLayers, summary.layersChecked === 0 ? "WARN" : "INFO", 12);
            paint(chipProblems, summary.problems > 0 ? "BAD" : "INFO", 12);
            paint(chipReview, summary.review > 0 ? "WARN" : "INFO", 12);
            paint(chipNotChecked, summary.notChecked > 0 ? "WARN" : "INFO", 12);
            paint(chipGaps, summary.coverageGaps > 0 ? "WARN" : "INFO", 12);
        }
        // The details text: the scanner's own text as written, then the panel's own lines (errors, the export result, notes).
        function applyResults() {
            var parts = [];
            var i;
            if (view.alertsText.length) { parts.push(view.alertsText); }
            for (i = 0; i < view.details.length; i++) { parts.push(T(view.details[i].key, view.details[i].params)); }
            if (view.exportDetail) { parts.push(T(view.exportDetail.key, view.exportDetail.params)); }
            if (view.notes.length) {
                var notes = [];
                for (i = 0; i < view.notes.length; i++) { notes.push(T(view.notes[i].key, view.notes[i].params)); }
                parts.push(T("noteLabel") + NL + notes.join(NL + NL));
            }
            results.text = parts.join(NL + NL);
        }
        function applyDetails() {
            detailsToggle.text = view.detailsOpen ? T("detailsHide") : T("detailsShow");
            showBlock(details, view.detailsOpen, 280);
        }
        function render() {
            scan.text = T("scan");
            langButton.text = T("langButton");
            exportButton.text = T("exportButton");
            description.text = T("desc");
            status.text = T(view.exportKey || view.statusKey);
            paint(status, view.exportKey ? view.exportTone : view.tone, 13);
            applyChips();
            applyResults();
            applyDetails();
            relayout();
        }
        function setStatus(key, tone) { view.statusKey = key; view.tone = tone; view.exportKey = null; }

        scan.onClick = function () {
            view.summary = null; view.alertsText = ""; view.details = []; view.notes = []; view.exportDetail = null; view.exportKey = null;
            setStatus("scanning", "INFO");
            exportButton.enabled = false;
            lastReport = null;
            render();
            var outcome = runScan();
            lastReport = outcome.report;
            var body = outcome.alerts.join(NL + NL);
            view.alertsText = body;
            view.details = outcome.details;
            exportButton.enabled = !!lastReport;
            if (outcome.state === "DONE" && lastReport) {
                view.summary = summarizeAlerts(body);
                setStatus(statusKeyFor(view.summary), toneFor(view.summary));
                if (view.summary.parsed && view.summary.layersChecked === 0) { view.notes.push({ key: "hintNothing" }); }
                view.notes.push({ key: "hintReady" });
            } else if (outcome.state === "DONE") {
                setStatus("noReport", "WARN");
                if (/Open\/select a composition first/i.test(body)) { view.notes.push({ key: "hintNoComp" }); }
                view.detailsOpen = true; // the reason must be visible
            } else {
                setStatus(outcome.state === "BLOCKED" ? "blocked" : "error", "BAD");
                view.detailsOpen = true;
            }
            render();
        };
        exportButton.onClick = function () {
            var result = exportReport(lastReport);
            view.exportKey = result.ok ? "exportOk" : (result.cancelled ? "exportCancelled" : "exportFailed");
            view.exportTone = result.ok ? "OK" : (result.cancelled ? "WARN" : "BAD");
            // The path or the error goes under the scanner text, not into the one-line status.
            view.exportDetail = { key: result.key, params: result.params };
            render();
        };
        detailsToggle.onClick = function () { view.detailsOpen = !view.detailsOpen; applyDetails(); relayout(); };
        langButton.onClick = function () {
            lang = lang === "ja" ? "en" : "ja";
            try { app.settings.saveSetting(SETTINGS_SECTION, "lang", lang); } catch (ignoredSave) {}
            render();
        };

        showBlock(chips, false, 0);
        showBlock(details, false, 0);
        win.layout.layout(true);
        win.onResizing = win.onResize = function () { this.layout.resize(); };
        return win;
    }

    var built = buildUI(thisObj);
    if (built && built instanceof Window) { built.center(); built.show(); }
    return built;
}(this));
