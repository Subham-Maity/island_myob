// client/app/(dashboard)/_gamification/components/island/stat-trio.tsx
"use client";

import React from "react";
import { Fire, Brain, Coins } from "@phosphor-icons/react";

export interface StatTrioProps {
  streak: number;
  clarityScore: number;
  impulsesSavedAmount: number;
  currency: string;
}

export function StatTrio({
  streak,
  clarityScore,
  impulsesSavedAmount,
  currency,
}: StatTrioProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {/* 1. Active Streak */}
      <div className="p-3 rounded-xl glass-soft text-center stat-count-in">
        <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Fire weight="fill" className="w-3.5 h-3.5 text-amber-500" />
          <span>Active Streak</span>
        </div>
        <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-1 font-mono">
          {streak}d
        </div>
      </div>

      {/* 2. Clarity Score */}
      <div className="p-3 rounded-xl glass-soft text-center stat-count-in">
        <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Brain weight="fill" className="w-3.5 h-3.5 text-emerald-400" />
          <span>Clarity Score</span>
        </div>
        <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 font-mono">
          {clarityScore}
          <span className="text-xs text-zinc-500 font-normal">/100</span>
        </div>
      </div>

      {/* 3. Impulses Saved */}
      <div className="p-3 rounded-xl glass-soft text-center stat-count-in">
        <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Coins weight="fill" className="w-3.5 h-3.5 text-amber-400" />
          <span>Impulses Saved</span>
        </div>
        <div className="text-base sm:text-lg font-bold text-amber-400 mt-1 font-mono truncate" title={`${currency} ${impulsesSavedAmount.toLocaleString()}`}>
          {currency} {impulsesSavedAmount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

