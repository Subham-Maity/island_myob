"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScene } from "./scene-context";
import { blobCloud, type Blob } from "./blobs";

/** Wind sway helper — gentle rotation driven by time + per-instance phase */
function useSway(amp = 0.06, speed = 1.4, phase = 0) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * speed + phase;
    g.rotation.z = Math.sin(t) * amp;
    g.rotation.x = Math.cos(t * 0.8) * amp * 0.6;
  });
  return ref;
}

/* ───────────────────────── Stage 0/1: the heart sprout ───────────────────────── */

export function Sprout({ bloom = false }: { bloom?: boolean }) {
  const sway = useSway(0.1, 1.6);
  const dew = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (dew.current) dew.current.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 3) * 1.2;
  });

  return (
    <group>
      {/* soil mound */}
      <mesh position-y={0} scale={[1, 0.4, 1]} receiveShadow castShadow>
        <sphereGeometry args={[0.34, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5b3a1e" flatShading roughness={1} />
      </mesh>
      <group ref={sway} position-y={0.1}>
        <mesh position-y={0.2} castShadow>
          <cylinderGeometry args={[0.022, 0.03, 0.4, 6]} />
          <meshStandardMaterial color="#4ade80" flatShading />
        </mesh>
        <mesh position={[0.11, 0.34, 0]} rotation-z={0.5} scale={[0.17, 0.035, 0.09]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#22c55e" flatShading />
        </mesh>
        <mesh position={[-0.1, 0.28, 0.01]} rotation-z={-0.55} scale={[0.15, 0.03, 0.08]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#4ade80" flatShading />
        </mesh>
        <mesh position={[0.19, 0.4, 0.03]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial
            ref={dew}
            color="#7dd3fc"
            emissive="#38bdf8"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        {bloom && (
          <group position-y={0.44}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.065, 0, Math.sin(a) * 0.065]}
                  scale={[1, 0.4, 1]}
                >
                  <sphereGeometry args={[0.055, 7, 5]} />
                  <meshStandardMaterial color="#f472b6" flatShading />
                </mesh>
              );
            })}
            <mesh position-y={0.02}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

/* ───────────────────────── Stage 1+: wildflowers & grass ───────────────────────── */

export function Flower({ color, phase }: { color: string; phase: number }) {
  const sway = useSway(0.12, 2, phase);
  return (
    <group ref={sway}>
      <mesh position-y={0.11}>
        <cylinderGeometry args={[0.012, 0.016, 0.22, 5]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      <group position-y={0.23} rotation-x={-0.35}>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.045, 0, Math.sin(a) * 0.045]} scale={[1, 0.35, 1]}>
              <sphereGeometry args={[0.042, 6, 4]} />
              <meshStandardMaterial color={color} flatShading />
            </mesh>
          );
        })}
        <mesh position-y={0.012}>
          <sphereGeometry args={[0.026, 6, 5]} />
          <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export function GrassTuft({ phase }: { phase: number }) {
  const sway = useSway(0.15, 2.4, phase);
  return (
    <group ref={sway}>
      {[
        [0, 0, 0.11],
        [0.04, 0.5, 0.08],
        [-0.04, -0.5, 0.09],
      ].map(([x, rz, h], i) => (
        <mesh key={i} position={[x, h / 2, 0]} rotation-z={rz * 0.5}>
          <coneGeometry args={[0.022, h, 4]} />
          <meshStandardMaterial color={i === 0 ? "#3f8a48" : "#559a52"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── Stage 2+: canopy trees ───────────────────────── */

const TREE_BLOBS: Blob[] = [
  [0, 0, 0, 0.36],
  [-0.3, -0.05, 0.08, 0.28],
  [0.3, -0.02, -0.05, 0.3],
  [0.04, 0.2, 0.02, 0.26],
  [0.12, -0.1, 0.28, 0.2],
];

export function RoundTree({ phase = 0, fruit = false }: { phase?: number; fruit?: boolean }) {
  const canopy = useSway(0.035, 0.9, phase);
  const geo = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    return {
      crown: blobCloud(TREE_BLOBS, 11 + Math.floor(phase * 10), "#a8d67e", "#6c9f55"),
      trunk: new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.07, 0.3, 0.03), V(-0.04, 0.55, 0), V(0.03, 0.82, -0.02)]), 14, 0.05, 6),
      branch: new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0.4, 0), V(0.15, 0.6, 0.04), V(0.28, 0.8, 0)]), 8, 0.028, 5),
    };
  }, [phase]);
  return (
    <group>
      <mesh position-y={0.04} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 0.1, 6]} />
        <meshStandardMaterial color="#5a3d38" flatShading />
      </mesh>
      <mesh geometry={geo.trunk} castShadow>
        <meshStandardMaterial color="#5a3d38" flatShading />
      </mesh>
      <mesh geometry={geo.branch} castShadow>
        <meshStandardMaterial color="#5a3d38" flatShading />
      </mesh>
      <group ref={canopy} position-y={1.0}>
        <mesh geometry={geo.crown} castShadow receiveShadow>
          <meshStandardMaterial vertexColors flatShading roughness={0.9} />
        </mesh>
        {fruit &&
          (
            [
              [0.32, 0.05, 0.22],
              [-0.3, 0.18, 0.25],
              [0.05, -0.15, 0.4],
            ] as const
          ).map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.045, 8, 6]} />
              <meshStandardMaterial color="#e8808c" emissive="#e11d48" emissiveIntensity={0.3} />
            </mesh>
          ))}
      </group>
    </group>
  );
}

