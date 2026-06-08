import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { Rarity, Element } from '@game/shared';
import CardItem from '../components/CardItem';
import Empty from '../components/Empty';

const positionNames = ['前排1', '前排2', '前排3', '后排1', '后排2', '后排3'];

const rarityColors: Record<Rarity, string> = {
  [Rarity.N]: 'from-gray-500 to-gray-400',
  [Rarity.R]: 'from-blue-600 to-blue-400',
  [Rarity.SR]: 'from-purple-600 to-purple-400',
  [Rarity.SSR]: 'from-amber-500 to-yellow-400',
  [Rarity.UR]: 'from-red-600 via-orange-500 to-yellow-400',
};

const elementIcons: Record<Element, string> = {
  [Element.FIRE]: '🔥',
  [Element.WATER]: '💧',
  [Element.EARTH]: '🌍',
  [Element.WIND]: '🌪️',
  [Element.LIGHT]: '☀️',
  [Element.DARK]: '🌙',
};

function LineupPage() {
  const navigate = useNavigate();
  const { lineup: storeLineup, playerCards, setLineup, fetchLineup, fetchPlayerCards, loading } = useCardStore();

  const [tempLineup, setTempLineup] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLineup();
    fetchPlayerCards();
  }, [fetchLineup, fetchPlayerCards]);

  useEffect(() => {
    if (storeLineup.length > 0) {
      setTempLineup([...storeLineup]);
    }
  }, [storeLineup]);

  const lineup = tempLineup;

  const lineupCards = lineup.map((cardId) => {
    if (!cardId) return null;
    return playerCards.find((c) => c.id === cardId) || null;
  });

  const totalPower = lineupCards.reduce((sum, card) => sum + (card?.combatPower || 0), 0);

  const getLineupBonus = () => {
    const elements = lineupCards
      .filter((c) => c !== null)
      .map((c) => c!.template.element);

    const elementCount: Record<string, number> = {};
    elements.forEach((e) => {
      elementCount[e] = (elementCount[e] || 0) + 1;
    });

    const bonuses: string[] = [];
    Object.entries(elementCount).forEach(([element, count]) => {
      if (count >= 3) {
        bonuses.push(`${elementIcons[element as Element]} 3${getElementName(element as Element)}属性 +15%攻击`);
      } else if (count >= 2) {
        bonuses.push(`${elementIcons[element as Element]} 2${getElementName(element as Element)}属性 +8%攻击`);
      }
    });

    return bonuses;
  };

  const bonuses = getLineupBonus();

  const handlePositionClick = (position: number) => {
    setSelectedPosition(position);
    setShowCardSelector(true);
  };

  const handleRemoveCard = (position: number) => {
    const newLineup = [...tempLineup];
    newLineup[position] = null;
    setTempLineup(newLineup);
  };

  const availableCards = playerCards.filter(
    (card) => !tempLineup.includes(card.id)
  );

  const handleQuickSwap = (cardId: string) => {
    if (selectedPosition === null) return;

    const newLineup = [...tempLineup];

    const existingIndex = newLineup.indexOf(cardId);
    if (existingIndex !== -1) {
      newLineup[existingIndex] = newLineup[selectedPosition];
    }

    newLineup[selectedPosition] = cardId;

    setTempLineup(newLineup);
    setShowCardSelector(false);
    setSelectedPosition(null);
  };

  const handleSaveLineup = async () => {
    setIsSaving(true);
    try {
      const lineupData = tempLineup.map((cardId, position) => ({
        position,
        cardId,
      }));
      await setLineup(lineupData);
      alert('阵容保存成功！');
    } catch (error) {
      console.error('Failed to save lineup:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-10">
          阵容搭配
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="game-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">阵容总战力</h3>
              <p className="text-slate-400 text-sm">当前阵容</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                <span>⚔️</span>
                <span>{formatNumber(totalPower)}</span>
              </div>
            </div>
          </div>

          {bonuses.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3">
              <h4 className="text-purple-300 text-sm font-medium mb-2">✨ 阵容加成</h4>
              <div className="space-y-1">
                {bonuses.map((bonus, index) => (
                  <p key={index} className="text-purple-200 text-sm">{bonus}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            出战阵容
          </h3>

          <div className="space-y-4">
            <div>
              <div className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                前排
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((position) => (
                  <LineupSlot
                    key={position}
                    position={position}
                    card={lineupCards[position]}
                    onClick={() => handlePositionClick(position)}
                    onRemove={() => handleRemoveCard(position)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                后排
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[3, 4, 5].map((position) => (
                  <LineupSlot
                    key={position}
                    position={position}
                    card={lineupCards[position]}
                    onClick={() => handlePositionClick(position)}
                    onRemove={() => handleRemoveCard(position)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            阵容提示
          </h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• 点击位置可选择/更换卡牌</li>
            <li>• 同元素卡牌可触发阵容加成</li>
            <li>• 前排建议放置防御型卡牌</li>
            <li>• 后排建议放置攻击型卡牌</li>
          </ul>
        </div>
      </div>

      <div className="sticky bottom-20 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 pt-8">
        <button
          onClick={handleSaveLineup}
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all active:scale-98 disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '💾 保存阵容'}
        </button>
      </div>

      {showCardSelector && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md animate-fade-in">
          <div className="p-4 border-b border-slate-700 flex items-center gap-3">
            <button
              onClick={() => {
                setShowCardSelector(false);
                setSelectedPosition(null);
              }}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-white flex-1 text-center pr-10">
              选择卡牌 - {selectedPosition !== null ? positionNames[selectedPosition] : ''}
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {availableCards.length === 0 ? (
              <Empty
                icon="🃏"
                title="没有可用卡牌"
                description="所有卡牌都已在阵容中"
              />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleQuickSwap(card.id)}
                    className="cursor-pointer"
                  >
                    <CardItem
                      id={card.id}
                      name={card.template.name}
                      avatar={card.template.avatar}
                      rarity={card.template.rarity}
                      element={card.template.element}
                      type={card.template.type}
                      level={card.level}
                      combatPower={card.combatPower}
                      stars={card.stars}
                      showLevel={true}
                      showPower={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {lineupCards[selectedPosition!] && (
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={() => {
                  handleRemoveCard(selectedPosition!);
                  setShowCardSelector(false);
                  setSelectedPosition(null);
                }}
                className="w-full py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                🗑️ 移除当前卡牌
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LineupSlot({
  position,
  card,
  onClick,
  onRemove,
}: {
  position: number;
  card: any;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative group">
      <div
        onClick={onClick}
        className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
          card
            ? 'border-transparent'
            : 'border-slate-600 hover:border-indigo-500 bg-slate-800/50'
        }`}
      >
        {card ? (
          <div className={`w-full h-full rounded-xl bg-gradient-to-br ${rarityColors[card.template.rarity]} p-0.5`}>
            <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden relative">
              <img
                src={card.template.avatar}
                alt={card.template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/200/1e293b/94a3b8?text=${encodeURIComponent(card.template.name.charAt(0))}`;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <p className="text-white text-xs font-medium truncate">{card.template.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-xs">Lv.{card.level}</span>
                  <span className="text-yellow-400 text-xs">⚔️{formatShort(card.combatPower)}</span>
                </div>
              </div>
              <div className="absolute top-1 left-1 text-sm">
                {elementIcons[card.template.element]}
              </div>
            </div>
          </div>
        ) : (
          <>
            <span className="text-3xl text-slate-600">+</span>
            <span className="text-slate-500 text-xs mt-1">{positionNames[position]}</span>
          </>
        )}
      </div>
      {card && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
      <div className="text-center text-xs text-slate-500 mt-1">
        {positionNames[position]}
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

function formatShort(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toString();
}

function getElementName(element: Element): string {
  const names: Record<Element, string> = {
    [Element.FIRE]: '火',
    [Element.WATER]: '水',
    [Element.EARTH]: '土',
    [Element.WIND]: '风',
    [Element.LIGHT]: '光',
    [Element.DARK]: '暗',
  };
  return names[element] || element;
}

export default LineupPage;
