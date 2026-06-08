import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RiskLevel } from '@game/shared';

@Entity('risk_events')
@Index('idx_player_id', ['playerId'])
@Index('idx_event_type', ['eventType'])
@Index('idx_risk_level', ['riskLevel'])
@Index('idx_handled', ['isHandled'])
export class RiskEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'event_type' })
  eventType: string;

  @Column({ type: 'varchar', length: 20, name: 'risk_level' })
  riskLevel: RiskLevel;

  @Column({ length: 500, default: '' })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  data?: Record<string, any>;

  @Column({ name: 'is_handled', default: false })
  isHandled: boolean;

  @Column({ length: 50, name: 'handled_by', nullable: true })
  handledBy?: string;

  @Column({ length: 500, name: 'handle_result', nullable: true })
  handleResult?: string;

  @Column({ type: 'timestamp', name: 'handled_at', nullable: true })
  handledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
