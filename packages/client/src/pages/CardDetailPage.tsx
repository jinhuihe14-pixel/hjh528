import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { Rarity, Element, CardType, SkillType } from '@game/shared';
import Loading from '../components/Loading';

const rarityColors: Record<Rarity, string> = {
  [Rarity.N]: 'from-gray-500 to-gray-400',
  [Rarity.R]: 'from-blue-600 to-blue-400',
  [Rarity.SR]: 'from-purple-600 to-purple-400',
  [Rarity.SSR]: 'from-amber-500 to-yellow-400',
  [Rarity.UR]: 'from-red-600 via-orange-500 to-yellow-400',
};

const elementColors: Record<Element, string> = {
  [Element.FIRE]: 'bg-red-500',
  [Element.WATER]: 'bg-blue-500',
  [Element.EARTH]: 'bg-amber-700',
  [Element.WIND]: 'bg-green-500',
  [Element.LIGHT]: 'bg-yellow-400',
  [Element.DARK]: 'bg-indigo-600',
};

const elementIcons: Record<Element, string> = {
  [Element.FIRE]: '🔥',
  [Element.WATER]: '💧',
  [Element.EARTH]: '🌍',
  [Element.WIND]: '🌪️',
  [Element.LIGHT]: '☀️',
  [Element.DARK]: '🌙',
};

const elementNames: Record<Element, string> = {
  [Element.FIRE]: '火',
  [Element.WATER]: '水',
  [Element.EARTH]: '土',
  [Element.WIND]: '风',
  [Element.LIGHT]: '光',
  [Element.DARK]: '暗',
};

const typeNames: Record<CardType, string> = {
  [CardType.ATTACK]: '攻击',
  [CardType.DEFENSE]: '防御',
  [CardType.SUPPORT]: '辅助',
  [CardType.CONTROL]: '控制',
};

const skillTypeNames: Record<SkillType, string> = {
  [SkillType.NORMAL]: '普攻',
  [SkillType.ACTIVE]: '技能',
  [SkillType.PASSIVE]: '被动',
  [SkillType.ULTIMATE]: '大招',
};

const skillTypeColors: Record<SkillType, string> = {
  [SkillType.NORMAL]: 'from-slate-500 to-slate-400',
  [SkillType.ACTIVE]: 'from-blue-500 to-cyan-400',
  [SkillType.PASSIVE]: 'from-green-500 to-emerald-400',
  [SkillType.ULTIMATE]: 'from-red-500 to-orange-400',
};

function CardDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { playerCards, currentCard, setCurrentCard, upgradeCard, breakthroughCard, loading, fetchPlayerCards } = useCardStore();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBreakthroughModal, setShowBreakthroughModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [targetLevel, setTargetLevel] = useState(1);
  const [selectedCostCards, setSelectedCostCards] = useState<string[]>([]);

  useEffect(() => {
    if (playerCards.length === 0) {
      fetchPlayerCards();
    }
  }, [fetchPlayerCards, playerCards.length]);

  useEffect(() => {
    const card = playerCards.find(c => c.id === id);
    if (card) {
      setCurrentCard(card);
    }
  }, [id, playerCards, setCurrentCard]);

  const card = currentCard;

  if (loading && !card) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-slate-400 mb-4">卡牌不存在</p>
        <button
          onClick={() => navigate('/cards')}
          className="game-btn-primary"
        >
          返回列表
        </button>
      </div>
    );
  }

  const template = card.template;
  const attributes = card.template.baseAttributes;
  const maxLevel = template.maxLevel || 100;
  const breakthroughLevels = template.breakthroughLevels || [];
  const currentBreakthrough = breakthroughLevels[card.breakthrough] || null;
  const nextBreakthrough = breakthroughLevels[card.breakthrough + 1] || null;

  const calculateUpgradeCost = (level: number) => {
    const baseGold = 100;
    const baseExp = 50;
    const goldCost = Math.floor(baseGold * Math.pow(1.15, level));
    const expCost = Math.floor(baseExp * Math.pow(1.1, level));
    return { gold: goldCost, exp: expCost };
  };

  const handleUpgrade = async () => {
    try {
      await upgradeCard(card.id, targetLevel);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const handleBreakthrough = async () => {
    try {
      await breakthroughCard(card.id, selectedCostCards);
      setShowBreakthroughModal(false);
      setSelectedCostCards([]);
    } catch (error) {
      console.error('Breakthrough failed:', error);
    }
  };

  const toggleCostCard = (cardId: string) => {
    if (selectedCostCards.includes(cardId)) {
      setSelectedCostCards(prev => prev.filter(id => id !== cardId));
    } else {
      setSelectedCostCards(prev => [...prev, cardId]);
    }
  };

  const availableCostCards = playerCards.filter(
    c => c.id !== card.id && c.template.rarity === template.rarity
  );

  const allSkills = [
    ...template.skills.filter(s => s.type === SkillType.NORMAL),
    ...template.skills.filter(s => s.type === SkillType.ACTIVE),
    ...template.skills.filter(s => s.type === SkillType.ULTIMATE),
    ...(template.passiveSkills || []),
  ];

  return (
    <div className="min-h-full pb-4">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-10">
          卡牌详情
        </h1>
      </div>

      <div className="p-4 space-y-4">
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${rarityColors[template.rarity]} p-1`}>
          {template.rarity === Rarity.UR && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-red-500/30 animate-pulse-slow pointer-events-none"></div>
          )}
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <div className="relative aspect-square bg-gradient-to-b from-slate-800 to-slate-900">
              <img
                src={template.avatar}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/400/1e293b/94a3b8?text=${encodeURIComponent(template.name.charAt(0))}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${elementColors[template.element]} flex items-center gap-1 text-white text-sm font-medium shadow-lg`}>
                <span>{elementIcons[template.element]}</span>
                <span>{elementNames[template.element]}</span>
              </div>

              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                {typeNames[template.type]}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold bg-gradient-to-r ${rarityColors[template.rarity]} bg-clip-text text-transparent`}>
                      {template.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400 text-sm">⭐ × {card.stars || 0}</span>
                      <span className="text-slate-300 text-sm">突破 +{card.breakthrough}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-2xl font-bold">Lv.{card.level}</div>
                    <div className="text-yellow-400/80 text-sm flex items-center gap-1">
                      <span>⚔️</span>
                      <span>{formatNumber(card.combatPower)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">📊</span>
            属性面板
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <AttributeItem icon="❤️" label="生命值" value={attributes.hp} color="text-red-400" />
            <AttributeItem icon="⚔️" label="攻击力" value={attributes.attack} color="text-orange-400" />
            <AttributeItem icon="🛡️" label="防御力" value={attributes.defense} color="text-blue-400" />
            <AttributeItem icon="💨" label="速度" value={attributes.speed} color="text-green-400" />
            <AttributeItem icon="🎯" label="暴击率" value={`${(attributes.critRate * 100).toFixed(1)}%`} color="text-yellow-400" />
            <AttributeItem icon="💥" label="暴击伤害" value={`${(attributes.critDamage * 100).toFixed(1)}%`} color="text-amber-400" />
            <AttributeItem icon="🎯" label="命中率" value={`${(attributes.hitRate * 100).toFixed(1)}%`} color="text-cyan-400" />
            <AttributeItem icon="🌀" label="闪避率" value={`${(attributes.dodgeRate * 100).toFixed(1)}%`} color="text-purple-400" />
          </div>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            技能列表
          </h3>
          <div className="space-y-2">
            {allSkills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer transition-all active:scale-98"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skillTypeColors[skill.type]} flex items-center justify-center text-2xl shadow-lg`}>
                  {skill.type === SkillType.NORMAL && '👊'}
                  {skill.type === SkillType.ACTIVE && '✨'}
                  {skill.type === SkillType.PASSIVE && '🔮'}
                  {skill.type === SkillType.ULTIMATE && '💫'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{skill.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${skillTypeColors[skill.type]} text-white`}>
                      {skillTypeNames[skill.type]}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm truncate mt-0.5">{skill.description}</p>
                </div>
                <span className="text-slate-500">›</span>
              </div>
            ))}
          </div>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">📖</span>
            卡牌简介
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">{template.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              setTargetLevel(Math.min(card.level + 10, maxLevel));
              setShowUpgradeModal(true);
            }}
            className="py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95"
          >
            <span className="text-xl">⬆️</span>
            <div>升级</div>
          </button>
          <button
            onClick={() => setShowBreakthroughModal(true)}
            disabled={!nextBreakthrough}
            className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">🌟</span>
            <div>突破</div>
          </button>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="game-card p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4 text-center">卡牌升级</h3>

            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-yellow-400">
                Lv.{card.level} → Lv.{targetLevel}
              </div>
              <div className="text-slate-400 text-sm mt-1">
                最高等级: Lv.{maxLevel}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-slate-300 text-sm mb-2 block">目标等级</label>
              <input
                type="range"
                min={card.level + 1}
                max={maxLevel}
                value={targetLevel}
                onChange={(e) => setTargetLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Lv.{card.level + 1}</span>
                <span>Lv.{maxLevel}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
              <h4 className="text-slate-300 text-sm mb-2">升级消耗</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-yellow-400 text-lg font-bold">
                    🪙 {formatNumber(calculateUpgradeCost(targetLevel).gold * (targetLevel - card.level))}
                  </div>
                  <div className="text-slate-500 text-xs">金币</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 text-lg font-bold">
                    ⚡ {formatNumber(calculateUpgradeCost(targetLevel).exp * (targetLevel - card.level))}
                  </div>
                  <div className="text-slate-500 text-xs">经验</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 game-btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 game-btn-primary"
              >
                确认升级
              </button>
            </div>
          </div>
        </div>
      )}

      {showBreakthroughModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="game-card p-6 w-full max-w-sm max-h-[80vh] overflow-auto animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4 text-center">卡牌突破</h3>

            {nextBreakthrough ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-purple-400">
                    突破 +{card.breakthrough} → +{card.breakthrough + 1}
                  </div>
                  <div className="text-yellow-400 text-sm mt-1">
                    {nextBreakthrough.name}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                  <h4 className="text-slate-300 text-sm mb-2">突破效果</h4>
                  {nextBreakthrough.attributeBonus && Object.entries(nextBreakthrough.attributeBonus).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm py-1">
                      <span className="text-slate-400">{getAttributeName(key)}</span>
                      <span className="text-green-400">+{value}</span>
                    </div>
                  ))}
                  {nextBreakthrough.unlockSkillId && (
                    <div className="text-purple-400 text-sm mt-2">
                      🔓 解锁新技能
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                  <h4 className="text-slate-300 text-sm mb-2">
                    消耗材料 ({selectedCostCards.length}/{nextBreakthrough.requiredCards || 1})
                  </h4>
                  <p className="text-slate-500 text-xs mb-3">需要相同稀有度的卡牌作为材料</p>

                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-auto">
                    {availableCostCards.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => toggleCostCard(c.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedCostCards.includes(c.id)
                            ? 'ring-2 ring-green-400 scale-95'
                            : 'ring-1 ring-slate-600 hover:ring-slate-500'
                        }`}
                      >
                        <img
                          src={c.template.avatar}
                          alt={c.template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/100/1e293b/94a3b8?text=${encodeURIComponent(c.template.name.charAt(0))}`;
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                          Lv.{c.level}
                        </div>
                        {selectedCostCards.includes(c.id) && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                    {availableCostCards.length === 0 && (
                      <div className="col-span-4 text-center text-slate-500 text-sm py-4">
                        没有可用的材料卡
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">金币消耗</span>
                    <span className="text-yellow-400 font-bold">
                      🪙 {formatNumber(nextBreakthrough.requiredGold || 1000)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🏆</div>
                <p className="text-slate-300">已达到最高突破等级</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowBreakthroughModal(false);
                  setSelectedCostCards([]);
                }}
                className="flex-1 game-btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleBreakthrough}
                disabled={!nextBreakthrough || selectedCostCards.length < (nextBreakthrough?.requiredCards || 1)}
                className="flex-1 game-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认突破
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSkill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="game-card p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${skillTypeColors[selectedSkill.type]} flex items-center justify-center text-3xl shadow-lg`}>
                {selectedSkill.type === SkillType.NORMAL && '👊'}
                {selectedSkill.type === SkillType.ACTIVE && '✨'}
                {selectedSkill.type === SkillType.PASSIVE && '🔮'}
                {selectedSkill.type === SkillType.ULTIMATE && '💫'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${skillTypeColors[selectedSkill.type]} text-white`}>
                  {skillTypeNames[selectedSkill.type]}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
              <h4 className="text-slate-300 text-sm mb-2">技能效果</h4>
              <p className="text-white text-sm leading-relaxed">{selectedSkill.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-white font-bold">{selectedSkill.level}/{selectedSkill.maxLevel}</div>
                <div className="text-slate-500 text-xs">等级</div>
              </div>
              {selectedSkill.cooldown > 0 && (
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-blue-400 font-bold">{selectedSkill.cooldown}回合</div>
                  <div className="text-slate-500 text-xs">冷却</div>
                </div>
              )}
            </div>

            {selectedSkill.unlockCondition && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-amber-400 text-sm">
                  🔒 解锁条件: 等级 {selectedSkill.unlockCondition.level || '?'}，突破 +{selectedSkill.unlockCondition.breakthrough || '?'}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedSkill(null)}
              className="w-full game-btn-primary mt-4"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AttributeItem({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2.5">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-slate-400 text-xs">{label}</div>
        <div className={`font-bold text-sm ${color}`}>{typeof value === 'number' ? formatNumber(value) : value}</div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + 'w';
  }
  return num.toString();
}

function getAttributeName(key: string): string {
  const names: Record<string, string> = {
    hp: '生命值',
    attack: '攻击力',
    defense: '防御力',
    speed: '速度',
    critRate: '暴击率',
    critDamage: '暴击伤害',
    hitRate: '命中率',
    dodgeRate: '闪避率',
    effectHitRate: '效果命中',
    effectResistRate: '效果抵抗',
  };
  return names[key] || key;
}

export default CardDetailPage;
