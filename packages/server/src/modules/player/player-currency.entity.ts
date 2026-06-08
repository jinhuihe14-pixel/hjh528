import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CurrencyType, BindType } from '@game/shared';

@Entity('player_currencies')
@Index('idx_player_currency', ['playerId', 'type', 'bindType'], { unique: true })
export class PlayerCurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({
    type: 'enum',
    enum: CurrencyType,
    name: 'currency_type',
  })
  type: CurrencyType;

  @Column({
    type: 'enum',
    enum: BindType,
    name: 'bind_type',
    default: BindType.BIND,
  })
  bindType: BindType;

  @Column({ type: 'bigint', default: 0 })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
