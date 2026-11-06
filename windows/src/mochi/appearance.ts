/** Body surfaces for the native Canvas fallback, bar and free desktop Mochi. */
export const SKINS = ["classic", "diamond", "opal", "obsidian", "gold", "galaxy", "jelly", "lava"] as const;
export function skinName(value: string | undefined): string { return SKINS.includes(value as typeof SKINS[number]) ? value! : "classic"; }
export function accessoryHue(value: string | undefined): number {
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) return 0;
  const [r,g,b] = [1,3,5].map(i => parseInt(value.slice(i,i+2),16)/255);
  const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;
  if (d<.01) return 0;
  return ((hi===r ? (g-b)/d : hi===g ? (b-r)/d+2 : (r-g)/d+4)*60+360)%360-345;
}
export function drawBodySkin(c: CanvasRenderingContext2D, body: Path2D, rx: number, ry: number, value: string): boolean {
  const skin=skinName(value);if(skin==="classic")return false;
  const colors: Record<string,[string,string]>={diamond:["#343342","#10131c"],opal:["#fff1f5","#b7c9e7"],obsidian:["#66617f","#151b31"],gold:["#fff1b0","#a67125"],galaxy:["#55447e","#171e43"],jelly:["#ffe0ed","#db81b0"],lava:["#493148","#172031"]};
  c.save();c.clip(body);const g=c.createLinearGradient(rx,-ry,-rx,ry);g.addColorStop(0,colors[skin][0]);g.addColorStop(1,colors[skin][1]);c.fillStyle=g;c.fill(body);
  if(skin==="diamond"){
    for(let row=-3;row<=3;row++)for(let col=-4;col<=4;col++){
      const x=col*rx*.22+(row%2)*rx*.07,y=row*ry*.25;
      if(Math.abs(Math.abs(x/rx)-.37)<.16&&Math.abs(y/ry-.12)<.24)continue;
      const w=rx*.047,h=ry*.067;
      for(const [a,b,d,color]of[[[x,y-h],[x+w,y],[x,y+h],"#c2e9ff"],[[x,y-h],[x,y+h],[x-w,y],"#f3fcff"],[[x,y-h],[x+w,y],[x-w,y],"#ffffff"]] as const){c.fillStyle=color;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();c.fill();}
      if((row+col)%4===0){c.strokeStyle="#ffffff";c.lineWidth=Math.max(.6,rx*.015);c.beginPath();c.moveTo(x-w*1.5,y);c.lineTo(x+w*1.5,y);c.moveTo(x,y-h*1.5);c.lineTo(x,y+h*1.5);c.stroke();}
    }
  } else if(skin==="obsidian"){
    const palette=["#3c3d59","#71718b","#222c48","#545571","#2d3755"];
    for(let row=-2;row<3;row++)for(let col=-2;col<3;col++){
      const x=col*rx*.55,y=row*ry*.65,w=rx*.6,h=ry*.7;
      c.fillStyle=palette[((row+2)*7+col+2)%palette.length];c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y+h*.2);c.lineTo(x+w*.25,y+h);c.closePath();c.fill();
      c.fillStyle=palette[((row+2)*3+col+3)%palette.length];c.beginPath();c.moveTo(x+w,y+h*.2);c.lineTo(x+w*1.1,y+h);c.lineTo(x+w*.25,y+h);c.closePath();c.fill();
    }
  } else if(skin==="galaxy") {
    for(let i=0;i<26;i++){c.fillStyle=i%3?"#fff3f5":"#8ed7fb";c.beginPath();c.arc(((i*37)%101/50-1)*rx,((i*53)%103/51-1)*ry,rx*(i%7===0?.025:.012),0,Math.PI*2);c.fill();}
  } else if(skin==="lava") {
    for(let i=0;i<8;i++){c.strokeStyle=i%2?"#ffa760":"#ed6d56";c.lineWidth=rx*.035;c.beginPath();c.moveTo((i/4-1)*rx,-ry);c.lineTo((i/4-.9)*rx,-ry*.3);c.lineTo((i/4-1.15)*rx,ry*.3);c.lineTo((i/4-.85)*rx,ry);c.stroke();}
  } else if(skin==="opal") {
    for(let i=0;i<4;i++){c.fillStyle=["#a5e6df55","#edb5db55","#b7b6ef55","#ffdea555"][i];c.beginPath();c.ellipse((i-1.5)*rx*.5,-ry*.2,rx*.55,ry*1.4,-.65,0,Math.PI*2);c.fill();}
  } else if(skin==="jelly") {
    c.strokeStyle="#ffffff70";c.lineWidth=rx*.025;for(let i=0;i<5;i++){c.beginPath();c.arc(((i*37)%97/50-1)*rx,((i*19)%71/45-.7)*ry,rx*(.035+i*.008),0,Math.PI*2);c.stroke();}
  }
  const shine=c.createLinearGradient(-rx,-ry,rx,ry);shine.addColorStop(0,"#ffffff00");shine.addColorStop(.3,"#ffffff00");shine.addColorStop(.4,skin==="diamond"?"#ffffff0d":skin==="gold"?"#fffbc9bb":"#ffffff99");shine.addColorStop(.48,"#ffffff00");shine.addColorStop(1,"#ffffff00");c.fillStyle=shine;c.fill(body);c.restore();return true;
}
