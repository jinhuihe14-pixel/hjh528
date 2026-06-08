import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { PlayerService } from './player.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }
}
