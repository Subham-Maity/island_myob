"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useScene } from "./scene-context";
import { ISLAND_HALF, POND, WATER_Y, FLAT_Y } from "./layout";

export { POND };

const STREAM_START = POND.x + POND.r * POND.sx - 0.1;
const STREAM_LEN = ISLAND_HALF + 0.02 - STREAM_START;
const STREAM_W = 0.42;

/** Anchor points so <Grow> scales each landmark from its own origin */
export const STREAM_POS = [STREAM_START + STREAM_LEN / 2, FLAT_Y, POND.z] as const;
export const BRIDGE_POS = [STREAM_START + STREAM_LEN * 0.45, FLAT_Y, POND.z] as const;
export const WATERFALL_POS = [ISLAND_HALF + 0.04, WATER_Y, POND.z] as const;

/* ───────────────────────── Animated water shader ───────────────────────── */

const waterVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform float uNight;
  uniform float uRadial;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  varying vec2 vUv;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float d = uRadial > 0.5 ? length(vUv - 0.5) * 2.0 : abs(vUv.y - 0.5) * 2.0;
    vec2 p = vWorld.xz;
    float w1 = sin(p.x * 9.0 + uTime * 1.4 + sin(p.y * 7.0 + uTime) * 1.2);
    float w2 = sin(p.y * 11.0 - uTime * 1.1 + sin(p.x * 5.0 - uTime * 0.7) * 1.5);
    float caustic = pow(abs(w1 * w2), 0.6);

    vec3 col = mix(uDeep, uShallow, 1.0 - d * 0.85);
    col += vec3(0.55, 0.85, 1.0) * smoothstep(0.55, 1.0, caustic) * 0.35;

    // sparkling glints (bloom picks these up)
    float g = step(0.986, hash(floor(p * 28.0) + floor(uTime * 2.5)));
    col += vec3(1.8) * g * (1.0 - uNight * 0.4);

    // soft foam at the shoreline
    col = mix(col, vec3(0.85, 0.95, 1.0), smoothstep(0.82, 1.0, d) * 0.45);
    // moonlit tint
    col = mix(col, col * vec3(0.35, 0.42, 0.85), uNight * 0.75);

    gl_FragColor = vec4(col, 0.93);
    #include <colorspace_fragment>
  }
