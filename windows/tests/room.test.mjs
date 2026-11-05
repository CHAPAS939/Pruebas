import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roomIsNight, roomLighting, roomTheme, roomStyle, roomActivity } from '../src/mochi/room-logic.ts';
import { DEFAULT_SETTINGS } from '../src/core/state.ts';

test('room follows local time at dawn and dusk; explicit lighting takes precedence', () => {
  for (const hour of [0, 6, 19, 23]) assert.equal(roomIsNight('automatic', hour), true);
  for (const hour of [7, 12, 18]) assert.equal(roomIsNight('automatic', hour), false);
  assert.equal(roomIsNight('day', 23), false); assert.equal(roomIsNight('night', 12), true);
  assert.equal(roomLighting('old-preference'), 'automatic');
  assert.equal(DEFAULT_SETTINGS.mochiRoomLighting, 'automatic');
  assert.equal(DEFAULT_SETTINGS.mochiRoomRain, true); assert.equal(DEFAULT_SETTINGS.mochiRoomLamp, true);
});

test('old or invalid room preferences retain a usable default without losing customization', () => {
  for (const value of ['sand','sage','rose','midnight']) assert.equal(roomTheme(value),value);
  for (const value of [null,undefined,{},'obsolete',true]) assert.equal(roomTheme(value),'sand');
  assert.equal(DEFAULT_SETTINGS.mochiRoomTheme,'sand');
  assert.equal(DEFAULT_SETTINGS.mochiRoomPlant,true); assert.equal(DEFAULT_SETTINGS.mochiRoomRug,true);
});

test('room styles and activities recover safely from old or unknown preferences', () => {
  for(const style of ['cozy','gamer','minimalist','mediterranean'])assert.equal(roomStyle(style),style);
  assert.equal(roomStyle('obsolete'),'cozy');assert.equal(roomActivity('rest'),'rest');assert.equal(roomActivity('water'),'desk');
  assert.equal(DEFAULT_SETTINGS.mochiRoomStyle,'cozy');assert.equal(DEFAULT_SETTINGS.mochiRoomPlantKind,'auto');
  assert.equal(DEFAULT_SETTINGS.mochiOutfitGlasses,'none');assert.equal(DEFAULT_SETTINGS.mochiOutfitScarf,false);
});
