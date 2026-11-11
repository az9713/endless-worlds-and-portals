// Original environmental science worlds. No image, sound or model downloads.
import * as T from 'three';
import { makePath, makeRng } from '../kit/core.js';
const TAU=Math.PI*2, V=T.Vector3, Y=new V(0,1,0), tmp=new T.Object3D();
const tick=async c=>{if(c.yield)await c.yield();};
const vs=`varying vec3 vP,vN;varying vec2 vUv;void main(){vP=position;vN=normal;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const noise=`float H(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float N(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),f.x),mix(H(i+vec2(0,1)),H(i+vec2(1)),f.x),f.y);}float F(vec2 p){return .57*N(p)+.28*N(p*2.03)+.15*N(p*4.11);}`;
function shader(fs,u={},o={}){return new T.ShaderMaterial({vertexShader:vs,fragmentShader:`precision highp float;varying vec3 vP,vN;varying vec2 vUv;uniform float uTime;${noise}\n${fs}`,uniforms:{uTime:{value:0},...u},side:T.DoubleSide,...o});}
const mat=(color,rough=.8,metal=.08,emit=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive:color,emissiveIntensity:emit});
const glow=(color,alpha=1)=>new T.MeshBasicMaterial({color,transparent:alpha<1,opacity:alpha,depthWrite:alpha>=1,side:T.DoubleSide});
function add(s,g,m,p=[0,0,0],scale=1){const o=new T.Mesh(g,m);o.position.set(...p);if(Array.isArray(scale))o.scale.set(...scale);else o.scale.setScalar(scale);s.add(o);return o;}
function inst(s,g,m,n,fn){const o=new T.InstancedMesh(g,m,n);for(let i=0;i<n;i++){tmp.position.set(0,0,0);tmp.rotation.set(0,0,0);tmp.scale.set(1,1,1);tmp.userData.color=null;fn(tmp,i);tmp.updateMatrix();o.setMatrixAt(i,tmp.matrix);if(tmp.userData.color)o.setColorAt(i,new T.Color(tmp.userData.color));}o.instanceMatrix.needsUpdate=true;s.add(o);return o;}
function beam(s,a,b,r,m){const aa=new V(...a),bb=new V(...b),d=bb.clone().sub(aa);const o=add(s,new T.CylinderGeometry(r,r,d.length(),8),m,aa.add(bb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(Y,d.normalize());return o;}
function tube(s,pts,r,m,n=100,k=6){return add(s,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new V(...p))),n,r,k,false),m);}
function ring(s,r,w,m,p,rot=[Math.PI/2,0,0],seg=80){const o=add(s,new T.TorusGeometry(r,w,6,seg),m,p);o.rotation.set(...rot);return o;}
function surface(nu,nv,fn){const p=[],uv=[],idx=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){p.push(...fn(i/nu,j/nv));uv.push(i/nu,j/nv);}for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,b,a+1,a+1,b,b+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function stone(a='#9e967d',b='#4e625d',scale=.12){return shader(`uniform vec3 uA,uB;void main(){float grain=F(vP.xz*.9+vP.y*.2);float mottling=F(vP.xz*.025+vP.y*.018);float joints=1.-smoothstep(.025,.06,min(fract(vP.x*${scale}),fract(vP.z*${scale})));vec3 c=mix(uA,uB,mottling*.6)*(.7+.3*grain);c*=.94-joints*.14;float lit=.42+.58*abs(dot(normalize(vN),normalize(vec3(-.35,.8,-.3))));gl_FragColor=vec4(c*lit,1.);}`,{uA:{value:new T.Color(a)},uB:{value:new T.Color(b)}});}
function environment(ctx,title,{sky='#254d64',horizon='#d8c6a3',ground='#1b3032',accent='#ffe2ad',fog=.0012,stars=false}={}){
 const scene=new T.Scene(),rng=ctx.rng?.fork?ctx.rng.fork(title):makeRng(title),updates=[];scene.background=new T.Color(sky);scene.fog=new T.FogExp2(horizon,fog);
 const dome=shader(`uniform vec3 uSky,uHorizon;void main(){float y=normalize(vP).y;vec3 c=mix(uHorizon,uSky,smoothstep(-.08,.65,y));c+=vec3(.05,.045,.03)*F(normalize(vP).xz*12.)*(1.-smoothstep(.2,.6,y));gl_FragColor=vec4(c,1.);}`,{uSky:{value:new T.Color(sky)},uHorizon:{value:new T.Color(horizon)}},{side:T.BackSide,depthWrite:false});add(scene,new T.SphereGeometry(2300,32,16),dome);
 scene.add(new T.HemisphereLight('#d6e8ee',ground,1.4));const key=new T.DirectionalLight('#ffe2b9',2.1);key.position.set(-180,250,-100);scene.add(key);const fill=new T.DirectionalLight('#8dc7cf',.7);fill.position.set(180,100,120);scene.add(fill);
 return {scene,rng,updates,title,accent};
}
function done(b,points,opts={}){const {scene,updates,title,accent}=b;return {scene,title,path:makePath(points),duration:opts.duration||54,ride:'none',companion:'none',style:'none',camera:{fov:62,near:.2,far:5000,lookAhead:24,sway:.1,bank:.14,...opts.camera},portal:{shape:'circle',radius:7,color:accent,glow:.4,revealDistance:180},post:{exposure:1,bloom:{strength:.2,radius:.55,threshold:1.05},grade:{saturation:1.04,contrast:1.025,tint:'#ffffff',shadowTint:'#030608',vignette:.18,grain:.012,aberration:0}},update(dt,t,c,u){updates.forEach(f=>f(t,u,dt,c));},...opts};}
function floor(s,w,d,y=0,m=stone()){const o=add(s,new T.PlaneGeometry(w,d),m,[0,y,0]);o.rotation.x=-Math.PI/2;return o;}
function batch(s,m){const items=s.children.filter(o=>o.isMesh&&!o.isInstancedMesh&&o.material===m);if(items.length<2)return;const p=[],n=[],uv=[],trash=new Set();s.updateMatrixWorld(true);for(const o of items){let g=o.geometry.clone();if(g.index){const un=g.toNonIndexed();g.dispose();g=un;}g.applyMatrix4(o.matrixWorld);for(const v of g.attributes.position.array)p.push(v);for(const v of g.attributes.normal.array)n.push(v);if(g.attributes.uv)for(const v of g.attributes.uv.array)uv.push(v);else for(let i=0;i<g.attributes.position.count;i++)uv.push(0,0);g.dispose();trash.add(o.geometry);s.remove(o);}for(const g of trash)g.dispose();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));add(s,g,m);}
function arch(s,x,z,width,height,m){const pts=Array.from({length:33},(_,i)=>{const a=Math.PI*i/32;return [x+Math.cos(a)*width,height*.35+Math.sin(a)*height*.65,z];});tube(s,pts,2.1,m,64,8);beam(s,[x-width,0,z],[x-width,height*.35,z],2.2,m);beam(s,[x+width,0,z],[x+width,height*.35,z],2.2,m);}

export async function chladni(ctx){
 const b=environment(ctx,'The Sand Choir',{sky:'#473c3e',horizon:'#b9a385',accent:'#ffdfac',fog:.001});const {scene,rng,updates}=b;
 const sandstone=stone('#bcb093','#827c67'),bronze=mat('#9b7750',.5,.6),dark=mat('#3c4947',.92,.05);floor(scene,650,940,-3,sandstone);
 const plate=shader(`void main(){vec2 p=vP.xz;float n=F(p*.3);float etch=pow(.5+.5*cos(p.x*.13),26.)*.1;vec3 c=mix(vec3(.09,.12,.12),vec3(.24,.23,.17),n)*(.8+etch);gl_FragColor=vec4(c,1.);}`);
 const g=new T.PlaneGeometry(220,620);g.rotateX(-Math.PI/2);add(scene,g,plate,[0,-.5,0]);
 const grains=[];const L=220;let tries=0;while(grains.length<15000&&tries++<500000){const x=rng.range(-108,108),z=rng.range(-305,305),zz=((z+110)%220+220)%220-110;const f=Math.cos(3*Math.PI*x/L)*Math.cos(5*Math.PI*zz/L)-Math.cos(5*Math.PI*x/L)*Math.cos(3*Math.PI*zz/L);if(Math.abs(f)<.045)grains.push([x,.1+rng()*.28,z]);}
 inst(scene,new T.IcosahedronGeometry(.19,0),mat('#e3c181',.98,.02),grains.length,(o,i)=>{o.position.set(...grains[i]);o.scale.setScalar(.7+rng()*.8);});await tick(ctx);
 for(let z=-360;z<=360;z+=80){arch(scene,0,z,140,126,sandstone);for(const x of [-175,175]){add(scene,new T.BoxGeometry(44,42,42),dark,[x,18,z]);add(scene,new T.CylinderGeometry(21,24,6,24),bronze,[x,42,z]);ring(scene,17,.7,glow('#b8b7a0'),[x,46,z]);}}
 await tick(ctx);
 // Recessed stained apertures and carved narrow ribs give the hall a readable scale.
 const amber=glow('#d8b16f'),window=mat('#32565b',.25,.3,.08);
 for(const x of [-212,212]){add(scene,new T.BoxGeometry(18,100,900),sandstone,[x,45,0]);for(let j=0;j<20;j++){const z=-380+j*40;add(scene,new T.BoxGeometry(2,52,18),window,[x-Math.sign(x)*10,58,z]);add(scene,new T.BoxGeometry(2.5,1.4,18),amber,[x-Math.sign(x)*11,74,z]);}}
 const gong=add(scene,new T.CylinderGeometry(64,64,4,96),bronze,[0,72,410]);gong.rotation.x=Math.PI/2;
 for(let r=9;r<64;r+=8)ring(scene,r,.35,mat('#d3b16f',.4,.5),[0,72,407],[0,0,0]);
 const hammers=[];for(const x of [-125,125]){beam(scene,[x,0,220],[x,82,220],1.4,bronze);const h=new T.Group();h.position.set(x,80,220);scene.add(h);beam(h,[0,0,0],[0,-28,0],.5,bronze);add(h,new T.SphereGeometry(3,16,12),dark,[0,-30,0]);hammers.push(h);}
 updates.push(t=>hammers.forEach((h,i)=>h.rotation.z=.14*Math.sin(t*.7+i*Math.PI)));
 for(const m of [sandstone,bronze,dark,amber,window])batch(scene,m);await tick(ctx);
 return done(b,[[0,17,-350],[-12,22,-230],[6,28,-100],[-10,24,40],[10,24,180],[0,24,315]],{pois:[{at:(t,u)=>[0,2,-180+u*450],from:.08,to:.83,weight:.42,fade:.2,steady:true,arc:true}]});
}

function truncatedEdges(){const pts=[],seen=new Set();for(let zero=0;zero<3;zero++)for(const a of [-1,1])for(const bb of [-2,2])for(let swap=0;swap<2;swap++){const p=[0,0,0],idx=[0,1,2].filter(i=>i!==zero);p[idx[0]]=swap?bb:a;p[idx[1]]=swap?a:bb;const k=p.join(',');if(!seen.has(k)){pts.push(p);seen.add(k);}}const edges=[];for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)if(Math.abs(new V(...pts[i]).distanceToSquared(new V(...pts[j]))-2)<1e-6)edges.push([pts[i],pts[j]]);return {pts,edges};}
export async function kelvin(ctx){
 const b=environment(ctx,'Gardens in Fourteen Faces',{sky:'#395c70',horizon:'#d2d8bf',accent:'#e8d2a3',fog:.0013});const {scene,rng,updates}=b;
 const limestone=stone('#aab5a2','#687b70'),frame=mat('#c6b8a0',.58,.5),leaf=mat('#457d58',.9,.02),glass=shader(`void main(){float light=.35+.4*abs(vN.y);gl_FragColor=vec4(vec3(.18,.37,.36)*light,.18);}`,{}, {transparent:true,depthWrite:false});floor(scene,1200,1200,-4,limestone);
 const {pts,edges}=truncatedEdges(),segments=[];const cells=[];
 for(let row=0;row<10;row++)for(const side of [-1,1])for(let level=0;level<2;level++){const a=15,x=side*(88+level*34),y=35+level*56,z=-300+row*64;cells.push([x,y,z]);for(const e of edges)segments.push([e[0].map((v,i)=>v*a+[x,y,z][i]),e[1].map((v,i)=>v*a+[x,y,z][i])]);}
 inst(scene,new T.CylinderGeometry(.6,.6,1,6),frame,segments.length,(o,i)=>{const [p,q]=segments[i],a=new V(...p),bb=new V(...q),d=bb.clone().sub(a);o.position.copy(a.add(bb).multiplyScalar(.5));o.scale.y=d.length();o.quaternion.setFromUnitVectors(Y,d.normalize());});await tick(ctx);
 // Square glazing on the six axial faces; open hexagons reveal the interior gardens.
 const pane=new T.PlaneGeometry(30,30),planter=mat('#47504a',.9,.05),windows=[];
 for(const c of cells){const [x,y,z]=c;const front=add(scene,pane,glass,[x,y,z-30]);front.rotation.z=Math.PI/4;const back=add(scene,pane,glass,[x,y,z+30]);back.rotation.z=Math.PI/4;add(scene,new T.CylinderGeometry(22,22,3,8),planter,[x,y-16,z]);for(let k=0;k<4;k++){const p=[x+(k%2?1:-1)*10,y-13,z+(k<2?-1:1)*10];add(scene,new T.ConeGeometry(7,18,7),leaf,[p[0],p[1]+8,p[2]]);}}
 await tick(ctx);
 // Fern fronds, railings and an irrigation canal carry detail along the entire boulevard.
 const leaves=surface(8,1,(u,v)=>[(v-.5)*Math.sin(u*Math.PI)*4,u*18,Math.sin(u*Math.PI)*5]);const lm=mat('#679769',.9,.03);lm.side=T.DoubleSide;
 inst(scene,leaves,lm,1800,(o,i)=>{const c=cells[i%cells.length];o.position.set(c[0]+rng.range(-17,17),c[1]-14,c[2]+rng.range(-17,17));o.rotation.y=rng()*TAU;o.scale.setScalar(rng.range(.5,1));});
 const water=shader(`void main(){float r=.5+.5*sin(vP.z*.12+uTime*.4+sin(vP.x*.2));gl_FragColor=vec4(mix(vec3(.025,.12,.14),vec3(.12,.3,.3),r*.4),1.);}`);const canal=new T.PlaneGeometry(25,850);canal.rotateX(-Math.PI/2);add(scene,canal,water,[0,-2,0]);
 for(let z=-320;z<=320;z+=64){arch(scene,0,z,43,28,limestone);for(const side of [-1,1])beam(scene,[side*38,0,z-24],[side*38,9,z-24],.6,frame);}
 updates.push(t=>water.uniforms.uTime.value=t);
 for(const m of [limestone,glass,planter,leaf])batch(scene,m);await tick(ctx);
 return done(b,[[0,35,-350],[-5,44,-220],[5,52,-90],[-5,60,55],[5,54,185],[0,40,300]],{duration:55});
}

export async function dna(ctx){
 const b=environment(ctx,'The Night Shift in the Nucleus',{sky:'#164d56',horizon:'#39676c',accent:'#ffcd94',fog:.0016});const {scene,rng,updates}=b;scene.fog=new T.FogExp2('#17454f',.0018);
 const envelope=shader(`void main(){float n=F(vP.xz*.025+vP.y*.012),cell=pow(.5+.5*sin(vP.x*.08+sin(vP.y*.07))*sin(vP.z*.09),6.);vec3 c=mix(vec3(.025,.13,.15),vec3(.13,.28,.25),n);c+=vec3(.04,.08,.045)*cell;gl_FragColor=vec4(c,1.);}`,{}, {side:T.BackSide});add(scene,new T.SphereGeometry(480,64,40),envelope,[0,80,0],[1,.75,1]);
 const chroma=mat('#905f69',.75,.04),chainA=mat('#c8aa76',.65,.14),chainB=mat('#78c7bc',.65,.1),rung=mat('#bf947b',.8,.05);
 const dnaA=[],dnaB=[];for(let i=0;i<=300;i++){const z=-360+i*2.4,a=z*.15;dnaA.push([-20+Math.cos(a)*17,58+Math.sin(a)*17,z]);dnaB.push([-20-Math.cos(a)*17,58-Math.sin(a)*17,z]);}
 tube(scene,dnaA,1.6,chainA,800,7);await tick(ctx);tube(scene,dnaB,1.6,chainB,800,7);
 const bars=[];for(let i=0;i<180;i++){const z=-355+i*4,a=z*.15;bars.push([[-20+Math.cos(a)*16,58+Math.sin(a)*16,z],[-20-Math.cos(a)*16,58-Math.sin(a)*16,z]]);}
 inst(scene,new T.CylinderGeometry(.75,.75,1,6),rung,bars.length,(o,i)=>{const [aa,bb]=bars[i],a=new V(...aa),d=new V(...bb).sub(a);o.position.copy(a.add(new V(...bb)).multiplyScalar(.5));o.scale.y=d.length();o.quaternion.setFromUnitVectors(Y,d.normalize());o.userData.color=i%2?'#bd806a':'#8aab9f';});
 for(let j=0;j<20;j++){const side=j%2?1:-1,z=-330+Math.floor(j/2)*75,points=Array.from({length:60},(_,i)=>{const a=i/59*TAU*2.7;return [side*(130+Math.cos(a)*50),70+Math.sin(a*1.4)*70,z+Math.sin(a)*34];});tube(scene,points,3.4,chroma,160,7);if(j%3===2)await tick(ctx);}
 // The repair complex is a sculptural split clamp, deliberately not an atomic model.
 const motor=new T.Group();motor.position.set(-20,58,30);scene.add(motor);const pearl=mat('#c4d7c4',.42,.2);
 inst(motor,new T.IcosahedronGeometry(2.2,1),pearl,380,(o,i)=>{const a=rng()*TAU,r=25+rng()*5;o.position.set(Math.cos(a)*r,Math.sin(a)*r,rng.range(-9,9));o.scale.setScalar(rng.range(.7,1.5));o.userData.color=['#b0c4b2','#d4c7a6','#8ea99f'][i%3];});
 const pores=[];for(let i=0;i<90;i++){const a=i*2.399963,y=rng.range(-.55,.65),r=Math.sqrt(1-y*y);pores.push([Math.cos(a)*r*470,80+y*350,Math.sin(a)*r*470]);}
 inst(scene,new T.TorusGeometry(9,2.3,6,16),mat('#a2b7a6',.8,.02),pores.length,(o,i)=>{o.position.set(...pores[i]);o.lookAt(0,80,0);});
 const nucleoli=mat('#396d76',.85,.04);for(let i=0;i<5;i++)add(scene,new T.IcosahedronGeometry(35+i*3,2),nucleoli,[(i%2?1:-1)*(180+i*20),70+i*22,-160+i*90],[1.2,1.5,1]);
 inst(scene,new T.IcosahedronGeometry(.8,0),mat('#b0c8b9',.75,.03),2200,(o,i)=>{o.position.set(rng.range(-330,330),rng.range(-90,250),rng.range(-400,400));o.scale.setScalar(rng.range(.5,1.5));});
 updates.push(t=>{motor.rotation.z=.05*Math.sin(t*.3);});
 batch(scene,chroma);await tick(ctx);
 return done(b,[[35,76,-320],[36,77,-210],[37,78,-90],[37,79,40],[37,80,170],[37,80,300]],{pois:[{at:(t,u)=>[-20,58,-250+u*600],from:.05,to:.88,weight:.46,fade:.18,steady:true,arc:true}]});
}

function palm(s,x,z,h,wood,leaf,rng){const bend=rng.range(-10,10);tube(s,[[x,0,z],[x+bend*.3,h*.5,z+2],[x+bend,h,z]],1.3,wood,18,7);for(let j=0;j<7;j++){const a=j/7*TAU;const pts=Array.from({length:12},(_,i)=>{const u=i/11;return [x+bend+Math.cos(a)*u*24,h+Math.sin(u*Math.PI)*6-u*5,z+Math.sin(a)*u*24];});tube(s,pts,.3,leaf,25,4);}}
export async function foucault(ctx){
 const b=environment(ctx,'The Observatory Lets the Earth Turn',{sky:'#3c778a',horizon:'#e2d4aa',accent:'#f8d9a0',fog:.0013});const {scene,rng,updates}=b;
 const marble=stone('#c4c1aa','#89a09b'),copper=mat('#9c8063',.6,.55),wood=mat('#655b40',.85,.05),leaf=mat('#396b4b',.9,.02);floor(scene,1400,1400,-6,stone('#5c7960','#395c4a'));
 add(scene,new T.CylinderGeometry(195,205,12,96),marble,[0,-3,0]);const compass=shader(`void main(){vec2 p=vP.xz;float r=length(p),a=atan(p.y,p.x);float rings=pow(.5+.5*cos(r*.32),40.);float ticks=pow(.5+.5*cos(a*120.),60.)*smoothstep(100.,120.,r);vec3 c=mix(vec3(.38,.46,.42),vec3(.66,.59,.4),max(rings,ticks)*.7);float star=step(.83,cos(a*8.))*smoothstep(100.,0.,r);c=mix(c,vec3(.15,.3,.32),star*.6);gl_FragColor=vec4(c,1.);}`);const cg=new T.CircleGeometry(190,128);cg.rotateX(-Math.PI/2);add(scene,cg,compass,[0,3.1,0]);
 for(let i=0;i<24;i++){const a=i/24*TAU,x=Math.cos(a)*180,z=Math.sin(a)*180;add(scene,new T.CylinderGeometry(3.4,4.4,100,12),marble,[x,52,z]);add(scene,new T.CylinderGeometry(6,6,3,16),copper,[x,101,z]);}
 ring(scene,181,3.2,copper,[0,104,0]);
 const ribs=[];for(let j=0;j<12;j++){const a=j/12*TAU;const p=Array.from({length:32},(_,i)=>{const u=i/31,r=180*(1-u),y=105+58*Math.sin(u*Math.PI/2);return [Math.cos(a)*r,y,Math.sin(a)*r];});tube(scene,p,1.25,copper,64,6);}
 await tick(ctx);
 const bob=add(scene,new T.SphereGeometry(8,40,24),mat('#bc9b53',.36,.75),[0,14,0]);const wire=add(scene,new T.CylinderGeometry(.18,.18,150,8),mat('#d2c8af',.6,.5),[0,88,0]);
 const tiles=[];for(let i=0;i<60;i++){const a=i/60*TAU;tiles.push([Math.cos(a)*65,4.2,Math.sin(a)*65]);}
 inst(scene,new T.BoxGeometry(2.2,1.1,5),mat('#cfb680',.7,.3),tiles.length,(o,i)=>{o.position.set(...tiles[i]);o.rotation.y=-i/60*TAU;});
 for(let j=0;j<24;j++){const a=j/24*TAU,r=245+rng()*80;palm(scene,Math.cos(a)*r,Math.sin(a)*r,rng.range(45,70),wood,leaf,rng);if(j%4===3)await tick(ctx);}
 // Copper telescopes sit between the colonnade and the garden, not on the flight path.
 for(let j=0;j<6;j++){const a=j/6*TAU,x=Math.cos(a)*150,z=Math.sin(a)*150;for(let k=0;k<3;k++)beam(scene,[x+Math.cos(k*TAU/3)*6,4,z+Math.sin(k*TAU/3)*6],[x,22,z],.6,copper);const scope=add(scene,new T.CylinderGeometry(3,4,24,16),copper,[x,28,z]);scope.rotation.z=.9;ring(scene,3,.4,glow('#9dbac0'),[x-9,35,z],[0,Math.PI/2,0],24);}
 updates.push(t=>{const pre=t*.018,swing=Math.cos(t*.65),x=55*swing*Math.cos(pre),z=55*swing*Math.sin(pre),y=163-Math.sqrt(150*150-x*x-z*z);bob.position.set(x,y,z);const anchor=new V(0,163,0),d=bob.position.clone().sub(anchor);wire.position.copy(anchor.add(bob.position).multiplyScalar(.5));wire.scale.y=d.length()/150;wire.quaternion.setFromUnitVectors(Y,d.normalize());});
 for(const m of [marble,copper,wood,leaf])batch(scene,m);await tick(ctx);
 return done(b,[[-85,24,-160],[-125,35,-90],[-135,42,20],[-70,40,120],[60,36,130],[120,30,65],[145,25,-10]],{pois:[{at:[0,25,0],from:.02,to:.89,weight:.84,fade:.15,steady:true,arc:true}]});
}

function penroseTriangles(depth=6){const phi=(1+Math.sqrt(5))/2;let triangles=[];for(let i=0;i<10;i++){let B=[Math.cos((2*i-1)*Math.PI/10),Math.sin((2*i-1)*Math.PI/10)],C=[Math.cos((2*i+1)*Math.PI/10),Math.sin((2*i+1)*Math.PI/10)];if(i%2===0)[B,C]=[C,B];triangles.push([0,[0,0],B,C]);}const mix=(A,B,t)=>A.map((v,i)=>v+(B[i]-v)*t);for(let n=0;n<depth;n++){const next=[];for(const [kind,A,B,C]of triangles){if(kind===0){const P=mix(A,B,1/phi);next.push([0,C,P,B],[1,P,C,A]);}else{const Q=mix(B,A,1/phi),R=mix(B,C,1/phi);next.push([1,R,C,A],[1,Q,R,B],[0,R,Q,A]);}}triangles=next;}return triangles;}
export async function penrose(ctx){
 const b=environment(ctx,'The Palace of Two Tiles',{sky:'#325a69',horizon:'#c9b89b',accent:'#ffe0a4',fog:.0012});const {scene,rng,updates}=b;
 const stonework=stone('#b9b293','#7b9287'),brass=mat('#b79b63',.58,.5),blue=mat('#3d777b',.8,.08);floor(scene,900,1000,-4,stonework);
 const P=[],C=[],Bary=[];for(const [kind,A,B,Cc]of penroseTriangles(7)){const col=new T.Color(kind?'#5b9293':'#bba66e');for(const [i,p]of [A,B,Cc].entries()){P.push(p[0]*360,0,p[1]*360);C.push(col.r,col.g,col.b);Bary.push(i===0?1:0,i===1?1:0,i===2?1:0);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('aTint',new T.Float32BufferAttribute(C,3));g.setAttribute('aBary',new T.Float32BufferAttribute(Bary,3));g.computeVertexNormals();
 const tile=shader(`varying vec3 vTint,vBary;void main(){float edge=min(vBary.x,min(vBary.y,vBary.z));float aa=max(fwidth(edge),.001);float grout=1.-smoothstep(aa*.6,aa*1.8,edge);float speck=F(vP.xz*.7);vec3 c=vTint*(.77+speck*.2);c=mix(c,vec3(.13,.22,.21),grout*.65);gl_FragColor=vec4(c,1.);}`);
 tile.vertexShader=`attribute vec3 aTint,aBary;varying vec3 vP,vN;varying vec2 vUv;varying vec3 vTint,vBary;void main(){vP=position;vN=normal;vUv=vec2(0.);vTint=aTint;vBary=aBary;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;add(scene,g,tile,[0,-1,0]);await tick(ctx);
 for(const side of [-1,1])for(let j=0;j<11;j++){const x=side*151,z=-350+j*70;add(scene,new T.CylinderGeometry(5,6,94,10),stonework,[x,44,z]);add(scene,new T.CylinderGeometry(8,8,3,10),brass,[x,91,z]);add(scene,new T.CylinderGeometry(10,10,6,10),blue,[x,0,z]);}
 const roofMat=shader(`void main(){float line=pow(.5+.5*cos(vUv.x*6.283*30.),30.);float bands=pow(.5+.5*cos(vUv.y*6.283*11.),24.);float pat=F(vP.xz*.04);vec3 c=mix(vec3(.08,.19,.21),vec3(.3,.4,.36),pat);c+=vec3(.33,.25,.12)*max(line,bands);gl_FragColor=vec4(c,1.);}`);
 add(scene,surface(64,80,(u,v)=>{const x=(u-.5)*370,z=(v-.5)*850;return [x,96+42*Math.cos((u-.5)*Math.PI),z];}),roofMat);
 for(let j=0;j<9;j++){const z=-320+j*80;arch(scene,0,z,150,111,brass);const chandelier=new T.Group();chandelier.position.set(0,105,z);scene.add(chandelier);for(let k=0;k<5;k++){const a=k/5*TAU;beam(chandelier,[0,10,0],[Math.cos(a)*12,-6,Math.sin(a)*12],.4,brass);add(chandelier,new T.SphereGeometry(1.1,10,8),glow('#e0c693'),[Math.cos(a)*12,-6,Math.sin(a)*12]);}}
 await tick(ctx);
 for(const x of [-198,198]){add(scene,new T.BoxGeometry(15,88,880),stonework,[x,40,0]);for(let j=0;j<22;j++){const z=-390+j*38;add(scene,new T.BoxGeometry(2,52,13),blue,[x-Math.sign(x)*8,48,z]);for(let k=0;k<5;k++)add(scene,new T.BoxGeometry(2.5,.5,13),brass,[x-Math.sign(x)*9,25+k*11,z]);}}
 for(const m of [stonework,brass,blue])batch(scene,m);await tick(ctx);
 return done(b,[[0,17,-330],[-8,21,-215],[8,27,-80],[-6,30,60],[6,24,185],[0,22,310]],{pois:[{at:(t,u)=>[0,0,-200+u*480],from:.1,to:.86,weight:.35,fade:.2,steady:true,arc:true}]});
}

