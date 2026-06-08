import { IsArray, ArrayMaxSize, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { FORMATION_SLOTS } from '@game/shared';

export class LineupSlotDto {
  @IsInt()
  @Min(0)
  position: number;

  @IsOptional()
  @IsString()
  cardId?: string;
}

export class SetLineupDto {
  @IsArray()
  @ArrayMaxSize(FORMATION_SLOTS)
  lineup: LineupSlotDto[];
}
