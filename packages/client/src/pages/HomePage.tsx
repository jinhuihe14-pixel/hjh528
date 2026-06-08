import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuideStepType } from '@game/shared';
import { useAuthStore } from '../store/authStore';
import { useCardStore } from '../store/cardStore';
import NewbieGuide, { GuideStep } from '../components/NewbieGuide';
import StageWelfare, { WelfareStage } from '../components/StageWelfare';

const banners = [
  { id: 1, title: '新服开启', subtitle: '登录送SSR', gradient: 'from-purple-600 to-indigo-600', icon: '🎉' },
  { id: 2, title: '限时签到', subtitle: '每日好礼', gradient: 'from-amber-500 to-orange-500', icon: '�' },
  { id: 3, title: '成长福利', subtitle: '免费领取', gradient: 'from-emerald-500 to-teal-500', icon: '🎁' },
];

const menuItems = [
  { path: '/cards', icon: '🃏', label: '卡牌', color: 'from-purple-500 to-indigo-500' },
  { path: '/lineup', icon: '⚔️', label: '阵容', color: 'from-red-500 to-orange-500' },
  { path: '/stage', icon: '🗺️', label: '副本', color: 'from-blue-500 to-cyan-500' },
  { path: '/activities', icon: '🎁', label: '活动', color: 'from-amber-500 to-yellow-500', badge: '限时' },
  { path: '/inventory', icon: '🎒', label: '背包', color: 'from-green-500 to-emerald-500' },
  { path: '/arena', icon: '🏆', label: '竞技场', color: 'from-pink-500 to-rose-500' },
];

const newbieGuideSteps: GuideStep[] = [
  {
    id: 'guide_1',
    type: GuideStepType.DIALOG,
    title: '欢迎来到卡牌世界！',
    content: '你好，冒险者！欢迎来到这个充满魔法与冒险的世界。接下来我将带领你快速了解游戏玩法。',
  },
  {
    id: 'guide_2',
    type: GuideStepType.HIGHLIGHT,
    title: '查看卡牌',
    content: '点击卡牌按钮可以查看你拥有的所有卡牌，不同稀有度的卡牌拥有不同的能力。',
  },
  {
    id: 'guide_3',
    type: GuideStepType.TASK,
    title: '完成首次挑战',
    content: '前往副本挑战关卡，通关后可以获得丰厚奖励。完成首次挑战吧！',
    task: {
      type: 'stage_clear',
      target: 1,
      current: 1,
    },
  },
  {
    id: 'guide_4',
    type: GuideStepType.REWARD,
    title: '新手奖励',
    content: '恭喜你完成新手引导！这是你的新手奖励，助你在冒险之路上一帆风顺。',
    reward: {
      gold: 10000,
      diamond: 500,
      items: [
        { name: '初级经验药水', count: 10, icon: '🧪' },
        { name: '召唤券', count: 3, icon: '🎫' },
      ],
    },
  },
];

const welfareStages: WelfareStage[] = [
  {
    id: 'welfare_1',
    name: '初出茅庐',
    description: '达到3级即可领取新手礼包',
    condition: { type: 'level', value: 3 },
    current: 5,
    unlocked: true,
    claimed: true,
    reward: { gold: 5000, diamond: 100, items: [{ name: '初级经验药水', count: 5, icon: '🧪' }] },
  },
  {
    id: 'welfare_2',
    name: '小有成就',
    description: '通关5个关卡即可领取成长奖励',
    condition: { type: 'stage_cleared', value: 5 },
    current: 6,
    unlocked: true,
    claimed: false,
    reward: { gold: 10000, diamond: 200, items: [{ name: '突破石', count: 3, icon: '💎' }] },
  },
  {
    id: 'welfare_3',
    name: '登堂入室',
    description: '达到10级即可领取进阶奖励',
    condition: { type: 'level', value: 10 },
    current: 5,
    unlocked: false,
    claimed: false,
    reward: { gold: 20000, diamond: 300, items: [{ name: '高级经验药水', count: 5, icon: '🧪' }] },
  },
  {
    id: 'welfare_4',
    name: '身经百战',
    description: '通关15个关卡即可领取丰厚奖励',
    condition: { type: 'stage_cleared', value: 15 },
    current: 6,
    unlocked: false,
    claimed: false,
    reward: { gold: 30000, diamond: 500, items: [{ name: 'SSR召唤券', count: 1, icon: '🎫' }] },
  },
  {
    id: 'welfare_5',
    name: '登峰造极',
    description: '累计登录7天即可领取终极大礼',
    condition: { type: 'login_days', value: 7 },
    current: 3,
    unlocked: false,
    claimed: false,
    reward: { gold: 50000, diamond: 1000, items: [{ name: '随机SSR', count: 1, icon: '🌟' }] },
  },
];

