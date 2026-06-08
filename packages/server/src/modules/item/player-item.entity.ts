import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BindType } from '@game/shared';

@Entity('player_items')
@Index('idx_player_item', ['playerId', 'templateId', 'bindType'], { unique: true })
@Index('idx_player_id', ['playerId'])
@Index('idx_template_id', ['templateId'])
export class PlayerItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'template_id' })
  templateId: string;

  @Column({ default: 1 })
  count: number;

  @Column({
    type: 'enum',
    enum: BindType,
    name: 'bind_type',
    default: BindType.UNBIND,
  })
  bindType: BindType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
