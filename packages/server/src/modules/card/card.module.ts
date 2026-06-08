import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CardTemplateEntity } from './card-template.entity';
import { PlayerCardEntity } from './player-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardTemplateEntity, PlayerCardEntity]),
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
