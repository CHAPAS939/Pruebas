/* Actual body materials, facets and lighting. No clothing replaces the body. */
window.createMochiAppearance=(T,renderer,scene,body,material,eyes)=>{
  const facetMaterial=material.clone();
  const originalGeometry=body.geometry,outline=[[-.4,-.48],[.4,-.48],[.6,-.28],[.6,.28],[.4,.48],[-.4,.48],[-.6,.28],[-.6,-.28]],rings=[[-.3,.72],[-.15,1],[.15,1],[.26,.75]],positions=[];
  const vertex=(ring,index)=>{const[z,scale]=rings[ring],[x,y]=outline[index%8];return[x*scale,y*scale,z]};
  const triangle=(...vertices)=>vertices.forEach(v=>positions.push(...v));
  for(let r=0;r<3;r++)for(let i=0;i<8;i++){const a=vertex(r,i),b=vertex(r,i+1),c=vertex(r+1,i+1),d=vertex(r+1,i);triangle(a,b,c);triangle(a,c,d)}
  for(let i=0;i<8;i++){triangle([0,0,.34],vertex(3,i),vertex(3,i+1));triangle([0,0,-.31],vertex(0,i+1),vertex(0,i))}
  const faceted=new T.BufferGeometry();faceted.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  const count=faceted.attributes.position.count,colors=[];
  for(let i=0;i<count;i++){const face=Math.floor(i/3),n=(Math.sin(face*12.9898+4.1)*43758.5453)%1;const color=new T.Color().setHSL(.52+(Math.abs(n)*.16),.16+Math.abs(n)*.20,.63+Math.abs(n)*.32);colors.push(color.r,color.g,color.b);}
  faceted.setAttribute('color',new T.Float32BufferAttribute(colors,3));faceted.computeVertexNormals();
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
  const light=ctx.createLinearGradient(0,0,0,256);light.addColorStop(0,'#d9ecff');light.addColorStop(.45,'#edf2f5');light.addColorStop(.5,'#9ca9b9');light.addColorStop(1,'#313b52');ctx.fillStyle=light;ctx.fillRect(0,0,512,256);
  for(const[x,w]of[[40,22],[180,65],[380,30]]){ctx.fillStyle='#ffffff';ctx.fillRect(x,12,w,105);}
  const envTexture=new T.CanvasTexture(canvas);envTexture.mapping=T.EquirectangularReflectionMapping;envTexture.colorSpace=T.SRGBColorSpace;
  const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(envTexture);scene.environment=environment.texture;pmrem.dispose();
  const textures={};
  for(const kind of ['galaxy','lava']){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),g=x.createRadialGradient(140,90,0,128,128,190);g.addColorStop(0,kind==='galaxy'?'#565191':'#3a1a23');g.addColorStop(1,'#101627');x.fillStyle=g;x.fillRect(0,0,256,256);
    if(kind==='galaxy')for(let i=0;i<75;i++){x.fillStyle=i%4?'#eee9ff':'#a9d8ff';x.beginPath();x.arc((i*73.7)%256,(i*41.3)%256,i%7===0?1.7:.7,0,Math.PI*2);x.fill();}
    else for(let i=0;i<13;i++){x.strokeStyle=i%2?'#ff9e52':'#e66343';x.lineWidth=i%2?2:4;x.beginPath();for(let j=0;j<6;j++){const a=(i*47+j*31)%256,b=j*55;(j?x.lineTo(a,b):x.moveTo(a,b));}x.stroke();}
    textures[kind]=new T.CanvasTexture(c);textures[kind].colorSpace=T.SRGBColorSpace;textures[kind].wrapS=textures[kind].wrapT=T.RepeatWrapping;
  }
  // Small individual stones follow the unchanged Mochi body surface.
  scene.updateMatrixWorld(true);
  const ray=new T.Raycaster(),center=body.getWorldPosition(new T.Vector3()),stones=[];
  for(let i=0;i<210;i++){
    const y=1-2*(i+.5)/210,a=i*2.3999632297,r=Math.sqrt(1-y*y),dir=new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
    const origin=body.localToWorld(dir.clone().multiplyScalar(2));ray.set(origin,center.clone().sub(origin).normalize());
    const hit=ray.intersectObject(body,false)[0];if(!hit)continue;
    const p=body.worldToLocal(hit.point.clone()),n=hit.face.normal.clone();
    // Keep the eyes and cheeks readable between the little jewels.
    if(p.z>.15&&((Math.abs(Math.abs(p.x)-.218)<.12&&Math.abs(p.y-.035)<.15)||(Math.abs(p.x)>.32&&p.y<-.07&&p.y>-.22)))continue;
    stones.push({p,n,size:.027+(i%5)*.0025});
  }
  const gemGeometry=new T.OctahedronGeometry(1,0),gemMaterial=new T.MeshPhysicalMaterial({color:'#f5fcff',roughness:.025,metalness:.18,clearcoat:1,clearcoatRoughness:.06,transmission:.05,thickness:.04,ior:2.4,envMapIntensity:3,emissive:'#abdfff',emissiveIntensity:.18});
  const gems=new T.InstancedMesh(gemGeometry,gemMaterial,stones.length),dummy=new T.Object3D();
  stones.forEach(({p,n,size},i)=>{dummy.position.copy(p).addScaledVector(n,.012);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);dummy.scale.set(size,size*1.12,size*.75);dummy.updateMatrix();gems.setMatrixAt(i,dummy.matrix);gems.setColorAt(i,new T.Color(i%3?'#e5f7ff':'#ffffff'))});gems.castShadow=true;body.add(gems);
  const flareCanvas=document.createElement('canvas');flareCanvas.width=flareCanvas.height=64;const fc=flareCanvas.getContext('2d');
  const halo=fc.createRadialGradient(32,32,0,32,32,30);halo.addColorStop(0,'#ffffffff');halo.addColorStop(.18,'#e1f6ffcc');halo.addColorStop(.45,'#b7e2ff33');halo.addColorStop(1,'#b7e2ff00');fc.fillStyle=halo;fc.fillRect(0,0,64,64);fc.fillStyle='#ffffff';fc.beginPath();fc.moveTo(32,3);fc.lineTo(35,28);fc.lineTo(61,32);fc.lineTo(35,35);fc.lineTo(32,61);fc.lineTo(29,35);fc.lineTo(3,32);fc.lineTo(29,29);fc.closePath();fc.fill();
  const flareTexture=new T.CanvasTexture(flareCanvas),flares=new T.Group();body.add(flares);
  stones.filter((s,i)=>s.p.z>.15&&i%11===0).slice(0,8).forEach((s,i)=>{const m=new T.SpriteMaterial({map:flareTexture,color:'#f0fbff',transparent:true,depthWrite:false,blending:T.AdditiveBlending});const sprite=new T.Sprite(m);sprite.position.copy(s.p).addScaledVector(s.n,.065);sprite.scale.set(.13,.13,.13);sprite.userData.phase=i*1.9;flares.add(sprite)});
  let last='';
  const skinColors={classic:'#eeeae0',diamond:'#12131b',opal:'#e8e3ee',obsidian:'#252538',gold:'#d9ab50',galaxy:'#ffffff',jelly:'#eda7c4',lava:'#ffffff'};
  function update(skin,stateColor,time=0,quiet=false){skin=Object.hasOwn(skinColors,skin)?skin:'classic';
    if(last!==skin){last=skin;const facets=skin==='obsidian';body.geometry=facets?faceted:originalGeometry;
      material.vertexColors=false;material.flatShading=false;body.material=facets?facetMaterial:material;material.metalness=skin==='gold'?.94:skin==='obsidian'?.5:skin==='diamond'?.22:.04;
      material.roughness=skin==='diamond'?.65:skin==='classic'?.42:skin==='galaxy'||skin==='lava'?.38:skin==='jelly'?.12:.15;
      material.clearcoat=skin==='classic'||skin==='diamond'?.2:1;material.clearcoatRoughness=.12;material.iridescence=skin==='opal'?1:0;material.iridescenceIOR=1.3;
      material.transparent=skin==='jelly';material.opacity=skin==='jelly'?.86:1;material.transmission=skin==='jelly'?.18:0;material.thickness=.35;
      material.map=textures[skin]||null;material.emissiveMap=skin==='lava'?textures.lava:null;material.emissive.set(skin==='lava'?'#b55d30':'#000000');material.emissiveIntensity=skin==='lava'?.28:0;material.envMapIntensity=skin==='gold'?1.6:1;
      material.needsUpdate=true;facetMaterial.copy(material);facetMaterial.vertexColors=false;facetMaterial.flatShading=facets;facetMaterial.color.set(skin==='diamond'?'#ffffff':skinColors[skin]);facetMaterial.needsUpdate=true;
    }
    material.color.set(skin==='classic'?stateColor:skinColors[skin]);gems.visible=flares.visible=skin==='diamond';flares.children.forEach(s=>s.material.opacity=quiet?.8:.55+.4*Math.pow(Math.sin(time/1700+s.userData.phase),2));eyes?.color.set(['diamond','obsidian','galaxy','lava'].includes(skin)?'#fff1dc':'#27251e');
  }
  return {update,dispose(){faceted.dispose();facetMaterial.dispose();gemGeometry.dispose();gemMaterial.dispose();flareTexture.dispose();flares.children.forEach(s=>s.material.dispose());Object.values(textures).forEach(t=>t.dispose());environment.dispose();envTexture.dispose();}};
};
