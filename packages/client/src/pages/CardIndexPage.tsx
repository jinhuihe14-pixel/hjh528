import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { Rarity, Element, CardType } from '@game/shared';
import CardItem from '../components/CardItem';
import Loading, { SkeletonList } from '../components/Loading';
import Empty from '../components/Empty';

const rarityOptions = [
  { value: '', label: '全部', color: 'bg-slate-600' },
  { value: Rarity.N, label: 'N', color: 'bg-gray-500' },
  { value: Rarity.R, label: 'R', color: 'bg-blue-500' },
  { value: Rarity.SR, label: 'SR', color: 'bg-purple-500' },
  { value: Rarity.SSR, label: 'SSR', color: 'bg-amber-500' },
  { value: Rarity.UR, label: 'UR', color: 'bg-red-500' },
];

const elementOptions = [
  { value: '', label: '全部', icon: '🎯' },
  { value: Element.FIRE, label: '火', icon: '🔥' },
  { value: Element.WATER, label: '水', icon: '💧' },
  { value: Element.EARTH, label: '土', icon: '🌍' },
  { value: Element.WIND, label: '风', icon: '🌪️' },
  { value: Element.LIGHT, label: '光', icon: '☀️' },
  { value: Element.DARK, label: '暗', icon: '🌙' },
];

const typeOptions = [
  { value: '', label: '全部' },
  { value: CardType.ATTACK, label: '攻击' },
  { value: CardType.DEFENSE, label: '防御' },
  { value: CardType.SUPPORT, label: '辅助' },
  { value: CardType.CONTROL, label: '控制' },
];

function CardIndexPage() {
  const navigate = useNavigate();
  const { templates, loading, fetchTemplates } = useCardStore();

  const [rarity, setRarity] = useState<string>('');
  const [element, setElement] = useState<string>('');
  const [cardType, setCardType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    const params: any = {};
    if (rarity) params.rarity = rarity;
    if (element) params.element = element;
    if (cardType) params.type = cardType;
    params.page = page;
    params.pageSize = pageSize;

    fetchTemplates(params);
  }, [rarity, element, cardType, page, fetchTemplates]);

  useEffect(() => {
    setPage(1);
  }, [rarity, element, cardType]);

  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const displayCards = templates;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-slate-400 text-sm flex-shrink-0">稀有度:</span>
            {rarityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRarity(option.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  rarity === option.value
                    ? `${option.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-slate-400 text-sm flex-shrink-0">元素:</span>
            {elementOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setElement(option.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm transition-all ${
                  element === option.value
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-400 text-sm flex-shrink-0">类型:</span>
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCardType(option.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm transition-all ${
                  cardType === option.value
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {loading && page === 1 ? (
          <SkeletonList count={6} />
        ) : displayCards.length === 0 ? (
          <Empty
            icon="🃏"
            title="暂无卡牌"
            description="没有找到符合条件的卡牌"
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {displayCards.map((card) => (
                <CardItem
                  key={card.id}
                  id={card.id}
                  name={card.name}
                  avatar={card.avatar}
                  rarity={card.rarity}
                  element={card.element}
                  type={card.type}
                  level={1}
                  combatPower={card.baseAttributes?.attack || 0}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </div>

            {displayCards.length >= pageSize && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="game-btn-secondary text-sm disabled:opacity-50"
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CardIndexPage;
