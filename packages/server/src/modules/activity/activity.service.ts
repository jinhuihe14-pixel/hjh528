import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityType } from '@game/shared';

import { ActivityEntity } from './activity.entity';
import { PlayerActivityEntity } from './player-activity.entity';
import { GetActivityListDto, ClaimActivityRewardDto } from './dto/activity.dto';
import { PlayerService } from '../player/player.service';

@Injectable()
export class ActivityService {
  private activityCache: Map<string, ActivityEntity> = new Map();
  private activityListCache: ActivityEntity[] | null = null;
  private cacheExpireTime: number = 5 * 60 * 1000;
  private lastCacheUpdate: number = 0;

  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(PlayerActivityEntity)
    private readonly playerActivityRepository: Repository<PlayerActivityEntity>,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
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
    // TODO: 发放活动奖励
    // - 金币
    // - 钻石
    // - 物品
    // - 卡牌
    console.log(`发放活动奖励给玩家 ${playerId}:`, rewardConfig);
  }
}
