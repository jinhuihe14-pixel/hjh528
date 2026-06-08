import { GuideStepType } from '../enums';
import { DropItem } from './item.types';

export interface NewbieGuideConfig {
  enabled: boolean;
  steps: NewbieGuideStep[];
  autoShowOnFirstLogin: boolean;
}

export interface NewbieGuideStep {
  id: string;
  type: GuideStepType;
  title: string;
  content: string;
  sort: number;
  targetElement?: string;
  targetPage?: string;
  task?: NewbieGuideTask;
  reward?: NewbieGuideReward;
  skipable?: boolean;
}

export interface NewbieGuideTask {
  taskType: string;
  target: number;
  description: string;
}

export interface NewbieGuideReward {
  gold?: number;
  diamond?: number;
  items?: { templateId: string; count: number }[];
  cards?: { templateId: string; count: number }[];
}

export interface PlayerNewbieGuide {
  playerId: string;
  guideCompleted: boolean;
  currentStepId: string;
  completedSteps: string[];
  claimedRewards: string[];
  taskProgress: Record<string, number>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface StageWelfareConfig {
  enabled: boolean;
  stages: StageWelfareStage[];
}

export interface StageWelfareStage {
  id: string;
  stage: number;
  name: string;
  description: string;
  condition: StageWelfareCondition;
  reward: NewbieGuideReward;
  sort: number;
}

export interface StageWelfareCondition {
  type: 'level' | 'stage_clear' | 'stars' | 'login_days';
  value: number;
  stageId?: string;
}

export interface PlayerStageWelfare {
  playerId: string;
  claimedStages: string[];
}
