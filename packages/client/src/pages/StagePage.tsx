import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StageType } from '@game/shared';
import Loading from '../components/Loading';
import Empty from '../components/Empty';

const mockChapters = [
  {
    id: 'chap_1',
    name: '序章：觉醒之地',
    description: '冒险的起点，踏上成为最强卡牌师的道路',
    requiredLevel: 1,
    totalStages: 6,
    clearedStages: 6,
    totalStars: 18,
    earnedStars: 18,
    unlocked: true,
    reward: { gold: 10000, diamond: 100, items: [{ name: '初级经验药水', count: 5, icon: '🧪' }] },
    rewardClaimed: true,
    stages: [
      { id: 'stage_1_1', name: '新手试炼', level: 1, staminaCost: 5, stars: 3, maxStars: 3, type: StageType.NORMAL, recommendedPower: 1000, cleared: true, firstClear: true },
      { id: 'stage_1_2', name: '森林入口', level: 3, staminaCost: 5, stars: 3, maxStars: 3, type: StageType.NORMAL, recommendedPower: 2000, cleared: true, firstClear: true },
      { id: 'stage_1_3', name: '哥布林营地', level: 5, staminaCost: 6, stars: 3, maxStars: 3, type: StageType.NORMAL, recommendedPower: 3500, cleared: true, firstClear: true },
      { id: 'stage_1_4', name: '幽暗洞穴', level: 7, staminaCost: 6, stars: 3, maxStars: 3, type: StageType.NORMAL, recommendedPower: 5000, cleared: true, firstClear: true },
      { id: 'stage_1_5', name: '精英守卫', level: 10, staminaCost: 10, stars: 3, maxStars: 3, type: StageType.ELITE, recommendedPower: 8000, cleared: true, firstClear: true },
      { id: 'stage_1_6', name: '森林之王', level: 12, staminaCost: 15, stars: 3, maxStars: 3, type: StageType.BOSS, recommendedPower: 12000, cleared: true, firstClear: true },
    ],
  },
  {
    id: 'chap_2',
    name: '第一章：火焰山脉',
    description: '炙热的火焰山脉，蕴含着强大的火元素力量',
    requiredLevel: 10,
    totalStages: 8,
    clearedStages: 4,
    totalStars: 24,
    earnedStars: 12,
    unlocked: true,
    reward: { gold: 30000, diamond: 300, items: [{ name: '突破石', count: 3, icon: '💎' }] },
    rewardClaimed: false,
    stages: [
      { id: 'stage_2_1', name: '山脚营地', level: 15, staminaCost: 8, stars: 3, maxStars: 3, type: StageType.NORMAL, recommendedPower: 15000, cleared: true, firstClear: true },
      { id: 'stage_2_2', name: '熔岩小径', level: 18, staminaCost: 8, stars: 3, maxStars: 3, type: StageType.NORMAL, recommendedPower: 20000, cleared: true, firstClear: true },
      { id: 'stage_2_3', name: '火焰精灵', level: 20, staminaCost: 10, stars: 2, maxStars: 3, type: StageType.NORMAL, recommendedPower: 28000, cleared: true, firstClear: true },
      { id: 'stage_2_4', name: '火山口', level: 22, staminaCost: 10, stars: 1, maxStars: 3, type: StageType.NORMAL, recommendedPower: 35000, cleared: true, firstClear: true },
      { id: 'stage_2_5', name: '精英炎魔', level: 25, staminaCost: 15, stars: 0, maxStars: 3, type: StageType.ELITE, recommendedPower: 50000, cleared: false, firstClear: false },
      { id: 'stage_2_6', name: '熔岩深处', level: 28, staminaCost: 12, stars: 0, maxStars: 3, type: StageType.HARD, recommendedPower: 60000, cleared: false, firstClear: false },
      { id: 'stage_2_7', name: '火焰神殿', level: 30, staminaCost: 12, stars: 0, maxStars: 3, type: StageType.HARD, recommendedPower: 70000, cleared: false, firstClear: false },
      { id: 'stage_2_8', name: '火焰领主', level: 32, staminaCost: 20, stars: 0, maxStars: 3, type: StageType.BOSS, recommendedPower: 90000, cleared: false, firstClear: false },
    ],
  },
  {
    id: 'chap_3',
    name: '第二章：冰封雪原',
    description: '终年积雪的冰封雪原，神秘的冰元素等待探索',
    requiredLevel: 25,
    totalStages: 8,
    clearedStages: 0,
    totalStars: 24,
    earnedStars: 0,
    unlocked: false,
    reward: { gold: 50000, diamond: 500, items: [{ name: '高级经验药水', count: 3, icon: '🧪' }] },
    rewardClaimed: false,
    stages: [
      { id: 'stage_3_1', name: '雪原入口', level: 30, staminaCost: 12, stars: 0, maxStars: 3, type: StageType.NORMAL, recommendedPower: 80000, cleared: false, firstClear: false },
      { id: 'stage_3_2', name: '冰晶森林', level: 32, staminaCost: 12, stars: 0, maxStars: 3, type: StageType.NORMAL, recommendedPower: 95000, cleared: false, firstClear: false },
      { id: 'stage_3_3', name: '冰冻湖泊', level: 35, staminaCost: 15, stars: 0, maxStars: 3, type: StageType.NORMAL, recommendedPower: 110000, cleared: false, firstClear: false },
      { id: 'stage_3_4', name: '雪怪部落', level: 38, staminaCost: 15, stars: 0, maxStars: 3, type: StageType.NORMAL, recommendedPower: 130000, cleared: false, firstClear: false },
      { id: 'stage_3_5', name: '精英冰魔', level: 40, staminaCost: 20, stars: 0, maxStars: 3, type: StageType.ELITE, recommendedPower: 160000, cleared: false, firstClear: false },
      { id: 'stage_3_6', name: '冰窟深处', level: 42, staminaCost: 18, stars: 0, maxStars: 3, type: StageType.HARD, recommendedPower: 180000, cleared: false, firstClear: false },
      { id: 'stage_3_7', name: '冰封神殿', level: 45, staminaCost: 18, stars: 0, maxStars: 3, type: StageType.HARD, recommendedPower: 200000, cleared: false, firstClear: false },
      { id: 'stage_3_8', name: '冰霜女王', level: 48, staminaCost: 25, stars: 0, maxStars: 3, type: StageType.BOSS, recommendedPower: 250000, cleared: false, firstClear: false },
    ],
  },
];

