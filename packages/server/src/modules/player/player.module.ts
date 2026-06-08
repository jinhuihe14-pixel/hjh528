import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PlayerEntity } from './player.entity';
import { PlayerCurrencyEntity } from './player-currency.entity';
import { CardModule } from '../card/card.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerEntity, PlayerCurrencyEntity]),
    CardModule,
  ],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
