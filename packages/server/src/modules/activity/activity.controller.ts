import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { ActivityService } from './activity.service';
import { GetActivityListDto, ClaimActivityRewardDto, RefreshActivityCacheDto } from './dto/activity.dto';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getActivityList(@Req() req: Request, @Query() dto: GetActivityListDto) {
    const playerId = this.getPlayerId(req);
    return this.activityService.getActivityList(playerId, dto);
  }

  @Get(':id')
  async getActivityDetail(@Req() req: Request, @Param('id') id: string) {
    const playerId = this.getPlayerId(req);
    return this.activityService.getActivityDetail(playerId, id);
  }

  @Get('progress/:activityId')
  async getActivityProgress(@Req() req: Request, @Param('activityId') activityId: string) {
    const playerId = this.getPlayerId(req);
    return this.activityService.getPlayerActivityProgress(playerId, activityId);
  }

  @Post('reward')
  @HttpCode(HttpStatus.OK)
  async claimActivityReward(@Req() req: Request, @Body() dto: ClaimActivityRewardDto) {
    const playerId = this.getPlayerId(req);
    return this.activityService.claimActivityReward(playerId, dto);
  }

  @Post('refresh-cache')
  @HttpCode(HttpStatus.OK)
  async refreshActivityCache(@Body() dto: RefreshActivityCacheDto) {
    await this.activityService.refreshActivityCache(dto.activityId);
    return { success: true };
  }

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }
}
