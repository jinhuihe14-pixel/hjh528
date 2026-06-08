import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { RiskEventEntity } from './risk-event.entity';
import { CurrencyLogEntity } from './currency-log.entity';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiskEventEntity, CurrencyLogEntity]),
    forwardRef(() => PlayerModule),
  ],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
