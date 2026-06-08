import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityType } from '@game/shared';
import Empty from '../components/Empty';

const banners = [
  { id: 1, title: '限时召唤', subtitle: 'SSR概率UP！', gradient: 'from-purple-600 via-pink-500 to-red-500', icon: '🎴', type: ActivityType.GACHA },
  { id: 2, title: '七日登录', subtitle: '连签送UR', gradient: 'from-amber-500 via-orange-500 to-red-500', icon: '📅', type: ActivityType.SIGN_IN },
  { id: 3, title: '新手任务', subtitle: '完成领好礼', gradient: 'from-emerald-500 via-teal-500 to-cyan-500', icon: '📋', type: ActivityType.TASK },
];

const mockActivities = [
  {
    id: 'act_1',
    name: '每日签到',
    type: ActivityType.SIGN_IN,
    description: '每日登录领取丰厚奖励，连续签到7天可获得稀有卡牌！',
    icon: '📅',
    gradient: 'from-amber-500 to-orange-500',
    remainingTime: '今日可签',
    progress: 5,
    totalProgress: 7,
    status: 'active',
    rewards: [
      { day: 1, name: '金币', icon: '🪙', count: 1000, claimed: true },
      { day: 2, name: '钻石', icon: '💎', count: 50, claimed: true },
      { day: 3, name: '体力', icon: '⚡', count: 30, claimed: true },
      { day: 4, name: '经验药水', icon: '🧪', count: 5, claimed: true },
      { day: 5, name: '突破石', icon: '💎', count: 3, claimed: false, canClaim: true },
      { day: 6, name: '高级经验药水', icon: '🧪', count: 3, claimed: false },
      { day: 7, name: 'SSR随机卡', icon: '🎴', count: 1, claimed: false },
    ],
  },
  {
    id: 'act_2',
    name: '限时召唤',
    type: ActivityType.GACHA,
    description: '限定活动卡池，SSR概率大幅提升，不要错过！',
    icon: '🎴',
    gradient: 'from-purple-500 to-pink-500',
    remainingTime: '2天13小时',
    progress: 25,
    totalProgress: 100,
    status: 'active',
    featuredCard: '烈焰战神',
    featuredRarity: 'SSR',
    summonCount: 25,
    pityCount: 75,
  },
  {
    id: 'act_3',
    name: '新手任务',
    type: ActivityType.TASK,
    description: '完成新手任务，快速成长，领取超值奖励！',
    icon: '📋',
    gradient: 'from-emerald-500 to-teal-500',
    remainingTime: '永久',
    progress: 8,
    totalProgress: 12,
    status: 'active',
    tasks: [
      { id: 't1', name: '完成新手教程', reward: '金币x1000', completed: true, claimed: true },
      { id: 't2', name: '通关第1章', reward: '钻石x100', completed: true, claimed: true },
      { id: 't3', name: '升级任意卡牌到10级', reward: '经验药水x5', completed: true, claimed: true },
      { id: 't4', name: '首次抽卡', reward: '钻石x50', completed: true, claimed: true },
      { id: 't5', name: '完成阵容设置', reward: '突破石x2', completed: true, claimed: false, canClaim: true },
      { id: 't6', name: '通关第2章', reward: '钻石x200', completed: false },
      { id: 't7', name: '拥有5张卡牌', reward: '金币x5000', completed: true, claimed: false, canClaim: true },
      { id: 't8', name: '加入公会', reward: '公会币x100', completed: false },
    ],
  },
  {
    id: 'act_4',
    name: '节日庆典',
    type: ActivityType.FESTIVAL,
    description: '限时节日活动，参与活动收集道具兑换珍稀奖励！',
    icon: '🎉',
    gradient: 'from-red-500 via-pink-500 to-purple-500',
    remainingTime: '5天18小时',
    progress: 320,
    totalProgress: 500,
    status: 'active',
    festivalCoins: 320,
    exchangeItems: [
      { name: 'SSR随机卡', cost: 500, icon: '🎴' },
      { name: '突破石x10', cost: 200, icon: '💎' },
      { name: '高级经验药水x5', cost: 100, icon: '🧪' },
    ],
  },
  {
    id: 'act_5',
    name: '双倍掉落',
    type: ActivityType.LIMITED_TIME,
    description: '活动期间，副本掉落翻倍！快速收集材料吧！',
    icon: '✨',
    gradient: 'from-blue-500 to-cyan-500',
    remainingTime: '1天6小时',
    progress: 0,
    totalProgress: 0,
    status: 'active',
    bonus: '2x 副本掉落',
  },
  {
    id: 'act_6',
    name: '累计充值',
    type: ActivityType.TASK,
    description: '累计充值达到指定金额，领取豪华奖励！',
    icon: '💳',
    gradient: 'from-yellow-500 to-amber-500',
    remainingTime: '已结束',
    progress: 0,
    totalProgress: 0,
    status: 'ended',
  },
];

const activityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.SIGN_IN]: '签到',
  [ActivityType.TASK]: '任务',
  [ActivityType.GACHA]: '召唤',
  [ActivityType.LIMITED_TIME]: '限时',
  [ActivityType.FESTIVAL]: '节日',
};

function ActivityPage() {
  const navigate = useNavigate();

  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [claimedReward, setClaimedReward] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeActivities = mockActivities.filter(a => a.status === 'active');
  const endedActivities = mockActivities.filter(a => a.status === 'ended');

  const handleClaimReward = (activity: any, reward: any) => {
    setClaimedReward(reward);
    setTimeout(() => setClaimedReward(null), 1500);
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
          活动中心
        </h1>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          <div className="relative rounded-2xl overflow-hidden h-36">
            <div
              className="absolute inset-0 flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`min-w-full h-full bg-gradient-to-r ${banner.gradient} flex items-center justify-center relative cursor-pointer`}
                  onClick={() => {
                    const activity = mockActivities.find(a => a.type === banner.type);
                    if (activity) setSelectedActivity(activity);
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 flex items-center gap-4 px-6">
                    <span className="text-5xl animate-float">{banner.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                        {banner.title}
                      </h2>
                      <p className="text-white/80 text-sm">{banner.subtitle}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    立即参与 →
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
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              热门活动
            </h3>

            {activeActivities.length === 0 ? (
              <Empty icon="🎉" title="暂无活动" description="敬请期待精彩活动" />
            ) : (
              <div className="space-y-3">
                {activeActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => setSelectedActivity(activity)}
                  />
                ))}
              </div>
            )}
          </div>

          {endedActivities.length > 0 && (
            <div className="game-card p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-lg">📜</span>
                已结束
              </h3>
              <div className="space-y-3 opacity-60">
                {endedActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedActivity && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="game-card w-full max-w-lg max-h-[85vh] overflow-auto animate-slide-up sm:animate-scale-in sm:rounded-2xl rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 bg-gradient-to-r ${selectedActivity.gradient}`}>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedActivity.icon}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{selectedActivity.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white">
                      {activityTypeLabels[selectedActivity.type]}
                    </span>
                    <span className="text-white/80 text-sm">
                      {selectedActivity.remainingTime}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-slate-300 text-sm">{selectedActivity.description}</p>
              </div>

              {selectedActivity.type === ActivityType.SIGN_IN && selectedActivity.rewards && (
                <div>
                  <h4 className="text-white font-medium mb-3">签到奖励</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {selectedActivity.rewards.map((reward: any, index: number) => (
                      <div
                        key={reward.day}
                        className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-1 ${
                          reward.claimed
                            ? 'bg-slate-700/50'
                            : reward.canClaim
                            ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/50 animate-pulse cursor-pointer'
                            : 'bg-slate-800/50'
                        }`}
                        onClick={() => reward.canClaim && handleClaimReward(selectedActivity, reward)}
                      >
                        <span className="text-xs text-slate-400">第{reward.day}天</span>
                        <span className="text-xl my-1">{reward.icon}</span>
                        <span className="text-white text-xs">x{reward.count}</span>
                        {reward.claimed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <span className="text-green-400 text-xs">已领取</span>
                          </div>
                        )}
                        {reward.canClaim && !reward.claimed && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                            ！
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium"
                  >
                    📅 立即签到
                  </button>
                </div>
              )}

              {selectedActivity.type === ActivityType.GACHA && (
                <div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center mb-4">
                    <div className="text-slate-400 text-sm mb-1">本期UP角色</div>
                    <div className="text-3xl mb-2">🎴</div>
                    <div className="text-amber-400 font-bold">{selectedActivity.featuredCard}</div>
                    <div className="text-amber-500 text-xs">{selectedActivity.featuredRarity}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-white font-bold">{selectedActivity.summonCount}</div>
                      <div className="text-slate-500 text-xs">已召唤次数</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-purple-400 font-bold">{selectedActivity.pityCount}</div>
                      <div className="text-slate-500 text-xs">保底剩余</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 game-btn-secondary">
                      单抽 x1
                    </button>
                    <button className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium">
                      十连 x10
                    </button>
                  </div>
                </div>
              )}

              {selectedActivity.type === ActivityType.TASK && selectedActivity.tasks && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">任务列表</h4>
                    <span className="text-slate-400 text-sm">
                      {selectedActivity.tasks.filter((t: any) => t.completed).length}/{selectedActivity.tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {selectedActivity.tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          task.completed ? 'bg-green-500/10' : 'bg-slate-900/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          task.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-700 text-slate-500'
                        }`}>
                          {task.completed ? '✓' : '○'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{task.name}</p>
                          <p className="text-yellow-400 text-xs">奖励: {task.reward}</p>
                        </div>
                        {task.canClaim && !task.claimed ? (
                          <button
                            onClick={() => handleClaimReward(selectedActivity, task)}
                            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-xs font-medium animate-pulse"
                          >
                            领取
                          </button>
                        ) : task.claimed ? (
                          <span className="text-green-400 text-xs">已领取</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedActivity.type === ActivityType.FESTIVAL && (
                <div>
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-4 text-center mb-4">
                    <div className="text-3xl mb-2">🪙</div>
                    <div className="text-2xl font-bold text-yellow-400">{selectedActivity.festivalCoins}</div>
                    <div className="text-slate-400 text-sm">节日币</div>
                  </div>

                  <h4 className="text-white font-medium mb-3">兑换商店</h4>
                  <div className="space-y-2">
                    {selectedActivity.exchangeItems?.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-yellow-400 text-xs">🪙 {item.cost}</p>
                        </div>
                        <button
                          disabled={selectedActivity.festivalCoins < item.cost}
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          兑换
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedActivity.type === ActivityType.LIMITED_TIME && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">{selectedActivity.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{selectedActivity.name}</h3>
                  <p className="text-green-400 font-bold mb-4">{selectedActivity.bonus}</p>
                  <p className="text-slate-400 text-sm mb-6">
                    活动剩余时间: {selectedActivity.remainingTime}
                  </p>
                  <button
                    onClick={() => navigate('/stage')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium"
                  >
                    立即前往 →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {claimedReward && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-2">{claimedReward.icon || '🎁'}</div>
            <div className="text-yellow-400 font-bold text-xl">
              {claimedReward.name || '领取成功！'}
            </div>
            {claimedReward.count && (
              <div className="text-green-400">x{claimedReward.count}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity, onClick }: { activity: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden bg-slate-900/50 cursor-pointer transition-all hover:bg-slate-800/50 active:scale-98"
    >
      <div className="flex gap-3 p-3">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
          {activity.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium truncate">{activity.name}</h4>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              activity.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-600 text-slate-400'
            }`}>
              {activity.status === 'active' ? '进行中' : '已结束'}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{activity.description}</p>
          
          {activity.totalProgress > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">进度</span>
                <span className="text-slate-400">
                  {activity.progress}/{activity.totalProgress}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${activity.gradient} transition-all`}
                  style={{ width: `${(activity.progress / activity.totalProgress) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-slate-500 text-xs">{activity.remainingTime}</span>
            <span className="text-indigo-400 text-xs flex items-center gap-1">
              详情 <span>›</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
