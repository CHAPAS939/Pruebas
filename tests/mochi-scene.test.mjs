import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../shared/mochi-scenes/runtime.js', import.meta.url), 'utf8');
function harness({ fails = false, native = false } = {}) {
  const events = [], listeners = {}, documentListeners = {}, canvasListeners = {}, frames = new Map();
  const counters = { mounted: 0, drawn: 0, resized: 0, disposed: 0, disconnected: 0 };
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
  vm.runInContext(source, context);
  window.MochiScene.register('home', () => {
    counters.mounted++; if (fails) throw new Error('WebGL unavailable');
    return { draw() { counters.drawn++; return { anchor: { x: 2, y: -1 } }; },
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