`;

function useWaterMaterial(radial: boolean) {
  const { night } = useScene();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waterVertex,
        fragmentShader: waterFragment,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uNight: { value: 0 },
          uRadial: { value: radial ? 1 : 0 },
          uDeep: { value: new THREE.Color("#3f8594") },
          uShallow: { value: new THREE.Color("#86c9c6") },
        },
      }),
    [radial]
  );
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uNight.value = night.v;
  });
  return material;
}

/* ───────────────────────── Crystal pond ───────────────────────── */

function Ripples() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (clock.elapsedTime * 0.45 + i / 3) % 1;
      m.scale.setScalar(0.1 + p * 0.75);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.55;
    });
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          rotation-x={-Math.PI / 2}
          position={[-0.12, WATER_Y + 0.01, 0.05]}
        >
          <ringGeometry args={[0.55, 0.6, 40]} />
          <meshBasicMaterial color="#e0f2fe" transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function Duck() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 0.45;
    const rx = 0.42;
    const rz = 0.3;
    g.position.set(Math.cos(t) * rx, WATER_Y + 0.045 + Math.sin(clock.elapsedTime * 3) * 0.008, Math.sin(t) * rz);
    // face along the direction of travel
    const dx = -Math.sin(t) * rx;
    const dz = Math.cos(t) * rz;
    g.rotation.y = Math.atan2(-dz, dx);
    g.rotation.z = Math.sin(clock.elapsedTime * 3) * 0.06;
  });
  return (
    <group ref={ref}>
      <mesh scale={[1.35, 0.8, 1]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#fde047" flatShading />
      </mesh>
      <mesh position={[-0.08, 0.04, 0]} rotation-z={0.6} scale={[1, 0.5, 0.8]}>
        <coneGeometry args={[0.035, 0.07, 5]} />
        <meshStandardMaterial color="#facc15" flatShading />
      </mesh>
      <mesh position={[0.07, 0.075, 0]} castShadow>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color="#fde047" flatShading />
      </mesh>
      <mesh position={[0.118, 0.07, 0]} rotation-z={-Math.PI / 2}>
        <coneGeometry args={[0.016, 0.04, 6]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.09, 0.09, s * 0.03]}>
          <sphereGeometry args={[0.008, 6, 4]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

export function Pond({ withDuck }: { withDuck: boolean }) {
  const water = useWaterMaterial(true);
  const stones = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return { a, s: 0.05 + ((i * 37) % 7) * 0.006 };
      }),
    []
  );

  return (
    <group>
      <group scale={[POND.sx, 1, 1]}>
        <mesh rotation-x={-Math.PI / 2} position-y={WATER_Y - 0.018}>
          <circleGeometry args={[POND.r + 0.09, 36]} />
          <meshStandardMaterial color="#a9a577" flatShading roughness={1} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={WATER_Y} material={water}>
          <circleGeometry args={[POND.r, 48]} />
        </mesh>
        <Ripples />
        {/* shoreline stones (skip the stream outlet on +X) */}
        {stones
          .filter(({ a }) => Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) > 0.32)
          .map(({ a, s }, i) => (
            <mesh
              key={i}
              position={[Math.cos(a) * (POND.r + 0.05), s * 0.4, Math.sin(a) * (POND.r + 0.05)]}
              rotation-y={a}
              scale={[s * 1.2, s, s]}
              castShadow
            >
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={i % 3 ? "#a9a89c" : "#8e8d82"} flatShading />
            </mesh>
          ))}
      </group>

      {/* Lily pads + lotus */}
      {(
        [
          [-0.38, -0.08, 0.1],
          [0.2, 0.28, 0.08],
          [-0.15, 0.3, 0.07],
        ] as const
      ).map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 1.7]} position={[x, WATER_Y + 0.012, z]}>
          <circleGeometry args={[r, 16, 0.4, Math.PI * 2 - 0.55]} />
          <meshStandardMaterial color="#15803d" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <group position={[-0.38, WATER_Y + 0.02, -0.08]}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.03, 0.02, Math.sin(a) * 0.03]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]}>
              <coneGeometry args={[0.022, 0.06, 4]} />
              <meshStandardMaterial color="#f9a8d4" emissive="#ec4899" emissiveIntensity={0.4} flatShading />
            </mesh>
          );
        })}
      </group>

      {withDuck && <Duck />}
    </group>
  );
}

/* ───────────────────────── Stream + arched footbridge ───────────────────────── */

export function Stream() {
  const water = useWaterMaterial(false);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={WATER_Y - 0.018}>
        <planeGeometry args={[STREAM_LEN, STREAM_W + 0.12]} />
        <meshStandardMaterial color="#a9a577" flatShading roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={WATER_Y} material={water}>
        <planeGeometry args={[STREAM_LEN, STREAM_W, 8, 1]} />
      </mesh>
    </group>
  );
}

export function Bridge() {
  return (
    <group rotation-y={Math.PI / 2}>
      {/* deck */}
      <mesh scale={[1, 1, 3.2]} castShadow>
        <torusGeometry args={[0.27, 0.035, 4, 14, Math.PI]} />
        <meshStandardMaterial color="#b24a3c" flatShading />
      </mesh>
      {/* rails */}
      {[-1, 1].map((s) => (
        <group key={s} position-z={s * 0.1}>
          <mesh castShadow>
            <torusGeometry args={[0.36, 0.012, 4, 14, Math.PI]} />
            <meshStandardMaterial color="#8d3a30" />
          </mesh>
          {[0.35, 0.95, 1.57, 2.2, 2.8].map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * 0.31, Math.sin(a) * 0.31, 0]} rotation-z={a - Math.PI / 2}>
              <boxGeometry args={[0.014, 0.1, 0.014]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────── Waterfall off the island edge ───────────────────────── */

const fallFragment = /* glsl */ `
  uniform float uTime;
  uniform float uNight;
  varying vec2 vUv;
  void main() {
    float n = sin(vUv.x * 38.0 + sin(vUv.x * 13.0) * 3.0) * 0.5 + 0.5;
    float s = fract(vUv.y * 2.6 + uTime * 1.6 + n * 0.35);
    float streak = smoothstep(0.0, 0.35, s) * smoothstep(1.0, 0.6, s);
    vec3 col = mix(vec3(0.14, 0.55, 0.85), vec3(0.95, 0.99, 1.0), streak * 0.75);
    col = mix(col, col * vec3(0.4, 0.45, 0.9), uNight * 0.7);
    float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float fade = smoothstep(0.0, 0.35, vUv.y);
    float a = (0.55 + streak * 0.4) * edge * fade;
    gl_FragColor = vec4(col * (1.0 + streak * 0.6), a);
    #include <colorspace_fragment>
  }
