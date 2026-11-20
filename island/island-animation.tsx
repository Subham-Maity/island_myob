// client/app/(dashboard)/_gamification/components/island/island-animation.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface IslandAnimationProps {
  /** Growth stage from 0 to 4 (0: Seedling, 1: Sprout, 2: Grove, 3: Meadow, 4: Beacon) */
  stage: number;
  /** Name of the current biome/stage */
  stageName: string;
  /** Whether the island is in resting twilight / night mode */
  isNight?: boolean;
  /** Optional container class overrides */
  className?: string;
}

/**
 * Habit Island Living Animation Canvas
 * Standalone SVG rendering for the isometric floating island, sky atmosphere,
 * dynamic stage foliage (seedling, flowers, pond, trees, lighthouse), and day/night cycle.
 */
export function IslandAnimation({
  stage,
  stageName,
  isNight = false,
  className,
}: IslandAnimationProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-zinc-950 flex items-center justify-center border border-zinc-800/80 shadow-inner",
        className
      )}
    >
      <svg
        viewBox="0 0 400 240"
        className="w-full h-full object-contain select-none transition-all duration-700"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Habit Island Stage ${stage}: ${stageName}`}
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#090915" : "#0d1117"} />
            <stop offset="100%" stopColor={isNight ? "#050508" : "#161b22"} />
          </linearGradient>

          <linearGradient id="islandBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22272e" />
            <stop offset="60%" stopColor="#1a1e24" />
            <stop offset="100%" stopColor="#0d1117" />
          </linearGradient>

          <linearGradient id="grassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isNight ? "#064e3b" : "#10b981"} />
            <stop offset="100%" stopColor={isNight ? "#047857" : "#059669"} />
          </linearGradient>

          <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sky Background */}
        <rect width="400" height="240" fill="url(#skyGrad)" />

        {/* Atmosphere: Sun / Moon & Stars */}
        {isNight ? (
          <>
            <circle cx="340" cy="40" r="14" fill="#fef08a" opacity="0.85" filter="url(#glowEffect)" />
            <circle cx="345" cy="38" r="12" fill="#090915" />
            <circle cx="60" cy="35" r="1.5" fill="#ffffff" opacity="0.7" />
            <circle cx="120" cy="50" r="1.2" fill="#ffffff" opacity="0.5" />
            <circle cx="210" cy="30" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="280" cy="45" r="1.2" fill="#ffffff" opacity="0.6" />
          </>
        ) : (
          <>
            <circle cx="340" cy="45" r="22" fill="#f59e0b" opacity="0.18" filter="url(#glowEffect)" />
            <circle cx="340" cy="45" r="10" fill="#fbbf24" opacity="0.8" />
          </>
        )}

        {/* Clouds */}
        <path
          d="M 50 70 Q 65 60 80 70 Q 95 60 110 70 Q 120 80 110 90 Q 50 90 50 70 Z"
          fill="#334155"
          opacity="0.15"
        />
        <path
          d="M 270 95 Q 285 85 300 95 Q 315 85 330 95 Q 340 105 330 115 Q 270 115 270 95 Z"
          fill="#334155"
          opacity="0.12"
        />

        {/* ── Main Isometric Floating Island Base ── */}
        <g transform="translate(0, 15)">
          <polygon
            points="100,140 200,195 300,140 200,85"
            fill="url(#islandBase)"
            stroke="#30363d"
            strokeWidth="1.5"
          />
          <polygon
            points="100,140 200,195 200,215 100,160"
            fill="#161b22"
            stroke="#21262d"
            strokeWidth="1"
          />
          <polygon
            points="200,195 300,140 300,160 200,215"
            fill="#0d1117"
            stroke="#21262d"
            strokeWidth="1"
          />

          {/* Grass Top Surface */}
          <polygon
            points="104,138 200,191 296,138 200,88"
            fill="url(#grassGrad)"
            stroke={isNight ? "#047857" : "#34d399"}
            strokeWidth="1"
          />

          {/* Stage 0: Sprout & Soil Mound */}
          {stage === 0 && (
            <g transform="translate(195, 128)">
              <ellipse cx="5" cy="12" rx="14" ry="7" fill="#3f2e1e" opacity="0.8" />
              <path d="M 5 12 Q 3 2 5 -2" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 5 2 Q -2 -2 0 -6 Q 6 -2 5 2" fill="#22c55e" />
              <path d="M 5 -1 Q 12 -5 10 -9 Q 4 -5 5 -1" fill="#4ade80" />
              <circle cx="1" cy="-4" r="1" fill="#38bdf8" opacity="0.9" />
            </g>
          )}

          {/* Stage 1: Flowering Sprout */}
          {stage >= 1 && (
            <g transform="translate(195, 125)">
              <ellipse cx="5" cy="14" rx="20" ry="9" fill="#3f2e1e" opacity="0.6" />
              <path d="M 5 14 Q 2 0 5 -6" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 5 5 Q -6 0 -4 -8 Q 6 0 5 5" fill="#22c55e" />
              <path d="M 5 1 Q 16 -4 14 -12 Q 4 -4 5 1" fill="#4ade80" />
              <circle cx="-18" cy="8" r="3" fill="#f472b6" />
              <circle cx="-18" cy="8" r="1.2" fill="#fef08a" />
              <circle cx="28" cy="5" r="3.5" fill="#c084fc" />
              <circle cx="28" cy="5" r="1.4" fill="#fef08a" />
              <circle cx="8" cy="18" r="2.8" fill="#fde047" />
              <circle cx="8" cy="18" r="1" fill="#ea580c" />
            </g>
          )}

          {/* Stage 2+: Crystal Pond & Trees */}
          {stage >= 2 && (
            <>
              <ellipse cx="235" cy="145" rx="28" ry="14" fill="url(#waterGrad)" opacity="0.85" />
              <ellipse cx="225" cy="143" rx="5" ry="2.5" fill="#15803d" />
              <ellipse cx="245" cy="147" rx="4" ry="2" fill="#15803d" />
              <circle cx="244" cy="146" r="1.2" fill="#f472b6" />

              <g transform="translate(150, 95)">
                <path d="M 12 40 L 12 18 Q 14 12 18 10 M 12 22 Q 8 16 6 12" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <circle cx="12" cy="6" r="18" fill="#15803d" opacity="0.9" />
                <circle cx="5" cy="2" r="14" fill="#16a34a" />
                <circle cx="20" cy="5" r="13" fill="#22c55e" opacity="0.9" />
                <circle cx="12" cy="-4" r="12" fill="#4ade80" opacity="0.8" />
              </g>
            </>
          )}

          {/* Stage 3+: Forest Meadow & Bridge */}
          {stage >= 3 && (
            <>
              <g transform="translate(125, 115)">
                <path d="M 8 28 L 8 16" stroke="#451a03" strokeWidth="2.5" fill="none" />
                <polygon points="8,0 0,16 16,16" fill="#065f46" />
                <polygon points="8,-8 2,6 14,6" fill="#047857" />
                <polygon points="8,-15 4,-2 12,-2" fill="#059669" />
              </g>

              <g transform="translate(225, 137)">
                <path d="M 0 10 Q 12 2 24 10" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 2 10 Q 12 4 22 10" stroke="#475569" strokeWidth="2" fill="none" />
              </g>
            </>
          )}

          {/* Stage 4+: Lighthouse & Waterfall */}
          {stage >= 4 && (
            <>
              <path
                d="M 270 148 L 275 195 L 282 195 L 276 148 Z"
                fill="#38bdf8"
                opacity="0.85"
                filter="url(#glowEffect)"
              />
              <path d="M 272 150 L 274 190 M 277 152 L 279 192" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

              <g transform="translate(265, 85)">
                <rect x="-8" y="45" width="22" height="8" rx="2" fill="#334155" />
                <polygon points="-5,45 -2,12 12,12 15,45" fill="#f87171" stroke="#b91c1c" strokeWidth="0.8" />
                <polygon points="-4,34 -3,23 13,23 14,34" fill="#ffffff" />
                <rect x="-1" y="5" width="12" height="7" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
                <circle cx="5" cy="8" r="3.5" fill="#fef08a" filter="url(#glowEffect)" />
                <path d="M -3 5 Q 5 -2 13 5 Z" fill="#b91c1c" />
                <polygon
                  points="5,8 -80,-20 -95,20"
                  fill="#fef08a"
                  opacity={isNight ? "0.35" : "0.15"}
                  filter="url(#glowEffect)"
                />
              </g>
            </>
          )}

          {/* Fireflies on Resting Twilight */}
          {isNight && (
            <>
              <circle cx="160" cy="140" r="1.8" fill="#a7f3d0" filter="url(#glowEffect)" opacity="0.9" />
              <circle cx="185" cy="165" r="1.5" fill="#fef08a" filter="url(#glowEffect)" opacity="0.85" />
              <circle cx="215" cy="130" r="2.2" fill="#a7f3d0" filter="url(#glowEffect)" opacity="0.95" />
              <circle cx="255" cy="155" r="1.6" fill="#fef08a" filter="url(#glowEffect)" opacity="0.8" />
              <circle cx="140" cy="120" r="1.5" fill="#fef08a" filter="url(#glowEffect)" opacity="0.75" />
            </>
          )}
        </g>
      </svg>

      {/* Resting Twilight subtle overlay indicator */}
      {isNight && (
        <div className="absolute inset-0 bg-indigo-950/25 pointer-events-none flex items-end justify-center pb-2 island-resting-overlay">
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-full shadow-sm">
            Island Resting — Log activity to greet the dawn
          </span>
        </div>
      )}
    </div>
  );
}

