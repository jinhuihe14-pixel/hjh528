import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { CardTemplateEntity } from '../card/card-template.entity';
import { ItemTemplateEntity } from '../item/item-template.entity';
import { StageTemplateEntity } from '../stage/stage-template.entity';
import { ChapterTemplateEntity } from '../stage/chapter-template.entity';
import { ActivityEntity } from '../activity/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardTemplateEntity,
      ItemTemplateEntity,
      StageTemplateEntity,
      ChapterTemplateEntity,
      ActivityEntity,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
