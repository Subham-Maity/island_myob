// client/app/(dashboard)/_gamification/components/island/island-hero.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Info,
  Eye,
  Play,
  Pause,
  X,
} from "@phosphor-icons/react";
import { MilestoneRibbon, MilestoneRibbonProps } from "./milestone-ribbon";
import { IslandAnimation } from "./island-animation";
import { IslandInfoDialog } from "./island-info-dialog";
import { BIOME_STAGE_GLOWS } from "@/styles/tokens";
import { cn } from "@/lib/utils";

// ── 60-Second Full Lifecycle Preview Stages ──
const PREVIEW_STAGES = [
  {
    stage: 0,
    stageName: "Seedling Patch",
    isNight: false,
    timeLabel: "🌱 Day 1",
    streakDays: 1,
    clarity: 45,
    impulsesSaved: 500,
    description: "Day 1: Fresh soil mound with morning dew and young green sprout 🌱",
  },
  {
    stage: 1,
    stageName: "Sunlit Sprout",
    isNight: false,
    timeLabel: "🌸 Wk 2",
    streakDays: 14,
    clarity: 72,
    impulsesSaved: 2800,
    description: "Week 2: Lush grass expands as vibrant wildflowers bloom across the biome 🌿🌸",
  },
  {
    stage: 2,
    stageName: "Crystal Grove",
    isNight: false,
    timeLabel: "🌳 Mo 1",
    streakDays: 32,
    clarity: 88,
    impulsesSaved: 9500,
    description: "Month 1: Leafy canopy trees grow and a sparkling crystal pond appears 🌳💧",
  },
  {
    stage: 3,
    stageName: "Bloom Meadow",
    isNight: false,
    timeLabel: "🌲 Mo 2",
    streakDays: 60,
    clarity: 94,
    impulsesSaved: 18000,
    description: "Month 2: Evergreen pine forest forms with an arched stone footbridge 🌲🦆",
  },
  {
    stage: 4,
    stageName: "Beacon Island",
    isNight: false,
    timeLabel: "🗼 Mo 3+",
    streakDays: 95,
    clarity: 98,
    impulsesSaved: 35000,
    description: "Month 3+: Cascading waterfall & glowing red-and-white lighthouse with sweeping beam 🗼🌊",
  },
  {
    stage: 4,
    stageName: "Resting Twilight",
    isNight: true,
    timeLabel: "🌙 Night",
    streakDays: 95,
    clarity: 98,
    impulsesSaved: 35000,
    description: "Vacation / Away: Never dies! The island rests under a peaceful starry night with fireflies 🌙✨",
  },
];

export interface IslandHeroProps {
  biomeStage: number;
  biomeName: string;
  habitPoints: number;
  pointsToNext: number;
  isResting: boolean;
  milestoneData?: MilestoneRibbonProps | null;
}

