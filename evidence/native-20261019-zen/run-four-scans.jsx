#target aftereffects
(function JPFP_Genuine_Sequence(){
var root=new Folder(new File($.fileName).parent.parent.fsName+'/F02ZEN'), ev=new Folder(root.fsName+'/evidence/native-20261019-zen');
function save(n,o){var f=new File(ev.fsName+'/'+n);if(f.exists)throw Error('Refuse overwrite '+n);f.encoding='UTF-8';f.lineFeed='Unix';if(!f.open('w'))throw Error('write denied');f.write(o.toSource());f.close();}
var log={schema:'JPFP-GENUINE-SEQUENCE-1',started:new Date().toString(),steps:[],normalProductDialogs:true,edits:'No text/font/project setters; viewer activation only before each composition pair'};
try{
var f=new File(ev.fsName+'/sandbox-preflight.json');f.encoding='UTF-8';if(!f.open('r'))throw Error('Preflight absent');var p=eval('('+f.read()+')');f.close();if(p.status!=='GENUINE_MISSING_REFERENCE_OBSERVED')throw Error('Native missing prerequisite not established');
var guard=new File(ev.fsName+'/sequence-started.txt');if(guard.exists)throw Error('Sequence already started');if(!guard.open('w'))throw Error('Cannot record sequence start');guard.write(log.started);guard.close();
var ids=[1,26],names=['JPFP_BETA_FIXTURES__DISPOSABLE','JPFP_BETA_L01__DISPOSABLE'];
for(var c=0;c<2;c++){var comp=app.project.itemByID(ids[c]);if(!(comp instanceof CompItem)||comp.name!==names[c])throw Error('Bound composition mismatch');comp.openInViewer();for(var r=1;r<=2;r++){var before=app.project.revision;var step={compositionID:comp.id,compositionName:comp.name,run:r,started:new Date().toString(),revisionBefore:before};$.evalFile(new File(root.fsName+'/diagnostics/beta/JPFP_Beta_Scan_With_State.jsx'));step.completed=new Date().toString();step.revisionAfter=app.project.revision;log.steps.push(step);if(step.revisionAfter!==before)throw Error('Revision changed; stop');}}
log.status='FOUR_WRAPPER_INVOCATIONS_COMPLETED';
}catch(e){log.status='BLOCKED';log.error=String(e);}log.completed=new Date().toString();save('sequence-result.jsdata',log);alert(log.status+'\n'+(log.error||'Review all raw wrapper outputs and reports before acceptance'));
}());
