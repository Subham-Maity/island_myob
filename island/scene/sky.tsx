"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScene } from "./scene-context";

const smooth = (t: number) => t * t * (3 - 2 * t);

/* ───────────────────────── Sky gradient + stars (screen-space) ───────────────────────── */

const skyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform float uTime;
  uniform float uNight;
  uniform vec2 uRes;
  uniform vec3 uDayTop;
  uniform vec3 uDayBot;
  uniform vec3 uNightTop;
  uniform vec3 uNightBot;
  uniform vec3 uGlow;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float shootingStar(vec2 uv, float aspect, float t) {
    float period = 5.5;
    float cyc = mod(t, period);
    float p = cyc / 0.85;
    if (p > 1.0) return 0.0;
    float seed = floor(t / period);
    vec2 start = vec2((0.35 + hash(vec2(seed, 1.7)) * 0.6) * aspect, 0.92 - hash(vec2(seed, 4.2)) * 0.12);
    vec2 dir = normalize(vec2(-0.75, -0.32));
    float len = 0.16;
    vec2 head = start + dir * p * 0.55;
    vec2 a = head - dir * len;
    vec2 pa = uv - a;
    float h = clamp(dot(pa, dir) / len, 0.0, 1.0);
    float d = length(pa - dir * h * len);
    return smoothstep(0.0045, 0.0, d) * h * h * sin(p * 3.14159);
  }

  void main() {
    vec3 top = mix(uDayTop, uNightTop, uNight);
    vec3 bot = mix(uDayBot, uNightBot, uNight);
    vec3 col = mix(bot, top, smoothstep(0.0, 1.0, vUv.y));

    float aspect = uRes.x / uRes.y;
    vec2 c = (vUv - vec2(0.5, 0.42)) * vec2(aspect * 0.55, 1.0);
    float glow = 1.0 - smoothstep(0.0, 0.75, length(c));
    col += uGlow * glow * glow * mix(0.04, 0.045, uNight);

    // Twinkling star field (3px cells)
    vec2 sp = gl_FragCoord.xy / 3.0;
    vec2 cell = floor(sp);
    float h = hash(cell);
    float star = step(0.9925, h);
    float tw = 0.45 + 0.55 * sin(uTime * (1.2 + h * 5.0) + h * 80.0);
    float shape = smoothstep(0.55, 0.0, length(fract(sp) - 0.5));
    float starMask = smoothstep(0.2, 0.75, vUv.y);
    col += vec3(0.85, 0.92, 1.0) * star * shape * tw * starMask * uNight * 1.8;

    // Shooting star
    vec2 uvA = vec2(vUv.x * aspect, vUv.y);
    col += vec3(0.9, 0.95, 1.0) * shootingStar(uvA, aspect, uTime) * uNight * 2.2;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function SkyBackdrop() {
  const { night, glow } = useScene();
  const size = useThree((s) => s.size);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uNight: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uDayTop: { value: new THREE.Color("#5b6194") },
          uDayBot: { value: new THREE.Color("#a5a8ca") },
          uNightTop: { value: new THREE.Color("#02030f") },
          uNightBot: { value: new THREE.Color("#18123d") },
          uGlow: { value: new THREE.Color() },
        },
      }),
    []
  );

  useFrame(({ clock }) => {
    const u = material.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uNight.value = night.v;
    (u.uGlow.value as THREE.Color).copy(glow);
    (u.uRes.value as THREE.Vector2).set(size.width, size.height);
  });

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/* ───────────────────────── Sun & Moon (camera-locked, swap on night) ───────────────────────── */

const haloMaterial = (color: string, strength: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uStrength; varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.6) * uStrength;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  });