export async function cilia(ctx){
 const b=environment(ctx,'The Ocean Has Eyelashes',{sky:'#063c57',horizon:'#357b87',accent:'#b7e7c6',fog:.0018});const {scene,rng,updates}=b;scene.fog=new T.FogExp2('#195b70',.0018);
 const bed=shader(`void main(){float grain=F(vP.xz*.4),ripple=.5+.5*sin(vP.x*.3+sin(vP.z*.06)*2.);vec3 c=mix(vec3(.06,.2,.19),vec3(.23,.39,.3),grain);c*=.8+ripple*.12;float light=.35+.55*max(0.,normalize(vN).y);gl_FragColor=vec4(c*light,1.);}`);
 const ground=surface(100,140,(u,v)=>{const x=(u-.5)*800,z=(v-.5)*1000;return[x,-7+Math.sin(x*.018)*Math.sin(z*.016)*4,z];});add(scene,ground,bed);
 const n=4200,phases=new Float32Array(n),tints=new Float32Array(n*3),positions=[];while(positions.length<n){const x=rng.range(-270,270),z=rng.range(-380,380);if(Math.abs(x)<26)continue;positions.push([x,z]);}
 const cg=new T.CylinderGeometry(.08,.42,15,5,10);cg.translate(0,7.5,0);for(let i=0;i<n;i++){phases[i]=rng()*TAU;const col=new T.Color().setHSL(.42+rng()*.13,.34,.36+rng()*.15);tints.set([col.r,col.g,col.b],i*3);}cg.setAttribute('aPhase',new T.InstancedBufferAttribute(phases,1));cg.setAttribute('aTint',new T.InstancedBufferAttribute(tints,3));
 const cm=shader(`varying vec3 vTint;void main(){float stripe=.9+.1*sin(vP.y*8.);float lit=.55+.4*max(0.,normalize(vN).y);vec3 c=vTint*stripe*lit; c+=vec3(.06,.1,.09)*pow(vUv.y,5.);gl_FragColor=vec4(c,1.);}`);
 cm.vertexShader=`attribute float aPhase;attribute vec3 aTint;uniform float uTime;varying vec3 vP,vN;varying vec2 vUv;varying vec3 vTint;void main(){vec3 p=position;vec4 world=instanceMatrix*vec4(p,1.);float h=p.y/15.;float phase=world.x*.105+world.z*.075-uTime*1.5;world.x+=h*h*5.5*sin(phase);world.z+=h*h*2.2*cos(phase*.8);vP=world.xyz;vN=normalize(mat3(instanceMatrix)*normal);vUv=uv;vTint=aTint;gl_Position=projectionMatrix*modelViewMatrix*world;}`;
 inst(scene,cg,cm,n,(o,i)=>{const [x,z]=positions[i],y=-7+Math.sin(x*.018)*Math.sin(z*.016)*4;o.position.set(x,y,z);o.scale.setScalar(rng.range(.55,1.2));});await tick(ctx);
 const shell=stone('#afbc9c','#5f968d'),coral=mat('#77a2a0',.9,.03);
 for(let j=0;j<12;j++){const side=j%2?1:-1,x=side*rng.range(90,200),z=-300+Math.floor(j/2)*125;const o=add(scene,new T.TorusKnotGeometry(rng.range(12,20),4,100,9,2,3),shell,[x,13,z]);o.rotation.set(rng(),rng(),rng());for(let k=0;k<4;k++){const a=k*TAU/4;tube(scene,[[x+Math.cos(a)*10,0,z+Math.sin(a)*10],[x+Math.cos(a)*20,18,z+Math.sin(a)*20],[x+Math.cos(a)*23,28,z+Math.sin(a)*23]],1.1,coral,20,5);}}
 const motes=[];for(let i=0;i<1800;i++)motes.push(rng.range(-350,350),rng.range(0,150),rng.range(-420,420));const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(motes,3));scene.add(new T.Points(pg,new T.PointsMaterial({color:'#adcfc7',size:.25,transparent:true,opacity:.5,depthWrite:false})));
 for(let j=0;j<4;j++){const g=new T.ConeGeometry(32,380,40,1,true),m=shader(`void main(){float a=(1.-vUv.y)*.035;gl_FragColor=vec4(.35,.6,.58,a);}`,{}, {transparent:true,depthWrite:false,blending:T.AdditiveBlending});const ray=add(scene,g,m,[-160+j*100,165,90+j*100]);ray.rotation.z=.2;}
 batch(scene,shell);batch(scene,coral);updates.push(t=>cm.uniforms.uTime.value=t);await tick(ctx);
 return done(b,[[0,25,-350],[-5,28,-220],[4,32,-80],[-4,34,60],[4,32,190],[0,29,320]],{duration:55});
}

