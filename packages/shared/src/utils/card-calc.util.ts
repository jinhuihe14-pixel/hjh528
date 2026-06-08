import {
  CardTemplate,
  Card,
  CardWithTemplate,
  BaseAttributes,
  BreakthroughLevel,
} from '../types/card.types';
import {
  RARITY_BASE_STATS_MULTIPLIER,
  LEVEL_ATTRIBUTE_MULTIPLIER,
  BREAKTHROUGH_BONUS_PER_LEVEL,
  MAX_CARD_LEVEL_BASE,
  MAX_LEVEL_PER_BREAKTHROUGH,
  COMBAT_POWER_WEIGHTS,
  ELEMENT_RELATIONS,
  ELEMENT_DAMAGE_MULTIPLIER,
  EXP_GROWTH_RATE,
  BASE_CARD_EXP,
} from '../constants/card.constants';
import { Element, Rarity } from '../enums';

export function calculateMaxLevel(breakthrough: number): number {
  return MAX_CARD_LEVEL_BASE + breakthrough * MAX_LEVEL_PER_BREAKTHROUGH;
}

export function calculateLevelExpRequired(level: number, rarity: Rarity): number {
  return Math.floor(
    BASE_CARD_EXP * Math.pow(EXP_GROWTH_RATE, level - 1) * RARITY_BASE_STATS_MULTIPLIER[rarity]
  );
}

export function calculateTotalExpToLevel(targetLevel: number, rarity: Rarity): number {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += calculateLevelExpRequired(i, rarity);
  }
  return total;
}

export function calculateCardLevel(exp: number, rarity: Rarity, maxLevel: number): number {
  let level = 1;
  let remainingExp = exp;
  
  while (level < maxLevel) {
    const expNeeded = calculateLevelExpRequired(level, rarity);
    if (remainingExp >= expNeeded) {
      remainingExp -= expNeeded;
      level++;
    } else {
      break;
    }
  }
  
  return level;
}

export function calculateBaseAttributes(template: CardTemplate, level: number): BaseAttributes {
  const base = template.baseAttributes;
  const growth = template.growthAttributes;
  const rarityMultiplier = RARITY_BASE_STATS_MULTIPLIER[template.rarity];
  
  const attributes: BaseAttributes = {
    hp: Math.floor((base.hp + growth.hp * (level - 1)) * rarityMultiplier),
    attack: Math.floor((base.attack + growth.attack * (level - 1)) * rarityMultiplier),
    defense: Math.floor((base.defense + growth.defense * (level - 1)) * rarityMultiplier),
    speed: Math.floor((base.speed + growth.speed * (level - 1)) * rarityMultiplier),
    critRate: base.critRate + growth.critRate * (level - 1),
    critDamage: base.critDamage + growth.critDamage * (level - 1),
    hitRate: base.hitRate + growth.hitRate * (level - 1),
    dodgeRate: base.dodgeRate + growth.dodgeRate * (level - 1),
    effectHitRate: base.effectHitRate + growth.effectHitRate * (level - 1),
    effectResistRate: base.effectResistRate + growth.effectResistRate * (level - 1),
  };
  
  return attributes;
}

export function calculateBreakthroughBonus(
  breakthroughLevels: BreakthroughLevel[],
  currentBreakthrough: number
): Partial<BaseAttributes> {
  const totalBonus: Partial<BaseAttributes> = {};
  
  for (let i = 0; i <= currentBreakthrough && i < breakthroughLevels.length; i++) {
    const bonus = breakthroughLevels[i]?.attributeBonus || {};
    for (const key of Object.keys(bonus) as (keyof BaseAttributes)[]) {
      totalBonus[key] = (totalBonus[key] || 0) + (bonus[key] || 0);
    }
  }
  
  return totalBonus;
}

