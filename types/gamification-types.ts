export type StreakTier = "ember" | "flame" | "blaze";
export type QuestStatus = "ACTIVE" | "PENDING_SETTLEMENT" | "COMPLETED" | "RESTED" | "PAUSED_BY_SHIELD";
export type ActivityType = "CONFIRMED_TXN" | "NO_SPEND" | "FREEZE";

export interface QuestSnapshot {
  id: string;
  templateId: string;
  title: string;
  subtitle: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  progressRatio: number;
  status: QuestStatus;
  daysRemaining: number;
  xpReward: number;
  copyWhy?: string | null;
  origin?: string;
  templateKey?: string | null;
  swapsRemaining?: number;
}

export interface StreakSnapshot {
  currentStreak: number;
  longestStreak: number;
  freezesBanked: number;
  tier: StreakTier;
  isActiveToday: boolean;
  canNoSpendToday: boolean;
  todayActivityType: ActivityType | null;
  yesterdayOpen: boolean;
  yesterdayActivityType: ActivityType | null;
}

