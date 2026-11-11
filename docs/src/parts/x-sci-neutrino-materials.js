import*as e from"three";const o=`
uniform float uTime, uEvent;
const float PI = 3.14159265359;
const float CY = 86.0;
const float RAD = 76.0;
float hash21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float hash31(vec3 p){ p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z); }
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){return .57*noise3(p)+.28*noise3(p*2.07+13.7)+.15*noise3(p*4.13-9.1);}
float caustic(vec3 p){vec2 q=p.xz*.16+vec2(uTime*.025,-uTime*.018);
 float a=abs(sin(q.x+sin(q.y*1.37))*.65+sin(q.y*1.21-sin(q.x*.83))*.5);
 float b=abs(sin(q.x*.73-q.y*.48+uTime*.035)+sin(q.y*.91+q.x*.38));
 return exp(-a*23.)*.65+exp(-b*28.)*.35;}
vec3 attenuateWater(vec3 c,float d){vec3 extinction=exp(-d*vec3(.012,.006,.0038));
 return c*extinction+vec3(.007,.026,.043)*(1.-extinction);}
// A ray hits the same cylindrical room that contains the meshes. Its reflected
// panel cadence, maintenance lights and dark rubber rows therefore move with the
// eye instead of behaving like painted highlights.
vec3 roomEnvironment(vec3 p,vec3 r,float rough){
 float rayLength2=dot(r,r);if(rayLength2<.00001)return vec3(.007,.026,.043);r*=inversesqrt(rayLength2);
 vec2 q=p.xy-vec2(0.,CY);float aa=dot(r.xy,r.xy),bb=dot(q,r.xy);
 float cc=dot(q,q)-RAD*RAD,det=max(bb*bb-aa*cc,0.);
 float d=aa>.0001?max((-bb+sqrt(det))/aa,0.):450.;
 d=min(d,850.);vec3 h=p+r*d;float angle=atan(h.y-CY,h.x);
 vec2 grid=vec2((angle/6.283185+.5)*60.,(h.z+228.)/9.5);
 vec2 cell=fract(grid)-.5;float eye=1.-smoothstep(.28,.45,length(cell*vec2(1.,.9)));
 float footprint=max(length(dFdx(grid)),length(dFdy(grid)));
 float resolved=1.-smoothstep(.12,.6,footprint);eye=mix(.46,eye,resolved);
 float sharpness=1.-smoothstep(.16,.50,rough);
 vec3 pattern=mix(vec3(.025,.05,.065),vec3(.23,.17,.085),eye);
 vec3 c=mix(vec3(.105,.12,.13),pattern,sharpness);
 float zLight=abs(fract((h.z+224.)/64.)-.5)*64.;
 float warm=exp(-pow((abs(h.x)-55.)/(5.+rough*22.),2.)-pow((h.y-131.)/(3.4+rough*14.),2.));
 warm*=exp(-zLight*zLight/20.);
 float blue=exp(-pow(h.x/38.,2.))*smoothstep(125.,159.,h.y);
 c+=vec3(2.6,1.12,.34)*warm*(1.-rough*.5)+vec3(.12,.34,.6)*blue;
 vec3 closeLamp=vec3(-57.,99.,-127.)-p;float dl=length(cross(normalize(r),closeLamp));
 c+=vec3(1.6,.85,.32)*exp(-dl*dl/(7.+rough*rough*80.))*step(0.,dot(r,closeLamp));
 closeLamp=vec3(43.,117.,136.)-p;dl=length(cross(normalize(r),closeLamp));
 c+=vec3(1.6,.85,.32)*exp(-dl*dl/(7.+rough*rough*80.))*step(0.,dot(r,closeLamp));
 float eventDistance=length(cross(normalize(r),vec3(0.,86.,15.)-p));
 c+=vec3(.14,.55,1.2)*uEvent*exp(-eventDistance*eventDistance/220.);
 if(h.z>225.)c+=vec3(.12,.31,.35)*exp(-pow(length(h.xy-vec2(0.,86.))-10.,2.)/8.);
 c=mix(c,vec3(.08,.14,.18),rough*rough*.7);
 return attenuateWater(c,d*.22);
}
vec3 schlick(vec3 f0,float cosTheta){return f0+(1.-f0)*pow(1.-cosTheta,5.);}
vec3 brdf(vec3 p,vec3 n,vec3 v,vec3 lp,vec3 energy,vec3 albedo,vec3 f0,float rough,float metal){
 vec3 delta=lp-p;float d2=max(dot(delta,delta),.01);vec3 l=delta*inversesqrt(d2),hv=l+v,h=hv*inversesqrt(max(dot(hv,hv),.000001));
 float nl=max(dot(n,l),0.),nv=max(dot(n,v),.025),nh=max(dot(n,h),0.),vh=max(dot(v,h),0.);
 float a=max(rough*rough,.035),a2=a*a,den=nh*nh*(a2-1.)+1.;
 float D=a2/max(PI*den*den,.0001),k=(rough+1.);k=k*k*.125;
 float G=nv/(nv*(1.-k)+k)*nl/max(nl*(1.-k)+k,.0001);
 vec3 F=schlick(f0,vh);vec3 spec=D*G*F/max(4.*nv*nl,.01);
 vec3 diffuse=(1.-F)*(1.-metal)*albedo/PI;
 return (diffuse+spec)*energy*nl/(1.+d2/125.);
}
vec3 roomLight(vec3 p,vec3 n,vec3 v,vec3 albedo,vec3 f0,float rough,float metal,float ao){
 float up=.5+.5*n.y;vec3 amb=mix(vec3(.04,.075,.10),vec3(.15,.23,.29),up);
 vec3 c=albedo*amb*(1.-metal*.75)*ao;
 float bay=floor((p.z+224.)/64.)*64.-192.;
 for(int j=-1;j<=1;j++){float z=bay+float(j)*64.;
   c+=brdf(p,n,v,vec3(-55.,131.,z),vec3(6.2,3.3,1.25),albedo,f0,rough,metal)*ao;
   c+=brdf(p,n,v,vec3(55.,131.,z),vec3(6.2,3.3,1.25),albedo,f0,rough,metal)*ao;
 }
 c+=brdf(p,n,v,vec3(-20.,157.,40.),vec3(.8,1.8,2.5),albedo,f0,max(rough,.3),metal)*.8;
 c+=brdf(p,n,v,vec3(-57.,99.,-127.),vec3(6.4,3.6,1.45),albedo,f0,max(rough,.3),metal)*ao;
 c+=brdf(p,n,v,vec3(43.,117.,136.),vec3(6.4,3.6,1.45),albedo,f0,max(rough,.3),metal)*ao;
 c+=albedo*vec3(.075,.15,.20)*(.25+.75*max(dot(n,normalize(vec3(-.2,1.,-.1))),0.))*(1.-metal*.7)*ao;
 float fres=pow(1.-max(dot(n,v),0.),5.);vec3 env=roomEnvironment(p,reflect(-v,n),rough);
 c+=env*(f0+(1.-f0)*fres)*(1.-rough*.45)*ao;
 float causticPool=max(exp(-pow((p.z+145.)/48.,2.)),max(exp(-pow((p.z-20.)/52.,2.)),exp(-pow((p.z-160.)/48.,2.))));
 c+=albedo*vec3(.015,.055,.085)*caustic(p)*(.2+.8*max(n.y,0.))*(.25+.75*causticPool)*ao;
 vec3 ed=vec3(0.,86.,15.)-p;float e2=dot(ed,ed);
 c+=albedo*vec3(.08,.45,.82)*uEvent*(.25+.75*max(dot(n,normalize(ed)),0.))/(1.+e2/650.);
 return c;
}
vec3 perturbNormal(vec3 p,vec3 n,float height){
 vec3 q0=dFdx(p),q1=dFdy(p),s0=cross(q1,n),s1=cross(n,q0);float det=dot(q0,s0);
 return normalize(n-sign(det)*(dFdx(height)*s0+dFdy(height)*s1)/max(abs(det),.00001));
}
`,n=`
attribute vec3 aMat,aTint;
varying vec3 vWorld,vNormal,vLocal,vMat,vTint;
varying vec2 vUv;
varying float vVariant;
#ifdef USE_INSTANCING
attribute float aVariant;
#endif
void main(){vec4 p=vec4(position,1.);vec3 n=normal;
#ifdef USE_INSTANCING
 p=instanceMatrix*p;n=mat3(instanceMatrix)*n;vVariant=aVariant;
#else
 vVariant=0.;
#endif
 vec4 w=modelMatrix*p;vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*n);
 vLocal=position;vUv=uv;vMat=aMat;vTint=aTint;
 gl_Position=projectionMatrix*viewMatrix*w;
}`,v=`
varying vec3 vWorld,vNormal,vLocal,vMat,vTint;varying vec2 vUv;varying float vVariant;
uniform sampler2D uAtlas;
${o}
void main(){
 vec3 p=vWorld,n=normalize(vNormal),v=normalize(cameraPosition-p);if(!gl_FrontFacing)n=-n;
 float kind=vMat.x,rough=vMat.y,ao=vMat.z,metal=0.;vec3 base=vTint,f0=vec3(.04);
 float pixel=max(length(dFdx(p)),length(dFdy(p)));
 float detail=1.-smoothstep(.055,.28,pixel);
 float grain=noise3(vLocal*7.3+vVariant*7.1),mottle=fbm(vLocal*.73+vVariant*3.);
 float scratch=pow(.5+.5*sin(vLocal.z*126.+noise3(vLocal*.8)*13.),24.)*detail;
 float oxide=smoothstep(.58,.82,fbm(p*.18+vec3(vVariant*3.)));
 float micro=(grain-.5)*.00085*detail;
 if(kind<.5){base*=.74+.22*mottle;rough=.88;micro*=1.8;ao*=.8;}
 else if(kind<1.5){metal=.78;f0=vec3(.52,.58,.59);base*=.8+.18*mottle;base=mix(base,vec3(.105,.13,.135),oxide*.16);rough=clamp(rough+oxide*.16+scratch*.025,.25,.9);}
 else if(kind<2.5){metal=.92;f0=vec3(.88,.6,.22);base*=.82+.16*mottle;rough=clamp(rough+scratch*.035,.22,.7);float radial=length(vLocal.xz);float rings=pow(.5+.5*cos(radial*43.),20.);micro+=rings*.00045*detail;}
 else if(kind<3.5){metal=.8;f0=vec3(.71,.37,.18);base=mix(base,vec3(.09,.21,.2),oxide*.42);rough+=oxide*.2;}
 else if(kind<4.5){base*=.86+.1*mottle;rough=.71;}
 else if(kind<5.5){vec3 c=base*(2.3+.12*sin(uTime*1.7+vWorld.z));gl_FragColor=vec4(attenuateWater(c,length(cameraPosition-p)),1.);return;}
 else if(kind<6.5){float stripe=step(.48,fract((p.x+p.z+p.y)*.29));base=mix(vec3(.045,.065,.066),vec3(.62,.43,.12),stripe);base*=.8+.2*mottle;rough=.83;}
 else if(kind<7.5){metal=.93;f0=vec3(.7,.74,.76);rough=.19+scratch*.04;}
 else if(kind<8.5){vec2 cell=abs(fract(p.xz*.53)-.5);if(max(cell.x,cell.y)<.31)discard;metal=.68;f0=vec3(.43,.49,.5);rough=.63;ao*=.75;}
 else if(kind<9.5){vec4 tex=texture2D(uAtlas,vUv);base=tex.rgb;rough=.84;ao*=.86;}
 else{vec3 c=base*1.35;gl_FragColor=vec4(attenuateWater(c,length(cameraPosition-p)),1.);return;}
 base=mix(base,base*.55,oxide*.12);n=perturbNormal(p,n,micro);
 vec3 c=roomLight(p,n,v,base,f0,rough,metal,ao);
 if(kind>8.5&&kind<9.5)c+=base*.15;
 gl_FragColor=vec4(attenuateWater(c,length(cameraPosition-p)),1.);
}`,c=`
varying vec3 vWorld,vNormal,vLocal;varying vec2 vUv;varying float vVariant;
attribute float aVariant;
void main(){vec4 p=instanceMatrix*vec4(position,1.);vec4 w=modelMatrix*p;
 vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);
 vLocal=position;vUv=uv;vVariant=aVariant;gl_Position=projectionMatrix*viewMatrix*w;
}`,l=`
varying vec3 vWorld,vNormal,vLocal;varying vec2 vUv;varying float vVariant;
${o}
void main(){vec3 p=vWorld,n=normalize(vNormal),v=normalize(cameraPosition-p);
 float dist=length(cameraPosition-p),nv=max(dot(n,v),0.);
 float micro=noise3(vLocal*18.+vVariant)*.00018;n=perturbNormal(p,n,micro);
 float F=.027+.973*pow(1.-nv,5.);vec3 reflection=roomEnvironment(p,reflect(-v,n),.095);
 float edge=.5+.5*cos(length(vLocal.xz)*76.);float film=pow(1.-nv,2.);
 vec3 amber=vec3(.25,.18,.055)*(film*.23+.04);
 vec3 c=reflection*(.75+F*.5)+amber+vec3(.04,.11,.14)*caustic(p)*.08;
 float alpha=.10+F*.77+edge*.012;
 // The near-normal dome stays transparent so its modeled dynodes remain visible.
 c=attenuateWater(c,dist);alpha*=exp(-dist*.0015);
 gl_FragColor=vec4(c,clamp(alpha,.045,.9));
}`;function s(a){const t={uTime:{value:0},uEvent:{value:0},uAtlas:{value:a}},r=new e.ShaderMaterial({uniforms:t,vertexShader:n,fragmentShader:v,side:e.DoubleSide}),i=new e.ShaderMaterial({uniforms:t,vertexShader:c,fragmentShader:l,transparent:!0,depthWrite:!1,side:e.FrontSide});return{uniforms:t,opaque:r,glass:i}}function d(a){const t=new e.ShaderMaterial({uniforms:a,vertexShader:"uniform float uTime;varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);w.y+=sin(w.x*.23+uTime*.09)*.18+sin(w.z*.19-uTime*.07)*.12;vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",fragmentShader:`varying vec3 vWorld;${o}
 void main(){vec3 p=vWorld,v=normalize(cameraPosition-p);float t=uTime*.09;
 vec3 n=normalize(vec3(.035*cos(p.x*.23+t)+.019*sin(p.z*.31-t),-1.,.027*sin(p.z*.19+t)));
 float f=.02+.98*pow(1.-max(dot(n,v),0.),5.);vec3 r=reflect(-v,n),tr=refract(-v,n,1.333);
 float tir=1.-step(.001,dot(tr,tr));vec3 c=roomEnvironment(p,r,.32)*(f+tir*(1.-f));
 c+=roomEnvironment(p,tr,.45)*(1.-f)*(1.-tir)*vec3(.75,.88,.94);c+=vec3(.012,.035,.044);
 gl_FragColor=vec4(attenuateWater(c,length(cameraPosition-p)),.85);}`,transparent:!0,depthWrite:!1,side:e.DoubleSide});return t.renderOrder=3,t}function m(a){return new e.ShaderMaterial({uniforms:a,vertexShader:"varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",fragmentShader:`varying vec2 vUv;varying vec3 vWorld;${o}
void main(){float edge=pow(max(0.,1.-abs(vUv.x-.5)*2.),3.);float lengthFade=sin(clamp(vUv.y,0.,1.)*PI);float drift=.7+.3*noise3(vec3(vWorld.xz*.06,uTime*.05));float alpha=edge*lengthFade*drift*.025;alpha*=exp(-length(cameraPosition-vWorld)*.006);gl_FragColor=vec4(.18,.41,.58,alpha);}`,transparent:!0,depthWrite:!1,side:e.DoubleSide,blending:e.AdditiveBlending})}function f(a){return new e.ShaderMaterial({uniforms:a,vertexShader:"varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",fragmentShader:`varying vec2 vUv;varying vec3 vWorld;${o}
void main(){float wave=pow(.5+.5*cos(vUv.y*73.-uTime*.7),22.);float envelope=sin(clamp(vUv.y,0.,1.)*PI);float alpha=uEvent*(.025+wave*.085)*envelope;vec3 c=attenuateWater(vec3(.11,.55,1.05),length(cameraPosition-vWorld));gl_FragColor=vec4(c,alpha);}`,transparent:!0,depthWrite:!1,side:e.DoubleSide,blending:e.AdditiveBlending})}export{o as DETECTOR_GLSL,s as createDetectorMaterials,f as createEventMaterial,m as createShaftMaterial,d as createWaterInterface};
