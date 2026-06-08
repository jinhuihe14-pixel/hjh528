import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CurrencyType, BindType } from '@game/shared';

export enum CurrencyChangeType {
  ADD = 'add',
  SUBTRACT = 'subtract',
}

@Entity('currency_logs')
@Index('idx_player_id', ['playerId'])
@Index('idx_currency_type', ['currencyType'])
@Index('idx_change_type', ['changeType'])
@Index('idx_reason', ['reason'])
@Index('idx_created_at', ['createdAt'])
export class CurrencyLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ type: 'varchar', length: 30, name: 'currency_type' })
  currencyType: CurrencyType;

  @Column({ type: 'varchar', length: 20, name: 'bind_type' })
  bindType: BindType;

  @Column({ type: 'varchar', length: 20, name: 'change_type' })
  changeType: CurrencyChangeType;

  @Column({ type: 'bigint', default: 0 })
  amount: number;

  @Column({ type: 'bigint', name: 'balance_before', default: 0 })
  balanceBefore: number;

  @Column({ type: 'bigint', name: 'balance_after', default: 0 })
  balanceAfter: number;

  @Column({ length: 100, default: '' })
  reason: string;

  @Column({ length: 50, name: 'related_id', nullable: true })
  relatedId?: string;

  @Column({ length: 50, name: 'ip', nullable: true })
  ip?: string;

  @Column({ length: 100, name: 'device_id', nullable: true })
  deviceId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
