import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type SceneKind =
  "sculpture" | "product" | "orbital" | "particles" | "orb";
/** Real-time original geometry. Contexts exist only while the scene is near the viewport. */
export function ArtCanvas({
  kind = "sculpture",
  className = "",
  intensity = 0.12,
}: {
  kind?: SceneKind;
  className?: string;
  intensity?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const amplitude = useRef(intensity);
  useEffect(() => {
    amplitude.current = intensity;
  }, [intensity]);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = host.current;
    if (!el || !visible) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    setFailed(false);
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, innerWidth < 768 ? 1.25 : 1.6),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.4);
    const generator = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    generator.dispose();
    const group = new THREE.Group();
    scene.add(group);
    const silver = new THREE.MeshPhysicalMaterial({
      color: "#aab3a6",
      metalness: 1,
      roughness: 0.19,
      clearcoat: 1,
    });
    const lime = new THREE.MeshPhysicalMaterial({
      color: "#c6ff42",
      metalness: 0.35,
      roughness: 0.24,
      clearcoat: 1,
    });
    const dark = new THREE.MeshPhysicalMaterial({
      color: "#121815",
      metalness: 0.8,
      roughness: 0.25,
    });
    const light = new THREE.DirectionalLight("#e7fff1", 5);
    light.position.set(4, 5, 3);
    scene.add(light);
    const rim = new THREE.DirectionalLight("#bbc4ff", 3);
    rim.position.set(-3, 0, -2);
    scene.add(rim);
    let points: THREE.Points | undefined;
    let shader: THREE.ShaderMaterial | undefined;
    if (kind === "sculpture") {
      for (let i = 0; i < 17; i++) {
        const t = i / 16;
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(
            1.05 + Math.sin(t * Math.PI) * 0.26,
            0.105,
            12,
            80,
          ),
          i === 8 ? lime : silver,
        );
        mesh.position.y = (t - 0.5) * 2.9;
        mesh.rotation.x = Math.PI / 2 + Math.sin(t * Math.PI * 2) * 0.3;
        mesh.rotation.y = Math.sin(t * Math.PI) * 0.4;
        mesh.position.x = Math.sin(t * Math.PI * 2) * 0.26;
        group.add(mesh);
      }
      group.rotation.set(0.25, 0, -0.5);
    } else if (kind === "product") {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 2.5, 64),
        silver,
      );
      group.add(body);
      const top = new THREE.Mesh(
        new THREE.TorusGeometry(0.61, 0.045, 12, 60),
        dark,
      );
      top.rotation.x = Math.PI / 2;
      top.position.y = 1.27;
      group.add(top);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.56, 0.18, 48),
        dark,
      );
      cap.position.y = 1.35;
      group.add(cap);
      for (let i = 0; i < 12; i++) {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.727, 0.012, 6, 64),
          i % 3 === 0 ? lime : dark,
        );
        band.rotation.x = Math.PI / 2;
        band.position.y = -0.7 + i * 0.08;
        group.add(band);
      }
      const mark = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.21, 0.04, 64, 8, 2, 3),
        lime,
      );
      mark.position.set(0, 0.5, 0.72);
      group.add(mark);
      group.rotation.z = -0.3;
    } else if (kind === "orbital") {
      for (let i = 0; i < 7; i++) {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.65 + i * 0.19, 0.07, 12, 100),
          i % 3 === 0 ? lime : silver,
        );
        mesh.rotation.set(i * 0.3, i * 0.45, i * 0.15);
        group.add(mesh);
      }
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 2), dark));
    } else if (kind === "particles") {
      // Deterministic volumetric ribbons: scatter across filaments, not a line strip.
      const count = 12000;
      const data = new Float32Array(count * 3);
      const noise = (n: number) => {
        const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
        return v - Math.floor(v);
      };
      for (let i = 0; i < count; i++) {
        const u = noise(i + 1);
        const filament = i % 5;
        const t = u * Math.PI * 5 + filament * 1.256;
        const spread = (noise(i + 9) - 0.5) * 0.34;
        const r = 0.85 + 0.6 * Math.sin(u * Math.PI) + spread;
        data[i * 3] = Math.cos(t) * r;
        data[i * 3 + 1] = (u - 0.5) * 3.5 + (noise(i + 17) - 0.5) * 0.3;
        data[i * 3 + 2] = Math.sin(t) * r;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(data, 3));
      shader = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `uniform float uTime; varying float vGlow; void main(){ vec3 p=position; float a=sin(p.y*2.0+uTime)*0.45; mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a)); p.xz=r*p.xz; p.x+=sin(p.y*3.0+uTime)*0.25; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(10.+8.*sin(position.y*4.+uTime))/-mv.z; vGlow=0.5+0.5*sin(position.y*4.+uTime); }`,
        fragmentShader: `varying float vGlow; void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;gl_FragColor=vec4(mix(vec3(0.35,0.5,1.),vec3(0.8,1.,0.35),vGlow),pow(1.-d*2.,1.4)*0.8);}`,
      });
      points = new THREE.Points(geometry, shader);
      group.add(points);
      group.rotation.z = 0.55;
    } else {
      shader = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude.current },
        },
        vertexShader: `uniform float uTime; uniform float uAmplitude; varying vec3 vNormal; varying float vWave; void main(){float w=sin(position.x*8.+uTime)*sin(position.y*7.-uTime*0.8)*sin(position.z*6.+uTime*0.4);vWave=w;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*w*uAmplitude,1.);}`,
        fragmentShader: `varying vec3 vNormal;varying float vWave;void main(){float light=dot(normalize(vNormal),normalize(vec3(-0.5,0.8,1.)))*0.5+0.5;float rim=pow(1.-abs(vNormal.z),2.);vec3 color=mix(vec3(0.15,0.06,0.025),vec3(1.,0.66,0.4),light);color+=rim*vec3(1.,0.65,0.4);color*=0.8+vWave*0.3;gl_FragColor=vec4(color,1.);}`,
      });
      group.add(new THREE.Mesh(new THREE.SphereGeometry(1.45, 96, 64), shader));
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.8, 0.008, 6, 120),
        silver,
      );
      ring.rotation.x = 1.2;
      group.add(ring);
    }
    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let time = 0;
    let last = 0;
    let pointerX = 0;
    let pointerY = 0;
    const pointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width - 0.5) * 0.3;
      pointerY = ((e.clientY - r.top) / r.height - 0.5) * 0.2;
    };
    el.addEventListener("pointermove", pointer);
    const render = (now: number) => {
      if (!document.hidden && (now - last > 30 || media.matches)) {
        if (!media.matches) time += Math.min((now - last) / 1000, 0.05);
        last = now;
        group.rotation.y = time * 0.24 + pointerX;
        group.position.y = Math.sin(time * 0.7) * 0.1;
        group.rotation.x = 0.15 + pointerY + Math.sin(time * 0.3) * 0.1;
        if (kind === "orbital")
          group.children.forEach((child, i) => {
            child.rotation.y = time * (0.1 + i * 0.03) + i * 0.4;
          });
        if (shader) {
          shader.uniforms.uTime.value = time;
          if (shader.uniforms.uAmplitude) {
            shader.uniforms.uAmplitude.value +=
              (amplitude.current - shader.uniforms.uAmplitude.value) * 0.08;
          }
        }
        renderer.render(scene, camera);
        el.dataset.frame = String(Math.round(time * 100));
      }
      if (!media.matches) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    const preference = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      media.removeEventListener("change", preference);
      el.removeEventListener("pointermove", pointer);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      silver.dispose();
      lime.dispose();
      dark.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [kind, visible]);
  return (
    <div
      ref={host}
      className={`art-canvas ${className}`}
      role="img"
      aria-label={`Original animated ${kind} study`}
      data-scene={kind}
    >
      {failed && (
        <div className="webgl-fallback">
          <span>◉</span>
          <small>3D preview unavailable on this device</small>
        </div>
      )}
    </div>
  );
}
