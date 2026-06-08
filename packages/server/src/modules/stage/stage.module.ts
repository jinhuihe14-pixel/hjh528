import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { StageTemplateEntity } from './stage-template.entity';
import { ChapterTemplateEntity } from './chapter-template.entity';
import { PlayerStageEntity } from './player-stage.entity';
import { PlayerModule } from '../player/player.module';
import { BattleModule } from '../battle/battle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StageTemplateEntity, ChapterTemplateEntity, PlayerStageEntity]),
    forwardRef(() => PlayerModule),
    forwardRef(() => BattleModule),
  ],
  controllers: [StageController],
  providers: [StageService],
  exports: [StageService],
})
export class StageModule {}
