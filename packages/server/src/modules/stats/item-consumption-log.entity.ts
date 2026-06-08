import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ItemType } from '@game/shared';

@Entity('item_consumption_logs')
@Index('idx_player_id', ['playerId'])
@Index('idx_template_id', ['templateId'])
@Index('idx_item_type', ['itemType'])
@Index('idx_source', ['source'])
@Index('idx_created_at', ['createdAt'])
export class ItemConsumptionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'template_id' })
  templateId: string;

  @Column({ length: 100, name: 'item_name', default: '' })
  itemName: string;

  @Column({ type: 'varchar', length: 30, name: 'item_type' })
  itemType: ItemType;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ length: 50, default: 'unknown' })
  source: string;

  @Column({ type: 'varchar', length: 20, default: 'bind' })
  bindType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
