import { h } from "./dom";
import type { ViewActions, ViewHost } from "./views";
import { State } from "../core/state";
import { Bridge } from "../core/bridge";
import { invoke } from "@tauri-apps/api/core";
import { language, tl } from "../i18n/i18n";
import { SeasonCache, parseOutfit } from "../mochi/wardrobe";
import { studioPatch, studioPreferences } from "../mochi/studio-contract";

type Studio={update(value:object):void;photoSaved(result:object):void;dispose():void};
let assets: Promise<void> | null=null;
function loadStudioAssets(){
  return assets??= (async()=>{
    for(const file of ["studio-data.js","placement.js","outfit-icons.js","studio.js"]){
      await new Promise<void>((resolve,reject)=>{const script=document.createElement("script");script.src=`/mochi-scenes/${file}`;script.onload=()=>resolve();script.onerror=reject;document.head.append(script);});
    }
  })().catch(error=>{assets=null;throw error;});
}

/** Shared editor in a style-isolated DOM; only the 3D renderer needs a sandbox. */
export function buildRoom(actions: ViewActions, options: {standalone?:boolean} = {}): ViewHost {
  const host=h("div",{class:"mochi-studio-host"}),el=h("div",{class:"view mochi-room mochi-room-studio"},host);
  const shadow=host.attachShadow({mode:"open"}),seasons=new SeasonCache(),motion=matchMedia("(prefers-reduced-motion: reduce)");
  let instance: Studio|null=null,mounting=false,last="",saving=false,typing=false;
  async function mount(){
    if(mounting||instance)return;mounting=true;
    try{
      const [markup]=await Promise.all([fetch("/mochi-scenes/studio.html").then(r=>{if(!r.ok)throw Error("Missing studio");return r.text();}),loadStudioAssets()]);
      const template=new DOMParser().parseFromString(markup,"text/html").getElementById("studio");if(!template)throw Error("Missing editor");
      template.querySelector("iframe")!.src="/mochi-scenes/index.html?scene=home";
      const styles=h("link",{rel:"stylesheet",href:"/mochi-scenes/studio.css"});shadow.replaceChildren(styles,template);
      instance=(window as any).createMochiStudio(shadow,receive) as Studio;
      if(import.meta.env.DEV)(window as any).__mochiStudio=instance;
      last="";sync();
    }catch{shadow.replaceChildren(h("span",{text:tl("Failed")}),h("button",{text:tl("Retry"),onclick:()=>{void mount();}}));}
    finally{mounting=false;}
  }
  function sync(){
    const active=(!options.standalone||!document.hidden)&&State.mode==="expanded"&&State.view==="room"&&!State.paused;
    if(!active&&typing){typing=false;actions.keyboard(false);actions.holdOpen(false);}
    if(active&&!instance){void mount();return;}
    const snapshot={active,standalone:options.standalone===true,state:State.effectiveState,outfit:seasons.get(parseOutfit(State.settings.mochiOutfit)),seasonalOutfit:seasons.get("auto"),language:language(),reducedMotion:motion.matches,preferences:studioPreferences(State.settings)};
    const key=JSON.stringify(snapshot);if(instance&&key!==last){last=key;instance.update(snapshot);}
  }
  async function receive(message: any){
    if(message?.channel!=="coucou-mochi-studio")return;
    if(message.event==="open-studio"){await invoke("open_mochi_studio");}
    else if(message.event==="text-focus"&&typeof message.on==="boolean"){typing=message.on;actions.keyboard(typing);actions.holdOpen(typing);}
    else if(message.event==="patch"){
      const patch=studioPatch(message.patch);if(!Object.keys(patch).length)return;
      State.settings={...State.settings,...patch};State.wardrobePreview=null;
      void Bridge.saveSettings(State.settings);State.notify();
    }else if(message.event==="photo"&&!saving&&Number.isSafeInteger(message.id)&&typeof message.data==="string"&&message.data.startsWith("data:image/png;base64,")&&message.data.length<10_000_000){
      saving=true;actions.holdOpen(true);actions.keyboard(true);
      try{const saved=await invoke<boolean>("save_mochi_photo",{image:message.data});instance?.photoSaved({id:message.id,success:saved===true,cancelled:saved===false});}
      catch{instance?.photoSaved({id:message.id,success:false});}
      finally{saving=false;actions.holdOpen(typing);actions.keyboard(typing);}
    }
  }
  motion.addEventListener("change",sync);
  return {el,sync};
}
