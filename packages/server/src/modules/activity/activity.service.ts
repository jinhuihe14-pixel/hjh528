import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { ActivityType, SignInReward, PlayerSignInData } from '@game/shared';

import { ActivityEntity } from './activity.entity';
import { PlayerActivityEntity } from './player-activity.entity';
import { PlayerSignInEntity } from './player-sign-in.entity';
import { GetActivityListDto, ClaimActivityRewardDto } from './dto/activity.dto';
import { SignInDto, MakeUpSignInDto, ClaimCumulativeRewardDto } from './dto/signin.dto';
import { PlayerService } from '../player/player.service';
import { ItemService } from '../item/item.service';
import { BindType } from '@game/shared';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  private activityCache: Map<string, ActivityEntity> = new Map();
  private activityListCache: ActivityEntity[] | null = null;
  private cacheExpireTime: number = 5 * 60 * 1000;
  private lastCacheUpdate: number = 0;

  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(PlayerActivityEntity)
    private readonly playerActivityRepository: Repository<PlayerActivityEntity>,
    @InjectRepository(PlayerSignInEntity)
    private readonly playerSignInRepository: Repository<PlayerSignInEntity>,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => ItemService))
    private readonly itemService: ItemService,
  ) {}

  async getActivityList(playerId: string, dto: GetActivityListDto): Promise<{ list: ActivityEntity[]; total: number }> {
    const { type } = dto;

    let activities = await this.getCachedActivityList();

    if (type) {
      activities = activities.filter(a => a.type === type);
    }

    const now = new Date();
    activities = activities.filter(
      a => a.status === 'active' && a.startTime <= now && a.endTime >= now,
    );

    const filteredActivities = [];
    for (const activity of activities) {
      if (await this.checkGrayRelease(playerId, activity)) {
        filteredActivities.push(activity);
      }
    }

    return {
      list: filteredActivities,
      total: filteredActivities.length,
    };
  }

  async getActivityDetail(playerId: string, activityId: string): Promise<ActivityEntity> {
    const activity = await this.getCachedActivity(activityId);

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    if (activity.status !== 'active') {
      throw new BadRequestException('活动未开启');
    }

    const now = new Date();
    if (activity.startTime > now || activity.endTime < now) {
      throw new BadRequestException('活动不在有效期内');
    }

    const isGrayReleased = await this.checkGrayRelease(playerId, activity);
    if (!isGrayReleased) {
      throw new BadRequestException('活动暂未开放');
    }

    return activity;
  }

  async getPlayerActivityProgress(playerId: string, activityId: string): Promise<PlayerActivityEntity> {
    await this.getActivityDetail(playerId, activityId);

    let playerActivity = await this.playerActivityRepository.findOne({
      where: { playerId, activityId },
    });

    if (!playerActivity) {
      playerActivity = this.playerActivityRepository.create({
        playerId,
        activityId,
        progressData: {},
        rewardsClaimed: {},
      });
      playerActivity = await this.playerActivityRepository.save(playerActivity);
    }

    return playerActivity;
  }

  async claimActivityReward(playerId: string, dto: ClaimActivityRewardDto): Promise<any> {
    const { activityId, rewardId } = dto;

    const activity = await this.getActivityDetail(playerId, activityId);
    const playerActivity = await this.getPlayerActivityProgress(playerId, activityId);

    if (playerActivity.rewardsClaimed[rewardId]) {
      throw new BadRequestException('该奖励已领取');
    }

    const rewardConfig = this.getRewardConfig(activity, rewardId);
    if (!rewardConfig) {
      throw new NotFoundException('奖励配置不存在');
    }

    const isRewardUnlocked = this.checkRewardUnlockCondition(
      playerActivity.progressData,
      rewardConfig,
    );
    if (!isRewardUnlocked) {
      throw new BadRequestException('奖励条件未达成');
    }

    playerActivity.rewardsClaimed[rewardId] = true;
    await this.playerActivityRepository.save(playerActivity);

    await this.distributeReward(playerId, rewardConfig);

    return {
      success: true,
      rewardId,
      reward: rewardConfig,
    };
  }

  async refreshActivityCache(activityId?: string): Promise<void> {
    if (activityId) {
      this.activityCache.delete(activityId);
    } else {
      this.activityCache.clear();
      this.activityListCache = null;
    }
    this.lastCacheUpdate = 0;
  }

  async checkGrayRelease(playerId: string, activity: ActivityEntity): Promise<boolean> {
    const grayConfig = activity.grayConfig;

    if (!grayConfig || !grayConfig.enabled) {
      return true;
    }

    const player = await this.playerService.getPlayerInfo(playerId);

    switch (grayConfig.mode) {
      case 'tail_number':
        const tailNum = parseInt(playerId.slice(-1), 10);
        return grayConfig.tailNumbers?.includes(tailNum) ?? false;

      case 'level':
        const level = player.level;
        const minLevel = grayConfig.minLevel ?? 0;
        const maxLevel = grayConfig.maxLevel ?? 9999;
        return level >= minLevel && level <= maxLevel;

      case 'server':
        return grayConfig.serverIds?.includes(player.serverId) ?? false;

      case 'whitelist':
        return grayConfig.whitelist?.includes(playerId) ?? false;

      default:
        return false;
    }
  }

  private async getCachedActivityList(): Promise<ActivityEntity[]> {
    const now = Date.now();

    if (this.activityListCache && now - this.lastCacheUpdate < this.cacheExpireTime) {
      return this.activityListCache;
    }

    const activities = await this.activityRepository.find({
      where: { status: 'active' },
      order: { sort: 'ASC' },
    });

    this.activityListCache = activities;
    this.lastCacheUpdate = now;

    for (const activity of activities) {
      this.activityCache.set(activity.id, activity);
    }

    return activities;
  }

  private async getCachedActivity(activityId: string): Promise<ActivityEntity | null> {
    let activity = this.activityCache.get(activityId);

    if (activity) {
      return activity;
    }

    activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });

    if (activity) {
      this.activityCache.set(activityId, activity);
    }

    return activity || null;
  }

  private getRewardConfig(activity: ActivityEntity, rewardId: string): any {
    const rewards = activity.config?.rewards || [];
    return rewards.find((r: any) => r.id === rewardId);
  }

  private checkRewardUnlockCondition(progressData: Record<string, any>, rewardConfig: any): boolean {
    const condition = rewardConfig.condition;

    if (!condition) {
      return true;
    }

    if (condition.type === 'points') {
      const points = progressData.points || 0;
      return points >= (condition.required || 0);
    }

    if (condition.type === 'task') {
      const completedTasks = progressData.completedTasks || [];
      return condition.taskIds?.every((id: string) => completedTasks.includes(id));
    }

    if (condition.type === 'days') {
      const signInDays = progressData.signInDays || 0;
      return signInDays >= (condition.days || 0);
    }

    return false;
  }

  private async distributeReward(playerId: string, rewardConfig: any): Promise<void> {
    try {
      if (rewardConfig.gold && rewardConfig.gold > 0) {
        this.logger.log(`Grant gold to player ${playerId}: ${rewardConfig.gold}`);
      }
      if (rewardConfig.diamond && rewardConfig.diamond > 0) {
        this.logger.log(`Grant diamond to player ${playerId}: ${rewardConfig.diamond}`);
      }
      if (rewardConfig.items && rewardConfig.items.length > 0) {
        for (const item of rewardConfig.items) {
          try {
            await this.itemService.addItem(
              playerId,
              item.templateId,
              item.count,
              BindType.BIND,
              'activity_reward',
            );
          } catch (error) {
            this.logger.warn(`Failed to grant item ${item.templateId}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to distribute reward: ${error.message}`);
    }
  }

  async getSignInStatus(playerId: string, activityId: string): Promise<PlayerSignInData & {
    todaySigned: boolean;
    canSignToday: boolean;
  }> {
    const activity = await this.getActivityDetail(playerId, activityId);

    if (activity.type !== ActivityType.SIGN_IN) {
      throw new BadRequestException('该活动不是签到活动');
    }

    let signInData = await this.playerSignInRepository.findOne({
      where: { playerId, activityId },
    });

    const today = dayjs().format('YYYY-MM-DD');
    const config = activity.config;

    if (!signInData) {
      signInData = this.playerSignInRepository.create({
        playerId,
        activityId,
        totalSignInDays: 0,
        continuousSignInDays: 0,
        lastSignInDate: '',
        signedDays: [],
        cumulativeRewardsClaimed: [],
        makeUpCount: 0,
        cycleStartDate: today,
      });
      signInData = await this.playerSignInRepository.save(signInData);
    }

    const todaySigned = signInData.lastSignInDate === today;
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const isContinuous = signInData.lastSignInDate === yesterday || signInData.lastSignInDate === '';

    const totalDays = config?.totalDays || config?.rewards?.length || 30;
    const currentDay = this.calculateCurrentDay(signInData.cycleStartDate, totalDays);

    return {
      playerId: signInData.playerId,
      activityId: signInData.activityId,
      totalSignInDays: signInData.totalSignInDays,
      continuousSignInDays: isContinuous ? signInData.continuousSignInDays : 0,
      lastSignInDate: signInData.lastSignInDate,
      signedDays: signInData.signedDays,
      cumulativeRewardsClaimed: signInData.cumulativeRewardsClaimed,
      makeUpCount: signInData.makeUpCount,
      cycleStartDate: signInData.cycleStartDate,
      todaySigned,
      canSignToday: !todaySigned,
    };
  }

  private calculateCurrentDay(cycleStartDate: string, totalDays: number): number {
    if (!cycleStartDate) return 1;

    const start = dayjs(cycleStartDate);
    const today = dayjs();
    const diffDays = today.diff(start, 'day') + 1;

    return Math.min(Math.max(diffDays, 1), totalDays);
  }

  async signIn(playerId: string, dto: SignInDto): Promise<{
    success: boolean;
    day: number;
    reward: SignInReward;
    isSpecial: boolean;
    newTotalDays: number;
    newContinuousDays: number;
  }> {
    const activity = await this.getActivityDetail(playerId, dto.activityId);

    if (activity.type !== ActivityType.SIGN_IN) {
      throw new BadRequestException('该活动不是签到活动');
    }

    const today = dayjs().format('YYYY-MM-DD');
    const config = activity.config;
    const totalDays = config?.totalDays || config?.rewards?.length || 30;

    let signInData = await this.playerSignInRepository.findOne({
      where: { playerId, activityId: dto.activityId },
    });

    if (!signInData) {
      signInData = this.playerSignInRepository.create({
        playerId,
        activityId: dto.activityId,
        totalSignInDays: 0,
        continuousSignInDays: 0,
        lastSignInDate: '',
        signedDays: [],
        cumulativeRewardsClaimed: [],
        makeUpCount: 0,
        cycleStartDate: today,
      });
    }

    if (signInData.lastSignInDate === today) {
      throw new BadRequestException('今日已签到');
    }

    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const isContinuous = signInData.lastSignInDate === yesterday || signInData.lastSignInDate === '';

    const currentDay = this.calculateCurrentDay(signInData.cycleStartDate, totalDays);

    signInData.totalSignInDays += 1;
    signInData.continuousSignInDays = isContinuous ? signInData.continuousSignInDays + 1 : 1;
    signInData.lastSignInDate = today;

    if (!signInData.signedDays.includes(currentDay)) {
      signInData.signedDays.push(currentDay);
    }

    await this.playerSignInRepository.save(signInData);

    const dailyReward = this.getDailyReward(config, currentDay);
    const isSpecial = config?.specialDays?.includes(currentDay) || false;

    await this.distributeReward(playerId, dailyReward);

    return {
      success: true,
      day: currentDay,
      reward: dailyReward,
      isSpecial,
      newTotalDays: signInData.totalSignInDays,
      newContinuousDays: signInData.continuousSignInDays,
    };
  }

  private getDailyReward(config: any, day: number): SignInReward {
    const rewards = config?.rewards || [];
    const reward = rewards.find((r: any) => r.day === day);

    if (!reward) {
      return { gold: 1000 };
    }

    return {
      gold: reward.value || reward.gold || 0,
      diamond: reward.diamond || 0,
      items: reward.templateId ? [{ templateId: reward.templateId, count: reward.count || 1 }] : reward.items || [],
    };
  }

  async makeUpSignIn(playerId: string, dto: MakeUpSignInDto): Promise<any> {
    const activity = await this.getActivityDetail(playerId, dto.activityId);

    if (activity.type !== ActivityType.SIGN_IN) {
      throw new BadRequestException('该活动不是签到活动');
    }

    const config = activity.config;
    if (!config?.makeUpEnabled) {
      throw new BadRequestException('补签功能未开启');
    }

    let signInData = await this.playerSignInRepository.findOne({
      where: { playerId, activityId: dto.activityId },
    });

    if (!signInData) {
      throw new NotFoundException('签到数据不存在');
    }

    if (signInData.signedDays.includes(dto.day)) {
      throw new BadRequestException('该天已签到');
    }

    const today = dayjs().format('YYYY-MM-DD');
    const totalDays = config?.totalDays || config?.rewards?.length || 30;
    const currentDay = this.calculateCurrentDay(signInData.cycleStartDate, totalDays);

    if (dto.day >= currentDay) {
      throw new BadRequestException('不能补签未来的日期');
    }

    if (dto.day < 1 || dto.day > totalDays) {
      throw new BadRequestException('无效的签到天数');
    }

    if (config.makeUpCost) {
      this.logger.log(`Player ${playerId} spends ${JSON.stringify(config.makeUpCost)} for makeup sign-in`);
    }

    signInData.signedDays.push(dto.day);
    signInData.totalSignInDays += 1;
    signInData.makeUpCount += 1;

    await this.playerSignInRepository.save(signInData);

    const dailyReward = this.getDailyReward(config, dto.day);
    await this.distributeReward(playerId, dailyReward);

    return {
      success: true,
      day: dto.day,
      reward: dailyReward,
      newTotalDays: signInData.totalSignInDays,
    };
  }

  async claimCumulativeReward(playerId: string, dto: ClaimCumulativeRewardDto): Promise<any> {
    const activity = await this.getActivityDetail(playerId, dto.activityId);

    if (activity.type !== ActivityType.SIGN_IN) {
      throw new BadRequestException('该活动不是签到活动');
    }

    const config = activity.config;
    const cumulativeRewards = config?.cumulativeRewards || [];

    const rewardConfig = cumulativeRewards.find((r: any) => r.id === dto.rewardId);
    if (!rewardConfig) {
      throw new NotFoundException('累计奖励不存在');
    }

    let signInData = await this.playerSignInRepository.findOne({
      where: { playerId, activityId: dto.activityId },
    });

    if (!signInData) {
      throw new NotFoundException('签到数据不存在');
    }

    if (signInData.cumulativeRewardsClaimed.includes(dto.rewardId)) {
      throw new BadRequestException('该奖励已领取');
    }

    const signedDaysCount = signInData.signedDays.length;
    if (signedDaysCount < rewardConfig.days) {
      throw new BadRequestException(`签到天数不足，需要 ${rewardConfig.days} 天`);
    }

    signInData.cumulativeRewardsClaimed.push(dto.rewardId);
    await this.playerSignInRepository.save(signInData);

    const reward = {
      gold: rewardConfig.reward?.gold || 0,
      diamond: rewardConfig.reward?.diamond || 0,
      items: rewardConfig.reward?.items || [],
    };

    await this.distributeReward(playerId, reward);

    return {
      success: true,
      rewardId: dto.rewardId,
      reward,
    };
  }

  async getCumulativeRewards(playerId: string, activityId: string): Promise<any[]> {
    const activity = await this.getActivityDetail(playerId, activityId);

    if (activity.type !== ActivityType.SIGN_IN) {
      throw new BadRequestException('该活动不是签到活动');
    }

    const config = activity.config;
    const cumulativeRewards = config?.cumulativeRewards || [];

    let signInData = await this.playerSignInRepository.findOne({
      where: { playerId, activityId },
    });

    if (!signInData) {
      return cumulativeRewards.map((r: any) => ({
        ...r,
        canClaim: false,
        claimed: false,
      }));
    }

    const signedDaysCount = signInData.signedDays.length;

    return cumulativeRewards.map((r: any) => ({
      ...r,
      canClaim: signedDaysCount >= r.days && !signInData!.cumulativeRewardsClaimed.includes(r.id),
      claimed: signInData!.cumulativeRewardsClaimed.includes(r.id),
    }));
  }
}
