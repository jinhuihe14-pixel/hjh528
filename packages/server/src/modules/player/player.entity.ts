import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('players')
@Index('idx_server_id', ['serverId'])
@Index('idx_username_server', ['username', 'serverId'], { unique: true })
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 255, default: '' })
  avatar: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  exp: number;

  @Column({ default: 0, name: 'vip_level' })
  vipLevel: number;

  @Column({ length: 50, name: 'server_id' })
  serverId: string;

  @Column({ length: 50, name: 'guild_id', nullable: true })
  guildId?: string;

  @Column({ default: 0, name: 'combat_power' })
  combatPower: number;

  @Column({ length: 255, select: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'last_login_at' })
  lastLoginAt: Date;

  @Column({ default: false, name: 'is_online' })
  isOnline: boolean;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'banned' | 'suspended';

  @Column({ length: 255, nullable: true, name: 'ban_reason' })
  banReason?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'ban_end_at' })
  banEndAt?: Date;

  @Column({ length: 50, nullable: true, name: 'last_ip' })
  lastIp?: string;

  @Column({ length: 100, nullable: true, name: 'device_id' })
  deviceId?: string;
}
