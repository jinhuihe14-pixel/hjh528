import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivityEntity } from './activity.entity';
import { PlayerActivityEntity } from './player-activity.entity';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEntity, PlayerActivityEntity]),
    forwardRef(() => PlayerModule),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
