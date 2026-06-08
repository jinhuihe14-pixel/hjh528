import { Rarity, Element } from '../enums';

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.N]: '#9CA3AF',
  [Rarity.R]: '#3B82F6',
  [Rarity.SR]: '#A855F7',
  [Rarity.SSR]: '#F59E0B',
  [Rarity.UR]: '#EF4444',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.N]: '普通',
  [Rarity.R]: '稀有',
  [Rarity.SR]: '史诗',
  [Rarity.SSR]: '传说',
  [Rarity.UR]: '神话',
};

export const RARITY_BASE_STATS_MULTIPLIER: Record<Rarity, number> = {
  [Rarity.N]: 1.0,
  [Rarity.R]: 1.3,
  [Rarity.SR]: 1.7,
  [Rarity.SSR]: 2.2,
  [Rarity.UR]: 2.8,
};

export const ELEMENT_NAMES: Record<Element, string> = {
  [Element.FIRE]: '火',
  [Element.WATER]: '水',
  [Element.EARTH]: '土',
  [Element.WIND]: '风',
  [Element.LIGHT]: '光',
  [Element.DARK]: '暗',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  [Element.FIRE]: '#EF4444',
  [Element.WATER]: '#3B82F6',
  [Element.EARTH]: '#A16207',
  [Element.WIND]: '#10B981',
  [Element.LIGHT]: '#FBBF24',
  [Element.DARK]: '#6366F1',
};

export const ELEMENT_RELATIONS: Record<Element, Element> = {
  [Element.FIRE]: Element.WIND,
  [Element.WATER]: Element.FIRE,
  [Element.EARTH]: Element.WATER,
  [Element.WIND]: Element.EARTH,
  [Element.LIGHT]: Element.DARK,
  [Element.DARK]: Element.LIGHT,
};

export const ELEMENT_DAMAGE_MULTIPLIER = {
  ADVANTAGE: 1.3,
  DISADVANTAGE: 0.7,
  NEUTRAL: 1.0,
};

export const BREAKTHROUGH_BONUS_PER_LEVEL = 0.15;

export const LEVEL_ATTRIBUTE_MULTIPLIER = 0.1;

export const BASE_CARD_EXP = 100;

export const EXP_GROWTH_RATE = 1.2;

export const MAX_BREAKTHROUGH_LEVEL = 10;

export const MAX_CARD_LEVEL_BASE = 30;

export const MAX_LEVEL_PER_BREAKTHROUGH = 10;

export const FORMATION_SLOTS = 6;

export const COMBAT_POWER_WEIGHTS = {
  hp: 0.1,
  attack: 0.4,
  defense: 0.2,
  speed: 0.15,
  critRate: 0.05,
  critDamage: 0.05,
  hitRate: 0.025,
  dodgeRate: 0.025,
};
