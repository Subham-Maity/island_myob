import { QuestSnapshot, StreakSnapshot } from "@/types/gamification-types";
import { MilestoneRibbonProps } from "@/island/milestone-ribbon";

export interface MockIslandState {
  stage: number;
  stageName: string;
  habitPoints: number;
  pointsToNext: number;
  isResting: boolean;
  milestoneData: MilestoneRibbonProps;
  quest: QuestSnapshot;
  streak: StreakSnapshot;
  clarityScore: number;
  impulsesSaved: number;
  currency: string;
}

export const STAGE_PRESETS = [
  { stage: 0, stageName: "Seedling Patch", points: 1, pointsToNext: 14, icon: "🌱" },
  { stage: 1, stageName: "Sunlit Sprout", points: 15, pointsToNext: 25, icon: "🌸" },
  { stage: 2, stageName: "Crystal Grove", points: 40, pointsToNext: 30, icon: "🌳" },
  { stage: 3, stageName: "Bloom Meadow", points: 70, pointsToNext: 40, icon: "🌲" },
  { stage: 4, stageName: "Beacon Island", points: 120, pointsToNext: 0, icon: "🗼" },
];

export const INITIAL_MOCK_DATA: MockIslandState = {
  stage: 0,
  stageName: "Seedling Patch",
  habitPoints: 1,
  pointsToNext: 14,
  isResting: false,
  currency: "$",
  milestoneData: {
    currentNW: 18450,
    prevMilestone: 15000,
    nextMilestone: 25000,
    gapAmount: 6550,
    weeksAtPace: 5,
    currency: "$",
    disclaimer: "Estimated pace based on recent confirmed habit milestones",
  },
  quest: {
    id: "mock_quest_01",
    templateId: "SHOW_UP_WEEK",
    title: "Show Up This Week",
    subtitle: 'Log daily activity or tap "No spend today" on 4 distinct days.',
    metric: "DAYS_LOGGED",
    targetValue: 4,
    currentValue: 1,
    progressRatio: 0.25,
    status: "ACTIVE",
    daysRemaining: 3,
    xpReward: 100,
    origin: "LLM",
    copyWhy: "Small daily consistency compounds into long-term financial clarity.",
    swapsRemaining: 1,
  },
  streak: {
    currentStreak: 7,
    longestStreak: 12,
    freezesBanked: 1,
    tier: "flame",
    isActiveToday: true,
    canNoSpendToday: true,
    todayActivityType: "NO_SPEND",
    yesterdayOpen: false,
    yesterdayActivityType: "CONFIRMED_TXN",
  },
  clarityScore: 84,
  impulsesSaved: 420,
};

