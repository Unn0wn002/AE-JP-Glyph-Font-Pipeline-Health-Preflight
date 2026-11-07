#target aftereffects

/* Native evidence wrapper. Project reads only; writes JSON evidence files only.
 * Runs the exact product script with its normal export and summary dialogs.
 * Sampling is diagnostic observation, not rendered fallback/shaping validation.
 */
(function JPFP_Sandbox_Genuine_Preflight() {
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

function sha256Binary(s){
var k=[],h=[],p=2,n=0;while(n<64){var prime=true;for(var j=2;j*j<=p;j++){if(p%j===0){prime=false;break;}}if(prime){if(n<8)h[n]=(Math.sqrt(p)%1*4294967296)|0;k[n]=(Math.pow(p,1/3)%1*4294967296)|0;n++;}p++;}
var w=[],len=s.length;for(var i=0;i<len;i++)w[i>>2]=(w[i>>2]||0)|((s.charCodeAt(i)&255)<<(24-(i%4)*8));w[len>>2]=(w[len>>2]||0)|(128<<(24-(len%4)*8));var total=(((len+8)>>6)+1)*16;for(var i=0;i<total;i++)if(w[i]===undefined)w[i]=0;w[total-2]=Math.floor(len/536870912);w[total-1]=(len*8)|0;
function r(x,n){return (x>>>n)|(x<<(32-n));}for(var off=0;off<total;off+=16){var a=h.slice(0),v=[];for(var t=0;t<64;t++){if(t<16)v[t]=w[off+t];else{var x=v[t-15],y=v[t-2];v[t]=(v[t-16]+(r(x,7)^r(x,18)^(x>>>3))+v[t-7]+(r(y,17)^r(y,19)^(y>>>10)))|0;}var e=a[4],z=a[0],t1=(a[7]+(r(e,6)^r(e,11)^r(e,25))+((e&a[5])^(~e&a[6]))+k[t]+v[t])|0,t2=((r(z,2)^r(z,13)^r(z,22))+((z&a[1])^(z&a[2])^(a[1]&a[2])))|0;a=[(t1+t2)|0,a[0],a[1],a[2],(a[3]+t1)|0,a[4],a[5],a[6]];}for(var q=0;q<8;q++)h[q]=(h[q]+a[q])|0;}
var out='';for(var i=0;i<8;i++){var x=(h[i]>>>0).toString(16);while(x.length<8)x='0'+x;out+=x;}return out;}
function hashFile(file){file.encoding='BINARY';if(!file.open('r'))throw Error('hash open failed '+file.fsName);var s=file.read();file.close();return sha256Binary(s);}

var dir=new File($.fileName).parent,ev=new Folder(dir.fsName+'/evidence/native-20261019-zen'),PS='ZenKakuGothicNew-Regular';var o={schema:'JPFP-SANDBOX-GENUINE-1',started:new Date().toString(),host:{computer:$.getenv('COMPUTERNAME'),version:app.version,buildName:app.buildName,buildNumber:app.buildNumber,locale:app.isoLanguage,os:$.os}};
function fonts(a){var z=[];for(var i=0;i<a.length;i++){var f=a[i];z.push({postScriptName:f.postScriptName,fontID:f.fontID,isSubstitute:f.isSubstitute,version:f.version,location:observe(function(){return f.location;})});}return z;}
function comps(){var a=[];for(var i=1;i<=app.project.numItems;i++){var c=app.project.item(i);if(c instanceof CompItem)a.push(snapshot(c));}return a;}
try{
if(o.host.computer==='AYAKUMI_NOZOMI')throw Error('Sandbox only');if(app.project.numItems!==0||app.project.file)throw Error('Requires existing empty Sandbox project');
o.fontBefore=fonts(app.fonts.getFontsByPostScriptName(PS));if(o.fontBefore.length)throw Error('Approved font unexpectedly present before open');
o.controls={};var names=['ArialMT','Meiryo','MS-Gothic'];for(var j=0;j<names.length;j++){o.controls[names[j]]=fonts(app.fonts.getFontsByPostScriptName(names[j]));if(o.controls[names[j]].length!==1||o.controls[names[j]][0].isSubstitute!==false)throw Error('Control font unavailable');}
o.freezeBefore=app.fonts.freezeSyncSubstitutedFonts;app.fonts.freezeSyncSubstitutedFonts=true;o.freezeAfter=app.fonts.freezeSyncSubstitutedFonts;
o.hashes={};var paths=['genuine-F02.aep','fixture-provenance.txt','src/JPFP_Session1_Probe.jsx','diagnostics/beta/JPFP_Beta_Scan_With_State.jsx'];for(var j=0;j<paths.length;j++)o.hashes[paths[j]]=hashFile(new File(dir.fsName+'/'+paths[j]));writeNew('sandbox-before-open.json',o,ev);
var original=new File(dir.fsName+'/genuine-F02.aep'),work=new File(dir.fsName+'/sandbox-work.aep');if(work.exists||!original.copy(work.fsName))throw Error('Cannot preserve received original');o.workSHA256=hashFile(work);app.open(work);
o.afterOpen=comps();writeNew('sandbox-all-compositions.json',o.afterOpen,ev);o.fontAfter=fonts(app.fonts.getFontsByPostScriptName(PS));o.missingInventory=fonts(app.fonts.missingOrSubstitutedFonts);
var c=app.project.itemByID(1),l=c.layer('[F02] VERIFIED_FIXTURE_CANDIDATE'),p=l.property('ADBE Text Properties').property('ADBE Text Document');o.compositionID=c.id;o.layerID=l.id;o.f02=[];var text=p.value.text;for(var i=0;i<text.length;i++){var f=p.value.characterRange(i,i+1).fontObject;o.f02.push({start:i,end:i+1,text:text.charAt(i),postScriptName:f.postScriptName,fontID:f.fontID,isSubstitute:f.isSubstitute,hasGlyph:observe(function(){return f.hasGlyphsFor(text.charAt(i));})});if(f.postScriptName!==PS||f.isSubstitute!==true)throw Error('F02 is not genuine substitute');}
if(o.f02.length!==6||p.numKeys!==0||p.expressionEnabled!==false)throw Error('F02 static count mismatch');
var ar=app.fonts.getFontsByPostScriptName('ArialMT')[0];o.gapCandidate={postScriptName:ar.postScriptName,fontID:ar.fontID,ABC:ar.hasGlyphsFor('ABC'),han:ar.hasGlyphsFor('\u6f22')};o.status='GENUINE_MISSING_REFERENCE_OBSERVED';
}catch(e){o.status='BLOCKED';o.error=String(e);}o.completed=new Date().toString();writeNew('sandbox-preflight.json',o,ev);alert(o.status+'\n'+(o.error||'Raw readback and inventory saved; no scanner run yet'));
}());