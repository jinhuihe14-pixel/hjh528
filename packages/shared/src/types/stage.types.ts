import { StageType, StageDifficulty } from '../enums';
import { DropItem } from './item.types';
import { BaseAttributes } from './card.types';

export interface StageTemplate {
  id: string;
  chapterId: string;
  name: string;
  type: StageType;
  difficulty: StageDifficulty;
  description: string;
  level: number;
  staminaCost: number;
  maxStars: number;
  enemyWaves: StageEnemyWave[];
  firstClearReward: StageReward;
  normalReward: StageReward;
  dailyLimit?: number;
  recommendedPower: number;
  unlockCondition: StageUnlockCondition;
  sort?: number;
}

export interface StageEnemyWave {
  waveNumber: number;
  enemies: StageEnemy[];
}

export interface StageEnemy {
  cardTemplateId: string;
  level: number;
  breakthrough: number;
  attributes: BaseAttributes;
  position: number;
}

export interface StageReward {
  exp: number;
  gold: number;
  items: DropItem[];
  cards?: DropItem[];
}

export interface StageUnlockCondition {
  requiredStageId?: string;
  requiredPlayerLevel?: number;
  requiredStars?: number;
}

export interface ChapterTemplate {
  id: string;
  name: string;
  description: string;
  stages: string[];
  requiredLevel: number;
  chapterReward: ChapterReward;
  difficultyGroup?: string;
  sort?: number;
  unlocked?: boolean;
  totalStages?: number;
  clearedStages?: number;
  totalStars?: number;
  earnedStars?: number;
  rewardClaimed?: boolean;
}

export interface ChapterReward {
  items: { templateId: string; count: number }[];
  gold?: number;
  diamond?: number;
}

export interface StageDifficultyGroup {
  difficulty: StageDifficulty;
  label: string;
  stages: StageTemplate[];
}

export interface StageFeedback {
  stageId: string;
  difficulty: StageDifficulty;
  totalChallenges: number;
  winCount: number;
  winRate: number;
  avgStars: number;
  avgCompletionTime: number;
}

export interface StageDifficultyStats {
  difficulty: StageDifficulty;
  totalStages: number;
  totalChallenges: number;
  avgWinRate: number;
  playerDistribution: number;
}
