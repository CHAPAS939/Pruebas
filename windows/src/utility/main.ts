import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { Menu } from "@tauri-apps/api/menu";
const query=new URLSearchParams(location.search),kind=query.get("kind"),id=query.get("id");
if(kind==="snap"){document.querySelector("canvas")?.remove();const line=document.createElement("div");line.className="snap";document.body.append(line);}
else if(["cup","cushion","plant"].includes(id||"")){
 const script=document.createElement("script");script.src="/mochi-scenes/prop-art.js";script.onload=()=>draw();document.head.append(script);
 function draw(){const c=document.querySelector("canvas")!;c.width=c.height=Math.round(92*Math.min(devicePixelRatio||1,2));const context=c.getContext("2d")!;context.scale(c.width/92,c.height/92);(window as any).drawMochiProp(context,id);}
 if("__TAURI_INTERNALS__"in window){
  document.addEventListener("pointerdown",event=>{if(event.button===0)void getCurrentWindow().startDragging();});
  document.addEventListener("contextmenu",async event=>{event.preventDefault();const menu=await Menu.new({items:[{id:"put-away",text:"↩ Coucou",action:()=>{void invoke("put_away_mochi_prop",{id});}}]});await menu.popup();});
 }
}
