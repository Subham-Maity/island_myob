// client/app/(dashboard)/_gamification/components/island/hero-header.tsx
"use client";

import React from "react";
import { Sparkle, Gear, Shield } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface HeroHeaderProps {
  streak: number;
  bestStreak: number;
  xpTotal: number;
  freezeShieldsUsed: number;
  freezeShieldsMax: number;
  onSettingsClick?: () => void;
}

export function HeroHeader({
  streak,
  bestStreak,
  xpTotal,
  freezeShieldsUsed,
  freezeShieldsMax,
  onSettingsClick,
}: HeroHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>🔥</span>
          <span>{streak}-Day Streak!</span>
        </h2>
        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-1 font-mono">
          <span>Best: {bestStreak}d</span>
          <span>•</span>
          <div className="flex items-center gap-1.5" title={`${freezeShieldsUsed}/${freezeShieldsMax} Shields Banked`}>
            <Shield weight="fill" className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex items-center gap-1">
              {Array.from({ length: freezeShieldsMax }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full border transition-all",
                    idx < freezeShieldsUsed
                      ? "bg-cyan-400 border-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                      : "bg-zinc-800 border-zinc-700"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 ml-0.5">
              {freezeShieldsUsed}/{freezeShieldsMax} Shield
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/50 text-amber-400 font-bold font-mono text-xs shadow-sm xp-badge-pop">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-amber-400" />
          <span>+{xpTotal} XP</span>
        </div>
        {onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Open Playstyle & Settings"
            aria-label="Settings"
          >
            <Gear weight="bold" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

