import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ItemTemplate,
  Item,
  Inventory,
  ItemType,
  Rarity,
  BindType,
  ItemUseEffect,
} from '@game/shared';

import { ItemTemplateEntity } from './item-template.entity';
import { PlayerItemEntity } from './player-item.entity';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { UseItemDto } from './dto/use-item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemTemplateEntity)
    private readonly itemTemplateRepository: Repository<ItemTemplateEntity>,
    @InjectRepository(PlayerItemEntity)
    private readonly playerItemRepository: Repository<PlayerItemEntity>,
  ) {}

  async getTemplateList(dto: {
    page?: number;
    pageSize?: number;
    type?: ItemType;
    rarity?: Rarity;
    keyword?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ list: ItemTemplate[]; total: number }> {
    const { page = 1, pageSize = 20, type, rarity, keyword, sortBy, sortOrder } = dto;

    const queryBuilder = this.itemTemplateRepository.createQueryBuilder('template');

    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }
    if (rarity) {
      queryBuilder.andWhere('template.rarity = :rarity', { rarity });
    }
    if (keyword) {
      queryBuilder.andWhere('template.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (sortBy) {
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`template.${sortBy}`, order);
    }

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [templates, total] = await queryBuilder.getManyAndCount();

    return {
      list: templates as unknown as ItemTemplate[],
      total,
    };
  }

  async getTemplate(templateId: string): Promise<ItemTemplate> {
    const template = await this.itemTemplateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('物品模板不存在');
    }

    return template as unknown as ItemTemplate;
  }

  async getInventory(playerId: string, dto: GetInventoryDto): Promise<Inventory> {
    const { type, rarity, keyword } = dto;

    const queryBuilder = this.playerItemRepository.createQueryBuilder('item')
      .leftJoinAndMapOne('item.template', ItemTemplateEntity, 'template', 'item.template_id = template.id')
      .where('item.player_id = :playerId', { playerId });

    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }
    if (rarity) {
      queryBuilder.andWhere('template.rarity = :rarity', { rarity });
    }
    if (keyword) {
      queryBuilder.andWhere('template.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const items = await queryBuilder.getMany();

    const itemList = items.map(item => this.formatPlayerItem(item));

    return {
      playerId,
      items: itemList,
      capacity: 200,
    };
  }

  async getItemCount(playerId: string, templateId: string, bindType?: BindType): Promise<number> {
    const queryBuilder = this.playerItemRepository.createQueryBuilder('item')
      .where('item.player_id = :playerId', { playerId })
      .andWhere('item.template_id = :templateId', { templateId });

    if (bindType) {
      queryBuilder.andWhere('item.bind_type = :bindType', { bindType });
    }

    const items = await queryBuilder.getMany();
    return items.reduce((sum, item) => sum + item.count, 0);
  }

  async checkItemCount(playerId: string, templateId: string, count: number, bindType?: BindType): Promise<boolean> {
    const total = await this.getItemCount(playerId, templateId, bindType);
    return total >= count;
  }

  async addItem(
    playerId: string,
    templateId: string,
    count: number,
    bindType: BindType = BindType.UNBIND,
    source?: string,
  ): Promise<Item> {
    if (count <= 0) {
      throw new BadRequestException('物品数量必须大于0');
    }

    const template = await this.itemTemplateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('物品模板不存在');
    }

    const useBindType = template.bindType === BindType.BIND ? BindType.BIND : bindType;

    let playerItem = await this.playerItemRepository.findOne({
      where: {
        playerId,
        templateId,
        bindType: useBindType,
      },
    });

    if (playerItem) {
      const newCount = playerItem.count + count;

      if (template.maxStack > 0 && newCount > template.maxStack) {
        throw new BadRequestException(`物品数量超过堆叠上限 ${template.maxStack}`);
      }

      playerItem.count = newCount;
      await this.playerItemRepository.save(playerItem);
    } else {
      if (template.maxStack > 0 && count > template.maxStack) {
        throw new BadRequestException(`物品数量超过堆叠上限 ${template.maxStack}`);
      }

      playerItem = this.playerItemRepository.create({
        playerId,
        templateId,
        count,
        bindType: useBindType,
      });
      await this.playerItemRepository.save(playerItem);
    }

    this.recordItemLog(playerId, templateId, count, 'add', useBindType, source);

    return this.formatPlayerItem(playerItem, template as unknown as ItemTemplate);
  }

  async removeItem(
    playerId: string,
    templateId: string,
    count: number,
    bindType?: BindType,
    source?: string,
  ): Promise<void> {
    if (count <= 0) {
      throw new BadRequestException('物品数量必须大于0');
    }

    const template = await this.itemTemplateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('物品模板不存在');
    }

    const queryBuilder = this.playerItemRepository.createQueryBuilder('item')
      .where('item.player_id = :playerId', { playerId })
      .andWhere('item.template_id = :templateId', { templateId });

    if (bindType) {
      queryBuilder.andWhere('item.bind_type = :bindType', { bindType });
    }

    const items = await queryBuilder.getMany();
    const totalCount = items.reduce((sum, item) => sum + item.count, 0);

    if (totalCount < count) {
      throw new BadRequestException('物品数量不足');
    }

    let remaining = count;
    const sortedItems = [...items].sort((a, b) => {
      if (a.bindType === BindType.BIND && b.bindType !== BindType.BIND) return -1;
      if (a.bindType !== BindType.BIND && b.bindType === BindType.BIND) return 1;
      return 0;
    });

    for (const item of sortedItems) {
      if (remaining <= 0) break;

      if (item.count <= remaining) {
        remaining -= item.count;
        await this.playerItemRepository.remove(item);
        this.recordItemLog(playerId, templateId, item.count, 'remove', item.bindType, source);
      } else {
        item.count -= remaining;
        await this.playerItemRepository.save(item);
        this.recordItemLog(playerId, templateId, remaining, 'remove', item.bindType, source);
        remaining = 0;
      }
    }
  }

  async useItem(playerId: string, dto: UseItemDto): Promise<any> {
    const { itemId, count = 1, bindType } = dto;

    const template = await this.getTemplate(itemId);

    if (!template.usable) {
      throw new BadRequestException('该物品不可使用');
    }

    const hasEnough = await this.checkItemCount(playerId, itemId, count, bindType);
    if (!hasEnough) {
      throw new BadRequestException('物品数量不足');
    }

    const useEffect = template.useEffect;
    if (!useEffect) {
      throw new BadRequestException('物品使用效果未配置');
    }

    await this.removeItem(playerId, itemId, count, bindType, 'use');

    const result = await this.applyUseEffect(playerId, useEffect, count);

    return {
      success: true,
      itemId,
      count,
      result,
    };
  }

  private async applyUseEffect(playerId: string, effect: ItemUseEffect, count: number): Promise<any> {
    const totalValue = effect.value * count;

    switch (effect.type) {
      case 'gain_currency':
        return this.gainCurrency(playerId, effect.currencyType || 'gold', totalValue);
      case 'gain_exp':
        return { exp: totalValue };
      case 'heal':
        return { heal: totalValue };
      case 'buff':
        return { buff: totalValue };
      default:
        return {};
    }
  }

  private async gainCurrency(playerId: string, currencyType: string, amount: number): Promise<any> {
    // TODO: 调用玩家服务增加货币
    // - 预留货币日志接口
    console.log(`玩家 ${playerId} 获得 ${currencyType}: ${amount}`);
    return { currencyType, amount };
  }

  private recordItemLog(
    playerId: string,
    templateId: string,
    count: number,
    action: 'add' | 'remove',
    bindType: BindType,
    source?: string,
  ): void {
    // TODO: 物品日志记录
    console.log(`物品日志: 玩家 ${playerId} ${action === 'add' ? '获得' : '消耗'} ${templateId} x${count} (${bindType}) 来源: ${source || 'unknown'}`);
  }

  private formatPlayerItem(
    item: PlayerItemEntity & { template?: ItemTemplateEntity },
    template?: ItemTemplate,
  ): Item {
    const tpl = template || (item.template as unknown as ItemTemplate);

    return {
      id: item.id,
      templateId: item.templateId,
      playerId: item.playerId,
      count: item.count,
      bindType: item.bindType,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      ...(tpl ? { template: tpl } : {}),
    } as Item;
  }

  async batchAddItems(
    playerId: string,
    items: { templateId: string; count: number; bindType?: BindType }[],
    source?: string,
  ): Promise<Item[]> {
    const results: Item[] = [];

    for (const item of items) {
      const result = await this.addItem(
        playerId,
        item.templateId,
        item.count,
        item.bindType || BindType.UNBIND,
        source,
      );
      results.push(result);
    }

    return results;
  }
}
