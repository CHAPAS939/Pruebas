/* Direct manipulation stays local; only a bounded layout is persisted on release. */
window.createRoomEditor=(T,host,camera,world,roots)=>{
  const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),-.08),point=new T.Vector3();
  const grid=new T.GridHelper(7,14,'#86a5ad','#b9c5c5');grid.position.y=.1;grid.material.transparent=true;grid.material.opacity=.38;world.add(grid);
  const outline=new T.BoxHelper(roots.desk,'#92c9cc');outline.material.transparent=true;outline.material.opacity=.75;world.add(outline);
  let settings={},drag=null,preview=null,ackAt=0;
  const visible=object=>{for(let p=object;p&&p!==world;p=p.parent)if(!p.visible)return false;return true;};
  function hit(event){const r=host.getBoundingClientRect();ray.setFromCamera(new T.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);return ray.intersectObjects(Object.values(roots),true).find(h=>visible(h.object));}
  function floor(event){const r=host.getBoundingClientRect();ray.setFromCamera(new T.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);if(!ray.ray.intersectPlane(plane,point))return null;return world.worldToLocal(point.clone());}
  function down(event){if(!settings.editing||event.button!==0)return;const picked=hit(event),p=floor(event),id=picked?.object.userData.furniture;if(!id||!p)return;
    drag={id,pointer:event.pointerId,dx:p.x-roots[id].position.x,dz:p.z-roots[id].position.z};preview={...window.MochiStudioData.layout(settings.layout)};host.setPointerCapture(event.pointerId);event.preventDefault();window.MochiScene.emit('selected',{id});window.MochiScene.redraw();
  }
  function move(event){if(!drag)return;const p=floor(event);if(!p)return;preview=window.MochiStudioData.layout({...preview,[drag.id]:{x:p.x-drag.dx,z:p.z-drag.dz,rotation:roots[drag.id].rotation.y}});window.MochiScene.redraw();event.preventDefault();}
  function up(event){if(!drag||drag.pointer!==event.pointerId)return;host.releasePointerCapture(event.pointerId);drag=null;ackAt=performance.now()+1800;if(preview)window.MochiScene.emit('layout',{layout:preview});window.MochiScene.redraw();}
  function cancel(){drag=null;preview=null;window.MochiScene.redraw();}
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancel);
  return {update(s){settings=s;if(!s.editing){drag=null;preview=null}if(preview&&!drag&&(JSON.stringify(preview)===JSON.stringify(window.MochiStudioData.layout(s.layout))||performance.now()>ackAt))preview=null;
      grid.visible=!!s.editing;outline.visible=!!s.editing&&!!roots[s.selected]?.visible; if(outline.visible){outline.setFromObject(roots[s.selected]);outline.update()}
      host.style.cursor=s.editing?(drag?'grabbing':'grab'):'default';return preview||s.layout;
    },dispose(){for(const[type,fn]of[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel]])host.removeEventListener(type,fn);grid.geometry.dispose();grid.material.dispose();outline.geometry.dispose();outline.material.dispose();}};
};