export async function pulsarCoast(ctx){
 const b=environment(ctx,'Where the Pulsar Takes the Tide',{sky:'#31465f',horizon:'#d89f8f',accent:'#ffe1ab',fog:.0009});const {scene,rng,updates}=b;
 const rock=stone('#8e8a75','#526c69'),white=mat('#b9b8a4',.94,.03),roof=mat('#9d7059',.9,.03),wood=mat('#72604a',.9,.03),brass=mat('#ad986b',.55,.45);
 const height=(x,z)=>8+18*Math.sin((x+480)/440*Math.PI)*(.8+.2*Math.sin(z*.012))+5*Math.sin(z*.021+x*.014);
 add(scene,surface(90,130,(u,v)=>{const x=-480+u*440,z=-450+v*900;return [x,height(x,z),z];}),rock);
 add(scene,surface(100,8,(u,v)=>{const z=-450+u*900;return[-40,-18+v*(height(-40,z)+18),z];}),rock);
 const ocean=shader(`void main(){vec2 p=vP.xz;float rip=.5+.5*sin(p.x*.075+sin(p.y*.043+uTime*.15))*sin(p.y*.13-uTime*.4);float streak=pow(.5+.5*sin(p.y*.23+sin(p.x*.05)*1.5-uTime*.4),22.);vec3 c=mix(vec3(.035,.12,.17),vec3(.15,.29,.32),rip*.55);c+=vec3(.17,.12,.08)*streak*.28;gl_FragColor=vec4(c,1.);}`);const og=new T.PlaneGeometry(3000,3000);og.rotateX(-Math.PI/2);add(scene,og,ocean,[0,-2,0]);
 const buildings=[];for(let row=0;row<10;row++)for(let col=0;col<3;col++){const x=-80-col*58+rng.range(-6,6),z=-320+row*68,y=height(x,z),h=rng.range(14,25);buildings.push({x,y,z,h});add(scene,new T.BoxGeometry(23,h,25),white,[x,y+h*.5,z]);const r=add(scene,new T.ConeGeometry(20,10,4),roof,[x,y+h+5,z]);r.rotation.y=Math.PI/4;}
 await tick(ctx);
 const windows=mat('#d9bf85',.6,.2,.18),win=[];for(const q of buildings)for(let k=0;k<6;k++)win.push([q.x+12,q.y+5+Math.floor(k/3)*8,q.z+(k%3-1)*6]);inst(scene,new T.BoxGeometry(.3,3.8,2.5),windows,win.length,(o,i)=>o.position.set(...win[i]));
 const lx=-74,lz=45,ly=height(lx,lz);add(scene,new T.CylinderGeometry(9,14,100,32),white,[lx,ly+50,lz]);for(let y=ly+20;y<ly+100;y+=20)ring(scene,12-(y-ly)*.04,.6,brass,[lx,y,lz]);add(scene,new T.CylinderGeometry(14,14,2,32),brass,[lx,ly+100,lz]);const lantern=add(scene,new T.CylinderGeometry(9,9,14,24,1,true),mat('#9bacad',.25,.35,.06),[lx,ly+108,lz]);add(scene,new T.ConeGeometry(15,12,24),roof,[lx,ly+121,lz]);add(scene,new T.SphereGeometry(3,20,12),glow('#ffe3ad'),[lx,ly+108,lz]);
 const beacon=new T.Group();beacon.position.set(lx,ly+108,lz);scene.add(beacon);const bm=shader(`void main(){float edge=1.-abs(vUv.x-.5)*2.;gl_FragColor=vec4(.8,.64,.39,pow(edge,3.)*(1.-vUv.y)*.045);}`,{}, {transparent:true,depthWrite:false,blending:T.AdditiveBlending});const cone=add(beacon,new T.ConeGeometry(36,430,40,1,true),bm,[215,0,0]);cone.rotation.z=Math.PI/2;
 // Long piers, ladders, mooring posts and boats remain alongside the entire route.
 for(let z=-300;z<=320;z+=62){add(scene,new T.BoxGeometry(65,2.1,8),wood,[-22,6,z]);for(let j=0;j<4;j++){const x=-48+j*16;beam(scene,[x,-5,z-3],[x,10,z-3],.7,wood);}const boat=add(scene,new T.SphereGeometry(1,20,12),mat('#476d70',.8,.03),[20,0,z+15],[5,2,12]);beam(scene,[20,1,z+15],[20,14,z+15],.25,wood);}
 const pg=new T.Group();pg.position.set(420,350,1050);pg.rotation.z=.3;scene.add(pg);const pm=shader(`void main(){float band=.5+.5*sin(vP.y*.12+sin(vP.x*.025)*.7);vec3 c=mix(vec3(.35,.34,.43),vec3(.66,.57,.52),band);float light=.4+.6*max(0.,dot(normalize(vN),normalize(vec3(-.5,.4,-1.))));gl_FragColor=vec4(c*light,1.);}`);add(pg,new T.SphereGeometry(130,64,40),pm);const rings=add(pg,new T.RingGeometry(174,245,128,1),shader(`void main(){float r=length(vP.xy);float grain=.65+.35*sin(r*1.8);gl_FragColor=vec4(vec3(.49,.43,.42)*grain,.78);}`,{}, {transparent:true,depthWrite:false}));rings.rotation.x=Math.PI/2-.3;
 const pulse=shader(`void main(){float p=pow(.5+.5*sin(uTime*.85),24.);gl_FragColor=vec4(vec3(.42,.61,.76)*(.7+p*.5),1.);}`);add(scene,new T.SphereGeometry(5,16,12),pulse,[70,205,1250]);
 for(const m of [rock,white,roof,wood,brass])batch(scene,m);await tick(ctx);updates.push(t=>{ocean.uniforms.uTime.value=t;pulse.uniforms.uTime.value=t;beacon.rotation.y=t*.15;});
 return done(b,[[20,28,-350],[20,32,-210],[22,38,-75],[22,42,70],[25,36,205],[25,32,320]],{pois:[{at:(t,u)=>[-90,48,-250+u*620],from:.04,to:.88,weight:.35,fade:.2,steady:true,arc:true}],duration:56});
}

