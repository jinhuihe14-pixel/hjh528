import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RiskLevel, CurrencyType, BindType } from '@game/shared';

import { RiskEventEntity } from './risk-event.entity';
import { CurrencyLogEntity, CurrencyChangeType } from './currency-log.entity';
import {
  GetRiskEventListDto,
  HandleRiskEventDto,
  BanPlayerDto,
  GetCurrencyLogsDto,
} from './dto/risk.dto';
import { PlayerService } from '../player/player.service';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(RiskEventEntity)
    private readonly riskEventRepository: Repository<RiskEventEntity>,
    @InjectRepository(CurrencyLogEntity)
    private readonly currencyLogRepository: Repository<CurrencyLogEntity>,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
  ) {}

  async recordCurrencyLog(data: {
    playerId: string;
    currencyType: CurrencyType;
    bindType: BindType;
    changeType: CurrencyChangeType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    relatedId?: string;
    ip?: string;
    deviceId?: string;
  }): Promise<CurrencyLogEntity> {
    const log = this.currencyLogRepository.create(data);
    const savedLog = await this.currencyLogRepository.save(log);

    await this.detectAbnormalTransaction(savedLog);

    return savedLog;
  }

  async detectAbnormalTransaction(log: CurrencyLogEntity): Promise<void> {
    // TODO: 异常交易检测逻辑（预留扩展点）
    // - 单笔金额过大检测
    // - 短时间内频繁交易检测
    // - 与历史交易行为偏差检测
    // - 触发后创建风控事件

    if (log.amount > 1000000) {
      await this.createRiskEvent({
        playerId: log.playerId,
        eventType: 'large_transaction',
        riskLevel: RiskLevel.MEDIUM,
        description: `单笔交易金额过大: ${log.currencyType} ${log.amount}`,
        data: { logId: log.id, amount: log.amount },
      });
    }
  }

  async detectBatchResourceFarming(playerId: string): Promise<void> {
    // TODO: 批量刷资源检测（预留扩展点）
    // - 单位时间内资源获取速率检测
    // - 相同来源资源获取频率检测
    // - 多账号协同刷资源检测
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const logs = await this.currencyLogRepository.find({
      where: {
        playerId,
        changeType: CurrencyChangeType.ADD,
        createdAt: Between(oneHourAgo, new Date()),
      },
    });

    const totalAdd = logs.reduce((sum, log) => sum + Number(log.amount), 0);

    if (totalAdd > 10000000) {
      await this.createRiskEvent({
        playerId,
        eventType: 'batch_farming',
        riskLevel: RiskLevel.HIGH,
        description: `1小时内资源获取量异常: ${totalAdd}`,
        data: { totalAdd, logCount: logs.length },
      });
    }
  }

  async detectStudioAccountBehavior(playerId: string): Promise<void> {
    // TODO: 工作室账号行为检测（预留扩展点）
    // - 登录时间模式检测（24小时在线）
    // - 操作行为模式检测（程序化操作）
    // - IP/设备关联检测
    // - 资金流向关联检测
  }

  async createRiskEvent(data: {
    playerId: string;
    eventType: string;
    riskLevel: RiskLevel;
    description: string;
    data?: Record<string, any>;
  }): Promise<RiskEventEntity> {
    const event = this.riskEventRepository.create(data);
    return this.riskEventRepository.save(event);
  }

  async getRiskEventList(dto: GetRiskEventListDto): Promise<{ list: RiskEventEntity[]; total: number }> {
    const {
      playerId,
      eventType,
      riskLevel,
      isHandled,
      page = 1,
      pageSize = 20,
    } = dto;

    const queryBuilder = this.riskEventRepository.createQueryBuilder('event');

    if (playerId) {
      queryBuilder.andWhere('event.player_id = :playerId', { playerId });
    }
    if (eventType) {
      queryBuilder.andWhere('event.event_type = :eventType', { eventType });
    }
    if (riskLevel) {
      queryBuilder.andWhere('event.risk_level = :riskLevel', { riskLevel });
    }
    if (isHandled !== undefined) {
      queryBuilder.andWhere('event.is_handled = :isHandled', { isHandled });
    }

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy('event.created_at', 'DESC');

    const [events, total] = await queryBuilder.getManyAndCount();

    return {
      list: events,
      total,
    };
  }

  async handleRiskEvent(eventId: string, dto: HandleRiskEventDto, handler: string): Promise<RiskEventEntity> {
    const event = await this.riskEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('风控事件不存在');
    }

    if (event.isHandled) {
      throw new BadRequestException('该事件已处理');
    }

    event.isHandled = true;
    event.handledBy = handler;
    event.handleResult = dto.handleResult;
    event.handledAt = new Date();

    return this.riskEventRepository.save(event);
  }

  async banPlayer(playerId: string, dto: BanPlayerDto): Promise<void> {
    const player = await this.playerService.getPlayerInfo(playerId);

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    // TODO: 调用玩家服务封禁玩家
    // - 设置封禁状态
    // - 设置封禁原因
    // - 设置封禁结束时间
    console.log(`封禁玩家 ${playerId}:`, dto);
  }

  async unbanPlayer(playerId: string): Promise<void> {
    const player = await this.playerService.getPlayerInfo(playerId);

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    // TODO: 调用玩家服务解封玩家
    console.log(`解封玩家 ${playerId}`);
  }

  async getCurrencyLogs(dto: GetCurrencyLogsDto): Promise<{ list: CurrencyLogEntity[]; total: number }> {
    const {
      playerId,
      currencyType,
      bindType,
      changeType,
      reason,
      startTime,
      endTime,
      page = 1,
      pageSize = 20,
    } = dto;

    const queryBuilder = this.currencyLogRepository.createQueryBuilder('log');

    if (playerId) {
      queryBuilder.andWhere('log.player_id = :playerId', { playerId });
    }
    if (currencyType) {
      queryBuilder.andWhere('log.currency_type = :currencyType', { currencyType });
    }
    if (bindType) {
      queryBuilder.andWhere('log.bind_type = :bindType', { bindType });
    }
    if (changeType) {
      queryBuilder.andWhere('log.change_type = :changeType', { changeType });
    }
    if (reason) {
      queryBuilder.andWhere('log.reason LIKE :reason', { reason: `%${reason}%` });
    }
    if (startTime) {
      queryBuilder.andWhere('log.created_at >= :startTime', { startTime: new Date(startTime) });
    }
    if (endTime) {
      queryBuilder.andWhere('log.created_at <= :endTime', { endTime: new Date(endTime) });
    }

    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy('log.created_at', 'DESC');

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      list: logs,
      total,
    };
  }
}