export function calculateFinalAttributes(
  template: CardTemplate,
  level: number,
  breakthrough: number,
  extraBonuses?: Partial<BaseAttributes>[]
): BaseAttributes {
  const baseAttrs = calculateBaseAttributes(template, level);
  const breakthroughBonus = calculateBreakthroughBonus(template.breakthroughLevels, breakthrough);
  
  const finalAttrs = { ...baseAttrs };
  
  for (const key of Object.keys(breakthroughBonus) as (keyof BaseAttributes)[]) {
    const bonus = breakthroughBonus[key] || 0;
    if (typeof finalAttrs[key] === 'number') {
      (finalAttrs as any)[key] = Math.floor((finalAttrs as any)[key] * (1 + bonus));
    }
  }
  
  if (extraBonuses) {
    for (const bonus of extraBonuses) {
      for (const key of Object.keys(bonus) as (keyof BaseAttributes)[]) {
        const value = bonus[key] || 0;
        if (typeof finalAttrs[key] === 'number') {
          if (key === 'critRate' || key === 'critDamage' || 
              key === 'hitRate' || key === 'dodgeRate' ||
              key === 'effectHitRate' || key === 'effectResistRate') {
            (finalAttrs as any)[key] += value;
          } else {
            (finalAttrs as any)[key] = Math.floor((finalAttrs as any)[key] * (1 + value));
          }
        }
      }
    }
  }
  
  return finalAttrs;
}

export function calculateCombatPower(attributes: BaseAttributes): number {
  let power = 0;
  
  for (const [key, weight] of Object.entries(COMBAT_POWER_WEIGHTS)) {
    const value = attributes[key as keyof BaseAttributes] || 0;
    power += value * weight;
  }
  
  return Math.floor(power);
}

export function getElementMultiplier(attackerElement: Element, defenderElement: Element): number {
  if (ELEMENT_RELATIONS[attackerElement] === defenderElement) {
    return ELEMENT_DAMAGE_MULTIPLIER.ADVANTAGE;
  }
  if (ELEMENT_RELATIONS[defenderElement] === attackerElement) {
    return ELEMENT_DAMAGE_MULTIPLIER.DISADVANTAGE;
  }
  return ELEMENT_DAMAGE_MULTIPLIER.NEUTRAL;
}

export function calculateDamage(
  attack: number,
  defense: number,
  skillDamageBonus: number,
  elementMultiplier: number,
  isCrit: boolean,
  critMultiplier: number,
  extraDamageBonus: number = 0
): { damage: number; isCrit: boolean } {
  let damage = attack * (1 + skillDamageBonus) - defense * 0.5;
  
  if (damage < 1) damage = 1;
  
  damage *= elementMultiplier;
  
  if (isCrit) {
    damage *= critMultiplier;
  }
  
  damage *= (1 + extraDamageBonus);
  
  return {
    damage: Math.floor(damage),
    isCrit,
  };
}

export function calculateHeal(
  baseHeal: number,
  healBonus: number = 0,
  critHeal: boolean = false,
  critHealMultiplier: number = 1.5
): number {
  let heal = baseHeal * (1 + healBonus);
  if (critHeal) {
    heal *= critHealMultiplier;
  }
  return Math.floor(heal);
}

export function validateCardCard(template: CardTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template.id || template.id.length === 0) {
    errors.push('卡牌ID不能为空');
  }
  if (!template.name || template.name.length === 0) {
    errors.push('卡牌名称不能为空');
  }
  if (template.baseAttributes.hp <= 0) {
    errors.push('生命值必须大于0');
  }
  if (template.baseAttributes.attack <= 0) {
    errors.push('攻击力必须大于0');
  }
  if (template.baseAttributes.defense <= 0) {
    errors.push('防御力必须大于0');
  }
  if (template.skills.length === 0) {
    errors.push('卡牌至少需要一个技能');
  }
  if (template.breakthroughLevels.length === 0) {
    errors.push('卡牌突破等级配置缺失');
  }
  
  const rarityMultiplier = RARITY_BASE_STATS_MULTIPLIER[template.rarity];
  const maxLevel = calculateMaxLevel(template.breakthroughLevels.length - 1);
  const finalAttrs = calculateFinalAttributes(template, maxLevel, template.breakthroughLevels.length - 1);
  const power = calculateCombatPower(finalAttrs);
  
  const expectedPowerRange = {
    [Rarity.N]: [100, 500],
    [Rarity.R]: [500, 1500],
    [Rarity.SR]: [1500, 4000],
    [Rarity.SSR]: [4000, 10000],
    [Rarity.UR]: [10000, 30000],
  };
  
  const [minPower, maxPower] = expectedPowerRange[template.rarity];
  if (power < minPower || power > maxPower) {
    errors.push(`战力(${power})超出${template.rarity}稀有度预期范围[${minPower}, ${maxPower}]，可能存在数值膨胀风险`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateCardCombatPower(card: CardWithTemplate): number {
  const attrs = calculateFinalAttributes(
    card.template,
    card.level,
    card.breakthrough
  );
  return calculateCombatPower(attrs);
}
