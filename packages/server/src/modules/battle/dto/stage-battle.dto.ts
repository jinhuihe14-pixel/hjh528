import { IsString, IsNotEmpty } from 'class-validator';

export class StageBattleDto {
  @IsString()
  @IsNotEmpty()
  stageId: string;
}
