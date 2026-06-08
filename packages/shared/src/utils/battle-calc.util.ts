import {
  BattleState,
  BattleUnit,
  BattleAction,
  Buff,
  Shield,
} from '../types/battle.types';
import {
  Skill,
  SkillEffect,
  BaseAttributes,
} from '../types/card.types';
import {
  SkillEffectType,
  BattleStatus,
  BattleResult,
  Element,
} from '../enums';
import {
  calculateDamage,
  calculateHeal,
  getElementMultiplier,
} from './card-calc.util';
import {
  MAX_BATTLE_TURNS,
  BASE_CRIT_MULTIPLIER,
  MIN_DAMAGE,
} from '../constants/battle.constants';

export function createBattleState(options: {
  battleId: string;
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  stageId?: string;
  playerId?: string;
  enemyPlayerId?: string;
}): BattleState {
  return {
    battleId: options.battleId,
    status: BattleStatus.PREPARING,
    turn: 0,
    maxTurns: MAX_BATTLE_TURNS,
    playerUnits: options.playerUnits,
    enemyUnits: options.enemyUnits,
    currentSide: 'player',
    actionQueue: [],
    stageId: options.stageId,
    playerId: options.playerId,
    enemyPlayerId: options.enemyPlayerId,
  };
}

export function startBattle(state: BattleState): BattleState {
  return {
    ...state,
    status: BattleStatus.FIGHTING,
    turn: 1,
    currentSide: getFirstSide(state),
  };
}

function getFirstSide(state: BattleState): 'player' | 'enemy' {
  const playerMaxSpeed = Math.max(...state.playerUnits.filter(u => u.isAlive).map(u => u.attributes.speed));
  const enemyMaxSpeed = Math.max(...state.enemyUnits.filter(u => u.isAlive).map(u => u.attributes.speed));
  
  if (playerMaxSpeed === enemyMaxSpeed) {
    return Math.random() > 0.5 ? 'player' : 'enemy';
  }
  
  return playerMaxSpeed > enemyMaxSpeed ? 'player' : 'enemy';
}

export function getNextUnit(state: BattleState): BattleUnit | null {
  const allUnits = [...state.playerUnits, ...state.enemyUnits]
    .filter(u => u.isAlive);
  
  if (allUnits.length === 0) return null;
  
  allUnits.sort((a, b) => b.attributes.speed - a.attributes.speed);
  
  return allUnits[0];
}

export function isCrit(critRate: number): boolean {
  return Math.random() < critRate;
}

export function isHit(hitRate: number, dodgeRate: number): boolean {
  const realHitRate = Math.max(0.1, hitRate - dodgeRate);
  return Math.random() < realHitRate;
}

