import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  CardTemplate,
  Card,
  CardWithTemplate,
  BaseAttributes,
  BreakthroughLevel,
  calculateMaxLevel,
  calculateFinalAttributes,
  calculateCombatPower,
  calculateCardCombatPower,
  calculateLevelExpRequired,
  calculateTotalExpToLevel,
  FORMATION_SLOTS,
  MAX_BREAKTHROUGH_LEVEL,
} from '@game/shared';

import { CardTemplateEntity } from './card-template.entity';
import { PlayerCardEntity } from './player-card.entity';
import { GetCardListDto } from './dto/get-card-list.dto';
import { UpgradeCardDto, UpgradeCostType } from './dto/upgrade-card.dto';
import { BreakthroughCardDto } from './dto/breakthrough-card.dto';
import { SetLineupDto } from './dto/set-lineup.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardTemplateEntity)
    private readonly cardTemplateRepository: Repository<CardTemplateEntity>,
    @InjectRepository(PlayerCardEntity)
    private readonly playerCardRepository: Repository<PlayerCardEntity>,
  ) {}

  async getTemplateList(dto: GetCardListDto): Promise<{ list: CardTemplate[]; total: number }> {
    const { page = 1, pageSize = 20, rarity, element, type, keyword, sortBy, sortOrder } = dto;

    const queryBuilder = this.cardTemplateRepository.createQueryBuilder('template');

    if (rarity) {
      queryBuilder.andWhere('template.rarity = :rarity', { rarity });
    }
    if (element) {
      queryBuilder.andWhere('template.element = :element', { element });
    }
    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
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
      list: templates as unknown as CardTemplate[],
      total,
    };
  }

  async getTemplateDetail(templateId: string): Promise<CardTemplate> {
    const template = await this.cardTemplateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('卡牌模板不存在');
    }

    return template as unknown as CardTemplate;
  }

  async giveCard(playerId: string, templateId: string): Promise<CardWithTemplate> {
    const template = await this.getTemplateDetail(templateId);

    const newCard = this.playerCardRepository.create({
      playerId,
      templateId,
      level: 1,
      exp: 0,
      breakthrough: 0,
      stars: 0,
      combatPower: 0,
      skills: template.skills.map(s => ({ ...s })),
    });

    const savedCard = await this.playerCardRepository.save(newCard);
    
    const cardWithTemplate = {
      ...savedCard,
      template,
    } as CardWithTemplate;

    cardWithTemplate.combatPower = this.calculateCardPower(cardWithTemplate);
    await this.playerCardRepository.save(savedCard);

    return cardWithTemplate;
  }

  async giveCards(playerId: string, templateIds: string[]): Promise<CardWithTemplate[]> {
    const results: CardWithTemplate[] = [];
    for (const templateId of templateIds) {
      const card = await this.giveCard(playerId, templateId);
      results.push(card);
    }
    return results;
  }

  async getPlayerCardList(playerId: string, dto: GetCardListDto): Promise<{ list: CardWithTemplate[]; total: number }> {
    const { page = 1, pageSize = 20, rarity, element, type, keyword, sortBy, sortOrder } = dto;

    const queryBuilder = this.playerCardRepository.createQueryBuilder('card')
      .leftJoinAndMapOne('card.template', CardTemplateEntity, 'template', 'card.template_id = template.id')
      .where('card.player_id = :playerId', { playerId });

    if (rarity) {
      queryBuilder.andWhere('template.rarity = :rarity', { rarity });
    }
    if (element) {
      queryBuilder.andWhere('template.element = :element', { element });
    }
    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }
    if (keyword) {
      queryBuilder.andWhere('template.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (sortBy) {
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
      if (sortBy === 'combatPower' || sortBy === 'level' || sortBy === 'breakthrough') {
        queryBuilder.orderBy(`card.${sortBy}`, order);
      } else {
        queryBuilder.orderBy(`template.${sortBy}`, order);
      }
    }

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [cards, total] = await queryBuilder.getManyAndCount();

    const cardList = cards.map(card => this.formatCardWithTemplate(card));

    return {
      list: cardList,
      total,
    };
  }

  async getPlayerCardDetail(playerId: string, cardId: string): Promise<CardWithTemplate> {
    const card = await this.playerCardRepository.createQueryBuilder('card')
      .leftJoinAndMapOne('card.template', CardTemplateEntity, 'template', 'card.template_id = template.id')
      .where('card.id = :cardId', { cardId })
      .andWhere('card.player_id = :playerId', { playerId })
      .getOne();

    if (!card) {
      throw new NotFoundException('卡牌不存在');
    }

    return this.formatCardWithTemplate(card);
  }

  async upgradeCard(playerId: string, dto: UpgradeCardDto): Promise<CardWithTemplate> {
    const { cardId, targetLevel, costType } = dto;

    const card = await this.playerCardRepository.findOne({
      where: { id: cardId, playerId },
    });

    if (!card) {
      throw new NotFoundException('卡牌不存在');
    }

    const template = await this.cardTemplateRepository.findOne({
      where: { id: card.templateId },
    });

    if (!template) {
      throw new NotFoundException('卡牌模板不存在');
    }

    const maxLevel = calculateMaxLevel(card.breakthrough);
    const currentLevel = card.level;

    if (currentLevel >= maxLevel) {
      throw new BadRequestException('卡牌已达到当前突破等级的最大等级，请先突破');
    }

    let targetLv = targetLevel || currentLevel + 1;

    if (targetLv > maxLevel) {
      targetLv = maxLevel;
    }

    if (targetLv <= currentLevel) {
      throw new BadRequestException('目标等级必须大于当前等级');
    }

    const expNeeded = calculateTotalExpToLevel(targetLv, template.rarity) - card.exp;

    if (costType === UpgradeCostType.EXP) {
      if (card.exp < expNeeded) {
        throw new BadRequestException('经验不足');
      }
      card.exp -= expNeeded;
    } else {
      const goldCost = expNeeded * 10;
      throw new BadRequestException('金币消耗功能暂未实现');
    }

    card.level = targetLv;

    const cardTemplate = template as unknown as CardTemplate;
    const finalAttrs = calculateFinalAttributes(cardTemplate, card.level, card.breakthrough);
    card.combatPower = calculateCombatPower(finalAttrs);

    await this.playerCardRepository.save(card);

    return this.formatCardWithTemplate(card, cardTemplate);
  }

  async breakthroughCard(playerId: string, dto: BreakthroughCardDto): Promise<CardWithTemplate> {
    const { cardId, consumeCardIds, materials } = dto;

    const card = await this.playerCardRepository.findOne({
      where: { id: cardId, playerId },
    });

    if (!card) {
      throw new NotFoundException('卡牌不存在');
    }

    const template = await this.cardTemplateRepository.findOne({
      where: { id: card.templateId },
    });

    if (!template) {
      throw new NotFoundException('卡牌模板不存在');
    }

    const breakthroughLevels = template.breakthroughLevels as unknown as BreakthroughLevel[];
    const maxBreakthrough = Math.min(breakthroughLevels.length - 1, MAX_BREAKTHROUGH_LEVEL);

    if (card.breakthrough >= maxBreakthrough) {
      throw new BadRequestException('卡牌已达到最大突破等级');
    }

    const nextBreakthrough = card.breakthrough + 1;
    const breakthroughConfig = breakthroughLevels[nextBreakthrough];

    if (!breakthroughConfig) {
      throw new BadRequestException('突破配置不存在');
    }

    if (card.level < breakthroughConfig.levelCap) {
      throw new BadRequestException(`需要达到 ${breakthroughConfig.levelCap} 级才能突破`);
    }

    if (consumeCardIds.length < breakthroughConfig.requiredCards) {
      throw new BadRequestException(`需要消耗 ${breakthroughConfig.requiredCards} 张同名卡牌`);
    }

    const consumeCards = await this.playerCardRepository.find({
      where: {
        id: In(consumeCardIds),
        playerId,
        templateId: card.templateId,
      },
    });

    if (consumeCards.length < breakthroughConfig.requiredCards) {
      throw new BadRequestException('消耗的卡牌不足或不是同名卡牌');
    }

    if (consumeCards.some(c => c.id === cardId)) {
      throw new BadRequestException('不能消耗目标卡牌本身');
    }

    const cardTemplate = template as unknown as CardTemplate;

    card.breakthrough = nextBreakthrough;

    const finalAttrs = calculateFinalAttributes(cardTemplate, card.level, card.breakthrough);
    card.combatPower = calculateCombatPower(finalAttrs);

    await this.playerCardRepository.save(card);

    await this.playerCardRepository.remove(consumeCards);

    return this.formatCardWithTemplate(card, cardTemplate);
  }

  async getLineup(playerId: string): Promise<(CardWithTemplate | null)[]> {
    const cards = await this.playerCardRepository.createQueryBuilder('card')
      .leftJoinAndMapOne('card.template', CardTemplateEntity, 'template', 'card.template_id = template.id')
      .where('card.player_id = :playerId', { playerId })
      .andWhere('card.position IS NOT NULL')
      .orderBy('card.position', 'ASC')
      .getMany();

    const lineup: (CardWithTemplate | null)[] = new Array(FORMATION_SLOTS).fill(null);

    for (const card of cards) {
      if (card.position !== undefined && card.position >= 0 && card.position < FORMATION_SLOTS) {
        lineup[card.position] = this.formatCardWithTemplate(card);
      }
    }

    return lineup;
  }

  async setLineup(playerId: string, dto: SetLineupDto): Promise<(CardWithTemplate | null)[]> {
    const { lineup } = dto;

    if (lineup.length > FORMATION_SLOTS) {
      throw new BadRequestException(`阵容最多 ${FORMATION_SLOTS} 个位置`);
    }

    const cardIds = lineup.filter(slot => slot.cardId).map(slot => slot.cardId!);
    const uniqueCardIds = [...new Set(cardIds)];

    if (cardIds.length !== uniqueCardIds.length) {
      throw new BadRequestException('同一张卡牌不能出现在多个位置');
    }

    const cards = await this.playerCardRepository.find({
      where: {
        id: In(uniqueCardIds),
        playerId,
      },
    });

    if (cards.length !== uniqueCardIds.length) {
      throw new BadRequestException('部分卡牌不存在');
    }

    await this.playerCardRepository
      .createQueryBuilder()
      .update()
      .set({ position: null })
      .where('player_id = :playerId', { playerId })
      .execute();

    for (const slot of lineup) {
      if (slot.cardId && slot.position >= 0 && slot.position < FORMATION_SLOTS) {
        await this.playerCardRepository
          .createQueryBuilder()
          .update()
          .set({ position: slot.position })
          .where('id = :cardId AND player_id = :playerId', { cardId: slot.cardId, playerId })
          .execute();
      }
    }

    return this.getLineup(playerId);
  }

  calculateCardAttributes(card: CardWithTemplate): BaseAttributes {
    return calculateFinalAttributes(card.template, card.level, card.breakthrough);
  }

  calculateCardPower(card: CardWithTemplate): number {
    return calculateCardCombatPower(card);
  }

  private formatCardWithTemplate(card: PlayerCardEntity & { template?: CardTemplateEntity }, template?: CardTemplate): CardWithTemplate {
    const tpl = template || (card.template as unknown as CardTemplate);

    const result: CardWithTemplate = {
      id: card.id,
      templateId: card.templateId,
      playerId: card.playerId,
      level: card.level,
      exp: card.exp,
      breakthrough: card.breakthrough,
      skills: card.skills || [],
      stars: card.stars,
      combatPower: card.combatPower,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      template: tpl,
    };

    if ((card as any).position !== undefined) {
      (result as any).position = (card as any).position;
    }

    return result;
  }
}
