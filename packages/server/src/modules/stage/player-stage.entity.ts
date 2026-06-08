import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('player_stages')
@Index('idx_player_stage', ['playerId', 'stageId'], { unique: true })
@Index('idx_player_id', ['playerId'])
@Index('idx_stage_id', ['stageId'])
export class PlayerStageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'stage_id' })
  stageId: string;

  @Column({ default: 0 })
  stars: number;

  @Column({ name: 'is_cleared', default: false })
  isCleared: boolean;

  @Column({ name: 'cleared_at', type: 'timestamp', nullable: true })
  clearedAt?: Date;

  @Column({ name: 'daily_challenges', default: 0 })
  dailyChallenges: number;

  @Column({ name: 'first_clear_reward_claimed', default: false })
  firstClearRewardClaimed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
