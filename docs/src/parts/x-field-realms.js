import*as a from"three";import{makePath as m}from"../kit/core.js";const v=`
varying vec3 vLocal;
#include <clipping_planes_pars_vertex>
void main(){
 vLocal=position;
 vec4 mvPosition=modelViewMatrix*vec4(position,1.);
 gl_Position=projectionMatrix*mvPosition;
 #include <clipping_planes_vertex>
}`,u=`
precision highp float;
uniform vec3 uEye,uTop,uHorizon,uStone,uAccent,uSun;
uniform mat4 uLocalToWorld;
uniform mat4 projectionMatrix;
uniform float uTime;
varying vec3 vLocal;
#include <clipping_planes_pars_fragment>
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .66*noise(p)+.34*noise(p*2.03+7.);}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float torus(vec3 p,vec2 t){return length(vec2(length(p.xy)-t.x,p.z))-t.y;}
vec2 nearest(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec2 map(vec3 p){
 vec2 hit=vec2(p.y+4.,0.);
 if(FIELD_KIND==0){
  // A continuous ice nave: fluted pillars, pointed ribs and radiating rosettes.
  vec3 q=p;q.z=mod(p.z+26.,52.)-26.;
  float ribs=torus(vec3(p.x,(p.y-8.)*.82,q.z),vec2(43.,1.15));
  ribs=max(ribs,8.-p.y);
  hit=nearest(hit,vec2(ribs,1.));
  float flank=abs(p.x)-40.;vec3 c=vec3(flank,p.y-18.,q.z);
  float flutes=length(c.xz)-3.5-.35*cos(atan(c.z,c.x)*10.);
  hit=nearest(hit,vec2(max(flutes,abs(c.y)-23.),1.));
  float wall=abs(p.x)-57.-5.*fbm(p*.045);
  hit=nearest(hit,vec2(-wall,0.));
  vec3 s=p;s.x=abs(s.x)-48.;s.y-=14.;s.z=mod(s.z+13.,26.)-13.;
  hit=nearest(hit,vec2(length(s)-3.4,2.));
 }
 if(FIELD_KIND==1){
  // Hexagonal basalt organs rise from a dark mercury sea in two immense banks.
  vec2 cell=vec2(13.8564,24.);vec2 a=mod(p.xz,cell)-cell*.5;
  vec2 b=mod(p.xz-cell*.5,cell)-cell*.5;vec2 h=dot(a,a)<dot(b,b)?a:b;
  vec2 center=p.xz-h;float seed=hash(vec3(center,4.));
  float height=18.+72.*pow(seed,1.3)+22.*sin(center.y*.006);
  float hex=max(abs(h.x),dot(abs(h),vec2(.5,.8660254)))-6.2;
  float column=max(hex,max(p.y-height,-p.y-3.));
  column=max(column,22.-abs(center.x));
  hit=nearest(hit,vec2(column,1.));
  float crown=max(hex+.4,max(p.y-height-1.1,height-p.y-.25));
  crown=max(crown,22.-abs(center.x));hit=nearest(hit,vec2(crown,2.));
 }
 if(FIELD_KIND==2){
  // A colossal ammonite: nacre partitions spiral around a submerged central street.
  float theta=atan(p.y-34.,p.x);float rad=length(vec2(p.x,p.y-34.));
  float ripple=.5+.5*sin(theta*19.+log(max(rad,1.))*12.);
  vec3 q=p;q.z=mod(p.z+50.,100.)-50.;
  float shell=abs(rad-(64.+8.*sin(theta*3.+p.z*.004)))-2.2-ripple*.9;
  float ribs=abs(q.z)-1.4;
  float carved=shell;
  hit=nearest(hit,vec2(carved,1.));
  hit=nearest(hit,vec2(max(ribs,abs(rad-61.)-3.),2.));
  vec3 n=p;n.x=abs(n.x)-43.;n.z=mod(n.z+12.,24.)-12.;
  float height=18.+8.*hash(vec3(floor((p.z+12.)/24.),sign(p.x),9.));
  float house=box(n-vec3(0,height*.5-4.,0),vec3(5,height*.5,8.));hit=nearest(hit,vec2(house,1.));
  vec3 win=n;win.y=mod(n.y+1.,7.)-3.5;win.x=mod(n.x+3.,6.)-3.;
  float frontWindows=box(vec3(win.x,win.y,n.z-8.1),vec3(1.35,1.8,.18));
  frontWindows=max(frontWindows,abs(n.x)-4.7);
  frontWindows=max(frontWindows,max(1.-p.y,p.y-height+7.));
  hit=nearest(hit,vec2(frontWindows,2.));
  vec3 side=n;side.z=mod(n.z+3.,6.)-3.;side.y=win.y;
  float sideWindows=box(vec3(n.x+5.1,side.y,side.z),vec3(.18,1.8,1.4));
  sideWindows=max(sideWindows,abs(n.z)-7.7);
  sideWindows=max(sideWindows,max(1.-p.y,p.y-height+7.));
  hit=nearest(hit,vec2(sideWindows,2.));
  vec3 cornice=n;cornice.y=mod(n.y+1.,7.)-3.5;
  hit=nearest(hit,vec2(max(box(cornice,vec3(5.5,.24,8.5)),max(1.-p.y,p.y-height+6.)),3.));
 }
 if(FIELD_KIND==3){
  // Monumental weathered sandstone stacked like the pages of a geological atlas.
  vec2 q=p.xz;float ridges=pow(abs(sin(q.x*.013+fbm(vec3(q*.011,5.))*2.)),1.7);
  float h=14.+ridges*100.+fbm(vec3(q*.022,2.))*45.;
  float channel=34.+8.*sin(p.z*.009);
  float strata=sin(p.y*.67+fbm(p*.07)*1.4)*.8;
  hit=nearest(hit,vec2(max(p.y-h+strata,channel-abs(p.x)),1.));
  // The central river remains an unbroken low, navigable corridor.
  float buttress=length(vec2(abs(p.x)-49.,mod(p.z+38.,76.)-38.))-12.;
  hit=nearest(hit,vec2(max(buttress,abs(p.y-28.)-30.),1.));
 }
 return hit;
}
vec3 normalAt(vec3 p){vec2 e=vec2(.065,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
float shadow(vec3 p,vec3 sun){float s=1.,t=.8;for(int i=0;i<7;i++){float h=map(p+sun*t).x;s=min(s,9.*h/t);t+=clamp(h,.8,14.);if(t>70.)break;}return clamp(s,.14,1.);}
vec3 sky(vec3 rd){float h=smoothstep(-.05,.8,rd.y);vec3 col=mix(uHorizon,uTop,h);float disk=pow(max(0.,dot(rd,normalize(uSun))),400.);col+=uAccent*disk*2.;return col;}
void main(){
 #include <clipping_planes_fragment>
 vec3 ro=uEye,rd=normalize(vLocal-uEye);float depth=.4;vec2 info;bool yes=false;
 for(int i=0;i<64;i++){info=map(ro+rd*depth);if(info.x<max(.08,depth*.0005)){yes=true;break;}depth+=max(.09,info.x*.82);if(depth>900.)break;}
 vec3 col=sky(rd);
 if(yes){
  vec3 p=ro+rd*depth,n=normalAt(p),sun=normalize(uSun);
  float light=max(0.,dot(n,sun)),sh=shadow(p+n*.18,sun),ao=clamp(map(p+n*2.).x/2.,.35,1.);
  float detail=fbm(p*.18);vec3 albedo=uStone*(.6+.48*detail);
  if(FIELD_KIND==0){float cracks=pow(.5+.5*sin(p.x*.7+sin(p.z*.15)+p.y*.9),18.);albedo+=uAccent*cracks*.24;}
  if(FIELD_KIND==1){float band=.5+.5*sin(p.y*2.+detail*3.);albedo*=.82+band*.18;}
  if(FIELD_KIND==2){albedo=mix(albedo,uAccent,.18+.18*sin(p.y*.5+p.z*.06));}
  if(FIELD_KIND==3){float band=.5+.5*sin(p.y*.65+detail*2.);albedo=mix(uStone,uAccent,band*.45);}
  vec3 ambient=mix(uHorizon*.45,uTop*.55+.24,n.y*.5+.5);
  if(info.y>2.5)albedo*=.28;
  col=albedo*(ambient*ao+vec3(1.,.86,.68)*light*sh*.9);
  float fres=pow(1.-max(0.,dot(-rd,n)),4.);
  col+=uAccent*fres*.12;
  if(info.y>1.5&&info.y<2.5){col=uAccent*(1.1+.15*sin(uTime*.9+p.z*.06));}
  if(info.y<.5){
   vec3 rr=reflect(rd,normalize(vec3(.014*sin(p.z*.1+uTime*.3),1.,.013*cos(p.x*.08+uTime*.25))));
   col=mix(albedo*.13,sky(rr),.55+fres*.3);
   col+=uAccent*pow(max(0.,sin(p.z*.11+p.x*.05+uTime*.2)),22.)*.13;
  }
  float fog=1.-exp(-depth*(FIELD_KIND==0?.0016:.0011));col=mix(col,uHorizon,fog);
  vec4 clip=projectionMatrix*viewMatrix*uLocalToWorld*vec4(p,1.);gl_FragDepth=clamp(clip.z/clip.w*.5+.5,0.,1.);
 }else{gl_FragDepth=.999999;}
 gl_FragColor=vec4(max(col,vec3(0.)),1.);
}`,s=[{id:"x-field-frost-cathedral",name:"The Cathedral Below Zero",category:"interior",weirdness:.6,line:"A blue-ice nave of fluted pillars and luminous frost, reflected in a river that never freezes.",top:"#030d26",horizon:"#284d6d",stone:"#5e9eb9",accent:"#a0ecff",sun:[-1,1,.5],y:15},{id:"x-field-basalt-organ",name:"The Basalt Organ at First Light",category:"wilderness",weirdness:.35,line:"Sail between thousands of hexagonal volcanic pipes, their golden crowns humming above a mercury sea.",top:"#152836",horizon:"#dfb28d",stone:"#333f49",accent:"#eec28b",sun:[-.8,.7,-1],y:18},{id:"x-field-fossil-city",name:"The City Inside an Ammonite",category:"bizarre",weirdness:.8,line:"A drowned street threads the nacre chambers of an ammonite large enough to shelter a civilization.",top:"#10292c",horizon:"#447577",stone:"#ceac81",accent:"#f7c791",sun:[.7,.6,1],y:14},{id:"x-field-strata-atlas",name:"The Atlas of Folded Mountains",category:"wilderness",weirdness:.3,line:"A quiet river opens a book of sandstone, every red and golden page a different age of the Earth.",top:"#244c74",horizon:"#efd3b6",stone:"#c28466",accent:"#e7b778",sun:[-.9,1,.3],y:18}],y=s;function b(n){const e=s[n];return{id:e.id,name:e.name,category:e.category,weirdness:e.weirdness,async build(l){const i=new a.Scene;i.background=new a.Color(e.top);const t={uEye:{value:new a.Vector3},uTime:{value:0},uKind:{value:n},uLocalToWorld:{value:new a.Matrix4},uTop:{value:new a.Color(e.top)},uHorizon:{value:new a.Color(e.horizon)},uStone:{value:new a.Color(e.stone)},uAccent:{value:new a.Color(e.accent)},uSun:{value:new a.Vector3(...e.sun)}},p=new a.ShaderMaterial({uniforms:t,vertexShader:v,fragmentShader:"#define FIELD_KIND "+n+`
`+u,side:a.BackSide,clipping:!0}),o=new a.Mesh(new a.SphereGeometry(1900,24,12),p);o.frustumCulled=!1,i.add(o);const r=new a.Vector3;o.onBeforeRender=(h,c,f)=>{r.setFromMatrixPosition(f.matrixWorld),o.worldToLocal(r),t.uEye.value.copy(r),t.uLocalToWorld.value.copy(o.matrixWorld)},await l.yield?.();const d=m([[0,e.y,290],[3,e.y+2,190],[-4,e.y+5,65],[3,e.y+4,-80],[-3,e.y+1,-220],[0,e.y,-340],[0,e.y,-385]]);return{scene:i,path:d,title:e.name,duration:53,ride:"none",companion:"none",style:"none",camera:{fov:64,near:.3,far:4500,lookAhead:25,sway:.18,bank:.12},portal:{shape:"circle",radius:7,color:e.accent,glow:.6,revealDistance:220},post:{exposure:1.1,bloom:{strength:.25,radius:.6,threshold:1},grade:{saturation:1.04,contrast:1.04,tint:"#ffffff",shadowTint:"#02060d",vignette:.23,grain:.012,aberration:0}},update(h,c){t.uTime.value=c}}}}}export{y as FIELD_SPECS,b as realm};
