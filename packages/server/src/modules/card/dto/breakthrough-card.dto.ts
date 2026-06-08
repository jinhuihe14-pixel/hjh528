import { IsNotEmpty, IsString, IsArray, ArrayMinSize, IsInt, Min } from 'class-validator';

export class BreakthroughCardDto {
  @IsNotEmpty()
  @IsString()
  cardId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  consumeCardIds: string[];

  @IsArray()
  materials?: { itemId: string; count: number }[];
}
