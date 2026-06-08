import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('player_activities')
@Index('idx_player_activity', ['playerId', 'activityId'], { unique: true })
@Index('idx_player_id', ['playerId'])
@Index('idx_activity_id', ['activityId'])
export class PlayerActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'activity_id' })
  activityId: string;

  @Column({ type: 'simple-json', name: 'progress_data', default: {} })
  progressData: Record<string, any>;

  @Column({ type: 'simple-json', name: 'rewards_claimed', default: {} })
  rewardsClaimed: Record<string, boolean>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
