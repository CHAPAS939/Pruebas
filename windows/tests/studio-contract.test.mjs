import {test} from 'node:test';
import assert from 'node:assert/strict';
import {studioPatch,studioPreferences} from '../src/mochi/studio-contract.ts';
test('the studio bridge allows cosmetic settings and rejects unrelated native capabilities',()=>{
 const input=JSON.parse('{"constructor":"danger","__proto__":"danger"}');
 Object.assign(input,{mochiSkin:'diamond',mochiOutfitScarf:true,mochiAccent:'#AaCCFF',mochiStudio:'{"version":1}',apiKey:'not cosmetic',screen:'other',mochiRoomRain:'yes'});
 const value=studioPatch(input);
 assert.deepEqual(value,{mochiSkin:'diamond',mochiOutfitScarf:true,mochiAccent:'#AaCCFF',mochiStudio:'{"version":1}'});
 assert.deepEqual(studioPatch({mochiSkin:'unknown',mochiStudio:'[]',mochiAccent:'javascript:alert(1)',mochiRoomPlant:1}),{});
 assert.deepEqual(studioPatch({mochiStudio:'x'.repeat(32769)}),{});
});
test('a renderer snapshot never includes agent, chat, integration or desktop window data',()=>{
 assert.deepEqual(studioPreferences({mochiSkin:'galaxy',mochiRoomLamp:false,chatModels:{secret:'x'},desktopMochi:{spot:{x:1,y:2}},activeIntegrations:['agent'],model:'private'}),{mochiSkin:'galaxy',mochiRoomLamp:false});
});
