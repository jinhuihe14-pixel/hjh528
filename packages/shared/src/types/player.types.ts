import { CurrencyType, BindType } from '../enums';

export interface Player {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  level: number;
  exp: number;
  vipLevel: number;
  serverId: string;
  guildId?: string;
  combatPower: number;
  createdAt: Date;
  lastLoginAt: Date;
  isOnline: boolean;
  status: 'active' | 'banned' | 'suspended';
  banReason?: string;
  banEndAt?: Date;
}

export interface PlayerCurrency {
  playerId: string;
  type: CurrencyType;
  bindType: BindType;
  amount: number;
  updatedAt: Date;
}

export interface PlayerResource {
  gold: number;
  bindGold: number;
  diamond: number;
  bindDiamond: number;
  stamina: number;
  exp: number;
  arenaCoin: number;
  guildCoin: number;
}

export interface PlayerCard {
  id: string;
  playerId: string;
  cardId: string;
  position: number;
  createdAt: Date;
}

export interface PlayerLineup {
  playerId: string;
  lineupType: string;
  cardIds: (string | null)[];
  updatedAt: Date;
}

export interface PlayerStageProgress {
  playerId: string;
  stageId: string;
  starCount: number;
  clearedAt: Date;
}

export interface PlayerFriend {
  playerId: string;
  friendId: string;
  friendship: number;
  createdAt: Date;
}

export interface PlayerDaily {
  playerId: string;
  date: string;
  loginCount: number;
  totalLoginDays: number;
  lastSignInAt?: Date;
}

export interface PlayerCreateDto {
  username: string;
  password: string;
  nickname: string;
  serverId: string;
}

export interface PlayerLoginDto {
  username: string;
  password: string;
  serverId: string;
}

export interface PlayerInfo {
  player: Player;
  resources: PlayerResource;
  cards: PlayerCard[];
  lineup: PlayerLineup;
}
