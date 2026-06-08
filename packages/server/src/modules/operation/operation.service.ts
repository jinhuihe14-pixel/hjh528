import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLogType, OperationLog, ConfigHotUpdate } from '@game/shared';

import { OperationLogEntity } from './operation-log.entity';
import { ConfigEntity } from './config.entity';
import { GetOperationLogDto, CreateOperationLogDto, UpdateConfigDto, RollbackConfigDto } from './dto/operation.dto';
import { ActivityService } from '../activity/activity.service';
import { StageService } from '../stage/stage.service';
import { PlayerService } from '../player/player.service';

@Injectable()
export class OperationService {
  private readonly logger = new Logger(OperationService.name);

  private configCache: Map<string, ConfigEntity> = new Map();

  constructor(
    @InjectRepository(OperationLogEntity)
    private readonly operationLogRepository: Repository<OperationLogEntity>,
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    private readonly activityService: ActivityService,
    private readonly stageService: StageService,
    private readonly playerService: PlayerService,
  ) {}

  async getOperationLogs(dto: GetOperationLogDto): Promise<{ list: OperationLog[]; total: number }> {
    const {
      type,
      module: mod,
      operatorId,
      startDate,
      endDate,
      keyword,
      page = 1,
      pageSize = 20,
    } = dto;

    const queryBuilder = this.operationLogRepository.createQueryBuilder('log');

    if (type) {
      queryBuilder.andWhere('log.type = :type', { type });
    }
    if (mod) {
      queryBuilder.andWhere('log.module = :module', { module: mod });
    }
    if (operatorId) {
      queryBuilder.andWhere('log.operator_id = :operatorId', { operatorId });
    }
    if (startDate) {
      queryBuilder.andWhere('log.created_at >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      queryBuilder.andWhere('log.created_at <= :endDate', { endDate: new Date(endDate) });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(log.action LIKE :keyword OR log.target_name LIKE :keyword OR log.remark LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder.orderBy('log.created_at', 'DESC');

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      list: logs as unknown as OperationLog[],
      total,
    };
  }

  async createOperationLog(
    operatorId: string,
    operatorName: string,
    dto: CreateOperationLogDto,
    ip?: string,
  ): Promise<OperationLog> {
    const log = this.operationLogRepository.create({
      operatorId,
      operatorName,
      type: dto.type,
      module: dto.module,
      action: dto.action,
      targetId: dto.targetId,
      targetName: dto.targetName,
      oldValue: dto.oldValue,
      newValue: dto.newValue,
      changes: dto.changes || [],
      ip,
      remark: dto.remark,
    });

    const saved = await this.operationLogRepository.save(log);

    this.logger.log(
      `Operation log: ${operatorName}(${operatorId}) - ${dto.module}/${dto.action} - ${dto.targetName || dto.targetId || ''}`,
    );

    return saved as unknown as OperationLog;
  }

  async getConfig(key: string): Promise<ConfigHotUpdate | null> {
    const cached = this.configCache.get(key);
    if (cached && cached.status === 'active') {
      return this.formatConfig(cached);
    }

    const config = await this.configRepository.findOne({
      where: { key, status: 'active' },
    });

    if (config) {
      this.configCache.set(key, config);
      return this.formatConfig(config);
    }

    return null;
  }

  async getConfigList(type?: string): Promise<ConfigHotUpdate[]> {
    const queryBuilder = this.configRepository.createQueryBuilder('config');

    if (type) {
      queryBuilder.andWhere('config.type = :type', { type });
    }

    queryBuilder.orderBy('config.updated_at', 'DESC');

    const configs = await queryBuilder.getMany();

    return configs.map(c => this.formatConfig(c));
  }

  async updateConfig(
    operatorId: string,
    operatorName: string,
    dto: UpdateConfigDto,
  ): Promise<ConfigHotUpdate> {
    let config = await this.configRepository.findOne({
      where: { key: dto.key },
    });

    const oldValue = config?.value;
    const oldVersion = config?.version || 0;

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    config.value = dto.value;
    config.version = oldVersion + 1;
    config.updatedBy = dto.updatedBy || operatorName;
    if (dto.description !== undefined) {
      config.description = dto.description;
    }

    const saved = await this.configRepository.save(config);

    this.configCache.set(dto.key, saved);

    await this.createOperationLog(
      operatorId,
      operatorName,
      {
        type: OperationLogType.CONFIG_UPDATE,
        module: 'config',
        action: 'update',
        targetId: dto.key,
        targetName: dto.description || saved.description,
        oldValue: oldValue ? { value: oldValue } : undefined,
        newValue: { value: dto.value },
        changes: ['value', 'version'],
      },
    );

    await this.triggerConfigRefresh(dto.key, saved.type);

    return this.formatConfig(saved);
  }

  private async triggerConfigRefresh(key: string, type: string): Promise<void> {
    try {
      switch (type) {
        case 'activity':
          await this.activityService.refreshActivityCache();
          break;
        case 'stage':
          await this.stageService.refreshStageCache();
          break;
        case 'system':
          await this.playerService.refreshGuideConfig();
          break;
        default:
          break;
      }

      this.logger.log(`Config refreshed: ${key}`);
    } catch (error) {
      this.logger.warn(`Failed to refresh config ${key}: ${error.message}`);
    }
  }

  async rollbackConfig(
    operatorId: string,
    operatorName: string,
    dto: RollbackConfigDto,
  ): Promise<ConfigHotUpdate> {
    const config = await this.configRepository.findOne({
      where: { key: dto.key },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    if (dto.targetVersion >= config.version) {
      throw new BadRequestException('目标版本不能高于当前版本');
    }

    await this.createOperationLog(
      operatorId,
      operatorName,
      {
        type: OperationLogType.CONFIG_UPDATE,
        module: 'config',
        action: 'rollback',
        targetId: dto.key,
        targetName: config.description,
        oldValue: { version: config.version },
        newValue: { version: dto.targetVersion },
        changes: ['version rollback'],
      },
    );

    return this.formatConfig(config);
  }

  async refreshAllConfigCache(): Promise<void> {
    this.configCache.clear();

    const configs = await this.configRepository.find({
      where: { status: 'active' },
    });

    for (const config of configs) {
      this.configCache.set(config.key, config);
    }

    await this.activityService.refreshActivityCache();
    await this.stageService.refreshStageCache();
    await this.playerService.refreshGuideConfig();

    this.logger.log('All config cache refreshed');
  }

  private formatConfig(config: ConfigEntity): ConfigHotUpdate {
    return {
      key: config.key,
      value: config.value,
      type: config.type as any,
      description: config.description,
      version: config.version,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    };
  }
}
