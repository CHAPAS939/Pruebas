/* Local furniture variants shared by WKWebView and WebView2. No application APIs. */
window.createRoomStudio=(T,world,base,tools)=>{
  const {box,sphere,cylinder,rod,mat,palette}=tools;
  const ownedMaterials=[],textures=[];
  const material=(color,roughness=.8)=>{const m=mat(color,roughness);ownedMaterials.push(m);return m;};
  const ink=material('#242735'),white=material('#f0ede4'),blue=material('#487eaa'),clay=material('#c58c68'),leaf=material('#788c65');
  const glow=new T.MeshBasicMaterial({color:'#af9de7'});ownedMaterials.push(glow);
  const groups={};
  function group(name,build){const g=new T.Group();g.name=name;world.add(g);build(g);groups[name]=g;return g;}
  function pattern(kind,color){
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
    ctx.fillStyle=kind==='tiles'?'#ede9d8':'#e4d9c0';ctx.fillRect(0,0,128,128);
    ctx.fillStyle=color;ctx.strokeStyle=color;
    if(kind==='checker'||kind==='tiles'){
      for(let x=0;x<4;x++)for(let y=0;y<4;y++)if((x+y)%2===0)ctx.fillRect(x*32+1,y*32+1,30,30);
    }else if(kind==='geometric'){
      ctx.lineWidth=4;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(64,8+i*12);ctx.lineTo(120-i*12,64);ctx.lineTo(64,120-i*12);ctx.lineTo(8+i*12,64);ctx.closePath();ctx.stroke();}
    }else{ctx.globalAlpha=.18;for(let i=0;i<128;i+=5){ctx.fillRect(i,0,1,128);ctx.fillRect(0,i,128,1);}}
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);return texture;
  }
  const tileMat=material('#ffffff');tileMat.map=pattern('tiles','#7196ae');tileMat.map.wrapS=tileMat.map.wrapT=T.RepeatWrapping;tileMat.map.repeat.set(3,2);
  group('mediterranean',g=>{
    const floor=new T.Mesh(new T.PlaneGeometry(7.35,5.25),tileMat);floor.rotation.x=-Math.PI/2;floor.position.y=.092;floor.receiveShadow=true;g.add(floor);
    for(const x of [.48,3.13]){box(.21,2.67,.18,white,x,2.72,-2.27,.045,g);for(let i=0;i<3;i++)box(.018,2.55,.20,material('#d8d4c4'),x-.065+i*.065,2.72,-2.25,.005,g);}
    cylinder(.22,.17,.40,blue,1.1,1.52,-2.13,g);cylinder(.13,.19,.52,clay,2.55,1.58,-2.13,g);
    box(1.24,.16,.78,white,2.7,.50,.78,.07,g);for(const x of [2.22,3.18])box(.08,.42,.08,clay,x,.23,.78,.02,g);
    box(.74,.20,.62,blue,2.7,.68,.78,.10,g);
  });
  group('gamer',g=>{
    for(const x of [-.68,.68]){
      box(1.18,.73,.065,ink,x,2.20,.50,.055,g);box(1.08,.62,.012,material(x<0?'#42465f':'#394c63'),x,2.20,.544,.03,g);
      for(let i=0;i<4;i++)box(.30+(i%2)*.20,.018,.012,glow,x-.22,2.35-i*.10,.558,.005,g);
      box(.045,.25,.06,ink,x,1.83,.50,.01,g);box(.48,.035,.28,ink,x,1.72,.50,.025,g);
    }
    box(1.15,.04,.42,ink,.15,1.73,1.06,.025,g);for(let i=0;i<12;i++)box(.045,.01,.28,glow,-.36+i*.085,1.76,1.06,.005,g);
    box(.61,1.12,.71,ink,-2.0,.66,-.25,.06,g);
    for(let i=0;i<3;i++){
      const ring=new T.Mesh(new T.TorusGeometry(.16,.018,8,32),glow);ring.position.set(-2,.35+i*.31,.12);g.add(ring);
    }
    rod([[-3.48,.55,-2.38],[-3.48,3.87,-2.38],[-.45,3.87,-2.38]],.025,glow,g);
    box(.87,.19,.78,ink,2.7,.68,.78,.09,g);box(.88,1.05,.16,ink,2.7,1.20,.40,.10,g);
    for(const x of [2.29,3.11])box(.065,.90,.19,glow,x,1.2,.50,.03,g);
    cylinder(.075,.075,.57,ink,2.7,.30,.78,g);for(let i=0;i<4;i++){const a=i*Math.PI/2;rod([[2.7,.07,.78],[2.7+Math.cos(a)*.44,.07,.78+Math.sin(a)*.44]],.035,ink,g);}
    const light=new T.PointLight('#a79be3',1.0,5,2);light.position.set(-1.5,2.8,-1.8);g.add(light);
  });
  group('minimalist',g=>{
    box(.14,2.7,.14,ink,2.95,1.45,-1.4,.025,g);cylinder(.24,.45,.44,white,2.95,2.95,-1.4,g);
    box(1.1,.25,.88,white,2.7,.28,.78,.12,g);box(.67,.18,.58,material('#c7c5ba'),2.7,.49,.78,.09,g);
  });
  group('prints',g=>{
    for(let i=0;i<2;i++){
      box(.92,1.1,.07,white,-2.45+i*1.15,3.2,-2.38,.025,g);
      box(.79,.97,.012,material(i?'#c99e83':'#adb5a5'),-2.45+i*1.15,3.2,-2.33,.015,g);
      sphere(.28,i?white:blue,-2.45+i*1.15,3.28,-2.30,[1,1,.025],g);
      box(.50,.10,.012,white,-2.45+i*1.15,2.91,-2.29,.01,g);
    }
  });
  group('neon',g=>{
    const points=[[-2.55,3.2,-2.35],[-2.2,3.65,-2.35],[-1.9,3.25,-2.35],[-1.5,3.75,-2.35],[-1.1,3.2,-2.35]];
    rod(points,.035,glow,g);box(2.12,.055,.40,ink,-1.85,2.90,-2.30,.02,g);
  });
  group('cactus',g=>{
    cylinder(.33,.24,.61,clay,0,.38,0,g);cylinder(.24,.24,.03,material('#665740'),0,.70,0,g);
    cylinder(.16,.16,.82,leaf,0,1.10,0,g);sphere(.16,leaf,0,1.51,0,[1,1,1],g);
    for(const side of [-1,1]){rod([[0,1.0,0],[side*.32,1.0,0],[side*.32,1.35,0]],.11,leaf,g);sphere(.11,leaf,side*.32,1.35,0,[1,1,1],g);}
    sphere(.08,material('#d4a2a8'),.03,1.65,.02,[1,.7,1],g);
  });
  group('olive',g=>{
    cylinder(.38,.25,.68,white,0,.38,0,g);cylinder(.30,.30,.025,material('#78624c'),0,.73,0,g);
    rod([[0,.73,0],[.06,1.3,0],[-.04,1.85,0]],.04,clay,g);
    for(let i=0;i<12;i++){
      const a=i*2.4,x=Math.cos(a)*.38,z=Math.sin(a)*.30,y=1.2+(i%4)*.2;
      rod([[.03,1.15,0],[x,y,z]],.015,clay,g);sphere(.26,leaf,x,y,z,[1,.55,.65],g);
      if(i%3===0)sphere(.032,ink,x,y-.1,z+.1,[1,1.3,1],g);
    }
  });
  const finishes={wood:material('#b98f68'),white:material('#e9e7dd'),dark:material('#343642')};
  const rugs={woven:pattern('woven','#9c957e'),geometric:pattern('geometric','#7a9b9a'),checker:pattern('checker','#9290ac')};
  let last='';
  function update(s){
    const style=s.roomStyle||'cozy';
    const plantKind=s.plantKind==='auto'?({gamer:'cactus',minimalist:'cactus',mediterranean:'olive'}[style]||'leafy'):s.plantKind;
    const rugKind=s.rugKind==='auto'?(style==='gamer'?'checker':style==='mediterranean'?'geometric':'woven'):s.rugKind;
    const art=s.wallDecor==='auto'?({gamer:'neon',minimalist:'prints',mediterranean:'prints'}[style]||'botanical'):s.wallDecor;
    const finish=s.deskFinish==='auto'?(style==='gamer'?'dark':style==='minimalist'?'white':'wood'):s.deskFinish;
    const point=({left:[-2.8,.76],right:[3,-1.2],back:[-2.7,-1.65]})[s.plantPosition]||[-2.8,.76];
    const key=JSON.stringify([style,plantKind,rugKind,art,finish,s.theme,s.plant,s.rug,s.night,point]);
    if(last!==key){
      last=key;Object.values(groups).forEach(g=>g.visible=false);
      if(groups[style])groups[style].visible=true;
      if(groups[art])groups[art].visible=true;
      base.wall.visible=art==='botanical';base.cushion.visible=style==='cozy';base.laptop.visible=style!=='gamer';
      base.plant.visible=s.plant!==false&&plantKind==='leafy';base.plant.position.set(point[0]+2.8,0,point[1]-.76);
      for(const kind of ['cactus','olive']){groups[kind].visible=s.plant!==false&&plantKind===kind;groups[kind].position.set(point[0],0,point[1]);}
      base.rug.visible=base.rugLine.visible=s.rug!==false;base.rug.material.map=rugs[rugKind]||rugs.woven;base.rug.material.needsUpdate=true;
      base.desk.traverse(o=>{if(o.isMesh)o.material=finishes[finish]||finishes.wood;});
      const accent=({sand:'#e5bd79',sage:'#a8c5a0',rose:'#da9ec5',midnight:'#8bace3'})[s.theme]||'#a8c5a0';glow.color.set(accent);
      if(style==='gamer'){palette.wall.color.set('#353948');palette.wallSide.color.set('#282d3c');palette.floor.color.set('#6f6670');palette.edge.color.set('#363847');palette.mint.color.set('#b4acc6');}
      if(style==='minimalist'){palette.wall.color.set('#e5e4db');palette.wallSide.color.set('#d4d6ce');palette.floor.color.set('#c9b59b');palette.edge.color.set('#aa9780');palette.mint.color.set('#bbbeb0');}
      if(style==='mediterranean'){palette.wall.color.set('#eee6d3');palette.wallSide.color.set('#e1d7c0');palette.edge.color.set('#b29576');palette.mint.color.set('#7596a4');}
      if(style==='cozy'){palette.edge.color.set('#a67d56');}
      const bg=style==='gamer'?'#343747':style==='mediterranean'?'#e7dfc9':style==='minimalist'?'#e5e5dc':'#e9e1d5';
      base.host.style.background=`radial-gradient(ellipse at 48% 20%,${s.night?'#8c93a5':style==='gamer'?'#6d6c85':'#fffaf0'},${bg})`;
      base.renderer.shadowMap.needsUpdate=true;
    }
    const restY=style==='gamer'?1.28:style==='mediterranean'?1.23:1.03;
    return {plantPoint:point,seats:{desk:style==='gamer'?[.05,2.29,.92]:[.05,2.43,-.12],rest:[2.7,restY,.78],plant:[point[0]+(point[0]>0?-.85:.85),1.40,point[1]+.15]}};
  }
  return {update,dispose(){textures.forEach(t=>t.dispose());ownedMaterials.forEach(m=>m.dispose());}};
};