/* ───────────────────────── Stage 3+: soft evergreens ───────────────────────── */

const PINE_BLOBS: Blob[] = [
  [0, 0.52, 0, 0.38, 0.8],
  [0, 0.8, 0, 0.3, 0.85],
  [0, 1.04, 0, 0.21, 0.95],
];

export function PineTree({ phase = 0 }: { phase?: number }) {
  const sway = useSway(0.03, 1.1, phase);
  const geo = useMemo(() => blobCloud(PINE_BLOBS, 40 + Math.floor(phase * 10), "#6ba67c", "#3d6e58", 0.07), [phase]);
  return (
    <group ref={sway}>
      <mesh position-y={0.17} castShadow>
        <cylinderGeometry args={[0.045, 0.065, 0.34, 6]} />
        <meshStandardMaterial color="#5a3d38" flatShading />
      </mesh>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── Stage 2+: glowing crystal cluster ───────────────────────── */

export function Crystals() {
  const { night } = useScene();
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const shard = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = THREE.MathUtils.lerp(0.35, 2.4, night.v) + Math.sin(t * 2.2 + i * 1.3) * THREE.MathUtils.lerp(0.08, 1, night.v);
    });
    if (shard.current) {
      shard.current.rotation.y = t * 1.2;
      shard.current.position.y = 0.95 + Math.sin(t * 1.6) * 0.08;
    }
  });

  const crystal = (i: number, color: string, emissive: string) => (
    <meshStandardMaterial
      ref={(el) => {
        mats.current[i] = el;
      }}
      color={color}
      emissive={emissive}
      emissiveIntensity={1.6}
      flatShading
      roughness={0.15}
      metalness={0.2}
      transparent
      opacity={0.92}
      toneMapped={false}
    />
  );

  return (
    <group>
      <mesh position-y={0.3} scale={[0.55, 1.9, 0.55]} castShadow>
        <octahedronGeometry args={[0.18, 0]} />
        {crystal(0, "#67e8f9", "#22d3ee")}
      </mesh>
      <mesh position={[0.15, 0.17, 0.05]} rotation-z={-0.45} scale={[0.5, 1.4, 0.5]} castShadow>
        <octahedronGeometry args={[0.15, 0]} />
        {crystal(1, "#a5f3fc", "#67e8f9")}
      </mesh>
      <mesh position={[-0.13, 0.14, 0.04]} rotation-z={0.5} scale={[0.5, 1.2, 0.5]} castShadow>
        <octahedronGeometry args={[0.14, 0]} />
        {crystal(2, "#c4b5fd", "#a78bfa")}
      </mesh>
      <mesh ref={shard} position-y={0.95} scale={[0.6, 1.3, 0.6]}>
        <octahedronGeometry args={[0.08, 0]} />
        {crystal(3, "#cffafe", "#cffafe")}
      </mesh>
      <pointLight color="#22d3ee" intensity={0.5} distance={2.2} position-y={0.5} />
    </group>
  );
}

/* ───────────────────────── Stage 3+: bioluminescent mushrooms ───────────────────────── */

export function Mushroom({ phase = 0, scale = 1 }: { phase?: number; scale?: number }) {
  const cap = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (cap.current) cap.current.emissiveIntensity = 2.6 + Math.sin(clock.elapsedTime * 1.8 + phase) * 1.0;
  });
  return (
    <group scale={scale}>
      <mesh position-y={0.06}>
        <cylinderGeometry args={[0.022, 0.03, 0.12, 6]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <mesh position-y={0.12}>
        <sphereGeometry args={[0.07, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          ref={cap}
          color="#c084fc"
          emissive="#c084fc"
          emissiveIntensity={1.2}
          flatShading
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
