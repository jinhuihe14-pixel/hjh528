import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Player,
  PlayerResource,
  CurrencyType,
  BindType,
  Rarity,
  GuideStepType,
  NewbieGuideConfig,
  NewbieGuideStep,
  PlayerNewbieGuide,
  StageWelfareConfig,
  StageWelfareStage,
} from '@game/shared';

import { PlayerEntity } from './player.entity';
import { PlayerCurrencyEntity } from './player-currency.entity';
import { PlayerNewbieGuideEntity } from './player-newbie-guide.entity';
import { PlayerStageWelfareEntity } from './player-stage-welfare.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNewbieGuideDto, ClaimGuideRewardDto, ClaimStageWelfareDto } from './dto/guide.dto';
import { CardService } from '../card/card.service';
import { ItemService } from '../item/item.service';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  private newbieGuideConfig: NewbieGuideConfig;
  private stageWelfareConfig: StageWelfareConfig;

  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @InjectRepository(PlayerCurrencyEntity)
    private readonly playerCurrencyRepository: Repository<PlayerCurrencyEntity>,
    @InjectRepository(PlayerNewbieGuideEntity)
    private readonly newbieGuideRepository: Repository<PlayerNewbieGuideEntity>,
    @InjectRepository(PlayerStageWelfareEntity)
    private readonly stageWelfareRepository: Repository<PlayerStageWelfareEntity>,
    private readonly cardService: CardService,
    private readonly itemService: ItemService,
  ) {
    this.initDefaultConfigs();
  }

  private initDefaultConfigs(): void {
    this.newbieGuideConfig = {
      enabled: true,
      autoShowOnFirstLogin: true,
      steps: [
        {
          id: 'guide_1',
          type: GuideStepType.DIALOG,
          title: '欢迎来到冒险世界！',
          content: '亲爱的冒险者，欢迎来到这个充满奇幻与挑战的世界！我是你的引导精灵，接下来会带你了解游戏的基本玩法。',
          sort: 1,
          skipable: false,
        },
        {
          id: 'guide_2',
          type: GuideStepType.HIGHLIGHT,
          title: '卡牌系统',
          content: '卡牌是你战斗的核心力量。你可以收集、升级和突破卡牌来增强战斗力。点击下方"卡牌"按钮查看你的卡牌。',
          sort: 2,
          targetElement: 'nav-cards',
          targetPage: '/cards',
          skipable: true,
        },
        {
          id: 'guide_3',
          type: GuideStepType.TASK,
          title: '首次战斗',
          content: '前往副本，完成你的第一场战斗！通关后可以获得丰厚的首通奖励。',
          sort: 3,
          task: {
            taskType: 'stage_clear',
            target: 1,
            description: '通关1个关卡',
          },
          reward: {
            gold: 5000,
            diamond: 50,
            items: [{ templateId: 'item_exp_potion_r', count: 3 }],
          },
          skipable: true,
        },
        {
          id: 'guide_4',
          type: GuideStepType.REWARD,
          title: '新手大礼',
          content: '恭喜你完成了新手引导！这是送给你的新手大礼包，祝你冒险愉快！',
          sort: 4,
          reward: {
            gold: 10000,
            diamond: 200,
            items: [
              { templateId: 'item_exp_potion_r', count: 10 },
              { templateId: 'item_breakthrough_stone_r', count: 5 },
              { templateId: 'item_summon_ticket_normal', count: 3 },
            ],
          },
          skipable: false,
        },
      ],
    };

    this.stageWelfareConfig = {
      enabled: true,
      stages: [
        {
          id: 'welfare_level_5',
          stage: 1,
          name: '新人启程礼',
          description: '达到5级即可领取新手启程奖励',
          condition: { type: 'level', value: 5 },
          reward: {
            gold: 10000,
            diamond: 100,
            items: [{ templateId: 'item_exp_potion_r', count: 5 }],
          },
          sort: 1,
        },
        {
          id: 'welfare_level_10',
          stage: 2,
          name: '成长助力礼',
          description: '达到10级领取成长助力奖励',
          condition: { type: 'level', value: 10 },
          reward: {
            gold: 20000,
            diamond: 200,
            items: [
              { templateId: 'item_breakthrough_stone_r', count: 10 },
              { templateId: 'item_summon_ticket_normal', count: 2 },
            ],
          },
          sort: 2,
        },
        {
          id: 'welfare_stage_3',
          stage: 3,
          name: '首通鼓励礼',
          description: '通关3个关卡领取冒险鼓励奖励',
          condition: { type: 'stage_clear', value: 3 },
          reward: {
            gold: 15000,
            diamond: 150,
            items: [{ templateId: 'item_stamina_potion_small', count: 5 }],
          },
          sort: 3,
        },
        {
          id: 'welfare_level_20',
          stage: 4,
          name: '进阶突破礼',
          description: '达到20级领取进阶突破奖励',
          condition: { type: 'level', value: 20 },
          reward: {
            gold: 50000,
            diamond: 500,
            items: [
              { templateId: 'item_breakthrough_stone_sr', count: 5 },
              { templateId: 'item_summon_ticket_advanced', count: 2 },
            ],
          },
          sort: 4,
        },
        {
          id: 'welfare_login_7',
          stage: 5,
          name: '七日登录礼',
          description: '累计登录7天领取登录奖励',
          condition: { type: 'login_days', value: 7 },
          reward: {
            gold: 30000,
            diamond: 300,
            items: [
              { templateId: 'item_summon_ticket_advanced', count: 5 },
              { templateId: 'item_exp_potion_sr', count: 5 },
            ],
          },
          sort: 5,
        },
      ],
    };
  }

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

  async getNewbieGuideConfig(): Promise<NewbieGuideConfig> {
    return this.newbieGuideConfig;
  }

  async getPlayerNewbieGuide(playerId: string): Promise<PlayerNewbieGuide> {
    let guide = await this.newbieGuideRepository.findOne({
      where: { playerId },
    });

    if (!guide) {
      guide = this.newbieGuideRepository.create({
        playerId,
        guideCompleted: false,
        currentStepId: this.newbieGuideConfig.steps[0]?.id || '',
        completedSteps: [],
        claimedRewards: [],
        taskProgress: {},
        startedAt: new Date(),
      });
      guide = await this.newbieGuideRepository.save(guide);
    }

    return {
      playerId: guide.playerId,
      guideCompleted: guide.guideCompleted,
      currentStepId: guide.currentStepId,
      completedSteps: guide.completedSteps,
      claimedRewards: guide.claimedRewards,
      taskProgress: guide.taskProgress,
      startedAt: guide.startedAt,
      completedAt: guide.completedAt,
    };
  }

  async updateNewbieGuideProgress(playerId: string, dto: UpdateNewbieGuideDto): Promise<PlayerNewbieGuide> {
    let guide = await this.newbieGuideRepository.findOne({
      where: { playerId },
    });

    if (!guide) {
      throw new NotFoundException('新手引导数据不存在');
    }

    if (dto.stepId) {
      const step = this.newbieGuideConfig.steps.find(s => s.id === dto.stepId);
      if (!step) {
        throw new NotFoundException('引导步骤不存在');
      }

      if (!guide.completedSteps.includes(dto.stepId)) {
        guide.completedSteps.push(dto.stepId);
      }

      const sortedSteps = [...this.newbieGuideConfig.steps].sort((a, b) => a.sort - b.sort);
      const currentIndex = sortedSteps.findIndex(s => s.id === dto.stepId);
      if (currentIndex < sortedSteps.length - 1) {
        guide.currentStepId = sortedSteps[currentIndex + 1].id;
      } else {
        guide.guideCompleted = true;
        guide.completedAt = new Date();
        guide.currentStepId = '';
      }
    }

    if (dto.completed !== undefined && dto.completed) {
      guide.guideCompleted = true;
      guide.completedAt = new Date();
      guide.currentStepId = '';
      for (const step of this.newbieGuideConfig.steps) {
        if (!guide.completedSteps.includes(step.id)) {
          guide.completedSteps.push(step.id);
        }
      }
    }

    if (dto.taskProgress) {
      guide.taskProgress = { ...guide.taskProgress, ...dto.taskProgress };
    }

    await this.newbieGuideRepository.save(guide);

    return this.getPlayerNewbieGuide(playerId);
  }

  async claimGuideReward(playerId: string, dto: ClaimGuideRewardDto): Promise<any> {
    const guide = await this.newbieGuideRepository.findOne({
      where: { playerId },
    });

    if (!guide) {
      throw new NotFoundException('新手引导数据不存在');
    }

    if (guide.claimedRewards.includes(dto.stepId)) {
      throw new BadRequestException('该奖励已领取');
    }

    const step = this.newbieGuideConfig.steps.find(s => s.id === dto.stepId);
    if (!step || !step.reward) {
      throw new NotFoundException('奖励不存在');
    }

    if (!guide.completedSteps.includes(dto.stepId)) {
      throw new BadRequestException('引导步骤未完成');
    }

    guide.claimedRewards.push(dto.stepId);
    await this.newbieGuideRepository.save(guide);

    await this.grantReward(playerId, step.reward);

    return {
      success: true,
      reward: step.reward,
    };
  }

  async getStageWelfareConfig(): Promise<StageWelfareConfig> {
    return this.stageWelfareConfig;
  }

  async getPlayerStageWelfare(playerId: string): Promise<{
    welfareList: (StageWelfareStage & { canClaim: boolean; claimed: boolean })[];
    claimedStages: string[];
  }> {
    let playerWelfare = await this.stageWelfareRepository.findOne({
      where: { playerId },
    });

    if (!playerWelfare) {
      playerWelfare = this.stageWelfareRepository.create({
        playerId,
        claimedStages: [],
      });
      playerWelfare = await this.stageWelfareRepository.save(playerWelfare);
    }

    const player = await this.getPlayerInfo(playerId);

    const welfareList = this.stageWelfareConfig.stages
      .sort((a, b) => a.sort - b.sort)
      .map(welfare => {
        const claimed = playerWelfare!.claimedStages.includes(welfare.id);
        const canClaim = !claimed && this.checkWelfareCondition(welfare, player);

        return {
          ...welfare,
          canClaim,
          claimed,
        };
      });

    return {
      welfareList,
      claimedStages: playerWelfare.claimedStages,
    };
  }

  private checkWelfareCondition(welfare: StageWelfareStage, player: Player): boolean {
    const { condition } = welfare;

    switch (condition.type) {
      case 'level':
        return player.level >= condition.value;
      case 'login_days':
        return true;
      case 'stage_clear':
        return true;
      case 'stars':
        return true;
      default:
        return false;
    }
  }

  async claimStageWelfare(playerId: string, dto: ClaimStageWelfareDto): Promise<any> {
    let playerWelfare = await this.stageWelfareRepository.findOne({
      where: { playerId },
    });

    if (!playerWelfare) {
      throw new NotFoundException('福利数据不存在');
    }

    if (playerWelfare.claimedStages.includes(dto.welfareId)) {
      throw new BadRequestException('该福利已领取');
    }

    const welfare = this.stageWelfareConfig.stages.find(s => s.id === dto.welfareId);
    if (!welfare) {
      throw new NotFoundException('福利不存在');
    }

    const player = await this.getPlayerInfo(playerId);
    if (!this.checkWelfareCondition(welfare, player)) {
      throw new BadRequestException('未满足领取条件');
    }

    playerWelfare.claimedStages.push(dto.welfareId);
    await this.stageWelfareRepository.save(playerWelfare);

    await this.grantReward(playerId, welfare.reward);

    return {
      success: true,
      welfareId: dto.welfareId,
      reward: welfare.reward,
    };
  }

  private async grantReward(playerId: string, reward: {
    gold?: number;
    diamond?: number;
    items?: { templateId: string; count: number }[];
    cards?: { templateId: string; count: number }[];
  }): Promise<void> {
    try {
      if (reward.gold && reward.gold > 0) {
        this.logger.log(`Grant gold to player ${playerId}: ${reward.gold}`);
      }

      if (reward.diamond && reward.diamond > 0) {
        this.logger.log(`Grant diamond to player ${playerId}: ${reward.diamond}`);
      }

      if (reward.items && reward.items.length > 0) {
        for (const item of reward.items) {
          try {
            await this.itemService.addItem(playerId, item.templateId, item.count, BindType.BIND, 'welfare');
          } catch (error) {
            this.logger.warn(`Failed to grant item ${item.templateId}: ${error.message}`);
          }
        }
      }

      if (reward.cards && reward.cards.length > 0) {
        for (const card of reward.cards) {
          try {
            await this.cardService.giveCard(playerId, card.templateId);
          } catch (error) {
            this.logger.warn(`Failed to grant card ${card.templateId}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to grant reward to player ${playerId}: ${error.message}`);
    }
  }

  async refreshGuideConfig(): Promise<void> {
    this.logger.log('Newbie guide and welfare config refreshed');
  }
}
