#!/usr/bin/env node
/* Execute the production ExtendScript IIFE against a deliberately limited AE mock.
 * This validates behavior and error accounting, not native AE/font/render behavior.
 * No package dependencies, fixture writes, installed fonts, or live AE project used.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = fs.readFileSync(path.join(ROOT, "src", "JPFP_Session1_Probe.jsx"), "utf8")
    .replace(/^#target[^\r\n]*(?:\r?\n)?/, "");
const program = new vm.Script(SOURCE, { filename: "JPFP_Session1_Probe.jsx" });
const mutations = ["setValue", "setValueAtTime", "setValuesAtTimes", "addText", "addComp", "addSolid",
    "remove", "replaceFont", "save", "saveWithDialog", "close", "beginUndoGroup", "endUndoGroup"];

function throwing(object, key, message = key + " getter denied") {
    Object.defineProperty(object, key, { configurable: true, get() { throw new Error(message); } });
    return object;
}

function run(options = {}) {
    const state = { alerts: [], queries: [], ranges: [], mutations: [], writes: [], closes: 0 };
    function readonly(object, name) {
        return new Proxy(object, {
            set(_target, key) { state.mutations.push(name + "." + String(key)); throw new Error("Project mutation forbidden"); },
            deleteProperty(_target, key) { state.mutations.push(name + "." + String(key)); throw new Error("Project deletion forbidden"); },
            defineProperty(_target, key) { state.mutations.push(name + "." + String(key)); throw new Error("Project redefinition forbidden"); },
            get(target, key, receiver) {
                if (mutations.includes(key)) {
                    return function () { state.mutations.push(name + "." + key + "()"); throw new Error("Project mutator forbidden"); };
                }
                return Reflect.get(target, key, receiver);
            }
        });
    }
    function font(label, changes) {
        const f = { fontID: label === "base" ? 99 : label === "second" ? 2 : 1,
            postScriptName: "JPFP-Mock-" + label, nativeFamilyName: "Mock " + label,
            nativeStyleName: "Regular", familyName: "Mock", styleName: "Regular",
            isSubstitute: false, location: "mock://" + label,
            hasGlyphsFor(text) { state.queries.push({ label, text }); return true; } };
        if (changes) { changes(f, state); }
        return readonly(f, "font." + label);
    }
    const applied = font("applied", options.font);
    const second = font("second", options.secondFont);
    const base = font("base", options.baseFont);
    const text = Object.prototype.hasOwnProperty.call(options, "text") ? options.text : "A漢";
    const docObject = { text, fontObject: base,
        characterRange(start, end) {
            state.ranges.push([start, end]);
            const rangeObject = { fontObject: options.mixed && start > 0 ? second : applied };
            if (options.range) { options.range(rangeObject, state); }
            return readonly(rangeObject, "characterRange");
        } };
    if (options.doc) { options.doc(docObject, state); }
    const doc = readonly(docObject, "textDocument");
    const sourceObject = { expressionEnabled: false, numKeys: 0, value: doc };
    if (options.source) { options.source(sourceObject, state); }
    const source = readonly(sourceObject, "sourceText");
    const textPropertiesObject = { property(name) { assert.equal(name, "ADBE Text Document"); return source; } };
    if (options.textProperties) { options.textProperties(textPropertiesObject, state); }
    const textProperties = readonly(textPropertiesObject, "textProperties");
    function TextLayer() {}
    const layerObject = Object.assign(options.nonText ? {} : new TextLayer(), { index: 1, id: 101, name: "Fixture A\t漢",
        property(name) { assert.equal(name, "ADBE Text Properties"); return options.nonText ? null : textProperties; } });
    if (options.layer) { options.layer(layerObject, state); }
    const layer = readonly(layerObject, "layer");
    function CompItem() {}
    const compObject = Object.assign(new CompItem(), { id: 42, name: "Mock Comp", time: 0, numLayers: 1,
        layer(index) { assert.equal(index, 1); return layer; } });
    if (options.comp) { options.comp(compObject, state); }
    const comp = readonly(compObject, "comp");
    const projectObject = { activeItem: comp, revision: 77, file: null };
    if (options.project) { options.project(projectObject, state); }
    const project = readonly(projectObject, "project");
    const appObject = { project, version: "26.5.0x89", buildName: "Mock beta", buildNumber: 89,
        isoLanguage: "en_US", fonts: readonly({ missingOrSubstitutedFonts: [] }, "fonts") };
    if (options.app) { options.app(appObject, state); }
    const app = readonly(appObject, "app");
    function File(filePath) {
        this.name = "mock-report.txt";
        this.fsName = filePath || "mock://report.txt";
        this.opened = false;
        this.open = function (mode) {
            assert.equal(mode, "w");
            if (options.openThrows) { throw new Error("open denied"); }
            this.opened = options.openResult !== false;
            return this.opened;
        };
        this.write = function (content) {
            if (options.writeThrows) { throw new Error("write denied"); }
            if (options.rejectRawSurrogates && /[\uD800-\uDFFF]/.test(content)) {
                this.error = "Character conversion error";
                return false;
            }
            state.writes.push(content);
            return options.writeResult !== false;
        };
        this.close = function () {
            state.closes++;
            if (options.closeThrows) { throw new Error("close denied"); }
            this.opened = false;
            return options.closeResult !== false;
        };
    }
    File.saveDialog = function () {
        if (options.dialogThrows) { throw new Error("dialog denied"); }
        return options.cancelExport ? null : new File();
    };
    const context = vm.createContext({ app, CompItem, TextLayer, File, $: { os: "Mock OS" },
        alert(message) { state.alerts.push(String(message)); } });
    program.runInContext(context, { timeout: 3000 });
    assert.deepEqual(state.mutations, [], "Scanner attempted to mutate an AE project object");
    assert.equal(state.alerts.length, 1, "Scanner must finish with exactly one outcome alert");
    state.report = state.writes.join("\n");
    state.lines = state.report.split(/\r?\n/);
    state.metrics = Object.fromEntries(state.lines.filter(line => line.includes("\t")).map(line => {
        const cells = line.split("\t"); return [cells[0], cells.slice(1).join("\t")];
    }));
    state.findings = table(state.lines, cells => cells[0] === "severity");
    state.layers = table(state.lines, cells => cells.includes("sourceText") && cells.includes("mixedFonts"));
    state.characters = table(state.lines, cells => cells.includes("coverage") && cells.includes("codePoint"));
    return state;
}

function table(lines, predicate) {
    const index = lines.findIndex(line => predicate(line.split("\t")));
    if (index < 0) { return []; }
    const headers = lines[index].split("\t");
    const rows = [];
    for (let i = index + 1; i < lines.length && lines[i]; i++) {
        const cells = lines[i].split("\t");
        if (cells.length !== headers.length) { break; }
        rows.push(Object.fromEntries(headers.map((key, n) => [key, cells[n]])));
    }
    return rows;
}
function metric(state, label) {
    assert.ok(Object.hasOwn(state.metrics, label), "Missing report metric: " + label);
    return Number(state.metrics[label]);
}
function finding(state, code) { return state.findings.filter(row => row.code === code); }
function hasFinding(state, pattern) { return state.findings.some(row => pattern.test(row.code)); }
function assertAccounted(state) {
    const examined = metric(state, "Characters examined");
    assert.equal(state.characters.length, examined, "Every examined character needs an auditable report row");
    const statuses = ["VERIFIED_PRESENT", "VERIFIED_ABSENT", "NOT_CHECKED", "FAILED"];
    for (const row of state.characters) {
        assert.ok(statuses.includes(row.coverage), "Invalid coverage status: " + row.coverage);
        if (row.coverage.startsWith("VERIFIED_")) { assert.equal(row.fontIdentity, "VERIFIED"); }
    }
    const totals = statuses.map(status => state.characters.filter(row => row.coverage === status).length);
    assert.equal(totals.reduce((a, b) => a + b, 0), examined);
    assert.equal(metric(state, "Characters coverage verified"), totals[0] + totals[1], "Verified metric must match character rows");
    assert.equal(metric(state, "Characters coverage skipped"), totals[2], "Skipped metric must match character rows");
    assert.equal(metric(state, "Characters coverage failed"), totals[3], "Failed metric must match character rows");
    return totals;
}
function assertNoCoverage(state) {
    assert.equal(state.queries.length, 0, "An unknown applied character font must never query a guessed/base font");
    assert.ok(state.characters.every(row => !row.coverage.startsWith("VERIFIED_")), "Unknown font incorrectly counted as verified coverage");
    assertAccounted(state);
}
function assertExport(state, expected) { assert.match(state.alerts[0], new RegExp("Export: " + expected + "(?:\\s|$)")); }

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

test("static applied fonts: explicit character identity, offsets and reconciled coverage", () => {
    const state = run();
    assertExport(state, "OK");
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.equal(state.queries.length, 2);
    assert.ok(state.characters.every(row => row.fontIdentity === "VERIFIED"));
    assert.ok(state.characters.every(row => Object.values(row).includes("Mock Comp") && Object.values(row).includes("101")));
    assert.deepEqual(state.ranges, [[0, 1], [1, 2]]);
    assert.equal(state.metrics["Project revision unchanged"], "true");
});
test("applied-font glyph absence is verified absence with a located problem", () => {
    const state = run({ font(f, state) { f.hasGlyphsFor = text => { state.queries.push({ label: "applied", text }); return text !== "漢"; }; } });
    assert.deepEqual(assertAccounted(state), [1, 1, 0, 0]);
    const rows = finding(state, "FONT_REPORTS_NO_GLYPH");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].codePoint, "U+6F22");
    assert.equal(rows[0].start, "1");
    assert.equal(rows[0].end, "2");
    assert.match(state.report, /does not establish|does NOT establish|not which fallback|not prove/i);
});
test("CharacterRange.fontObject getter failure cannot fall back to a healthy base font", () => {
    const state = run({ range(r) { throwing(r, "fontObject"); } });
    assertNoCoverage(state);
    assert.ok(state.characters.every(row => row.fontIdentity === "UNKNOWN"));
    assert.ok(hasFinding(state, /CHARACTER.*FONT.*FAILED|CHARACTER.*FONT.*UNKNOWN|FONT_OBJECT_READ_FAILED/));
});
test("CharacterRange.fontObject absent cannot fall back to baseFont", () => {
    const state = run({ range(r) { delete r.fontObject; } });
    assertNoCoverage(state);
    assert.ok(state.characters.every(row => row.fontIdentity === "UNKNOWN"));
});
test("CharacterRange call failure cannot fall back to baseFont", () => {
    const state = run({ doc(d) { d.characterRange = () => { throw new Error("range call failed"); }; } });
    assertNoCoverage(state);
    assert.ok(hasFinding(state, /CHARACTER_RANGE.*FAILED/));
});
test("null CharacterRange result cannot fall back to baseFont", () => {
    const state = run({ doc(d) { d.characterRange = () => null; } });
    assertNoCoverage(state);
    assert.ok(state.characters.every(row => row.fontIdentity === "UNKNOWN"));
});
test("CharacterRange API accessor failure is caught and unknown", () => {
    const state = run({ doc(d) { throwing(d, "characterRange"); } });
    assertNoCoverage(state);
    assert.ok(hasFinding(state, /CHARACTER_RANGE.*FAILED/));
});
test("unavailable CharacterRange API is explicitly skipped", () => {
    const state = run({ doc(d) { delete d.characterRange; } });
    assertNoCoverage(state);
    assert.ok(hasFinding(state, /CHARACTER_RANGE.*UNAVAILABLE/));
    assert.ok(state.characters.every(row => row.coverage === "NOT_CHECKED"));
});
test("baseFont getter failure never blocks independently verified per-character font", () => {
    const state = run({ doc(d) { throwing(d, "fontObject"); } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.ok(state.queries.every(query => query.label === "applied"));
});
test("glyph API accessor failure is FAILED with verified identity", () => {
    const state = run({ font(f) { throwing(f, "hasGlyphsFor"); } });
    assert.deepEqual(assertAccounted(state), [0, 0, 0, 2]);
    assert.equal(state.queries.length, 0);
    assert.ok(hasFinding(state, /GLYPH.*FAILED/));
});
test("unavailable glyph API is NOT_CHECKED", () => {
    const state = run({ font(f) { delete f.hasGlyphsFor; } });
    assert.deepEqual(assertAccounted(state), [0, 0, 2, 0]);
    assert.ok(hasFinding(state, /GLYPH_API_UNAVAILABLE/));
});
test("throwing glyph query is FAILED", () => {
    const state = run({ font(f) { f.hasGlyphsFor = () => { throw new Error("query failure"); }; } });
    assert.deepEqual(assertAccounted(state), [0, 0, 0, 2]);
    assert.ok(hasFinding(state, /GLYPH_QUERY_FAILED/));
});
test("nonboolean glyph return cannot become verified coverage", () => {
    const state = run({ font(f) { f.hasGlyphsFor = () => "true"; } });
    assert.deepEqual(assertAccounted(state), [0, 0, 0, 2]);
});
test("font identity getters failing together prevent verified coverage", () => {
    const state = run({ font(f) { throwing(f, "fontID"); throwing(f, "postScriptName"); } });
    assertNoCoverage(state);
    assert.ok(state.characters.every(row => row.fontIdentity === "UNKNOWN"));
    assert.ok(hasFinding(state, /FONT.*IDENTITY.*UNKNOWN|FONT.*IDENTITY.*FAILED/));
});
test("unavailable font identity is UNKNOWN even when a FontObject exists", () => {
    const state = run({ font(f) { delete f.fontID; delete f.postScriptName; } });
    assertNoCoverage(state);
    assert.ok(state.characters.every(row => row.fontIdentity === "UNKNOWN"));
});
test("invalid font identifier types cannot become verified identity", () => {
    const state = run({ font(f) { f.fontID = {}; f.postScriptName = 123; } });
    assertNoCoverage(state);
    assert.ok(state.characters.every(row => row.fontIdentity === "UNKNOWN"));
});
test("invalid display metadata is explicitly UNKNOWN without invalidating a valid font ID", () => {
    const state = run({ font(f) { f.familyName = {}; f.styleName = []; f.location = {}; } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.ok(state.characters.every(row => row.fontSummary.includes("UNKNOWN") && !row.fontSummary.includes("[object Object]")));
    assert.ok(hasFinding(state, /FONT_METADATA_UNKNOWN/));
});
for (const field of ["fontID", "postScriptName"]) {
    test(field + " getter failure is explicit while other identifier remains usable", () => {
        const state = run({ font(f) { throwing(f, field); } });
        assertAccounted(state);
        assert.ok(state.characters.every(row => row.fontSummary.includes("UNKNOWN")), "Failed identity field must remain UNKNOWN in report");
        assert.ok(hasFinding(state, /FONT.*IDENTITY.*UNKNOWN|FONT.*IDENTITY.*FAILED|FONT_METADATA_UNKNOWN/));
    });
}
test("substitute getter failure is UNKNOWN and cannot report false", () => {
    const state = run({ font(f) { throwing(f, "isSubstitute"); } });
    assertAccounted(state);
    assert.ok(state.characters.every(row => row.substitute === "UNKNOWN"));
    assert.ok(hasFinding(state, /SUBSTITUTE.*FAILED|SUBSTITUTE.*UNKNOWN/));
});
test("missing substitute API is explicitly UNKNOWN", () => {
    const state = run({ font(f) { delete f.isSubstitute; } });
    assertAccounted(state);
    assert.ok(state.characters.every(row => row.substitute === "UNKNOWN"));
});
test("substitute-font true produces located problem findings", () => {
    const state = run({ font(f) { f.isSubstitute = true; } });
    assert.equal(finding(state, "SUBSTITUTE_FONT_REFERENCE").length, 2);
    assert.ok(state.characters.every(row => row.substitute === "TRUE"));
    assertAccounted(state);
});
test("intentional mixed fonts are review findings, without invented errors", () => {
    const state = run({ mixed: true });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.equal(finding(state, "MIXED_FONT_RUNS").length, 1);
    assert.equal(finding(state, "MIXED_FONT_RUNS")[0].severity, "REVIEW_NEEDED");
    assert.equal(state.findings.filter(row => row.severity === "PROBLEM_FOUND").length, 0);
});
test("intermittent fontID failure on the same applied font never invents mixed runs", () => {
    let reads = 0;
    const state = run({ font(f) {
        Object.defineProperty(f, "fontID", { get() {
            if (reads++ === 0) { throw new Error("transient fontID read failure"); }
            return 1;
        } });
    } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.equal(finding(state, "MIXED_FONT_RUNS").length, 0);
    assert.equal(finding(state, "MIXED_FONT_STATUS_UNKNOWN").length, 1);
    assert.equal(state.layers[0].mixedFonts, "UNKNOWN");
});
test("distinct PostScript names without unique fontIDs keep mixed classification unknown", () => {
    const state = run({ mixed: true, font(f) { delete f.fontID; }, secondFont(f) { delete f.fontID; } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.equal(finding(state, "MIXED_FONT_RUNS").length, 0);
    assert.equal(finding(state, "MIXED_FONT_STATUS_UNKNOWN").length, 1);
    assert.equal(state.layers[0].mixedFonts, "UNKNOWN");
});
for (const [field, value, code] of [["expressionEnabled", true, "SOURCE_TEXT_EXPRESSION"], ["numKeys", 1, "SOURCE_TEXT_ANIMATED"]]) {
    test(field + " skips Source Text without even reading its value", () => {
        const state = run({ source(s) { s[field] = value; throwing(s, "value", "Out-of-scope text value must not be read"); } });
        assert.equal(state.queries.length, 0);
        assert.equal(metric(state, "Characters examined"), 0);
        assert.equal(finding(state, code).length, 1);
        assert.equal(finding(state, code)[0].severity, "NOT_CHECKED");
    });
    test(field + " getter failure never assumes static text", () => {
        const state = run({ source(s) { throwing(s, field); throwing(s, "value", "Cannot read unclassified text"); } });
        assert.equal(state.queries.length, 0);
        assert.equal(metric(state, "Characters examined"), 0);
        assert.ok(hasFinding(state, /SOURCE_TEXT.*FAILED|SOURCE_TEXT.*UNKNOWN/));
    });
    test(field + " API absent never assumes static text", () => {
        const state = run({ source(s) { delete s[field]; } });
        assert.equal(state.queries.length, 0);
        assert.equal(metric(state, "Characters examined"), 0);
        assert.ok(state.findings.some(row => row.severity === "NOT_CHECKED"));
    });
}
for (const [field, value] of [["expressionEnabled", "false"], ["expressionEnabled", 0],
    ["numKeys", "0"], ["numKeys", NaN], ["numKeys", -1], ["numKeys", 0.5]]) {
    test("invalid " + field + " value " + String(value) + " cannot assume static text", () => {
        const state = run({ source(s) { s[field] = value; throwing(s, "value", "Unclassified text must not be read"); } });
        assert.equal(state.queries.length, 0);
        assert.equal(metric(state, "Characters examined"), 0);
        assert.ok(hasFinding(state, /SOURCE_TEXT_CLASSIFICATION_UNKNOWN/));
    });
}
test("layer property getter failure is not silently classed non-text", () => {
    const state = run({ layer(l) { l.property = () => { throw new Error("property denied"); }; } });
    assert.equal(state.queries.length, 0);
    assert.equal(metric(state, "Non-text layers (not applicable)"), 0);
    assert.ok(hasFinding(state, /TEXT.*PROPERTY.*FAILED|SOURCE_TEXT.*FAILED|SOURCE_TEXT_PROPERTY_UNKNOWN/));
});
test("nested Source Text property getter failure is explicit", () => {
    const state = run({ textProperties(t) { t.property = () => { throw new Error("nested property denied"); }; } });
    assert.equal(state.queries.length, 0);
    assert.ok(hasFinding(state, /TEXT.*PROPERTY.*FAILED|SOURCE_TEXT.*FAILED|SOURCE_TEXT_PROPERTY_UNKNOWN/));
});
test("undefined text-property group is unknown rather than non-text", () => {
    const state = run({ layer(l) { l.property = () => undefined; } });
    assert.equal(metric(state, "Non-text layers (not applicable)"), 0);
    assert.equal(metric(state, "Unreadable/unclassified layers NOT CHECKED"), 1);
    assert.equal(state.queries.length, 0);
    assert.ok(state.findings.some(row => row.severity === "NOT_CHECKED"));
});
test("null text-property group on known TextLayer is unknown rather than non-text", () => {
    const state = run({ layer(l) { l.property = () => null; } });
    assert.equal(metric(state, "Non-text layers (not applicable)"), 0);
    assert.equal(metric(state, "Unreadable/unclassified layers NOT CHECKED"), 1);
    assert.equal(state.queries.length, 0);
    assert.ok(state.findings.some(row => row.severity === "NOT_CHECKED"));
});
test("Source Text value read failure is explicit", () => {
    const state = run({ source(s) { throwing(s, "value"); } });
    assert.equal(metric(state, "Characters examined"), 0);
    assert.ok(hasFinding(state, /TEXTDOCUMENT_READ_FAILED|SOURCE_TEXT.*VALUE.*FAILED/));
});
test("Source Text text getter failure never stringifies a document into characters", () => {
    const state = run({ doc(d) { throwing(d, "text"); d.toString = () => "MISLEADING FALLBACK"; } });
    assert.equal(metric(state, "Characters examined"), 0);
    assert.equal(state.queries.length, 0);
    assert.ok(hasFinding(state, /TEXT.*READ_FAILED|TEXT.*UNKNOWN/));
});
for (const value of [undefined, null, {}]) {
    test("unavailable or invalid Source Text text value " + String(value) + " never becomes characters", () => {
        const state = run({ doc(d) { d.text = value; } });
        assert.equal(metric(state, "Characters examined"), 0);
        assert.equal(state.queries.length, 0);
        assert.ok(state.findings.some(row => row.severity === "NOT_CHECKED"));
    });
}
test("empty text is explicit and has no invented character coverage", () => {
    const state = run({ text: "" });
    assert.deepEqual(assertAccounted(state), [0, 0, 0, 0]);
    assert.equal(metric(state, "Empty text layers"), 1);
    assert.equal(finding(state, "EMPTY_TEXT").length, 1);
});
test("non-text layers are not applicable and never read text", () => {
    const state = run({ nonText: true });
    assert.equal(metric(state, "Non-text layers (not applicable)"), 1);
    assert.equal(metric(state, "Text layers"), 0);
    assert.equal(state.queries.length, 0);
    assert.equal(state.layers.length, 1, "Non-text layers still require an auditable located layer row");
    assert.equal(state.layers[0].sourceText, "NON_TEXT");
    assert.equal(state.layers[0].compId, "42");
    assert.equal(state.layers[0].layerId, "101");
});
test("Unicode supplementary, combining, variation, ZWJ and lone surrogate remain reviewable", () => {
    const text = "𠀋は\u3099葛\uDB40\uDD00\u200D\uD800";
    const state = run({ text });
    assertAccounted(state);
    assert.deepEqual(state.characters.map(row => [Number(row.start), Number(row.end)]), [[0, 2], [2, 3], [3, 4], [4, 5], [5, 7], [7, 8], [8, 9]]);
    assert.deepEqual(state.ranges, [[0, 2], [2, 3], [3, 4], [4, 5], [5, 7], [7, 8]], "Malformed UTF-16 must not be passed to native CharacterRange");
    assert.ok(state.queries.every(query => !["\uDB40\uDD00", "\u200D", "\uD800"].includes(query.text)), "Standalone selectors, joiners and malformed code units must not be glyph queries");
    for (const codePoint of ["U+2000B", "U+3099", "U+E0100", "U+200D", "U+D800"]) {
        assert.ok(state.findings.some(row => row.codePoint === codePoint && row.severity === "REVIEW_NEEDED"), codePoint + " must require review");
    }
});
test("surrogate-safe export preserves original Unicode queries, coordinates and report meaning", () => {
    const state = run({ text: "𠀋葛\uDB40\uDD00A\uD800", rejectRawSurrogates: true,
        comp(c) { c.name = "Comp𠀋"; }, font(f) { f.postScriptName = "Mock𠀋"; } });
    assertExport(state, "OK");
    assert.deepEqual(assertAccounted(state), [3, 0, 2, 0]);
    assert.equal(/[\uD800-\uDFFF]/.test(state.report), false, "No raw surrogate code unit may reach the native file encoder");
    assert.deepEqual(state.queries.map(query => query.text), ["𠀋", "葛", "A"], "Glyph APIs must receive original code points, not report escape strings");
    assert.deepEqual(state.characters.map(row => [row.codePoint, row.start, row.end, row.character]), [
        ["U+2000B", "0", "2", "\\uD840\\uDC0B"],
        ["U+845B", "2", "3", "葛"],
        ["U+E0100", "3", "5", "\\uDB40\\uDD00"],
        ["U+0041", "5", "6", "A"],
        ["U+D800", "6", "7", "\\uD800"]
    ]);
    assert.ok(state.report.includes("Comp\\uD840\\uDC0B"));
    assert.ok(state.characters[0].fontSummary.includes("Mock\\uD840\\uDC0B"));
});
test("report escapes tab/newline/control text without corrupting character rows", () => {
    const state = run({ text: "\t\r\n", comp(c) { c.name = "Comp\nsecond\tcolumn"; }, layer(l) { l.name = "Layer\nsecond\tcolumn"; } });
    assert.equal(assertAccounted(state).reduce((a, b) => a + b, 0), 3);
    assert.ok(state.report.includes("Comp\\nsecond\\tcolumn"));
    assert.ok(state.report.includes("Layer\\nsecond\\tcolumn"));
});
for (const [object, field, column] of [["comp", "id", "compId"], ["comp", "name", "comp"],
    ["layer", "id", "layerId"], ["layer", "name", "layerName"]]) {
    test(object + "." + field + " getter failure is explicitly UNKNOWN in located report rows", () => {
        const state = run({ [object](o) { throwing(o, field); } });
        assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
        assert.ok(state.characters.every(row => row[column] === "UNKNOWN"));
    });
}
test("layer location uses composition enumeration even if layer.index getter fails", () => {
    const state = run({ layer(l) { throwing(l, "index"); } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.ok(state.characters.every(row => row.layerIndex === "1"));
});
for (const [name, project] of [["throwing", p => throwing(p, "revision")], ["absent", p => { delete p.revision; }]]) {
    test(name + " project revision never claims unchanged", () => {
        const state = run({ project });
        assert.equal(state.metrics["Project revision unchanged"], "UNKNOWN");
        assertAccounted(state);
    });
}
for (const revision of [{}, NaN, "77"]) {
    test("invalid project revision " + String(revision) + " cannot claim unchanged", () => {
        const state = run({ project(p) { p.revision = revision; } });
        assert.equal(state.metrics["Project revision unchanged"], "UNKNOWN");
        assertAccounted(state);
    });
}
test("changed project revision is reported false", () => {
    const state = run({ project(p) {
        let reads = 0;
        Object.defineProperty(p, "revision", { get() { return reads++ === 0 ? 77 : 78; } });
    } });
    assert.equal(state.metrics["Project revision unchanged"], "false");
    assertAccounted(state);
});
test("unavailable app.fonts does not invalidate independent character observations", () => {
    const state = run({ app(a) { delete a.fonts; } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
});
test("active-composition scanning does not read project-wide app.fonts", () => {
    let reads = 0;
    const state = run({ app(a) {
        Object.defineProperty(a, "fonts", { get() { reads++; throw new Error("Project-wide font API must not be read"); } });
    } });
    assert.deepEqual(assertAccounted(state), [2, 0, 0, 0]);
    assert.equal(reads, 0);
});
test("project-wide missingOrSubstitutedFonts is outside active-composition scope", () => {
    let reads = 0;
    const state = run({ app(a) {
        a.fonts = Object.defineProperty({}, "missingOrSubstitutedFonts", { get() { reads++; throw new Error("Project-wide listing must not be read"); } });
    } });
    assertAccounted(state);
    assert.equal(reads, 0);
});
test("export cancellation is CANCELLED with no write", () => {
    const state = run({ cancelExport: true });
    assertExport(state, "CANCELLED");
    assert.equal(state.writes.length, 0);
    assert.equal(state.closes, 0);
});
for (const [name, option] of [["dialog throws", "dialogThrows"], ["open throws", "openThrows"],
    ["write throws", "writeThrows"], ["close throws", "closeThrows"]]) {
    test("export " + name + " is FAILED", () => {
        const state = run({ [option]: true });
        assertExport(state, "FAILED");
        if (option === "writeThrows" || option === "closeThrows") { assert.ok(state.closes > 0, "Attempt to close output after write/close failure required"); }
    });
}
for (const option of ["openResult", "writeResult", "closeResult"]) {
    test("export " + option + " false is FAILED", () => {
        const state = run({ [option]: false });
        assertExport(state, "FAILED");
        if (option !== "openResult") { assert.ok(state.closes > 0, "Attempt to close output required"); }
    });
}
test("repeat scan has stable observations and leaves project read-only", () => {
    const first = run({ mixed: true });
    const second = run({ mixed: true });
    assert.deepEqual(first.characters, second.characters);
    assert.deepEqual(first.findings, second.findings);
    assert.equal(first.metrics["Project revision unchanged"], "true");
    assert.equal(second.metrics["Project revision unchanged"], "true");
});

if (require.main === module) {
    let failures = 0;
    for (const { name, fn } of tests) {
        try { fn(); process.stdout.write("PASS " + name + "\n"); }
        catch (error) { failures++; process.stderr.write("FAIL " + name + "\n" + error.stack + "\n"); }
    }
    process.stdout.write("BEHAVIORAL_REGRESSIONS: " + (failures ? "FAIL" : "PASS") + " (" + (tests.length - failures) + "/" + tests.length + ")\n");
    process.stdout.write("Mock-host evidence only; native fixture conditions, UI, rendered fallback and shaping remain unvalidated.\n");
    process.exitCode = failures ? 1 : 0;
}
module.exports = { run };
