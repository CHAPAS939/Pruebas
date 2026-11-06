/* Bounded, versioned local customization data. Shared by both native studios. */
(() => {
  'use strict';
  const skins=['classic','diamond','opal','obsidian','gold','galaxy','jelly','lava'];
  const outfits=['auto','none','partyHat','beanie','crown','sunglasses','roundGlasses','bow','scarf','witchHat','pumpkin','santaHat','bunnyEars','headphones','frogHat','flower'];
  const objects=['bed','console','bookshelf'];
  const furniture=['desk','rest','plant','rug',...objects];
  const props=['cup','cushion','plant'];
  const dimensions={desk:[3.5,1.75],rest:[1.4,1.3],plant:[1,1],rug:[3,2],bed:[1.6,2],console:[1.8,2.4],bookshelf:[1.9,2]};
  const choices={mochiRoomStyle:['cozy','gamer','minimalist','mediterranean'],mochiRoomTheme:['sand','sage','rose','midnight'],mochiRoomPlantKind:['auto','leafy','cactus','olive'],mochiRoomRugKind:['auto','woven','geometric','checker'],mochiRoomWallDecor:['auto','botanical','prints','neon','none'],mochiRoomDeskFinish:['auto','wood','white','dark'],mochiRoomPlantPosition:['left','right','back']};
  const pick=(value,values)=>values.includes(value)?value:values[0];
  const number=(v,min,max,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
  const name=(v,fallback)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28)||fallback:fallback;
  function layout(value){
    const result={};
    for(const id of furniture){const p=value?.[id];if(!p||typeof p!=='object')continue;
      const rotation=Math.round(number(p.rotation,-Math.PI,Math.PI)*8/Math.PI)*Math.PI/8,[w,d]=dimensions[id],hx=(Math.abs(Math.cos(rotation))*w+Math.abs(Math.sin(rotation))*d)/2,hz=(Math.abs(Math.sin(rotation))*w+Math.abs(Math.cos(rotation))*d)/2;
      result[id]={x:Math.max(-3.5+hx,Math.min(3.5-hx,Math.round(number(p.x,-3.5+hx,3.5-hx)*20)/20)),z:Math.max(-2.5+hz,Math.min(2.5-hz,Math.round(number(p.z,-2.5+hz,2.5-hz)*20)/20)),rotation};
    }return result;
  }
  function camera(value){return {yaw:number(value?.yaw,-1,1),pitch:number(value?.pitch,-.25,.65)}}
  function lighting(value){return {intensity:number(value?.intensity,.35,1.6,1),temperature:number(value?.temperature,-1,1)}}
  function room(value){const v=value&&typeof value==='object'?value:{};const settings={};
    for(const [key,values]of Object.entries(choices))settings[key]=pick(v.settings?.[key],values);
    for(const key of ['mochiRoomPlant','mochiRoomRug','mochiRoomLamp','mochiRoomRain'])settings[key]=v.settings?.[key]!==false;
    settings.mochiRoomLighting=pick(v.settings?.mochiRoomLighting,['automatic','day','night']);
    return {name:name(v.name,'My room'),settings,camera:camera(v.camera),lighting:lighting(v.lighting),layout:layout(v.layout),objects:objects.filter(x=>Array.isArray(v.objects)&&v.objects.includes(x))};
  }
  function outfit(value){const v=value&&typeof value==='object'?value:{};return {name:name(v.name,'My Mochi'),outfit:pick(v.outfit,outfits),glasses:pick(v.glasses,['none','sunglasses','roundGlasses']),scarf:v.scarf===true,skin:pick(v.skin,skins),accent:accent(v.accent)};}
  function accent(value){return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value.toLowerCase():'original';}
  function normalize(value){
    let v=value;
    if(typeof v==='string'){if(v.length>32768)return normalize(null);try{v=JSON.parse(v)}catch{v=null}}
    if(!v||typeof v!=='object'||Array.isArray(v))v={};
    return {version:1,camera:camera(v.camera),lighting:lighting(v.lighting),layout:layout(v.layout),objects:objects.filter(x=>Array.isArray(v.objects)&&v.objects.includes(x)),rooms:(Array.isArray(v.rooms)?v.rooms:[]).slice(0,4).map(room),outfits:(Array.isArray(v.outfits)?v.outfits:[]).slice(0,8).map(outfit),desktopProps:props.filter(x=>Array.isArray(v.desktopProps)&&v.desktopProps.includes(x))};
  }
  function preferences(value){const v=value&&typeof value==='object'?value:{};const result={};
    for(const[key,values]of Object.entries(choices))result[key]=pick(v[key],values);
    for(const key of ['mochiRoomPlant','mochiRoomRug','mochiRoomLamp','mochiRoomRain'])result[key]=v[key]!==false;
    result.mochiRoomLighting=pick(v.mochiRoomLighting,['automatic','day','night']);
    result.mochiOutfit=pick(v.mochiOutfit,outfits);result.mochiOutfitGlasses=pick(v.mochiOutfitGlasses,['none','sunglasses','roundGlasses']);result.mochiOutfitScarf=v.mochiOutfitScarf===true;
    result.mochiSkin=pick(v.mochiSkin,skins);result.mochiAccent=accent(v.mochiAccent);result.mochiStudio=JSON.stringify(normalize(v.mochiStudio));return result;
  }
  const api=Object.freeze({skins,outfits,objects,furniture,props,choices,normalize,layout,camera,lighting,room,outfit,accent,preferences});
  if(typeof module==='object'&&module.exports)module.exports=api;else globalThis.MochiStudioData=api;
})();
