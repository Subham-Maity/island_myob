"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { blobCloud, type Blob } from "./blobs";
import { mulberry32 } from "./scene-context";

/**
 * Page backdrop: a faceted sun sinking behind pastel cloud banks, with tiny floating
 * islets drifting in the distance. Same low-poly language as the hero island.
 */

/* ───────────────────────── Sun ───────────────────────── */

function Sun() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * 0.02;
  });
  return (
    <group position={[3.2, -3.4, -14]}>
      {[
        [7.2, 0.1, "#ff9a8b"],
        [5.2, 0.16, "#ffb38a"],
      ].map(([r, o, c], i) => (
        <mesh key={i} position-z={-0.1 - i * 0.01}>
          <circleGeometry args={[r as number, 48]} />
          <meshBasicMaterial color={c as string} transparent opacity={o as number} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      <group ref={ref}>
        <mesh>
          <circleGeometry args={[3.2, 11]} />
          <meshBasicMaterial color="#ffd0a0" toneMapped={false} />
        </mesh>
        <mesh position-z={0.01} rotation-z={0.3}>
          <circleGeometry args={[2.4, 9]} />
          <meshBasicMaterial color="#ffe3bd" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── Clouds ───────────────────────── */

const CLOUD_BLOBS: Blob[] = [
  [0, 0, 0, 1.0, 0.7],
  [1.1, -0.1, 0.1, 0.8, 0.7],
  [-1.15, -0.15, 0, 0.75, 0.68],
  [0.35, 0.45, 0, 0.7, 0.75],
  [2.0, -0.28, 0, 0.5, 0.65],
  [-1.9, -0.3, 0, 0.45, 0.65],
];

const CLOUDS = [
  { x: -10, y: -0.6, z: -10, s: 0.75, v: 0.12, seed: 3 },
  { x: 8, y: 0.6, z: -12, s: 0.95, v: 0.08, seed: 9 },
  { x: -3, y: -4.6, z: -7, s: 0.8, v: 0.1, seed: 14 },
  { x: 4, y: 4.8, z: -14, s: 0.85, v: 0.07, seed: 21 },
] as const;

function Clouds() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const geos = useMemo(() => CLOUDS.map((c) => blobCloud(CLOUD_BLOBS, c.seed, "#fbe6e2", "#a99ac9", 0.12)), []);
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.x += CLOUDS[i].v * Math.min(dt, 0.1);
      if (m.position.x > 16) m.position.x = -16;
    });
  });
  return (
    <>
      {CLOUDS.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={geos[i]}
          position={[c.x, c.y, c.z]}
          scale={c.s}
        >
          <meshStandardMaterial vertexColors flatShading roughness={1} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  );
}

/* ───────────────────────── Floating islets ───────────────────────── */

const MINI_TREE: Blob[] = [
  [0, 0, 0, 0.3],
  [-0.24, -0.04, 0.05, 0.22],
  [0.24, -0.02, -0.04, 0.23],
  [0.03, 0.16, 0.02, 0.2],
];

function Islet({ x, y, z, s, seed, tilt }: { x: number; y: number; z: number; s: number; seed: number; tilt: number }) {
  const ref = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const geo = useMemo(() => {
    const rand = mulberry32(seed);
    const rock = new THREE.CylinderGeometry(1, 0.42, 0.95, 7, 1).toNonIndexed();
    const p = rock.attributes.position;
    const jit = new Map<string, number>();
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = `${v.x.toFixed(2)}${v.y.toFixed(2)}${v.z.toFixed(2)}`;
      if (!jit.has(k)) jit.set(k, 0.85 + rand() * 0.3);
      if (v.y < 0.4) p.setXYZ(i, v.x * jit.get(k)!, v.y, v.z * jit.get(k)!);
    }
    rock.computeVertexNormals();
    return { rock, crown: blobCloud(MINI_TREE, seed, "#b6e08c", "#7aae60") };
  }, [seed]);
  const px = x * Math.min(1, viewport.width / 17);

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime + seed;
    g.position.y = y + Math.sin(t * 0.6) * 0.18;
    g.rotation.y = t * 0.12;
    g.rotation.z = tilt + Math.sin(t * 0.4) * 0.03;
  });

  return (
    <group ref={ref} position={[px, y, z]} scale={s}>
      <mesh geometry={geo.rock} position-y={-0.5}>
        <meshStandardMaterial color="#4b433e" flatShading roughness={1} />
      </mesh>
      <mesh position-y={0.04}>
        <cylinderGeometry args={[1.02, 0.98, 0.16, 7]} />
        <meshStandardMaterial color="#a4d474" flatShading roughness={1} />
      </mesh>
      <group position={[0.15, 0.1, 0.05]}>
        <mesh position-y={0.28}>
          <cylinderGeometry args={[0.03, 0.05, 0.56, 5]} />
          <meshStandardMaterial color="#5a3d38" flatShading />
        </mesh>
        <mesh geometry={geo.crown} position-y={0.7}>
          <meshStandardMaterial vertexColors flatShading roughness={1} />
        </mesh>
      </group>
      <mesh position={[-0.5, 0.17, -0.2]} scale={[0.2, 0.14, 0.16]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#b4b0c6" flatShading />
      </mesh>
    </group>
  );
}

/* ───────────────────────── Rig ───────────────────────── */

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  useEffect(() => {
    const on = () => (scroll.current = window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useFrame(({ pointer }, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 2.5);
    g.position.x += (-pointer.x * 0.6 - g.position.x) * k;
    g.position.y += (-pointer.y * 0.35 + scroll.current * 0.004 - g.position.y) * k;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Backdrop() {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 14], fov: 40, near: 0.1, far: 80 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <ambientLight intensity={1.15} />
      <hemisphereLight args={["#ffe9e0", "#7b6fa8", 0.9]} />
      <directionalLight position={[6, 8, 8]} intensity={1.6} color="#fff0e2" />
      <Rig>
        <Sun />
        <Clouds />
        <Islet x={-7.4} y={2.8} z={-3} s={0.95} seed={5} tilt={0.08} />
        <Islet x={7.2} y={3.4} z={-6} s={1.2} seed={12} tilt={-0.1} />
        <Islet x={-8.2} y={-2.6} z={-7} s={0.8} seed={23} tilt={-0.06} />
        <Islet x={6.4} y={-3.1} z={-2} s={0.7} seed={31} tilt={0.12} />
        <Sparkles count={46} scale={[22, 12, 8]} position={[0, 0, -4]} size={3.2} speed={0.25} opacity={0.7} color="#ffe6cf" />
      </Rig>
    </Canvas>
  );
}
