// Run against the Vite dev server: node scripts/verify-room-layout.cjs
// Needs Playwright + Chromium. Uses the actual island, not an isolated layout mock.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const report={};
 try {
  const page=await browser.newPage({viewport:{width:720,height:560},deviceScaleFactor:2});
  page.setDefaultTimeout(8000);page.setDefaultNavigationTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:1420')+'/dev/island-preview.html?lang=es');
  await page.waitForFunction(()=>window.__island&&window.__state?.settings.language==='es');
  await page.evaluate(()=>{__state.isPinned=true;__island.alert('overview');__island.setPointerInside(true)});
  await page.getByRole('button',{name:'La habitación de Mochi',exact:true}).click();
  console.log('Room opened');
  const room=page.locator('.mochi-room');
  await page.waitForFunction(()=>document.querySelector('.mochi-room').getBoundingClientRect().height>460);
  console.log('Room layout ready');
  const frame=page.frames().find(f=>f.url().includes('scene=home'));
  assert.ok(frame,'room frame loaded');
  await frame.waitForSelector('canvas');console.log('Scene ready');
  await frame.evaluate(()=>window.roomCanvas=document.querySelector('canvas'));
  async function unobscured(locator) {
   assert.ok(await locator.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
   }),'control is inside the window and can be clicked without scrolling');
  }
  await room.getByRole('button',{name:'Guardarropa',exact:true}).click();
  const wardrobe=room.locator('.mochi-room-wardrobe');
  const glasses=wardrobe.getByRole('button',{name:'Gafas',exact:true}),scarf=wardrobe.locator('.room-toggle');
  await unobscured(glasses);await unobscured(scarf);
  assert.equal(await wardrobe.getByRole('group',{name:'Combinar atuendos'}).count(),1);
  const frog=wardrobe.getByRole('button',{name:'Gorro de rana',exact:true});await unobscured(frog);
  await frog.click();await glasses.click();await glasses.click();await scarf.click();
  await frame.waitForFunction(()=>document.getElementById('stage').dataset.glasses==='roundGlasses'&&document.getElementById('stage').dataset.scarf==='true');
  const zoomIn=room.getByRole('button',{name:'Acercar',exact:true});
  await unobscured(zoomIn);
  console.log('Combination visible and applied');
  for(let n=0;n<5;n++)await zoomIn.click();
  await frame.waitForFunction(()=>document.getElementById('stage').dataset.roomZoom==='2');
  assert.ok(await zoomIn.isDisabled());
  assert.equal(await frame.evaluate(()=>window.roomCanvas===document.querySelector('canvas')),true);
  console.log('Zoom ready');
  report.room=await room.boundingBox();report.zoom=200;
  if(process.env.ROOM_SCREENSHOTS){fs.mkdirSync(process.env.ROOM_SCREENSHOTS,{recursive:true});await page.screenshot({path:process.env.ROOM_SCREENSHOTS+'/room-detail-200.png'});}
  console.log('Reset zoom');await room.getByRole('button',{name:'Restablecer zoom',exact:true}).click();
  await frame.waitForFunction(()=>document.getElementById('stage').dataset.roomZoom==='1');console.log('Zoom reset');
  assert.ok(await room.getByRole('button',{name:'Alejar',exact:true}).isDisabled());
  for(const label of ['Acogedor','Gamer','Minimalista','Mediterráneo']){
   await room.getByRole('button',{name:'Decorar',exact:true}).click();
   await room.locator('.room-style').filter({hasText:label}).click();
  }
  await room.getByRole('button',{name:'Guardarropa',exact:true}).click();
  if(process.env.ROOM_SCREENSHOTS)await page.screenshot({path:process.env.ROOM_SCREENSHOTS+'/room-detail-100.png'});
  // Standalone wardrobe used by the context menu must expose the same controls.
  console.log('Standalone wardrobe');await page.evaluate(()=>__island.wardrobeAnywhere());
  const standalone=page.locator('.view.wardrobe:not(.mochi-room-wardrobe)');
  await page.waitForFunction(()=>document.querySelector('.view.wardrobe:not(.mochi-room-wardrobe)').classList.contains('on'));
  const standaloneGlasses=standalone.getByRole('button',{name:'Gafas',exact:true});
  await unobscured(standaloneGlasses);await unobscured(standalone.locator('.room-toggle'));
  assert.equal(await standalone.locator('.room-toggle').getAttribute('aria-pressed'),'true');
  await standaloneGlasses.click();
  assert.equal(await page.evaluate(()=>__state.settings.mochiOutfitGlasses),'none');
  if(process.env.ROOM_SCREENSHOTS)await page.screenshot({path:process.env.ROOM_SCREENSHOTS+'/wardrobe-combinations-fixed.png'});
  assert.deepEqual(errors,[]);report.combinationsVisibleInBothViews=true;report.sameRenderer=true;report.errors=errors;
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
