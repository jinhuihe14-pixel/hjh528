import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { OperationLogType } from '@game/shared';

@Entity('operation_logs')
@Index('idx_type', ['type'])
@Index('idx_module', ['module'])
@Index('idx_operator_id', ['operatorId'])
@Index('idx_created_at', ['createdAt'])
export class OperationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'operator_id' })
  operatorId: string;

  @Column({ length: 100, name: 'operator_name' })
  operatorName: string;

  @Column({ type: 'varchar', length: 50 })
  type: OperationLogType;

  @Column({ length: 50 })
  module: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 50, name: 'target_id', nullable: true })
  targetId?: string;

  @Column({ length: 100, name: 'target_name', nullable: true })
  targetName?: string;

  @Column({ type: 'simple-json', name: 'old_value', nullable: true })
  oldValue?: Record<string, any>;

  @Column({ type: 'simple-json', name: 'new_value', nullable: true })
  newValue?: Record<string, any>;

  @Column({ type: 'simple-json', default: [] })
  changes: string[];

  @Column({ length: 50, nullable: true })
  ip?: string;

  @Column({ length: 500, nullable: true })
  remark?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
