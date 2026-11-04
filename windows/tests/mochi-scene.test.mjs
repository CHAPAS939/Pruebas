import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fakedom.mjs';
installFakeDom();
const listeners = new Set();
window.addEventListener = (name, fn) => { if (name === 'message') listeners.add(fn); };
window.removeEventListener = (name, fn) => { if (name === 'message') listeners.delete(fn); };
const { MochiScene } = await import('../src/mochi/scene.ts');

test('native adapter lazily loads a sandboxed scene, ignores other frames and sends only changed state', () => {
  const scene = new MochiScene('home', 'Mochi');
  const sent = [];
  const host = { postMessage: message => sent.push(message) };
  scene.el.contentWindow = host;
  const event = (name, source = host) => {
    for (const listener of listeners) listener({ source, data: { channel: 'coucou-mochi-scene', event: name } });
  };
  assert.equal(scene.el.getAttribute('sandbox'), 'allow-scripts');
  const paused = { state: 'idle', paused: true, reduceMotion: false };
  scene.update(paused); assert.equal(scene.el.src, undefined);
  scene.update({ ...paused, paused: false });
  assert.equal(scene.el.src, '/mochi-scenes/index.html?scene=home');
  event('loaded', {}); assert.equal(sent.length, 0);
  event('ready', {}); assert.equal(scene.ready, false);
  event('loaded'); assert.equal(sent.length, 1);
  event('ready'); assert.equal(scene.ready, true);
  scene.update({ ...paused, paused: false }); assert.equal(sent.length, 1);
  scene.update(paused); assert.equal(sent.length, 2); assert.equal(sent[1].settings.paused, true);
  event('fallback'); assert.equal(scene.ready, false);
  scene.update({ ...paused, state: 'error' }); assert.equal(sent.length, 2);
  scene.dispose(); assert.equal(listeners.size, 0);
});
