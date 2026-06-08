import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StageType, StageDifficulty, StageTemplate, ChapterTemplate, StageDifficultyGroup, StageFeedback, StageDifficultyStats } from '@game/shared';

import { StageTemplateEntity } from './stage-template.entity';
import { ChapterTemplateEntity } from './chapter-template.entity';
import { PlayerStageEntity } from './player-stage.entity';
import { GetStageListDto, ChallengeStageDto, GetStageFeedbackDto } from './dto/stage.dto';
import { PlayerService } from '../player/player.service';
import { BattleService } from '../battle/battle.service';
import { BattleLogEntity, BattleType } from '../battle/battle-log.entity';

@Injectable()
export class StageService {
  private readonly logger = new Logger(StageService.name);

  constructor(
    @InjectRepository(StageTemplateEntity)
    private readonly stageTemplateRepository: Repository<StageTemplateEntity>,
    @InjectRepository(ChapterTemplateEntity)
    private readonly chapterTemplateRepository: Repository<ChapterTemplateEntity>,
    @InjectRepository(PlayerStageEntity)
    private readonly playerStageRepository: Repository<PlayerStageEntity>,
    @InjectRepository(BattleLogEntity)
    private readonly battleLogRepository: Repository<BattleLogEntity>,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => BattleService))
    private readonly battleService: BattleService,
  ) {}

  async getChapterList(playerId?: string): Promise<ChapterTemplate[]> {
    const chapters = await this.chapterTemplateRepository.find({
      order: { sort: 'ASC' },
    });

    if (playerId) {
      const playerProgress = await this.getPlayerProgress(playerId);
      const player = await this.playerService.getPlayerInfo(playerId);

      return chapters.map(chapter => {
        const chapterStages = chapter.stages || [];
        const clearedStages = chapterStages.filter(stageId =>
          playerProgress.stages.some(s => s.stageId === stageId && s.isCleared)
        ).length;
        const totalStars = chapterStages.length * 3;
        const earnedStars = chapterStages.reduce((sum, stageId) => {
          const ps = playerProgress.stages.find(s => s.stageId === stageId);
          return sum + (ps?.stars || 0);
        }, 0);

        return {
          ...(chapter as unknown as ChapterTemplate),
          unlocked: player.level >= chapter.requiredLevel,
          totalStages: chapterStages.length,
          clearedStages,
          totalStars,
          earnedStars,
          rewardClaimed: false,
        };
      });
    }

    return chapters as unknown as ChapterTemplate[];
  }

  async getStageList(dto: GetStageListDto): Promise<{ list: StageTemplate[]; total: number }> {
    const { chapterId, type, difficulty, difficultyGroup, page = 1, pageSize = 20 } = dto;

    const queryBuilder = this.stageTemplateRepository.createQueryBuilder('stage');

    if (chapterId) {
      queryBuilder.andWhere('stage.chapter_id = :chapterId', { chapterId });
    }
    if (type) {
      queryBuilder.andWhere('stage.type = :type', { type });
    }
    if (difficulty) {
      queryBuilder.andWhere('stage.difficulty = :difficulty', { difficulty });
    }
    if (difficultyGroup) {
      queryBuilder
        .leftJoin(ChapterTemplateEntity, 'chapter', 'stage.chapter_id = chapter.id')
        .andWhere('chapter.difficulty_group = :difficultyGroup', { difficultyGroup });
    }

    queryBuilder.orderBy('stage.sort', 'ASC');

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [stages, total] = await queryBuilder.getManyAndCount();

    return {
      list: stages as unknown as StageTemplate[],
      total,
    };
  }

  async getStagesByDifficultyGroup(chapterId: string): Promise<StageDifficultyGroup[]> {
    const stages = await this.stageTemplateRepository.find({
      where: { chapterId },
      order: { sort: 'ASC' },
    });

    const difficultyOrder = [
      StageDifficulty.EASY,
      StageDifficulty.NORMAL,
      StageDifficulty.HARD,
      StageDifficulty.CHALLENGE,
    ];

    const difficultyLabels: Record<StageDifficulty, string> = {
      [StageDifficulty.EASY]: '简单',
      [StageDifficulty.NORMAL]: '普通',
      [StageDifficulty.HARD]: '困难',
      [StageDifficulty.CHALLENGE]: '挑战',
    };

    const groups: StageDifficultyGroup[] = difficultyOrder.map(difficulty => ({
      difficulty,
      label: difficultyLabels[difficulty],
      stages: stages
        .filter(s => s.difficulty === difficulty)
        .map(s => s as unknown as StageTemplate),
    }));

    return groups.filter(g => g.stages.length > 0);
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

  async getStageFeedback(dto: GetStageFeedbackDto): Promise<StageFeedback[]> {
    const { chapterId, difficulty, startDate, endDate } = dto;

    let stageQueryBuilder = this.stageTemplateRepository.createQueryBuilder('stage');

    if (chapterId) {
      stageQueryBuilder.andWhere('stage.chapter_id = :chapterId', { chapterId });
    }
    if (difficulty) {
      stageQueryBuilder.andWhere('stage.difficulty = :difficulty', { difficulty });
    }

    const stages = await stageQueryBuilder.getMany();

    const feedbackList: StageFeedback[] = [];

    for (const stage of stages) {
      let battleQuery = this.battleLogRepository.createQueryBuilder('battle')
        .where('battle.stage_id = :stageId', { stageId: stage.id })
        .andWhere('battle.battle_type = :battleType', { battleType: BattleType.STAGE });

      if (startDate) {
        battleQuery.andWhere('battle.created_at >= :startDate', { startDate: new Date(startDate) });
      }
      if (endDate) {
        battleQuery.andWhere('battle.created_at <= :endDate', { endDate: new Date(endDate) });
      }

      const battleLogs = await battleQuery.getMany();
      const totalChallenges = battleLogs.length;
      const winCount = battleLogs.filter(b => b.result === 'win').length;
      const winRate = totalChallenges > 0 ? winCount / totalChallenges : 0;

      const playerStages = await this.playerStageRepository.find({
        where: { stageId: stage.id },
      });
      const avgStars = playerStages.length > 0
        ? playerStages.reduce((sum, ps) => sum + ps.stars, 0) / playerStages.length
        : 0;

      feedbackList.push({
        stageId: stage.id,
        difficulty: stage.difficulty,
        totalChallenges,
        winCount,
        winRate: Number(winRate.toFixed(4)),
        avgStars: Number(avgStars.toFixed(2)),
        avgCompletionTime: 0,
      });
    }

    return feedbackList;
  }

  async getDifficultyStats(dto: GetStageFeedbackDto): Promise<StageDifficultyStats[]> {
    const feedbackList = await this.getStageFeedback(dto);

    const difficultyGroups: Record<string, StageFeedback[]> = {};

    for (const feedback of feedbackList) {
      if (!difficultyGroups[feedback.difficulty]) {
        difficultyGroups[feedback.difficulty] = [];
      }
      difficultyGroups[feedback.difficulty].push(feedback);
    }

    const stats: StageDifficultyStats[] = [];
    const difficultyOrder = [StageDifficulty.EASY, StageDifficulty.NORMAL, StageDifficulty.HARD, StageDifficulty.CHALLENGE];

    for (const difficulty of difficultyOrder) {
      const group = difficultyGroups[difficulty];
      if (!group || group.length === 0) continue;

      const totalStages = group.length;
      const totalChallenges = group.reduce((sum, f) => sum + f.totalChallenges, 0);
      const avgWinRate = group.reduce((sum, f) => sum + f.winRate, 0) / totalStages;

      const uniquePlayerIds = new Set<string>();
      for (const feedback of group) {
        const playerStages = await this.playerStageRepository.find({
          where: { stageId: feedback.stageId },
        });
        playerStages.forEach(ps => uniquePlayerIds.add(ps.playerId));
      }

      stats.push({
        difficulty,
        totalStages,
        totalChallenges,
        avgWinRate: Number(avgWinRate.toFixed(4)),
        playerDistribution: uniquePlayerIds.size,
      });
    }

    return stats;
  }

  async refreshStageCache(): Promise<void> {
    this.logger.log('Stage cache refreshed');
  }
}
