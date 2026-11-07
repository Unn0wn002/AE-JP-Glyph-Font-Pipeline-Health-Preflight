#target aftereffects

/* Native evidence wrapper. Project reads only; writes JSON evidence files only.
 * Runs the exact product script with its normal export and summary dialogs.
 * Sampling is diagnostic observation, not rendered fallback/shaping validation.
 */
(function JPFP_Author_Approved_Zen_F02() {
    var SCHEMA = "JPFP-NATIVE-STATE-1";
    var MAX_LAYERS = 200, MAX_KEYS = 50, MAX_CHARACTERS_PER_DOCUMENT = 512, MAX_TOTAL_CHARACTERS = 30000;
    var wrapperFile = new File($.fileName);
    var root = wrapperFile.parent.parent.parent;
    var scanner = new File(root.fsName + "/src/JPFP_Session1_Probe.jsx");
    var runStart = new Date().getTime();

    function pad(n, width) { var s = String(n); while (s.length < width) { s = "0" + s; } return s; }
    function stamp() {
        var d = new Date();
        return d.getFullYear() + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2) + "-" +
            pad(d.getHours(), 2) + pad(d.getMinutes(), 2) + pad(d.getSeconds(), 2) + "-" + pad(d.getMilliseconds(), 3);
    }
    function errorText(e) { try { return String(e); } catch (ignored) { return "Error detail unavailable"; } }
    function observe(fn, type) {
        try {
            var value = fn();
            if (value === undefined || value === null) { return { status: "UNKNOWN", value: null, reason: "UNAVAILABLE" }; }
            if (type && typeof value !== type) { return { status: "UNKNOWN", value: null, reason: "INVALID_TYPE_" + type }; }
            if (typeof value === "number" && !isFinite(value)) { return { status: "UNKNOWN", value: null, reason: "NONFINITE_NUMBER" }; }
            return { status: "OK", value: value };
        } catch (e) { return { status: "UNKNOWN", value: null, reason: "READ_FAILED", error: errorText(e) }; }
    }
    function unknown(reason) { return { status: "UNKNOWN", value: null, reason: reason }; }
    function quoted(value) {
        var text = String(value), out = '"';
        for (var i = 0; i < text.length; i++) {
            var ch = text.charAt(i), code = text.charCodeAt(i);
            if (ch === '"') { out += '\\"'; }
            else if (ch === "\\") { out += "\\\\"; }
            else if (code < 32 || code >= 0xD800 && code <= 0xDFFF || code === 0x2028 || code === 0x2029) { out += "\\u" + pad(code.toString(16), 4); }
            else { out += ch; }
        }
        return out + '"';
    }
    function json(value) {
        if (value === null || value === undefined) { return "null"; }
        if (typeof value === "string") { return quoted(value); }
        if (typeof value === "boolean") { return value ? "true" : "false"; }
        if (typeof value === "number") { return isFinite(value) ? String(value) : "null"; }
        var parts = [], i;
        if (value instanceof Array) {
            for (i = 0; i < value.length; i++) { parts.push(json(value[i])); }
            return "[" + parts.join(",") + "]";
        }
        for (var key in value) {
            if (value.hasOwnProperty(key)) { parts.push(quoted(key) + ":" + json(value[key])); }
        }
        return "{" + parts.join(",") + "}";
    }
    function ensureFolder(folder) {
        if (!folder.exists && folder.create() !== true) { throw new Error("Cannot create evidence folder: " + folder.fsName); }
    }
    function writeNew(name, value, directory) {
        var file = new File(directory.fsName + "/" + name), opened = false;
        if (file.exists) { throw new Error("Refusing evidence overwrite: " + file.fsName); }
        try {
            file.encoding = "UTF-8"; file.lineFeed = "Unix";
            if (file.open("w") !== true) { throw new Error("Cannot open evidence file: " + file.fsName + ": " + file.error); }
            opened = true;
            if (file.write(json(value) + "\n") !== true) { throw new Error("Evidence write failed: " + file.fsName + ": " + file.error); }
            var closeOK = file.close(); opened = false;
            if (closeOK !== true) { throw new Error("Evidence close failed: " + file.fsName + ": " + file.error); }
        } catch (e) {
            if (opened) { try { file.close(); } catch (ignored) {} }
            throw e;
        }
    }
    function codePoint(text, index) {
        var first = text.charCodeAt(index), cp = first, units = 1, malformed = false;
        if (first >= 0xD800 && first <= 0xDBFF) {
            var second = index + 1 < text.length ? text.charCodeAt(index + 1) : 0;
            if (second >= 0xDC00 && second <= 0xDFFF) { cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000; units = 2; }
            else { malformed = true; }
        } else if (first >= 0xDC00 && first <= 0xDFFF) { malformed = true; }
        return { start: index, end: index + units, codePoint: "U+" + pad(cp.toString(16).toUpperCase(), 4), text: text.substr(index, units), malformed: malformed };
    }
    function selectedProperties(layer) {
        var observation = observe(function () { return layer.selectedProperties; });
        if (observation.status !== "OK") { return observation; }
        var result = [];
        for (var i = 0; i < observation.value.length; i++) {
            var prop = observation.value[i];
            result.push({ name: observe(function () { return prop.name; }, "string"), matchName: observe(function () { return prop.matchName; }, "string"), propertyIndex: observe(function () { return prop.propertyIndex; }, "number") });
        }
        return { status: "OK", value: result };
    }
    function layerKind(layer) {
        var textLayer = observe(function () {
            if (typeof TextLayer === "undefined") { return undefined; }
            return layer instanceof TextLayer;
        }, "boolean");
        if (textLayer.status === "OK" && textLayer.value) { return { kind: "TEXT", textLayer: textLayer }; }
        var solid = observe(function () {
            if (typeof SolidSource === "undefined") { return undefined; }
            var source = layer.source;
            return source !== null && source !== undefined && source.mainSource instanceof SolidSource;
        }, "boolean");
        return { kind: solid.status === "OK" && solid.value ? "SOLID" : textLayer.status === "OK" ? "NON_TEXT" : "UNKNOWN", textLayer: textLayer, solidSource: solid };
    }
    function sampleDocument(documentObservation, budget) {
        if (documentObservation.status !== "OK") { return { document: documentObservation }; }
        var doc = documentObservation.value;
        var text = observe(function () { return doc.text; }, "string");
        var output = { text: text, characters: [], truncated: false };
        if (text.status !== "OK") { return output; }
        var rangeApi = observe(function () { return doc.characterRange; }, "function");
        output.characterRangeAPI = rangeApi.status === "OK" ? { status: "OK" } : rangeApi;
        var count = 0;
        for (var offset = 0; offset < text.value.length;) {
            if (count >= MAX_CHARACTERS_PER_DOCUMENT || budget.characters >= MAX_TOTAL_CHARACTERS) { output.truncated = true; budget.truncated = true; break; }
            var character = codePoint(text.value, offset);
            character.fontID = unknown("FONT_NOT_READ"); character.postScriptName = unknown("FONT_NOT_READ");
            character.isSubstitute = unknown("FONT_NOT_READ"); character.hasGlyphsFor = unknown("FONT_NOT_READ");
            if (character.malformed) { character.range = unknown("MALFORMED_UTF16_NOT_QUERIED"); }
            else if (rangeApi.status !== "OK") { character.range = rangeApi; }
            else {
                var range = observe(function () { return doc.characterRange(character.start, character.end); });
                character.range = range.status === "OK" ? { status: "OK" } : range;
                if (range.status === "OK") {
                    var font = observe(function () { return range.value.fontObject; });
                    character.fontObject = font.status === "OK" ? { status: "OK", provenance: "CharacterRange.fontObject" } : font;
                    if (font.status === "OK") {
                        character.fontID = observe(function () { return font.value.fontID; });
                        if (character.fontID.status === "OK" && typeof character.fontID.value !== "number" && typeof character.fontID.value !== "string") { character.fontID = unknown("INVALID_FONT_ID_TYPE"); }
                        character.postScriptName = observe(function () { return font.value.postScriptName; }, "string");
                        character.isSubstitute = observe(function () { return font.value.isSubstitute; }, "boolean");
                        var glyphApi = observe(function () { return font.value.hasGlyphsFor; }, "function");
                        character.hasGlyphsFor = glyphApi.status === "OK" ? observe(function () { return font.value.hasGlyphsFor(character.text); }, "boolean") : glyphApi;
                    }
                }
            }
            output.characters.push(character); count++; budget.characters++; offset = character.end;
        }
        return output;
    }
    function snapshot(comp) {
        var start = new Date().getTime();
        var budget = { characters: 0, truncated: false };
        var result = { capturedAtLocal: stamp(), state: {}, sampling: {} };
        var project = app.project;
        result.state.project = {
            revision: observe(function () { return project.revision; }, "number"),
            dirty: observe(function () { return project.dirty; }, "boolean"),
            file: observe(function () { return project.file ? project.file.fsName : null; }, "string"),
            numItems: observe(function () { return project.numItems; }, "number")
        };
        var active = {status: "OK", value: comp};
        if (active.status !== "OK" || !(active.value instanceof CompItem)) {
            result.state.activeComposition = unknown("NO_ACTIVE_COMPOSITION");
            result.sampling.elapsedMs = new Date().getTime() - start; return result;
        }
        var comp = active.value;
        var layerCount = observe(function () { return comp.numLayers; }, "number");
        var composition = { id: observe(function () { return comp.id; }, "number"), name: observe(function () { return comp.name; }, "string"), time: observe(function () { return comp.time; }, "number"), numLayers: layerCount, layers: [] };
        result.state.activeComposition = composition;
        var selected = observe(function () { return comp.selectedLayers; });
        if (selected.status === "OK") {
            var selection = [];
            for (var si = 0; si < selected.value.length; si++) {
                var selectedLayer = selected.value[si];
                selection.push({ id: observe(function () { return selectedLayer.id; }, "number"), index: observe(function () { return selectedLayer.index; }, "number") });
            }
            composition.selectedLayers = { status: "OK", value: selection };
        } else { composition.selectedLayers = selected; }
        if (layerCount.status === "OK") {
            for (var li = 1; li <= layerCount.value && li <= MAX_LAYERS; li++) {
                var layerObservation = observe(function () { return comp.layer(li); });
                var row = { index: li };
                composition.layers.push(row);
                if (layerObservation.status !== "OK") { row.layer = layerObservation; continue; }
                var layer = layerObservation.value;
                var kind = layerKind(layer); row.kind = kind.kind; row.kindChecks = kind;
                row.id = observe(function () { return layer.id; }, "number"); row.name = observe(function () { return layer.name; }, "string");
                row.selected = observe(function () { return layer.selected; }, "boolean"); row.active = observe(function () { return layer.active; }, "boolean");
                row.selectedProperties = selectedProperties(layer);
                var groupValue;
                var group = observe(function () { groupValue = layer.property("ADBE Text Properties"); return groupValue; });
                if (group.status !== "OK") {
                    row.sourceText = groupValue === null && (row.kind === "SOLID" || row.kind === "NON_TEXT") ? { classification: "NOT_APPLICABLE", reason: "KNOWN_NON_TEXT_LAYER_WITH_NULL_TEXT_GROUP" } : group;
                    continue;
                }
                var source = observe(function () { return group.value.property("ADBE Text Document"); });
                if (source.status !== "OK") { row.sourceText = source; continue; }
                var prop = source.value;
                var expression = observe(function () { return prop.expressionEnabled; }, "boolean");
                var keys = observe(function () { return prop.numKeys; }, "number");
                row.sourceText = { expressionEnabled: expression, expression: observe(function () { return prop.expression; }, "string"), expressionError: observe(function () { return prop.expressionError; }, "string"), numKeys: keys, classification: expression.status !== "OK" || keys.status !== "OK" ? "UNKNOWN" : expression.value ? "EXPRESSION" : keys.value > 0 ? "ANIMATED" : "STATIC", current: sampleDocument(observe(function () { return prop.value; }), budget), keys: [] };
                if (keys.status === "OK") {
                    for (var ki = 1; ki <= keys.value && ki <= MAX_KEYS; ki++) {
                        row.sourceText.keys.push({ index: ki, time: observe(function () { return prop.keyTime(ki); }, "number"), document: sampleDocument(observe(function () { return prop.keyValue(ki); }), budget) });
                    }
                    if (keys.value > MAX_KEYS) { budget.truncated = true; row.sourceText.keysTruncated = true; }
                }
            }
            if (layerCount.value > MAX_LAYERS) { budget.truncated = true; composition.layersTruncated = true; }
        }
        result.sampling = { elapsedMs: new Date().getTime() - start, characters: budget.characters, truncated: budget.truncated, limits: { layers: MAX_LAYERS, keysPerLayer: MAX_KEYS, charactersPerDocument: MAX_CHARACTERS_PER_DOCUMENT, totalCharacters: MAX_TOTAL_CHARACTERS } };
        return result;
    }


    var directory=new File($.fileName).parent, repository=directory.parent.parent;
    var operator=new Folder(repository.fsName+'/artifacts/native/F02-operator');
    var PS='ZenKakuGothicNew-Regular';
    var out={schema:'JPFP-ZEN-AUTHOR-1',started:new Date().toString(),timezoneOffsetMinutes:new Date().getTimezoneOffset(),host:{computer:$.getenv('COMPUTERNAME'),os:$.os,version:app.version,buildName:app.buildName,buildNumber:app.buildNumber,locale:app.isoLanguage},requestedPostScriptName:PS};
    function allComps(){var a=[];for(var i=1;i<=app.project.numItems;i++){var c=app.project.item(i);if(c instanceof CompItem)a.push(snapshot(c));}return a;}
    function f02(){var c=null;for(var i=1;i<=app.project.numItems;i++){var x=app.project.item(i);if(x instanceof CompItem&&x.name==='JPFP_BETA_FIXTURES__DISPOSABLE')c=x;}if(!c||c.numLayers!==12)throw Error('aggregate mismatch');var l=c.layer('[F02] VERIFIED_FIXTURE_CANDIDATE');out.compositionID=c.id;out.layerID=l.id;return l.property('ADBE Text Properties').property('ADBE Text Document');}
    function freshCharacters(){var a=[],p=f02();if(p.numKeys!==0||p.expressionEnabled!==false||p.value.text!=='\u6b20\u843d\u30d5\u30a9\u30f3\u30c8')throw Error('F02 static/text mismatch');for(var k=0;k<6;k++){var d=p.value, f=d.characterRange(k,k+1).fontObject;a.push({start:k,end:k+1,text:d.text.charAt(k),postScriptName:f.postScriptName,fontID:f.fontID,isSubstitute:f.isSubstitute,hasGlyph:f.hasGlyphsFor(d.text.charAt(k))});}return a;}
    function allRetained(a){for(var i=0;i<6;i++){if(a[i].postScriptName!==PS||a[i].isSubstitute!==false||a[i].hasGlyph!==true)return false;}return a.length===6;}
    function preserved(b,a){for(var i=0;i<b.length;i++){var bc=b[i].state.activeComposition,ac=a[i].state.activeComposition;for(var j=0;j<bc.layers.length;j++){if(bc.layers[j].name.value==='[F02] VERIFIED_FIXTURE_CANDIDATE'){bc.layers[j].sourceText.current.characters=[];ac.layers[j].sourceText.current.characters=[];}}if(json(bc)!==json(ac))return false;}return true;}
    try{
        if(out.host.computer!=='AYAKUMI_NOZOMI')throw Error('Wrong authoring host');
        if(app.project.dirty)throw Error('Current disposable project has unsaved changes');
        var installed=app.fonts.getFontsByPostScriptName(PS);out.candidates=[];
        for(var i=0;i<installed.length;i++){var f=installed[i];out.candidates.push({postScriptName:f.postScriptName,fontID:f.fontID,version:f.version,location:f.location,isSubstitute:f.isSubstitute,allSixCoverage:f.hasGlyphsFor('\u6b20\u843d\u30d5\u30a9\u30f3\u30c8')});}
        writeNew('main-font-observed.json',out.candidates,directory);
        if(installed.length!==1||installed[0].isSubstitute!==false||out.candidates[0].allSixCoverage!==true)throw Error('Approved installed font or six-character native coverage not established');
        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        var source=new File(repository.fsName+'/evidence/native-20261017-resumed/JPFP_BETA_VERIFIED_EXCEPT_F02.aep'),input=new File(operator.fsName+'/Zen-author-work.aep');
        if(input.exists||!source.copy(input.fsName))throw Error('fresh disposable copy failed');app.open(input);
        var before=allComps();writeNew('main-before.json',before,directory);
        out.beforeCharacters=freshCharacters();var p=f02(),td=p.value;td.font=PS;out.localFont=td.font;p.setValue(td);
        out.afterAssignment=freshCharacters();var after=allComps();writeNew('main-after-assignment.json',after,directory);
        out.otherConditionsPreservedAfterAssignment=preserved(before,after);
        var save=new File(operator.fsName+'/Zen-persistence-test.aep');if(save.exists)throw Error('save exists');app.project.save(save);out.saveTime=new Date().toString();out.savedProject=save.fsName;
        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.open(save);out.afterReopen=freshCharacters();var reopened=allComps();writeNew('main-after-reopen.json',reopened,directory);
        // Reload untouched before evidence, so comparison above cannot suppress raw evidence.
        out.otherConditionsPreservedAfterReopen=preserved(before,reopened);
        if(!allRetained(out.afterAssignment)||!allRetained(out.afterReopen)||!out.otherConditionsPreservedAfterAssignment||!out.otherConditionsPreservedAfterReopen)throw Error('Approved font failed persistence or other conditions changed');
        var genuine=new File(operator.fsName+'/genuine-F02.aep');if(genuine.exists||!save.copy(genuine.fsName))throw Error('genuine copy failed');out.genuineProject=genuine.fsName;out.status='AUTHORING_PERSISTENCE_VERIFIED';
    }catch(e){out.status='AUTHORING_BLOCKED';out.error=String(e);}
    out.completed=new Date().toString();writeNew('main-author-outcome.json',out,directory);alert(out.status+'\n'+(out.genuineProject||out.error));
}());
