import "../style.css";
import "./studio.css";
import { State, type Settings } from "../core/state";
import { Bridge, IS_TAURI, onEvent } from "../core/bridge";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { buildRoom } from "../views/room";
import type { ViewActions } from "../views/views";
import { resolveLanguage, setLanguage } from "../i18n/i18n";

async function main(){
  const boot=await Bridge.boot();
  if(boot)State.settings={...State.settings,...boot.settings};
  setLanguage(resolveLanguage(State.settings.language,navigator.languages));
  State.mode="expanded";State.view="room";
  // A hidden native window can still report a visible document on WebKitGTK.
  await onEvent<boolean>("mochi-studio-visible",on=>{State.paused=!on;State.notify();});
  if(IS_TAURI){try{State.paused=await getCurrentWindow().isVisible()===false||await getCurrentWindow().isMinimized()===true;}catch{}}
  const actions={keyboard(){},holdOpen(){}} as unknown as ViewActions;
  const room=buildRoom(actions,{standalone:true});
  document.getElementById("studio-root")!.append(room.el);
  State.subscribe(()=>room.sync());
  await onEvent<Settings>("settings-changed",settings=>{State.settings={...State.settings,...settings};setLanguage(resolveLanguage(State.settings.language,navigator.languages));State.notify();});
  document.addEventListener("visibilitychange",()=>room.sync());
  room.sync();
}
void main();
