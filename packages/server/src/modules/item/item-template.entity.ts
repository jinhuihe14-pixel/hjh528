import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemType, Rarity, BindType } from '@game/shared';

@Entity('item_templates')
export class ItemTemplateEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: ItemType;

  @Column({ type: 'varchar', length: 20 })
  rarity: Rarity;

  @Column({ length: 500, default: '' })
  description: string;

  @Column({ length: 255, default: '' })
  icon: string;

  @Column({ name: 'max_stack', default: 99 })
  maxStack: number;

  @Column({ default: true })
  sellable: boolean;

  @Column({ name: 'sell_price', default: 0 })
  sellPrice: number;

  @Column({
    type: 'enum',
    enum: BindType,
    name: 'bind_type',
    default: BindType.UNBIND,
  })
  bindType: BindType;

  @Column({ default: false })
  usable: boolean;

  @Column({ type: 'simple-json', name: 'use_effect', nullable: true })
  useEffect?: {
    type: 'gain_currency' | 'gain_exp' | 'gain_card' | 'heal' | 'buff';
    value: number;
    currencyType?: string;
  };

  @Column({ type: 'simple-json', name: 'extra_data', nullable: true })
  extraData?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
