import*as e from"three";function S(s,a,r=-.32){const t=new e.Group;t.name="actual-planar-reflection-of-the-library";for(const o of[s,a])t.add(o.clone(!0));return t.scale.y=-1,t.position.y=r*2,t.traverse(o=>{o.isMesh&&(o.castShadow=!1,o.receiveShadow=!1)}),t}function T(s,a=-.32){const r=new e.ShaderMaterial({transparent:!0,depthWrite:!1,side:e.DoubleSide,uniforms:{uTime:s},vertexShader:`
      uniform float uTime;varying vec3 vW;
      void main(){vec3 p=position;
        p.z+=.016*sin(p.x*.9+uTime*.27)*sin(p.y*.24-uTime*.14)+.007*sin(p.y*2.4+uTime*.4);
        vW=(modelMatrix*vec4(p,1.)).xyz;
        gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);
      }`,fragmentShader:`
      uniform float uTime;varying vec3 vW;
      float wave(vec2 p){return sin(p.x*.94+sin(p.y*.17-uTime*.13))*sin(p.y*.31+uTime*.21)*.42+sin(p.x*2.3-p.y*.85+uTime*.36)*.11;}
      void main(){
        vec2 p=vW.xz;float w=wave(p);
        vec3 n=normalize(vec3((w-wave(p+vec2(.06,0.)))*.42,1.,(w-wave(p+vec2(0.,.06)))*.42));
        vec3 v=normalize(cameraPosition-vW);
        float fresnel=pow(1.-max(.0,dot(v,n)),4.);
        vec3 color=vec3(.018,.052,.058);
        // Fine colored interference follows slow ripples without turning into a neon grid.
        float ca=pow(max(.0,1.-abs(wave(p*.71+vec2(4.,3.)))*6.),7.);
        color+=vec3(.025,.09,.085)*ca*.18;
        float cz=floor((p.y-80.)/120.+.5)*120.+80.;
        for(int j=-1;j<=1;j++){
          vec3 L=normalize(vec3(0.,22.,cz+float(j)*120.)-vW);
          float spec=pow(max(0.,dot(reflect(-L,n),v)),230.);
          color+=vec3(.42,.24,.09)*spec;
        }
        float edge=smoothstep(8.4,9.7,abs(p.x));
        color=mix(color,vec3(.012,.035,.038),edge*.4);
        // True architecture lies below this surface and supplies the image. The tint is a thin optical film.
        gl_FragColor=vec4(color,.12+.19*(1.-fresnel)+edge*.08);
      }`}),t=new e.Mesh(new e.PlaneGeometry(19.6,664,64,320),r);return t.position.set(0,a,-102),t.rotation.x=-Math.PI/2,t.renderOrder=3,t.name="thin-fresnel-film-over-real-reflected-architecture",{mesh:t,material:r}}function z(s,a){const r=new e.Group,t=s.rng.fork("river-library-atmosphere"),o=new e.ShaderMaterial({uniforms:{uTime:a},transparent:!0,depthWrite:!1,side:e.DoubleSide,blending:e.AdditiveBlending,vertexShader:"varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}",fragmentShader:"varying vec2 vUv;varying vec3 vW;uniform float uTime;void main(){float side=pow(max(0.,1.-abs(vUv.x-.5)*2.),3.);float ends=sin(vUv.y*3.14159265);float dust=.83+.17*sin(vW.z*1.4+vW.y*2.+uTime*.13);gl_FragColor=vec4(vec3(.23,.36,.43),side*ends*dust*.026);}"});for(const i of[110,-10,-130,-250,-370])for(const h of[-1,1]){const f=[new e.Vector3(h*31,43,i),new e.Vector3(-h*4,1,i-25)],w=f[1].clone().sub(f[0]),x=w.length(),b=f[0].clone().add(f[1]).multiplyScalar(.5),p=new e.Group;p.position.copy(b),p.quaternion.setFromUnitVectors(new e.Vector3(0,1,0),w.normalize());for(let m=0;m<3;m++){const y=new e.Mesh(new e.PlaneGeometry(10,x,1,1),o);y.rotation.y=m/3*Math.PI,p.add(y)}r.add(p)}const n=1800,c=new Float32Array(n*3),v=new Float32Array(n),d=new Float32Array(n);for(let i=0;i<n;i++)c[i*3]=t.range(-30,30),c[i*3+1]=t.range(1,50),c[i*3+2]=t.range(-430,230),v[i]=t.range(.015,.055),d[i]=t()*6.28;const l=new e.BufferGeometry;l.setAttribute("position",new e.BufferAttribute(c,3)),l.setAttribute("aSize",new e.BufferAttribute(v,1)),l.setAttribute("aPhase",new e.BufferAttribute(d,1));const u=new e.ShaderMaterial({uniforms:{uTime:a},transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,vertexShader:"uniform float uTime;attribute float aSize,aPhase;varying float vA;void main(){vec3 p=position;p.x+=sin(uTime*.09+aPhase)*.16;p.y+=sin(uTime*.12+aPhase)*.2;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*650./max(1.,-mv.z),.6,2.4);float bay=floor((p.z-140.)/60.+.5)*60.+140.;float d=min(length(p-vec3(-22.5,10.8,bay)),length(p-vec3(22.5,10.8,bay)));vA=.08+.33*exp(-d*.05);}",fragmentShader:"varying float vA;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(.7,.59,.39),vA*(1.-smoothstep(.15,.5,r)));}"}),g=new e.Points(l,u);return g.frustumCulled=!1,r.add(g),{root:r,shaftMat:o,dustMat:u}}function M(){const s=[];for(let r=0;r<6;r++){const t=document.createElement("canvas");t.width=t.height=256;const o=t.getContext("2d"),n=o.createLinearGradient(0,0,0,256);n.addColorStop(0,"#263947"),n.addColorStop(.5,"#3d3830"),n.addColorStop(1,"#182b32"),o.fillStyle=n,o.fillRect(0,0,256,256);for(let c=0;c<5;c++){const v=22+c*52,d=r===2?65:135,l=o.createRadialGradient(v,d,1,v,d,25);l.addColorStop(0,"rgba(225,172,87,.62)"),l.addColorStop(.2,"rgba(156,107,49,.3)"),l.addColorStop(1,"rgba(125,87,51,0)"),o.fillStyle=l,o.fillRect(v-25,d-25,50,50),r!==3&&(o.fillStyle="rgba(85,132,163,.3)",o.fillRect(v-7,15,14,65),o.fillStyle="rgba(154,184,192,.15)",o.fillRect(v-1,15,1,65))}s.push(t)}const a=new e.CubeTexture(s);return a.colorSpace=e.SRGBColorSpace,a.needsUpdate=!0,a}export{z as makeLibraryAtmosphere,M as makeLibraryEnvironment,S as makeLibraryReflection,T as makeLibraryWater};