export function IslandHero({
  biomeStage,
  biomeName,
  habitPoints,
  pointsToNext,
  isResting,
  milestoneData,
}: IslandHeroProps): React.JSX.Element {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [simProgressSec, setSimProgressSec] = useState(0);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // 60s Loop Timer
  useEffect(() => {
    if (!isPreviewOpen || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setSimProgressSec((prev) => {
        const next = (prev + 1) % 60;
        const newStep = Math.min(5, Math.floor(next / 10));
        setSelectedStepIndex(newStep);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPreviewOpen, isAutoPlaying]);

  const activePreset = isPreviewOpen ? PREVIEW_STAGES[selectedStepIndex] : null;
  const activeStage = activePreset ? activePreset.stage : biomeStage;
  const activeIsNight = activePreset ? activePreset.isNight : isResting;
  const activeStageName = activePreset ? activePreset.stageName : biomeName;
  const glowShadow =
    activeStage in BIOME_STAGE_GLOWS
      ? BIOME_STAGE_GLOWS[activeStage as keyof typeof BIOME_STAGE_GLOWS]
      : BIOME_STAGE_GLOWS[0];

  const handleSelectStep = (index: number) => {
    setSelectedStepIndex(index);
    setSimProgressSec(index * 10);
    setIsAutoPlaying(false);
  };

  const handleStartSimulation = () => {
    setIsPreviewOpen(true);
    setIsAutoPlaying(true);
    setSimProgressSec(0);
    setSelectedStepIndex(0);
  };

  return (
    <>
      <div className={cn("rounded-2xl transition-shadow duration-700", glowShadow)}>
      <div className="glass relative overflow-hidden w-full rounded-2xl p-4 space-y-3">
        {/* 1. Header Ribbon on Top of Island */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="font-display text-[19px] italic font-normal tracking-tight text-white"
              style={{ fontVariationSettings: '"SOFT" 100, "opsz" 72' }}
            >
              Habit Island
            </span>
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative inline-flex overflow-hidden text-xs font-bold text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeStageName}
                  initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -14, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className="whitespace-nowrap"
                >
                  {activeStageName}
                </motion.span>
              </AnimatePresence>
            </motion.span>

            {/* Info (i) button */}
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1 rounded-md text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="How Habit Island works"
              aria-label="How Habit Island works"
            >
              <Info size={15} weight="bold" />
            </button>

            {/* Preview 60s Cycle Button */}
            {!isPreviewOpen && (
              <button
                type="button"
                onClick={handleStartSimulation}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
                title="Watch 60s full growth simulation"
              >
                <Eye size={12} weight="bold" />
                <span>Preview 60s</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {isPreviewOpen ? (
              <span className="text-cyan-300 font-bold text-[10px] bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            ) : (
              <>
                <span className="text-zinc-200 font-bold">{habitPoints} pts</span>
                {pointsToNext > 0 ? (
                  <span className="text-zinc-500 text-[10px]">
                    ({pointsToNext} to Next)
                  </span>
                ) : (
                  <span className="text-amber-400 text-[10px]">Max Stage</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 2. Simulation Preview Toolbar (When in Demo Mode) */}
        <AnimatePresence initial={false}>
        {isPreviewOpen && (
          <motion.div
            key="sim-toolbar"
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
          <div className="p-2.5 rounded-xl glass-dark !border-cyan-300/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Simulation Preview ({simProgressSec}s / 60s)
                </span>

                <button
                  type="button"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause size={10} weight="fill" /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={10} weight="fill" /> Resume
                    </>
                  )}
                </button>
              </div>

              {/* Step Pills */}
              <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
                {PREVIEW_STAGES.map((s, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.92 }}
                    className={cn(
                      "relative px-2 py-0.5 rounded cursor-pointer transition-colors border",
                      selectedStepIndex === idx
                        ? "border-transparent text-cyan-100 font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {selectedStepIndex === idx && (
                      <motion.span
                        layoutId="island-step-pill"
                        className="absolute inset-0 rounded bg-cyan-500/30 border border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                        transition={{ type: "spring", stiffness: 500, damping: 34 }}
                      />
                    )}
                    <span className="relative">{s.timeLabel}</span>
                  </motion.button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[10px] font-mono font-semibold cursor-pointer transition-all ml-auto"
              >
                <X size={11} weight="bold" />
                <span>Exit Demo</span>
              </button>
            </div>

            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000 ease-linear"
                style={{ width: `${(simProgressSec / 60) * 100}%` }}
              />
            </div>
            <div className="text-[11px] font-sans text-cyan-200/90 flex items-center justify-between gap-2 min-h-[1.25rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={selectedStepIndex}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {PREVIEW_STAGES[selectedStepIndex].description}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] text-zinc-500">
                Step {selectedStepIndex + 1} of 6
              </span>
            </div>
          </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* 3. Standalone Isometric Animation Canvas */}
        <IslandAnimation
          stage={activeStage}
          stageName={activeStageName}
          isNight={activeIsNight}
        />

        {/* 4. Standalone Net Worth Milestone Ribbon */}
        {milestoneData && <MilestoneRibbon {...milestoneData} />}
      </div>
      </div>

      {/* 5. Standalone Info Modal */}
      <IslandInfoDialog
        open={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        onStartSimulation={handleStartSimulation}
      />
    </>
  );
}
