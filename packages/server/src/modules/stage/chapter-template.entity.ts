import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('chapter_templates')
@Index('idx_difficulty_group', ['difficultyGroup'])
export class ChapterTemplateEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, default: '' })
  description: string;

  @Column({ type: 'simple-json' })
  stages: string[];

  @Column({ name: 'required_level', default: 1 })
  requiredLevel: number;

  @Column({ type: 'simple-json', name: 'chapter_reward' })
  chapterReward: {
    items?: Array<{ templateId: string; count: number }>;
    gold?: number;
    diamond?: number;
  };

  @Column({ length: 50, name: 'difficulty_group', nullable: true })
  difficultyGroup?: string;

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
