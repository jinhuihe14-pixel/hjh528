import { Rarity, Element, CardType, SkillType, SkillEffectType } from '@game/shared';

export function seedCardTemplates(): any[] {
  const cards = [];

  const baseStats = {
    [Rarity.N]: { hp: 500, attack: 70, defense: 45, speed: 100, critRate: 0.05, critDamage: 1.5, hitRate: 0.95, dodgeRate: 0.05, effectHitRate: 0.5, effectResistRate: 0.3 },
    [Rarity.R]: { hp: 700, attack: 95, defense: 60, speed: 110, critRate: 0.07, critDamage: 1.55, hitRate: 0.95, dodgeRate: 0.06, effectHitRate: 0.6, effectResistRate: 0.4 },
    [Rarity.SR]: { hp: 950, attack: 130, defense: 80, speed: 120, critRate: 0.1, critDamage: 1.65, hitRate: 0.95, dodgeRate: 0.08, effectHitRate: 0.7, effectResistRate: 0.5 },
    [Rarity.SSR]: { hp: 1250, attack: 175, defense: 105, speed: 130, critRate: 0.15, critDamage: 1.75, hitRate: 0.96, dodgeRate: 0.1, effectHitRate: 0.8, effectResistRate: 0.6 },
    [Rarity.UR]: { hp: 1600, attack: 230, defense: 135, speed: 140, critRate: 0.2, critDamage: 1.9, hitRate: 0.97, dodgeRate: 0.12, effectHitRate: 0.9, effectResistRate: 0.7 },
  };

  const growthMultiplier = 0.08;

  function makeGrowth(base: any) {
    const growth = {} as any;
    for (const key of Object.keys(base)) {
      growth[key] = base[key] * growthMultiplier;
    }
    return growth;
  }

  function makeBreakthroughLevels(rarity: Rarity, unlockSkills: { level: number; skillId: string }[] = []) {
    const stones = {
      [Rarity.N]: ['item_breakthrough_stone_r', 'item_breakthrough_stone_r', 'item_breakthrough_stone_r', 'item_breakthrough_stone_sr', 'item_breakthrough_stone_sr'],
      [Rarity.R]: ['item_breakthrough_stone_r', 'item_breakthrough_stone_r', 'item_breakthrough_stone_sr', 'item_breakthrough_stone_sr', 'item_breakthrough_stone_ssr'],
      [Rarity.SR]: ['item_breakthrough_stone_sr', 'item_breakthrough_stone_sr', 'item_breakthrough_stone_sr', 'item_breakthrough_stone_ssr', 'item_breakthrough_stone_ssr'],
      [Rarity.SSR]: ['item_breakthrough_stone_ssr', 'item_breakthrough_stone_ssr', 'item_breakthrough_stone_ssr', 'item_breakthrough_stone_ur', 'item_breakthrough_stone_ur'],
      [Rarity.UR]: ['item_breakthrough_stone_ur', 'item_breakthrough_stone_ur', 'item_breakthrough_stone_ur', 'item_breakthrough_stone_ur', 'item_breakthrough_stone_ur'],
    };
    const gold = [0, 1000, 3000, 8000, 20000, 50000];
    const levels = [{ level: 0, name: '初始', requiredCards: 0, requiredMaterials: [], requiredGold: 0, attributeBonus: {}, levelCap: 30 }];
    for (let i = 1; i <= 5; i++) {
      const bonus = i * 0.08;
      const unlockSkill = unlockSkills.find(s => s.level === i);
      const entry: any = {
        level: i,
        name: `第${i}阶`,
        requiredCards: i,
        requiredMaterials: [{ itemId: stones[rarity][i - 1], count: 5 + i * 5 }],
        requiredGold: gold[i],
        attributeBonus: { hp: bonus, attack: bonus, defense: bonus * 0.8 },
        levelCap: 30 + i * 10,
      };
      if (unlockSkill) entry.unlockSkillId = unlockSkill.skillId;
      levels.push(entry);
    }
    return levels;
  }

  const cardDefs = [
    { id: 'card_fire_soldier_n', name: '火焰小兵', rarity: Rarity.N, element: Element.FIRE, type: CardType.ATTACK, desc: '初级火焰战士，擅长近战攻击。' },
    { id: 'card_water_guard_n', name: '水滴守卫', rarity: Rarity.N, element: Element.WATER, type: CardType.DEFENSE, desc: '初级水属性防御者，拥有不错的生存能力。' },
    { id: 'card_earth_guard_r', name: '岩石卫士', rarity: Rarity.R, element: Element.EARTH, type: CardType.DEFENSE, desc: '坚固的岩石卫士，拥有强大的防御力和生命值。' },
    { id: 'card_wind_assassin_r', name: '疾风刺客', rarity: Rarity.R, element: Element.WIND, type: CardType.ATTACK, desc: '速度极快的风属性刺客，擅长爆发输出。' },
    { id: 'card_light_priest_r', name: '光明牧师', rarity: Rarity.R, element: Element.LIGHT, type: CardType.SUPPORT, desc: '虔诚的光明牧师，擅长治疗和增益。' },
    { id: 'card_dark_mage_sr', name: '暗影法师', rarity: Rarity.SR, element: Element.DARK, type: CardType.CONTROL, desc: '神秘的暗影法师，擅长控制敌人和施加减益效果。' },
    { id: 'card_flame_warrior_sr', name: '烈焰战士', rarity: Rarity.SR, element: Element.FIRE, type: CardType.ATTACK, desc: '浴火重生的烈焰战士，拥有强大的火焰爆发力。' },
    { id: 'card_tidal_priestess_sr', name: '潮汐祭司', rarity: Rarity.SR, element: Element.WATER, type: CardType.SUPPORT, desc: '掌控潮汐之力的祭司，既能治疗也能输出。' },
    { id: 'card_earth_titan_sr', name: '大地泰坦', rarity: Rarity.SR, element: Element.EARTH, type: CardType.DEFENSE, desc: '大地之力的化身，拥有坚不可摧的防御。' },
    { id: 'card_storm_lord_ssr', name: '风暴领主', rarity: Rarity.SSR, element: Element.WIND, type: CardType.ATTACK, desc: '掌控风暴的领主，拥有毁灭性的输出能力。' },
    { id: 'card_holy_judge_ssr', name: '圣光审判者', rarity: Rarity.SSR, element: Element.LIGHT, type: CardType.CONTROL, desc: '神圣的审判者，拥有净化和制裁的力量。' },
    { id: 'card_void_emperor_ur', name: '虚空大帝', rarity: Rarity.UR, element: Element.DARK, type: CardType.ATTACK, desc: '来自虚空的至高存在，拥有毁灭一切的力量。' },
  ];

  for (const def of cardDefs) {
    const base = { ...baseStats[def.rarity] };
    if (def.type === CardType.ATTACK) {
      base.attack *= 1.2;
      base.hp *= 0.9;
    } else if (def.type === CardType.DEFENSE) {
      base.defense *= 1.3;
      base.hp *= 1.3;
      base.speed *= 0.85;
    } else if (def.type === CardType.SUPPORT) {
      base.hp *= 1.1;
      base.effectHitRate *= 1.2;
      base.effectResistRate *= 1.2;
    } else if (def.type === CardType.CONTROL) {
      base.effectHitRate *= 1.3;
      base.speed *= 1.05;
    }

    const skills: any[] = [
      {
        id: `${def.id}_skill_normal`,
        name: '普通攻击',
        type: SkillType.NORMAL,
        description: `造成100%攻击力的${def.element}属性伤害。`,
        level: 1,
        maxLevel: 10,
        cooldown: 0,
        effects: [{ type: SkillEffectType.DAMAGE, value: 1.0, valuePerLevel: 0.05, targetType: 'single' as const, element: def.element }],
      },
      {
        id: `${def.id}_skill_active`,
        name: '主动技能',
        type: SkillType.ACTIVE,
        description: '强力的主动技能。',
        level: 1,
        maxLevel: 10,
        cooldown: 3,
        effects: [{ type: SkillEffectType.DAMAGE, value: 1.5, valuePerLevel: 0.1, targetType: 'single' as const, element: def.element }],
        unlockCondition: { level: 1 },
      },
    ];

    if (def.type === CardType.SUPPORT) {
      skills[1] = {
        id: `${def.id}_skill_active`,
        name: '治愈术',
        type: SkillType.ACTIVE,
        description: '为生命最低的友方回复相当于攻击力120%的生命值。',
        level: 1,
        maxLevel: 10,
        cooldown: 3,
        effects: [{ type: SkillEffectType.HEAL, value: 1.2, valuePerLevel: 0.1, targetType: 'single' as const, healBasedOn: 'attack' as const }],
        unlockCondition: { level: 1 },
      };
    }

    if (def.type === CardType.CONTROL) {
      skills[1] = {
        id: `${def.id}_skill_active`,
        name: '暗影诅咒',
        type: SkillType.ACTIVE,
        description: '对所有敌人造成60%攻击力的伤害，并降低20%攻击力持续3回合。',
        level: 1,
        maxLevel: 10,
        cooldown: 5,
        effects: [
          { type: SkillEffectType.DAMAGE, value: 0.6, valuePerLevel: 0.05, targetType: 'all' as const, element: def.element },
          { type: SkillEffectType.DEBUFF, value: 0.2, valuePerLevel: 0.02, duration: 3, targetType: 'all' as const, debuffAttributes: { attack: -0.2 } },
        ],
        unlockCondition: { level: 1 },
      };
    }

    if (def.rarity === Rarity.SR || def.rarity === Rarity.SSR || def.rarity === Rarity.UR) {
      skills.push({
        id: `${def.id}_skill_ultimate`,
        name: '终极技能',
        type: SkillType.ULTIMATE,
        description: '威力强大的终极技能。',
        level: 1,
        maxLevel: 10,
        cooldown: 8,
        effects: [{ type: SkillEffectType.DAMAGE, value: 3.0, valuePerLevel: 0.2, targetType: 'single' as const, element: def.element }],
        unlockCondition: { breakthrough: 3 },
      });
    }

    const passiveSkills: any[] = [];
    if (def.rarity === Rarity.R || def.rarity === Rarity.SR || def.rarity === Rarity.SSR || def.rarity === Rarity.UR) {
      passiveSkills.push({
        id: `${def.id}_passive_1`,
        name: '天赋',
        type: SkillType.PASSIVE,
        description: '永久提升10%核心属性。',
        level: 1,
        maxLevel: 5,
        cooldown: 0,
        effects: [{ type: SkillEffectType.BUFF, value: 0.1, valuePerLevel: 0.02, targetType: 'self' as const, buffAttributes: { attack: 0.1 } }],
        unlockCondition: { breakthrough: 2 },
      });
    }

    const unlockSkills = [];
    if (def.rarity === Rarity.R || def.rarity === Rarity.SR || def.rarity === Rarity.SSR || def.rarity === Rarity.UR) {
      unlockSkills.push({ level: 2, skillId: `${def.id}_passive_1` });
    }
    if (def.rarity === Rarity.SR || def.rarity === Rarity.SSR || def.rarity === Rarity.UR) {
      unlockSkills.push({ level: 3, skillId: `${def.id}_skill_ultimate` });
    }

    const bonds = [];
    if (def.rarity !== Rarity.N && def.rarity !== Rarity.UR) {
      bonds.push({
        id: `${def.id}_bond_1`,
        name: '羁绊',
        description: '与特定卡牌同时上阵时获得属性加成。',
        requiredCardIds: [cardDefs[0].id],
        attributeBonus: { attack: 0.1, hp: 0.05 },
        active: false,
      });
    }

    const sellPrice = { N: 100, R: 200, SR: 500, SSR: 1200, UR: 3000 }[def.rarity];
    const baseExp = { N: 100, R: 150, SR: 250, SSR: 400, UR: 700 }[def.rarity];

    cards.push({
      id: def.id,
      name: def.name,
      rarity: def.rarity,
      element: def.element,
      type: def.type,
      description: def.desc,
      avatar: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(def.name + ' chibi style card art')}&image_size=square`,
      baseAttributes: base,
      growthAttributes: makeGrowth(base),
      skills,
      passiveSkills,
      breakthroughLevels: makeBreakthroughLevels(def.rarity, unlockSkills),
      bonds,
      baseExp,
      sellPrice,
      maxLevel: 100,
    });
  }

  return cards;
}
