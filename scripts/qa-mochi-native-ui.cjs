// End-to-end tests of the installed release, using Windows accessibility and input.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const out=path.resolve('build/mochi-native-qa/windows');fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms)),helper=path.resolve('scripts/qa-windows-desktop.ps1');
const proof={nativeApp:true,bridge:'native Windows UI Automation and physical input; no development bridge',tests:{},errors:[]},performanceResults={};
function command(exe,file,action,args={}){const a=['-NoProfile','-ExecutionPolicy','Bypass','-File',file,'-Action',action];for(const[k,v]of Object.entries(args))a.push('-'+k,String(v));const r=spawnSync(exe,a,{encoding:'utf8',timeout:30000,windowsHide:true});if(r.status!==0)throw Error(r.stderr||r.stdout||`Native ${action} failed`);return r.stdout.trim();}
const ps=(action,args={})=>command('pwsh',helper,action,args);
const uia=(action,args={})=>command('powershell.exe',path.resolve('scripts/qa-windows-uia.ps1'),action,args);
async function invoke(handle,pattern){let last;for(let i=0;i<8;i++){try{return uia('invoke',{Handle:handle,Pattern:pattern})}catch(e){last=e;if(e.message.includes('does not expose an invocation pattern')){const rows=JSON.parse(uia('tree',{Handle:handle}));const row=rows.find(v=>new RegExp(pattern,'i').test(v.name)&&!v.offscreen&&v.enabled&&v.rect.width>0&&v.rect.height>0&&/Button|TabItem|MenuItem|CheckBox/.test(v.type));if(row){ps('click',{X:Math.round(row.rect.x+row.rect.width/2),Y:Math.round(row.rect.y+row.rect.height/2)});return {method:'physical click on accessible native control',name:row.name}}}await wait(900)}}throw last;}
(async()=>{
 let app,fixture,recorder;const fixtureFile=path.join(out,'fixture.json'),profile=path.join(out,'profile'),settingsFile=path.join(profile,'Coucou','settings.json');
 function launch(){app=spawn(path.resolve(process.env.COUCOU_QA_EXE),[],{cwd:path.dirname(process.env.COUCOU_QA_EXE),env:{...process.env,APPDATA:profile},stdio:'ignore',windowsHide:true});return app;}
 function windows(){return JSON.parse(ps('state',{AppPid:app.pid}));}
 async function until(fn,label,tries=30){for(let i=0;i<tries;i++){const v=fn();if(v)return v;await wait(500)}throw Error(label);}
 async function stop(){if(!app)return;const p=app;if(p.exitCode===null){p.kill();await new Promise(r=>{p.once('exit',r);setTimeout(r,3000)})}app=null;}
 function closeHub(){for(const w of windows().filter(w=>w.title==='Coucou'&&w.visible&&w.width>800))ps('close',{Handle:w.handle});}
 async function readyIsland(){
  const island=await until(()=>windows().find(w=>w.title==='Coucou'&&w.width>=700&&w.width<800),'Native island window did not initialize',45);
  await until(()=>JSON.parse(uia('tree',{Handle:island.handle})).some(row=>row.name==='Overview'&&row.type==='ControlType.Button'),'Native island web content did not initialize',30);closeHub();return island;
 }
 async function openStudio(){
  const island=await readyIsland();
  ps('hover',{X:Math.round(island.x+island.width/2),Y:15});await wait(1000);
  await invoke(island.handle,'Mochi.*room');await wait(1800);
  await invoke(island.handle,'^Open studio$');await wait(2000);
  const studio=await until(()=>windows().find(w=>w.title.includes('Mochi Studio')&&w.visible&&!w.minimized),'Native Studio did not become visible');
  // UIA does not move the pointer away as a user would. Fold the always-on-top
  // island before clicking controls in the separate native Studio underneath it.
  await invoke(island.handle,'^Close$');ps('hover',{X:30,Y:700});ps('show',{Handle:studio.handle});await wait(800);return studio;
 }
 try{
  const manifest=JSON.parse(fs.readFileSync('build/native-input/build-manifest.json','utf8'));
  proof.source_commit=manifest.source_commit;proof.version=manifest.version;proof.harness_commit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',cwd:fs.existsSync('native-controller/.git')?'native-controller':process.cwd()}).stdout.trim();
  proof.executable_sha256=crypto.createHash('sha256').update(fs.readFileSync(process.env.COUCOU_QA_EXE)).digest('hex');
  fs.mkdirSync(path.dirname(settingsFile),{recursive:true});fs.writeFileSync(settingsFile,JSON.stringify({language:'en',soundEnabled:false,autostart:false,hooksInstalled:true,openOnHover:true,activeIntegrations:[],mochiSkin:'diamond',mochiOutfit:'frogHat',mochiOutfitGlasses:'roundGlasses',mochiOutfitScarf:true,desktopMochi:{onDesktop:false,spot:null}}));
  proof.desktop_preparation=JSON.parse(ps('prepare-desktop'));launch();await wait(6000);assert.equal(app.exitCode,null,'Installed app remains running');proof.tests.installedAppStarts=true;await readyIsland();
  performanceResults.closedAtStartup=JSON.parse(ps('sample',{AppPid:app.pid}));
  let studio=await openStudio();
  await invoke(studio.handle,'^Gamer$');await wait(700);
  await invoke(studio.handle,'^Wardrobe$');await wait(700);
  await invoke(studio.handle,'^Diamonds$');await wait(1200);
  const saved=JSON.parse(fs.readFileSync(settingsFile));assert.equal(saved.mochiRoomStyle,'gamer');assert.equal(saved.mochiSkin,'diamond');proof.tests.nativeRoomAndWardrobePersist=true;
  ps('capture',{Out:path.join(out,'01-native-studio.png')});
  ps('hover',{X:30,Y:700});await wait(16000);performanceResults.studioOpen=JSON.parse(ps('sample',{AppPid:app.pid}));
  ps('minimize',{Handle:studio.handle});await wait(600);assert.ok(windows().find(w=>w.handle===studio.handle)?.minimized);proof.tests.nativeMinimize=true;
  ps('show',{Handle:studio.handle});await wait(1200);assert.ok(windows().find(w=>w.handle===studio.handle)?.visible&&!windows().find(w=>w.handle===studio.handle)?.minimized);proof.tests.nativeRestore=true;
  ps('close',{Handle:studio.handle});await wait(900);assert.equal(windows().find(w=>w.handle===studio.handle)?.visible,false);proof.tests.closeHidesReusableWindow=true;
  performanceResults.studioClosed=JSON.parse(ps('sample',{AppPid:app.pid}));
  const reopened=await openStudio();assert.equal(reopened.handle,studio.handle);await invoke(reopened.handle,'^Room$');proof.tests.reopenSameNativeWindow=true;
  ps('close',{Handle:studio.handle});await stop();
  const persisted=JSON.parse(fs.readFileSync(settingsFile));persisted.desktopMochi={onDesktop:false,spot:null};fs.writeFileSync(settingsFile,JSON.stringify(persisted));
  launch();await wait(6500);await readyIsland();
  const restored=JSON.parse(fs.readFileSync(settingsFile));assert.equal(restored.mochiRoomStyle,'gamer');assert.equal(restored.mochiSkin,'diamond');proof.tests.preferencesSurviveActualRestart=true;
  const island=windows().find(w=>w.title==='Coucou'&&w.width===720);assert.ok(island);
  ps('hover',{X:Math.round(island.x+island.width/2),Y:15});await invoke(island.handle,'^Overview$');await wait(1600);
  // Canvas hit target in the public Overview layout (640px panel, body at 68,101).
  // Drag directly from the island, as the user does; no shortcut or app IPC.
  const grab={x:Math.round(island.x+(island.width-640)/2+68),y:island.y+101};
  const mochi=windows().find(w=>w.title==='Mochi'&&w.width>=100&&w.width<=250&&w.height>=100);assert.ok(mochi);
  proof.desktop_before_drag={...mochi,source:'island',grab};ps('capture',{Out:path.join(out,'00-native-desktop.png')});
  fixture=spawn('pwsh',['-NoProfile','-ExecutionPolicy','Bypass','-File',helper,'-Action','fixture','-Out',fixtureFile],{stdio:'ignore',windowsHide:true});
  await until(()=>fs.existsSync(fixtureFile),'Native target windows not created');const targets=JSON.parse(fs.readFileSync(fixtureFile,'utf8').replace(/^\uFEFF/,''));
  const visibleFixtures=JSON.parse(ps('state',{AppPid:fixture.pid})).filter(w=>w.visible&&w.width>100&&w.height>100);assert.equal(visibleFixtures.length,2,'Both real fixture windows must be visible');proof.fixture_windows=visibleFixtures;
  const frames=path.join(out,'native-frames');recorder=spawn('pwsh',['-NoProfile','-ExecutionPolicy','Bypass','-File',helper,'-Action','record','-Out',frames],{stdio:'ignore',windowsHide:true});await wait(1800);
  const target=targets[0];proof.input_drag=JSON.parse(ps('drag',{X:grab.x,Y:grab.y,EndX:target.x+Math.round(target.width*.55),EndY:target.y+3}));await wait(900);
  const before=windows().find(w=>w.handle===mochi.handle);ps('capture',{Out:path.join(out,'02-native-grip.png')});
  ps('move',{Handle:target.handle,X:target.x+35,Y:target.y+25});await wait(900);const after=windows().find(w=>w.handle===mochi.handle);
  proof.attachment_trace={initial:mochi,before,after,target,settings:JSON.parse(fs.readFileSync(settingsFile)).desktopMochi};
  assert.ok(Math.abs(after.x-before.x-35)<=3&&Math.abs(after.y-before.y-25)<=3,'Actual Mochi must attach and follow the native target window');proof.tests.automaticNativeGripAndFollow=true;ps('capture',{Out:path.join(out,'03-native-follow.png')});
  ps('context',{X:Math.round(after.x+after.width/2),Y:Math.round(after.y+after.height/2)});await invoke(0,'^Jump to another window$');await wait(1500);
  const jumped=windows().find(w=>w.handle===mochi.handle);assert.ok(jumped.y<after.y-60,'Mochi must jump to the higher native target');proof.tests.nativeWindowJump=true;ps('capture',{Out:path.join(out,'04-native-jump.png')});
  performanceResults.perched=JSON.parse(ps('sample',{AppPid:app.pid}));fs.writeFileSync(path.join(frames,'stop'),'');await new Promise(r=>{recorder.once('exit',r);setTimeout(r,5000)});proof.passed=true;
 }catch(error){proof.passed=false;proof.errors.push(String(error.stack||error));try{ps('capture',{Out:path.join(out,'failure.png')});if(app){const ws=windows();console.log('Native windows:',JSON.stringify(ws));const studio=ws.find(w=>w.title.includes('Mochi Studio')&&w.visible),island=ws.find(w=>w.title==='Coucou'&&w.width===720);const handle=studio?.handle||island?.handle;if(handle){const tree=uia('tree',{Handle:handle});fs.writeFileSync(path.join(out,'accessibility-tree.json'),tree);console.log('Native controls:',tree.slice(-14000))}}}catch(e){console.log('Accessibility diagnostics:',e.message)}process.exitCode=1;
 }finally{
  try{fs.writeFileSync(fixtureFile+'.stop','');fs.writeFileSync(path.join(out,'native-frames','stop'),'')}catch{}
  await stop();if(fixture)fixture.kill();if(recorder)recorder.kill();fs.writeFileSync(path.join(out,'native-validation.json'),JSON.stringify(proof,null,2));fs.writeFileSync(path.join(out,'performance.json'),JSON.stringify(performanceResults,null,2));console.log(JSON.stringify(proof));console.log('Native resource measurements:',JSON.stringify(performanceResults));
 }
})();
