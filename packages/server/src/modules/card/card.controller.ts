import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { CardService } from './card.service';
import { GetCardListDto } from './dto/get-card-list.dto';
import { UpgradeCardDto } from './dto/upgrade-card.dto';
import { BreakthroughCardDto } from './dto/breakthrough-card.dto';
import { SetLineupDto } from './dto/set-lineup.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('templates')
  async getTemplateList(@Query() dto: GetCardListDto) {
    return this.cardService.getTemplateList(dto);
  }

  @Get('templates/:id')
  async getTemplateDetail(@Param('id') id: string) {
    return this.cardService.getTemplateDetail(id);
  }

  @Get()
  async getPlayerCardList(@Req() req: Request, @Query() dto: GetCardListDto) {
    const playerId = this.getPlayerId(req);
    return this.cardService.getPlayerCardList(playerId, dto);
  }

  @Get(':id')
  async getPlayerCardDetail(@Req() req: Request, @Param('id') id: string) {
    const playerId = this.getPlayerId(req);
    return this.cardService.getPlayerCardDetail(playerId, id);
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  async upgradeCard(@Req() req: Request, @Body() dto: UpgradeCardDto) {
    const playerId = this.getPlayerId(req);
    return this.cardService.upgradeCard(playerId, dto);
  }

  @Post('breakthrough')
  @HttpCode(HttpStatus.OK)
  async breakthroughCard(@Req() req: Request, @Body() dto: BreakthroughCardDto) {
    const playerId = this.getPlayerId(req);
    return this.cardService.breakthroughCard(playerId, dto);
  }

  @Get('lineup')
  async getLineup(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.cardService.getLineup(playerId);
  }

  @Post('lineup')
  @HttpCode(HttpStatus.OK)
  async setLineup(@Req() req: Request, @Body() dto: SetLineupDto) {
    const playerId = this.getPlayerId(req);
    return this.cardService.setLineup(playerId, dto);
  }

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }
}
