"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PresentationControls, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping, Vignette, N8AO, SMAA } from "@react-three/postprocessing";
import { ToneMappingMode, type BloomEffect } from "postprocessing";
import gsap from "gsap";
import * as THREE from "three";

import { SceneContext, STAGE_GLOW, clampStage, mulberry32, useScene, type SceneState } from "./scene-context";
import { Grow } from "./grow";
import { SkyBackdrop, CelestialRig, CloudLayer, Lights } from "./sky";
import { IslandBase } from "./island-base";
import { Sprout, Flower, GrassTuft, RoundTree, PineTree, Crystals } from "./flora";
import { terrainHeight } from "./layout";
import { Pond, Stream, Bridge, Waterfall, Lighthouse, POND, STREAM_POS, BRIDGE_POS, WATERFALL_POS } from "./landmarks";
import { CameraRig, StageFX } from "./effects";

export interface IslandSceneProps {
  stage: number;
  isNight: boolean;
  reducedMotion: boolean;
}

/* ───────────────────────── Static layout ───────────────────────── */

const FLOWERS = [
  [-0.55, 0.35, "#e8a0b4"],
  [1.05, -0.2, "#f3e3a0"],
  [-1.05, 1.05, "#b9a3d6"],
  [0.2, -0.95, "#e8a0b4"],
  [-1.85, -0.75, "#f3e3a0"],
  [1.8, -0.55, "#b9a3d6"],
] as const;

const PINES = [
  [-1.5, 0.45, 1.0],
  [-1.55, -1.5, 1.15],
  [-1.75, 1.6, 0.75],
] as const;

/** Flat stepping stones leading to the footbridge and across to the far bank */
const STEPS = [
  [-0.3, -0.58, 0.13], [0.3, -0.52, 0.11], [0.85, -0.38, 0.12], [1.35, -0.12, 0.11],
  [1.65, 0.2, 0.13], [1.69, 1.28, 0.12], [1.62, 1.58, 0.11], [1.35, 1.82, 0.13],
] as const;

const LIGHTHOUSE_POS = [1.35, 0, -1.35] as const;

function insidePond(x: number, z: number, pad = 0.15) {
  const dx = (x - POND.x) / (POND.r * POND.sx + pad);
  const dz = (z - POND.z) / (POND.r + pad);
  return dx * dx + dz * dz < 1;
}

function useTufts() {
  return useMemo(() => {
    const rand = mulberry32(1234);
    const out: { x: number; z: number; r: number }[] = [];
    while (out.length < 9) {
      const x = (rand() - 0.5) * 3.9;
      const z = (rand() - 0.5) * 3.9;
      if (insidePond(x, z)) continue;
      if (Math.abs(z - POND.z) < 0.3 && x > 1.2) continue; // stream
      if (Math.hypot(x - LIGHTHOUSE_POS[0], z - LIGHTHOUSE_POS[2]) < 0.45) continue;
      if (Math.hypot(x, z) < 0.42) continue; // heart sprout
      if (STEPS.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 0.3)) continue;
      out.push({ x, z, r: rand() * Math.PI });
    }
    return out;
  }, []);
}

/** HDR colour arrays so drei <Sparkles> punch through the bloom threshold */
function hdrColors(count: number, rgb: [number, number, number], jitter = 0.4) {
  const rand = mulberry32(count * 31);
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const k = 1 + (rand() - 0.5) * jitter;
    arr.set([rgb[0] * k, rgb[1] * k, rgb[2] * k], i * 3);
  }
  return arr;
}

/* ───────────────────────── The island itself ───────────────────────── */

