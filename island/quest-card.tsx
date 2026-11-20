// client/app/(dashboard)/_gamification/components/island/quest-card.tsx
"use client";

import React, { useState } from "react";
import {
  ArrowsLeftRight,
  CheckCircle,
  CaretDown,
  CaretUp,
  Info,
  Sparkle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QuestSnapshot } from "@/types/gamification-types";
import { RATING_OPTIONS } from "@/styles/tokens";
import { cn } from "@/lib/utils";

export interface QuestCardProps {
  quest: QuestSnapshot | null;
  swapsLeft: number;
  onSwap: () => void;
  onRate: (feedback: "up" | "neutral" | "down") => void;
  feedbackGiven: "up" | "neutral" | "down" | null;
  isSwapPending?: boolean;
  isFeedbackPending?: boolean;
}

export function QuestCard({
  quest,
  swapsLeft,
  onSwap,
  onRate,
  feedbackGiven,
  isSwapPending = false,
  isFeedbackPending = false,
}: QuestCardProps): React.JSX.Element {
  const [isWhyOpen, setIsWhyOpen] = useState(false);

  if (!quest) {
    return (
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 text-center text-xs text-zinc-400">
        Missions calm. Log activity to nurture your Habit Island!
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.max(0, quest.progressRatio * 100));
  const isCompleted = quest.status === "COMPLETED";

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 space-y-3.5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest font-mono">
            Weekly Quest
          </span>
          {quest.origin === "LLM" && (
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
              AI Tailored
            </span>
          )}
          {isCompleted && (
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <span className="font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
          +{quest.xpReward} XP
        </span>
      </div>

      {/* Quest Title & Description */}
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          {quest.title}
        </h3>
        <p className="text-sm text-zinc-400 leading-snug mt-1">
          {quest.subtitle}
        </p>
      </div>

      {/* Dot Progress & Progress Bar */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            {/* Dot Progress Indicator */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, Math.max(1, quest.targetValue)) }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i < quest.currentValue
                      ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                      : "bg-zinc-700"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-zinc-300 ml-1">
              {quest.currentValue} / {quest.targetValue} completed
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">{quest.daysRemaining} days left</span>
        </div>

        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              isCompleted
                ? "bg-emerald-400"
                : "bg-gradient-to-r from-cyan-400 to-emerald-400"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Why This Quest Accordion */}
      {quest.copyWhy && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setIsWhyOpen(!isWhyOpen)}
            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isWhyOpen ? <CaretUp size={12} /> : <CaretDown size={12} />}
            <span>Why this quest?</span>
          </button>
          {isWhyOpen && (
            <div className="mt-1.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-xs text-zinc-400 space-y-1 leading-relaxed">
              <p>{quest.copyWhy}</p>
              <p className="text-[10px] text-zinc-500 italic">
                Quests are a habit game, not financial advice.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Row: Swap & Rating */}
      <div className="pt-2 border-t border-zinc-800/60 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          {/* Left: Swap Button + Explainer Popover */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={swapsLeft === 0 || isSwapPending}
              onClick={onSwap}
              className="h-8 px-2.5 text-xs font-mono border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowsLeftRight size={13} className="text-cyan-400" />
              <span>Swap Quest</span>
              <span className="text-[10px] text-zinc-500">({swapsLeft} left)</span>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="What is swap quest?"
                  className="text-zinc-500 hover:text-cyan-400 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Info size={14} weight="bold" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-72 bg-zinc-950/95 backdrop-blur border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs space-y-2 z-50 text-zinc-200"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono text-[11px] tracking-wide uppercase border-b border-zinc-800/80 pb-1">
                  <ArrowsLeftRight size={13} />
                  <span>Weekly Swap (1 / Week)</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Doesn&apos;t fit your week? You get 1 free swap per week to replace this quest with an alternative challenge tailored to your goals.
                </p>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right: Segmented Rating Control + Explainer Popover */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
              <span>Rate:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="How does quest rating work?"
                    className="text-zinc-500 hover:text-cyan-400 p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Info size={14} weight="bold" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="end"
                  className="w-80 bg-zinc-950/95 backdrop-blur border border-zinc-800 p-3.5 rounded-xl shadow-2xl text-xs space-y-2.5 z-50 text-zinc-200"
                >
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono text-[11px] tracking-wide uppercase border-b border-zinc-800/80 pb-1.5">
                    <Sparkle size={14} weight="fill" />
                    <span>AI Quest Personalization</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Rating trains adaptive AI so weekly missions align with your financial routine:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-start gap-2 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg text-emerald-300">
                      <span className="text-sm">😄</span>
                      <div>
                        <span className="font-bold text-emerald-300">Love it (+20% Frequency):</span>
                        <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                          Tells AI you enjoy this challenge. You&apos;ll see similar quests more often.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300">
                      <span className="text-sm">😐</span>
                      <div>
                        <span className="font-bold text-zinc-200">OK (Neutral):</span>
                        <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                          Balanced preference — keeps this quest in standard rotation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg text-amber-300">
                      <span className="text-sm">😑</span>
                      <div>
                        <span className="font-bold text-amber-300">Meh (-60% Frequency):</span>
                        <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                          Slits the score down so missions you dislike won&apos;t keep showing up.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 italic pt-1 border-t border-zinc-800/60">
                    Quests adapt each week to build stress-free money habits.
                  </p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-800">
              {RATING_OPTIONS.map((opt) => {
                const isSelected = feedbackGiven === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isFeedbackPending || feedbackGiven !== null}
                    onClick={() => onRate(opt.value)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-all flex items-center gap-1 cursor-pointer min-h-[30px]",
                      isSelected
                        ? "bg-cyan-950 border border-cyan-500/50 text-cyan-200 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60",
                      feedbackGiven !== null && !isSelected && "opacity-40 cursor-default"
                    )}
                    title={`${opt.label} (${opt.value === 'up' ? '+20% frequency' : opt.value === 'down' ? '-60% frequency' : 'neutral'})`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="text-[10px] hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Status Note After Rating */}
        {feedbackGiven && (
          <div className="flex items-center justify-end text-[10px] font-mono pt-1">
            {feedbackGiven === "up" && (
              <span className="text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                😄 Rated: More quests like this will be recommended (+20%)
              </span>
            )}
            {feedbackGiven === "neutral" && (
              <span className="text-zinc-400 flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                😐 Rated: Balanced variety maintained
              </span>
            )}
            {feedbackGiven === "down" && (
              <span className="text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                😑 Rated: Quests like this will be avoided (-60%)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

