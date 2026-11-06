// Canonical Coucou drawings, reused by the local WebKit/WebView2 studio.
import { drawWardrobeIcon, drawOutfitBehind, drawOutfitFront, makeHead } from "../windows/src/mochi/outfits";
import { drawBodySkin, accessoryHue } from "../windows/src/mochi/appearance";
function preview(c: CanvasRenderingContext2D,w:number,h:number,look:any){
  const R=Math.min(w/2.8,h/2.8),rx=R*1.14,ry=R*.88,body=new Path2D();
  for(let i=0;i<=72;i++){const a=i*Math.PI*2/72,x=Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**(2/2.7)*rx,y=Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**(2/2.7)*ry;i?body.lineTo(x,y):body.moveTo(x,y)}body.closePath();
  c.save();c.translate(w/2,h/2);const head=makeHead(R),state={presence:1,morph:0};let layers=look.outfit&&look.outfit!=='none'?[look.outfit]:[];
  if(['sunglasses','roundGlasses'].includes(look.glasses)){layers=layers.filter(v=>!['sunglasses','roundGlasses'].includes(v));layers.push(look.glasses)}if(look.scarf&&!layers.includes('scarf'))layers.push('scarf');
  c.save();if(look.accent&&look.accent!=='original')c.filter=`hue-rotate(${accessoryHue(look.accent)}deg)`;layers.forEach(v=>drawOutfitBehind(c,v,head,state));c.restore();
  if(!drawBodySkin(c,body,rx,ry,look.skin||'classic')){const g=c.createLinearGradient(rx,-ry,-rx,ry);g.addColorStop(0,'#ededef');g.addColorStop(1,'#c4c5ca');c.fillStyle=g;c.fill(body)}
  c.fillStyle=['diamond','obsidian','galaxy','lava'].includes(look.skin)?'#fff1dc':'#29272b';for(const side of[-1,1]){c.beginPath();c.roundRect(side*rx*.37-R*.12,ry*.12-R*.13,R*.24,R*.27,R*.12);c.fill()}
  c.save();if(look.accent&&look.accent!=='original')c.filter=`hue-rotate(${accessoryHue(look.accent)}deg)`;layers.forEach(v=>drawOutfitFront(c,v,head,state));c.restore();c.restore();
}
(window as any).MochiStudioIcons={outfit:drawWardrobeIcon,preview};
