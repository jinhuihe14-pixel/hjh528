import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('player_sign_ins')
@Index('idx_player_activity', ['playerId', 'activityId'], { unique: true })
@Index('idx_player_id', ['playerId'])
@Index('idx_activity_id', ['activityId'])
export class PlayerSignInEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'activity_id' })
  activityId: string;

  @Column({ name: 'total_sign_in_days', default: 0 })
  totalSignInDays: number;

  @Column({ name: 'continuous_sign_in_days', default: 0 })
  continuousSignInDays: number;

  @Column({ length: 20, name: 'last_sign_in_date', default: '' })
  lastSignInDate: string;

  @Column({ type: 'simple-json', name: 'signed_days', default: [] })
  signedDays: number[];

  @Column({ type: 'simple-json', name: 'cumulative_rewards_claimed', default: [] })
  cumulativeRewardsClaimed: string[];

  @Column({ name: 'make_up_count', default: 0 })
  makeUpCount: number;

  @Column({ length: 20, name: 'cycle_start_date', default: '' })
  cycleStartDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
