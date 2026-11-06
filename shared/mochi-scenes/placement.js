/* Floor footprints, alignment and collision checks; no renderer dependency. */
(() => {
 const sizes={desk:[3.5,1.75],rest:[1.4,1.3],plant:[1,1],rug:[3,2],bed:[1.6,2],console:[1.8,2.4],bookshelf:[1.9,2]};
 const defaults={desk:[0,.8],rest:[2.7,.78],plant:[-2.8,.76],rug:[0,.65],bed:[-2.45,-1.1],console:[2.3,-1.25],bookshelf:[0,-1.5]};
 const pose=(layout,id)=>layout[id]||{x:defaults[id][0],z:defaults[id][1],rotation:0};
 const extent=(id,p)=>{const[w,d]=sizes[id],c=Math.abs(Math.cos(p.rotation)),s=Math.abs(Math.sin(p.rotation));return[(c*w+s*d)/2,(s*w+c*d)/2]};
 function penetration(a,pa,b,pb){
  if(a==='rug'||b==='rug')return 0;
  const axes=p=>[[Math.cos(p.rotation),-Math.sin(p.rotation)],[Math.sin(p.rotation),Math.cos(p.rotation)]];
  const aa=axes(pa),bb=axes(pb),dx=pb.x-pa.x,dz=pb.z-pa.z;
  const radius=(id,basis,axis)=>sizes[id].reduce((sum,len,i)=>sum+len*.5*Math.abs(basis[i][0]*axis[0]+basis[i][1]*axis[1]),0);
  return Math.max(0,Math.min(...[...aa,...bb].map(axis=>radius(a,aa,axis)+radius(b,bb,axis)-Math.abs(dx*axis[0]+dz*axis[1])-.025)));
 }
 const overlap=(a,pa,b,pb)=>penetration(a,pa,b,pb)>1e-7;
 function resolve(layout,context={}){return {...layout,plant:layout.plant||{x:context.plantPosition==='right'?3:-2.8+(context.plantPosition==='back'?.1:0),z:context.plantPosition==='right'?-1.2:context.plantPosition==='back'?-1.65:.76,rotation:0}}}
 function active(context={}){return ['desk','rest',...(context.plant===false?[]:['plant']),...(context.objects||[]).filter(id=>['bed','console','bookshelf'].includes(id))]}
 function place(layout,id,desired,context={}){
  if(!sizes[id])return{layout,blocked:true,snapped:[]};
  const normalize=value=>globalThis.MochiStudioData.layout(value),adjusted=resolve(layout,context),old=pose(adjusted,id),others=active(context).filter(v=>v!==id);
  let target=normalize({[id]:desired})[id],snapped=[];
  if(id!=='rug')for(const axis of ['x','z']){
    const candidates=[0,...others.map(other=>pose(adjusted,other)[axis])];
    const nearest=candidates.sort((a,b)=>Math.abs(a-target[axis])-Math.abs(b-target[axis]))[0];
    if(Math.abs(nearest-target[axis])<=.11){target[axis]=nearest;snapped.push(axis)}
  }
  target=normalize({[id]:target})[id];
  const score=p=>others.reduce((sum,other)=>sum+penetration(id,p,other,pose(adjusted,other)),0),initialScore=score(old);
  const clear=p=>score(p)<=initialScore+1e-7;
  if(Math.abs(target.rotation-old.rotation)>.001){if(!clear(target))return{layout,blocked:true,snapped:[]};return{layout:normalize({...layout,[id]:target}),blocked:false,snapped}}
  // Sweep the path: a quick pointer movement cannot tunnel through a cabinet.
  let accepted=old,blocked=false;
  const steps=Math.max(1,Math.ceil(Math.hypot(target.x-old.x,target.z-old.z)/.08));
  for(let i=1;i<=steps;i++){
    const p={x:old.x+(target.x-old.x)*i/steps,z:old.z+(target.z-old.z)*i/steps,rotation:target.rotation};
    if(score(p)>score(accepted)+1e-7){blocked=true;break}accepted=p;
  }
  const result=normalize({...layout,[id]:accepted});
  // Rounding onto the floor grid must not introduce an overlap.
  if(!clear(result[id]))return{layout,blocked:true,snapped:[]};
  return{layout:result,blocked,snapped:blocked?[]:snapped};
 }
 function isClear(layout,id,p,context={}){const adjusted=resolve(layout,context);return active(context).filter(o=>o!==id).every(o=>!overlap(id,p,o,pose(adjusted,o)))}
 function findSpot(layout,id,context={}){
  const adjusted=resolve(layout,context),start=pose(adjusted,id),candidates=[];
  for(let x=-3;x<=3;x+=.25)for(let z=-2;z<=2;z+=.25){const p=globalThis.MochiStudioData.layout({[id]:{x,z,rotation:0}})[id];if(active(context).filter(o=>o!==id).every(o=>!overlap(id,p,o,pose(adjusted,o))))candidates.push(p)}
  candidates.sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z));return candidates[0]||null;
 }
 const api=Object.freeze({sizes,defaults,pose,extent,overlap,place,resolve,findSpot,isClear});
 if(typeof module==='object'&&module.exports)module.exports=api;else globalThis.MochiPlacement=api;
})();
