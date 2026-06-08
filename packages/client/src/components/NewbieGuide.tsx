import { useState } from 'react';
import { GuideStepType } from '@game/shared';

export interface GuideStep {
  id: string;
  type: GuideStepType;
  title: string;
  content: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  reward?: {
    gold?: number;
    diamond?: number;
    items?: { name: string; count: number; icon: string }[];
  };
  task?: {
    type: string;
    target: number;
    current: number;
  };
}

interface NewbieGuideProps {
  steps: GuideStep[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onClaimReward?: (stepId: string) => void;
  claimedRewards?: string[];
  completedSteps?: string[];
}

function NewbieGuide({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
  onClaimReward,
  claimedRewards = [],
  completedSteps = [],
}: NewbieGuideProps) {
  const step = steps[currentStep];

  if (!step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const isCompleted = completedSteps.includes(step.id);
  const isRewardClaimed = claimedRewards.includes(step.id);
  const hasReward = step.reward && Object.values(step.reward).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v > 0
  );

  const handleClaim = () => {
    if (onClaimReward && hasReward && !isRewardClaimed) {
      onClaimReward(step.id);
    }
  };

  const renderStepContent = () => {
    switch (step.type) {
      case GuideStepType.DIALOG:
        return (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-300 leading-relaxed">{step.content}</p>
          </div>
        );

      case GuideStepType.HIGHLIGHT:
        return (
          <div className="text-center py-4">
            <div className="text-6xl mb-4 animate-pulse">👆</div>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-300 leading-relaxed mb-4">{step.content}</p>
            <div className="inline-block px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-lg text-indigo-300 text-sm">
              点击此处继续
            </div>
          </div>
        );

      case GuideStepType.TASK:
        const progress = step.task
          ? Math.min((step.task.current / step.task.target) * 100, 100)
          : 0;
        const taskCompleted = step.task ? step.task.current >= step.task.target : false;

        return (
          <div className="py-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300">{step.content}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">任务进度</span>
                <span className={`text-sm font-medium ${
                  taskCompleted ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {step.task?.current || 0}/{step.task?.target || 0}
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    taskCompleted
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {taskCompleted && (
                <div className="mt-3 text-center text-green-400 text-sm font-medium">
                  ✓ 任务已完成
                </div>
              )}
            </div>
          </div>
        );

      case GuideStepType.REWARD:
        return (
          <div className="py-4">
            <div className="text-center mb-4">
              <div className={`text-6xl mb-2 ${isRewardClaimed ? '' : 'animate-bounce'}`}>
                {isRewardClaimed ? '✅' : '🎁'}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300">{step.content}</p>
            </div>

            {hasReward && (
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-4">
                <h4 className="text-center text-amber-300 font-medium mb-3">奖励内容</h4>
                <div className="flex justify-center gap-4 flex-wrap">
                  {step.reward?.gold && step.reward.gold > 0 && (
                    <div className="text-center">
                      <div className="text-3xl mb-1">🪙</div>
                      <div className="text-yellow-400 font-bold">
                        +{step.reward.gold}
                      </div>
                    </div>
                  )}
                  {step.reward?.diamond && step.reward.diamond > 0 && (
                    <div className="text-center">
                      <div className="text-3xl mb-1">💎</div>
                      <div className="text-blue-400 font-bold">
                        +{step.reward.diamond}
                      </div>
                    </div>
                  )}
                  {step.reward?.items?.map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-3xl mb-1">{item.icon}</div>
                      <div className="text-white text-sm">{item.name}</div>
                      <div className="text-green-400 text-xs">x{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isRewardClaimed ? (
              <div className="text-center text-green-400 font-medium">
                ✓ 奖励已领取
              </div>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all"
              >
                🎁 领取奖励
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="game-card p-6 max-w-md w-full relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentStep
                  ? 'bg-green-500 w-6'
                  : idx === currentStep
                  ? 'bg-amber-500 w-6'
                  : 'bg-slate-600 w-2'
              }`}
            ></div>
          ))}
        </div>

        <div className="min-h-[280px]">
          {renderStepContent()}
        </div>

        <div className="flex gap-3 mt-4">
          {!isFirst && step.type !== GuideStepType.REWARD && (
            <button
              onClick={onPrev}
              className="flex-1 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
            >
              上一步
            </button>
          )}

          {step.type !== GuideStepType.REWARD && (
            <button
              onClick={onNext}
              className={`flex-1 py-3 rounded-xl text-white font-medium transition-all ${
                isLast
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30'
              } active:scale-95`}
            >
              {isLast ? '完成' : '下一步'}
            </button>
          )}

          {step.type === GuideStepType.REWARD && isRewardClaimed && (
            <button
              onClick={onNext}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-green-500/30 active:scale-95 transition-all"
            >
              {isLast ? '完成' : '下一步'}
            </button>
          )}
        </div>

        <div className="text-center mt-3 text-xs text-slate-500">
          第 {currentStep + 1} 步 / 共 {steps.length} 步
        </div>
      </div>
    </div>
  );
}

export default NewbieGuide;
