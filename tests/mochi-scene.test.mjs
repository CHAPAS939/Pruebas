import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const studioSource = readFileSync(new URL('../shared/mochi-scenes/studio-data.js', import.meta.url), 'utf8');
const source = readFileSync(new URL('../shared/mochi-scenes/runtime.js', import.meta.url), 'utf8');
function harness({ fails = false, native = false } = {}) {
  const events = [], listeners = {}, documentListeners = {}, canvasListeners = {}, frames = new Map();
  const counters = { mounted: 0, drawn: 0, resized: 0, disposed: 0, disconnected: 0, drawTimes: [] };
  let sequence = 0, loader;
  const parent = { postMessage: m => events.push(m) };
  const document = { hidden: false, documentElement: { dataset: {} },
    getElementById: () => ({querySelector: () => ({addEventListener: (name, fn) => { canvasListeners[name] = fn; }})}), createElement: () => ({}),
    head: { appendChild: s => { loader = s; } },
    addEventListener: (name, fn) => { documentListeners[name] = fn; } };
  const window = { parent, addEventListener: (name, fn) => { listeners[name] = fn; } };
  if (native) window.webkit = { messageHandlers: { mochiScene: { postMessage: m => events.push(m) } } };
  const context = vm.createContext({ window, document, location: { search: '?scene=home' }, URLSearchParams,
    performance: { now: () => 100 }, requestAnimationFrame: fn => { const id = ++sequence; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() { counters.disconnected++; } } });
  vm.runInContext(studioSource, context);window.MochiStudioData=context.MochiStudioData;
  vm.runInContext(source, context);
  window.MochiScene.register('home', () => {
    counters.mounted++; if (fails) throw new Error('WebGL unavailable');
    return { draw(time) { counters.drawTimes.push(time);counters.drawn++; return { anchor: { x: 2, y: -1 } }; },
      resize() { counters.resized++; }, dispose() { counters.disposed++; } };
  });
  loader.onload();
  return { api: window.MochiScene, counters, events, frames,
    loseContext() { canvasListeners.webglcontextlost({preventDefault() {}}); },
    hidden(value) { document.hidden = value; documentListeners.visibilitychange(); },
    message(settings, sender = parent) { listeners.message({ source: sender, data: { channel: 'coucou-mochi-scene', event: 'update', settings } }); },
    frame(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); } };
}

test('a mounted hidden destination creates no renderer until the host activates it', () => {
  for (const native of [false, true]) {
    const h = harness({ native });
    assert.equal(h.events[0].event, 'loaded'); assert.equal(h.counters.mounted, 0); assert.equal(h.frames.size, 0);
    h.api.update({ state: 'working', paused: false });
    assert.equal(h.counters.mounted, 1); assert.ok(h.events.some(e => e.event === 'ready')); assert.equal(h.frames.size, 1);
    assert.deepEqual(JSON.parse(JSON.stringify(h.events.find(e => e.event === 'anchor').anchor)), { x: 1, y: 0 });
  }
});
test('hidden, paused and reduced-motion scenes stop scheduling work and resume safely', () => {
  const h = harness(); h.message({ state: 'working', paused: false });
  h.hidden(true); assert.equal(h.frames.size, 0);
  const drawn = h.counters.drawn; h.api.update({ state: 'error', paused: false }); assert.equal(h.counters.drawn, drawn);
  h.hidden(false); assert.equal(h.frames.size, 1);
  h.api.update({ state: 'working', paused: false, reduceMotion: true }); assert.equal(h.frames.size, 0);
  h.api.update({ paused: true }); assert.equal(h.frames.size, 0);
  h.api.update({ paused: false }); assert.equal(h.counters.mounted, 1);
  h.api.dispose(); assert.equal(h.frames.size, 0); assert.equal(h.counters.disposed, 1); assert.equal(h.counters.disconnected, 1);
  h.api.update({ paused: false }); assert.equal(h.frames.size, 0);
});
test('only the embedding frame controls the renderer; input is bounded and contains no extra data', () => {
  const h = harness(); h.message({ paused: false }, {}); assert.equal(h.counters.mounted, 0);
  const value = JSON.parse(JSON.stringify(h.api.normalize({ state: 'shell', emote: 'execute', paused: 0,
    lookX: Infinity, lookY: -5, night: 'true', command: 'never forwarded', secret: 'never forwarded' })));
  assert.equal(value.state, 'idle'); assert.equal(value.emote, null); assert.equal(value.paused, true);
  assert.equal(value.lookX, 0); assert.equal(value.lookY, -1); assert.equal(value.night, false);
  assert.equal('command' in value, false); assert.equal('secret' in value, false);
});
test('GPU failure selects the native fallback without a retry loop', () => {
  const h = harness({ fails: true });
  h.api.update({ paused: false }); h.api.update({ paused: false }); h.hidden(false);
  assert.equal(h.counters.mounted, 1); assert.equal(h.events.filter(e => e.event === 'fallback').length, 1);
  assert.equal(h.frames.size, 0);
});
test('sleeping scenes use a slower animation cadence', () => {
  const h = harness(); h.api.update({ state: 'sleeping', paused: false });
  const before = h.counters.drawn; h.frame(100); assert.equal(h.counters.drawn, before);
  h.frame(201); assert.equal(h.counters.drawn, before + 1);
});

