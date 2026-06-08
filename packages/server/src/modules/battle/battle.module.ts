import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { BattleLogEntity } from './battle-log.entity';
import { CardModule } from '../card/card.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BattleLogEntity]),
    forwardRef(() => CardModule),
  ],
  controllers: [BattleController],
  providers: [BattleService],
  exports: [BattleService],
})
export class BattleModule {}
