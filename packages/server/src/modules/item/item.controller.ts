import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { ItemService } from './item.service';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { UseItemDto } from './dto/use-item.dto';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get('templates')
  async getTemplateList(@Query() dto: GetInventoryDto) {
    return this.itemService.getTemplateList(dto);
  }

  @Get('inventory')
  async getInventory(@Req() req: Request, @Query() dto: GetInventoryDto) {
    const playerId = this.getPlayerId(req);
    return this.itemService.getInventory(playerId, dto);
  }

  @Post('use')
  @HttpCode(HttpStatus.OK)
  async useItem(@Req() req: Request, @Body() dto: UseItemDto) {
    const playerId = this.getPlayerId(req);
    return this.itemService.useItem(playerId, dto);
  }

  private getPlayerId(req: Request): string {
    const playerId = (req as any).player?.id || (req as any).user?.id;
    if (!playerId) {
      throw new Error('用户未登录');
    }
    return playerId;
  }
}
