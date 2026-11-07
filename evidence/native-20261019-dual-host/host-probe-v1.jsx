#target aftereffects
(function(){
function safe(fn){try{var v=fn();return v===undefined?'UNKNOWN':String(v);}catch(e){return 'UNKNOWN: '+e;}}
var lines=['JPFP-HOST-FONT-INVENTORY-1'];
function row(a){lines.push(a.join('\t'));}
row(['Time',new Date().toString()]);row(['timezoneOffsetMinutes',new Date().getTimezoneOffset()]);
row(['AE',app.version,app.buildName,app.buildNumber,app.isoLanguage]);row(['OS',$.os]);row(['computerName',$.getenv('COMPUTERNAME')]);row(['userName',$.getenv('USERNAME')]);
row(['scriptFile', $.fileName]);row(['projectItems',app.project.numItems]);
row(['fontActivation',safe(function(){return app.fonts.fontsWithDefaultDesignAxes;})]);
var fonts=app.fonts.allFonts,n=0;
for(var g=0;g<fonts.length;g++){for(var i=0;i<fonts[g].length;i++){var f=fonts[g][i];row(['FONT',safe(function(){return f.postScriptName;}),safe(function(){return f.fontID;}),safe(function(){return f.isSubstitute;}),safe(function(){return f.familyName;}),safe(function(){return f.styleName;}),safe(function(){return f.version;}),safe(function(){return f.hasGlyphsFor('\u6b20\u843d\u30d5\u30a9\u30f3\u30c8');}),safe(function(){return f.location;})]);n++;}}
var out=new File(new File($.fileName).parent.fsName+'/host-inventory.txt');
if(out.exists){alert('Refusing overwrite '+out.fsName);return;}
out.encoding='UTF-8';if(!out.open('w')){alert('HOST '+app.version+' build '+app.buildNumber+' '+app.isoLanguage+' '+$.os+'; WRITE BLOCKED '+out.error);return;}out.write(lines.join('\n')+'\n');out.close();alert('Host inventory saved: '+out.fsName+'\nAE '+app.version+' build '+app.buildNumber+' '+app.isoLanguage+'\n'+$.os+'\nFonts '+n);
})();
