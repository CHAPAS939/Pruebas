import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),D=require('../shared/mochi-scenes/studio-data.js');

test('old, malformed and oversized studio documents recover without losing safe defaults',()=>{
 for(const value of [null,undefined,'bad json','[]','x'.repeat(32769)])assert.deepEqual(D.normalize(value),D.normalize({}));
 const value=D.normalize({rooms:Array.from({length:20},()=>({name:'\u0000My room',settings:{apiKey:'private',mochiRoomStyle:'gamer'}})),outfits:Array(15).fill({skin:'diamond',outfit:'frogHat',glasses:'roundGlasses',scarf:true}),objects:['bed','execute','console','bed'],desktopProps:['cup','arbitrary-window','plant']});
 assert.equal(value.rooms.length,4);assert.equal(value.outfits.length,8);assert.deepEqual(value.objects,['bed','console']);assert.deepEqual(value.desktopProps,['cup','plant']);assert.equal(value.rooms[0].settings.apiKey,undefined);assert.equal(value.rooms[0].name,'My room');
});
test('a saved look retains body appearance, clothes, extra layers and its palette',()=>{
 const look={name:'Black diamonds',outfit:'frogHat',glasses:'roundGlasses',scarf:true,skin:'diamond',accent:'#AADDFF'};
 const saved=D.normalize(JSON.stringify({outfits:[look]})).outfits[0];assert.deepEqual(saved,{...look,accent:'#aaddff'});
 const wrong=D.outfit({skin:'../../file',accent:'url(https://example.com)',outfit:'unknown',glasses:'crown'});assert.equal(wrong.skin,'classic');assert.equal(wrong.accent,'original');assert.equal(wrong.outfit,'auto');assert.equal(wrong.glasses,'none');
});
test('every rotated furniture footprint stays inside the room even after extreme dragging',()=>{
 const sizes={desk:[3.5,1.75],rest:[1.4,1.3],plant:[1,1],rug:[3,2],bed:[1.6,2],console:[1.8,2.4],bookshelf:[1.9,2]};
 for(const[id,[w,d]]of Object.entries(sizes))for(const rotation of[-Math.PI,-1.3,0,Math.PI/4,Math.PI])for(const sign of[-1,1]){
  const value=D.layout({[id]:{x:sign*500,z:sign*700,rotation},execute:{x:0,z:0}});assert.deepEqual(Object.keys(value),[id]);const p=value[id],hx=(Math.abs(Math.cos(p.rotation))*w+Math.abs(Math.sin(p.rotation))*d)/2,hz=(Math.abs(Math.sin(p.rotation))*w+Math.abs(Math.cos(p.rotation))*d)/2;
  assert.ok(Math.abs(p.x)+hx<=3.5+1e-8,id);assert.ok(Math.abs(p.z)+hz<=2.5+1e-8,id);
 }
});
test('room presets keep lighting, layout, furniture and independent style overrides',()=>{
 const room={name:'Mediterranean night',settings:{mochiRoomStyle:'mediterranean',mochiRoomLighting:'night',mochiRoomTheme:'sage',mochiRoomPlantKind:'cactus',mochiRoomPlant:false,mochiRoomRain:false},layout:{desk:{x:.5,z:.4,rotation:Math.PI/4}},objects:['bed','bookshelf']};
 const saved=D.normalize(JSON.stringify({rooms:[room]})).rooms[0];assert.equal(saved.settings.mochiRoomStyle,'mediterranean');assert.equal(saved.settings.mochiRoomLighting,'night');assert.equal(saved.settings.mochiRoomPlantKind,'cactus');assert.equal(saved.settings.mochiRoomPlant,false);assert.equal(saved.settings.mochiRoomRain,false);assert.deepEqual(saved.layout,room.layout);assert.deepEqual(saved.objects,room.objects);
});
test('non-finite positions and malformed decoration choices cannot enter a renderer',()=>{
 const p=D.layout({desk:{x:NaN,z:Infinity,rotation:NaN}}).desk;assert.deepEqual(p,{x:0,z:0,rotation:0});
 const value=D.preferences({mochiRoomTheme:'<script>',mochiSkin:'constructor',mochiAccent:'#abc',mochiStudio:'{bad'});assert.equal(value.mochiSkin,'classic');assert.equal(value.mochiRoomTheme,'sand');assert.equal(value.mochiAccent,'original');assert.deepEqual(JSON.parse(value.mochiStudio),D.normalize({}));
});

