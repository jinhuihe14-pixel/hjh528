import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rarity, Element, CardType } from '@game/shared';

@Entity('card_templates')
export class CardTemplateEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  rarity: Rarity;

  @Column({ type: 'varchar', length: 20 })
  element: Element;

  @Column({ type: 'varchar', length: 20 })
  type: CardType;

  @Column({ length: 500, default: '' })
  description: string;

  @Column({ length: 255, default: '' })
  avatar: string;

  @Column({ type: 'simple-json', name: 'base_attributes' })
  baseAttributes: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number;
    critDamage: number;
    hitRate: number;
    dodgeRate: number;
    effectHitRate: number;
    effectResistRate: number;
  };

  @Column({ type: 'simple-json', name: 'growth_attributes' })
  growthAttributes: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number;
    critDamage: number;
    hitRate: number;
    dodgeRate: number;
    effectHitRate: number;
    effectResistRate: number;
  };

  @Column({ type: 'simple-json' })
  skills: any[];

  @Column({ type: 'simple-json', name: 'passive_skills' })
  passiveSkills: any[];

  @Column({ type: 'simple-json', name: 'breakthrough_levels' })
  breakthroughLevels: any[];

  @Column({ type: 'simple-json', default: [] })
  bonds: any[];

  @Column({ default: 0, name: 'base_exp' })
  baseExp: number;

  @Column({ default: 0, name: 'sell_price' })
  sellPrice: number;

  @Column({ default: 100, name: 'max_level' })
  maxLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