const stageTypeLabels: Record<StageType, string> = {
  [StageType.NORMAL]: '普通',
  [StageType.HARD]: '困难',
  [StageType.ELITE]: '精英',
  [StageType.BOSS]: 'BOSS',
};

const stageTypeColors: Record<StageType, string> = {
  [StageType.NORMAL]: 'bg-green-500/20 text-green-400',
  [StageType.HARD]: 'bg-purple-500/20 text-purple-400',
  [StageType.ELITE]: 'bg-orange-500/20 text-orange-400',
  [StageType.BOSS]: 'bg-red-500/20 text-red-400',
};

function StagePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState(mockChapters);
  const [expandedChapter, setExpandedChapter] = useState<string | null>('chap_2');
  const [showRewardModal, setShowRewardModal] = useState<any>(null);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const handleStartBattle = (stageId: string) => {
    navigate(`/battle/${stageId}`);
  };

  const handleClaimReward = (chapter: any) => {
    setChapters(prev =>
      prev.map(c =>
        c.id === chapter.id ? { ...c, rewardClaimed: true } : c
      )
    );
    setShowRewardModal(chapter);
    setTimeout(() => setShowRewardModal(null), 2000);
  };

  const canClaimReward = (chapter: any) => {
    return chapter.unlocked && !chapter.rewardClaimed && chapter.earnedStars >= chapter.totalStars * 0.5;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

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
          副本挑战
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chapters.map((chapter) => {
          const isExpanded = expandedChapter === chapter.id;
          const progress = (chapter.clearedStages / chapter.totalStages) * 100;

          return (
            <div
              key={chapter.id}
              className={`game-card overflow-hidden transition-all ${
                chapter.unlocked ? '' : 'opacity-60'
              }`}
            >
              <div
                className={`p-4 cursor-pointer ${
                  isExpanded ? 'border-b border-slate-700' : ''
                }`}
                onClick={() => chapter.unlocked && toggleChapter(chapter.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                    chapter.unlocked
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-slate-700'
                  }`}>
                    {chapter.unlocked ? '🗺️' : '🔒'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold truncate">{chapter.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        chapter.unlocked
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-600 text-slate-400'
                      }`}>
                        {chapter.unlocked ? '已解锁' : `需${chapter.requiredLevel}级`}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                      {chapter.description}
                    </p>

                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">
                          进度: {chapter.clearedStages}/{chapter.totalStages}
                        </span>
                        <span className="text-yellow-400">
                          ⭐ {chapter.earnedStars}/{chapter.totalStars}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {chapter.unlocked && (
                    <div className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  )}
                </div>

                {canClaimReward(chapter) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimReward(chapter);
                    }}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white text-sm font-medium animate-pulse"
                  >
                    🎁 领取章节奖励
                  </button>
                )}
              </div>

              {isExpanded && chapter.unlocked && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 gap-3">
                    {chapter.stages.map((stage: any, index: number) => {
                      const canChallenge = index === 0 || chapter.stages[index - 1]?.cleared;
                      return (
                        <StageItem
                          key={stage.id}
                          stage={stage}
                          index={index}
                          canChallenge={canChallenge}
                          onStart={() => handleStartBattle(stage.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="game-card p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-4">奖励领取成功！</h3>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">🪙</div>
                <div className="text-yellow-400 font-bold">+{showRewardModal.reward.gold}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">💎</div>
                <div className="text-blue-400 font-bold">+{showRewardModal.reward.diamond}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StageItem({ stage, index, canChallenge, onStart }: { stage: any; index: number; canChallenge: boolean; onStart: () => void }) {
  return (
    <div className={`p-3 rounded-xl ${
      stage.cleared
        ? 'bg-slate-900/50'
        : canChallenge
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
          : 'bg-slate-900/30 opacity-50'
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${
            stage.type === StageType.BOSS
              ? 'bg-gradient-to-br from-red-500 to-orange-500'
              : stage.type === StageType.ELITE
              ? 'bg-gradient-to-br from-orange-500 to-amber-500'
              : stage.type === StageType.HARD
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}>
            {stage.type === StageType.BOSS && '👹'}
            {stage.type === StageType.ELITE && '💀'}
            {stage.type === StageType.HARD && '⭐'}
            {stage.type === StageType.NORMAL && '⚔️'}
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-xs text-white font-bold border border-slate-600">
            {index + 1}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium truncate">{stage.name}</h4>
            <span className={`text-xs px-1.5 py-0.5 rounded ${stageTypeColors[stage.type]}`}>
              {stageTypeLabels[stage.type]}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span>Lv.{stage.level}</span>
            <span className="text-green-400">⚡ {stage.staminaCost}</span>
            <span className="text-yellow-400">⚔️ {formatNumber(stage.recommendedPower)}</span>
          </div>

          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: stage.maxStars }).map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < stage.stars ? 'text-yellow-400' : 'text-slate-600'
                }`}
              >
                ★
              </span>
            ))}
            {stage.firstClear && (
              <span className="ml-2 text-xs text-green-400">首通 ✓</span>
            )}
          </div>
        </div>

        <button
          onClick={onStart}
          disabled={!canChallenge && !stage.cleared}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            stage.cleared
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : canChallenge
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/30 active:scale-95'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {stage.cleared ? '再战' : '挑战'}
        </button>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toString();
}

export default StagePage;
