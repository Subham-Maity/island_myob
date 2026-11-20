"use client";

import React, { useState } from "react";
import {
  IslandHero,
  StatTrio,
  QuestCard,
  TodayStatusBar,
  PauseShieldSection,
  CalmModeFooter,
  SwapModal,
} from "@/island";
import { INITIAL_MOCK_DATA, STAGE_PRESETS } from "@/lib/mock-data";
import { Sun, Moon, Sparkle, ArrowClockwise, Sliders } from "@phosphor-icons/react";

export default function IslandPlayground(): React.JSX.Element {
  const [data, setData] = useState(INITIAL_MOCK_DATA);
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "neutral" | "down" | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [showFullEcosystem, setShowFullEcosystem] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>("Playground loaded with anonymous mock data.");

  // Handle stage change
  const handleSelectStage = (stageIdx: number) => {
    const preset = STAGE_PRESETS[stageIdx];
    setData((prev) => ({
      ...prev,
      stage: preset.stage,
      stageName: preset.stageName,
      habitPoints: preset.points,
      pointsToNext: preset.pointsToNext,
    }));
    setLastAction(`Switched to ${preset.icon} Stage ${preset.stage}: ${preset.stageName}`);
  };

  // Toggle day / night mode
  const handleToggleNight = () => {
    setData((prev) => ({
      ...prev,
      isResting: !prev.isResting,
    }));
    setLastAction(!data.isResting ? "Toggled to 🌙 Resting Twilight (Night mode)" : "Toggled to ☀️ Daytime mode");
  };

  // Handle quest rating
  const handleRateQuest = (rating: "up" | "neutral" | "down") => {
    setFeedbackGiven(rating);
    const label = rating === "up" ? "Love it (+20%)" : rating === "down" ? "Meh (-60%)" : "OK (Neutral)";
    setLastAction(`Rated Quest: ${label}`);
  };

  // Handle quest swap
  const handleConfirmSwap = (reason: "NOT_RELEVANT" | "TOO_HARD" | "INCOME_LANDED" | "OTHER") => {
    setIsSwapModalOpen(false);
    setData((prev) => ({
      ...prev,
      quest: {
        ...prev.quest,
        title: "Alternative Habit Sprint",
        subtitle: "A fresh weekly challenge tailored to your goals.",
        swapsRemaining: 0,
      },
    }));
    setLastAction(`Quest swapped (Reason: ${reason}). Swaps left: 0`);
  };

  // Randomize mock data
  const handleRandomizeData = () => {
    const randomStage = Math.floor(Math.random() * 5);
    const preset = STAGE_PRESETS[randomStage];
    const randomNW = Math.floor(Math.random() * 50000) + 10000;
    const nextGoal = Math.ceil(randomNW / 10000) * 10000;
    const prevGoal = nextGoal - 10000;
    setData((prev) => ({
      ...prev,
      stage: preset.stage,
      stageName: preset.stageName,
      habitPoints: preset.points + Math.floor(Math.random() * 10),
      pointsToNext: preset.pointsToNext,
      milestoneData: {
        ...prev.milestoneData,
        currentNW: randomNW,
        prevMilestone: prevGoal,
        nextMilestone: nextGoal,
        gapAmount: nextGoal - randomNW,
        weeksAtPace: Math.floor(Math.random() * 8) + 2,
      },
    }));
    setLastAction("Randomized milestone & stage values!");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        {/* ── Top Brand Header ── */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-mono tracking-tight text-white">
                ISLAND<span className="text-cyan-400">MYOB</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold">
                Dev Playground
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Living Habit Island & Milestone Redesign Sandbox
            </p>
          </div>

          <button
            type="button"
            onClick={handleRandomizeData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
            title="Randomize mock values"
          >
            <ArrowClockwise size={13} />
            <span>Randomize</span>
          </button>
        </div>

        {/* ── Interactive Dev Control Toolbar ── */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold text-zinc-200">
              <Sliders size={14} className="text-cyan-400" />
              <span>STAGE & LIGHTING CONTROLS</span>
            </span>
            <span className="text-[11px] text-zinc-500">Instant Preview</span>
          </div>

          {/* Stage Buttons */}
          <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
            {STAGE_PRESETS.map((p, idx) => (
              <button
                key={p.stage}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer border ${
                  data.stage === p.stage
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <div>{p.icon}</div>
                <div className="text-[9px] truncate">Stg {p.stage}</div>
              </button>
            ))}
          </div>

          {/* Second Row: Day/Night Toggle & Ecosystem Toggle */}
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap text-xs font-mono">
            <button
              type="button"
              onClick={handleToggleNight}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                data.isResting
                  ? "bg-indigo-950/80 border-indigo-700/60 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                  : "bg-amber-950/40 border-amber-800/40 text-amber-300"
              }`}
            >
              {data.isResting ? (
                <>
                  <Moon size={14} weight="fill" />
                  <span>Night / Resting (Active)</span>
                </>
              ) : (
                <>
                  <Sun size={14} weight="fill" />
                  <span>Daytime Mode (Active)</span>
                </>
              )}
            </button>

            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-400 hover:text-zinc-200 select-none">
              <input
                type="checkbox"
                checked={showFullEcosystem}
                onChange={(e) => setShowFullEcosystem(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
              <span>Show Full Tab Ecosystem</span>
            </label>
          </div>
        </div>

        {/* ── Action Activity Log ── */}
        {lastAction && (
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Sparkle size={13} weight="fill" className="text-cyan-400 shrink-0" />
            <span className="truncate">{lastAction}</span>
          </div>
        )}

        {/* ── PRIMARY TARGET: The Habit Island Hero Card ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span className="uppercase tracking-wider font-bold text-zinc-300">
              Target Component: &lt;IslandHero /&gt;
            </span>
            <span className="text-[10px] text-zinc-500">island/island-hero.tsx</span>
          </div>

          <IslandHero
            biomeStage={data.stage}
            biomeName={data.stageName}
            habitPoints={data.habitPoints}
            pointsToNext={data.pointsToNext}
            isResting={data.isResting}
            milestoneData={data.milestoneData}
          />
        </section>

        {/* ── COMPLEMENTARY ECOSYSTEM: Full Streak & Habits Components ── */}
        {showFullEcosystem && (
          <div className="space-y-3.5 pt-4 border-t border-zinc-800/80">
            <div className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400 px-1">
              Complementary Streak & Quest Components
            </div>

            {/* Stat Trio */}
            <StatTrio
              streak={data.streak.currentStreak}
              clarityScore={data.clarityScore}
              impulsesSavedAmount={data.impulsesSaved}
              currency={data.currency}
            />

            {/* Weekly Quest Card */}
            <QuestCard
              quest={data.quest}
              swapsLeft={data.quest.swapsRemaining ?? 1}
              onSwap={() => setIsSwapModalOpen(true)}
              onRate={handleRateQuest}
              feedbackGiven={feedbackGiven}
            />

            {/* Today Status Bar */}
            <TodayStatusBar
              isActiveToday={data.streak.isActiveToday}
              spentToday={0}
              activityType={data.streak.todayActivityType}
              currency={data.currency}
              onNoSpend={() => setLastAction('Clicked "No spend today" action!')}
              onRevert={() => setLastAction('Clicked "Revert" action!')}
              isNoSpendPending={false}
              isRevertPending={false}
            />

            {/* Pause Missions Shield */}
            <PauseShieldSection
              isShieldActive={false}
              shieldEndsAt={null}
              onPause={(days) => setLastAction(`Shield paused for ${days} days!`)}
              onResume={() => setLastAction("Resumed missions!")}
            />

            {/* Calm Mode Footer */}
            <CalmModeFooter
              isCalmModeActive={false}
              onToggle={() => setLastAction("Toggled Calm Mode")}
            />
          </div>
        )}

        {/* ── Swap Quest Modal ── */}
        <SwapModal
          open={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          currentQuest={data.quest}
          swapsLeft={data.quest.swapsRemaining ?? 1}
          onConfirmSwap={handleConfirmSwap}
          isPending={false}
        />
      </div>
    </main>
  );
}

