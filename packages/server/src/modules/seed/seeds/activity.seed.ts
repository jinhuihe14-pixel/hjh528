import { ActivityType } from '@game/shared';

export function seedActivities(): any[] {
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'activity_daily_sign_in',
      name: '每日签到',
      type: ActivityType.SIGN_IN,
      startTime: oneWeekAgo,
      endTime: oneMonthLater,
      config: {
        cycleType: 'monthly',
        rewards: [
          { day: 1, type: 'gold', value: 5000 },
          { day: 2, type: 'item', templateId: 'item_exp_potion_n', count: 5 },
          { day: 3, type: 'gold', value: 8000 },
          { day: 4, type: 'item', templateId: 'item_stamina_potion_small', count: 3 },
          { day: 5, type: 'diamond', value: 50 },
          { day: 6, type: 'item', templateId: 'item_summon_ticket_normal', count: 2 },
          { day: 7, type: 'item', templateId: 'item_summon_ticket_advanced', count: 1 },
          { day: 8, type: 'gold', value: 10000 },
          { day: 9, type: 'item', templateId: 'item_exp_potion_r', count: 5 },
          { day: 10, type: 'diamond', value: 100 },
          { day: 11, type: 'item', templateId: 'item_breakthrough_stone_r', count: 10 },
          { day: 12, type: 'gold', value: 15000 },
          { day: 13, type: 'item', templateId: 'item_stamina_potion_large', count: 2 },
          { day: 14, type: 'item', templateId: 'item_summon_ticket_advanced', count: 2 },
          { day: 15, type: 'diamond', value: 200 },
          { day: 16, type: 'gold', value: 20000 },
          { day: 17, type: 'item', templateId: 'item_exp_potion_sr', count: 3 },
          { day: 18, type: 'item', templateId: 'item_breakthrough_stone_sr', count: 5 },
          { day: 19, type: 'diamond', value: 150 },
          { day: 20, type: 'item', templateId: 'item_summon_ticket_advanced', count: 3 },
          { day: 21, type: 'gold', value: 30000 },
          { day: 22, type: 'item', templateId: 'item_enhance_stone_r', count: 20 },
          { day: 23, type: 'diamond', value: 200 },
          { day: 24, type: 'item', templateId: 'item_skill_book_basic', count: 10 },
          { day: 25, type: 'item', templateId: 'item_exp_potion_sr', count: 5 },
          { day: 26, type: 'gold', value: 50000 },
          { day: 27, type: 'diamond', value: 300 },
          { day: 28, type: 'item', templateId: 'item_breakthrough_stone_ssr', count: 3 },
          { day: 29, type: 'item', templateId: 'item_summon_ticket_advanced', count: 5 },
          { day: 30, type: 'diamond', value: 500 },
        ],
        specialDays: [7, 14, 21, 30],
      },
      status: 'active',
      sort: 1,
    },
    {
      id: 'activity_newcomer_task',
      name: '新手任务',
      type: ActivityType.TASK,
      startTime: oneWeekAgo,
      endTime: oneMonthLater,
      config: {
        taskType: 'newcomer',
        oncePerPlayer: true,
        tasks: [
          {
            id: 'task_1',
            name: '初次召唤',
            description: '进行一次卡牌召唤',
            target: 1,
            type: 'summon_count',
            rewards: [
              { type: 'gold', value: 5000 },
              { type: 'item', templateId: 'item_exp_potion_r', count: 3 },
            ],
          },
          {
            id: 'task_2',
            name: '初战告捷',
            description: '完成首次关卡战斗',
            target: 1,
            type: 'stage_clear_count',
            rewards: [
              { type: 'gold', value: 3000 },
              { type: 'item', templateId: 'item_stamina_potion_small', count: 2 },
            ],
          },
          {
            id: 'task_3',
            name: '强化之路',
            description: '将一张卡牌升级到10级',
            target: 10,
            type: 'card_level',
            rewards: [
              { type: 'gold', value: 10000 },
              { type: 'item', templateId: 'item_exp_potion_r', count: 5 },
            ],
          },
          {
            id: 'task_4',
            name: '突破极限',
            description: '完成一次卡牌突破',
            target: 1,
            type: 'card_breakthrough',
            rewards: [
              { type: 'gold', value: 20000 },
              { type: 'item', templateId: 'item_breakthrough_stone_r', count: 10 },
            ],
          },
          {
            id: 'task_5',
            name: '组建阵容',
            description: '上阵5张卡牌',
            target: 5,
            type: 'lineup_slots',
            rewards: [
              { type: 'diamond', value: 200 },
              { type: 'item', templateId: 'item_summon_ticket_normal', count: 3 },
            ],
          },
          {
            id: 'task_6',
            name: '财富积累',
            description: '累计获得100000金币',
            target: 100000,
            type: 'gold_obtain',
            rewards: [
              { type: 'diamond', value: 100 },
              { type: 'item', templateId: 'item_gold_large', count: 1 },
            ],
          },
          {
            id: 'task_7',
            name: '冒险开始',
            description: '通关第一章',
            target: 1,
            type: 'chapter_clear',
            rewards: [
              { type: 'diamond', value: 300 },
              { type: 'item', templateId: 'item_summon_ticket_advanced', count: 2 },
            ],
          },
          {
            id: 'task_8',
            name: '七日之约',
            description: '累计登录7天',
            target: 7,
            type: 'login_days',
            rewards: [
              { type: 'diamond', value: 500 },
              { type: 'item', templateId: 'item_summon_ticket_advanced', count: 5 },
              { type: 'item', templateId: 'item_exp_potion_sr', count: 5 },
            ],
          },
        ],
      },
      status: 'active',
      sort: 2,
    },
    {
      id: 'activity_limited_summon_1',
      name: '限时召唤：风暴领主',
      type: ActivityType.GACHA,
      startTime: now,
      endTime: oneWeekLater,
      config: {
        summonType: 'advanced',
        featuredCards: [
          { templateId: 'card_storm_lord_ssr', rate: 0.01 },
          { templateId: 'card_holy_judge_ssr', rate: 0.005 },
        ],
        pity: {
          sr: 10,
          ssr: 90,
        },
        discountedFirstPull: true,
        discount: 0.5,
        bannerImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=storm%20lord%20gacha%20banner%20game&image_size=landscape_16_9',
        description: '活动期间，风暴领主出现概率大幅提升！',
        dailyLimit: 0,
        totalLimit: 0,
      },
      status: 'active',
      sort: 3,
    },
    {
      id: 'activity_weekly_double_drop',
      name: '周双倍掉落',
      type: ActivityType.LIMITED_TIME,
      startTime: now,
      endTime: twoWeeksLater,
      config: {
        activityType: 'double_drop',
        dropMultiplier: 2,
        applyTo: ['normal', 'elite', 'boss'],
        excludeItems: ['item_diamond_small', 'item_diamond_large'],
        description: '活动期间，所有副本掉落翻倍！',
        dailyBonus: {
          login: { type: 'item', templateId: 'item_stamina_potion_small', count: 2 },
        },
      },
      status: 'active',
      sort: 4,
    },
    {
      id: 'activity_first_recharge',
      name: '首充大礼包',
      type: ActivityType.FESTIVAL,
      startTime: oneWeekAgo,
      endTime: oneMonthLater,
      config: {
        activityType: 'first_purchase',
        tiers: [
          {
            amount: 6,
            rewards: [
              { type: 'card', templateId: 'card_flame_warrior_sr', count: 1 },
              { type: 'diamond', value: 60 },
              { type: 'gold', value: 50000 },
            ],
          },
          {
            amount: 30,
            rewards: [
              { type: 'diamond', value: 300 },
              { type: 'item', templateId: 'item_summon_ticket_advanced', count: 10 },
              { type: 'item', templateId: 'item_exp_potion_sr', count: 10 },
            ],
          },
          {
            amount: 98,
            rewards: [
              { type: 'diamond', value: 980 },
              { type: 'item', templateId: 'item_breakthrough_stone_sr', count: 20 },
              { type: 'item', templateId: 'item_skill_book_advanced', count: 5 },
            ],
          },
        ],
        description: '首次充值任意金额，即可获得超值大礼！',
        oncePerPlayer: true,
      },
      status: 'active',
      sort: 5,
    },
  ];
}
