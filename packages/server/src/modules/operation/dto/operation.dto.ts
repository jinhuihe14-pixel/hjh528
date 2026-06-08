import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { OperationLogType } from '@game/shared';

export class GetOperationLogDto {
  @IsOptional()
  @IsEnum(OperationLogType)
  type?: OperationLogType;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

export class CreateOperationLogDto {
  @IsEnum(OperationLogType)
  type: OperationLogType;

  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  targetName?: string;

  @IsOptional()
  @IsObject()
  oldValue?: Record<string, any>;

  @IsOptional()
  @IsObject()
  newValue?: Record<string, any>;

  @IsOptional()
  changes?: string[];

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateConfigDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  value: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class RollbackConfigDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNumber()
  targetVersion: number;
}
