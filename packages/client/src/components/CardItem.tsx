import { Rarity, Element, CardType } from '@game/shared';

export interface CardItemProps {
  id: string;
  name: string;
  avatar: string;
  rarity: Rarity;
  element?: Element;
  type?: CardType;
  level?: number;
  combatPower?: number;
  stars?: number;
  onClick?: () => void;
  className?: string;
  showLevel?: boolean;
  showPower?: boolean;
}

const rarityColors: Record<Rarity, string> = {
  [Rarity.N]: 'from-gray-500 to-gray-400',
  [Rarity.R]: 'from-blue-600 to-blue-400',
  [Rarity.SR]: 'from-purple-600 to-purple-400',
  [Rarity.SSR]: 'from-amber-500 to-yellow-400',
  [Rarity.UR]: 'from-red-600 via-orange-500 to-yellow-400',
};

const rarityGlow: Record<Rarity, string> = {
  [Rarity.N]: '',
  [Rarity.R]: 'shadow-blue-500/30',
  [Rarity.SR]: 'shadow-purple-500/40',
  [Rarity.SSR]: 'shadow-amber-500/50',
  [Rarity.UR]: 'shadow-red-500/60',
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

function CardItem({
  name,
  avatar,
  rarity,
  element,
  level = 1,
  combatPower = 0,
  stars = 0,
  onClick,
  className = '',
  showLevel = true,
  showPower = true,
}: CardItemProps) {
  const isUR = rarity === Rarity.UR;
  const isSSR = rarity === Rarity.SSR;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        isUR || isSSR ? `shadow-lg ${rarityGlow[rarity]}` : ''
      } ${className}`}
    >
      {isUR && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-red-500/20 animate-pulse-slow pointer-events-none"></div>
      )}

      <div className={`relative p-0.5 rounded-xl bg-gradient-to-br ${rarityColors[rarity]}`}>
        <div className="bg-slate-900 rounded-lg overflow-hidden">
          <div className="relative aspect-square bg-gradient-to-b from-slate-800 to-slate-900">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x200/1e293b/94a3b8?text=${encodeURIComponent(name.charAt(0))}`;
              }}
            />

            {element && (
              <div className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full ${elementColors[element]} flex items-center justify-center text-xs shadow-md`}>
                {elementIcons[element]}
              </div>
            )}

            {showLevel && (
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-xs font-medium text-white">
                Lv.{level}
              </div>
            )}

            {stars > 0 && (
              <div className="absolute top-1.5 right-1.5 flex">
                {Array.from({ length: stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xs drop-shadow-lg">★</span>
                ))}
              </div>
            )}
          </div>

          <div className="p-2">
            <div className={`text-sm font-medium text-center truncate bg-gradient-to-r ${rarityColors[rarity]} bg-clip-text text-transparent`}>
              {name}
            </div>

            {showPower && combatPower > 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-yellow-400 text-xs">⚔️</span>
                <span className="text-yellow-400 text-xs font-medium">{formatNumber(combatPower)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isUR && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          <div className="absolute -inset-full top-0 h-full w-1/3 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toString();
}

export default CardItem;