export function applySkill(
  state: BattleState,
  source: BattleUnit,
  skill: Skill,
  targets: BattleUnit[]
): { state: BattleState; action: BattleAction } {
  const action: BattleAction = {
    turn: state.turn,
    actionType: skill.type === 'normal' ? 'normal' : 'skill',
    sourceId: source.id,
    targetIds: targets.map(t => t.id),
    skillId: skill.id,
    damage: [],
    heal: [],
    buffGained: [],
    shieldGained: [],
    log: `${source.name} 使用了 ${skill.name}`,
  };

  let newState = { ...state };
  let newPlayerUnits = [...newState.playerUnits];
  let newEnemyUnits = [...newState.enemyUnits];

  for (const effect of skill.effects) {
    switch (effect.type) {
      case SkillEffectType.DAMAGE:
        const damageResult = processDamageEffect(source, targets, effect);
        action.damage!.push(...damageResult.damages);
        action.log += `，造成 ${damageResult.totalDamage} 点伤害`;
        
        for (const dmg of damageResult.damages) {
          if (source.side === 'player') {
            const idx = newEnemyUnits.findIndex(u => u.id === dmg.targetId);
            if (idx !== -1) {
              newEnemyUnits[idx] = applyDamageToUnit(newEnemyUnits[idx], dmg.value);
            }
          } else {
            const idx = newPlayerUnits.findIndex(u => u.id === dmg.targetId);
            if (idx !== -1) {
              newPlayerUnits[idx] = applyDamageToUnit(newPlayerUnits[idx], dmg.value);
            }
          }
        }
        break;

      case SkillEffectType.HEAL:
        const healResult = processHealEffect(source, targets, effect);
        action.heal!.push(...healResult.heals);
        action.log += `，恢复 ${healResult.totalHeal} 点生命`;
        
        for (const heal of healResult.heals) {
          if (source.side === 'player') {
            const idx = newPlayerUnits.findIndex(u => u.id === heal.targetId);
            if (idx !== -1) {
              newPlayerUnits[idx] = applyHealToUnit(newPlayerUnits[idx], heal.value);
            }
          } else {
            const idx = newEnemyUnits.findIndex(u => u.id === heal.targetId);
            if (idx !== -1) {
              newEnemyUnits[idx] = applyHealToUnit(newEnemyUnits[idx], heal.value);
            }
          }
        }
        break;

      case SkillEffectType.BUFF:
      case SkillEffectType.DEBUFF:
        const buffResult = processBuffEffect(source, targets, effect);
        action.buffGained!.push(...buffResult.buffs);
        action.log += effect.type === SkillEffectType.BUFF ? '，施加增益效果' : '，施加减益效果';
        
        for (const buff of buffResult.buffs) {
          const buffSide: 'player' | 'enemy' = effect.type === SkillEffectType.BUFF ? source.side : (source.side === 'player' ? 'enemy' : 'player');
          const targetUnits: BattleUnit[] = buffSide === 'player' ? newPlayerUnits : newEnemyUnits;
          const idx = targetUnits.findIndex((u: BattleUnit) => u.id === buff.targetId);
          if (idx !== -1) {
            if (effect.type === SkillEffectType.BUFF) {
              targetUnits[idx] = { ...targetUnits[idx], buffs: [...targetUnits[idx].buffs, buff.buff] };
            } else {
              targetUnits[idx] = { ...targetUnits[idx], debuffs: [...targetUnits[idx].debuffs, { ...buff.buff, isDebuff: true }] };
            }
          }
          if (buffSide === 'player') {
            newPlayerUnits = targetUnits;
          } else {
            newEnemyUnits = targetUnits;
          }
        }
        break;

      case SkillEffectType.SHIELD:
        const shieldResult = processShieldEffect(source, targets, effect);
        action.shieldGained!.push(...shieldResult.shields);
        action.log += '，获得护盾';
        
        for (const shield of shieldResult.shields) {
          if (source.side === 'player') {
            const idx = newPlayerUnits.findIndex(u => u.id === shield.targetId);
            if (idx !== -1) {
              newPlayerUnits[idx] = { ...newPlayerUnits[idx], shields: [...newPlayerUnits[idx].shields, shield.shield] };
            }
          } else {
            const idx = newEnemyUnits.findIndex(u => u.id === shield.targetId);
            if (idx !== -1) {
              newEnemyUnits[idx] = { ...newEnemyUnits[idx], shields: [...newEnemyUnits[idx].shields, shield.shield] };
            }
          }
        }
        break;
    }
  }

  newState = {
    ...newState,
    playerUnits: newPlayerUnits,
    enemyUnits: newEnemyUnits,
    actionQueue: [...newState.actionQueue, action],
  };

  return { state: newState, action };
}

function processDamageEffect(
  source: BattleUnit,
  targets: BattleUnit[],
  effect: SkillEffect
): { damages: { targetId: string; value: number; isCrit: boolean; element?: Element }[]; totalDamage: number } {
  const damages: { targetId: string; value: number; isCrit: boolean; element?: Element }[] = [];
  let totalDamage = 0;

  for (const target of targets) {
    if (!target.isAlive) continue;

    const elementMultiplier = effect.element 
      ? getElementMultiplier(effect.element, target.element)
      : 1;

    const crit = isCrit(source.attributes.critRate);
    const critMultiplier = BASE_CRIT_MULTIPLIER + source.attributes.critDamage;

    const { damage, isCrit: critResult } = calculateDamage(
      source.attributes.attack,
      target.attributes.defense,
      effect.value,
      elementMultiplier,
      crit,
      critMultiplier,
      effect.ignoreDefense || 0
    );

    const finalDamage = Math.max(MIN_DAMAGE, damage);
    damages.push({
      targetId: target.id,
      value: finalDamage,
      isCrit: critResult,
      element: effect.element,
    });
    totalDamage += finalDamage;
  }

  return { damages, totalDamage };
}