function HomePage() {
  const navigate = useNavigate();
  const player = useAuthStore((state) => state.player);
  const resources = useAuthStore((state) => state.resources);
  const fetchPlayerInfo = useAuthStore((state) => state.fetchPlayerInfo);
  const playerCards = useCardStore((state) => state.playerCards);
  const fetchPlayerCards = useCardStore((state) => state.fetchPlayerCards);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [guideCompleted, setGuideCompleted] = useState<string[]>([]);
  const [guideRewardsClaimed, setGuideRewardsClaimed] = useState<string[]>([]);
  const [showWelfare, setShowWelfare] = useState(false);
  const [welfareData, setWelfareData] = useState(welfareStages);

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

  const handleGuideNext = () => {
    if (guideStep < newbieGuideSteps.length - 1) {
      const currentStepData = newbieGuideSteps[guideStep];
      if (!guideCompleted.includes(currentStepData.id)) {
        setGuideCompleted([...guideCompleted, currentStepData.id]);
      }
      setGuideStep(guideStep + 1);
    } else {
      const lastStep = newbieGuideSteps[newbieGuideSteps.length - 1];
      if (!guideCompleted.includes(lastStep.id)) {
        setGuideCompleted([...guideCompleted, lastStep.id]);
      }
      setShowGuide(false);
    }
  };

  const handleGuidePrev = () => {
    if (guideStep > 0) {
      setGuideStep(guideStep - 1);
    }
  };

  const handleClaimGuideReward = (stepId: string) => {
    if (!guideRewardsClaimed.includes(stepId)) {
      setGuideRewardsClaimed([...guideRewardsClaimed, stepId]);
    }
  };

  const handleClaimWelfare = (stageId: string) => {
    setWelfareData(prev =>
      prev.map(s =>
        s.id === stageId ? { ...s, claimed: true } : s
      )
    );
  };

  const hasUnclaimedWelfare = welfareData.some(s => s.unlocked && !s.claimed);

  return (
    <div className="p-4 space-y-4">
      <div className="relative rounded-2xl overflow-hidden h-36">
        <div className="absolute inset-0 flex transition-transform duration-500" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`min-w-full h-full bg-gradient-to-r ${banner.gradient} flex items-center justify-center relative cursor-pointer`}
              onClick={() => {
                if (banner.id === 2) setShowWelfare(true);
                else if (banner.id === 3) setShowWelfare(true);
                else setShowGuide(true);
              }}
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
          <button
            onClick={() => setShowGuide(true)}
            className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/30 transition-colors"
            title="新手引导"
          >
            ❓
          </button>
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

      {hasUnclaimedWelfare && (
        <button
          onClick={() => setShowWelfare(true)}
          className="w-full game-card p-4 flex items-center gap-3 hover:bg-slate-800/30 transition-colors animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl">
            🎁
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-white font-medium">成长福利待领取</h4>
            <p className="text-slate-400 text-sm">达成条件，领取丰厚奖励</p>
          </div>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            待领取
          </span>
        </button>
      )}

      <div className="game-card p-4">
        <h3 className="text-white font-bold mb-4">功能入口</h3>
        <div className="grid grid-cols-3 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 transition-all active:scale-95 group relative"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-slate-300 text-sm">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
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

      {showGuide && (
        <NewbieGuide
          steps={newbieGuideSteps}
          currentStep={guideStep}
          onNext={handleGuideNext}
          onPrev={handleGuidePrev}
          onClose={() => setShowGuide(false)}
          onClaimReward={handleClaimGuideReward}
          claimedRewards={guideRewardsClaimed}
          completedSteps={guideCompleted}
        />
      )}

      {showWelfare && (
        <StageWelfare
          stages={welfareData}
          onClaim={handleClaimWelfare}
          onClose={() => setShowWelfare(false)}
        />
      )}
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
