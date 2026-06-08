import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;
}

export class MakeUpSignInDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;

  @IsNumber()
  day: number;
}

export class ClaimCumulativeRewardDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;

  @IsString()
  @IsNotEmpty()
  rewardId: string;
}

export class GetSignInStatusDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;
}
