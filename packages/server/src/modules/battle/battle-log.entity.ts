import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { BattleResult } from '@game/shared';

export enum BattleType {
  STAGE = 'stage',
  ARENA = 'arena',
  PVP = 'pvp',
}

@Entity('battle_logs')
@Index('idx_player_id', ['playerId'])
@Index('idx_battle_type', ['battleType'])
@Index('idx_created_at', ['createdAt'])
export class BattleLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'enemy_player_id', nullable: true })
  enemyPlayerId?: string;

  @Column({
    type: 'enum',
    enum: BattleType,
    name: 'battle_type',
  })
  battleType: BattleType;

  @Column({ length: 50, name: 'stage_id', nullable: true })
  stageId?: string;

  @Column({
    type: 'enum',
    enum: BattleResult,
    nullable: true,
  })
  result?: BattleResult;

  @Column({ type: 'simple-json', nullable: true })
  rewards?: {
    exp: number;
    gold: number;
    items?: { itemId: string; count: number }[];
    cards?: { cardId: string; count: number }[];
  };

  @Column({ type: 'simple-json', name: 'battle_report', nullable: true })
  battleReport?: {
    actions: any[];
    totalTurns: number;
    playerUnits: any[];
    enemyUnits: any[];
  };

  @Column({ type: 'int', default: 0, name: 'player_power' })
  playerPower: number;

  @Column({ type: 'int', default: 0, name: 'enemy_power' })
  enemyPower: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
