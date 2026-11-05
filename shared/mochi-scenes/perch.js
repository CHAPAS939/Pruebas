/* Shared local character; no application APIs or simulated sessions. */
window.MochiScene.register("perch",(host)=>{
  const T=window.THREE;
    const scene=new T.Scene(),camera=new T.OrthographicCamera(-.92,.92,.92,-.92,.1,20);camera.position.set(1.8,.7,8);camera.lookAt(0,0,0);
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(120,120,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.domElement.className='pet3d-canvas';renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
    const group=new T.Group();group.rotation.y=.21;scene.add(group);
    function shape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
    function box(w,h,d,r,material,x,y,z){const g=new T.ExtrudeGeometry(shape(w,h,r),{depth:d-.04,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:4,curveSegments:16});g.translate(0,0,-d/2+.02);const m=new T.Mesh(g,material);m.position.set(x,y,z);group.add(m);return m;}
    const bodyMaterial=new T.MeshPhysicalMaterial({color:'#eeeae0',roughness:.35,clearcoat:.2,clearcoatRoughness:.7});
    const bodyGeo=new T.ExtrudeGeometry(shape(.94,.72,.28),{depth:.32,bevelEnabled:true,bevelSize:.13,bevelThickness:.13,bevelSegments:8,curveSegments:24});bodyGeo.translate(0,0,-.16);group.add(new T.Mesh(bodyGeo,bodyMaterial));
    const eyeMaterial=new T.MeshStandardMaterial({color:'#27251e',roughness:.45});const eyes=[-1,1].map(s=>box(.095,.17,.06,.047,eyeMaterial,s*.21,.025,.318));
    const cheekMaterial=new T.MeshBasicMaterial({color:'#dca6a0',transparent:true,opacity:.6});for(const side of [-1,1]){const cheek=new T.Mesh(new T.SphereGeometry(.07,20,12),cheekMaterial);cheek.scale.set(1.15,.42,.2);cheek.position.set(side*.38,-.13,.315);group.add(cheek);}
    function curve(points,r){const c=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,8,false),eyeMaterial);group.add(c);return c;}
    const happyEyes=[-1,1].map(s=>curve([[s*.21-.06,0,.36],[s*.21,.045,.362],[s*.21+.06,0,.36]],.021));
    const sleepingEyes=[-1,1].map(s=>curve([[s*.21-.06,.02,.36],[s*.21,-.005,.362],[s*.21+.06,.02,.36]],.016));
    const h=new T.Shape();h.moveTo(0,-.06);h.bezierCurveTo(-.15,.04,-.07,.14,0,.065);h.bezierCurveTo(.07,.14,.15,.04,0,-.06);
    const hearts=[-1,1].map(s=>{const m=new T.Mesh(new T.ShapeGeometry(h,16),new T.MeshBasicMaterial({color:'#cc7c87',side:T.DoubleSide}));m.position.set(s*.21,.01,.36);group.add(m);return m;});
    const sparkles=new T.Group();scene.add(sparkles);for(let i=0;i<4;i++){const s=new T.Mesh(new T.OctahedronGeometry(.035,0),new T.MeshBasicMaterial({color:'#c7a356'}));s.position.set(Math.sin(i*1.8)*.64,.56+(i%2)*.1,0);sparkles.add(s);}
    scene.add(new T.HemisphereLight('#fff9e6','#9ca88e',3));const key=new T.DirectionalLight('#fff5d9',4);key.position.set(-3,5,6);scene.add(key);const rim=new T.DirectionalLight('#dce7cc',2);rim.position.set(4,1,-2);scene.add(rim);

    const feet=new T.Group();group.add(feet);
    for(const side of [-1,1]){
      const curve=new T.CatmullRomCurve3([new T.Vector3(side*.18,-.43,.15),new T.Vector3(side*.19,-.55,.17),new T.Vector3(side*.2,-.62,.23)]);
      const foot=new T.Mesh(new T.TubeGeometry(curve,12,.036,10,false),bodyMaterial);feet.add(foot);
    }
    let gaze=0,frames=0;
    function draw(time=0,settings){gaze=settings.lookX*.15;const quiet=settings.reduceMotion,t=quiet?0:time/1000,state=settings.state,love=settings.emote==='love',happy=state==='finished'||settings.emote==='happy'||settings.emote==='proud',sleeping=state==='sleeping'||settings.emote==='yawn';
      group.position.y=quiet?0:Math.sin(t*(sleeping?1.4:1.9))*.01+(happy?Math.abs(Math.sin(t*4))*.12:0);group.rotation.y+=(.21+gaze-group.rotation.y)*.08;
      const blink=quiet?1:(Math.sin(t*.83)>.996?.12:1);eyes.forEach((e,i)=>{e.visible=!happy&&!sleeping&&!love;e.scale.y=blink*(settings.emote==='wink'&&i===0?.12:settings.emote==='annoyed'?.18:settings.emote==='surprised'||state==='approval'?1.3:state==='error'?.25:1)});happyEyes.forEach(e=>e.visible=happy&&!love);sleepingEyes.forEach(e=>e.visible=sleeping&&!love);hearts.forEach(e=>e.visible=love);sparkles.visible=happy&&!quiet;sparkles.rotation.y=t*.2;
      bodyMaterial.color.set(({working:'#d3e0e5',thinking:'#d9cee8',searching:'#ced6e9',approval:'#efd5a5',question:'#c4e1df',error:'#e6c4c1',finished:'#dde6cd',ratelimit:'#e4c8ae',sleeping:'#dbdcd4',dizzy:'#e6ccd8'})[state]||'#eeeae0');group.visible=settings.character!==false;feet.visible=settings.perched;feet.children.forEach((f,i)=>{f.rotation.z=quiet||sleeping?0:Math.sin(t*2.4+i)*.12;});renderer.render(scene,camera);frames++;
    }

    function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const a=w/h;camera.left=-.92*a;camera.right=.92*a;camera.updateProjectionMatrix();}
    return {draw,resize,dispose(){scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();renderer.domElement.remove();}};
});
