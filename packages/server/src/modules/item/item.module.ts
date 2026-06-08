import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { ItemTemplateEntity } from './item-template.entity';
import { PlayerItemEntity } from './player-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemTemplateEntity, PlayerItemEntity]),
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
