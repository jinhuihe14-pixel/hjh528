import { useState } from 'react';

export interface WelfareStage {
  id: string;
  name: string;
  description: string;
  condition: {
    type: 'level' | 'stage_cleared' | 'login_days';
    value: number;
  };
  current: number;
  unlocked: boolean;
  claimed: boolean;
  reward: {
    gold?: number;
    diamond?: number;
    items?: { name: string; count: number; icon: string }[];
  };
}

interface StageWelfareProps {
  stages: WelfareStage[];
  onClaim: (stageId: string) => void;
  onClose: () => void;
}

const conditionLabels: Record<string, string> = {
  level: '达到等级',
  stage_cleared: '通关关卡',
  login_days: '累计登录',
};

const conditionUnits: Record<string, string> = {
  level: '级',
  stage_cleared: '关',
  login_days: '天',
};

function StageWelfare({ stages, onClaim, onClose }: StageWelfareProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<WelfareStage | null>(null);

  const handleClaim = (stage: WelfareStage) => {
    if (stage.unlocked && !stage.claimed) {
      onClaim(stage.id);
      setShowRewardModal(stage);
      setTimeout(() => setShowRewardModal(null), 2000);
    }
  };

  const totalStages = stages.length;
  const claimedStages = stages.filter(s => s.claimed).length;
  const progress = (claimedStages / totalStages) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="game-card max-w-md w-full max-h-[80vh] flex flex-col animate-scale-in">
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
          >
            ←
          </button>
          <h2 className="text-lg font-bold text-white flex-1 text-center pr-10">
            🎁 成长福利
          </h2>
        </div>

        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">整体进度</span>
            <span className="text-amber-400 font-medium text-sm">
              {claimedStages}/{totalStages}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`p-4 rounded-xl transition-all cursor-pointer ${
                stage.claimed
                  ? 'bg-green-500/10 border border-green-500/30'
                  : stage.unlocked
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800/50 border border-slate-700 opacity-60'
              }`}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  stage.claimed
                    ? 'bg-green-500/30'
                    : stage.unlocked
                    ? 'bg-amber-500/30'
                    : 'bg-slate-700'
                }`}>
                  {stage.claimed ? '✅' : stage.unlocked ? '🎁' : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{stage.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-300">
                      第{index + 1}阶段
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5 truncate">
                    {stage.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-slate-400">
                      {conditionLabels[stage.condition.type]}:
                    </span>
                    <span className={`font-medium ${
                      stage.unlocked ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {Math.min(stage.current, stage.condition.value)}/{stage.condition.value}
                      {conditionUnits[stage.condition.type]}
                    </span>
                  </div>
                </div>

                <div className="text-slate-500">
                  {selectedStage === stage.id ? '▲' : '▼'}
                </div>
              </div>

              {selectedStage === stage.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h5 className="text-amber-300 text-sm font-medium mb-3">奖励内容</h5>
                  <div className="flex gap-4 flex-wrap">
                    {stage.reward.gold && stage.reward.gold > 0 && (
                      <div className="text-center">
                        <div className="text-2xl mb-1">🪙</div>
                        <div className="text-yellow-400 text-sm font-bold">
                          {stage.reward.gold}
                        </div>
                      </div>
                    )}
                    {stage.reward.diamond && stage.reward.diamond > 0 && (
                      <div className="text-center">
                        <div className="text-2xl mb-1">💎</div>
                        <div className="text-blue-400 text-sm font-bold">
                          {stage.reward.diamond}
                        </div>
                      </div>
                    )}
                    {stage.reward.items?.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="text-white text-xs">{item.name}</div>
                        <div className="text-green-400 text-xs">x{item.count}</div>
                      </div>
                    ))}
                  </div>

                  {stage.unlocked && !stage.claimed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaim(stage);
                      }}
                      className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all"
                    >
                      🎁 领取奖励
                    </button>
                  )}

                  {stage.claimed && (
                    <div className="mt-4 text-center text-green-400 font-medium">
                      ✓ 已领取
                    </div>
                  )}

                  {!stage.unlocked && (
                    <div className="mt-4 text-center text-slate-500 text-sm">
                      继续努力，达成条件即可领取
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showRewardModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="game-card p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-2">{showRewardModal.name}</h3>
            <p className="text-slate-400 mb-4">奖励领取成功！</p>
            <div className="flex justify-center gap-4">
              {showRewardModal.reward.gold && showRewardModal.reward.gold > 0 && (
                <div className="text-center">
                  <div className="text-3xl mb-1">🪙</div>
                  <div className="text-yellow-400 font-bold">
                    +{showRewardModal.reward.gold}
                  </div>
                </div>
              )}
              {showRewardModal.reward.diamond && showRewardModal.reward.diamond > 0 && (
                <div className="text-center">
                  <div className="text-3xl mb-1">💎</div>
                  <div className="text-blue-400 font-bold">
                    +{showRewardModal.reward.diamond}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StageWelfare;
