import { createContext, useContext } from "react";
import type { Color } from "three";

/**
 * Mutable, frame-loop friendly scene state.
 * GSAP tweens these plain objects; components read them inside useFrame
 * so transitions never trigger React re-renders.
 */
export interface SceneState {
  /** 0 = day, 1 = night (tweened) */
  night: { v: number };
  /** Camera distance multiplier (1 = rest). Used for intro fly-in + stage punch. */
  zoom: { v: number };
  /** 0..1 light flash on stage transitions */
  flash: { v: number };
  /** Tinted horizon glow, follows the current stage colour */
  glow: Color;
  reducedMotion: boolean;
}

export const SceneContext = createContext<SceneState | null>(null);

export function useScene(): SceneState {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene must be used inside <SceneContext.Provider>");
  return ctx;
}

/** Per-stage colour palettes (index = biome stage 0..4) */
export const STAGE_PALETTE: readonly (readonly [string, string, string])[] = [
  ["#4ade80", "#bbf7d0", "#22c55e"],
  ["#2dd4bf", "#f472b6", "#fde047"],
  ["#22d3ee", "#a5f3fc", "#67e8f9"],
  ["#c084fc", "#e9d5ff", "#4ade80"],
  ["#fbbf24", "#fde68a", "#f87171"],
];

export const STAGE_GLOW = ["#22c55e", "#14b8a6", "#06b6d4", "#a855f7", "#eab308"] as const;

export function clampStage(stage: number): number {
  return Math.max(0, Math.min(4, Math.round(stage)));
}

/** Deterministic PRNG so scattered props never jump between renders */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
