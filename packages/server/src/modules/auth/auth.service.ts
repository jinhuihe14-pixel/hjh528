import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Player } from '@game/shared';

import { PlayerService } from '../player/player.service';
import { RegisterDto } from '../player/dto/register.dto';
import { LoginDto } from '../player/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ player: Player; token: string }> {
    const player = await this.playerService.register(dto);
    const token = this.generateToken(player.id);
    return { player, token };
  }

  async login(dto: LoginDto): Promise<{ player: Player; token: string }> {
    const player = await this.playerService.login(dto);
    const token = this.generateToken(player.id);
    return { player, token };
  }

  async logout(playerId: string): Promise<void> {
    const player = await this.playerService.getPlayerInfo(playerId);
    if (player) {
      (player as any).isOnline = false;
    }
  }

  async getCurrentUser(playerId: string): Promise<Player> {
    return this.playerService.getPlayerInfo(playerId);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(playerId: string): string {
    const payload = { sub: playerId };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}
