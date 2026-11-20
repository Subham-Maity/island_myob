// client/app/(dashboard)/_gamification/components/island/calm-mode-footer.tsx
"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, ShieldCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface CalmModeFooterProps {
  isCalmModeActive: boolean;
  onToggle: () => void;
  isPending?: boolean;
}

export function CalmModeFooter({
  isCalmModeActive,
  onToggle,
  isPending = false,
}: CalmModeFooterProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-zinc-800/60 pt-3 mt-4 flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-300">Calm Mode</span>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-zinc-500 hover:text-cyan-400 transition-colors p-0.5 rounded cursor-pointer"
                aria-label="What is Calm Mode?"
              >
                <Info size={12} weight="bold" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-72 p-3 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs shadow-2xl rounded-xl space-y-2 z-50 font-sans"
            >
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-cyan-300">
                <ShieldCheck size={13} weight="bold" />
                <span>Zero-Guilt Calm Mode</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Need a break? Calm Mode safely pauses weekly challenges and notifications without breaking your streak or resetting XP.
              </p>
              <div className="space-y-1 text-[10px] text-zinc-400 font-mono">
                <div>• <strong className="text-zinc-200">Streak Freeze:</strong> Frozen safely with 0 penalties.</div>
                <div>• <strong className="text-zinc-200">Quiet Tracking:</strong> Ledger continues tracking normally.</div>
                <div>• <strong className="text-zinc-200">Resume Anytime:</strong> Flip the switch back on whenever you are ready.</div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-[11px] text-zinc-500">
          Pauses quests &amp; notifications without breaking your streak
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <span
          className={cn(
            "text-[11px] font-medium font-mono px-2 py-0.5 rounded-full border",
            isCalmModeActive
              ? "bg-amber-950/40 border-amber-800/40 text-amber-400"
              : "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
          )}
        >
          {isCalmModeActive ? "Calm Mode On" : "Missions Active"}
        </span>
        <Switch
          checked={!isCalmModeActive}
          disabled={isPending}
          onCheckedChange={onToggle}
          aria-label="Toggle missions active or calm mode"
        />
      </div>
    </div>
  );
}

