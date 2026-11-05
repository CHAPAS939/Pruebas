/* Shared local scene; both desktop apps load this exact file. */
window.MochiScene.register("home",(host)=>{
    const T=window.THREE;
    let current={state:"idle",emote:null,night:false,lamp:true,rain:true,reduceMotion:false,character:true};
    const scene=new T.Scene();
    const camera=new T.OrthographicCamera(-6,6,4.5,-4.5,.1,100);
    camera.position.set(9,7.4,11);camera.lookAt(0,1.8,0);
    const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;
    renderer.shadowMap.autoUpdate=false;
    renderer.domElement.className='diorama-canvas';renderer.domElement.setAttribute('aria-hidden','true');
    host.appendChild(renderer.domElement);host.classList.add('room3d-ready');
    const world=new T.Group();scene.add(world);
    const mat=(color,roughness=.8)=>new T.MeshStandardMaterial({color,roughness});
    const palette={wall:mat('#ecd7b8'),wallSide:mat('#e2c7a5'),floor:mat('#c19c75'),edge:mat('#a67d56'),wood:mat('#bf9164'),woodDark:mat('#8a6443'),cream:mat('#f1e4c9'),mint:mat('#a5b38b'),moss:mat('#667c55'),terracotta:mat('#be7e5c'),rose:mat('#d2a591'),paper:mat('#eee3cc'),metal:mat('#b6ada0',.35),black:mat('#292b2b'),clock:mat('#f4e7c9')};
    function roundedShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
    function box(w,h,d,m,x=0,y=0,z=0,r=.04,parent=world){
      const s=roundedShape(w,h,Math.min(r,w/2,h/2));
      const b=Math.min(.025,d*.18,r*.45);
      const geo=new T.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*b),bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:3,curveSegments:10});
      geo.translate(0,0,-d/2+b);
      const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
    }
    function sphere(r,m,x,y,z,scale=[1,1,1],parent=world){const o=new T.Mesh(new T.SphereGeometry(r,24,16),m);o.scale.set(...scale);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
    function cylinder(rt,rb,h,m,x,y,z,parent=world){const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,40),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
    function rod(points,r,m,parent=world){const g=new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,8,false);const o=new T.Mesh(g,m);o.castShadow=true;parent.add(o);return o;}
    function shadow(x,z,w,d,opacity=.15){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),gr=ctx.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(70,39,18,${opacity})`);gr.addColorStop(1,'rgba(70,39,18,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);const p=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(x,.055,z);world.add(p);}
    // A bevelled little architectural model, open on two sides.
    box(7.5,.22,5.4,palette.edge,0,-.11,0,.1);
    box(7.42,.07,5.32,palette.floor,0,.035,0,.04);
    for(let x=-3.5;x<3.7;x+=.47)box(.012,.006,5.22,mat('#ae885e'),x,.075,0,.001);
    box(.16,4.35,5.4,palette.wallSide,-3.7,2.15,0,.05);
    box(7.45,.14,.13,palette.cream,0,.17,-2.59,.02);
    box(.13,.14,5.3,palette.cream,-3.59,.17,0,.02);
    const wallShape=new T.Shape();wallShape.moveTo(-3.7,0);wallShape.lineTo(3.7,0);wallShape.lineTo(3.7,4.35);wallShape.lineTo(-3.7,4.35);wallShape.closePath();
    const hole=new T.Path();const wx=1.8,wy=2.64,ww=2.35,wh=2.55,wr=.68;
    const arch=roundedShape(ww,wh,wr);hole.curves=arch.curves;hole.currentPoint=arch.currentPoint;for(const curve of hole.curves){for(const k of ['v0','v1','v2','v3'])if(curve[k]){curve[k]=curve[k].clone();curve[k].x+=wx;curve[k].y+=wy;}}
    wallShape.holes.push(hole);
    const wallGeo=new T.ExtrudeGeometry(wallShape,{depth:.14,bevelEnabled:false,curveSegments:24});
    const backWall=new T.Mesh(wallGeo,palette.wall);backWall.position.z=-2.7;backWall.receiveShadow=true;backWall.castShadow=true;world.add(backWall);
    // Window pane, wooden frame, distant hills and a sun/moon, all behind the wall.
    const inner=roundedShape(ww-.06,wh-.06,wr-.03);const ringShape=roundedShape(ww+.2,wh+.2,wr+.1);ringShape.holes.push(new T.Path(inner.getPoints(64)));
    const frame=new T.Mesh(new T.ExtrudeGeometry(ringShape,{depth:.14,bevelEnabled:false,curveSegments:24}),palette.wood);frame.position.set(wx,wy,-2.48);world.add(frame);
    const skyMaterial=new T.MeshBasicMaterial({color:'#c2d8d4'});
    const sky=new T.Mesh(new T.ShapeGeometry(roundedShape(ww,wh,wr),32),skyMaterial);sky.position.set(wx,wy,-2.73);world.add(sky);
    const hillMaterial=new T.MeshBasicMaterial({color:'#96ad96'});
    const hillShape=new T.Shape();hillShape.moveTo(-ww/2,-wh/2);hillShape.lineTo(ww/2,-wh/2);hillShape.lineTo(ww/2,-.38);hillShape.quadraticCurveTo(.1,.1,-ww/2,-.6);hillShape.closePath();
    const hill=new T.Mesh(new T.ShapeGeometry(hillShape,24),hillMaterial);hill.position.set(wx,wy,-2.7);world.add(hill);
    const sun=sphere(.19,new T.MeshBasicMaterial({color:'#fff1c4'}),wx+.6,wy+.66,-2.69,[1,1,.1]);
    const starMaterial=new T.MeshBasicMaterial({color:'#f4e6be'});const stars=[];
    for(let i=0;i<9;i++){const star=sphere(.012,starMaterial,wx-.9+(i*13%19)*.09,wy+.12+(i*7%12)*.075,-2.68);stars.push(star);}
    box(.075,wh,.12,palette.wood,wx,wy,-2.38,.015);
    box(ww,.07,.12,palette.wood,wx,wy-.2,-2.38,.015);
    box(ww+.4,.13,.5,palette.wood,wx,wy-wh/2-.12,-2.28,.04);
    // Transparent drops make the weather tangible without obscuring the view.
    const rain=new T.Group();world.add(rain);const drops=[];
    const rainMat=new T.MeshBasicMaterial({color:'#e7f3f0',transparent:true,opacity:.55});
    for(let i=0;i<24;i++){const d=box(.013,.13,.008,rainMat,wx-.99+(i*23%97)/49,wy-wh/2+.1+(i*37%95)/41,-2.36,.003,rain);d.rotation.z=-.12;drops.push(d);}
    // Woven rug and seating.
    const rug=cylinder(1.56,1.56,.025,mat('#d0bca0'),-.05,.095,.85);rug.scale.z=.58;
    const rugLine=new T.Mesh(new T.TorusGeometry(1.4,.013,5,80),mat('#e2d1b4'));rugLine.rotation.x=-Math.PI/2;rugLine.scale.y=.58;rugLine.position.set(-.05,.112,.85);world.add(rugLine);
    shadow(0,.6,4.5,2.7,.14);
    cylinder(.36,.4,.08,palette.woodDark,.15,.72,-.16);cylinder(.055,.055,.65,palette.woodDark,.15,.37,-.16);
    // Soft wood desk with tapered legs and a slightly rounded edge.
    box(3.6,.17,1.56,palette.wood,0,1.58,.65,.08);
    box(3.45,.035,1.43,mat('#d2aa7a'),0,1.686,.65,.04);
    for(const x of [-1.49,1.49])for(const z of [.08,1.22]){const leg=cylinder(.055,.085,1.5,palette.woodDark,x,.76,z);leg.rotation.z=x>0?-.025:.025;}
    // Small laptop, real bevels and a quiet screen glow.
    box(.99,.045,.65,palette.metal,.22,1.735,.78,.03);
    const laptop=new T.Group();laptop.position.set(.22,1.76,.48);laptop.rotation.x=-.13;world.add(laptop);
    box(.98,.62,.045,palette.metal,0,.31,0,.04,laptop);
    box(.9,.53,.009,mat('#536a60',.3),0,.315,.031,.025,laptop);
    const screenGlow=new T.MeshBasicMaterial({color:'#d9d7b5'});
    for(let i=0;i<4;i++)box(.18+(i%3)*.09,.012,.006,screenGlow,-.23+(i%2)*.03,.43-i*.07,.039,.002,laptop);
    for(let row=0;row<3;row++)for(let col=0;col<9;col++)box(.065,.008,.038,mat('#95958b'),-.15+col*.076,1.763,.74+row*.055,.004);
    box(.27,.006,.12,mat('#a6a59b'),.22,1.764,1.0,.015);
    // Lamp: a warm, shaded pool of light on the desk.
    cylinder(.22,.25,.045,palette.mint,-1.16,1.74,.4);
    rod([[-1.16,1.76,.4],[-1.16,2.27,.4],[-.91,2.5,.4]],.025,palette.mint);
    const shade=cylinder(.13,.29,.24,palette.mint,-.9,2.44,.4);shade.rotation.z=-.12;
    const bulb=new T.Mesh(new T.CircleGeometry(.24,40),new T.MeshBasicMaterial({color:'#ffedb7'}));bulb.rotation.x=-Math.PI/2;bulb.position.set(-.9,2.313,.4);world.add(bulb);
    const lampLight=new T.PointLight('#ffc375',4,5,2);lampLight.position.set(-.9,2.25,.4);scene.add(lampLight);
    // A hand-thrown cup with coffee and a fine handle.
    cylinder(.12,.095,.22,palette.cream,1.23,1.83,.89);
    cylinder(.107,.107,.009,mat('#70523b'),1.23,1.946,.89);
    const handle=new T.Mesh(new T.TorusGeometry(.08,.023,10,24),palette.cream);handle.position.set(1.36,1.84,.89);world.add(handle);
    const steamMaterial=new T.MeshBasicMaterial({color:'#fff5e5',transparent:true,opacity:.28});
    const steams=[];for(let i=0;i<2;i++)steams.push(rod([[1.2+i*.06,2.01,.89],[1.17+i*.06,2.13,.89],[1.21+i*.06,2.25,.89]],.007,steamMaterial));
    // Shelf, books and a little framed botanical print.
    box(2.4,.11,.5,palette.wood,-1.5,2.97,-2.31,.04);
    const bookColors=['#8b9d7b','#d2b08b','#bd8d78','#c7bca7','#899a9d'];
    for(let i=0;i<5;i++){const b=box(.13,.49+(i%2)*.1,.28,mat(bookColors[i]),-2.4+i*.19,3.26+(i%2)*.05,-2.31,.015);b.rotation.z=i===3?-.13:0;}
    box(.49,.65,.055,palette.woodDark,-.83,3.36,-2.36,.025);
    box(.39,.55,.012,palette.paper,-.83,3.36,-2.319,.01);
    rod([[-.83,3.13,-2.307],[-.83,3.4,-2.307],[-.88,3.5,-2.307]],.008,palette.moss);
    sphere(.07,palette.mint,-.9,3.36,-2.3,[1,.45,.1]);sphere(.06,palette.moss,-.76,3.43,-2.3,[1,.5,.1]);
    // Wall clock, slightly raised from the plaster.
    const clock=cylinder(.27,.27,.06,palette.wood,.16,3.7,-2.35);clock.rotation.x=Math.PI/2;
    const clockFace=new T.Mesh(new T.CircleGeometry(.235,40),palette.clock);clockFace.position.set(.16,3.7,-2.31);world.add(clockFace);
    rod([[.16,3.7,-2.3],[.16,3.84,-2.3]],.009,palette.woodDark);rod([[.16,3.7,-2.3],[.27,3.66,-2.3]],.009,palette.woodDark);
    const plantStart=world.children.length;
    // Leafy friend in a terracotta pot.
    cylinder(.36,.25,.64,palette.terracotta,-2.8,.39,.76);cylinder(.38,.38,.1,mat('#cd9370'),-2.8,.72,.76);
    cylinder(.31,.31,.025,mat('#7f6245'),-2.8,.777,.76);
    for(let i=0;i<8;i++){
      const a=i*2.4,stemH=.7+(i%3)*.18,x=-2.8+Math.sin(a)*.42,z=.76+Math.cos(a)*.35;
      rod([[-2.8,.78,.76],[(x-2.8)/2,1.0,.76],[x,stemH+.75,z]],.013,palette.moss);
      const leaf=sphere(.31,i%2?palette.mint:palette.moss,x,stemH+.8,z,[.48,1,.17]);leaf.rotation.z=-Math.sin(a)*.65;leaf.rotation.y=a;
    }
    const plantGroup=new T.Group();world.children.slice(plantStart).forEach(part=>plantGroup.add(part));world.add(plantGroup);
    // A soft cushion in the corner, with a book waiting on it.
    const cushion=box(1.1,.25,.9,mat('#a7ad8b'),2.7,.25,.78,.16);
    const pillow=box(.7,.14,.6,mat('#cbd0b0'),2.72,.46,.76,.14);pillow.rotation.y=.13;
    box(.42,.06,.5,mat('#c19a7c'),2.72,.58,.72,.03);
    // Mochi: the squircle, eyes and rosy cheeks rendered as real geometry.
    const mochi=new T.Group();mochi.position.set(.05,2.43,-.12);mochi.rotation.y=.52;world.add(mochi);
    const bodyMaterial=new T.MeshPhysicalMaterial({color:'#eeeae1',roughness:.38,metalness:0,clearcoat:.2,clearcoatRoughness:.7});
    const bodyGeo=new T.ExtrudeGeometry(roundedShape(.94,.72,.28),{depth:.32,bevelEnabled:true,bevelSize:.13,bevelThickness:.13,bevelSegments:8,curveSegments:24});
    bodyGeo.translate(0,0,-.16);const body=new T.Mesh(bodyGeo,bodyMaterial);body.castShadow=true;mochi.add(body);
    const eyeMat=mat('#282621',.4),cheekMat=new T.MeshBasicMaterial({color:'#dba7a0',transparent:true,opacity:.55});
    const eyes=[-1,1].map(side=>box(.1,.18,.025,eyeMat,side*.218,.035,.345,.049,mochi));
    const cheeks=[-1,1].map(side=>sphere(.075,cheekMat,side*.397,-.13,.334,[1.1,.46,.17],mochi));
    for(const side of [-1,1])sphere(.11,bodyMaterial,side*.68,-.13,.03,[1,.8,.8],mochi);
    const happyEyes=[-1,1].map(side=>rod([[side*.218-.07,0,.368],[side*.218,.05,.369],[side*.218+.07,0,.368]],.022,eyeMat,mochi));
    const sleepyEyes=[-1,1].map(side=>rod([[side*.218-.065,.025,.368],[side*.218,-.005,.369],[side*.218+.065,.025,.368]],.016,eyeMat,mochi));
    const heartShape=new T.Shape();heartShape.moveTo(0,-.065);heartShape.bezierCurveTo(-.18,.04,-.07,.15,0,.07);heartShape.bezierCurveTo(.07,.15,.18,.04,0,-.065);
    const hearts=[-1,1].map(side=>{const m=new T.Mesh(new T.ShapeGeometry(heartShape,16),new T.MeshBasicMaterial({color:'#d47784',side:T.DoubleSide}));m.position.set(side*.218,.015,.37);mochi.add(m);return m;});
    const sparkleGroup=new T.Group();mochi.add(sparkleGroup);
    for(let i=0;i<5;i++){const sp=new T.Mesh(new T.OctahedronGeometry(.055,0),new T.MeshBasicMaterial({color:'#e1b66d'}));sp.position.set(Math.sin(i*1.27)*.83,.63+(i%2)*.2,.15);sparkleGroup.add(sp);}
    // Accessories are real local geometry, cached only when tried on. They stay
    // attached to Mochi during breathing and celebration; no renderer is replaced.
    const wardrobe=window.createMochiWardrobe(T,mochi,()=>{renderer.shadowMap.needsUpdate=true;});
    const themes={
      sand:{wall:'#e9dfcf',side:'#dacebc',floor:'#c19f7e',accent:'#a5b397',rug:'#cbbda7',cushion:'#a5b397',bg:'#e9e1d5'},
      sage:{wall:'#d2dcc8',side:'#bccbae',floor:'#b9a085',accent:'#8da283',rug:'#d9d1b8',cushion:'#859c7c',bg:'#e0e6d9'},
      rose:{wall:'#ead5d2',side:'#d6bebb',floor:'#c4a18b',accent:'#bb9296',rug:'#ded0bd',cushion:'#c49a9c',bg:'#eee1dd'},
      midnight:{wall:'#737e91',side:'#566275',floor:'#a88f7e',accent:'#c0a174',rug:'#abb2bf',cushion:'#8c9aaf',bg:'#cbd0d8'}
    };let lastTheme='';
    function decorate(settings){
      const name=themes[settings.theme]?settings.theme:'sand',theme=themes[name];
      if(lastTheme!==name){lastTheme=name;palette.wall.color.set(theme.wall);palette.wallSide.color.set(theme.side);palette.floor.color.set(theme.floor);palette.mint.color.set(theme.accent);rug.material.color.set(theme.rug);cushion.material.color.set(theme.cushion);pillow.material.color.set(theme.rug);renderer.shadowMap.needsUpdate=true;}
      const showPlant=settings.plant!==false,showRug=settings.rug!==false;
      if(plantGroup.visible!==showPlant||rug.visible!==showRug)renderer.shadowMap.needsUpdate=true;
      plantGroup.visible=showPlant;rug.visible=showRug;rugLine.visible=showRug;
      host.style.background=`radial-gradient(ellipse at 48% 20%,${settings.night?'#a1a6b1':'#fffaf0'},${theme.bg})`;
      wardrobe.wear(settings.outfit);host.dataset.outfit=settings.outfit;host.dataset.theme=name;
    }

    // Soft key light and a visible pool of warm light at night.
    const hemi=new T.HemisphereLight('#fff6e5','#b0937c',2.9);scene.add(hemi);
    const key=new T.DirectionalLight('#fff0d7',3.4);key.position.set(3,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.025;key.shadow.bias=-.001;key.shadow.radius=3;key.shadow.blurSamples=8;scene.add(key);
    const fill=new T.DirectionalLight('#e9e1da',1.2);fill.position.set(-5,4,1);scene.add(fill);
    const moonLight=new T.PointLight('#a9b9c8',1.2,8);moonLight.position.set(2,3.4,-1.9);scene.add(moonLight);
    let targetRX=0,targetRY=0,lastLighting='',lastLamp=null,night=false,rendered=0;
    const anchor=new T.Vector3();
    function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const zoom=Math.max(3.8,5.8/aspect)*1.04;camera.left=-zoom*aspect;camera.right=zoom*aspect;camera.top=zoom;camera.bottom=-zoom;camera.updateProjectionMatrix();}
    function draw(time=0,settings=current){
      current=settings;decorate(settings);
      const quiet=settings.reduceMotion;
      const now=quiet?0:time/1000;
      const wantsNight=settings.night,wantsLamp=settings.lamp;
      if(lastLighting!==String(wantsNight)||lastLamp!==wantsLamp){
        night=wantsNight;lastLighting=String(night);lastLamp=wantsLamp;
        skyMaterial.color.set(night?'#53647d':'#c8dcdb');hillMaterial.color.set(night?'#516975':'#9bac93');sun.material.color.set(night?'#f6e9c4':'#fff2ce');
        hemi.intensity=night?.9:1.7;hemi.color.set(night?'#b9c2cd':'#fff6e5');key.intensity=night?1:2.4;key.color.set(night?'#f5ceab':'#fff0d7');fill.color.set(night?'#a6b6d4':'#e9e1da');fill.intensity=night?.6:.9;
        lampLight.intensity=wantsLamp?(night?6:3):0;bulb.visible=wantsLamp;renderer.toneMappingExposure=night?1.0:1.08;renderer.shadowMap.needsUpdate=true;
        stars.forEach(s=>s.visible=night);
      }
      rain.visible=settings.rain;
      drops.forEach((d,i)=>{d.position.y=wy-wh/2+.1+((i*.317+now*.72)%2.22)});
      steams.forEach((s,i)=>{s.rotation.z=Math.sin(now*1.1+i)*.035;steamMaterial.opacity=.22+Math.sin(now*.9)*.07});
      const state=settings.state,love=settings.emote==='love';
      const happy=state==='finished',asleep=state==='sleeping';
      mochi.position.y=2.43+(quiet?0:Math.sin(now*(asleep?1.3:1.8))*(asleep?.012:.018))+(happy&&!quiet?Math.abs(Math.sin(now*3.7))*.12:0);
      mochi.rotation.z=happy&&!quiet?Math.sin(now*3.7)*.055:0;
      const blink=quiet?1:(Math.sin(now*.87)>0.995?.1:1);
      eyes.forEach(e=>{e.visible=!happy&&!asleep&&!love;e.scale.y=blink*(state==='approval'?1.3:state==='error'?.25:1)});happyEyes.forEach(e=>e.visible=happy&&!love);sleepyEyes.forEach(e=>e.visible=asleep&&!love);hearts.forEach(e=>e.visible=love);
      sparkleGroup.visible=happy&&!quiet;sparkleGroup.rotation.y=now*.25;
      bodyMaterial.color.set(({working:'#d3e0e5',thinking:'#d9cee8',searching:'#ced6e9',approval:'#efd5a5',question:'#c4e1df',error:'#e6c4c1',finished:'#dde6cd',ratelimit:'#e4c8ae',sleeping:'#dbdcd4',dizzy:'#e6ccd8'})[state]||'#eeeae0');
      if(settings.outfit==='pumpkin')bodyMaterial.color.set('#eab17d');
      world.rotation.y+=(targetRY-world.rotation.y)*.08;world.rotation.x+=(targetRX-world.rotation.x)*.08;
      mochi.visible=settings.character!==false;
      renderer.render(scene,camera);rendered++;
      // Keep the keyboard/touch target on the actual projected character.
      // The hit target follows the room, not the breathing/jump animation. Quantize to
      // CSS pixels so keyboard focus and pointer hit testing stay steady between frames.
      anchor.set(.05,2.43,-.12).applyMatrix4(world.matrixWorld).project(camera);
      return {anchor:{x:anchor.x*.5+.5,y:-anchor.y*.5+.5}};
    }

    host.addEventListener("pointermove",event=>{
      if(current.reduceMotion)return;
      const r=host.getBoundingClientRect();targetRY=((event.clientX-r.left)/r.width-.5)*.09;
      targetRX=-((event.clientY-r.top)/r.height-.5)*.035;
    });
    host.addEventListener("pointerleave",()=>{targetRX=targetRY=0;});
    return {draw,resize,dispose(){wardrobe.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});renderer.dispose();renderer.domElement.remove();}};
});
