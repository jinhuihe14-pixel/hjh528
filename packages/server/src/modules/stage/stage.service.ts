import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageType, StageTemplate, ChapterTemplate } from '@game/shared';

import { StageTemplateEntity } from './stage-template.entity';
import { ChapterTemplateEntity } from './chapter-template.entity';
import { PlayerStageEntity } from './player-stage.entity';
import { GetStageListDto, ChallengeStageDto } from './dto/stage.dto';
import { PlayerService } from '../player/player.service';
import { BattleService } from '../battle/battle.service';

@Injectable()
export class StageService {
  constructor(
    @InjectRepository(StageTemplateEntity)
    private readonly stageTemplateRepository: Repository<StageTemplateEntity>,
    @InjectRepository(ChapterTemplateEntity)
    private readonly chapterTemplateRepository: Repository<ChapterTemplateEntity>,
    @InjectRepository(PlayerStageEntity)
    private readonly playerStageRepository: Repository<PlayerStageEntity>,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => BattleService))
    private readonly battleService: BattleService,
  ) {}

  async getChapterList(): Promise<ChapterTemplate[]> {
    const chapters = await this.chapterTemplateRepository.find({
      order: { sort: 'ASC' },
    });

    return chapters as unknown as ChapterTemplate[];
  }

  async getStageList(dto: GetStageListDto): Promise<{ list: StageTemplate[]; total: number }> {
    const { chapterId, type } = dto;

    const queryBuilder = this.stageTemplateRepository.createQueryBuilder('stage');

    if (chapterId) {
      queryBuilder.andWhere('stage.chapter_id = :chapterId', { chapterId });
    }
    if (type) {
      queryBuilder.andWhere('stage.type = :type', { type });
    }

    queryBuilder.orderBy('stage.sort', 'ASC');

    const [stages, total] = await queryBuilder.getManyAndCount();

    return {
      list: stages as unknown as StageTemplate[],
      total,
    };
  }

  async getStageDetail(stageId: string): Promise<StageTemplate> {
    const stage = await this.stageTemplateRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('关卡不存在');
    }

    return stage as unknown as StageTemplate;
  }

  async getPlayerProgress(playerId: string): Promise<{
    stages: PlayerStageEntity[];
    totalStars: number;
  }> {
    const playerStages = await this.playerStageRepository.find({
      where: { playerId },
    });

    const totalStars = playerStages.reduce((sum, s) => sum + s.stars, 0);

    return {
      stages: playerStages,
      totalStars,
    };
  }

  async getPlayerStage(playerId: string, stageId: string): Promise<PlayerStageEntity | null> {
    return this.playerStageRepository.findOne({
      where: { playerId, stageId },
    });
  }

  async challengeStage(playerId: string, dto: ChallengeStageDto): Promise<any> {
    const { stageId } = dto;

    const stage = await this.getStageDetail(stageId);

    const player = await this.playerService.getPlayerInfo(playerId);

    await this.checkUnlockCondition(playerId, stage, player.level);

    const playerStage = await this.getPlayerStage(playerId, stageId);
    if (stage.dailyLimit > 0 && playerStage && playerStage.dailyChallenges >= stage.dailyLimit) {
      throw new BadRequestException('今日挑战次数已达上限');
    }

    await this.consumeStamina(playerId, stage.staminaCost);

    try {
      const battleResult = await this.battleService.startStageBattle(playerId, {
        stageId,
      });

      await this.updatePlayerStageProgress(playerId, stageId, battleResult.result === 'win');

      return battleResult;
    } catch (error) {
      throw error;
    }
  }

  private async checkUnlockCondition(playerId: string, stage: StageTemplate, playerLevel: number): Promise<void> {
    const condition = stage.unlockCondition;

    if (condition.requiredPlayerLevel && playerLevel < condition.requiredPlayerLevel) {
      throw new BadRequestException(`玩家等级不足，需要 ${condition.requiredPlayerLevel} 级`);
    }

    if (condition.requiredStageId) {
      const requiredStage = await this.getPlayerStage(playerId, condition.requiredStageId);
      if (!requiredStage || !requiredStage.isCleared) {
        throw new BadRequestException('前置关卡未通关');
      }
    }

    if (condition.requiredStars) {
      const progress = await this.getPlayerProgress(playerId);
      if (progress.totalStars < condition.requiredStars) {
        throw new BadRequestException(`星数不足，需要 ${condition.requiredStars} 颗星`);
      }
    }
  }

  private async consumeStamina(playerId: string, amount: number): Promise<void> {
    // TODO: 调用玩家服务扣除体力
    // - 需要先获取玩家当前体力
    // - 验证体力是否足够
    // - 扣除体力
    // - 记录货币流水
    console.log(`玩家 ${playerId} 消耗体力: ${amount}`);
  }

  private async updatePlayerStageProgress(playerId: string, stageId: string, isWin: boolean): Promise<void> {
    let playerStage = await this.getPlayerStage(playerId, stageId);

    if (!playerStage) {
      playerStage = this.playerStageRepository.create({
        playerId,
        stageId,
        stars: 0,
        isCleared: false,
        dailyChallenges: 0,
      });
    }

    playerStage.dailyChallenges += 1;

    if (isWin) {
      if (!playerStage.isCleared) {
        playerStage.isCleared = true;
        playerStage.clearedAt = new Date();
        playerStage.stars = 3;
      }
    }

    await this.playerStageRepository.save(playerStage);
  }

  async claimChapterReward(playerId: string, chapterId: string): Promise<any> {
    const chapter = await this.chapterTemplateRepository.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const player = await this.playerService.getPlayerInfo(playerId);
    if (player.level < chapter.requiredLevel) {
      throw new BadRequestException(`等级不足，需要 ${chapter.requiredLevel} 级`);
    }

    const allStagesCleared = await this.checkAllStagesCleared(playerId, chapter.stages);
    if (!allStagesCleared) {
      throw new BadRequestException('章节内关卡未全部通关');
    }

    const reward = chapter.chapterReward;

    // TODO: 发放章节奖励
    // - 金币
    // - 钻石
    // - 物品
    console.log(`玩家 ${playerId} 领取章节 ${chapterId} 奖励:`, reward);

    return {
      success: true,
      reward,
    };
  }

  private async checkAllStagesCleared(playerId: string, stageIds: string[]): Promise<boolean> {
    const playerStages = await this.playerStageRepository.find({
      where: stageIds.map(stageId => ({ playerId, stageId })),
    });

    const clearedStageIds = new Set(playerStages.filter(s => s.isCleared).map(s => s.stageId));

    return stageIds.every(id => clearedStageIds.has(id));
  }

  async dailyReset(playerId: string): Promise<void> {
    await this.playerStageRepository
      .createQueryBuilder()
      .update(PlayerStageEntity)
      .set({ dailyChallenges: 0 })
      .where('player_id = :playerId', { playerId })
      .execute();
  }
}
