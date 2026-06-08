import { SignInCycleType } from '../enums';

export interface SignInActivityConfig {
  cycleType: SignInCycleType;
  totalDays: number;
  autoStart: boolean;
  autoEnd: boolean;
  dailyRewards: SignInDailyReward[];
  cumulativeRewards: SignInCumulativeReward[];
  specialDays?: number[];
  makeUpEnabled?: boolean;
  makeUpCost?: { type: string; value: number };
}

export interface SignInDailyReward {
  day: number;
  reward: SignInReward;
  isSpecial?: boolean;
}

export interface SignInCumulativeReward {
  days: number;
  id: string;
  name: string;
  reward: SignInReward;
  isGrandPrize?: boolean;
}

export interface SignInReward {
  gold?: number;
  diamond?: number;
  items?: { templateId: string; count: number }[];
  cards?: { templateId: string; count: number }[];
}

export interface PlayerSignInData {
  playerId: string;
  activityId: string;
  totalSignInDays: number;
  continuousSignInDays: number;
  lastSignInDate: string;
  signedDays: number[];
  cumulativeRewardsClaimed: string[];
  makeUpCount: number;
  cycleStartDate: string;
}

export interface SignInResult {
  day: number;
  reward: SignInReward;
  isSpecial: boolean;
  newContinuousDays: number;
  newTotalDays: number;
}
