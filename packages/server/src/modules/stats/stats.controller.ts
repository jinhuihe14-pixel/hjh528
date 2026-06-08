import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';

import { StatsService } from './stats.service';
import { GetItemConsumptionStatsDto, GetDifficultyStatsDto, GetDailyStatsDto } from './dto/stats.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getStatsOverview() {
    return this.statsService.getStatsOverview();
  }

  @Get('item-consumption')
  async getItemConsumptionStats(@Query() dto: GetItemConsumptionStatsDto) {
    return this.statsService.getItemConsumptionStats(dto);
  }

  @Get('stage-difficulty')
  async getStageDifficultyStats(@Query() dto: GetDifficultyStatsDto) {
    return this.statsService.getStageDifficultyStats(dto);
  }

  @Get('daily')
  async getDailyStats(@Query() dto: GetDailyStatsDto) {
    return this.statsService.getDailyStats(dto);
  }
}
