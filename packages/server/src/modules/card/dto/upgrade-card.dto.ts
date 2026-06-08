import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';

export enum UpgradeCostType {
  EXP = 'exp',
  GOLD = 'gold',
}

export class UpgradeCardDto {
  @IsNotEmpty()
  @IsString()
  cardId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetLevel?: number;

  @IsOptional()
  @IsEnum(UpgradeCostType)
  costType?: UpgradeCostType = UpgradeCostType.EXP;
}
