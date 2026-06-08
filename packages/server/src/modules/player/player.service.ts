import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Player, PlayerResource, CurrencyType, BindType, Rarity } from '@game/shared';

import { PlayerEntity } from './player.entity';
import { PlayerCurrencyEntity } from './player-currency.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CardService } from '../card/card.service';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @InjectRepository(PlayerCurrencyEntity)
    private readonly playerCurrencyRepository: Repository<PlayerCurrencyEntity>,
    private readonly cardService: CardService,
  ) {}

  async register(dto: RegisterDto): Promise<Player> {
    const existingPlayer = await this.playerRepository.findOne({
      where: { username: dto.username, serverId: dto.serverId },
    });

    if (existingPlayer) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const player = this.playerRepository.create({
      username: dto.username,
      password: hashedPassword,
      nickname: dto.nickname,
      serverId: dto.serverId,
      avatar: '',
    });

    const savedPlayer = await this.playerRepository.save(player);
    await this.initPlayerResources(savedPlayer.id);
    await this.initPlayerCards(savedPlayer.id);

    return this.formatPlayer(savedPlayer);
  }

  async login(dto: LoginDto): Promise<Player> {
    const player = await this.playerRepository
      .createQueryBuilder('player')
      .addSelect('player.password')
      .where('player.username = :username', { username: dto.username })
      .andWhere('player.server_id = :serverId', { serverId: dto.serverId })
      .getOne();

    if (!player) {
      throw new BadRequestException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, player.password);
    if (!isPasswordValid) {
      throw new BadRequestException('用户名或密码错误');
    }

    this.checkPlayerStatus(player);

    player.lastLoginAt = new Date();
    player.isOnline = true;
    await this.playerRepository.save(player);

    return this.formatPlayer(player);
  }

  async getPlayerInfo(playerId: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    return this.formatPlayer(player);
  }

  async getPlayerResources(playerId: string): Promise<PlayerResource> {
    const currencies = await this.playerCurrencyRepository.find({
      where: { playerId },
    });

    return this.formatPlayerResources(currencies);
  }

  async updatePlayerProfile(playerId: string, dto: UpdateProfileDto): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    if (dto.nickname !== undefined) {
      player.nickname = dto.nickname;
    }
    if (dto.avatar !== undefined) {
      player.avatar = dto.avatar;
    }

    const updatedPlayer = await this.playerRepository.save(player);
    return this.formatPlayer(updatedPlayer);
  }

  async checkPlayerStatus(player: PlayerEntity): Promise<void> {
    if (player.status === 'banned') {
      if (player.banEndAt && player.banEndAt > new Date()) {
        throw new ForbiddenException(`账号已被封禁：${player.banReason || '违规操作'}`);
      } else if (player.banEndAt && player.banEndAt <= new Date()) {
        player.status = 'active';
        player.banReason = undefined;
        player.banEndAt = undefined;
        await this.playerRepository.save(player);
      } else {
        throw new ForbiddenException(`账号已被永久封禁：${player.banReason || '违规操作'}`);
      }
    }

    if (player.status === 'suspended') {
      throw new ForbiddenException('账号已被暂停使用');
    }
  }

  private async initPlayerResources(playerId: string): Promise<void> {
    const initialResources = [
      { type: CurrencyType.GOLD, bindType: BindType.BIND, amount: 0 },
      { type: CurrencyType.GOLD, bindType: BindType.UNBIND, amount: 10000 },
      { type: CurrencyType.DIAMOND, bindType: BindType.BIND, amount: 0 },
      { type: CurrencyType.DIAMOND, bindType: BindType.UNBIND, amount: 100 },
      { type: CurrencyType.STAMINA, bindType: BindType.BIND, amount: 100 },
      { type: CurrencyType.EXP, bindType: BindType.BIND, amount: 0 },
      { type: CurrencyType.ARENA_COIN, bindType: BindType.BIND, amount: 0 },
      { type: CurrencyType.GUILD_COIN, bindType: BindType.BIND, amount: 0 },
    ];

    for (const resource of initialResources) {
      const currency = this.playerCurrencyRepository.create({
        playerId,
        type: resource.type,
        bindType: resource.bindType,
        amount: resource.amount,
      });
      await this.playerCurrencyRepository.save(currency);
    }
  }

  private async initPlayerCards(playerId: string): Promise<void> {
    const starterCards = [
      'card_earth_guard_r',
      'card_wind_assassin_r',
      'card_light_priest_r',
    ];

    try {
      for (const cardId of starterCards) {
        try {
          await this.cardService.giveCard(playerId, cardId);
        } catch (error) {
          this.logger.warn(`Failed to give starter card ${cardId} to player ${playerId}: ${error.message}`);
        }
      }
      this.logger.log(`Initialized starter cards for player ${playerId}`);
    } catch (error) {
      this.logger.error(`Failed to initialize player cards: ${error.message}`);
    }
  }

  private formatPlayer(player: PlayerEntity): Player {
    const { password, ...result } = player;
    return result as Player;
  }

  private formatPlayerResources(currencies: PlayerCurrencyEntity[]): PlayerResource {
    const getAmount = (type: CurrencyType, bindType: BindType): number => {
      const currency = currencies.find(c => c.type === type && c.bindType === bindType);
      return currency ? Number(currency.amount) : 0;
    };

    return {
      gold: getAmount(CurrencyType.GOLD, BindType.UNBIND),
      bindGold: getAmount(CurrencyType.GOLD, BindType.BIND),
      diamond: getAmount(CurrencyType.DIAMOND, BindType.UNBIND),
      bindDiamond: getAmount(CurrencyType.DIAMOND, BindType.BIND),
      stamina: getAmount(CurrencyType.STAMINA, BindType.BIND),
      exp: getAmount(CurrencyType.EXP, BindType.BIND),
      arenaCoin: getAmount(CurrencyType.ARENA_COIN, BindType.BIND),
      guildCoin: getAmount(CurrencyType.GUILD_COIN, BindType.BIND),
    };
  }
}
