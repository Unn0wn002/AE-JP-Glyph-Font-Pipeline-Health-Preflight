#target aftereffects

/* Native evidence wrapper. Project reads only; writes JSON evidence files only.
 * Runs the exact product script with its normal export and summary dialogs.
 * Sampling is diagnostic observation, not rendered fallback/shaping validation.
 */
(function JPFP_Sandbox_Export_Hashes() {
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
function sha256BinaryFast(s){var K=[],H=[],p=2,n=0;while(n<64){var prime=true;for(var j=2;j*j<=p;j++){if(p%j===0){prime=false;break;}}if(prime){if(n<8)H[n]=(Math.sqrt(p)%1*4294967296)|0;K[n]=(Math.pow(p,1/3)%1*4294967296)|0;n++;}p++;}var len=s.length,hi=Math.floor(len/536870912),lo=(len*8)|0;s+='\x80';while(s.length%64!==56)s+='\x00';for(var j=3;j>=0;j--)s+=String.fromCharCode((hi>>>(j*8))&255);for(var j=3;j>=0;j--)s+=String.fromCharCode((lo>>>(j*8))&255);function R(x,n){return(x>>>n)|(x<<(32-n));}var W=[];for(var off=0;off<s.length;off+=64){for(var t=0;t<16;t++){var i=off+t*4;W[t]=((s.charCodeAt(i)&255)<<24)|((s.charCodeAt(i+1)&255)<<16)|((s.charCodeAt(i+2)&255)<<8)|(s.charCodeAt(i+3)&255);}var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];for(var t=0;t<64;t++){if(t>=16){var x=W[t-15],y=W[t-2];W[t]=(W[t-16]+(R(x,7)^R(x,18)^(x>>>3))+W[t-7]+(R(y,17)^R(y,19)^(y>>>10)))|0;}var T1=(h+(R(e,6)^R(e,11)^R(e,25))+((e&f)^(~e&g))+K[t]+W[t])|0,T2=((R(a,2)^R(a,13)^R(a,22))+((a&b)^(a&c)^(b&c)))|0;h=g;g=f;f=e;e=(d+T1)|0;d=c;c=b;b=a;a=(T1+T2)|0;}H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;}var out='';for(var i=0;i<8;i++){var x=(H[i]>>>0).toString(16);while(x.length<8)x='0'+x;out+=x;}return out;}
var dir=new File($.fileName).parent,desk=dir.parent,rows=[],started=new Date().toString();function walk(folder,relative){var files=folder.getFiles();for(var i=0;i<files.length;i++){var f=files[i],rel=relative+'/'+f.name;if(f instanceof Folder)walk(f,rel);else if(!/\.aep$/i.test(f.name)){f.encoding='BINARY';if(!f.open('r'))throw Error('Cannot hash '+rel);var data=f.read();f.close();rows.push({path:rel,bytes:data.length,sha256:sha256BinaryFast(data)});}}}try{walk(new Folder(desk.fsName+'/F02ZEN/evidence'),'F02ZEN/evidence');walk(new Folder(desk.fsName+'/F02RUN'),'F02RUN');writeNew('origin-sha256.json',{schema:'JPFP-SANDBOX-ORIGIN-SHA256-1',started:started,completed:new Date().toString(),host:$.getenv('COMPUTERNAME'),version:app.version,buildNumber:app.buildNumber,rows:rows},dir);alert('SANDBOX_ORIGIN_HASHES_SAVED '+rows.length+' files');}catch(e){alert('HASH_EXPORT_FAILED '+String(e));}
}());
