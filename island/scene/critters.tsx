"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Flapping wing pair; hinge runs along local Z (the body axis) */
function Wings({
  color,
  size,
  speed,
  phase,
  emissive,
}: {
  color: string;
  size: [number, number];
  speed: number;
  phase: number;
  emissive?: string;
}) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const flap = Math.sin(clock.elapsedTime * speed + phase) * 0.9;
    if (left.current) left.current.rotation.z = flap;
    if (right.current) right.current.rotation.z = -flap;
  });
  const [w, h] = size;
  const mat = (
    <meshStandardMaterial
      color={color}
      emissive={emissive ?? color}
      emissiveIntensity={emissive ? 0.6 : 0.1}
      side={THREE.DoubleSide}
      flatShading
    />
  );
  return (
    <>
      <group ref={left}>
        <mesh position-x={-w / 2} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[w, h]} />
          {mat}
        </mesh>
      </group>
      <group ref={right}>
        <mesh position-x={w / 2} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[w, h]} />
          {mat}
        </mesh>
      </group>
    </>
  );
}

export function Butterfly({ color, phase, radius = 1.4 }: { color: string; phase: number; radius?: number }) {
  const ref = useRef<THREE.Group>(null);
  const prev = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 0.55 + phase;
    prev.current.copy(g.position);
    g.position.set(
      Math.sin(t) * radius,
      0.55 + Math.sin(t * 3.1) * 0.15 + Math.sin(t * 7) * 0.04,
      Math.sin(t * 1.6 + phase) * radius * 0.75
    );
    const dx = g.position.x - prev.current.x;
    const dz = g.position.z - prev.current.z;
    if (Math.abs(dx) + Math.abs(dz) > 1e-5) g.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={ref} scale={0.9}>
      <mesh rotation-x={Math.PI / 2}>
        <capsuleGeometry args={[0.012, 0.07, 3, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <Wings color={color} size={[0.11, 0.1]} speed={18} phase={phase} emissive={color} />
    </group>
  );
}

export function Birds() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const a = t * 0.35 + i * 0.45;
      const r = 2.6 + i * 0.25;
      g.position.set(Math.cos(a) * r, 2.3 + i * 0.18 + Math.sin(t * 1.3 + i) * 0.12, Math.sin(a) * r);
      // tangent of a circle travelling counter-clockwise
      g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a));
      g.rotation.z = -0.25; // bank into the turn
    });
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <mesh rotation-x={Math.PI / 2}>
            <coneGeometry args={[0.025, 0.12, 4]} />
            <meshStandardMaterial color="#e2e8f0" flatShading />
          </mesh>
          <Wings color="#f1f5f9" size={[0.16, 0.06]} speed={9} phase={i * 1.3} />
        </group>
      ))}
    </>
  );
}
