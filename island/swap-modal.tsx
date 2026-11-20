// client/app/(dashboard)/_gamification/components/island/swap-modal.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowsLeftRight, Info } from "@phosphor-icons/react";
import { QuestSnapshot } from "@/types/gamification-types";

export interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  currentQuest: QuestSnapshot | null;
  swapsLeft: number;
  onConfirmSwap: (reason: "NOT_RELEVANT" | "TOO_HARD" | "INCOME_LANDED" | "OTHER") => void;
  isPending: boolean;
}

export function SwapModal({
  open,
  onClose,
  currentQuest,
  swapsLeft,
  onConfirmSwap,
  isPending,
}: SwapModalProps): React.JSX.Element {
  const [reason, setReason] = useState<"NOT_RELEVANT" | "TOO_HARD" | "INCOME_LANDED" | "OTHER">("NOT_RELEVANT");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-zinc-950 border border-zinc-800 text-zinc-100 p-5 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
            <ArrowsLeftRight className="w-4 h-4 text-cyan-400" />
            <span>Swap Weekly Quest</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            You have {swapsLeft} swap(s) left this week. Choose a reason to help AI calibrate a better challenge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {currentQuest && (
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Current Quest</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5">{currentQuest.title}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{currentQuest.subtitle}</div>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-zinc-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5 font-mono text-[11px]">
              <Info size={13} weight="bold" />
              <span>How Quest Swapping Works:</span>
            </div>
            <ul className="text-zinc-400 space-y-0.5 text-[10.5px] leading-relaxed">
              <li>• Quota resets every Monday at 00:00.</li>
              <li>• Current week progress resets on the new replacement quest.</li>
              <li>• A new alternative quest will be assigned automatically.</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Reason for swap</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as "NOT_RELEVANT" | "TOO_HARD" | "INCOME_LANDED" | "OTHER")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="NOT_RELEVANT">Not relevant to my current spending</option>
              <option value="TOO_HARD">Target is too ambitious this week</option>
              <option value="INCOME_LANDED">Irregular income landed / circumstances changed</option>
              <option value="OTHER">Other reason</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending || swapsLeft === 0}
              onClick={() => onConfirmSwap(reason)}
              className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Swapping..." : "Confirm Swap →"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

