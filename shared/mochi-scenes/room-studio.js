/* Furniture, movable pivots and object activities shared by both native apps. */
window.createRoomStudio=(T,world,base,tools)=>{
  const {box,sphere,cylinder,rod,mat,palette}=tools,owned=[],textures=[],roots={},variants={};
  const material=(color,roughness=.8)=>{const m=mat(color,roughness);owned.push(m);return m;};
  const ink=material('#292d3c'),white=material('#eeeade'),blue=material('#537fa4'),clay=material('#be8768'),leaf=material('#829771');
  const glow=new T.MeshBasicMaterial({color:'#b3a3e7'});owned.push(glow);
  const defaults={desk:[0,.8],rest:[2.7,.78],plant:[-2.8,.76],rug:[0,.65],bed:[-2.45,-1.1],console:[2.3,-1.25],bookshelf:[0,-1.5]};
  function pivot(id,parts=[]){const g=new T.Group();g.name=id;g.position.set(defaults[id][0],0,defaults[id][1]);world.add(g);world.updateMatrixWorld(true);for(const part of parts)if(part)g.attach(part);roots[id]=g;return g;}
  pivot('desk',[base.desk,base.laptop,base.details]);pivot('rest',[base.cushion]);pivot('plant',[base.plant]);pivot('rug',[base.rug,base.rugLine]);
  function variant(id,parent,build,absolute=true){const g=new T.Group();g.name=id;world.add(g);build(g);if(parent){if(absolute){world.updateMatrixWorld(true);parent.attach(g)}else parent.add(g)}variants[id]=g;return g;}
  function pattern(kind,color){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#e4dcc7';x.fillRect(0,0,128,128);x.fillStyle=color;x.strokeStyle=color;
    if(kind==='checker'||kind==='tiles'){for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2===0)x.fillRect(i*32+1,j*32+1,30,30)}
    else if(kind==='geometric'){x.lineWidth=4;for(let i=0;i<4;i++){x.beginPath();x.moveTo(64,8+i*12);x.lineTo(120-i*12,64);x.lineTo(64,120-i*12);x.lineTo(8+i*12,64);x.closePath();x.stroke()}}
    else{x.globalAlpha=.2;for(let i=0;i<128;i+=5){x.fillRect(i,0,1,128);x.fillRect(0,i,128,1)}}
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);return texture;
  }
  const tileMat=material('#ffffff');tileMat.map=pattern('tiles','#7599af');tileMat.map.wrapS=tileMat.map.wrapT=T.RepeatWrapping;tileMat.map.repeat.set(3,2);
  variant('mediterranean',null,g=>{const floor=new T.Mesh(new T.PlaneGeometry(7.35,5.25),tileMat);floor.rotation.x=-Math.PI/2;floor.position.y=.092;floor.receiveShadow=true;g.add(floor);
    for(const x of [.48,3.13])box(.21,2.67,.18,white,x,2.72,-2.27,.045,g);
    cylinder(.22,.17,.4,blue,1.1,1.52,-2.13,g);cylinder(.13,.19,.52,clay,2.55,1.58,-2.13,g);
  });
  variant('mediterraneanRest',roots.rest,g=>{box(1.24,.16,.78,white,2.7,.5,.78,.07,g);for(const x of[2.22,3.18])box(.08,.42,.08,clay,x,.23,.78,.02,g);box(.74,.2,.62,blue,2.7,.68,.78,.1,g)});
  variant('gamerDesk',roots.desk,g=>{
    for(const x of[-.68,.68]){box(1.18,.73,.065,ink,x,2.20,.50,.055,g);box(1.08,.62,.012,material(x<0?'#42465f':'#394c63'),x,2.20,.544,.03,g);for(let i=0;i<4;i++)box(.3+(i%2)*.2,.018,.012,glow,x-.22,2.35-i*.1,.558,.005,g);box(.045,.25,.06,ink,x,1.83,.5,.01,g);box(.48,.035,.28,ink,x,1.72,.5,.025,g)}
    box(1.15,.04,.42,ink,.15,1.73,1.06,.025,g);for(let i=0;i<12;i++)box(.045,.01,.28,glow,-.36+i*.085,1.76,1.06,.005,g);
    box(.61,1.12,.71,ink,-2,.66,-.25,.06,g);for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(.16,.018,8,32),glow);ring.position.set(-2,.35+i*.31,.12);g.add(ring)}
  });
  variant('gamerRest',roots.rest,g=>{box(.87,.19,.78,ink,2.7,.68,.78,.09,g);box(.88,1.05,.16,ink,2.7,1.20,.40,.1,g);for(const x of[2.29,3.11])box(.065,.90,.19,glow,x,1.2,.50,.03,g);cylinder(.075,.075,.57,ink,2.7,.3,.78,g);for(let i=0;i<4;i++){const a=i*Math.PI/2;rod([[2.7,.07,.78],[2.7+Math.cos(a)*.44,.07,.78+Math.sin(a)*.44]],.035,ink,g)}});
  variant('minimalist',null,g=>{box(.14,2.7,.14,ink,2.95,1.45,-1.4,.025,g);cylinder(.24,.45,.44,white,2.95,2.95,-1.4,g)});
  variant('minimalistRest',roots.rest,g=>{box(1.1,.25,.88,white,2.7,.28,.78,.12,g);box(.67,.18,.58,material('#c7c5ba'),2.7,.49,.78,.09,g)});
  variant('prints',null,g=>{for(let i=0;i<2;i++){box(.92,1.1,.07,white,-2.45+i*1.15,3.2,-2.38,.025,g);box(.79,.97,.012,material(i?'#c99e83':'#adb5a5'),-2.45+i*1.15,3.2,-2.33,.015,g);sphere(.28,i?white:blue,-2.45+i*1.15,3.28,-2.30,[1,1,.025],g);box(.5,.1,.012,white,-2.45+i*1.15,2.91,-2.29,.01,g)}});
  variant('neon',null,g=>{rod([[-2.55,3.2,-2.35],[-2.2,3.65,-2.35],[-1.9,3.25,-2.35],[-1.5,3.75,-2.35],[-1.1,3.2,-2.35]],.035,glow,g);box(2.12,.055,.4,ink,-1.85,2.90,-2.30,.02,g)});
  variant('cactus',roots.plant,g=>{cylinder(.33,.24,.61,clay,0,.38,0,g);cylinder(.24,.24,.03,material('#665740'),0,.70,0,g);cylinder(.16,.16,.82,leaf,0,1.1,0,g);sphere(.16,leaf,0,1.51,0,[1,1,1],g);for(const side of[-1,1]){rod([[0,1,0],[side*.32,1,0],[side*.32,1.35,0]],.11,leaf,g);sphere(.11,leaf,side*.32,1.35,0,[1,1,1],g)}sphere(.08,material('#d4a2a8'),.03,1.65,.02,[1,.7,1],g)},false);
  variant('olive',roots.plant,g=>{cylinder(.38,.25,.68,white,0,.38,0,g);cylinder(.30,.30,.025,material('#78624c'),0,.73,0,g);rod([[0,.73,0],[.06,1.3,0],[-.04,1.85,0]],.04,clay,g);for(let i=0;i<12;i++){const a=i*2.4,x=Math.cos(a)*.38,z=Math.sin(a)*.30,y=1.2+(i%4)*.2;rod([[.03,1.15,0],[x,y,z]],.015,clay,g);sphere(.26,leaf,x,y,z,[1,.55,.65],g);if(i%3===0)sphere(.032,ink,x,y-.1,z+.1,[1,1.3,1],g)}},false);
  pivot('bed');variant('bedMesh',roots.bed,g=>{box(1.45,.23,1.85,clay,0,.22,0,.08,g);box(1.42,.27,1.80,white,0,.45,0,.14,g);box(1.43,.14,1.04,material('#9eafb4'),0,.63,.35,.09,g);box(.85,.15,.48,white,0,.69,-.58,.1,g);box(1.5,1.0,.13,clay,0,.68,-.9,.08,g)},false);
  pivot('console');variant('consoleMesh',roots.console,g=>{box(1.65,.6,.7,clay,0,.38,0,.06,g);box(1.45,.9,.07,ink,0,1.22,-.16,.04,g);box(1.33,.78,.012,material('#738eab'),0,1.22,-.112,.02,g);for(let i=0;i<5;i++)box(.12,.08,.01,glow,-.45+i*.2,1.15+Math.sin(i)*.2,-.1,.02,g);box(.33,.15,.25,ink,.5,.78,.13,.04,g);box(.78,.22,.7,material('#9fada5'),0,.22,.85,.12,g)},false);
  pivot('bookshelf');variant('bookshelfMesh',roots.bookshelf,g=>{for(const x of[-.58,.58])box(.08,1.9,.5,clay,x,1.02,0,.025,g);for(const y of[.13,.74,1.35,1.96])box(1.24,.065,.52,clay,0,y,0,.02,g);for(let row=0;row<3;row++)for(let i=0;i<6;i++){const b=box(.12,.36+(i%2)*.1,.29,material(['#8d9c82','#c99c87','#aaa0bf','#a7b4bd'][i%4]),-.43+i*.16,.36+row*.61+(i%2)*.05,.02,.012,g);b.rotation.z=i===4?.1:0}box(.65,.3,.62,material('#b7b795'),.6,.2,.65,.09,g)},false);
  const finishes={wood:material('#b98f68'),white:material('#e9e7dd'),dark:material('#343642')},rugs={woven:pattern('woven','#9c957e'),geometric:pattern('geometric','#7a9b9a'),checker:pattern('checker','#9290ac')};
  for(const [id,root]of Object.entries(roots))root.traverse(o=>{o.userData.furniture=id});
  let last='',lastLayout='',backdrop='';
  function point(id,coords){const p=new T.Vector3(...coords);roots[id].localToWorld(p);world.worldToLocal(p);return[p.x,p.y,p.z]}
  function update(s){
    const style=s.roomStyle||'cozy',plantKind=s.plantKind==='auto'?({gamer:'cactus',minimalist:'cactus',mediterranean:'olive'}[style]||'leafy'):s.plantKind,rugKind=s.rugKind==='auto'?(style==='gamer'?'checker':style==='mediterranean'?'geometric':'woven'):s.rugKind,art=s.wallDecor==='auto'?({gamer:'neon',minimalist:'prints',mediterranean:'prints'}[style]||'botanical'):s.wallDecor,finish=s.deskFinish==='auto'?(style==='gamer'?'dark':style==='minimalist'?'white':'wood'):s.deskFinish;
    const extras=Array.isArray(s.objects)?s.objects:[],key=JSON.stringify([style,plantKind,rugKind,art,finish,s.theme,s.plant,s.rug,s.night,extras]);
    if(last!==key){last=key;Object.values(variants).forEach(g=>g.visible=false);for(const name of[style,style+'Rest',style+'Desk',art])if(variants[name])variants[name].visible=true;
      base.wall.visible=art==='botanical';base.cushion.visible=style==='cozy';base.laptop.visible=style!=='gamer';base.plant.visible=s.plant!==false&&plantKind==='leafy';roots.plant.visible=s.plant!==false;
      for(const kind of['cactus','olive'])variants[kind].visible=s.plant!==false&&plantKind===kind;
      roots.rug.visible=s.rug!==false;base.rug.material.map=rugs[rugKind]||rugs.woven;base.rug.material.needsUpdate=true;base.desk.traverse(o=>{if(o.isMesh)o.material=finishes[finish]||finishes.wood});
      for(const id of['bed','console','bookshelf']){roots[id].visible=extras.includes(id);variants[id+'Mesh'].visible=true}
      glow.color.set(({sand:'#e5bd79',sage:'#a8c5a0',rose:'#da9ec5',midnight:'#8bace3'})[s.theme]||'#a8c5a0');
      if(style==='gamer'){palette.wall.color.set('#353948');palette.wallSide.color.set('#282d3c');palette.floor.color.set('#6f6670');palette.edge.color.set('#363847');palette.mint.color.set('#b4acc6')}
      if(style==='minimalist'){palette.wall.color.set('#e5e4db');palette.wallSide.color.set('#d4d6ce');palette.floor.color.set('#c9b59b');palette.edge.color.set('#aa9780');palette.mint.color.set('#bbbeb0')}
      if(style==='mediterranean'){palette.wall.color.set('#eee6d3');palette.wallSide.color.set('#e1d7c0');palette.edge.color.set('#b29576');palette.mint.color.set('#7596a4')}
      if(style==='cozy')palette.edge.color.set('#a67d56');
      const bg=style==='gamer'?'#343747':style==='mediterranean'?'#e7dfc9':style==='minimalist'?'#e5e5dc':'#e9e1d5';backdrop=`radial-gradient(ellipse at 48% 20%,${s.night?'#8c93a5':style==='gamer'?'#6d6c85':'#fffaf0'},${bg})`;base.renderer.shadowMap.needsUpdate=true;
    }
    const layout=window.MochiStudioData.layout(s.layout),plantPosition=({left:[-2.8,.76],right:[3,-1.2],back:[-2.7,-1.65]})[s.plantPosition]||defaults.plant;
    const layoutKey=JSON.stringify([layout,plantPosition]);if(lastLayout!==layoutKey){lastLayout=layoutKey;for(const[id,g]of Object.entries(roots)){const p=layout[id],fallback=id==='plant'?plantPosition:defaults[id];g.position.set(p?.x??fallback[0],0,p?.z??fallback[1]);g.rotation.y=p?.rotation||0}world.updateMatrixWorld(true);base.renderer.shadowMap.needsUpdate=true}
    const restY=style==='gamer'?1.28:style==='mediterranean'?1.23:1.03;
    return {roots,background:backdrop,plantPoint:[roots.plant.position.x,roots.plant.position.z],seats:{desk:point('desk',style==='gamer'?[.05,2.29,.12]:[.05,2.43,-.92]),rest:point('rest',[0,restY,0]),plant:point('plant',[roots.plant.position.x>0?-.85:.85,1.4,.15]),bed:point('bed',[0,1.21,.1]),console:point('console',[0,.82,.85]),bookshelf:point('bookshelf',[.6,.84,.65])},targets:{lamp:point('desk',[-.9,2.45,-.4]),desk:point('desk',[-.65,1.72,.1]),rest:point('rest',[0,restY-.4,0]),plant:point('plant',[0,1.15,0]),bed:point('bed',[0,.7,0]),console:point('console',[0,1.2,0]),bookshelf:point('bookshelf',[0,1.25,0])},rotation:id=>roots[id]?.rotation.y||0};
  }
  return {update,roots,defaults,dispose(){textures.forEach(t=>t.dispose());owned.forEach(m=>m.dispose())}};
};