export function CelestialRig() {
  const { night } = useScene();
  const rig = useRef<THREE.Group>(null);
  const sun = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);

  const sunHalo = useMemo(() => haloMaterial("#fbd38d", 0.45), []);
  const moonHalo = useMemo(() => haloMaterial("#a5b4fc", 0.55), []);

  useFrame(({ camera, clock }) => {
    const g = rig.current;
    if (!g || !sun.current || !moon.current) return;
    const cam = camera as THREE.PerspectiveCamera;
    g.position.copy(cam.position);
    g.quaternion.copy(cam.quaternion);

    const D = 40;
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * D;
    const halfW = halfH * cam.aspect;
    const n = smooth(night.v);

    sun.current.position.set(halfW * 0.74, THREE.MathUtils.lerp(halfH * 0.58, -halfH * 1.6, n), -D);
    sun.current.scale.setScalar(halfH * 0.11);
    moon.current.position.set(halfW * 0.7, THREE.MathUtils.lerp(-halfH * 1.6, halfH * 0.56, n), -D);
    moon.current.scale.setScalar(halfH * 0.09);  });

  return (
    <group ref={rig}>
      {/* Sun */}
      <group ref={sun}>
        <mesh material={sunHalo} position-z={-0.2}>
          <planeGeometry args={[7, 7]} />
        </mesh>        <mesh>
          <circleGeometry args={[1, 40]} />
          <meshBasicMaterial color={[1.5, 1.25, 0.7]} toneMapped={false} />
        </mesh>
      </group>

      {/* Moon */}
      <group ref={moon}>
        <mesh material={moonHalo} position-z={-0.2}>
          <planeGeometry args={[6, 6]} />
        </mesh>
        <mesh>
          <circleGeometry args={[1, 40]} />
          <meshBasicMaterial color={[1.7, 1.65, 1.35]} toneMapped={false} />
        </mesh>
        {[
          [-0.3, 0.25, 0.22],
          [0.35, -0.1, 0.16],
          [-0.05, -0.45, 0.13],
          [0.3, 0.45, 0.09],
        ].map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0.01]}>
            <circleGeometry args={[r, 20]} />
            <meshBasicMaterial color={[1.05, 1.05, 0.95]} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── Low-poly drifting clouds ───────────────────────── */

const CLOUDS = [
  { x: -7, y: 2.4, z: -5, s: 1.0, speed: 0.28 },
  { x: 6.5, y: 1.4, z: -6, s: 0.8, speed: 0.34 },
  { x: -3, y: -3.4, z: 1.5, s: 1.2, speed: 0.22 },
] as const;

const PUFFS = [
  [0, 0, 0, 0.6],
  [0.6, -0.1, 0.1, 0.46],
  [-0.6, -0.12, 0, 0.5],
  [0.2, 0.32, -0.05, 0.42],
  [-1.05, -0.22, 0.1, 0.32],
] as const;

export function CloudLayer() {
  const { night } = useScene();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f1f3f8",
        flatShading: true,
        transparent: true,
        opacity: 0.85,
        roughness: 1,
        emissive: new THREE.Color("#1e293b"),
      }),
    []
  );
  const day = useMemo(() => new THREE.Color("#f1f3f8"), []);
  const dusk = useMemo(() => new THREE.Color("#475569"), []);

  useFrame(({ clock }, dt) => {
    material.color.lerpColors(day, dusk, night.v);
    material.opacity = THREE.MathUtils.lerp(0.85, 0.55, night.v);
    refs.current.forEach((g, i) => {
      if (!g) return;
      const c = CLOUDS[i];
      g.position.x += c.speed * Math.min(dt, 0.1);
      if (g.position.x > 11) g.position.x = -11;
      g.position.y = c.y + Math.sin(clock.elapsedTime * 0.4 + i) * 0.08;
    });
  });

  return (
    // rotate so local +X runs along the camera's screen-right
    <group rotation-y={Math.PI / 4}>
      {CLOUDS.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[c.x, c.y, c.z]}
          scale={c.s}
        >
          {PUFFS.map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]} material={material} scale={[1, 0.78, 0.9]}>
              <icosahedronGeometry args={[r, 1]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────── Lighting rig (day ↔ night) ───────────────────────── */

export function Lights() {
  const { night, flash } = useScene();
  const ambient = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);

  const colors = useMemo(
    () => ({
      sun: new THREE.Color("#fff3d6"),
      moon: new THREE.Color("#8ea2ff"),
      skyDay: new THREE.Color("#e0e7ff"),
      skyNight: new THREE.Color("#4338ca"),
    }),
    []
  );

  useFrame(() => {
    const n = night.v;
    const f = flash.v;
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(0.9, 0.12, n) + f * 1.2;
    if (hemi.current) {
      hemi.current.intensity = THREE.MathUtils.lerp(1.6, 0.55, n);
      hemi.current.color.lerpColors(colors.skyDay, colors.skyNight, n);
    }
    if (key.current) {
      key.current.intensity = THREE.MathUtils.lerp(2.4, 0.95, n) + f * 1.5;
      key.current.color.lerpColors(colors.sun, colors.moon, n);
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.45} />
      <hemisphereLight ref={hemi} args={["#e0e7ff", "#6b5b4a", 1.2]} />
      <directionalLight
        ref={key}
        position={[5, 9, 4]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-radius={4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  );
}
