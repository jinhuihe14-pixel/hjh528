import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Rarity, Element, CardType } from '@game/shared';

export class GetCardListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsEnum(Rarity)
  rarity?: Rarity;

  @IsOptional()
  @IsEnum(Element)
  element?: Element;

  @IsOptional()
  @IsEnum(CardType)
  type?: CardType;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'combatPower';

  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';
}