function processHealEffect(
  source: BattleUnit,
  targets: BattleUnit[],
  effect: SkillEffect
): { heals: { targetId: string; value: number }[]; totalHeal: number } {
  const heals: { targetId: string; value: number }[] = [];
  let totalHeal = 0;

  for (const target of targets) {
    if (!target.isAlive) continue;

    let baseHeal = effect.value;
    if (effect.healBasedOn === 'attack') {
      baseHeal = source.attributes.attack * effect.value;
    } else if (effect.healBasedOn === 'hp') {
      baseHeal = target.maxHp * effect.value;
    }

    const heal = calculateHeal(baseHeal);
    heals.push({ targetId: target.id, value: heal });
    totalHeal += heal;
  }

  return { heals, totalHeal };
}

function processBuffEffect(
  source: BattleUnit,
  targets: BattleUnit[],
  effect: SkillEffect
): { buffs: { targetId: string; buff: Buff }[] } {
  const buffs: { targetId: string; buff: Buff }[] = [];

  for (const target of targets) {
    if (!target.isAlive) continue;

    const buff: Buff = {
      id: `buff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: effect.type === SkillEffectType.BUFF ? '增益效果' : '减益效果',
      duration: effect.duration || 3,
      remainingTurns: effect.duration || 3,
      attributes: effect.buffAttributes || effect.debuffAttributes || {},
      sourceId: source.id,
      isDebuff: effect.type === SkillEffectType.DEBUFF,
    };

    buffs.push({ targetId: target.id, buff });
  }

  return { buffs };
}

function processShieldEffect(
  source: BattleUnit,
  targets: BattleUnit[],
  effect: SkillEffect
): { shields: { targetId: string; shield: Shield }[] } {
  const shields: { targetId: string; shield: Shield }[] = [];

  for (const target of targets) {
    if (!target.isAlive) continue;

    let shieldValue = effect.value;
    if (effect.healBasedOn === 'attack') {
      shieldValue = source.attributes.attack * effect.value;
    } else if (effect.healBasedOn === 'hp') {
      shieldValue = target.maxHp * effect.value;
    }

    const shield: Shield = {
      id: `shield_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '护盾',
      value: Math.floor(shieldValue),
      remainingTurns: effect.duration || 3,
      sourceId: source.id,
    };

    shields.push({ targetId: target.id, shield });
  }

  return { shields };
}

function applyDamageToUnit(unit: BattleUnit, damage: number): BattleUnit {
  let remainingDamage = damage;
  let newShields = [...unit.shields];

  for (let i = 0; i < newShields.length && remainingDamage > 0; i++) {
    if (newShields[i].value >= remainingDamage) {
      newShields[i] = { ...newShields[i], value: newShields[i].value - remainingDamage };
      remainingDamage = 0;
    } else {
      remainingDamage -= newShields[i].value;
      newShields[i] = { ...newShields[i], value: 0 };
    }
  }

  newShields = newShields.filter(s => s.value > 0);

  const newHp = Math.max(0, unit.currentHp - remainingDamage);
  const isAlive = newHp > 0;

  return {
    ...unit,
    currentHp: newHp,
    isAlive,
    shields: newShields,
  };
}

function applyHealToUnit(unit: BattleUnit, heal: number): BattleUnit {
  const newHp = Math.min(unit.maxHp, unit.currentHp + heal);
  return {
    ...unit,
    currentHp: newHp,
  };
}

export function checkBattleEnd(state: BattleState): { ended: boolean; result?: BattleResult } {
  const playerAlive = state.playerUnits.some(u => u.isAlive);
  const enemyAlive = state.enemyUnits.some(u => u.isAlive);

  if (!playerAlive && !enemyAlive) {
    return { ended: true, result: BattleResult.DRAW };
  }
  if (!playerAlive) {
    return { ended: true, result: BattleResult.LOSE };
  }
  if (!enemyAlive) {
    return { ended: true, result: BattleResult.WIN };
  }
  if (state.turn >= state.maxTurns) {
    const playerTotalHp = state.playerUnits.reduce((sum, u) => sum + u.currentHp, 0);
    const enemyTotalHp = state.enemyUnits.reduce((sum, u) => sum + u.currentHp, 0);
    if (playerTotalHp >= enemyTotalHp) {
      return { ended: true, result: BattleResult.WIN };
    } else {
      return { ended: true, result: BattleResult.LOSE };
    }
  }

  return { ended: false };
}

