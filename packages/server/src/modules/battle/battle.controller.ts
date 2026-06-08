import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { BattleService } from './battle.service';
import { StartBattleDto } from './dto/start-battle.dto';
import { StageBattleDto } from './dto/stage-battle.dto';

@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startBattle(@Req() req: Request, @Body() dto: StartBattleDto) {
    const playerId = this.getPlayerId(req);
    return this.battleService.startBattle(playerId, dto);
  }

  @Post('stage')
  @HttpCode(HttpStatus.OK)
  async stageBattle(@Req() req: Request, @Body() dto: StageBattleDto) {
    const playerId = this.getPlayerId(req);
    return this.battleService.startStageBattle(playerId, dto);
  }

  @Get(':id')
  async getBattleResult(@Param('id') id: string) {
    return this.battleService.getBattleResult(id);
  }

  @Get()
  async getBattleLogs(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.battleService.getBattleLogs(playerId);
  }

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }
}
