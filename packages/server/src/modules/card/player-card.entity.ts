import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('player_cards')
@Index('idx_player_id', ['playerId'])
@Index('idx_template_id', ['templateId'])
export class PlayerCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'player_id' })
  playerId: string;

  @Column({ length: 50, name: 'template_id' })
  templateId: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  exp: number;

  @Column({ default: 0 })
  breakthrough: number;

  @Column({ type: 'simple-json', nullable: true })
  skills: any[];

  @Column({ default: 0 })
  stars: number;

  @Column({ default: 0, name: 'combat_power' })
  combatPower: number;

  @Column({ default: 0, name: 'position', nullable: true })
  position?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
