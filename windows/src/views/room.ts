import { h } from "./dom";
import type { ViewActions, ViewHost } from "./views";
import { State } from "../core/state";
import { Bridge } from "../core/bridge";
import { N_, t, tl } from "../i18n/i18n";
import { MochiScene } from "../mochi/scene";
import { BotEngine } from "../mochi/engine";
import { SeasonCache, parseOutfit } from "../mochi/wardrobe";
import { roomIsNight, roomLighting, roomTheme, type RoomLighting } from "../mochi/room-logic";
import { buildWardrobe } from "./wardrobe";

/** Real wardrobe choices and local decoration preferences, shared with the Mac. */
export function buildRoom(actions: ViewActions): ViewHost {
  const scene = new MochiScene("home", t("Mochi’s room"));
  const engine = new BotEngine(), seasons = new SeasonCache();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = h("canvas", { "aria-hidden": "true" });
  canvas.width = 600; canvas.height = 196;
  const stage = h("div", { class: "mochi-room-stage", role: "img", "aria-label": tl("Mochi’s room") }, canvas, scene.el);
  let active = false, editor: "decorate" | "wardrobe" = "decorate";
  let minute: number | null = null;
  const wardrobe = buildWardrobe(actions);
  wardrobe.el.classList.add("mochi-room-wardrobe");
  const lightingButtons = ([
    ["automatic", N_("Follow the time of day"), "◷"], ["day", N_("Daylight"), "☼"], ["night", N_("Night"), "☾"],
  ] as const).map(([value, label, mark]) => h("button", {
    title: tl(label), "aria-label": tl(label), "aria-pressed": "false", text: mark,
    onclick: () => save("mochiRoomLighting", value),
  }));
  const rain = h("button", { title: tl("Rain at the window"), "aria-label": tl("Rain at the window"), "aria-pressed": "true", text: "☂", onclick: () => save("mochiRoomRain", !State.settings.mochiRoomRain) });
  const lamp = h("button", { title: tl("Desk lamp"), "aria-label": tl("Desk lamp"), "aria-pressed": "true", text: "◉", onclick: () => save("mochiRoomLamp", !State.settings.mochiRoomLamp) });
  const controls = h("div", { class: "mochi-room-controls" }, h("strong", { text: tl("Mochi’s room") }), h("div", {}, ...lightingButtons, rain, lamp));
  const palettes = ([
    ["sand", N_("Sand"), "#d7bf9f"], ["sage", N_("Sage"), "#a9bb99"],
    ["rose", N_("Rose"), "#d2aaa9"], ["midnight", N_("Midnight"), "#65748b"],
  ] as const).map(([value, label, color]) => ({ value, button: h("button", {
    class: "room-palette", "aria-pressed": "false", onclick: () => save("mochiRoomTheme", value),
  }, h("i", { style: `background:${color}`, "aria-hidden": "true" }), h("span", { text: tl(label) })) }));
  const plant = h("button", { class: "room-toggle", "aria-pressed": "true", text: tl("Plant"), onclick: () => save("mochiRoomPlant", !State.settings.mochiRoomPlant) });
  const rug = h("button", { class: "room-toggle", "aria-pressed": "true", text: tl("Rug"), onclick: () => save("mochiRoomRug", !State.settings.mochiRoomRug) });
  const decoration = h("div", { class: "room-decoration" }, h("span", { class: "room-caption", text: tl("Color palette") }), h("div", { class: "room-palettes" }, ...palettes.map(p => p.button)), h("div", { class: "room-toggles" }, plant, rug));
  const editButtons = ([ ["decorate", N_("Decorate")], ["wardrobe", N_("Wardrobe")] ] as const).map(([value, label]) => h("button", {
    "aria-pressed": "false", text: tl(label), onclick: () => { editor = value; actions.previewOutfit(null); sync(); },
  }));
  const side = h("div", { class: "mochi-room-editor" }, h("div", { class: "room-editor-switch" }, ...editButtons), decoration, wardrobe.el);
  const el = h("div", { class: "view mochi-room" }, controls, h("div", { class: "mochi-room-content" }, stage, side));
  scene.el.style.opacity = "0";

  function save<K extends "mochiRoomLighting" | "mochiRoomRain" | "mochiRoomLamp" | "mochiRoomTheme" | "mochiRoomPlant" | "mochiRoomRug">(key: K, value: typeof State.settings[K]) {
    State.settings = { ...State.settings, [key]: value };
    void Bridge.saveSettings(State.settings);
    State.notify();
  }
  function sync() {
    const wasActive = active;
    active = State.mode === "expanded" && State.view === "room" && !State.paused;
    if (wasActive && !active && State.wardrobePreview != null) State.wardrobePreview = null;
    const outfit = State.wardrobePreview ?? seasons.get(parseOutfit(State.settings.mochiOutfit));
    const lighting = roomLighting(State.settings.mochiRoomLighting);
    const night = roomIsNight(lighting, new Date().getHours());
    scene.update({ state: State.effectiveState, paused: !active, reduceMotion: motion.matches,
      night, rain: State.settings.mochiRoomRain, lamp: State.settings.mochiRoomLamp, character: editor === "wardrobe" || !State.mochiOnDesktop,
      outfit, theme: roomTheme(State.settings.mochiRoomTheme), plant: State.settings.mochiRoomPlant, rug: State.settings.mochiRoomRug });
    scene.el.style.opacity = scene.ready ? "1" : "0";
    canvas.hidden = scene.ready;
    engine.setState(State.effectiveState); engine.setOutfit(outfit, false);
    lightingButtons.forEach((b, i) => b.setAttribute("aria-pressed", String((["automatic", "day", "night"] as RoomLighting[])[i] === lighting)));
    rain.setAttribute("aria-pressed", String(State.settings.mochiRoomRain)); lamp.setAttribute("aria-pressed", String(State.settings.mochiRoomLamp));
    palettes.forEach(p => p.button.setAttribute("aria-pressed", String(p.value === roomTheme(State.settings.mochiRoomTheme))));
    plant.setAttribute("aria-pressed", String(State.settings.mochiRoomPlant)); rug.setAttribute("aria-pressed", String(State.settings.mochiRoomRug));
    editButtons.forEach((b, i) => b.setAttribute("aria-pressed", String(i === (editor === "decorate" ? 0 : 1))));
    decoration.hidden = editor !== "decorate"; wardrobe.el.hidden = editor !== "wardrobe";
    if (active && editor === "wardrobe") wardrobe.sync();
    if (active && minute == null) minute = window.setInterval(sync, 60_000);
    if (!active && minute != null) { clearInterval(minute); minute = null; }
    if (active && !scene.ready) drawFallback(performance.now());
  }
  function drawFallback(now: number) {
    const c = canvas.getContext("2d"); if (!c) return;
    const night = roomIsNight(State.settings.mochiRoomLighting, new Date().getHours());
    c.clearRect(0, 0, 600, 196);
    const theme = roomTheme(State.settings.mochiRoomTheme);
    c.fillStyle = night ? "#38303e" : ({sand:"#e4d1b6",sage:"#d2dcc8",rose:"#ead5d2",midnight:"#737e91"})[theme]; c.fillRect(0, 0, 600, 196);
    c.fillStyle = night ? "#354758" : "#b4d2d4"; c.beginPath(); c.roundRect(423, 18, 125, 122, 28); c.fill();
    c.strokeStyle = "#b8916d"; c.lineWidth = 5; c.stroke();
    c.beginPath(); c.moveTo(485, 18); c.lineTo(485, 140); c.moveTo(423, 85); c.lineTo(548, 85); c.stroke();
    if (State.settings.mochiRoomRug) { c.fillStyle = "#c9baa3"; c.beginPath(); c.ellipse(280, 187, 108, 8, 0, 0, Math.PI*2); c.fill(); }
    if (State.settings.mochiRoomPlant) { c.fillStyle = "#a8795e"; c.fillRect(70, 146, 22, 33); c.fillStyle = "#819575"; for (let i=0;i<5;i++) { c.beginPath(); c.ellipse(74+i*4, 130-(i%2)*13, 7, 20, (i-2)*.2, 0, Math.PI*2); c.fill(); } }
    c.fillStyle = "#bb956f"; c.fillRect(188, 149, 185, 7); c.fillRect(199, 156, 6, 38); c.fillRect(354, 156, 6, 38);
    if (State.settings.mochiRoomLamp) { const glow = c.createRadialGradient(230, 117, 0, 230, 117, 65); glow.addColorStop(0, "#ffda8f55"); glow.addColorStop(1, "#ffda8f00"); c.fillStyle = glow; c.fillRect(165, 52, 130, 130); }
    if (!motion.matches) engine.update(.04);
    if (editor === "wardrobe" || !State.mochiOnDesktop) { c.save(); c.translate(242, 64); engine.draw(c, 104, 104); c.restore(); }
    c.fillStyle = "#a8a19b"; c.beginPath(); c.roundRect(277, 132, 48, 22, 3); c.fill();
    if (State.settings.mochiRoomRain) {
      c.strokeStyle = "#ffffff50"; c.lineWidth = 1;
      for (let i = 0; i < 14; i++) { const x = 432 + i * 8; const y = 35 + ((i * 19 + (motion.matches ? 0 : now / 12)) % 92); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y + 7); c.stroke(); }
    }
  }
  scene.onReady = () => { sync(); State.notify(); };
  motion.addEventListener("change", sync);
  return { el, sync, tick(now) { if (active && !scene.ready && !motion.matches) { drawFallback(now); return true; } return false; } };
}
