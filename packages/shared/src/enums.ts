export enum Rarity {
  N = 'N',
  R = 'R',
  SR = 'SR',
  SSR = 'SSR',
  UR = 'UR',
}

export enum Element {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  WIND = 'wind',
  LIGHT = 'light',
  DARK = 'dark',
}

export enum CardType {
  ATTACK = 'attack',
  DEFENSE = 'defense',
  SUPPORT = 'support',
  CONTROL = 'control',
}

export enum SkillType {
  NORMAL = 'normal',
  ACTIVE = 'active',
  PASSIVE = 'passive',
  ULTIMATE = 'ultimate',
}

export enum SkillEffectType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SHIELD = 'shield',
  DOT = 'dot',
  HOT = 'hot',
}

export enum CurrencyType {
  GOLD = 'gold',
  DIAMOND = 'diamond',
  STAMINA = 'stamina',
  EXP = 'exp',
  ARENA_COIN = 'arena_coin',
  GUILD_COIN = 'guild_coin',
}

export enum ItemType {
  CARD = 'card',
  MATERIAL = 'material',
  CONSUMABLE = 'consumable',
  CURRENCY = 'currency',
  EQUIPMENT = 'equipment',
}

export enum BattleStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  FIGHTING = 'fighting',
  ENDED = 'ended',
}

export enum BattleResult {
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
}

export enum StageType {
  NORMAL = 'normal',
  HARD = 'hard',
  ELITE = 'elite',
  BOSS = 'boss',
}

export enum StageDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  CHALLENGE = 'challenge',
}

export enum GuideStepType {
  DIALOG = 'dialog',
  HIGHLIGHT = 'highlight',
  TASK = 'task',
  REWARD = 'reward',
}

export enum OperationLogType {
  CONFIG_UPDATE = 'config_update',
  ACTIVITY_CREATE = 'activity_create',
  ACTIVITY_UPDATE = 'activity_update',
  STAGE_UPDATE = 'stage_update',
  ITEM_UPDATE = 'item_update',
  CARD_UPDATE = 'card_update',
  PLAYER_BAN = 'player_ban',
  PLAYER_UNBAN = 'player_unban',
  REWARD_GRANT = 'reward_grant',
}

export enum SignInCycleType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  LIMITED = 'limited',
}

export enum ActivityType {
  SIGN_IN = 'sign_in',
  TASK = 'task',
  GACHA = 'gacha',
  LIMITED_TIME = 'limited_time',
  FESTIVAL = 'festival',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BindType {
  BIND = 'bind',
  UNBIND = 'unbind',
}
