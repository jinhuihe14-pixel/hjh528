import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ItemType, StageDifficulty } from '@game/shared';

export class GetItemConsumptionStatsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

export class GetDifficultyStatsDto {
  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsEnum(StageDifficulty)
  difficulty?: StageDifficulty;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class GetDailyStatsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
