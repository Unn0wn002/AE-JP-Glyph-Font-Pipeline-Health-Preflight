#!/usr/bin/env node
/* Controlled tests for src/JPFP_Session1_Panel.jsx against ScriptUI/File test doubles under Node vm.
 * This is NOT host evidence: it does not prove ScriptUI docking, global reassignment or File
 * behavior in After Effects. Native validation is a separate step.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const SOURCE = fs.readFileSync(path.join(__dirname, "..", "src", "JPFP_Session1_Panel.jsx"), "utf8")
    .replace(/^#target[^\r\n]*(?:\r?\n)?/, "");
const NL = String.fromCharCode(10);

function setup(options = {}) {
    const log = { evalFiles: 0, windowsShown: 0, saveDialogCalls: 0, writes: [], removes: 0, saved: [] };
    const disk = new Map();
    if (options.probePresent !== false) { disk.set(options.probePath || "C:/AE/ScriptUI Panels/JPFP/JPFP_Session1_Probe.jsx", options.probeSource || "__probe(alert, File);"); }

    class Element {
        constructor(type, text) { this.type = type; this.text = text || ""; this.enabled = true; this.children = [];
            this.graphics = { PenType: { SOLID_COLOR: 0 }, newPen(_t, color) { return { color }; } }; }
        add(type, _b, text) { const child = new Element(type, text); this.children.push(child); return child; }
    }
    class Container extends Element {
        constructor(type, text) { super(type, text); this.layout = { layout() {}, resize() {} }; }
    }
    class Panel extends Container {}
    class Window extends Container {
        constructor(type, title) { super(type, title); }
        center() {} show() { log.windowsShown += 1; }
    }
    function File(filePath) {
        this.fsName = String(filePath); this.name = this.fsName.split(/[\\/]/).pop();
        this.parent = { fsName: this.fsName.replace(/[\\/][^\\/]*$/, "") };
        this.encoding = ""; this.lineFeed = ""; this.error = "";
        Object.defineProperty(this, "exists", { get: () => disk.has(this.fsName) });
    }
    File.prototype.open = function (mode) { this._mode = mode; if (mode === "w") { disk.set(this.fsName, ""); } return !options.openFails; };
    File.prototype.write = function (text) { disk.set(this.fsName, text); log.writes.push({ path: this.fsName, text }); return true; };
    File.prototype.read = function () { return disk.get(this.fsName) || ""; };
    File.prototype.close = function () { return true; };
    File.prototype.remove = function () { disk.delete(this.fsName); log.removes += 1; return true; };
    const realSaveDialog = function () { log.saveDialogCalls += 1; return options.exportCancel ? null : new File("C:/Users/me/export"); };
    File.saveDialog = realSaveDialog;
    const realAlert = function realAlert() { throw new Error("A real alert() must never be reached while scanning"); };

    // After Effects settings: the saved language (default for these tests is English so the texts below read as written).
    const settings = new Map();
    if (options.savedLang !== null) { settings.set("JPFPGlyphPanel/lang", options.savedLang === undefined ? "en" : options.savedLang); }
    const app = { settings: {
        haveSetting: (section, key) => settings.has(section + "/" + key),
        getSetting: (section, key) => settings.get(section + "/" + key),
        saveSetting: (section, key, value) => { settings.set(section + "/" + key, value); log.saved.push([section, key, value]); }
    } };

    const context = vm.createContext({
        Panel, Window, File, Folder: { temp: { fsName: "C:/Temp" } }, alert: realAlert, app,
        $: { fileName: "C:/AE/ScriptUI Panels/JPFP_Session1_Panel.jsx",
            evalFile() { throw new Error("The panel must not $.evalFile the scanner: that would bypass the alert shadowing"); } },
        __probe(shadowedAlert, FileCtor) {
            log.evalFiles += 1;
            if (options.probe) { options.probe({ File: FileCtor, alert: shadowedAlert, dialog: FileCtor.saveDialog, disk }); }
        }
    });
    context.$.global = vm.runInContext("this", context);
    if (options.freezeAlert) { Object.defineProperty(context, "alert", { value: realAlert, writable: false, configurable: false }); }
    if (options.freezeDialog) { Object.defineProperty(File, "saveDialog", { value: realSaveDialog, writable: false, configurable: false }); }

    const host = options.asWindow ? undefined : new Panel("panel");
    context.__host = host;
    const built = vm.runInContext("(function () {" + SOURCE.replace("}(this));", "}(__host));") + "\n}).call(this)", context);
    return { context, log, disk, settings, File, Panel, Window, host, realAlert, realSaveDialog, built };
}

// Main view: [scan + language row, status, counts, details toggle, details (description + scanner text), export].
function ui(host) {
    const [topRow, status, chips, detailsToggle, details, exportButton] = host.children;
    const [scan, langButton] = topRow.children;
    const [description, results] = details.children;
    return { topRow, scan, langButton, status, chips, detailsToggle, details, description, results, exportButton };
}

const AMBER = [1, 0.78, 0.30, 1], GREEN = [0.40, 0.85, 0.50, 1], RED = [1, 0.42, 0.42, 1], GREY = [0.85, 0.85, 0.85, 1];
// Arrays built inside the vm context have another realm prototype, so they are compared as plain JSON.
const colour = (element) => element.graphics.foregroundColor && JSON.parse(JSON.stringify(element.graphics.foregroundColor.color));
const hidden = (element) => element.visible === false;
const reportBody = (env) => { const o = env.File.saveDialog(); o.open("w"); o.write("REPORT-BODY"); o.close(); };
function scanWith(summaryText, options = {}) {
    const s = setup(Object.assign({ probe: (env) => { env.alert(summaryText); reportBody(env); } }, options));
    ui(s.host).scan.onClick();
    return Object.assign(ui(s.host), { s });
}
const lines = (...parts) => parts.join(NL);

test("docks as a Panel and does not create a floating window", () => {
    const s = setup();
    assert.equal(s.log.windowsShown, 0);
    assert.equal(s.host.children.length, 6);
    const r = ui(s.host);
    assert.equal(typeof r.scan.onClick, "function");
    assert.equal(r.exportButton.enabled, false);
});

test("successful scan: alert and save dialog are captured, nothing pops up, globals restored", () => {
    let seen;
    const s = setup({ probe: (env) => {
        seen = env;
        env.alert("SUMMARY: 2 problems");
        const out = env.File.saveDialog("x", "Text:*.txt");
        out.open("w"); out.write("REPORT-BODY"); out.close();
    } });
    const { scan, status, results, exportButton } = ui(s.host);
    scan.onClick();
    assert.equal(s.log.evalFiles, 1);
    assert.match(results.text, /SUMMARY: 2 problems/);
    assert.equal(exportButton.enabled, true);
    assert.match(status.text, /Scan complete/);
    assert.notEqual(seen.alert, s.realAlert, "stub was active during the scan");
    assert.equal(s.context.alert, s.realAlert, "alert restored");
    assert.equal(s.File.saveDialog, s.realSaveDialog, "File.saveDialog restored");
    assert.equal(s.log.saveDialogCalls, 0, "real save dialog was never called during the scan");
});

test("guard message from the scanner is shown inline, details open, and no report is offered", () => {
    const s = setup({ probe: (env) => env.alert("Open/select a composition first.") });
    const { scan, status, results, exportButton, details } = ui(s.host);
    scan.onClick();
    assert.match(results.text, /Open\/select a composition first/);
    assert.equal(exportButton.enabled, false);
    assert.match(status.text, /No report produced/);
    assert.equal(hidden(details), false, "the reason must be visible");
    assert.equal(s.context.alert, s.realAlert);
});

test("scanner exception: error shown, details open, globals still restored, no export", () => {
    const s = setup({ probe: () => { throw new Error("boom"); } });
    const { scan, status, results, exportButton, details } = ui(s.host);
    scan.onClick();
    assert.match(results.text, /Scanner raised: Error: boom/);
    assert.match(status.text, /^Error/);
    assert.equal(exportButton.enabled, false);
    assert.equal(hidden(details), false);
    assert.equal(s.context.alert, s.realAlert);
    assert.equal(s.File.saveDialog, s.realSaveDialog);
});

test("scanner that ends without an outcome message is flagged incomplete", () => {
    const s = setup({ probe: () => {} });
    const { scan, status, results } = ui(s.host);
    scan.onClick();
    assert.match(results.text, /without an outcome message/);
    assert.match(status.text, /^Error/);
});

test("when the report dialog cannot be replaced the scan is not run", () => {
    const s = setup({ freezeDialog: true, probe: () => { throw new Error("must not run"); } });
    const { scan, status, results } = ui(s.host);
    scan.onClick();
    assert.equal(s.log.evalFiles, 0);
    assert.match(status.text, /^Blocked/);
    assert.match(results.text, /scan not run/);
    assert.equal(s.File.saveDialog, s.realSaveDialog);
});

test("a read-only global alert (After Effects 26.5 behaviour) does not stop capture: the scanner's alert is shadowed", () => {
    const s = setup({ freezeAlert: true, probe: (env) => env.alert("captured despite read-only global alert") });
    const { scan, results, status } = ui(s.host);
    scan.onClick();
    assert.equal(s.log.evalFiles, 1);
    assert.match(results.text, /captured despite read-only global alert/);
    assert.doesNotMatch(status.text, /^Blocked/);
    assert.equal(s.context.alert, s.realAlert, "global alert untouched");
});

test("a BOM and the #target line are stripped before the scanner text is evaluated", () => {
    const s = setup({ probeSource: "\uFEFF#target aftereffects\n__probe(alert, File);", probe: (env) => env.alert("ran") });
    ui(s.host).scan.onClick();
    assert.equal(s.log.evalFiles, 1);
    assert.match(ui(s.host).results.text, /ran/);
});

test("missing scanner file is reported and nothing is evaluated", () => {
    const s = setup({ probePresent: false });
    const { scan, status, results } = ui(s.host);
    scan.onClick();
    assert.equal(s.log.evalFiles, 0);
    assert.match(results.text, /not found/);
    assert.match(status.text, /^Error/);
});

test("scanner next to the panel is found when there is no JPFP subfolder", () => {
    const s = setup({ probePath: "C:/AE/ScriptUI Panels/JPFP_Session1_Probe.jsx", probe: (env) => env.alert("ok") });
    ui(s.host).scan.onClick();
    assert.equal(s.log.evalFiles, 1);
});

test("a stale temp report is truncated before each scan", () => {
    const s = setup({ probe: (env) => env.alert("only a guard message") });
    s.disk.set("C:/Temp/JPFP_panel_report.txt", "STALE");
    ui(s.host).scan.onClick();
    assert.equal(s.disk.get("C:/Temp/JPFP_panel_report.txt"), "", "stale report truncated before the scan");
    assert.equal(ui(s.host).exportButton.enabled, false, "stale report must not be exportable");
});

test("export is user-initiated, writes the report once, and cancel writes nothing", () => {
    const body = (env) => { env.alert("done"); reportBody(env); };
    const ok = setup({ probe: body });
    ui(ok.host).scan.onClick();
    assert.equal(ok.log.saveDialogCalls, 0);
    ui(ok.host).exportButton.onClick();
    assert.equal(ok.log.saveDialogCalls, 1);
    const exported = ok.log.writes.filter((w) => w.path.endsWith("export.txt"));
    assert.equal(exported.length, 1);
    assert.equal(exported[0].text, "REPORT-BODY");

    const cancelled = setup({ probe: body, exportCancel: true });
    ui(cancelled.host).scan.onClick();
    ui(cancelled.host).exportButton.onClick();
    assert.equal(cancelled.log.writes.filter((w) => !w.path.startsWith("C:/Temp")).length, 0);
    assert.match(ui(cancelled.host).status.text, /cancelled/i);
});

test("outside a docked host the wrapper falls back to a floating palette", () => {
    const s = setup({ asWindow: true });
    assert.equal(s.log.windowsShown, 1);
});

// ---- honest status: the colour and the counters follow the scanner's own counts (display only) ----
test("a scan with review-needed or not-checked findings is amber, not green, and the counters show the numbers", () => {
    const r = scanWith(lines("Composition: X", "Static text layers checked: 3", "Problems: 0; review needed: 5; not checked: 4", "Coverage verified/skipped/failed: 51/0/0"));
    assert.equal(r.status.text, "Scan complete: review needed.");
    assert.deepEqual(colour(r.status), AMBER);
    assert.deepEqual(r.chips.children.map((c) => c.text), ["Text layers checked: 3", "Problems: 0", "Review needed: 5", "Not checked: 4", "Coverage gaps: 0"]);
    assert.deepEqual(r.chips.children.map(colour), [GREY, GREY, AMBER, AMBER, GREY], "zero counts stay grey");
});

test("green only when a layer was checked, every count is zero and no coverage was skipped or failed", () => {
    const clean = scanWith(lines("Static text layers checked: 3", "Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 51/0/0"));
    assert.equal(clean.status.text, "Scan complete: no findings in the checked text.");
    assert.deepEqual(colour(clean.status), GREEN);
    const gap = scanWith(lines("Static text layers checked: 3", "Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 51/1/0"));
    assert.deepEqual(colour(gap.status), AMBER, "a skipped coverage item is a gap, never an all-clear");
    assert.equal(gap.chips.children[4].text, "Coverage gaps: 1");
    const failed = scanWith(lines("Static text layers checked: 3", "Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 51/0/2"));
    assert.deepEqual(colour(failed.status), AMBER);
});

test("problems make the status red", () => {
    const r = scanWith(lines("Static text layers checked: 3", "Problems: 3; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 10/0/0"));
    assert.equal(r.status.text, "Scan complete: problems found.");
    assert.deepEqual(colour(r.status), RED);
    assert.deepEqual(colour(r.chips.children[1]), RED);
});

test("an unreadable summary is grey and shows no counters (never an invented result)", () => {
    const r = scanWith("SUMMARY: 2 problems");
    assert.equal(r.status.text, "Scan complete. Open details to read the report.");
    assert.deepEqual(colour(r.status), GREY);
    assert.deepEqual(r.chips.children.map((c) => c.text), ["", "", "", "", ""]);
    assert.equal(hidden(r.chips), true);
});

test("nothing checked is never green: a scan of zero text layers is amber with a note in the details", () => {
    const r = scanWith(lines("Composition: Comp 1", "Static text layers checked: 0", "Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 0/0/0"));
    assert.equal(r.status.text, "Scan complete: nothing was checked.");
    assert.deepEqual(colour(r.status), AMBER);
    assert.equal(r.chips.children[0].text, "Text layers checked: 0");
    assert.deepEqual(colour(r.chips.children[0]), AMBER);
    assert.match(r.results.text, /No static text layers were found in this composition, so nothing was checked/);
});

test("without the checked-layers line the status is grey, never green, even when every count is zero", () => {
    const r = scanWith(lines("Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 51/0/0"));
    assert.equal(r.status.text, "Scan complete. Open details to read the report.");
    assert.deepEqual(colour(r.status), GREY);
    assert.equal(r.chips.children[0].text, "", "no checked-layers line is shown when the number is unknown");
});

test("problems stay red when no layer count is present, and review stays amber", () => {
    assert.deepEqual(colour(scanWith("Problems: 2; review needed: 0; not checked: 0").status), RED);
    assert.deepEqual(colour(scanWith("Problems: 0; review needed: 1; not checked: 0").status), AMBER);
});

test("after a scan the details say the report is only saved when Export is pressed", () => {
    const r = scanWith(lines("Static text layers checked: 3", "Problems: 0; review needed: 0; not checked: 0"));
    assert.match(r.results.text, /Nothing is saved until you press Export report\.\.\./);
    assert.equal(r.exportButton.enabled, true);
});

test("the no-composition message gets a note about the Project panel selection, and counters stay empty", () => {
    const s = setup({ probe: (env) => env.alert("Open/select a composition first.") });
    const r = ui(s.host);
    r.scan.onClick();
    assert.match(r.results.text, /Select ONE composition in the Project panel/);
    assert.deepEqual(r.chips.children.map((c) => c.text), ["", "", "", "", ""]);
    assert.equal(r.exportButton.enabled, false);
});

test("counters and notes are cleared when the next scan starts", () => {
    let mode = "report";
    const s = setup({ probe: (env) => {
        if (mode === "report") { env.alert(lines("Static text layers checked: 2", "Problems: 1; review needed: 1; not checked: 1", "Coverage verified/skipped/failed: 1/1/1")); reportBody(env); }
        else { env.alert("Open/select a composition first."); }
    } });
    const r = ui(s.host);
    r.scan.onClick();
    assert.notEqual(r.chips.children[1].text, "");
    assert.match(r.results.text, /Nothing is saved until you press Export/);
    mode = "guard";
    r.scan.onClick();
    assert.deepEqual(r.chips.children.map((c) => c.text), ["", "", "", "", ""]);
    assert.match(r.results.text, /Select ONE composition/);
    assert.equal(r.exportButton.enabled, false);
});

test("an export result is a short status and the path or error goes into the details", () => {
    const body = (env) => { env.alert(lines("Static text layers checked: 3", "Problems: 0; review needed: 0; not checked: 0")); reportBody(env); };
    const ok = setup({ probe: body });
    const r = ui(ok.host);
    r.scan.onClick();
    r.exportButton.onClick();
    assert.equal(r.status.text, "Report exported.");
    assert.match(r.results.text, /Saved: C:\/Users\/me\/export\.txt/);
    assert.deepEqual(colour(r.status), GREEN);
    const cancelled = setup({ probe: body, exportCancel: true });
    const c = ui(cancelled.host);
    c.scan.onClick();
    c.exportButton.onClick();
    assert.match(c.status.text, /Export cancelled/);
    assert.deepEqual(colour(c.status), AMBER);
});

// ---- compact main view, details toggle and one language at a time ----
test("the main view starts compact: details and counters are hidden, only the scan row, status and Export show", () => {
    const r = ui(setup().host);
    assert.equal(r.status.text, "Ready.");
    assert.equal(hidden(r.details), true);
    assert.equal(hidden(r.chips), true);
    assert.equal(r.detailsToggle.text, "Show details");
    assert.equal(r.description.text.includes("ACTIVE composition only"), true);
});

test("Show details / Hide details toggles the description and the scanner text", () => {
    const r = ui(setup().host);
    r.detailsToggle.onClick();
    assert.equal(hidden(r.details), false);
    assert.equal(r.detailsToggle.text, "Hide details");
    r.detailsToggle.onClick();
    assert.equal(hidden(r.details), true);
    assert.equal(r.detailsToggle.text, "Show details");
});

test("a successful scan keeps the details as the user left them (closed by default)", () => {
    const r = scanWith(lines("Static text layers checked: 3", "Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 51/0/0"));
    assert.equal(hidden(r.details), true);
});

test("only one language is shown at a time; the language button names the other one", () => {
    const en = ui(setup({ savedLang: "en" }).host);
    assert.equal(en.scan.text, "Scan composition");
    assert.equal(en.langButton.text, "日本語");
    assert.equal(en.status.text, "Ready.");
    const ja = ui(setup({ savedLang: "ja" }).host);
    assert.equal(ja.scan.text, "コンポをスキャン");
    assert.equal(ja.langButton.text, "English");
    assert.equal(ja.status.text, "準備完了。");
    assert.ok(!/ \/ /.test(ja.status.text) && !/[A-Za-z]{4}/.test(ja.status.text), "no second language on the status line");
    assert.equal(ja.detailsToggle.text, "詳細を表示");
    assert.equal(ja.exportButton.text, "レポートを出力...");
});

test("the saved language wins, and Japanese is the default when nothing is saved or the value is invalid", () => {
    assert.equal(ui(setup({ savedLang: null }).host).scan.text, "コンポをスキャン");
    assert.equal(ui(setup({ savedLang: "xx" }).host).scan.text, "コンポをスキャン");
});

test("the language button switches, saves the choice, and redraws a finished result without scanning again", () => {
    const s = setup({ savedLang: "en", probe: (env) => { env.alert(lines("Composition: C", "Static text layers checked: 3", "Problems: 0; review needed: 5; not checked: 4", "Coverage verified/skipped/failed: 51/1/0")); reportBody(env); } });
    const r = ui(s.host);
    r.scan.onClick();
    assert.equal(s.log.evalFiles, 1);
    r.langButton.onClick();
    assert.deepEqual(s.log.saved, [["JPFPGlyphPanel", "lang", "ja"]]);
    assert.equal(s.log.evalFiles, 1, "no new scan");
    assert.equal(r.status.text, "スキャン完了：確認が必要です。");
    assert.deepEqual(r.chips.children.map((c) => c.text), ["検査レイヤー: 3", "問題: 0", "要確認: 5", "未確認: 4", "カバレッジ不足: 1"]);
    assert.deepEqual(colour(r.status), AMBER);
    assert.equal(r.langButton.text, "English");
    assert.match(r.results.text, /レポート準備完了。保存は「レポートを出力...」を押したときだけです。/);
    assert.match(r.results.text, /Composition: C/, "the scanner's own text stays as the scanner wrote it");
    r.langButton.onClick();
    assert.equal(r.status.text, "Scan complete: review needed.");
    assert.deepEqual(s.log.saved[1], ["JPFPGlyphPanel", "lang", "en"]);
});

test("Japanese texts: nothing-checked, no-composition note, export and errors are Japanese too", () => {
    const nothing = scanWith(lines("Static text layers checked: 0", "Problems: 0; review needed: 0; not checked: 0", "Coverage verified/skipped/failed: 0/0/0"), { savedLang: "ja" });
    assert.equal(nothing.status.text, "スキャン完了：検査対象なし。");
    assert.match(nothing.results.text, /何も検査されていません/);
    const noComp = setup({ savedLang: "ja", probe: (env) => env.alert("Open/select a composition first.") });
    const r = ui(noComp.host);
    r.scan.onClick();
    assert.equal(r.status.text, "レポートなし。");
    assert.match(r.results.text, /コンポを1つだけ選んでから/);
    const missing = ui(setup({ savedLang: "ja", probePresent: false }).host);
    missing.scan.onClick();
    assert.match(missing.status.text, /^エラー/);
    assert.match(missing.results.text, /スキャナ JPFP_Session1_Probe\.jsx が/);
    const exported = setup({ savedLang: "ja", probe: (env) => { env.alert("Static text layers checked: 3" + NL + "Problems: 0; review needed: 0; not checked: 0"); reportBody(env); } });
    const e = ui(exported.host);
    e.scan.onClick();
    e.exportButton.onClick();
    assert.equal(e.status.text, "レポートを出力しました。");
    assert.match(e.results.text, /保存しました: C:\/Users\/me\/export\.txt/);
});

test("every text key exists in both languages with the same placeholders", () => {
    const block = /var TEXT = \{([\s\S]*?)\n    \};/.exec(SOURCE)[1];
    const sections = block.split(/\n        ja: \{/);
    const keysOf = (text) => [...text.matchAll(/(?:^|[ ,{])(\w+): "((?:[^"\\]|\\.)*)"/g)].map((m) => [m[1], m[2]]);
    const en = keysOf(sections[0].replace(/^\s*en: \{/, ""));
    const ja = keysOf(sections[1]);
    assert.ok(en.length > 40, "found " + en.length + " English texts");
    assert.deepEqual(en.map((k) => k[0]).sort(), ja.map((k) => k[0]).sort());
    const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const jaMap = new Map(ja);
    for (const [key, text] of en) assert.deepEqual(placeholders(text), placeholders(jaMap.get(key)), key);
});
