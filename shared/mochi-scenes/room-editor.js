/* Dragging, floor guides and the collision preview stay local until release. */
window.createRoomEditor=(T,host,camera,world,roots)=>{
 const P=window.MochiPlacement,ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),-.08),point=new T.Vector3();
 const grid=new T.GridHelper(7,28,'#86a5ad','#b9c5c5');grid.position.y=.1;grid.material.transparent=true;grid.material.opacity=.24;world.add(grid);
 const outline=new T.BoxHelper(roots.desk,'#92c9cc');outline.material.transparent=true;outline.material.opacity=.85;world.add(outline);
 const guideMaterial=new T.LineBasicMaterial({color:'#a8e7d0',transparent:true,opacity:.85,depthTest:false}),guideGeometry=new T.BufferGeometry();
 guideGeometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(12),3));
 const guides=new T.LineSegments(guideGeometry,guideMaterial);guides.renderOrder=10;world.add(guides);
 let settings={},drag=null,preview=null,ackAt=0,blocked=false,snapped=[];
 const visible=object=>{for(let p=object;p&&p!==world;p=p.parent)if(!p.visible)return false;return true};
 function rayAt(event){const r=host.getBoundingClientRect();ray.setFromCamera(new T.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera)}
 function floor(event){rayAt(event);if(!ray.ray.intersectPlane(plane,point))return null;return world.worldToLocal(point.clone())}
 function down(event){if(!settings.editing||event.button!==0)return;rayAt(event);const hit=ray.intersectObjects(Object.values(roots),true).find(h=>visible(h.object)),id=hit?.object.userData.furniture,p=floor(event);host.dataset.furnitureHit=id||'none';if(!id||!p)return;
  host.dataset.dragging='true';drag={id,pointer:event.pointerId,dx:p.x-roots[id].position.x,dz:p.z-roots[id].position.z};preview={...window.MochiStudioData.layout(settings.layout)};blocked=false;snapped=[];host.setPointerCapture(event.pointerId);event.preventDefault();window.MochiScene.emit('selected',{id});window.MochiScene.redraw();
 }
 function move(event){if(!drag)return;const p=floor(event);if(!p)return;const result=P.place(preview,drag.id,{x:p.x-drag.dx,z:p.z-drag.dz,rotation:roots[drag.id].rotation.y},settings);preview=result.layout;blocked=result.blocked;snapped=result.snapped;window.MochiScene.redraw();event.preventDefault()}
 function up(event){if(!drag||drag.pointer!==event.pointerId)return;host.releasePointerCapture(event.pointerId);host.dataset.dragging='false';drag=null;ackAt=performance.now()+1800;if(preview)window.MochiScene.emit('layout',{layout:preview,blocked,snapped});window.MochiScene.redraw()}
 function cancel(){drag=null;preview=null;blocked=false;snapped=[];window.MochiScene.redraw()}
 const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel]];listeners.forEach(([type,fn])=>host.addEventListener(type,fn));
 return {update(s){settings=s;if(!s.editing){drag=null;preview=null;snapped=[];blocked=false}if(preview&&!drag&&(JSON.stringify(preview)===JSON.stringify(window.MochiStudioData.layout(s.layout))||performance.now()>ackAt))preview=null;
   grid.visible=!!s.editing;outline.visible=!!s.editing&&!!roots[s.selected]?.visible;
   if(outline.visible){outline.setFromObject(roots[s.selected]);outline.update();outline.material.color.set(blocked?'#e7a494':'#92c9cc')}
   guides.visible=!!drag&&!blocked&&snapped.length>0;
   if(guides.visible){const selected=roots[drag.id],positions=guideGeometry.attributes.position;positions.setXYZ(0,selected.position.x,.13,-2.5);positions.setXYZ(1,selected.position.x,.13,2.5);positions.setXYZ(2,-3.5,.13,selected.position.z);positions.setXYZ(3,3.5,.13,selected.position.z);positions.needsUpdate=true;guideGeometry.computeBoundingSphere()}
   host.dataset.placement=blocked?'blocked':snapped.length?'aligned':'free';host.style.cursor=s.editing?(drag?'grabbing':'grab'):'default';return preview||s.layout;
  },dispose(){listeners.forEach(([type,fn])=>host.removeEventListener(type,fn));for(const object of[grid,outline,guides]){object.geometry.dispose();object.material.dispose()}}};
};

/* Orbit the room with an ordinary drag while the explicit camera tool is active. */
window.createRoomOrbit=host=>{
 let settings={},drag=null,preview=null,ackAt=0;
 function down(e){if(!settings.orbiting||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,camera:{...settings.camera}};host.setPointerCapture(e.pointerId);e.preventDefault()}
 function move(e){if(!drag)return;preview=window.MochiStudioData.camera({yaw:drag.camera.yaw+(e.clientX-drag.x)/Math.max(200,host.clientWidth)*2,pitch:drag.camera.pitch+(e.clientY-drag.y)/Math.max(200,host.clientHeight)});window.MochiScene.redraw();e.preventDefault()}
 function up(e){if(!drag||drag.id!==e.pointerId)return;host.releasePointerCapture(e.pointerId);drag=null;ackAt=performance.now()+1800;if(preview)window.MochiScene.emit('camera',{camera:preview});window.MochiScene.redraw()}
 function cancel(){drag=null;preview=null;window.MochiScene.redraw()}
 function wheel(e){if(!settings.orbiting)return;e.preventDefault();window.MochiScene.emit('zoom',{delta:e.deltaY<0?.1:-.1})}
 const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel]];listeners.forEach(([type,fn])=>host.addEventListener(type,fn));host.addEventListener('wheel',wheel,{passive:false});
 return {update(s){settings=s;if(!s.orbiting){drag=null;preview=null}if(preview&&!drag&&(JSON.stringify(preview)===JSON.stringify(s.camera)||performance.now()>ackAt))preview=null;if(s.orbiting)host.style.cursor=drag?'grabbing':'grab';return preview||s.camera},dispose(){listeners.forEach(([type,fn])=>host.removeEventListener(type,fn));host.removeEventListener('wheel',wheel)}};
};
