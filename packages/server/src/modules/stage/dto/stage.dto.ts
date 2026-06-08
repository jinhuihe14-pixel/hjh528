import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { StageType, StageDifficulty } from '@game/shared';

export class GetStageListDto {
  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsEnum(StageType)
  type?: StageType;

  @IsOptional()
  @IsEnum(StageDifficulty)
  difficulty?: StageDifficulty;

  @IsOptional()
  @IsString()
  difficultyGroup?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

export class ChallengeStageDto {
  @IsString()
  @IsNotEmpty()
  stageId: string;
}

export class ClaimChapterRewardDto {
  @IsString()
  @IsNotEmpty()
  chapterId: string;
}

export class GetStageFeedbackDto {
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
