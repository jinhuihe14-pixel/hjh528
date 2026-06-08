import { BattleStatus, BattleResult, Element } from '../enums';
import { BaseAttributes, Skill } from './card.types';

export interface BattleUnit {
  id: string;
  name: string;
  cardTemplateId: string;
  position: number;
  side: 'player' | 'enemy';
  currentHp: number;
  maxHp: number;
  attributes: BaseAttributes;
  skills: Skill[];
  buffs: Buff[];
  debuffs: Debuff[];
  shields: Shield[];
  isAlive: boolean;
  element: Element;
  combatPower: number;
}

export interface Buff {
  id: string;
  name: string;
  duration: number;
  remainingTurns: number;
  attributes: Partial<BaseAttributes>;
  sourceId: string;
  isDebuff: boolean;
}

export interface Debuff extends Buff {
  isDebuff: true;
}

export interface Shield {
  id: string;
  name: string;
  value: number;
  remainingTurns: number;
  sourceId: string;
}

export interface BattleAction {
  turn: number;
  actionType: 'skill' | 'normal' | 'passive';
  sourceId: string;
  targetIds: string[];
  skillId?: string;
  damage?: { targetId: string; value: number; isCrit: boolean; element?: Element }[];
  heal?: { targetId: string; value: number }[];
  buffGained?: { targetId: string; buff: Buff }[];
  shieldGained?: { targetId: string; shield: Shield }[];
  log: string;
}

export interface BattleState {
  battleId: string;
  status: BattleStatus;
  turn: number;
  maxTurns: number;
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  currentSide: 'player' | 'enemy';
  actionQueue: BattleAction[];
  result?: BattleResult;
  rewards?: BattleReward;
  stageId?: string;
  playerId?: string;
  enemyPlayerId?: string;
}

export interface BattleReward {
  exp: number;
  gold: number;
  items?: { itemId: string; count: number }[];
  cards?: { cardId: string; count: number }[];
}

export interface BattleStartDto {
  playerId: string;
  lineupType: string;
  stageId?: string;
  enemyPlayerId?: string;
  battleType: 'stage' | 'arena' | 'pvp';
}

export interface BattleResultDto {
  battleId: string;
  result: BattleResult;
  rewards: BattleReward;
  actions: BattleAction[];
  totalTurns: number;
}