test('losing the GPU context disposes the scene once and selects the fallback without retries', () => {
  const h = harness(); h.api.update({paused:false, outfit:'frogHat', theme:'rose'});
  h.loseContext(); h.loseContext(); h.api.update({paused:false, outfit:'headphones'});
  assert.equal(h.frames.size, 0); assert.equal(h.counters.disposed, 1);
  assert.equal(h.counters.mounted, 1); assert.equal(h.events.filter(e=>e.event==='fallback').length, 1);
});
test('saved room appearance and every wardrobe addition cross the bounded display contract', () => {
  const h = harness();
  for (const outfit of ['headphones','frogHat','flower','crown','none']) {
    const v = h.api.normalize({outfit,theme:'sage',plant:false,rug:false});
    assert.equal(v.outfit, outfit); assert.equal(v.theme,'sage'); assert.equal(v.plant,false); assert.equal(v.rug,false);
  }
  const bad = h.api.normalize({outfit:'../../secret',theme:'unknown'});
  assert.equal(bad.outfit,'none'); assert.equal(bad.theme,'sand'); assert.equal(bad.plant,true); assert.equal(bad.rug,true);
});

test('interactive room preferences reject unknown values and preserve valid combinations', () => {
  const h=harness(); const value=h.api.normalize({roomStyle:'mediterranean',plantKind:'olive',rugKind:'geometric',wallDecor:'prints',deskFinish:'white',plantPosition:'right',activity:'rest',glasses:'roundGlasses',scarf:true});
  assert.equal(value.roomStyle,'mediterranean');assert.equal(value.plantKind,'olive');assert.equal(value.activity,'rest');assert.equal(value.glasses,'roundGlasses');assert.equal(value.scarf,true);
  const bad=h.api.normalize({roomStyle:'../../bad',activity:'execute',glasses:'crown'});
  assert.equal(bad.roomStyle,'cozy');assert.equal(bad.activity,'desk');assert.equal(bad.glasses,'none');
});

test('detail zoom is bounded and defaults safely for both native hosts', () => {
  const h = harness();
  for (const value of [undefined, null, '2', NaN, Infinity]) assert.equal(h.api.normalize({ roomZoom: value }).roomZoom, 1);
  assert.equal(h.api.normalize({ roomZoom: -8 }).roomZoom, 1);
  assert.equal(h.api.normalize({ roomZoom: 20 }).roomZoom, 2);
  assert.equal(h.api.normalize({ roomZoom: 1.6 }).roomZoom, 1.6);
  h.api.update({ paused: false, reduceMotion: true, roomZoom: 2 });
  const drawn = h.counters.drawn;
  h.api.update({ paused: false, reduceMotion: true, roomZoom: 1 });
  assert.equal(h.counters.mounted, 1);
  assert.equal(h.counters.drawn, drawn + 1);
  assert.equal(h.frames.size, 0);
});

test('body appearance, editing and photo state remain a bounded display-only contract',()=>{
 const h=harness();const good=h.api.normalize({skin:'diamond',accent:'#AADDFF',portrait:true,transparent:true,photoPose:'love',editing:true,selected:'desk',layout:{desk:{x:999,z:-999,rotation:NaN}},objects:['bed','execute','console'],reaching:true,lean:5,cameraAngle:5,apiKey:'private'});
 assert.equal(good.skin,'diamond');assert.equal(good.accent,'#aaddff');assert.equal(good.portrait,true);assert.equal(good.transparent,true);assert.equal(good.reaching,true);assert.equal(good.lean,.12);assert.equal(good.cameraAngle,.55);assert.deepEqual(Array.from(good.objects),['bed','console']);assert.equal(good.apiKey,undefined);
 const bad=h.api.normalize({skin:'constructor',accent:'javascript:alert(1)',selected:'execute',photoPose:'execute'});assert.equal(bad.skin,'classic');assert.equal(bad.accent,'original');assert.equal(bad.selected,'desk');assert.equal(bad.photoPose,'idle');
});

test('new furniture activities survive the native-to-renderer boundary',()=>{
 const h=harness();for(const activity of ['bed','console','bookshelf'])assert.equal(h.api.normalize({activity}).activity,activity);
 assert.equal(h.api.normalize({activity:'execute'}).activity,'desk');
});

test('room tools reject unbounded camera/light input and do not accept arbitrary reaction targets',()=>{
 const h=harness(),v=h.api.normalize({camera:{yaw:99,pitch:Infinity},lighting:{intensity:99,temperature:-99},orbiting:true,reaction:{id:5,kind:'explore',target:'plant',command:'never forwarded'}});
 assert.equal(v.camera.yaw,1);assert.equal(v.camera.pitch,0);assert.equal(v.lighting.intensity,1.6);assert.equal(v.lighting.temperature,-1);assert.equal(v.orbiting,true);assert.equal(v.reaction.target,'plant');assert.equal(v.reaction.command,undefined);
 const bad=h.api.normalize({reaction:{id:Infinity,kind:'execute',target:'file'}});assert.equal(bad.reaction,null);
});


test('resume and RAF use one monotonic document clock even when frame timestamps have another origin',()=>{
 const h=harness();h.api.update({paused:false});h.frame(8000);h.api.update({paused:false,state:'working'});assert.ok(h.counters.drawTimes.length>=3);assert.ok(h.counters.drawTimes.every(t=>t===100));
});
