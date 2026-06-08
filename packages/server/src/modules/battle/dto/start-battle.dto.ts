import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export enum BattleType {
  STAGE = 'stage',
  ARENA = 'arena',
  PVP = 'pvp',
}

export class StartBattleDto {
  @IsEnum(BattleType)
  @IsNotEmpty()
  battleType: BattleType;

  @IsOptional()
  @IsString()
  enemyPlayerId?: string;

  @IsOptional()
  @IsString()
  lineupType?: string;
}
