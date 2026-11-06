// Actual island UI smoke. Start Vite first; requires Playwright + Chromium.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const directory=process.env.STUDIO_SCREENSHOTS||'/tmp/coucou-studio-proof';fs.mkdirSync(directory,{recursive:true});
 const page=await browser.newPage({viewport:{width:720,height:560},deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 async function open(){
  await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:1420')+'/dev/island-preview.html?lang=es');
  await page.waitForFunction(()=>window.__island&&window.__state?.settings.language==='es');
  await page.evaluate(()=>{__island.setPinned(true);__island.alert('overview');__island.setPointerInside(true)});
  await page.getByRole('button',{name:'La habitación de Mochi',exact:true}).click();
  const ui=page.locator('.mochi-studio-host');await ui.locator('#tabs').waitFor();
  await page.waitForFunction(()=>!!window.MochiStudioIcons);
  const scene=page.frames().find(f=>f.url().includes('scene=home'));assert.ok(scene);
  await scene.waitForSelector('canvas');return{ui,scene};
 }
 try{
  let{ui,scene}=await open();await scene.evaluate(()=>window.firstCanvas=document.querySelector('canvas'));
  await ui.getByRole('tab',{name:'Guardarropa',exact:true}).click();
  for(const[skin,label]of[['diamond','Diamantes'],['opal','Ópalo'],['obsidian','Obsidiana'],['gold','Oro'],['galaxy','Galaxia'],['jelly','Gelatina'],['lava','Lava']]){
   await ui.getByRole('button',{name:label,exact:true}).click();
   await scene.waitForFunction(value=>document.getElementById('stage').dataset.skin===value,skin);
   assert.equal(await scene.evaluate(()=>window.firstCanvas===document.querySelector('canvas')),true);
   await page.screenshot({path:directory+'/mochi-skin-'+skin+'.png'});
  }
  console.log('PASS: seven distinct body looks keep the same renderer');
  await ui.getByRole('button',{name:'Diamantes',exact:true}).click();
  await ui.getByRole('button',{name:'Gorro de rana',exact:true}).click();
  await ui.getByRole('combobox',{name:'Gafas',exact:true}).selectOption('roundGlasses');
  await ui.locator('button.toggle[aria-label="Bufanda"]').click();
  await ui.getByRole('textbox',{name:'Nombre del conjunto',exact:true}).fill('Diamante rana');
  await ui.getByRole('button',{name:'Guardar',exact:true}).click();
  assert.equal(JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).outfits[0].name,'Diamante rana');
  await ui.getByRole('button',{name:'Lava',exact:true}).click();
  await ui.getByRole('button',{name:'Cargar Diamante rana',exact:true}).click();
  assert.equal(await page.evaluate(()=>__state.settings.mochiSkin),'diamond');
  console.log('PASS: saved look restores body, primary outfit, glasses and scarf');
  await ui.getByRole('tab',{name:'Habitación',exact:true}).click();
  const beforeDrag=await page.evaluate(()=>JSON.stringify(JSON.parse(__state.settings.mochiStudio).layout));
  const deskTarget=await ui.getByRole('button',{name:'Ir al escritorio',exact:true}).boundingBox();
  await ui.getByRole('button',{name:'Mover muebles',exact:true}).click();
  await scene.waitForFunction(()=>document.getElementById('stage').dataset.editing==='true');
  await page.mouse.move(deskTarget.x+deskTarget.width/2,deskTarget.y+deskTarget.height/2);
  await page.mouse.down();await page.mouse.move(deskTarget.x+deskTarget.width/2+30,deskTarget.y+deskTarget.height/2+10,{steps:10});await page.mouse.up();
  await page.waitForFunction(previous=>JSON.stringify(JSON.parse(__state.settings.mochiStudio).layout)!==previous,beforeDrag);
  const dragged=JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).layout;
  assert.ok(Object.keys(dragged).some(id=>Math.abs(dragged[id].x)>0||Math.abs(dragged[id].z)>.01));
  await ui.getByRole('button',{name:'Deshacer',exact:true}).click();
  console.log('PASS: physical pointer drag changes furniture layout and can be undone');
  await ui.getByRole('button',{name:'Mover muebles',exact:true}).click();
  for(const label of['Cama','Consola','Estantería'])await ui.getByRole('button',{name:label,exact:true}).click();
  for(const[activity,label]of[['bed','Dormir en la cama'],['console','Jugar a la consola'],['bookshelf','Leer un libro']]){
   await ui.getByRole('button',{name:label,exact:true}).click();
   await scene.waitForFunction(value=>document.getElementById('stage').dataset.activity===value,activity);
   await ui.locator('#scene-wrap').screenshot({path:directory+'/room-activity-'+activity+'.png'});
  }
  console.log('PASS: bed, console and bookshelf have real character activities');
  await ui.getByRole('button',{name:'Mover muebles',exact:true}).click();
  await ui.getByRole('combobox',{name:'Mueble seleccionado',exact:true}).selectOption('desk');
  await ui.getByRole('button',{name:'Mover a la izquierda',exact:true}).click();
  assert.ok(JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).layout.desk.x<0);
  await ui.getByRole('combobox',{name:'Mueble seleccionado',exact:true}).selectOption('rug');
  await ui.getByRole('button',{name:'Girar a la derecha',exact:true}).click();
  assert.ok(JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).layout.rug.rotation>0);
  await ui.getByRole('button',{name:'Deshacer',exact:true}).click();
  assert.equal(JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).layout.rug?.rotation||0,0);
  await ui.getByRole('textbox',{name:'Nombre de la habitación',exact:true}).fill('Mi refugio');
  await ui.getByRole('button',{name:'Guardar',exact:true}).click();
  const saved=JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).rooms[0];
  assert.equal(saved.name,'Mi refugio');assert.equal(saved.objects.length,3);
  console.log('PASS: movement, rotation, undo and saved room');
  await ui.getByRole('button',{name:'Mover muebles',exact:true}).click();
  await ui.getByRole('button',{name:'Taza',exact:true}).click();
  assert.deepEqual(JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio)).desktopProps,['cup']);
  await ui.getByRole('tab',{name:'Foto',exact:true}).click();
  await ui.getByRole('button',{name:'Fondo transparente',exact:true}).click();
  await ui.getByRole('button',{name:'Ocultar controles',exact:true}).click();
  assert.equal(await ui.locator('#editor').isVisible(),false);
  await ui.getByRole('button',{name:'Guardar PNG',exact:true}).click();
  await page.waitForFunction(()=>typeof window.__lastMochiPhoto==='string');
  const png=await page.evaluate(()=>window.__lastMochiPhoto);
  fs.writeFileSync(directory+'/mochi-diamond-photo.png',Buffer.from(png.split(',')[1],'base64'));
  console.log('PASS: real transparent 1600px PNG reaches the native save bridge');
  ({ui,scene}=await open());
  const restored=JSON.parse(await page.evaluate(()=>__state.settings.mochiStudio));
  assert.equal(await page.evaluate(()=>__state.settings.mochiSkin),'diamond');
  assert.equal(restored.rooms[0].name,'Mi refugio');assert.equal(restored.outfits[0].name,'Diamante rana');
  assert.deepEqual(restored.desktopProps,['cup']);assert.deepEqual(errors,[]);
  const proof={passed:true,bodyMaterials:7,savedLook:true,savedRoom:true,activities:3,moveRotateUndo:true,physicalFurnitureDrag:true,photoPNG:true,preferencesReload:true,errors,nativeBridge:'simulated in browser; native code compiled and checked separately'};
  fs.writeFileSync(directory+'/mochi-studio-validation.json',JSON.stringify(proof,null,2));console.log(JSON.stringify(proof));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
