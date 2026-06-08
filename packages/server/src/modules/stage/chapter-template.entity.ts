import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chapter_templates')
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

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
