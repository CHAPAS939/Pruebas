// Actual packaged Tauri/WebView2 app. Browser preview mocks are never loaded.
const {spawn,spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.COUCOU_QA_PLAYWRIGHT||'playwright');
const out=path.resolve(process.env.COUCOU_QA_OUT||'build/mochi-native-qa/windows');fs.mkdirSync(out,{recursive:true});
const helper=path.resolve('scripts/qa-windows-desktop.ps1'),wait=ms=>new Promise(r=>setTimeout(r,ms));
function ps(action,args={}){const a=['-NoProfile','-ExecutionPolicy','Bypass','-File',helper,'-Action',action];for(const[k,v]of Object.entries(args))a.push('-'+k,String(v));const r=spawnSync('pwsh',a,{encoding:'utf8',timeout:25000,windowsHide:true});if(r.status!==0)throw Error(r.stderr||`Native helper ${action} failed`);return r.stdout.trim();}
const performanceResults={},proof={nativeApp:true,bridge:'real Tauri IPC',tests:{},errors:[]};
(async()=>{
 let app,browser,fixture,recorder;const fixtureFile=path.join(out,'fixture.json');
 try{
  const data=path.join(out,'profile');fs.mkdirSync(path.join(data,'Coucou'),{recursive:true});
  fs.writeFileSync(path.join(data,'Coucou','settings.json'),JSON.stringify({language:'en',soundEnabled:false,autostart:false,hooksInstalled:true,activeIntegrations:[],mochiSkin:'diamond',mochiOutfit:'witchHat',mochiOutfitGlasses:'roundGlasses',mochiOutfitScarf:true}));
  app=spawn(path.resolve('windows/target/release/coucou.exe'),[],{env:{...process.env,APPDATA:data,LOCALAPPDATA:path.join(data,'local'),WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:'--remote-debugging-port=9222'},stdio:'ignore'});
  for(let i=0;i<90;i++){try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222');break}catch{await wait(1000)}}
  assert.ok(browser,'The actual WebView2 debug endpoint must become ready');
  const pages=()=>browser.contexts().flatMap(c=>c.pages());
  async function pageFor(name){for(let i=0;i<60;i++){const p=pages().find(x=>{try{const u=new URL(x.url());return name==='index.html'?/^\/(index.html)?$/.test(u.pathname)&&u.hostname.includes('tauri'):u.pathname.endsWith('/'+name)}catch{return false}});if(p){await p.waitForFunction(()=>!!window.__TAURI_INTERNALS__);return p}await wait(500)}throw Error(`Native window ${name} not found`)}
  const island=await pageFor('index.html');
  const invoke=(page,cmd,args={})=>page.evaluate(([name,data])=>window.__TAURI_INTERNALS__.invoke(name,data),[cmd,args]);
  const boot=await invoke(island,'boot');assert.equal(boot.version,JSON.parse(fs.readFileSync('mochi-preview.json')).version);proof.version=boot.version;
  await wait(3000);performanceResults.closedAtStartup=JSON.parse(ps('sample',{AppPid:app.pid}));
  await invoke(island,'open_mochi_studio');const studio=await pageFor('studio.html');
  const frame=()=>studio.frames().find(f=>f.url().includes('scene=home'));
  for(let i=0;i<60&&!frame();i++)await wait(500);assert.ok(frame(),'Native room frame must load');
  await frame().waitForFunction(()=>!!document.querySelector('canvas')&&window.MochiScene?.paused===false,{},{timeout:45000});
  const ui=studio.locator('.mochi-studio-host');await ui.getByRole('button',{name:'Gamer',exact:true}).click();
  await ui.getByRole('tab',{name:'Wardrobe',exact:true}).click();await ui.getByRole('button',{name:'Diamonds',exact:true}).click();
  await frame().waitForFunction(()=>document.getElementById('stage').dataset.skin==='diamond');
  ps('capture',{Out:path.join(out,'01-native-studio.png')});proof.tests.roomAndWardrobe=true;
  performanceResults.studioOpen=JSON.parse(ps('sample',{AppPid:app.pid}));
  let windows=JSON.parse(ps('state',{AppPid:app.pid}));let nativeStudio=windows.find(w=>w.title.includes('Mochi Studio'));assert.ok(nativeStudio);
  ps('minimize',{Handle:nativeStudio.handle});await frame().waitForFunction(()=>window.MochiScene.paused===true);proof.tests.minimizedPauses=true;
  await invoke(island,'open_mochi_studio');await frame().waitForFunction(()=>window.MochiScene.paused===false);proof.tests.restoreResumes=true;
  ps('close',{Handle:nativeStudio.handle});await frame().waitForFunction(()=>window.MochiScene.paused===true);assert.equal(studio.isClosed(),false);proof.tests.closeKeepsReusableWindow=true;
  performanceResults.studioClosed=JSON.parse(ps('sample',{AppPid:app.pid}));
  await invoke(island,'open_mochi_studio');await frame().waitForFunction(()=>window.MochiScene.paused===false);proof.tests.reopenRenders=true;
  ps('close',{Handle:nativeStudio.handle});
  fixture=spawn('pwsh',['-NoProfile','-ExecutionPolicy','Bypass','-File',helper,'-Action','fixture','-Out',fixtureFile],{stdio:'ignore'});
  for(let i=0;i<30&&!fs.existsSync(fixtureFile);i++)await wait(500);const targets=JSON.parse(fs.readFileSync(fixtureFile,'utf8').replace(/^\uFEFF/,''));
  assert.equal(await invoke(island,'desktop_mochi_fly_out',{anywhere:true}),true);const desktop=await pageFor('mochi.html');
  await wait(1200);windows=JSON.parse(ps('state',{AppPid:app.pid}));const mochi=windows.find(w=>w.title==='Mochi'&&w.x>=0&&w.width>=110&&w.width<=250);assert.ok(mochi,'Native Mochi window is visible');
  const frames=path.join(out,'native-frames');recorder=spawn('pwsh',['-NoProfile','-ExecutionPolicy','Bypass','-File',helper,'-Action','record','-Out',frames],{stdio:'ignore'});await wait(1500);
  const target=targets[0],drop={x:target.x+Math.round(target.width*.55),y:target.y+3};
  ps('drag',{X:mochi.x+Math.round(mochi.width/2),Y:mochi.y+Math.round(mochi.height/2),EndX:drop.x,EndY:drop.y});await wait(1000);
  const perch=desktop.frames().find(f=>f.url().includes('scene=perch'));assert.ok(perch,'Native perch renderer loaded');
  await perch.waitForFunction(()=>document.getElementById('stage').dataset.grip==='true'&&document.getElementById('stage').dataset.skin==='diamond',{},{timeout:15000});
  const before=JSON.parse(ps('state',{AppPid:app.pid})).find(w=>w.handle===mochi.handle);proof.tests.automaticGripWithCombinedAppearance=true;ps('capture',{Out:path.join(out,'02-native-grip.png')});
  ps('move',{Handle:target.handle,X:target.x+35,Y:target.y+25});await wait(1000);const after=JSON.parse(ps('state',{AppPid:app.pid})).find(w=>w.handle===mochi.handle);
  assert.ok(Math.abs(after.x-before.x-35)<=3&&Math.abs(after.y-before.y-25)<=3,'Mochi follows the actual native target window');proof.tests.nativeWindowFollow=true;ps('capture',{Out:path.join(out,'03-native-follow.png')});
  assert.equal(await invoke(island,'desktop_mochi_jump',{reduceMotion:false}),true);await wait(1200);await perch.waitForFunction(()=>document.getElementById('stage').dataset.grip==='true');proof.tests.nativeWindowJump=true;ps('capture',{Out:path.join(out,'04-native-jump.png')});
  performanceResults.perched=JSON.parse(ps('sample',{AppPid:app.pid}));
  fs.writeFileSync(path.join(frames,'stop'),'');await new Promise(resolve=>{recorder.on('exit',resolve);setTimeout(resolve,5000)});
  proof.passed=true;
 }catch(error){proof.passed=false;proof.errors.push(String(error.stack||error));try{ps('capture',{Out:path.join(out,'failure.png')})}catch{}process.exitCode=1;}
 finally{
  fs.writeFileSync(path.join(out,'native-validation.json'),JSON.stringify(proof,null,2));fs.writeFileSync(path.join(out,'performance.json'),JSON.stringify(performanceResults,null,2));
  try{fs.writeFileSync(fixtureFile+'.stop','');fs.writeFileSync(path.join(out,'native-frames','stop'),'')}catch{}
  if(browser)await browser.close().catch(()=>{});if(app)app.kill();if(fixture)fixture.kill();if(recorder)recorder.kill();
  console.log(JSON.stringify(proof));console.log('Native resource measurements:',JSON.stringify(performanceResults));
 }
})();
