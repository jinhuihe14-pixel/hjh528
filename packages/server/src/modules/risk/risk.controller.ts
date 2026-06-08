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

import { RiskService } from './risk.service';
import {
  GetRiskEventListDto,
  HandleRiskEventDto,
  BanPlayerDto,
  GetCurrencyLogsDto,
} from './dto/risk.dto';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('events')
  async getRiskEvents(@Query() dto: GetRiskEventListDto) {
    return this.riskService.getRiskEventList(dto);
  }

  @Post('events/:id/handle')
  @HttpCode(HttpStatus.OK)
  async handleRiskEvent(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: HandleRiskEventDto,
  ) {
    const handler = this.getAdminId(req);
    return this.riskService.handleRiskEvent(id, dto, handler);
  }

  @Post('player/:id/ban')
  @HttpCode(HttpStatus.OK)
  async banPlayer(@Param('id') id: string, @Body() dto: BanPlayerDto) {
    await this.riskService.banPlayer(id, dto);
    return { success: true };
  }

  @Post('player/:id/unban')
  @HttpCode(HttpStatus.OK)
  async unbanPlayer(@Param('id') id: string) {
    await this.riskService.unbanPlayer(id);
    return { success: true };
  }

  @Get('currency-logs')
  async getCurrencyLogs(@Query() dto: GetCurrencyLogsDto) {
    return this.riskService.getCurrencyLogs(dto);
  }

  private getAdminId(req: Request): string {
    const adminId = (req as any).admin?.id || (req as any).user?.id || 'system';
    return adminId;
  }
}
