import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCardStore } from '../store/cardStore';

const banners = [
  { id: 1, title: '新服开启', subtitle: '登录送SSR', gradient: 'from-purple-600 to-indigo-600', icon: '🎉' },
  { id: 2, title: '限时活动', subtitle: '双倍掉落', gradient: 'from-amber-500 to-orange-500', icon: '🔥' },
  { id: 3, title: '新手礼包', subtitle: '免费领取', gradient: 'from-emerald-500 to-teal-500', icon: '🎁' },
];

const menuItems = [
  { path: '/cards', icon: '🃏', label: '卡牌', color: 'from-purple-500 to-indigo-500' },
  { path: '/lineup', icon: '⚔️', label: '阵容', color: 'from-red-500 to-orange-500' },
  { path: '/stage', icon: '🗺️', label: '副本', color: 'from-blue-500 to-cyan-500' },
  { path: '/activities', icon: '🎁', label: '活动', color: 'from-amber-500 to-yellow-500' },
  { path: '/inventory', icon: '🎒', label: '背包', color: 'from-green-500 to-emerald-500' },
  { path: '/arena', icon: '🏆', label: '竞技场', color: 'from-pink-500 to-rose-500' },
];

function HomePage() {
  const navigate = useNavigate();
  const player = useAuthStore((state) => state.player);
  const resources = useAuthStore((state) => state.resources);
  const fetchPlayerInfo = useAuthStore((state) => state.fetchPlayerInfo);
  const playerCards = useCardStore((state) => state.playerCards);
  const fetchPlayerCards = useCardStore((state) => state.fetchPlayerCards);

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    fetchPlayerInfo();
    fetchPlayerCards();
  }, [fetchPlayerInfo, fetchPlayerCards]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const totalPower = playerCards.reduce((sum, card) => sum + (card.combatPower || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <div className="relative rounded-2xl overflow-hidden h-36">
        <div className="absolute inset-0 flex transition-transform duration-500" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`min-w-full h-full bg-gradient-to-r ${banner.gradient} flex items-center justify-center relative`}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 flex items-center gap-4 px-6">
                <span className="text-5xl animate-float">{banner.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">{banner.title}</h2>
                  <p className="text-white/80 text-sm">{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBanner ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="game-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
              {player?.nickname?.charAt(0) || '?'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Lv.{player?.level || 1}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{player?.nickname || '玩家'}</h3>
            <p className="text-slate-400 text-sm">ID: {player?.id?.slice(0, 8) || '--------'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400 text-sm">⚔️ 战力: {formatNumber(totalPower || player?.combatPower || 0)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-yellow-400 text-lg">🪙</div>
            <div className="text-yellow-400 font-bold text-sm">{formatNumber(resources?.gold || 0)}</div>
            <div className="text-slate-500 text-xs">金币</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-blue-400 text-lg">💎</div>
            <div className="text-blue-400 font-bold text-sm">{formatNumber(resources?.diamond || 0)}</div>
            <div className="text-slate-500 text-xs">钻石</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-green-400 text-lg">⚡</div>
            <div className="text-green-400 font-bold text-sm">{resources?.stamina || 0}</div>
            <div className="text-slate-500 text-xs">体力</div>
          </div>
        </div>
      </div>

      <div className="game-card p-4">
        <h3 className="text-white font-bold mb-4">功能入口</h3>
        <div className="grid grid-cols-3 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 transition-all active:scale-95 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-slate-300 text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="game-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">我的卡牌</h3>
          <button
            onClick={() => navigate('/cards')}
            className="text-indigo-400 text-sm hover:text-indigo-300"
          >
            查看全部 →
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {playerCards.length > 0 ? (
            playerCards.slice(0, 5).map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(`/cards/${card.id}`)}
                className="flex-shrink-0 w-20 cursor-pointer"
              >
                <div className={`aspect-square rounded-lg bg-gradient-to-br rarity-bg-${card.template.rarity} p-0.5`}>
                  <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={card.template.avatar}
                      alt={card.template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/100/1e293b/94a3b8?text=${encodeURIComponent(card.template.name.charAt(0))}`;
                      }}
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-slate-300 mt-1 truncate">{card.template.name}</p>
                <p className="text-center text-xs text-yellow-400">Lv.{card.level}</p>
              </div>
            ))
          ) : (
            <div className="w-full py-4 text-center text-slate-500 text-sm">
              暂无卡牌，快去抽取吧
            </div>
          )}
        </div>
      </div>

      <div className="game-card p-6">
        <button
          onClick={() => navigate('/stage')}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all active:scale-98 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-2xl">⚔️</span>
            快速开始
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

export default HomePage;
