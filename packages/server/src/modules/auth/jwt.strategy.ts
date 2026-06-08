import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PlayerService } from '../player/player.service';
import { Player } from '@game/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly playerService: PlayerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'default-secret-key',
    });
  }

  async validate(payload: any): Promise<Player> {
    const player = await this.playerService.getPlayerInfo(payload.sub);
    if (!player) {
      throw new UnauthorizedException('用户不存在');
    }
    if (player.status !== 'active') {
      throw new UnauthorizedException('账号状态异常');
    }
    return player;
  }
}
