// client/app/(dashboard)/_gamification/components/island/today-status-bar.tsx
"use client";

import React from "react";
import { CheckCircle, ArrowsCounterClockwise, Fire } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export interface TodayStatusBarProps {
  isActiveToday: boolean;
  spentToday: number;
  activityType: string | null;
  currency: string;
  onNoSpend: () => void;
  onRevert: () => void;
  isNoSpendPending: boolean;
  isRevertPending: boolean;
}

export function TodayStatusBar({
  isActiveToday,
  spentToday,
  activityType,
  currency,
  onNoSpend,
  onRevert,
  isNoSpendPending,
  isRevertPending,
}: TodayStatusBarProps): React.JSX.Element {
  if (isActiveToday) {
    const isNoSpend = activityType === "NO_SPEND";
    return (
      <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle weight="fill" className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-medium text-emerald-300">
            {isNoSpend
              ? `Today Active (Spent ${currency}0)`
              : `Today Active (Activity Confirmed: ${currency}${spentToday.toLocaleString()})`}
          </span>
        </div>
        {isNoSpend && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRevertPending}
            onClick={onRevert}
            className="h-7 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-red-950/20 gap-1 px-2 cursor-pointer"
            title="Undo No Spend for today"
          >
            <ArrowsCounterClockwise className="w-3.5 h-3.5" />
            <span>Revert</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
      <div className="text-xs text-zinc-400 text-center sm:text-left">
        💡 Mark today as a zero-spend day to protect and grow your streak
      </div>
      <Button
        type="button"
        disabled={isNoSpendPending}
        onClick={onNoSpend}
        className="w-full sm:w-auto px-4 h-9 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
      >
        <Fire weight="fill" className="w-4 h-4 text-black" />
        <span>{isNoSpendPending ? "Marking..." : "No Spend Today (Spent 0)"}</span>
      </Button>
    </div>
  );
}

