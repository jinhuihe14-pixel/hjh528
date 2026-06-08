import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNewbieGuideDto {
  @IsOptional()
  @IsString()
  stepId?: string;

  @IsOptional()
  completed?: boolean;

  @IsOptional()
  taskProgress?: Record<string, number>;
}

export class ClaimGuideRewardDto {
  @IsString()
  @IsNotEmpty()
  stepId: string;
}

export class ClaimStageWelfareDto {
  @IsString()
  @IsNotEmpty()
  welfareId: string;
}

export class GetStageWelfareListDto {
  @IsOptional()
  @IsString()
  type?: string;
}
