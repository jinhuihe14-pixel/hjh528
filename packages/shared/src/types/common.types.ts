export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'maintenance';
  isNew: boolean;
  isHot: boolean;
  openTime: Date;
}

export interface RiskEvent {
  id: string;
  playerId: string;
  eventType: string;
  riskLevel: string;
  description: string;
  data: Record<string, any>;
  createdAt: Date;
  handled: boolean;
  handledBy?: string;
  handledAt?: Date;
  handleResult?: string;
}

export interface CurrencyLog {
  id: string;
  playerId: string;
  currencyType: string;
  bindType: string;
  changeType: string;
  changeAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  relatedId?: string;
  createdAt: Date;
  ip?: string;
  deviceId?: string;
}

export interface OperationLog {
  id: string;
  operatorId: string;
  operatorName: string;
  module: string;
  action: string;
  targetId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ip: string;
  createdAt: Date;
}
