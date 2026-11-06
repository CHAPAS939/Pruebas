import { SKINS } from "./appearance";

/** The embedded local editor can change only cosmetic preferences. */
const choices: Record<string, readonly string[]> = {
  mochiRoomLighting: ["automatic","day","night"], mochiRoomTheme: ["sand","sage","rose","midnight"],
  mochiRoomStyle: ["cozy","gamer","minimalist","mediterranean"], mochiRoomPlantKind: ["auto","leafy","cactus","olive"],
  mochiRoomRugKind: ["auto","woven","geometric","checker"], mochiRoomWallDecor: ["auto","botanical","prints","neon","none"],
  mochiRoomDeskFinish: ["auto","wood","white","dark"], mochiRoomPlantPosition: ["left","right","back"],
  mochiOutfit: ["auto","none","partyHat","beanie","crown","sunglasses","roundGlasses","bow","scarf","witchHat","pumpkin","santaHat","bunnyEars","headphones","frogHat","flower"],
  mochiOutfitGlasses: ["none","sunglasses","roundGlasses"], mochiSkin: SKINS,
};
const booleans = ["mochiRoomRain","mochiRoomLamp","mochiRoomPlant","mochiRoomRug","mochiOutfitScarf"];
export function studioPatch(value: unknown): Record<string,string|boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string,string|boolean> = {};
  for (const [key,v] of Object.entries(value)) {
    const allowed=Object.prototype.hasOwnProperty.call(choices,key)?choices[key]:undefined;
    if (typeof v === "string" && allowed?.includes(v)) result[key]=v;
    else if (booleans.includes(key) && typeof v === "boolean") result[key]=v;
    else if (key === "mochiAccent" && typeof v === "string" && (v === "original" || /^#[0-9a-f]{6}$/i.test(v))) result[key]=v;
    else if (key === "mochiStudio" && typeof v === "string" && v.length <= 32768) {
      try { const parsed=JSON.parse(v);if(parsed && typeof parsed === "object" && !Array.isArray(parsed))result[key]=v; } catch { /* Keep the last valid document. */ }
    }
  }
  return result;
}
export function studioPreferences(settings: object): Record<string,string|boolean> { return studioPatch(settings); }