function FloatingIsland({ stage, isNight }: { stage: number; isNight: boolean }) {
  const float = useRef<THREE.Group>(null);
  const squash = useRef<THREE.Group>(null);
  const tufts = useTufts();
  const fireflyColors = useMemo(() => hdrColors(55, [2.2, 3.0, 1.1]), []);

  useFrame(({ clock }) => {
    const g = float.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.position.y = Math.sin(t * 0.8) * 0.09;
    g.rotation.z = Math.sin(t * 0.5) * 0.015;
    g.rotation.x = Math.cos(t * 0.4) * 0.012;
  });

  return (
    <group ref={float}>
      <group ref={squash}>
        <IslandBase />

        {/* ── Stage 0 / 1: heart sprout ── */}
        <Grow show={stage === 0} delay={0.15} position={[0, terrainHeight(0, 0), 0]}>
          <Sprout />
        </Grow>
        <Grow show={stage >= 1} delay={0.1} scale={1.05} position={[0, terrainHeight(0, 0), 0]}>
          <Sprout bloom />
        </Grow>

        {/* ── Stage 1+: wildflowers, grass, stepping stones ── */}
        {FLOWERS.map(([x, z, c], i) => (
          <Grow key={`f${i}`} show={stage >= 1} delay={0.25 + i * 0.06} position={[x, terrainHeight(x, z), z]}>
            <Flower color={c} phase={i * 1.7} />
          </Grow>
        ))}
        {tufts.map((t, i) => (
          <Grow key={`t${i}`} show={stage >= 1} delay={0.1 + i * 0.03} spin={false} position={[t.x, terrainHeight(t.x, t.z), t.z]} rotation-y={t.r}>
            <GrassTuft phase={i} />
          </Grow>
        ))}

        {STEPS.map(([x, z, r], i) => (
          <Grow key={`s${i}`} show={stage >= 1} delay={0.2 + i * 0.07} spin={false} position={[x, terrainHeight(x, z), z]}>
            <mesh scale={[r * 1.15, 0.03, r]} rotation-y={i * 1.3} castShadow receiveShadow>
              <cylinderGeometry args={[1, 1.08, 1, 7]} />
              <meshStandardMaterial color={i % 2 ? "#aeada1" : "#9d9c91"} flatShading roughness={1} />
            </mesh>
          </Grow>
        ))}

        {/* ── Stage 2+: crystal pond, canopy trees, crystals ── */}
        <Grow show={stage >= 2} delay={0.1} spin={false} position={[POND.x, 0.03, POND.z]}>
          <Pond withDuck={stage >= 3} />
        </Grow>
        <Grow show={stage >= 2} delay={0.35} position={[-0.95, terrainHeight(-0.95, -0.7), -0.7]}>
          <RoundTree phase={0.4} fruit={stage >= 3} />
        </Grow>
        <Grow show={stage >= 2} delay={0.55} position={[0.35, terrainHeight(0.35, -1.25), -1.25]} scale={0.78}>
          <RoundTree phase={2.2} fruit={stage >= 4} />
        </Grow>
        <Grow show={stage >= 2} delay={0.75} position={[-0.6, terrainHeight(-0.6, 1.35), 1.35]}>
          <Crystals />
        </Grow>

        {/* ── Stage 3+: pines, stream, bridge ── */}
        {PINES.map(([x, z, s], i) => (
          <Grow key={`p${i}`} show={stage >= 3} delay={0.2 + i * 0.14} position={[x, terrainHeight(x, z), z]} scale={s}>
            <PineTree phase={i * 1.1} />
          </Grow>
        ))}
        <Grow show={stage >= 3} delay={0.1} spin={false} position={[...STREAM_POS]}>
          <Stream />
        </Grow>
        <Grow show={stage >= 3} delay={0.6} position={[...BRIDGE_POS]}>
          <Bridge />
        </Grow>

        {/* ── Stage 4: beacon lighthouse, waterfall ── */}
        <Grow show={stage >= 4} delay={0.2} position={[LIGHTHOUSE_POS[0], terrainHeight(LIGHTHOUSE_POS[0], LIGHTHOUSE_POS[2]), LIGHTHOUSE_POS[2]]}>
          <Lighthouse />
        </Grow>
        <Grow show={stage >= 4} delay={0.5} spin={false} position={[...WATERFALL_POS]}>
          <Waterfall />
        </Grow>

        {/* ── Resting twilight: fireflies ── */}
        <Grow show={isNight} delay={0.6} spin={false}>
          <Sparkles count={55} scale={[4.2, 1.6, 4.2]} position-y={0.8} size={3.2} speed={0.8} noise={2} color={fireflyColors} />
        </Grow>

        <StageFX stage={stage} squashRef={squash} />
      </group>
    </group>
  );
}

/* ───────────────────────── Post-processing ───────────────────────── */

function PostFX() {
  const { night, flash } = useScene();
  const bloom = useRef<BloomEffect>(null);
  useFrame(() => {
    // Matte by day; the glow only blooms as night falls or on a stage-up burst
    if (bloom.current) bloom.current.intensity = 0.4 + night.v * 0.8 + flash.v * 1.8;
  });
  return (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={0.55} distanceFalloff={1} intensity={1.4} quality="medium" halfRes />
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.3} intensity={0.4} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <SMAA />
      <Vignette offset={0.3} darkness={0.4} />
    </EffectComposer>
  );
}

/* ───────────────────────── Scene root ───────────────────────── */

function SceneRoot({ stage, isNight, reducedMotion }: IslandSceneProps) {
  const ctx = useScene();

  // Intro fly-in
  useEffect(() => {
    if (reducedMotion) {
      ctx.zoom.v = 1;
      return;
    }
    gsap.to(ctx.zoom, { v: 1, duration: 2.8, ease: "power3.out", delay: 0.1 });
  }, [ctx, reducedMotion]);

  // Day ↔ night crossfade
  useEffect(() => {
    gsap.to(ctx.night, {
      v: isNight ? 1 : 0,
      duration: reducedMotion ? 0 : 2.6,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, [ctx, isNight, reducedMotion]);

  // Horizon glow follows stage colour
  useEffect(() => {
    const c = new THREE.Color(STAGE_GLOW[stage]);
    gsap.to(ctx.glow, { r: c.r, g: c.g, b: c.b, duration: reducedMotion ? 0 : 1.8, ease: "sine.inOut", overwrite: true });
  }, [ctx, stage, reducedMotion]);

  return (
    <>
      <SkyBackdrop />
      <CelestialRig />
      <CameraRig />
      <Lights />
      <CloudLayer />
      <PresentationControls
        global
        cursor
        snap
        speed={1.6}
        polar={[-0.12, 0.22]}
        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        damping={0.3}
      >
        <FloatingIsland stage={stage} isNight={isNight} />
      </PresentationControls>
      <PostFX />
    </>
  );
}

export default function IslandScene({ stage, isNight, reducedMotion }: IslandSceneProps) {
  const safeStage = clampStage(stage);
  const ctx = useMemo<SceneState>(
    () => ({
      night: { v: isNight ? 1 : 0 },
      zoom: { v: reducedMotion ? 1 : 2.1 },
      flash: { v: 0 },
      glow: new THREE.Color(STAGE_GLOW[safeStage]),
      reducedMotion,
    }),
    // Created once: later prop changes are tweened by SceneRoot, not re-initialised.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [8.6 * 2.1, 6.0 * 2.1, 8.6 * 2.1], fov: 30, near: 0.1, far: 150 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <SceneContext.Provider value={ctx}>
        <SceneRoot stage={safeStage} isNight={isNight} reducedMotion={reducedMotion} />
      </SceneContext.Provider>
    </Canvas>
  );
}
