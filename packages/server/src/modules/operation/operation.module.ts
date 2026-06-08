import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OperationService } from './operation.service';
import { OperationController } from './operation.controller';
import { OperationLogEntity } from './operation-log.entity';
import { ConfigEntity } from './config.entity';
import { ActivityModule } from '../activity/activity.module';
import { StageModule } from '../stage/stage.module';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationLogEntity, ConfigEntity]),
    forwardRef(() => ActivityModule),
    forwardRef(() => StageModule),
    forwardRef(() => PlayerModule),
  ],
  controllers: [OperationController],
  providers: [OperationService],
  exports: [OperationService],
})
export class OperationModule {}
