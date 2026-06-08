import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { BindType } from '@game/shared';

export class UseItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number = 1;

  @IsOptional()
  @IsEnum(BindType)
  bindType?: BindType;
}
