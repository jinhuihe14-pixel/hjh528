import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('configs')
@Index('idx_type', ['type'])
@Index('idx_status', ['status'])
export class ConfigEntity {
  @PrimaryColumn({ length: 100 })
  key: string;

  @Column({ type: 'simple-json' })
  value: any;

  @Column({ length: 50 })
  type: 'activity' | 'stage' | 'item' | 'card' | 'system';

  @Column({ length: 255, default: '' })
  description: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ length: 100, name: 'updated_by', default: 'system' })
  updatedBy: string;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'inactive' | 'draft';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
