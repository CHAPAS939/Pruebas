/* Fabric keeps Coucou's original palette under both room and window lighting. */
window.createMochiFabricMaterial=(T,color)=>{
  const material=new T.MeshBasicMaterial({color,toneMapped:false});
  // A small camera-facing shade keeps rounded geometry readable without white
  // specular highlights or scene exposure bleaching the accessory's hue.
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vFabricNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFabricNormal=normalize(normalMatrix*normal);');
    shader.fragmentShader='varying vec3 vFabricNormal;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= 0.82 + 0.18 * max(0.0,dot(normalize(vFabricNormal),normalize(vec3(-0.25,0.4,1.0))));');
  };
  material.customProgramCacheKey=()=> 'coucou-fabric-palette-v1';
  return material;
};
// The same sRGB hue rotation used by native Canvas / SwiftUI accessories.
window.mochiAccessoryColor=(color,accent)=>{
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
 if(!/^#[0-9a-f]{6}$/i.test(accent))return rgb;
 const target=[1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)/255),[r,g,b]=target,hi=Math.max(...target),lo=Math.min(...target),d=hi-lo;
 if(d<.01)return rgb;
 const hue=((hi===r?(g-b)/d:hi===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360-345,c=Math.cos(hue*Math.PI/180),s=Math.sin(hue*Math.PI/180);
 const matrix=[[.213+.787*c-.213*s,.715-.715*c-.715*s,.072-.072*c+.928*s],[.213-.213*c+.143*s,.715+.285*c+.140*s,.072-.072*c-.283*s],[.213-.213*c-.787*s,.715-.715*c+.715*s,.072+.928*c+.072*s]];
 return matrix.map(row=>Math.max(0,Math.min(1,row.reduce((sum,v,i)=>sum+v*rgb[i],0))));
};
