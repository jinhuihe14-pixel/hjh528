import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PlayerEntity } from './player.entity';
import { PlayerCurrencyEntity } from './player-currency.entity';
import { PlayerNewbieGuideEntity } from './player-newbie-guide.entity';
import { PlayerStageWelfareEntity } from './player-stage-welfare.entity';
import { CardModule } from '../card/card.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerEntity,
      PlayerCurrencyEntity,
      PlayerNewbieGuideEntity,
      PlayerStageWelfareEntity,
    ]),
    CardModule,
    forwardRef(() => ItemModule),
  ],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