export async function superfluid(ctx){
 const b=environment(ctx,'The Vortex Garden at Absolute Quiet',{sky:'#315666',horizon:'#8ca8ad',accent:'#c1ebf4',fog:.0011});const {scene,rng,updates}=b;
 const walls=stone('#94a5a4','#516f78'),copper=mat('#9b8470',.6,.4),steel=mat('#a2b2b3',.72,.45),ceramic=mat('#d3d3bb',.95,.02);floor(scene,700,1000,-7,walls);
 for(let z=-360;z<=360;z+=80){arch(scene,0,z,160,145,steel);for(const side of [-1,1]){add(scene,new T.BoxGeometry(20,55,44),walls,[side*177,20,z]);for(let j=0;j<3;j++)tube(scene,[[side*(130+j*8),0,z-14],[side*(130+j*8),50+j*4,z-14],[side*(130+j*8),68+j*4,z],[side*(130+j*8),50+j*4,z+14],[side*(130+j*8),0,z+14]],1.4,copper,36,7);}}
 await tick(ctx);
 const liquid=shader(`void main(){vec2 p=vP.xz;float n=F(p*.03);float ripple=.5+.5*sin(p.x*.2+sin(p.y*.1+uTime*.2));vec3 c=mix(vec3(.025,.15,.22),vec3(.16,.32,.38),n);c+=vec3(.08,.13,.14)*ripple*.25;gl_FragColor=vec4(c,1.);}`);const lg=new T.PlaneGeometry(245,820);lg.rotateX(-Math.PI/2);add(scene,lg,liquid,[0,-1,0]);
 const filament=shader(`void main(){float core=.65+.35*sin(vUv.y*55.-uTime*.4);gl_FragColor=vec4(vec3(.3,.62,.76)*core+vec3(.15),1.);}`);filament.vertexShader=`uniform float uTime;varying vec3 vP,vN;varying vec2 vUv;void main(){vec4 p=instanceMatrix*vec4(position,1.);p.x+=1.2*sin(p.y*.08+p.z*.012-uTime*.4);p.z+=1.2*cos(p.y*.08+p.x*.012-uTime*.4);vP=p.xyz;vN=normal;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*p;}`;
 const cores=[];for(let row=0;row<13;row++)for(const x of [-96,-53,53,96])cores.push([x,-300+row*50]);const fgeo=new T.CylinderGeometry(.18,.18,84,6,16);fgeo.translate(0,42,0);inst(scene,fgeo,filament,cores.length,(o,i)=>o.position.set(cores[i][0],1,cores[i][1]));
 const orbiters=inst(scene,new T.SphereGeometry(.65,8,6),glow('#acd6e1'),cores.length*6,(o,i)=>{});
 for(const side of [-1,1])for(let j=0;j<10;j++){const z=-330+j*70;add(scene,new T.BoxGeometry(15,20,36),ceramic,[side*138,4,z]);const dial=add(scene,new T.CylinderGeometry(4,4,.6,20),mat('#233e48',.9,.02),[side*128,12,z]);dial.rotation.z=Math.PI/2;for(let k=0;k<3;k++)add(scene,new T.BoxGeometry(.4,1.2,4),glow('#a2bbc0'),[side*127,6+k*4,z+10]);}
 for(const side of [-1,1])beam(scene,[side*125,9,-400],[side*125,9,400],.7,steel);
 for(const m of [walls,copper,steel,ceramic])batch(scene,m);await tick(ctx);
 updates.push(t=>{liquid.uniforms.uTime.value=t;filament.uniforms.uTime.value=t;for(let i=0;i<cores.length*6;i++){const c=cores[Math.floor(i/6)],k=i%6,r=4+k*1.7,a=t*18/(r*r)+Math.floor(i/6)*.8+k;tmp.position.set(c[0]+Math.cos(a)*r,8+k*11,c[1]+Math.sin(a)*r);tmp.rotation.set(0,0,0);tmp.scale.setScalar(.7);tmp.updateMatrix();orbiters.setMatrixAt(i,tmp.matrix);}orbiters.instanceMatrix.needsUpdate=true;});
 return done(b,[[0,24,-350],[-5,30,-220],[5,38,-85],[-5,45,60],[5,38,195],[0,31,320]],{duration:55});
}
