// client/app/(dashboard)/_gamification/components/island/island-animation.tsx
"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IslandAnimationSvg } from "./island-animation-svg";

export interface IslandAnimationProps {
  /** Growth stage from 0 to 4 (0: Seedling, 1: Sprout, 2: Grove, 3: Meadow, 4: Beacon) */
  stage: number;
  /** Name of the current biome/stage */
  stageName: string;
  /** Whether the island is in resting twilight / night mode */
  isNight?: boolean;
  /** Optional container class overrides */
  className?: string;
}

const IslandScene = dynamic(() => import("./scene/island-scene"), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="h-16 w-16 rounded-2xl border border-emerald-500/40 bg-emerald-500/10"
        animate={{ rotate: [45, 225], scale: [0.85, 1, 0.85] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── client capability probes (stable across renders, SSR-safe) ── */

let webglCache: boolean | null = null;
function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const noop = () => () => {};
function useWebGL(): boolean | null {
  return useSyncExternalStore(noop, hasWebGL, () => null);
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/**
 * Habit Island Living Animation Canvas
 * Real-time three.js scene (React Three Fiber) with GSAP-driven growth, a day/night
 * cycle, bloom post-processing and Framer Motion UI overlays. Falls back to the
 * legacy SVG when WebGL isn't available.
 */
export function IslandAnimation({
  stage,
  stageName,
  isNight = false,
  className,
}: IslandAnimationProps): React.JSX.Element {
  const webgl = useWebGL();
  const reducedMotion = useReducedMotion();

  // "Stage Up" toast whenever the stage climbs
  const prevStage = useRef(stage);
  const [toast, setToast] = useState<{ id: number; name: string } | null>(null);
  useEffect(() => {
    const prev = prevStage.current;
    prevStage.current = stage;
    if (stage === prev) return;
    setToast(stage > prev ? { id: Date.now(), name: stageName } : null);
  }, [stage, stageName]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  // Drag hint fades out after the first interaction
  const [interacted, setInteracted] = useState(false);

  if (webgl === false) {
    return <IslandAnimationSvg stage={stage} stageName={stageName} isNight={isNight} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative w-full h-60 sm:h-72 rounded-xl overflow-hidden bg-zinc-950/30 border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_40px_-12px_rgba(10,8,40,0.6)] select-none",
        className
      )}
      role="img"
      aria-label={`Habit Island Stage ${stage}: ${stageName}${isNight ? " (resting)" : ""}`}
      onPointerDown={() => setInteracted(true)}
    >
      {webgl && <IslandScene stage={stage} isNight={isNight} reducedMotion={reducedMotion} />}

      {/* Stage-up toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2"
            initial={{ opacity: 0, y: -24, scale: 0.6, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, scale: 0.9, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <div className="relative flex items-center gap-2 overflow-hidden rounded-full border border-amber-300/50 bg-zinc-950/80 px-3.5 py-1 shadow-[0_0_24px_rgba(251,191,36,0.35)] backdrop-blur">
              <motion.span
                className="absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ left: "-20%" }}
                animate={{ left: "120%" }}
                transition={{ duration: 0.9, delay: 0.25, ease: "easeInOut" }}
              />
              <motion.span
                className="text-amber-300 text-xs"
                animate={{ rotate: [0, 180, 360], scale: [1, 1.4, 1] }}
                transition={{ duration: 0.9 }}
              >
                ✦
              </motion.span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-200">
                Stage Up
              </span>
              <span className="text-[11px] font-mono font-semibold text-zinc-100">{toast.name}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resting twilight banner */}
      <AnimatePresence>
        {isNight && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="text-[11px] font-mono text-indigo-200 bg-indigo-950/70 border border-indigo-600/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm"
              animate={{ boxShadow: ["0 0 0px rgba(129,140,248,0)", "0 0 18px rgba(129,140,248,0.45)", "0 0 0px rgba(129,140,248,0)"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              Island Resting — Log activity to greet the dawn
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag hint */}
      <AnimatePresence>
        {webgl && !interacted && !isNight && (
          <motion.span
            className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-mono text-zinc-400/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
          >
            ↻ drag to spin
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
