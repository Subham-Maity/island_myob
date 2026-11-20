// client/app/(dashboard)/_gamification/components/island/pause-shield-section.tsx
"use client";

import React, { useState } from "react";
import { Pause, CaretDown, CaretUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface PauseShieldSectionProps {
  isShieldActive: boolean;
  shieldEndsAt: string | null;
  onPause: (days: number) => void;
  onResume: () => void;
  isPending?: boolean;
}

export function PauseShieldSection({
  isShieldActive,
  shieldEndsAt,
  onPause,
  onResume,
  isPending = false,
}: PauseShieldSectionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);

  if (isShieldActive) {
    return (
      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Pause weight="fill" className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <div className="font-semibold text-purple-200">Missions Shield Active</div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Safe until {shieldEndsAt ? new Date(shieldEndsAt).toLocaleDateString() : "resumed"}
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={onResume}
          className="h-7 text-xs border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 cursor-pointer"
        >
          Resume Missions
        </Button>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full p-3 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Pause weight="bold" className="w-3.5 h-3.5 text-amber-400" />
            <span>Pause Missions Shield (Travel, Vacations, Health)</span>
          </div>
          {isOpen ? <CaretUp size={13} /> : <CaretDown size={13} />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 pt-0 space-y-2 border-t border-zinc-800/40 mt-1">
        <p className="text-[11px] text-zinc-400 pt-2 leading-relaxed">
          Going on a trip or busy week? Shield your streak for 3 to 14 days without penalties.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1 font-mono text-xs">
            {[3, 7, 14].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDays(d)}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-all",
                  selectedDays === d
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {d}d
              </button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => onPause(selectedDays)}
            className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold ml-auto cursor-pointer"
          >
            {isPending ? "Pausing..." : `Pause for ${selectedDays} days`}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

