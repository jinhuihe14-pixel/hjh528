import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CardTemplateEntity } from '../card/card-template.entity';
import { ItemTemplateEntity } from '../item/item-template.entity';
import { StageTemplateEntity } from '../stage/stage-template.entity';
import { ChapterTemplateEntity } from '../stage/chapter-template.entity';
import { ActivityEntity } from '../activity/activity.entity';
import { seedCardTemplates } from './seeds/card.seed';
import { seedItemTemplates } from './seeds/item.seed';
import { seedStageTemplates } from './seeds/stage.seed';
import { seedActivities } from './seeds/activity.seed';
import { Rarity, Element, CardType, ItemType } from '@game/shared';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(CardTemplateEntity)
    private cardTemplateRepository: Repository<CardTemplateEntity>,
    @InjectRepository(ItemTemplateEntity)
    private itemTemplateRepository: Repository<ItemTemplateEntity>,
    @InjectRepository(StageTemplateEntity)
    private stageTemplateRepository: Repository<StageTemplateEntity>,
    @InjectRepository(ChapterTemplateEntity)
    private chapterTemplateRepository: Repository<ChapterTemplateEntity>,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
  ) {}

  async onModuleInit() {
    const shouldInit = this.configService.get<boolean>('INIT_DATA', true);
    if (!shouldInit) {
      this.logger.log('Init data skipped');
      return;
    }

    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(`Seed data failed: ${error.message}`);
    }
  }

  async seedAll() {
    this.logger.log('Starting seed data...');
    
    await this.seedCardTemplates();
    await this.seedItemTemplates();
    await this.seedStageTemplates();
    await this.seedActivities();
    
    this.logger.log('Seed data completed!');
  }

  async seedCardTemplates() {
    const count = await this.cardTemplateRepository.count();
    if (count > 0) {
      this.logger.log(`Card templates already exist (${count}), skipping`);
      return;
    }

    const seeds = seedCardTemplates();
    for (const seed of seeds) {
      const entity = this.cardTemplateRepository.create(seed as any);
      await this.cardTemplateRepository.save(entity);
    }
    this.logger.log(`Seeded ${seeds.length} card templates`);
  }

  async seedItemTemplates() {
    const count = await this.itemTemplateRepository.count();
    if (count > 0) {
      this.logger.log(`Item templates already exist (${count}), skipping`);
      return;
    }

    const seeds = seedItemTemplates();
    for (const seed of seeds) {
      const entity = this.itemTemplateRepository.create(seed as any);
      await this.itemTemplateRepository.save(entity);
    }
    this.logger.log(`Seeded ${seeds.length} item templates`);
  }

  async seedStageTemplates() {
    const count = await this.chapterTemplateRepository.count();
    if (count > 0) {
      this.logger.log(`Stage templates already exist (${count}), skipping`);
      return;
    }

    const { chapters, stages } = seedStageTemplates();
    
    for (const seed of stages) {
      const entity = this.stageTemplateRepository.create(seed as any);
      await this.stageTemplateRepository.save(entity);
    }
    
    for (const seed of chapters) {
      const entity = this.chapterTemplateRepository.create(seed as any);
      await this.chapterTemplateRepository.save(entity);
    }
    
    this.logger.log(`Seeded ${chapters.length} chapters and ${stages.length} stages`);
  }

  async seedActivities() {
    const count = await this.activityRepository.count();
    if (count > 0) {
      this.logger.log(`Activities already exist (${count}), skipping`);
      return;
    }

    const seeds = seedActivities();
    for (const seed of seeds) {
      const entity = this.activityRepository.create(seed as any);
      await this.activityRepository.save(entity);
    }
    this.logger.log(`Seeded ${seeds.length} activities`);
  }
}
