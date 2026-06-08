import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  BattleState,
  BattleUnit,
  BattleReward,
  BattleResultDto,
  BattleResult,
  BattleStatus,
  createBattleState,
  simulateBattle,
  calculateFinalAttributes,
  calculateCombatPower,
  CardWithTemplate,
  BaseAttributes,
  Skill,
} from '@game/shared';

import { BattleLogEntity, BattleType } from './battle-log.entity';
import { StartBattleDto } from './dto/start-battle.dto';
import { StageBattleDto } from './dto/stage-battle.dto';
import { CardService } from '../card/card.service';

@Injectable()
export class BattleService {
  constructor(
    @InjectRepository(BattleLogEntity)
    private readonly battleLogRepository: Repository<BattleLogEntity>,
    @Inject(forwardRef(() => CardService))
    private readonly cardService: CardService,
  ) {}

  async startBattle(playerId: string, dto: StartBattleDto): Promise<BattleResultDto> {
    const { battleType, enemyPlayerId } = dto;

    if (battleType === BattleType.PVP && !enemyPlayerId) {
      throw new BadRequestException('PVP战斗需要指定对手玩家ID');
    }

    const playerLineup = await this.cardService.getLineup(playerId);
    const playerUnits = this.convertLineupToBattleUnits(playerLineup, 'player');

    if (playerUnits.length === 0) {
      throw new BadRequestException('请先设置阵容');
    }

    let enemyUnits: BattleUnit[] = [];
    let enemyPower = 0;

    if (battleType === BattleType.PVP && enemyPlayerId) {
      const enemyLineup = await this.cardService.getLineup(enemyPlayerId);
      enemyUnits = this.convertLineupToBattleUnits(enemyLineup, 'enemy');
      enemyPower = this.calculateTotalPower(enemyUnits);
    } else {
      enemyUnits = this.generateMockEnemies();
      enemyPower = this.calculateTotalPower(enemyUnits);
    }

    if (enemyUnits.length === 0) {
      throw new BadRequestException('无法生成敌方单位');
    }

    const playerPower = this.calculateTotalPower(playerUnits);

    const battleId = uuidv4();
    const battleState = createBattleState({
      battleId,
      playerUnits,
      enemyUnits,
      playerId,
      enemyPlayerId,
    });

    const finalState = simulateBattle(battleState);

    const rewards = this.calculateRewards(finalState);

    await this.saveBattleLog({
      battleId,
      playerId,
      enemyPlayerId,
      battleType: battleType as unknown as BattleType,
      result: finalState.result,
      rewards,
      battleReport: {
        actions: finalState.actionQueue,
        totalTurns: finalState.turn,
        playerUnits: finalState.playerUnits,
        enemyUnits: finalState.enemyUnits,
      },
      playerPower,
      enemyPower,
    });

    if (finalState.result === BattleResult.WIN) {
      await this.distributeRewards(playerId, rewards);
    }

    return {
      battleId,
      result: finalState.result!,
      rewards,
      actions: finalState.actionQueue,
      totalTurns: finalState.turn,
    };
  }

  async startStageBattle(playerId: string, dto: StageBattleDto): Promise<BattleResultDto> {
    const { stageId } = dto;

    const playerLineup = await this.cardService.getLineup(playerId);
    const playerUnits = this.convertLineupToBattleUnits(playerLineup, 'player');

    if (playerUnits.length === 0) {
      throw new BadRequestException('请先设置阵容');
    }

    const enemyUnits = this.generateStageEnemies(stageId);
    const playerPower = this.calculateTotalPower(playerUnits);
    const enemyPower = this.calculateTotalPower(enemyUnits);

    const battleId = uuidv4();
    const battleState = createBattleState({
      battleId,
      playerUnits,
      enemyUnits,
      playerId,
      stageId,
    });

    const finalState = simulateBattle(battleState);

    const rewards = this.calculateStageRewards(stageId, finalState);

    await this.saveBattleLog({
      battleId,
      playerId,
      battleType: BattleType.STAGE,
      stageId,
      result: finalState.result,
      rewards,
      battleReport: {
        actions: finalState.actionQueue,
        totalTurns: finalState.turn,
        playerUnits: finalState.playerUnits,
        enemyUnits: finalState.enemyUnits,
      },
      playerPower,
      enemyPower,
    });

    if (finalState.result === BattleResult.WIN) {
      await this.distributeRewards(playerId, rewards);
    }

    return {
      battleId,
      result: finalState.result!,
      rewards,
      actions: finalState.actionQueue,
      totalTurns: finalState.turn,
    };
  }

