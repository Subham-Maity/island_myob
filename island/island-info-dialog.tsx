// client/app/(dashboard)/_gamification/components/island/island-info-dialog.tsx
"use client";

import React from "react";
import { Sparkle, Eye } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface IslandInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartSimulation: () => void;
}

export function IslandInfoDialog({
  open,
  onOpenChange,
  onStartSimulation,
}: IslandInfoDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-950 border border-zinc-800 text-zinc-100 p-5 rounded-2xl shadow-2xl game-custom-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkle weight="fill" className="w-5 h-5 text-amber-400" />
            <DialogTitle className="text-base font-bold font-mono text-zinc-100">
              Island Myob — Living Habit World
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Your financial consistency physically grows an isometric living world.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs pt-2">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="font-semibold text-zinc-200">🎯 The Zero-Guilt Philosophy</div>
            <p className="text-zinc-400 leading-relaxed text-[11.5px]">
              Your island <strong className="text-zinc-200">never withers or dies</strong>.
              If you don&apos;t log for 3+ days, the sun gently sets and your island enters Resting Twilight with crescent moon, stars, and fireflies. When you log again, sunlight returns immediately!
            </p>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="font-bold text-zinc-200">🌱 Growth Stages:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">🌱 Stage 0: Seedling Patch (Day 1)</div>
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">🌸 Stage 1: Sunlit Sprout (Wk 2)</div>
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">🌳 Stage 2: Crystal Grove (Mo 1)</div>
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">🌲 Stage 3: Bloom Meadow (Mo 2)</div>
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 sm:col-span-2">🗼 Stage 4: Beacon Island (Mo 3+)</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onStartSimulation();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
          >
            <Eye size={14} weight="bold" />
            <span>Watch 60-Second Full Growth Simulation ⚡</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

