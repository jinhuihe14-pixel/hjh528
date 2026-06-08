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
import { GetStageListDto, ChallengeStageDto, ClaimChapterRewardDto, GetStageFeedbackDto } from './dto/stage.dto';

@Controller('stages')
export class StageController {
  constructor(private readonly stageService: StageService) {}

  @Get('chapters')
  async getChapterList(@Req() req: Request) {
    const playerId = this.getPlayerIdOptional(req);
    return this.stageService.getChapterList(playerId);
  }

  @Get()
  async getStageList(@Query() dto: GetStageListDto) {
    return this.stageService.getStageList(dto);
  }

  @Get('difficulty-groups/:chapterId')
  async getStagesByDifficultyGroup(@Param('chapterId') chapterId: string) {
    return this.stageService.getStagesByDifficultyGroup(chapterId);
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

  @Get('stats/feedback')
  async getStageFeedback(@Query() dto: GetStageFeedbackDto) {
    return this.stageService.getStageFeedback(dto);
  }

  @Get('stats/difficulty')
  async getDifficultyStats(@Query() dto: GetStageFeedbackDto) {
    return this.stageService.getDifficultyStats(dto);
  }

  @Post('refresh-cache')
  @HttpCode(HttpStatus.OK)
  async refreshCache() {
    await this.stageService.refreshStageCache();
    return { success: true };
  }

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }

  private getPlayerIdOptional(req: Request): string | undefined {
    return (req as any).player?.id || (req as any).user?.id;
  }
}
