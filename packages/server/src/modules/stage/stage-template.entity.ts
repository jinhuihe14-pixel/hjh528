import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { StageType } from '@game/shared';

@Entity('stage_templates')
@Index('idx_chapter_id', ['chapterId'])
export class StageTemplateEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 50, name: 'chapter_id' })
  chapterId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: StageType;

  @Column({ length: 500, default: '' })
  description: string;

  @Column({ default: 1 })
  level: number;

  @Column({ name: 'stamina_cost', default: 10 })
  staminaCost: number;

  @Column({ name: 'max_stars', default: 3 })
  maxStars: number;

  @Column({ type: 'simple-json', name: 'enemy_waves' })
  enemyWaves: Array<{
    waveNumber: number;
    enemies: Array<{
      cardTemplateId: string;
      level: number;
      breakthrough: number;
      position: number;
    }>;
  }>;

  @Column({ type: 'simple-json', name: 'first_clear_reward' })
  firstClearReward: {
    exp: number;
    gold: number;
    items?: Array<{ templateId: string; count: number }>;
  };

  @Column({ type: 'simple-json', name: 'normal_reward' })
  normalReward: {
    exp: number;
    gold: number;
    items?: Array<{ templateId: string; count: number; rate?: number }>;
  };

  @Column({ name: 'recommended_power', default: 0 })
  recommendedPower: number;

  @Column({ type: 'simple-json', name: 'unlock_condition' })
  unlockCondition: {
    requiredStageId?: string;
    requiredPlayerLevel?: number;
    requiredStars?: number;
  };

  @Column({ name: 'daily_limit', default: 0 })
  dailyLimit: number;

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
