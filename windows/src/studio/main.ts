import "../style.css";
import "./studio.css";
import { State, type Settings } from "../core/state";
import { Bridge, onEvent } from "../core/bridge";
import { buildRoom } from "../views/room";
import type { ViewActions } from "../views/views";
import { resolveLanguage, setLanguage } from "../i18n/i18n";

async function main(){
  const boot=await Bridge.boot();
  if(boot)State.settings={...State.settings,...boot.settings};
  setLanguage(resolveLanguage(State.settings.language,navigator.languages));
  State.mode="expanded";State.view="room";
  const actions={keyboard(){},holdOpen(){}} as unknown as ViewActions;
  const room=buildRoom(actions,{standalone:true});
  document.getElementById("studio-root")!.append(room.el);
  State.subscribe(()=>room.sync());
  await onEvent<Settings>("settings-changed",settings=>{State.settings={...State.settings,...settings};setLanguage(resolveLanguage(State.settings.language,navigator.languages));State.notify();});
  document.addEventListener("visibilitychange",()=>room.sync());
  room.sync();
}
void main();
