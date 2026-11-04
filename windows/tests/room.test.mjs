import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roomIsNight, roomLighting } from '../src/mochi/room-logic.ts';
import { DEFAULT_SETTINGS } from '../src/core/state.ts';

test('room follows local time at dawn and dusk; explicit lighting takes precedence', () => {
  for (const hour of [0, 6, 19, 23]) assert.equal(roomIsNight('automatic', hour), true);
  for (const hour of [7, 12, 18]) assert.equal(roomIsNight('automatic', hour), false);
  assert.equal(roomIsNight('day', 23), false); assert.equal(roomIsNight('night', 12), true);
  assert.equal(roomLighting('old-preference'), 'automatic');
  assert.equal(DEFAULT_SETTINGS.mochiRoomLighting, 'automatic');
  assert.equal(DEFAULT_SETTINGS.mochiRoomRain, true); assert.equal(DEFAULT_SETTINGS.mochiRoomLamp, true);
});
