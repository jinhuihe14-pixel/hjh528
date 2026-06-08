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

import { StageService } from './stage.service';
import { GetStageListDto, ChallengeStageDto, ClaimChapterRewardDto } from './dto/stage.dto';

@Controller('stages')
export class StageController {
  constructor(private readonly stageService: StageService) {}

  @Get('chapters')
  async getChapterList() {
    return this.stageService.getChapterList();
  }

  @Get()
  async getStageList(@Query() dto: GetStageListDto) {
    return this.stageService.getStageList(dto);
  }

  @Get(':id')
  async getStageDetail(@Param('id') id: string) {
    return this.stageService.getStageDetail(id);
  }

  @Get('progress')
  async getPlayerProgress(@Req() req: Request) {
    const playerId = this.getPlayerId(req);
    return this.stageService.getPlayerProgress(playerId);
  }

  @Post('challenge')
  @HttpCode(HttpStatus.OK)
  async challengeStage(@Req() req: Request, @Body() dto: ChallengeStageDto) {
    const playerId = this.getPlayerId(req);
    return this.stageService.challengeStage(playerId, dto);
  }

  @Post('chapter/reward')
  @HttpCode(HttpStatus.OK)
  async claimChapterReward(@Req() req: Request, @Body() dto: ClaimChapterRewardDto) {
    const playerId = this.getPlayerId(req);
    return this.stageService.claimChapterReward(playerId, dto.chapterId);
  }

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }
}