  async getBattleResult(battleId: string): Promise<BattleResultDto> {
    const battleLog = await this.battleLogRepository.findOne({
      where: { id: battleId },
    });

    if (!battleLog) {
      throw new NotFoundException('战斗记录不存在');
    }

    const battleReport = battleLog.battleReport || { actions: [], totalTurns: 0, playerUnits: [], enemyUnits: [] };

    return {
      battleId: battleLog.id,
      result: battleLog.result!,
      rewards: battleLog.rewards as BattleReward || { exp: 0, gold: 0 },
      actions: battleReport.actions,
      totalTurns: battleReport.totalTurns,
    };
  }

  private convertLineupToBattleUnits(lineup: (CardWithTemplate | null)[], side: 'player' | 'enemy'): BattleUnit[] {
    const units: BattleUnit[] = [];

    for (const card of lineup) {
      if (!card || !card.template) continue;

      const finalAttrs = calculateFinalAttributes(card.template, card.level, card.breakthrough);
      const combatPower = calculateCombatPower(finalAttrs);

      const unit: BattleUnit = {
        id: `${side}_${card.id}`,
        name: card.template.name,
        cardTemplateId: card.templateId,
        position: (card as any).position ?? units.length,
        side,
        currentHp: finalAttrs.hp,
        maxHp: finalAttrs.hp,
        attributes: finalAttrs as BaseAttributes,
        skills: card.template.skills as Skill[] || [],
        buffs: [],
        debuffs: [],
        shields: [],
        isAlive: true,
        element: card.template.element,
        combatPower,
      };

      units.push(unit);
    }

    return units;
  }

  private generateMockEnemies(): BattleUnit[] {
    const enemies: BattleUnit[] = [];
    const mockEnemies = [
      { name: '哥布林战士', element: 'earth', hp: 500, attack: 50, defense: 20, speed: 30 },
      { name: '哥布林法师', element: 'fire', hp: 350, attack: 80, defense: 10, speed: 40 },
      { name: '哥布林弓手', element: 'wind', hp: 400, attack: 60, defense: 15, speed: 50 },
    ];

    for (let i = 0; i < 3; i++) {
      const enemy = mockEnemies[i];
      const attrs: BaseAttributes = {
        hp: enemy.hp,
        attack: enemy.attack,
        defense: enemy.defense,
        speed: enemy.speed,
        critRate: 0.1,
        critDamage: 0.5,
        hitRate: 0.9,
        dodgeRate: 0.05,
        effectHitRate: 0,
        effectResistRate: 0,
      };

      const unit: BattleUnit = {
        id: `enemy_${i}`,
        name: enemy.name,
        cardTemplateId: `enemy_template_${i}`,
        position: i,
        side: 'enemy',
        currentHp: attrs.hp,
        maxHp: attrs.hp,
        attributes: attrs,
        skills: [],
        buffs: [],
        debuffs: [],
        shields: [],
        isAlive: true,
        element: enemy.element as any,
        combatPower: calculateCombatPower(attrs),
      };

      enemies.push(unit);
    }

    return enemies;
  }

