import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { StageType } from '@game/shared';

export class GetStageListDto {
  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsEnum(StageType)
  type?: StageType;
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
