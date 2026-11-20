// client/app/(dashboard)/_gamification/components/island/island-stage-avatar.tsx
"use client";

import React from "react";

export interface IslandStageAvatarProps {
  stage: number;
  size?: number;
}

export function IslandStageAvatar({
  stage,
  size = 48,
}: IslandStageAvatarProps): React.JSX.Element {
  // 5 static miniature SVG representations for biome stages 0 to 4+
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner"
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base Island */}
        <polygon points="10,28 24,36 38,28 24,20" fill="#10b981" stroke="#059669" strokeWidth="1" />
        <polygon points="10,28 24,36 24,40 10,32" fill="#1e293b" />
        <polygon points="24,36 38,28 38,32 24,40" fill="#0f172a" />

        {/* Stage Content */}
        {stage === 0 && (
          <circle cx="24" cy="22" r="3" fill="#4ade80" />
        )}
        {stage === 1 && (
          <>
            <circle cx="22" cy="21" r="2.5" fill="#f472b6" />
            <circle cx="26" cy="22" r="2.5" fill="#facc15" />
          </>
        )}
        {stage === 2 && (
          <>
            <ellipse cx="28" cy="26" rx="4" ry="2" fill="#38bdf8" />
            <circle cx="20" cy="18" r="4" fill="#22c55e" />
          </>
        )}
        {stage === 3 && (
          <>
            <ellipse cx="28" cy="26" rx="4" ry="2" fill="#38bdf8" />
            <polygon points="19,13 14,23 24,23" fill="#047857" />
          </>
        )}
        {stage >= 4 && (
          <>
            <rect x="28" y="14" width="3" height="10" fill="#ef4444" />
            <circle cx="29.5" cy="13" r="2" fill="#fde047" />
            <path d="M 33 28 L 35 36" stroke="#38bdf8" strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  );
}

