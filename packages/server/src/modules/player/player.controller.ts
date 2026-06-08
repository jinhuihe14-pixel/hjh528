import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { PlayerService } from './player.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNewbieGuideDto, ClaimGuideRewardDto, ClaimStageWelfareDto } from './dto/guide.dto';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('info')
  async getPlayerInfo(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.playerService.getPlayerInfo(playerId);
  }

  @Get('resources')
  async getPlayerResources(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.playerService.getPlayerResources(playerId);
  }

  @Put('profile')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const playerId = this.getPlayerId(req);
    return this.playerService.updatePlayerProfile(playerId, dto);
  }

  @Get('guide/config')
  async getNewbieGuideConfig() {
    return this.playerService.getNewbieGuideConfig();
  }

  @Get('guide/progress')
  async getPlayerNewbieGuide(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.playerService.getPlayerNewbieGuide(playerId);
  }

  @Post('guide/progress')
  @HttpCode(HttpStatus.OK)
  async updateNewbieGuideProgress(@Req() req: Request, @Body() dto: UpdateNewbieGuideDto) {
    const playerId = this.getPlayerId(req);
    return this.playerService.updateNewbieGuideProgress(playerId, dto);
  }

  @Post('guide/reward')
  @HttpCode(HttpStatus.OK)
  async claimGuideReward(@Req() req: Request, @Body() dto: ClaimGuideRewardDto) {
    const playerId = this.getPlayerId(req);
    return this.playerService.claimGuideReward(playerId, dto);
  }

  @Get('welfare/config')
  async getStageWelfareConfig() {
    return this.playerService.getStageWelfareConfig();
  }

  @Get('welfare')
  async getPlayerStageWelfare(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.playerService.getPlayerStageWelfare(playerId);
  }

  @Post('welfare/claim')
  @HttpCode(HttpStatus.OK)
  async claimStageWelfare(@Req() req: Request, @Body() dto: ClaimStageWelfareDto) {
    const playerId = this.getPlayerId(req);
    return this.playerService.claimStageWelfare(playerId, dto);
  }

  @Post('refresh-guide-config')
  @HttpCode(HttpStatus.OK)
  async refreshGuideConfig() {
    await this.playerService.refreshGuideConfig();
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
