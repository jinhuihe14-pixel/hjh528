import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ActivityType } from '@game/shared';

@Entity('activities')
@Index('idx_status', ['status'])
@Index('idx_type', ['type'])
export class ActivityEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  type: ActivityType;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'simple-json' })
  config: Record<string, any>;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'inactive' | 'maintenance';

  @Column({ type: 'simple-json', name: 'gray_config', nullable: true })
  grayConfig?: {
    enabled: boolean;
    mode: 'tail_number' | 'level' | 'server' | 'whitelist';
    tailNumbers?: number[];
    minLevel?: number;
    maxLevel?: number;
    serverIds?: string[];
    whitelist?: string[];
  };

  @Column({ type: 'simple-json', name: 'partition_config', nullable: true })
  partitionConfig?: {
    enabled: boolean;
    partitions: string[];
  };

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
