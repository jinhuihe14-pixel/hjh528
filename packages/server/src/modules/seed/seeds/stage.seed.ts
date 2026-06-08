import { StageType } from '@game/shared';

export function seedStageTemplates(): { chapters: any[]; stages: any[] } {
  const chapters: any[] = [];
  const stages: any[] = [];

  const chapterDefs = [
    {
      id: 'chapter_1',
      name: '第一章：新手村',
      description: '冒险的起点，适合新手冒险者的试炼之地。',
      requiredLevel: 1,
      stageCount: 6,
      chapterReward: { gold: 5000, diamond: 50, items: [{ templateId: 'item_exp_potion_r', count: 5 }] },
    },
    {
      id: 'chapter_2',
      name: '第二章：迷雾森林',
      description: '充满神秘的迷雾森林，危险与机遇并存。',
      requiredLevel: 5,
      stageCount: 7,
      chapterReward: { gold: 10000, diamond: 100, items: [{ templateId: 'item_breakthrough_stone_r', count: 10 }] },
    },
    {
      id: 'chapter_3',
      name: '第三章：暗影山脉',
      description: '被黑暗笼罩的山脉，强大的敌人等待着挑战。',
      requiredLevel: 12,
      stageCount: 8,
      chapterReward: { gold: 20000, diamond: 200, items: [{ templateId: 'item_breakthrough_stone_sr', count: 10 }] },
    },
  ];

  const enemyCards = [
    { cardTemplateId: 'card_fire_soldier_n', rarity: 'N' },
    { cardTemplateId: 'card_water_guard_n', rarity: 'N' },
    { cardTemplateId: 'card_earth_guard_r', rarity: 'R' },
    { cardTemplateId: 'card_wind_assassin_r', rarity: 'R' },
    { cardTemplateId: 'card_light_priest_r', rarity: 'R' },
    { cardTemplateId: 'card_dark_mage_sr', rarity: 'SR' },
    { cardTemplateId: 'card_flame_warrior_sr', rarity: 'SR' },
  ];

  let stageSort = 0;

  for (let ci = 0; ci < chapterDefs.length; ci++) {
    const chapter = chapterDefs[ci];
    const stageIds: string[] = [];
    const baseLevel = ci * 5 + 1;

    for (let si = 0; si < chapter.stageCount; si++) {
      const stageNum = si + 1;
      const isBoss = si === chapter.stageCount - 1;
      const isElite = si === Math.floor(chapter.stageCount / 2);
      const stageType = isBoss ? StageType.BOSS : isElite ? StageType.ELITE : StageType.NORMAL;
      const stageId = `${chapter.id}_stage_${stageNum}`;
      stageIds.push(stageId);

      const level = baseLevel + si;
      const staminaCost = isBoss ? 20 : isElite ? 15 : 10;
      const expReward = (isBoss ? 200 : isElite ? 150 : 100) * (ci + 1) * (si + 1);
      const goldReward = (isBoss ? 500 : isElite ? 300 : 150) * (ci + 1) * (si + 1);

      const waveCount = isBoss ? 3 : isElite ? 2 : 2;
      const enemyWaves = [];

      for (let wi = 0; wi < waveCount; wi++) {
        const enemiesPerWave = isBoss && wi === waveCount - 1 ? 1 : Math.min(3, wi + 2);
        const enemies = [];

        for (let ei = 0; ei < enemiesPerWave; ei++) {
          let enemyIdx;
          if (isBoss && wi === waveCount - 1) {
            enemyIdx = Math.min(5 + ci, enemyCards.length - 1);
          } else {
            const maxRarityIdx = Math.min(2 + ci + (isElite ? 1 : 0), enemyCards.length - 1);
            enemyIdx = Math.floor(Math.random() * (maxRarityIdx + 1));
          }

          const enemyLevel = level + (isBoss ? 3 : isElite ? 1 : 0) + wi;
          const breakthrough = isBoss ? 2 : isElite ? 1 : 0;

          enemies.push({
            cardTemplateId: enemyCards[enemyIdx].cardTemplateId,
            level: enemyLevel,
            breakthrough,
            position: ei,
          });
        }

        enemyWaves.push({
          waveNumber: wi + 1,
          enemies,
        });
      }

      const normalItems: any[] = [];
      if (isBoss) {
        normalItems.push({ templateId: 'item_breakthrough_stone_r', count: 2, rate: 0.5 });
        normalItems.push({ templateId: 'item_exp_potion_r', count: 3, rate: 0.8 });
        if (ci >= 1) {
          normalItems.push({ templateId: 'item_breakthrough_stone_sr', count: 1, rate: 0.3 });
        }
      } else if (isElite) {
        normalItems.push({ templateId: 'item_breakthrough_stone_r', count: 1, rate: 0.4 });
        normalItems.push({ templateId: 'item_exp_potion_r', count: 2, rate: 0.6 });
      } else {
        normalItems.push({ templateId: 'item_exp_potion_n', count: 2, rate: 0.5 });
        normalItems.push({ templateId: 'item_gold_small', count: 1, rate: 0.2 });
      }

      const firstClearItems: any[] = [];
      firstClearItems.push({ templateId: 'item_exp_potion_n', count: 5 });
      if (isElite || isBoss) {
        firstClearItems.push({ templateId: 'item_breakthrough_stone_r', count: isBoss ? 5 : 2 });
      }
      if (isBoss) {
        firstClearItems.push({ templateId: 'item_summon_ticket_normal', count: 1 });
      }

      const recommendedPower = (isBoss ? 5000 : isElite ? 3000 : 1500) * (ci + 1) * (si + 1);

      const stage: any = {
        id: stageId,
        chapterId: chapter.id,
        name: `${chapter.name.split('：')[1]} - 第${stageNum}关`,
        type: stageType,
        description: isBoss ? 'BOSS关卡，击败强大的敌人获得丰厚奖励。' : isElite ? '精英关卡，敌人更强但奖励更丰厚。' : '普通关卡，稳步提升实力。',
        level,
        staminaCost,
        maxStars: 3,
        enemyWaves,
        firstClearReward: {
          exp: expReward * 2,
          gold: goldReward * 2,
          items: firstClearItems,
        },
        normalReward: {
          exp: expReward,
          gold: goldReward,
          items: normalItems,
        },
        recommendedPower,
        unlockCondition: si === 0 ? { requiredPlayerLevel: chapter.requiredLevel } : { requiredStageId: `${chapter.id}_stage_${si}` },
        dailyLimit: isBoss ? 3 : isElite ? 5 : 0,
        sort: stageSort++,
      };

      stages.push(stage);
    }

    chapters.push({
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      stages: stageIds,
      requiredLevel: chapter.requiredLevel,
      chapterReward: chapter.chapterReward,
      sort: ci,
    });
  }

  return { chapters, stages };
}
