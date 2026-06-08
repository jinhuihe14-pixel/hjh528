import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  ItemConsumptionStats,
  StageDifficultyStats,
  StatsOverview,
  DailyStats,
  StageDifficulty,
  ItemType,
  BattleResult,
} from '@game/shared';

import { ItemConsumptionLogEntity } from './item-consumption-log.entity';
import { StageTemplateEntity } from '../stage/stage-template.entity';
import { PlayerStageEntity } from '../stage/player-stage.entity';
import { BattleLogEntity, BattleType } from '../battle/battle-log.entity';
import { PlayerEntity } from '../player/player.entity';
import { GetItemConsumptionStatsDto, GetDifficultyStatsDto, GetDailyStatsDto } from './dto/stats.dto';
import { StageService } from '../stage/stage.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(ItemConsumptionLogEntity)
    private readonly consumptionLogRepository: Repository<ItemConsumptionLogEntity>,
    @InjectRepository(StageTemplateEntity)
    private readonly stageTemplateRepository: Repository<StageTemplateEntity>,
    @InjectRepository(PlayerStageEntity)
    private readonly playerStageRepository: Repository<PlayerStageEntity>,
    @InjectRepository(BattleLogEntity)
    private readonly battleLogRepository: Repository<BattleLogEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @Inject(forwardRef(() => StageService))
    private readonly stageService: StageService,
  ) {}

  async getItemConsumptionStats(dto: GetItemConsumptionStatsDto): Promise<{
    list: ItemConsumptionStats[];
    total: number;
  }> {
    const { startDate, endDate, itemType, source, page = 1, pageSize = 20 } = dto;

    const queryBuilder = this.consumptionLogRepository.createQueryBuilder('log')
      .select([
        'log.template_id as templateId',
        'log.item_name as itemName',
        'log.item_type as itemType',
        'SUM(log.count) as totalConsumed',
        'COUNT(DISTINCT log.player_id) as uniquePlayers',
        'ROUND(SUM(log.count) * 1.0 / COUNT(DISTINCT log.player_id), 2) as avgPerPlayer',
      ]);

    if (startDate) {
      queryBuilder.andWhere('log.created_at >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      queryBuilder.andWhere('log.created_at <= :endDate', { endDate: new Date(endDate) });
    }
    if (itemType) {
      queryBuilder.andWhere('log.item_type = :itemType', { itemType });
    }
    if (source) {
      queryBuilder.andWhere('log.source = :source', { source });
    }

    queryBuilder
      .groupBy('log.template_id')
      .addGroupBy('log.item_name')
      .addGroupBy('log.item_type')
      .orderBy('totalConsumed', 'DESC');

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const rawResult = await queryBuilder.getRawMany();

    const list: ItemConsumptionStats[] = rawResult.map((row, index) => ({
      templateId: row.templateId,
      itemName: row.itemName,
      itemType: row.itemType,
      totalConsumed: Number(row.totalConsumed),
      uniquePlayers: Number(row.uniquePlayers),
      avgPerPlayer: Number(row.avgPerPlayer),
      rank: skip + index + 1,
    }));

    const countQuery = this.consumptionLogRepository.createQueryBuilder('log')
      .select('COUNT(DISTINCT log.template_id)', 'count');

    if (startDate) {
      countQuery.andWhere('log.created_at >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      countQuery.andWhere('log.created_at <= :endDate', { endDate: new Date(endDate) });
    }
    if (itemType) {
      countQuery.andWhere('log.item_type = :itemType', { itemType });
    }
    if (source) {
      countQuery.andWhere('log.source = :source', { source });
    }

    const countResult = await countQuery.getRawOne();
    const total = Number(countResult?.count || 0);

    return { list, total };
  }

  async getStageDifficultyStats(dto: GetDifficultyStatsDto): Promise<StageDifficultyStats[]> {
    const { chapterId, difficulty, startDate, endDate } = dto;

    let stageQuery = this.stageTemplateRepository.createQueryBuilder('stage');

    if (chapterId) {
      stageQuery.andWhere('stage.chapter_id = :chapterId', { chapterId });
    }
    if (difficulty) {
      stageQuery.andWhere('stage.difficulty = :difficulty', { difficulty });
    }

    const stages = await stageQuery.getMany();

    const difficultyGroups: Record<string, StageTemplateEntity[]> = {};
    for (const stage of stages) {
      if (!difficultyGroups[stage.difficulty]) {
        difficultyGroups[stage.difficulty] = [];
      }
      difficultyGroups[stage.difficulty].push(stage);
    }

    const stats: StageDifficultyStats[] = [];
    const difficultyOrder = [
      StageDifficulty.EASY,
      StageDifficulty.NORMAL,
      StageDifficulty.HARD,
      StageDifficulty.CHALLENGE,
    ];

    for (const diff of difficultyOrder) {
      const diffStages = difficultyGroups[diff];
      if (!diffStages || diffStages.length === 0) continue;

      const stageIds = diffStages.map(s => s.id);

      let battleQuery = this.battleLogRepository.createQueryBuilder('battle')
        .where('battle.battle_type = :battleType', { battleType: BattleType.STAGE })
        .andWhere('battle.stage_id IN (:...stageIds)', { stageIds });

      if (startDate) {
        battleQuery.andWhere('battle.created_at >= :startDate', { startDate: new Date(startDate) });
      }
      if (endDate) {
        battleQuery.andWhere('battle.created_at <= :endDate', { endDate: new Date(endDate) });
      }

      const battles = await battleQuery.getMany();
      const totalChallenges = battles.length;
      const winCount = battles.filter(b => b.result === BattleResult.WIN).length;
      const avgWinRate = totalChallenges > 0 ? winCount / totalChallenges : 0;

      const playerStages = await this.playerStageRepository
        .createQueryBuilder('ps')
        .where('ps.stage_id IN (:...stageIds)', { stageIds })
        .getMany();

      const uniquePlayerIds = new Set(playerStages.map(ps => ps.playerId));

      stats.push({
        difficulty: diff,
        totalStages: diffStages.length,
        totalChallenges,
        avgWinRate: Number(avgWinRate.toFixed(4)),
        playerDistribution: uniquePlayerIds.size,
      });
    }

    return stats;
  }

  async getStatsOverview(): Promise<StatsOverview> {
    const totalPlayers = await this.playerRepository.count();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayActivePlayers = await this.playerRepository
      .createQueryBuilder('player')
      .where('player.last_login_at >= :todayStart', { todayStart })
      .getCount();

    const totalStagesCleared = await this.playerStageRepository
      .createQueryBuilder('ps')
      .where('ps.is_cleared = :isCleared', { isCleared: true })
      .getCount();

    const totalBattles = await this.battleLogRepository.count();

    const winBattles = await this.battleLogRepository
      .createQueryBuilder('battle')
      .where('battle.result = :result', { result: BattleResult.WIN })
      .getCount();

    const winRate = totalBattles > 0 ? winBattles / totalBattles : 0;

    const avgLevelResult = await this.playerRepository
      .createQueryBuilder('player')
      .select('AVG(player.level)', 'avgLevel')
      .getRawOne();

    const avgLevel = Number(avgLevelResult?.avgLevel || 0);

    return {
      totalPlayers,
      dailyActivePlayers: todayActivePlayers,
      totalStagesCleared,
      totalBattles,
      winRate: Number(winRate.toFixed(4)),
      avgLevel: Number(avgLevel.toFixed(2)),
    };
  }

  async getDailyStats(dto: GetDailyStatsDto): Promise<DailyStats[]> {
    const { startDate, endDate } = dto;

    const results: DailyStats[] = [];

    let start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    while (start <= end) {
      const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const dayEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59);
      const dateStr = start.toISOString().split('T')[0];

      const newPlayers = await this.playerRepository
        .createQueryBuilder('player')
        .where('player.created_at >= :dayStart', { dayStart })
        .andWhere('player.created_at <= :dayEnd', { dayEnd })
        .getCount();

      const activePlayers = await this.playerRepository
        .createQueryBuilder('player')
        .where('player.last_login_at >= :dayStart', { dayStart })
        .andWhere('player.last_login_at <= :dayEnd', { dayEnd })
        .getCount();

      const dayBattles = await this.battleLogRepository
        .createQueryBuilder('battle')
        .where('battle.created_at >= :dayStart', { dayStart })
        .andWhere('battle.created_at <= :dayEnd', { dayEnd })
        .getCount();

      const dayClears = await this.playerStageRepository
        .createQueryBuilder('ps')
        .where('ps.cleared_at >= :dayStart', { dayStart })
        .andWhere('ps.cleared_at <= :dayEnd', { dayEnd })
        .getCount();

      const dayConsumptions = await this.consumptionLogRepository
        .createQueryBuilder('log')
        .where('log.created_at >= :dayStart', { dayStart })
        .andWhere('log.created_at <= :dayEnd', { dayEnd })
        .getCount();

      results.push({
        date: dateStr,
        newPlayers,
        activePlayers,
        totalBattles: dayBattles,
        totalStageClears: dayClears,
        totalItemConsumptions: dayConsumptions,
        totalGoldEarned: 0,
        totalDiamondEarned: 0,
      });

      start = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    }

    return results;
  }

  async recordItemConsumption(
    playerId: string,
    templateId: string,
    itemName: string,
    itemType: ItemType,
    count: number,
    source: string,
    bindType: string = 'bind',
  ): Promise<void> {
    try {
      const log = this.consumptionLogRepository.create({
        playerId,
        templateId,
        itemName,
        itemType,
        count,
        source,
        bindType,
      });
      await this.consumptionLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Failed to record item consumption: ${error.message}`);
    }
  }
}
