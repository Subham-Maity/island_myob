"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { STAGE_PALETTE, useScene } from "./scene-context";

/* ───────────────────────── Camera rig: intro fly-in, parallax, punch ───────────────────────── */

const CAM_BASE = new THREE.Vector3(8.6, 6.0, 8.6);
const CAM_TARGET = new THREE.Vector3(0, -0.45, 0);

export function CameraRig() {
  const { zoom } = useScene();
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => CAM_TARGET.clone(), []);

  useFrame(({ camera, pointer, clock, size }, dt) => {
    const t = clock.elapsedTime;
    // Pull back a touch on narrow (mobile) canvases so the island always fits
    const fit = Math.max(1, 1.5 / (size.width / size.height));
    const z = zoom.v * fit;
    desired.set(
      CAM_BASE.x * z + pointer.x * 0.9 + Math.sin(t * 0.17) * 0.35,
      CAM_BASE.y * z + pointer.y * 0.6 + Math.sin(t * 0.23) * 0.15,
      CAM_BASE.z * z - pointer.x * 0.9 + Math.cos(t * 0.17) * 0.35
    );
    camera.position.lerp(desired, 1 - Math.exp(-Math.min(dt, 0.1) * 3.5));
    camera.lookAt(look);
  });
  return null;
}

/* ───────────────────────── Stage-change FX: burst, shockwave, squash, punch ───────────────────────── */

const N = 220;

function useDotTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.85)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
}

export function StageFX({ stage, squashRef }: { stage: number; squashRef: RefObject<THREE.Group | null> }) {
  const { zoom, flash, reducedMotion } = useScene();
  const points = useRef<THREE.Points>(null);
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const tex = useDotTexture();
  const prev = useRef(stage);

  const data = useMemo(
    () => ({
      pos: new Float32Array(N * 3),
      vel: new Float32Array(N * 3),
      col: new Float32Array(N * 3),
      life: 0,
    }),
    []
  );

  useEffect(() => {
    const from = prev.current;
    prev.current = stage;
    if (from === stage || reducedMotion) return;
    const up = stage > from;
    const palette = STAGE_PALETTE[stage].map((c) => new THREE.Color(c).multiplyScalar(2.2));

    // 1. Particle eruption (fountain on level-up, gentle puff on rewind)
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 1.9;
      const out = up ? 0.4 + Math.random() * 1.8 : 0.2 + Math.random() * 0.6;
      const lift = up ? 2.8 + Math.random() * 4 : 0.8 + Math.random() * 1.4;
      data.pos.set([Math.cos(a) * r, 0.05, Math.sin(a) * r], i * 3);
      data.vel.set([Math.cos(a) * out, lift, Math.sin(a) * out], i * 3);
      const c = palette[i % palette.length];
      data.col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = points.current?.geometry;
    if (geo) {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    }
    data.life = 1;

    // 2. Shockwave rings rolling across the grass
    rings.current.forEach((m, k) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.color.copy(palette[k % palette.length]);
      m.visible = true;
      gsap.killTweensOf([m.scale, mat]);
      gsap.fromTo(
        m.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: 3.6, y: 3.6, z: 3.6, duration: 1.4, delay: k * 0.16, ease: "power2.out" }
      );
      gsap.fromTo(
        mat,
        { opacity: 0.95 },
        {
          opacity: 0,
          duration: 1.4,
          delay: k * 0.16,
          ease: "power1.in",
          onComplete: () => {
            m.visible = false;
          },
        }
      );
    });

    // 3. Squash & stretch the whole island
    const s = squashRef.current;
    if (s) {
      gsap.killTweensOf(s.scale);
      gsap
        .timeline()
        .to(s.scale, { x: 1.07, y: 0.86, z: 1.07, duration: 0.14, ease: "power2.out" })
        .to(s.scale, { x: 0.97, y: 1.08, z: 0.97, duration: 0.16, ease: "power2.out" })
        .to(s.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: "elastic.out(1.1, 0.3)" });
    }

    // 4. Camera punch + light flash
    gsap.killTweensOf(zoom);
    gsap
      .timeline()
      .to(zoom, { v: up ? 0.84 : 1.08, duration: 0.3, ease: "power2.out" })
      .to(zoom, { v: 1, duration: 1.6, ease: "elastic.out(1, 0.5)" });
    gsap.fromTo(flash, { v: up ? 1 : 0.4 }, { v: 0, duration: 1.2, ease: "power2.out" });
  }, [stage, reducedMotion, data, squashRef, zoom, flash]);

  useFrame((_, dt) => {
    const p = points.current;
    if (!p) return;
    if (data.life <= 0) {
      p.visible = false;
      return;
    }
    p.visible = true;
    const d = Math.min(dt, 0.05);
    data.life -= d / 2.2;
    const drag = 1 - 0.9 * d;
    for (let i = 0; i < N; i++) {
      const k = i * 3;
      data.vel[k + 1] -= 5.5 * d;
      data.vel[k] *= drag;
      data.vel[k + 2] *= drag;
      data.pos[k] += data.vel[k] * d;
      data.pos[k + 1] += data.vel[k + 1] * d;
      data.pos[k + 2] += data.vel[k + 2] * d;
    }
    p.geometry.attributes.position.needsUpdate = true;
    if (pointsMat.current) pointsMat.current.opacity = Math.pow(Math.max(0, data.life), 0.6);
  });

  return (
    <>
      <points ref={points} visible={false} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMat}
          size={0.16}
          map={tex}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          sizeAttenuation
        />
      </points>
      {[0, 1].map((k) => (
        <mesh
          key={k}
          ref={(el) => {
            rings.current[k] = el;
          }}
          rotation-x={-Math.PI / 2}
          position-y={0.04}
          visible={false}
        >
          <ringGeometry args={[0.92, 1, 64]} />
          <meshBasicMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}
