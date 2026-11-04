/* A sculpted Mochi, aligned with the original 120pt interaction/geometry model. */
(() => {
  const T=window.THREE,host=document.getElementById('mochi');if(!T||!host)return;
  try{
    const scene=new T.Scene(),camera=new T.OrthographicCamera(-.92,.92,.92,-.92,.1,20);camera.position.set(1.8,.7,8);camera.lookAt(0,0,0);
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(120,120,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.domElement.className='pet3d-canvas';renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);host.classList.add('pet3d-ready');
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
    let gaze=0,frames=0;
    function draw(time=0){const quiet=document.documentElement.dataset.reduced==='true',t=quiet?0:time/1000,state=window.demo?.state||'idle',love=typeof bot!=='undefined'&&bot.eyeOv==='heart',happy=state==='finished',sleeping=state==='sleeping';
      group.position.y=quiet?0:Math.sin(t*(sleeping?1.4:1.9))*.01+(happy?Math.abs(Math.sin(t*4))*.12:0);group.rotation.y+=(.21+gaze-group.rotation.y)*.08;
      const blink=quiet?1:(Math.sin(t*.83)>.996?.12:1);eyes.forEach(e=>{e.visible=!happy&&!sleeping&&!love;e.scale.y=blink});happyEyes.forEach(e=>e.visible=happy&&!love);sleepingEyes.forEach(e=>e.visible=sleeping&&!love);hearts.forEach(e=>e.visible=love);sparkles.visible=happy&&!quiet;sparkles.rotation.y=t*.2;
      bodyMaterial.color.set(state==='working'?'#d9e3df':happy?'#e4e8d6':sleeping?'#deded4':'#eeeae0');renderer.render(scene,camera);frames++;
    }
    document.getElementById('screen').addEventListener('pointermove',e=>{if(document.documentElement.dataset.reduced==='true'){gaze=0;return}const r=host.getBoundingClientRect();gaze=Math.max(-.15,Math.min(.15,(e.clientX-r.x-r.width/2)/1000));});
    const oldDraw=drawOnce;drawOnce=function(){oldDraw();draw(performance.now())};const oldTick=tick;tick=function(t){oldTick(t);draw(t)};
    draw();window.perch3d={draw,renderer,get frames(){return frames}};window.addEventListener('pagehide',()=>renderer.dispose(),{once:true});
  }catch(error){console.warn('Using the original Mochi renderer:',error.message);host.classList.remove('pet3d-ready');host.querySelector('.pet3d-canvas')?.remove();}
})();
