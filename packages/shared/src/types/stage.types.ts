import { StageType } from '../enums';
import { DropItem } from './item.types';
import { BaseAttributes } from './card.types';

export interface StageTemplate {
  id: string;
  chapterId: string;
  name: string;
  type: StageType;
  description: string;
  level: number;
  staminaCost: number;
  maxStars: number;
  enemyWave: StageEnemyWave[];
  firstClearReward: StageReward;
  normalReward: StageReward;
  dailyLimit?: number;
  recommendedPower: number;
  unlockCondition: StageUnlockCondition;
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
  reward: ChapterReward;
}

export interface ChapterReward {
  items: DropItem[];
  gold?: number;
  diamond?: number;
}
