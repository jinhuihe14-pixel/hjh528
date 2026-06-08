import { StageDifficulty, ItemType } from '../enums';

export interface ItemConsumptionLog {
  id: string;
  playerId: string;
  templateId: string;
  itemName: string;
  itemType: ItemType;
  count: number;
  source: string;
  usedAt: Date;
}

export interface ItemConsumptionStats {
  templateId: string;
  itemName: string;
  itemType: ItemType;
  totalConsumed: number;
  uniquePlayers: number;
  avgPerPlayer: number;
  rank: number;
}

export interface ItemConsumptionDetailQuery {
  startDate?: string;
  endDate?: string;
  itemType?: ItemType;
  source?: string;
  page?: number;
  pageSize?: number;
}

export interface StageDifficultyFeedback {
  stageId: string;
  stageName: string;
  chapterId: string;
  chapterName: string;
  difficulty: StageDifficulty;
  totalChallenges: number;
  winCount: number;
  loseCount: number;
  winRate: number;
  avgStars: number;
  avgDuration: number;
  firstClearRate: number;
  retryCount: number;
  recommendationScore: number;
}

export interface DifficultyDistribution {
  difficulty: StageDifficulty;
  totalStages: number;
  totalChallenges: number;
  avgWinRate: number;
  playerCount: number;
  completionRate: number;
}

export interface StatsOverview {
  totalPlayers: number;
  dailyActivePlayers: number;
  totalStagesCleared: number;
  totalBattles: number;
  winRate: number;
  avgLevel: number;
}

export interface DailyStats {
  date: string;
  newPlayers: number;
  activePlayers: number;
  totalBattles: number;
  totalStageClears: number;
  totalItemConsumptions: number;
  totalGoldEarned: number;
  totalDiamondEarned: number;
}
