export const GAMIFICATION_TOKENS = {
  colors: {
    streakFlame: "#f97316",
    streakFlameGlow: "rgba(249, 115, 22, 0.4)",
    freezeShield: "#38bdf8",
    xpGold: "#fbbf24",
    calibrationCyan: "#06b6d4",
    calibrationEmerald: "#10b981",
    vaultPurple: "#a855f7",
    dangerRed: "#ef4444",
    borderDark: "rgba(255, 255, 255, 0.08)",
    bgDarkCard: "rgba(18, 18, 22, 0.95)",
    bgDarkPopover: "rgba(15, 17, 23, 0.98)",
  },
} as const;

export const BIOME_STAGE_GLOWS = {
  0: "shadow-[0_0_20px_rgba(34,197,94,0.12)]",
  1: "shadow-[0_0_20px_rgba(16,185,129,0.12)]",
  2: "shadow-[0_0_20px_rgba(6,182,212,0.12)]",
  3: "shadow-[0_0_20px_rgba(168,85,247,0.12)]",
  4: "shadow-[0_0_30px_rgba(234,179,8,0.18)]",
  5: "shadow-[0_0_30px_rgba(234,179,8,0.18)]",
} as const satisfies Record<number, string>;

export const BIOME_STAGE_COLORS = {
  0: "emerald",
  1: "teal",
  2: "cyan",
  3: "purple",
  4: "amber",
  5: "amber",
} as const satisfies Record<number, string>;

export const RATING_OPTIONS = [
  { value: "up" as const, emoji: "😄", label: "Love it" },
  { value: "neutral" as const, emoji: "😐", label: "OK" },
  { value: "down" as const, emoji: "😑", label: "Meh" },
] as const;

