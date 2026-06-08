import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { RiskLevel } from '@game/shared';
import { CurrencyType, BindType } from '@game/shared';
import { CurrencyChangeType } from '../currency-log.entity';

export class GetRiskEventListDto {
  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @IsOptional()
  isHandled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class HandleRiskEventDto {
  @IsString()
  @IsNotEmpty()
  handleResult: string;
}

export class BanPlayerDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  duration?: number;
}

export class GetCurrencyLogsDto {
  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsEnum(CurrencyType)
  currencyType?: CurrencyType;

  @IsOptional()
  @IsEnum(BindType)
  bindType?: BindType;

  @IsOptional()
  @IsEnum(CurrencyChangeType)
  changeType?: CurrencyChangeType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  startTime?: string;

  @IsOptional()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