  private generateStageEnemies(stageId: string): BattleUnit[] {
    const stageNumber = parseInt(stageId.replace(/\D/g, '')) || 1;
    const difficultyMultiplier = 1 + (stageNumber - 1) * 0.15;

    const enemies: BattleUnit[] = [];
    const baseEnemies = [
      { name: '森林史莱姆', element: 'water', hp: 400, attack: 40, defense: 15, speed: 25 },
      { name: '野狼', element: 'wind', hp: 450, attack: 55, defense: 12, speed: 45 },
      { name: '树精', element: 'earth', hp: 600, attack: 35, defense: 30, speed: 20 },
    ];

    const enemyCount = Math.min(3 + Math.floor(stageNumber / 5), 5);

    for (let i = 0; i < enemyCount; i++) {
      const baseEnemy = baseEnemies[i % baseEnemies.length];
      const attrs: BaseAttributes = {
        hp: Math.floor(baseEnemy.hp * difficultyMultiplier),
        attack: Math.floor(baseEnemy.attack * difficultyMultiplier),
        defense: Math.floor(baseEnemy.defense * difficultyMultiplier),
        speed: Math.floor(baseEnemy.speed * difficultyMultiplier),
        critRate: 0.05 + stageNumber * 0.01,
        critDamage: 0.5,
        hitRate: 0.9,
        dodgeRate: 0.05,
        effectHitRate: 0,
        effectResistRate: 0,
      };

      const unit: BattleUnit = {
        id: `enemy_${i}`,
        name: `${baseEnemy.name} Lv.${stageNumber}`,
        cardTemplateId: `stage_${stageId}_enemy_${i}`,
        position: i,
        side: 'enemy',
        currentHp: attrs.hp,
        maxHp: attrs.hp,
        attributes: attrs,
        skills: [],
        buffs: [],
        debuffs: [],
        shields: [],
        isAlive: true,
        element: baseEnemy.element as any,
        combatPower: calculateCombatPower(attrs),
      };

      enemies.push(unit);
    }

    return enemies;
  }

  private calculateTotalPower(units: BattleUnit[]): number {
    return units.reduce((sum, unit) => sum + unit.combatPower, 0);
  }

  private calculateRewards(state: BattleState): BattleReward {
    const baseExp = 100;
    const baseGold = 200;

    if (state.result === BattleResult.WIN) {
      return {
        exp: baseExp,
        gold: baseGold,
      };
    } else if (state.result === BattleResult.DRAW) {
      return {
        exp: Math.floor(baseExp * 0.3),
        gold: Math.floor(baseGold * 0.3),
      };
    }

    return {
      exp: 0,
      gold: 0,
    };
  }

  private calculateStageRewards(stageId: string, state: BattleState): BattleReward {
    const stageNumber = parseInt(stageId.replace(/\D/g, '')) || 1;
    const baseExp = 50 + stageNumber * 20;
    const baseGold = 100 + stageNumber * 30;

    if (state.result === BattleResult.WIN) {
      return {
        exp: baseExp,
        gold: baseGold,
        items: [
          { itemId: 'exp_potion_s', count: Math.ceil(stageNumber / 3) },
        ],
      };
    } else if (state.result === BattleResult.DRAW) {
      return {
        exp: Math.floor(baseExp * 0.3),
        gold: Math.floor(baseGold * 0.3),
      };
    }

    return {
      exp: 0,
      gold: 0,
    };
  }

  private async saveBattleLog(data: {
    battleId: string;
    playerId: string;
    enemyPlayerId?: string;
    battleType: BattleType;
    stageId?: string;
    result?: BattleResult;
    rewards?: BattleReward;
    battleReport?: {
      actions: any[];
      totalTurns: number;
      playerUnits: any[];
      enemyUnits: any[];
    };
    playerPower: number;
    enemyPower: number;
  }): Promise<BattleLogEntity> {
    const battleLog = this.battleLogRepository.create({
      id: data.battleId,
      playerId: data.playerId,
      enemyPlayerId: data.enemyPlayerId,
      battleType: data.battleType,
      stageId: data.stageId,
      result: data.result,
      rewards: data.rewards,
      battleReport: data.battleReport,
      playerPower: data.playerPower,
      enemyPower: data.enemyPower,
    });

    return this.battleLogRepository.save(battleLog);
  }

  private async distributeRewards(playerId: string, rewards: BattleReward): Promise<void> {
    // TODO: 发放奖励 - 调用物品服务和玩家服务
    // - 经验奖励
    // - 金币奖励
    // - 物品奖励
    // - 预留货币日志接口
    console.log(`发放奖励给玩家 ${playerId}:`, rewards);
  }

  async getBattleLogs(playerId: string, page: number = 1, pageSize: number = 20): Promise<{ list: BattleLogEntity[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [logs, total] = await this.battleLogRepository.findAndCount({
      where: { playerId },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return { list: logs, total };
  }
}
