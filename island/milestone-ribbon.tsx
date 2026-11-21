// client/app/(dashboard)/_gamification/components/island/milestone-ribbon.tsx
"use client";

import React from "react";
import { TrendUp } from "@phosphor-icons/react";

export interface MilestoneRibbonProps {
  currentNW: number;
  prevMilestone: number;
  nextMilestone: number;
  gapAmount: number;
  weeksAtPace: number | null;
  currency: string;
  disclaimer?: string;
}

export function MilestoneRibbon({
  currentNW,
  prevMilestone,
  nextMilestone,
  gapAmount,
  weeksAtPace,
  currency,
  disclaimer,
}: MilestoneRibbonProps): React.JSX.Element {
  const range = nextMilestone - prevMilestone;
  const progressRatio = range > 0 ? Math.min(100, Math.max(0, ((currentNW - prevMilestone) / range) * 100)) : 0;

  return (
    <div className="p-3 rounded-xl bg-black/25 border border-white/15 backdrop-blur-md space-y-2 font-mono">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <TrendUp weight="bold" className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-zinc-200 text-xs">Next Milestone</span>
          {prevMilestone > 0 && (
            <span className="text-[10px] text-zinc-500 hidden sm:inline">
              (Prev: {currency} {prevMilestone.toLocaleString()})
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="font-bold text-amber-400 text-xs">
            {currency} {nextMilestone.toLocaleString()}
          </span>
          <span className="text-[10px] text-zinc-400 ml-1.5">
            ({currency} {gapAmount.toLocaleString()} gap)
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 transition-all duration-500"
          style={{ width: `${progressRatio}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500">
        <span>Current NW: {currency} {currentNW.toLocaleString()}</span>
        <span title={disclaimer ?? "Estimated pace based on recent confirmed transactions"} className="cursor-help text-zinc-400">
          ≈ {weeksAtPace ?? 5} wks at pace ⓘ
        </span>
      </div>
    </div>
  );
}

