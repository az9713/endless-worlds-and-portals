import*as S from"three";const N=Math.PI*2,P=-.32,w=16,F=4,I=["AN ATLAS OF RIVERS","THE SHAPE OF RAIN","THE MEMORY OF STONE","A HISTORY OF NIGHT","ON DISTANT SHORES","THE COLOUR OF WINTER","THE BOOK OF TIDES","THE LONG WAY HOME","CITIES OF THE MIND","THE NAMES OF WINDS","THE QUIET OBSERVER","WAYS OF SEEING LIGHT","THE LIFE OF A BRIDGE","A SURVEY OF STARS","THE FOLDING OF TIME","THE UNFINISHED MAP"],L=["#5c2728","#293e43","#3e4b3d","#66503a","#59404a","#34424e","#716047","#37443a"];function u(l,o=l){const a=document.createElement("canvas");return a.width=l,a.height=o,[a,a.getContext("2d",{willReadFrequently:!0})]}function m(l,o,a=!0,e=!0){const t=new S.CanvasTexture(l);return a&&(t.colorSpace=S.SRGBColorSpace),e&&(t.wrapS=t.wrapT=S.RepeatWrapping),t.anisotropy=Math.min(8,o?.capabilities?.getMaxAnisotropy?.()||1),t.needsUpdate=!0,t}function x(l,o,a,e,t=.12,r=.08){for(let c=0;c<e;c++){const n=o()<.65;l.fillStyle=n?`rgba(12,15,18,${o()*t})`:`rgba(255,245,219,${o()*r})`,l.fillRect(o()*a,o()*a,.3+o()*2.2,.3+o()*1.8)}}function k(l,o,a=!1){const[e,t]=u(1024),r=t.createLinearGradient(0,0,0,1024);r.addColorStop(0,a?"#997448":"#5d3827"),r.addColorStop(.35,a?"#b18a55":"#744831"),r.addColorStop(.7,a?"#8a633e":"#4c3025"),r.addColorStop(1,a?"#a8804f":"#68402b"),t.fillStyle=r,t.fillRect(0,0,1024,1024);for(let i=0;i<1400;i++){const f=i/1400*1024;t.strokeStyle=i%4?`rgba(24,13,10,${.04+l()*.12})`:`rgba(231,190,118,${.03+l()*.1})`,t.lineWidth=.3+l()*1.5,t.beginPath();for(let s=0;s<=64;s++){const b=s*16,v=Math.exp(-Math.pow((b-375)/190,2))*Math.sin(f*.022)*12,d=f+Math.sin(b*.008+f*.018)*4+v;s?t.lineTo(b,d):t.moveTo(b,d)}t.stroke()}for(let i=0;i<5;i++){const f=l()*1024,s=l()*1024;for(let b=0;b<18;b++)t.strokeStyle=`rgba(31,18,12,${.12-b*.004})`,t.lineWidth=.7,t.beginPath(),t.ellipse(f,s,9+b*5.3,2+b*.8,.05,0,N),t.stroke()}x(t,l,1024,24e3,.09,.04);const[c,n]=u(1024);return n.drawImage(e,0,0),{map:m(e,o),bumpMap:m(c,o,!1)}}function C(l,o,a=!1){const[e,t]=u(1024);t.fillStyle=a?"#4a5356":"#a8a495",t.fillRect(0,0,1024,1024);for(let r=0;r<8;r++)for(let c=0;c<4;c++){const n=c*256+r%2*128-128,i=Math.floor((a?67:151)+l()*12);t.fillStyle=`rgb(${i+12},${i+9},${i})`,t.fillRect(n+2,r*128+2,252,124),t.fillStyle="rgba(15,24,30,.18)",t.fillRect(n+2,r*128+122,252,4),t.fillStyle="rgba(245,232,201,.17)",t.fillRect(n+2,r*128+2,252,2)}x(t,l,1024,55e3,.15,.1);for(let r=0;r<55;r++){let c=l()*1024,n=l()*1024;t.strokeStyle="rgba(53,58,57,.07)",t.lineWidth=.5+l(),t.beginPath(),t.moveTo(c,n);for(let i=0;i<8;i++)c+=l()*20-10,n+=3+l()*7,t.lineTo(c,n);t.stroke()}return{map:m(e,o),bumpMap:m(e,o,!1)}}function G(l,o){const[a,e]=u(512);e.fillStyle="#b19355",e.fillRect(0,0,512,512);for(let t=0;t<1600;t++){e.strokeStyle=`rgba(${l()<.5?"40,36,23":"251,220,147"},${l()*.12})`;const r=l()*512;e.beginPath(),e.moveTo(0,r),e.lineTo(512,r+l()*.4),e.lineWidth=.2,e.stroke()}for(let t=0;t<90;t++){const r=l()*512,c=l()*512,n=l()*26,i=e.createRadialGradient(r,c,0,r,c,n+1);i.addColorStop(0,"rgba(37,80,62,.1)"),i.addColorStop(1,"rgba(37,80,62,0)"),e.fillStyle=i,e.fillRect(r-n,c-n,n*2,n*2)}return{map:m(a,o),roughnessMap:m(a,o,!1)}}function H(l,o){const[a,e]=u(512);e.fillStyle="#cfc3a5",e.fillRect(0,0,512,512);for(let r=0;r<280;r++)e.fillStyle=`rgba(62,48,30,${.03+l()*.09})`,e.fillRect(0,r/280*512,512,.35+l()*.65);x(e,l,512,12e3,.06,.08);const t=e.createLinearGradient(0,0,512,0);return t.addColorStop(0,"rgba(80,55,22,.18)"),t.addColorStop(.1,"rgba(80,55,22,0)"),t.addColorStop(.9,"rgba(80,55,22,0)"),t.addColorStop(1,"rgba(80,55,22,.2)"),e.fillStyle=t,e.fillRect(0,0,512,512),{map:m(a,o),bumpMap:m(a,o,!1)}}function W(l,o){const[a,e]=u(1024,2048);for(let t=0;t<64;t++){const r=t%w,c=Math.floor(t/w),n=r*64,i=c*512;e.fillStyle=L[t%L.length],e.fillRect(n,i,64,512);const f=e.createLinearGradient(n,i,n+64,i);f.addColorStop(0,"rgba(0,0,0,.5)"),f.addColorStop(.16,"rgba(255,215,155,.06)"),f.addColorStop(.75,"rgba(255,215,155,.01)"),f.addColorStop(1,"rgba(0,0,0,.38)"),e.fillStyle=f,e.fillRect(n,i,64,512),e.strokeStyle="#b69a60",e.lineWidth=.8,e.strokeRect(n+7,i+17,50,478),e.strokeRect(n+10,i+20,44,472);for(const s of[55,68,145,365,438,451])e.fillStyle="#332d26",e.fillRect(n+2,i+s+1,60,5),e.fillStyle="#ac915d",e.fillRect(n+2,i+s,60,2),e.fillStyle="rgba(225,192,112,.5)",e.fillRect(n+3,i+s+2,58,1);e.save(),e.translate(n+37,i+255),e.rotate(-Math.PI/2),e.fillStyle="#c7af79",e.font="bold 14px Georgia",e.textAlign="center",e.fillText(I[t%I.length],0,0),e.font="9px Georgia",e.fillText(`VOLUME ${1+t%12}`,0,15),e.restore(),e.fillStyle="#c0a570",e.font="13px Georgia",e.textAlign="center",e.fillText(["I","II","III","IV","V","VI"][t%6],n+32,i+405);for(let s=0;s<180;s++)e.fillStyle=l()<.5?"rgba(16,18,17,.1)":"rgba(205,173,126,.09)",e.fillRect(n+l()*64,i+l()*512,.5+l()*2.5,.5+l()*7)}return m(a,o)}const j=`
vec3 libP = vLibraryWorld;
vec3 libN = inverseTransformDirection(normal, viewMatrix);
if (libP.y < -0.32) { libP.y = -0.64 - libP.y; libN.y *= -1.; }
vec3 libV = normalize(cameraPosition - vLibraryWorld);
float bay = floor((libP.z - 140.) / 60. + .5) * 60. + 140.;
vec3 libLight = vec3(.28,.235,.185) + vec3(.055,.09,.13)*max(libN.y,0.);
vec3 libSpec = vec3(0.);
for (int j = -1; j <= 1; j++) {
  float z = bay + float(j) * 60.;
  for (int k = 0; k < 2; k++) {
    float side = k == 0 ? -1. : 1.;
    vec3 d = vec3(side * 22.5, 10.8, z) - libP;
    float d2 = dot(d,d); vec3 L = normalize(d);
    float gain = 10. / (1. + d2 * .095);
    vec3 warm = vec3(1., .59, .28);
    libLight += warm * gain * (.09 + .91 * max(dot(libN,L),0.));
    libSpec += warm * gain * pow(max(0.,dot(reflect(-L,libN),libV)), 42.) * .2;
    vec3 wd = vec3(side * 32., 41., z) - libP;
    float w2 = dot(wd,wd);
    libLight += vec3(.19,.4,.63) * 1.7 / (1. + w2 * .012) * (.15 + .85 * max(dot(libN, normalize(wd)),0.));
  }
}
float cz = floor((libP.z - 80.) / 120. + .5) * 120. + 80.;
for (int j = -1; j <= 1; j++) {
  vec3 d = vec3(0.,22.,cz + float(j)*120.) - libP;
  float d2=dot(d,d);vec3 L=normalize(d);
  float gain=16./(1.+d2*.045);
  libLight += vec3(1.,.64,.32)*gain*(.12+.88*max(dot(libN,L),0.));
  libSpec += vec3(1.,.68,.38)*gain*pow(max(0.,dot(reflect(-L,libN),libV)),55.)*.18;
}
float waterReach=exp(-max(libP.y,0.)*.075)*exp(-abs(libP.x)*.024);
float ca=sin(libP.x*.78+sin(libP.z*.22+uLibraryTime*.22))*sin(libP.z*.71+sin(libP.x*.35-uLibraryTime*.27));
float caustic=pow(max(0.,1.-abs(ca)*4.),5.)*waterReach;
libLight += vec3(.1,.24,.23)*caustic*.4;
float edgeAO=.78+.22*smoothstep(0.,1.2,abs(libP.x)-10.2);
reflectedLight.directDiffuse += diffuseColor.rgb * libLight * edgeAO * .88;
reflectedLight.directSpecular += libSpec * (1.0-roughnessFactor) * .42;
`;function y(l,o,a){return l.onBeforeCompile=e=>{e.uniforms.uLibraryTime=o,e.vertexShader=`varying vec3 vLibraryWorld;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace("#include <project_vertex>",`
#include <project_vertex>
vec4 lp = vec4(transformed,1.);
#ifdef USE_INSTANCING
lp = instanceMatrix * lp;
#endif
vLibraryWorld=(modelMatrix*lp).xyz;
`),e.fragmentShader=`varying vec3 vLibraryWorld; uniform float uLibraryTime;
`+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
`+j),a&&a(e)},l.customProgramCacheKey=()=>"river-library-v3-"+(a?a.tag:"surface"),l}function A(l){const o=a=>{a.vertexShader=`attribute float aBookCell; varying float vBookCell;
`+a.vertexShader,a.vertexShader=a.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vBookCell=aBookCell;`),a.fragmentShader=`varying float vBookCell;
`+a.fragmentShader,a.fragmentShader=a.fragmentShader.replace("#include <map_fragment>",`
#ifdef USE_MAP
  float ci=floor(vBookCell+.5); vec2 off=vec2(mod(ci,16.),floor(ci/16.));
  vec2 buv=${l==="cover"?"vec2(.5,.91)":"clamp(vMapUv,vec2(.006),vec2(.994))"};
  vec4 texelColor=texture2D(map,(buv+off)/vec2(16.,4.));
  diffuseColor*=texelColor;
#endif
`)};return o.tag="book-"+l,o}async function R(l){const o=l.rng.fork("river-library-surfaces"),a=l.renderer,e={value:0},t=new Set,r=p=>{for(const E of Object.values(p))E?.isTexture&&t.add(E);return p},c=r(k(o,a));await l.yield();const n=r(k(o,a,!0));await l.yield();const i=r(C(o,a));await l.yield();const f=r(C(o,a,!0));await l.yield();const s=r(G(o,a)),b=r(H(o,a));await l.yield();const v=W(o,a);t.add(v),await l.yield();const d=p=>y(new S.MeshStandardMaterial(p),e),T={wood:d({...c,color:"#ffffff",roughness:.62,bumpScale:.065,metalness:.04}),oak:d({...n,color:"#ffffff",roughness:.56,bumpScale:.055,metalness:.04}),stone:d({...i,color:"#e4e3d8",roughness:.86,bumpScale:.11,metalness:0}),slate:d({...f,color:"#cad3cf",roughness:.47,bumpScale:.06,metalness:.08}),brass:d({...s,color:"#f2dba2",roughness:.35,metalness:.57}),iron:d({color:"#34434a",roughness:.65,metalness:.45}),pages:d({...b,color:"#e1d8bf",roughness:.9,bumpScale:.017,metalness:0}),dark:d({color:"#131a20",roughness:.95,metalness:0}),velvet:d({color:"#55454a",roughness:.97,metalness:0}),spine:y(new S.MeshStandardMaterial({map:v,roughness:.65,metalness:.07}),e,A("spine")),cover:y(new S.MeshStandardMaterial({map:v,roughness:.71,metalness:.04}),e,A("cover")),flame:new S.MeshBasicMaterial({color:"#ffcf84",toneMapped:!1}),glass:new S.MeshStandardMaterial({color:"#e5cd96",emissive:"#f5c680",emissiveIntensity:.24,metalness:.2,roughness:.18,transparent:!0,opacity:.3,depthWrite:!1}),crystal:new S.MeshStandardMaterial({color:"#b4d0d1",emissive:"#729698",emissiveIntensity:.12,metalness:.4,roughness:.12,transparent:!0,opacity:.58,depthWrite:!1})},[O,g]=u(1024);g.fillStyle="#ded2b4",g.fillRect(0,0,1024,1024),g.strokeStyle="#99825e",g.lineWidth=2,g.strokeRect(45,45,934,934),g.fillStyle="#574e3e",g.font="italic 35px Georgia",g.textAlign="center",g.fillText("The Library of Rivers",512,112),g.font="20px Georgia",g.textAlign="left";const M=["Every river remembers the mountains it has left behind.","The books crossed the water long before the first bridge.","A page is a shore, and a sentence another way to arrive.","At night the lamps make small constellations in the current."];for(let p=0;p<30;p++)g.fillText(M[p%M.length],90,165+p*24);const h=m(O,a);return t.add(h),T.letterpress=d({map:h,color:"#f2e8cb",roughness:.85,metalness:0,bumpMap:h,bumpScale:.008,side:S.DoubleSide}),{...T,time:e,maps:t,WATER_Y:P,light:p=>y(p,e)}}export{R as makeLibraryMaterials};