`;

export function Waterfall() {
  const { night } = useScene();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waterVertex,
        fragmentShader: fallFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uNight: { value: 0 } },
      }),
    []
  );
  const mist = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uNight.value = night.v;
    if (mist.current) {
      mist.current.children.forEach((c, i) => {
        const s = 0.9 + Math.sin(t * 2 + i * 1.7) * 0.15;
        c.scale.setScalar(s * (0.25 - i * 0.03));
      });
    }
  });

  const H = 3.4;
  return (
    <group>
      {/* foam band where the stream tips over the edge */}
      <mesh position={[0.02, -0.03, 0]}>
        <boxGeometry args={[0.08, 0.07, STREAM_W + 0.02]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh material={material} rotation-y={Math.PI / 2} position={[0.06, -H / 2 - 0.06, 0]}>
        <planeGeometry args={[STREAM_W, H, 1, 1]} />
      </mesh>
      <Sparkles count={10} scale={[0.4, H, 0.4]} position={[0.1, -H / 2, 0]} size={2.2} speed={1.2} color="#e0f2fe" />
      {/* mist puffs at the bottom */}
      <group ref={mist} position={[0.12, -H, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.12, i * 0.05, (i - 1) * 0.1]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} flatShading depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── Beacon lighthouse ───────────────────────── */

const beamMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color("#fef08a") },
      uOpacity: { value: 0.3 },
      uH: { value: 3.4 },
    },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; uniform float uH; varying float vY;
      void main() {
        float t = clamp(vY / uH + 0.5, 0.0, 1.0);
        float a = pow(t, 1.8) * uOpacity;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  });

export function Lighthouse() {
  const { night } = useScene();
  const beam = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const windows = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const beamMat = useMemo(beamMaterial, []);

  useFrame(({ clock }, dt) => {
    const n = night.v;
    const t = clock.elapsedTime;
    if (beam.current) beam.current.rotation.y += Math.min(dt, 0.1) * 1.1;
    beamMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.22, 0.75, n);
    if (lamp.current) lamp.current.emissiveIntensity = THREE.MathUtils.lerp(2, 5, n) + Math.sin(t * 6) * 0.3;
    if (light.current) light.current.intensity = THREE.MathUtils.lerp(0.6, 3.5, n);
    windows.current.forEach((w) => {
      if (w) w.emissiveIntensity = THREE.MathUtils.lerp(0.2, 2.5, n);
    });
  });

  const SEG = 0.27;
  return (
    <group>
      {/* rocky plinth */}
      <mesh position-y={0.06} scale={[0.34, 0.14, 0.34]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#475569" flatShading />
      </mesh>
      {/* striped tower */}
      {[0, 1, 2, 3].map((i) => {
        const rb = 0.2 - i * 0.016;
        const rt = 0.2 - (i + 1) * 0.016;
        return (
          <mesh key={i} position-y={0.14 + i * SEG + SEG / 2} castShadow>
            <cylinderGeometry args={[rt, rb, SEG, 12]} />
            <meshStandardMaterial color={i % 2 ? "#efe9df" : "#c8504a"} flatShading roughness={0.6} />
          </mesh>
        );
      })}
      {/* door + windows */}
      <mesh position={[0.135, 0.24, 0.12]} rotation-y={Math.PI / 4}>
        <boxGeometry args={[0.09, 0.15, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {[0.62, 0.92].map((y, i) => (
        <mesh key={y} position={[0.115, y, 0.115]} rotation-y={Math.PI / 4}>
          <boxGeometry args={[0.05, 0.07, 0.02]} />
          <meshStandardMaterial
            ref={(el) => {
              windows.current[i] = el;
            }}
            color="#fde68a"
            emissive="#f59e0b"
            emissiveIntensity={0.2}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* gallery */}
      <mesh position-y={1.24}>
        <cylinderGeometry args={[0.2, 0.18, 0.04, 14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* lantern room */}
      <mesh position-y={1.35}>
        <cylinderGeometry args={[0.1, 0.1, 0.18, 10]} />
        <meshStandardMaterial
          ref={lamp}
          color="#fef9c3"
          emissive="#fde047"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={light} position-y={1.35} color="#fde68a" intensity={0.6} distance={5} />
      {/* roof */}
      <mesh position-y={1.52} castShadow>
        <coneGeometry args={[0.15, 0.17, 10]} />
        <meshStandardMaterial color="#9c3b36" flatShading />
      </mesh>
      <mesh position-y={1.62}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1} />
      </mesh>
      {/* sweeping twin beam */}
      <group ref={beam} position-y={1.35}>
        {[0, Math.PI].map((r) => (
          <group key={r} rotation-y={r}>
            <mesh material={beamMat} position-x={1.7} rotation-z={Math.PI / 2}>
              <coneGeometry args={[0.42, 3.4, 24, 1, true]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