export function nextTurn(state: BattleState): BattleState {
  let newState = { ...state, turn: state.turn + 1 };
  
  newState.playerUnits = newState.playerUnits.map(unit => ({
    ...unit,
    buffs: unit.buffs
      .map(b => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter(b => b.remainingTurns > 0),
    debuffs: unit.debuffs
      .map(b => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter(b => b.remainingTurns > 0),
    shields: unit.shields
      .map(s => ({ ...s, remainingTurns: s.remainingTurns - 1 }))
      .filter(s => s.remainingTurns > 0),
  }));

  newState.enemyUnits = newState.enemyUnits.map(unit => ({
    ...unit,
    buffs: unit.buffs
      .map(b => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter(b => b.remainingTurns > 0),
    debuffs: unit.debuffs
      .map(b => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter(b => b.remainingTurns > 0),
    shields: unit.shields
      .map(s => ({ ...s, remainingTurns: s.remainingTurns - 1 }))
      .filter(s => s.remainingTurns > 0),
  }));

  newState.currentSide = newState.currentSide === 'player' ? 'enemy' : 'player';

  return newState;
}

export function getValidTargets(
  state: BattleState,
  source: BattleUnit,
  effect: SkillEffect
): BattleUnit[] {
  const isEnemy = effect.type === SkillEffectType.DAMAGE || 
                  effect.type === SkillEffectType.DEBUFF;
  
  const targetPool = isEnemy
    ? (source.side === 'player' ? state.enemyUnits : state.playerUnits)
    : (source.side === 'player' ? state.playerUnits : state.enemyUnits);

  const aliveTargets = targetPool.filter(u => u.isAlive);

  if (aliveTargets.length === 0) return [];

  switch (effect.targetType) {
    case 'single':
      const sortedTargets = [...aliveTargets].sort((a, b) => b.currentHp / b.maxHp - a.currentHp / a.maxHp);
      return [sortedTargets[0]];
    case 'all':
      return aliveTargets;
    case 'random':
      const count = effect.targetCount || 1;
      const shuffled = [...aliveTargets].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    case 'self':
      return [source];
    default:
      return aliveTargets;
  }
}

export function getAvailableSkills(unit: BattleUnit): Skill[] {
  return unit.skills.filter(skill => {
    if (skill.currentCooldown && skill.currentCooldown > 0) {
      return false;
    }
    return true;
  });
}

export function selectBestSkill(unit: BattleUnit, state: BattleState): Skill | null {
  const availableSkills = getAvailableSkills(unit);
  if (availableSkills.length === 0) return null;

  const normalSkill = availableSkills.find(s => s.type === 'normal');
  const activeSkills = availableSkills.filter(s => s.type === 'active');
  const ultimateSkill = availableSkills.find(s => s.type === 'ultimate');

  if (ultimateSkill && Math.random() > 0.3) {
    return ultimateSkill;
  }

  if (activeSkills.length > 0 && Math.random() > 0.4) {
    return activeSkills[Math.floor(Math.random() * activeSkills.length)];
  }

  return normalSkill || availableSkills[0];
}

export function simulateBattle(state: BattleState): BattleState {
  let currentState = startBattle(state);
  
  while (currentState.status === BattleStatus.FIGHTING) {
    const { ended, result } = checkBattleEnd(currentState);
    if (ended) {
      currentState = {
        ...currentState,
        status: BattleStatus.ENDED,
        result,
      };
      break;
    }

    const currentUnit = getNextUnit(currentState);
    if (!currentUnit) break;

    const skill = selectBestSkill(currentUnit, currentState);
    if (!skill) {
      currentState = nextTurn(currentState);
      continue;
    }

    const targets = skill.effects.length > 0 
      ? getValidTargets(currentState, currentUnit, skill.effects[0])
      : [];

    if (targets.length === 0) {
      currentState = nextTurn(currentState);
      continue;
    }

    const { state: newState } = applySkill(currentState, currentUnit, skill, targets);
    currentState = newState;

    currentState = nextTurn(currentState);
  }

  return currentState;
}
