import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ActivityType } from '@game/shared';

export class GetActivityListDto {
  @IsOptional()
  @IsString()
  type?: ActivityType;
}

export class ClaimActivityRewardDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;

  @IsString()
  @IsNotEmpty()
  rewardId: string;
}

export class RefreshActivityCacheDto {
  @IsOptional()
  @IsString()
  activityId?: string;
}
