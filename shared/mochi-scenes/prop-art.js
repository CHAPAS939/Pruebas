/* Small room objects, drawn once at native display scale. */
window.drawMochiProp=(c,id)=>{
 c.clearRect(0,0,92,92);c.save();
 const shadow=c.createRadialGradient(46,78,1,46,78,34);shadow.addColorStop(0,'#3f34252b');shadow.addColorStop(1,'#3f342500');c.fillStyle=shadow;c.beginPath();c.ellipse(46,78,35,10,0,0,Math.PI*2);c.fill();
 const round=(x,y,w,h,r,fill)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
 if(id==='cup'){
  c.strokeStyle='#c9bd9f';c.lineWidth=7;c.beginPath();c.ellipse(66,53,12,13,0,0,Math.PI*2);c.stroke();
  const g=c.createLinearGradient(24,35,64,70);g.addColorStop(0,'#fff8e4');g.addColorStop(.6,'#e8ddbd');g.addColorStop(1,'#c8bba0');round(21,32,44,41,[4,4,17,17],g);
  c.fillStyle='#f7efda';c.beginPath();c.ellipse(43,32,22,9,0,0,Math.PI*2);c.fill();c.fillStyle='#84624b';c.beginPath();c.ellipse(43,32,17,6,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#fff5de9e';c.lineWidth=2;for(let i=0;i<2;i++){c.beginPath();c.moveTo(37+i*11,21);c.bezierCurveTo(28+i*11,16,45+i*11,10,37+i*11,4);c.stroke()}
 }else if(id==='cushion'){
  c.save();c.translate(46,56);c.rotate(-.12);const g=c.createLinearGradient(-28,-16,32,22);g.addColorStop(0,'#d4dfbd');g.addColorStop(.55,'#abbf96');g.addColorStop(1,'#7e9677');round(-34,-20,68,40,13,g);c.strokeStyle='#e5edcf';c.lineWidth=1.2;c.beginPath();c.roundRect(-29,-15,58,30,9);c.stroke();c.restore();
 }else if(id==='plant'){
  const pot=c.createLinearGradient(30,53,63,79);pot.addColorStop(0,'#dda687');pot.addColorStop(1,'#ac7358');c.fillStyle=pot;c.beginPath();c.moveTo(28,53);c.lineTo(64,53);c.lineTo(59,79);c.quadraticCurveTo(46,84,33,79);c.closePath();c.fill();
  c.fillStyle='#c68e6d';c.beginPath();c.ellipse(46,53,18,6,0,0,Math.PI*2);c.fill();c.fillStyle='#735d44';c.beginPath();c.ellipse(46,52,14,4,0,0,Math.PI*2);c.fill();
  for(let i=0;i<7;i++){const side=i%2?1:-1,x=46+side*(8+i),y=21+i*3;c.strokeStyle='#7f956c';c.lineWidth=2;c.beginPath();c.moveTo(46,53);c.quadraticCurveTo(46,34,x,y);c.stroke();c.save();c.translate(x,y);c.rotate(side*.5);const g=c.createLinearGradient(-4,-12,6,12);g.addColorStop(0,'#b6c69d');g.addColorStop(1,'#728862');c.fillStyle=g;c.beginPath();c.ellipse(0,0,6,13,0,0,Math.PI*2);c.fill();c.restore()}
 }c.restore();
};
if(document.getElementById('prop')){const canvas=document.getElementById('prop'),id=new URLSearchParams(location.search).get('id');const draw=()=>{const ratio=Math.min(devicePixelRatio||1,2);canvas.width=canvas.height=Math.round(92*ratio);const c=canvas.getContext('2d');c.scale(ratio,ratio);window.drawMochiProp(c,id)};draw();new ResizeObserver(draw).observe(canvas);}
