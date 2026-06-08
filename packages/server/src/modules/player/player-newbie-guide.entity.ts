import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('player_newbie_guides')
@Index('idx_player_id', ['playerId'], { unique: true })
export class PlayerNewbieGuideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ name: 'guide_completed', default: false })
  guideCompleted: boolean;

  @Column({ length: 50, name: 'current_step_id', default: '' })
  currentStepId: string;

  @Column({ type: 'simple-json', name: 'completed_steps', default: [] })
  completedSteps: string[];

  @Column({ type: 'simple-json', name: 'claimed_rewards', default: [] })
  claimedRewards: string[];

  @Column({ type: 'simple-json', name: 'task_progress', default: {} })
  taskProgress: Record<string, number>;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
