/* Coucou's local scene contract, shared byte-for-byte by WKWebView and WebView2. */
(() => {
  "use strict";
  const states=new Set(["idle","working","thinking","searching","approval","question","error","finished","ratelimit","sleeping","dizzy"]);
  const emotes=new Set(["love","surprised","proud","wink","yawn","happy","annoyed"]);
  const outfits=new Set(["none","partyHat","beanie","crown","sunglasses","roundGlasses","bow","scarf","witchHat","pumpkin","santaHat","bunnyEars","headphones","frogHat","flower"]);
  const themes=new Set(["sand","sage","rose","midnight"]);
  const defaults=Object.freeze({state:"idle",emote:null,paused:true,reduceMotion:false,night:false,rain:true,lamp:true,character:true,perched:false,lookX:0,lookY:0,outfit:"none",theme:"sand",plant:true,rug:true});
  let settings={...defaults},factory=null,instance=null,raf=0,last=0,disposed=false,failed=false,lastAnchor="",sizeDirty=true;
  const finite=(v)=>typeof v==="number"&&Number.isFinite(v)?Math.max(-1,Math.min(1,v)):0;
  function normalize(value){
    const v=value&&typeof value==="object"?value:{};
    return {state:states.has(v.state)?v.state:"idle",emote:emotes.has(v.emote)?v.emote:null,
      paused:v.paused!==false,reduceMotion:v.reduceMotion===true,night:v.night===true,
      rain:v.rain!==false,lamp:v.lamp!==false,character:v.character!==false,perched:v.perched===true,
      lookX:finite(v.lookX),lookY:finite(v.lookY),outfit:outfits.has(v.outfit)?v.outfit:"none",
      theme:themes.has(v.theme)?v.theme:"sand",plant:v.plant!==false,rug:v.rug!==false};
  }
  function report(event,detail={}){
    const message={channel:"coucou-mochi-scene",event,...detail};
    if(window.webkit?.messageHandlers?.mochiScene)window.webkit.messageHandlers.mochiScene.postMessage(message);
    else if(window.parent!==window)window.parent.postMessage(message,"*");
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function draw(time){
    if(!instance||disposed||settings.paused||document.hidden)return;
    try{
      const result=instance.draw(time,settings);
      if(result?.anchor){const a=result.anchor;
        if(Number.isFinite(a.x)&&Number.isFinite(a.y)){
          const anchor={x:Math.round(Math.max(0,Math.min(1,a.x))*500)/500,y:Math.round(Math.max(0,Math.min(1,a.y))*500)/500};
          const key=JSON.stringify(anchor);if(key!==lastAnchor){lastAnchor=key;report("anchor",{anchor});}
        }
      }
    }catch{stop();instance?.dispose?.();instance=null;failed=true;report("fallback");}
  }
  function frame(time){
    raf=0;if(disposed||settings.paused||settings.reduceMotion||document.hidden||!instance)return;
    const interval=settings.state==="sleeping"?200:1000/24;
    if(time-last>=interval){last=time;draw(time);}
    if(instance)raf=requestAnimationFrame(frame);
  }
  function resume(){
    stop();if(disposed||failed||settings.paused||document.hidden)return;
    if(!instance&&factory){
      try{
        const stage=document.getElementById("stage");
        instance=factory(stage);
        stage.querySelector?.("canvas")?.addEventListener("webglcontextlost",event=>{
          event.preventDefault();if(disposed||failed)return;
          stop();instance?.dispose?.();instance=null;failed=true;report("fallback");
        },{once:true});
        const observer=new ResizeObserver(()=>{sizeDirty=true;resume();});observer.observe(document.getElementById("stage"));
        const dispose=instance.dispose?.bind(instance);instance.dispose=()=>{observer.disconnect();dispose?.();};
        report("ready");
      }catch{failed=true;report("fallback");return;}
    }
    if(!instance)return;
    if(sizeDirty){sizeDirty=false;instance.resize?.();}
    draw(performance.now());if(!settings.reduceMotion&&instance)raf=requestAnimationFrame(frame);
  }
  const api={
    register(kind,make){if(kind===sceneKind)factory=make;},
    update(value){if(disposed)return;settings=normalize(value);resume();},
    dispose(){disposed=true;stop();instance?.dispose?.();instance=null;},
    // Exposed only for deterministic contract checks, never as an app capability.
    normalize,
    get paused(){return settings.paused;}
  };
  window.MochiScene=api;
  const picked=new URLSearchParams(location.search).get("scene");
  const sceneKind=picked==="perch"?"perch":"home";
  document.documentElement.dataset.scene=sceneKind;
  // Only the embedding host may update an iframe; native WebKit calls update directly.
  window.addEventListener("message",event=>{
    if(event.source!==window.parent||event.data?.channel!=="coucou-mochi-scene"||event.data?.event!=="update")return;
    api.update(event.data.settings);
  });
  document.addEventListener("visibilitychange",resume);
  window.addEventListener("pagehide",()=>api.dispose(),{once:true});
  const script=document.createElement("script");script.src=sceneKind+".js";
  script.onload=()=>{
    if(!factory){failed=true;report("fallback");return;}
    report("loaded");resume();
  };
  script.onerror=()=>report("fallback");document.head.appendChild(script);
})();
