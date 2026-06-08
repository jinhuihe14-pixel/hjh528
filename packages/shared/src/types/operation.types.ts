import { OperationLogType } from '../enums';

export interface OperationLogQuery {
  type?: OperationLogType;
  module?: string;
  operatorId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ConfigHotUpdate {
  key: string;
  value: any;
  type: 'activity' | 'stage' | 'item' | 'card' | 'system';
  description: string;
  version: number;
  updatedAt: Date;
  updatedBy: string;
}

export interface ConfigVersion {
  key: string;
  version: number;
  value: any;
  updatedAt: Date;
  updatedBy: string;
  description: string;
  rollbackTo?: number;
}
