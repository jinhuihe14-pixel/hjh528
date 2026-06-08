import { Rarity, Element, CardType, SkillType, SkillEffectType } from '../enums';

export interface BaseAttributes {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  hitRate: number;
  dodgeRate: number;
  effectHitRate: number;
  effectResistRate: number;
}

export interface SkillEffect {
  type: SkillEffectType;
  value: number;
  valuePerLevel?: number;
  duration?: number;
  targetType: 'single' | 'all' | 'random' | 'self';
  targetCount?: number;
  element?: Element;
  ignoreDefense?: number;
  healBasedOn?: 'hp' | 'attack' | 'damage';
  buffAttributes?: Partial<BaseAttributes>;
  debuffAttributes?: Partial<BaseAttributes>;
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  level: number;
  maxLevel: number;
  cooldown: number;
  currentCooldown?: number;
  effects: SkillEffect[];
  unlockCondition?: {
    level?: number;
    breakthrough?: number;
  };
}

export interface CardTemplate {
  id: string;
  name: string;
  rarity: Rarity;
  element: Element;
  type: CardType;
  description: string;
  avatar: string;
  baseAttributes: BaseAttributes;
  growthAttributes: BaseAttributes;
  skills: Skill[];
  passiveSkills: Skill[];
  breakthroughLevels: BreakthroughLevel[];
  bonds: Bond[];
  baseExp: number;
  sellPrice: number;
  maxLevel: number;
}

export interface BreakthroughLevel {
  level: number;
  name: string;
  requiredCards: number;
  requiredMaterials: { itemId: string; count: number }[];
  requiredGold: number;
  attributeBonus: Partial<BaseAttributes>;
  unlockSkillId?: string;
  levelCap: number;
}

export interface Bond {
  id: string;
  name: string;
  description: string;
  requiredCardIds: string[];
  attributeBonus: Partial<BaseAttributes>;
  active: boolean;
}

export interface Card {
  id: string;
  templateId: string;
  playerId: string;
  level: number;
  exp: number;
  breakthrough: number;
  skills: Skill[];
  stars: number;
  combatPower: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardWithTemplate extends Card {
  template: CardTemplate;
}

export interface CardDisplayInfo {
  id: string;
  name: string;
  rarity: Rarity;
  element: Element;
  type: CardType;
  avatar: string;
  level: number;
  breakthrough: number;
  stars: number;
  combatPower: number;
  attributes: BaseAttributes;
}
