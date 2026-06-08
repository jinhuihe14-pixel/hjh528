import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerModule } from './modules/player/player.module';
import { CardModule } from './modules/card/card.module';
import { BattleModule } from './modules/battle/battle.module';
import { StageModule } from './modules/stage/stage.module';
import { ItemModule } from './modules/item/item.module';
import { ActivityModule } from './modules/activity/activity.module';
import { RiskModule } from './modules/risk/risk.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseConfigService } from './config/database.config';
import { RedisModule } from './common/redis/redis.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
      inject: [ConfigService],
    }),
    RedisModule,
    AuthModule,
    PlayerModule,
    CardModule,
    BattleModule,
    StageModule,
    ItemModule,
    ActivityModule,
    RiskModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
