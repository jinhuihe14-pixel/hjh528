import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { ItemConsumptionLogEntity } from './item-consumption-log.entity';
import { StageTemplateEntity } from '../stage/stage-template.entity';
import { PlayerStageEntity } from '../stage/player-stage.entity';
import { BattleLogEntity } from '../battle/battle-log.entity';
import { PlayerEntity } from '../player/player.entity';
import { StageModule } from '../stage/stage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemConsumptionLogEntity,
      StageTemplateEntity,
      PlayerStageEntity,
      BattleLogEntity,
      PlayerEntity,
    ]),
    forwardRef(() => StageModule),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
