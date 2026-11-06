/* Shared wardrobe geometry for the room and the window edge. */
window.createMochiWardrobe=(T,mochi,changed=()=>{},compact=false)=>{
    const materials=new Map();
    const mat=(color,roughness=.8)=>{const key=color+roughness;if(!materials.has(key))materials.set(key,window.createMochiFabricMaterial(T,color));return materials.get(key);};
    const shape=(w,h,r)=>{const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;};
    function box(w,h,d,m,x,y,z,r,parent){const bevel=Math.min(.02,d*.18,r*.45);const geo=new T.ExtrudeGeometry(shape(w,h,Math.min(r,w/2,h/2)),{depth:Math.max(.001,d-2*bevel),bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,curveSegments:10});geo.translate(0,0,-d/2+bevel);const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
    function sphere(r,m,x,y,z,scale,parent){const mesh=new T.Mesh(new T.SphereGeometry(r,20,12),m);mesh.position.set(x,y,z);mesh.scale.set(...scale);mesh.castShadow=true;parent.add(mesh);return mesh;}
    function cylinder(rt,rb,h,m,x,y,z,parent){const mesh=new T.Mesh(new T.CylinderGeometry(rt,rb,h,32),m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
    function rod(points,r,m,parent){const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),16,r,8,false),m);mesh.castShadow=true;parent.add(mesh);return mesh;}
    const outfitCache=new Map();let worn=null;
    function ensure(next){
      let group=outfitCache.get(next);
      if(!group){
        group=new T.Group();mochi.add(group);
        if(compact&&["partyHat","witchHat","santaHat","bunnyEars"].includes(next)){group.scale.y=.55;group.position.y=.198;}outfitCache.set(next,group);
        const cloth=mat('#94ae7e'),ivory=mat('#fff4df'),ink=mat('#30362f'),lavender=mat('#78748e'),gold=mat('#fbbf24',.45),pink=mat('#f15bae');
        const ball=(r,m,x,y,z,scale=[1,1,1])=>sphere(r,m,x,y,z,scale,group);
        const block=(w,h,d,m,x,y,z,r=.025)=>box(w,h,d,m,x,y,z,r,group);
        const tube=(points,r,m)=>rod(points,r,m,group);
        const cone=(radius,height,m,x,y,z)=>{const o=new T.Mesh(new T.ConeGeometry(radius,height,40),m);o.position.set(x,y,z);o.castShadow=true;group.add(o);return o;};
        const ring=(radius,thickness,m,x,y,z)=>{const o=new T.Mesh(new T.TorusGeometry(radius,thickness,8,32),m);o.position.set(x,y,z);o.castShadow=true;group.add(o);return o;};
        if(next==='headphones'){
          const points=Array.from({length:21},(_,i)=>{const a=i*Math.PI/20;return [Math.cos(a)*.64,Math.sin(a)*.62,.0]});
          tube(points,.045,mat('#58566f'));
          for(const side of [-1,1]){block(.18,.33,.29,lavender,side*.65,.015,.02,.08);block(.045,.24,.23,mat('#b5aacb'),side*.755,.015,.02,.02);}
        }else if(next==='frogHat'){
          ball(.56,cloth,0,.48,.015,[1,.43,.67]);block(1.13,.07,.77,cloth,0,.44,.015,.06);
          for(const side of [-1,1]){ball(.145,cloth,side*.30,.73,.06);ball(.092,ivory,side*.30,.75,.175,[1,1,.35]);ball(.041,ink,side*.30,.75,.207,[1,1,.35]);}
        }else if(next==='flower'){
          for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ball(.085,ivory,.40+Math.cos(a)*.13,.47+Math.sin(a)*.13,.30,[1,1,.34]);}
          ball(.09,gold,.40,.47,.335,[1,1,.4]);
        }else if(next==='sunglasses'||next==='roundGlasses'){
          const dark=mat(next==='sunglasses'?'#111317':'#8a4b12',.35);
          for(const side of [-1,1]){
            if(next==='sunglasses')block(.34,.21,.065,dark,side*.24,.04,.395,.06);
            else ring(.16,.018,dark,side*.24,.04,.395);
          }
          block(.18,.025,.035,dark,0,.06,.40,.008);tube([[-.42,.09,.38],[-.54,.10,.22],[-.55,.08,.0]],.015,dark);tube([[.42,.09,.38],[.54,.10,.22],[.55,.08,.0]],.015,dark);
        }else if(next==='bunnyEars'){
          for(const side of [-1,1]){const ear=ball(.22,ivory,side*.25,.79,.0,[.6,2.0,.4]);ear.rotation.z=-side*.14;const inner=ball(.14,pink,side*.25,.80,.065,[.56,2,.24]);inner.rotation.z=-side*.14;}
        }else if(next==='beanie'){
          ball(.53,mat('#3c7bea'),0,.47,0,[1,.65,.70]);block(1.10,.14,.72,mat('#2257c4'),0,.43,0,.06);ball(.13,ivory,0,.87,0);
        }else if(next==='santaHat'){
          cone(.48,.69,mat('#e53935'),-.03,.76,0).rotation.z=.13;block(1.07,.13,.73,ivory,0,.43,0,.05);ball(.13,ivory,-.08,1.12,0);
        }else if(next==='partyHat'||next==='witchHat'){
          const party=next==='partyHat',color=party?pink:mat('#5b21b6');
          cone(party?.35:.45,party?.78:.93,color,0,.84,0).rotation.z=-.10;
          if(!party){const brim=cylinder(.67,.67,.055,color,0,.43,0,group);brim.scale.z=.72;block(.79,.07,.52,mat('#f97316'),0,.56,0);}
          else{ball(.095,gold,.04,1.25,0);for(let i=0;i<4;i++)ball(.035,gold,-.18+i*.11,.62+(i%2)*.16,.23);}
        }else if(next==='crown'){
          block(.96,.16,.61,gold,0,.48,0,.02);
          for(let i=0;i<5;i++){cone(.105,.31,gold,-.40+i*.20,.69,.24);ball(.045,mat(['#ef4444','#3b82f6','#22c55e','#a855f7'][i%4]),-.40+i*.20,.85,.24);}
        }else if(next==='bow'){
          for(const side of [-1,1]){const wing=ball(.17,mat('#db2777'),.38+side*.12,.43,.30,[1,.7,.35]);wing.rotation.z=side*.25;}ball(.06,mat('#c2185b'),.38,.43,.37);
        }else if(next==='scarf'){
          block(1.10,.14,.75,mat('#dc2626'),0,-.34,0,.06);const tail=block(.18,.40,.055,mat('#ef4444'),.33,-.53,.40);tail.rotation.z=-.13;
        }else if(next==='pumpkin'){
          const stem=cylinder(.045,.055,.22,cloth,0,.57,0,group);stem.rotation.z=-.2;ball(.12,cloth,-.12,.59,.03,[1,.35,.5]);
          for(const x of [-.33,-.16,.16,.33])tube([[x,-.28,.34],[x*1.07,0,.465],[x,.28,.35]],.012,mat('#c87f48'));
        }
      }
      return group;
    }
    function wear(selection,glasses='none',scarf=false,accent='original'){
      let choices=selection&&selection!=='none'?[selection]:[];
      if(glasses==='sunglasses'||glasses==='roundGlasses'){choices=choices.filter(o=>o!=='sunglasses'&&o!=='roundGlasses');choices.push(glasses);}
      if(scarf&&!choices.includes('scarf'))choices.push('scarf');
      const key=choices.join('|')+'@'+accent;if(worn===key)return;worn=key;outfitCache.forEach(g=>g.visible=false);
      choices.forEach(outfit=>ensure(outfit).visible=true);
      for(const [key,m]of materials){const rgb=window.mochiAccessoryColor(key.slice(0,7),accent);m.color.setRGB(...rgb,T.SRGBColorSpace);}
      changed();
    }
    return {wear,dispose(){materials.forEach(m=>m.dispose());materials.clear();}};
};
