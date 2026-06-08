import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { OperationService } from './operation.service';
import { GetOperationLogDto, UpdateConfigDto, RollbackConfigDto } from './dto/operation.dto';

@Controller('operations')
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Get('logs')
  async getOperationLogs(@Query() dto: GetOperationLogDto) {
    return this.operationService.getOperationLogs(dto);
  }

  @Get('configs')
  async getConfigList(@Query('type') type?: string) {
    return this.operationService.getConfigList(type);
  }

  @Get('configs/:key')
  async getConfig(@Param('key') key: string) {
    return this.operationService.getConfig(key);
  }

  @Post('configs/update')
  @HttpCode(HttpStatus.OK)
  async updateConfig(@Req() req: Request, @Body() dto: UpdateConfigDto) {
    const operatorId = (req as any).admin?.id || 'system';
    const operatorName = (req as any).admin?.name || '系统管理员';
    return this.operationService.updateConfig(operatorId, operatorName, dto);
  }

  @Post('configs/rollback')
  @HttpCode(HttpStatus.OK)
  async rollbackConfig(@Req() req: Request, @Body() dto: RollbackConfigDto) {
    const operatorId = (req as any).admin?.id || 'system';
    const operatorName = (req as any).admin?.name || '系统管理员';
    return this.operationService.rollbackConfig(operatorId, operatorName, dto);
  }

  @Post('configs/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAllConfigCache() {
    await this.operationService.refreshAllConfigCache();
    return { success: true };
  }
}
