import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivityEntity } from './activity.entity';
import { PlayerActivityEntity } from './player-activity.entity';
import { PlayerSignInEntity } from './player-sign-in.entity';
import { PlayerModule } from '../player/player.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEntity, PlayerActivityEntity, PlayerSignInEntity]),
    forwardRef(() => PlayerModule),
    forwardRef(() => ItemModule),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