test('light and orbit settings are bounded, survive saved rooms and migrate old data',()=>{
 const source={camera:{yaw:.7,pitch:.35},lighting:{intensity:1.3,temperature:-.6}};
 const saved=D.normalize(JSON.stringify({...source,rooms:[{name:'Evening',...source}]}));
 assert.deepEqual(saved.camera,source.camera);assert.deepEqual(saved.rooms[0].lighting,source.lighting);
 assert.deepEqual(D.camera({yaw:Infinity,pitch:NaN}),{yaw:0,pitch:0});
 assert.deepEqual(D.lighting({intensity:-100,temperature:500}),{intensity:.35,temperature:1});
 assert.deepEqual(D.normalize({}).lighting,{intensity:1,temperature:0});
});
test('fast dragging cannot tunnel through a desk and rugs remain placeable underneath',()=>{
 globalThis.MochiStudioData=D;const P=require('../shared/mochi-scenes/placement.js');
 const result=P.place({},'plant',{x:2.8,z:.76,rotation:0},{objects:[]});
 assert.equal(result.blocked,true);assert.ok(result.layout.plant.x< -2.1);
 assert.equal(P.overlap('plant',result.layout.plant,'desk',P.pose({},'desk')),false);
 const rug=P.place({},'rug',{x:0,z:.8,rotation:0},{objects:[]});assert.equal(rug.blocked,false);
});
test('placement aligns close centers, rejects overlapping rotation and finds space for new furniture',()=>{
 globalThis.MochiStudioData=D;const P=require('../shared/mochi-scenes/placement.js');
 const aligned=P.place({},'desk',{x:.07,z:.8,rotation:0},{objects:[]});assert.equal(aligned.layout.desk.x,0);assert.ok(aligned.snapped.includes('x'));
 const layout={plant:{x:1.3,z:-.9,rotation:0}};assert.equal(P.overlap('desk',P.pose({},'desk'),'plant',layout.plant),false);
 const blocked=P.place(layout,'desk',{x:0,z:.8,rotation:Math.PI/4},{objects:[]});assert.equal(blocked.blocked,true);assert.equal(blocked.layout.desk,undefined);
 const context={objects:['bed','console','bookshelf'],plantPosition:'left'};
 const spot=P.findSpot({},'console',context);assert.ok(spot);
 const resolved=P.resolve({},context);for(const id of ['desk','rest','plant','bed','bookshelf'])assert.equal(P.overlap('console',spot,id,P.pose(resolved,id)),false,id);
});
test('Mochi explores and returns to its real activity, with no motion when reduced motion is on',()=>{
 const create=require('../shared/mochi-scenes/room-reactions.js'),r=create(),seat=[0,2.43,-.12],roots={bed:{position:{x:-2,z:-1},visible:true}},settings={state:'idle',reaction:{id:1,kind:'explore',target:'bed'}};
 r.sample(settings,100,seat,roots);const middle=r.sample(settings,2100,seat,roots);assert.equal(middle.kind,'explore');assert.ok(middle.position[0]< -1.5);assert.ok(middle.position[1]<1);
 assert.deepEqual(r.sample(settings,4200,seat,roots).position,seat);
 assert.deepEqual(r.sample({...settings,reduceMotion:true},1500,seat,roots).position,seat);
 const celebrate=r.sample({state:'idle',reaction:{id:2,kind:'celebrate'}},5000,seat,roots);assert.equal(celebrate.happy,true);
 assert.equal(r.sample({state:'working',reaction:{id:3,kind:'celebrate'}},5100,seat,roots).happy,false);
});
