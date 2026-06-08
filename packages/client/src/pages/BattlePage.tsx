import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BattleResult, BattleAction } from '@game/shared';
import Loading from '../components/Loading';

const mockBattleData = {
  battleId: 'battle_001',
  result: BattleResult.WIN,
  totalTurns: 12,
  playerPower: 125000,
  enemyPower: 98000,
  playerTeam: [
    { id: 'p1', name: '烈焰战士', avatar: '', element: 'fire', level: 50, power: 35000 },
    { id: 'p2', name: '冰霜法师', avatar: '', element: 'water', level: 48, power: 32000 },
    { id: 'p3', name: '大地守护', avatar: '', element: 'earth', level: 52, power: 28000 },
    { id: 'p4', name: '疾风刺客', avatar: '', element: 'wind', level: 45, power: 30000 },
  ],
  enemyTeam: [
    { id: 'e1', name: '暗影骑士', avatar: '', element: 'dark', level: 45, power: 28000 },
    { id: 'e2', name: '毒雾术士', avatar: '', element: 'dark', level: 42, power: 25000 },
    { id: 'e3', name: '骷髅战士', avatar: '', element: 'dark', level: 40, power: 22000 },
    { id: 'e4', name: '亡灵法师', avatar: '', element: 'dark', level: 44, power: 23000 },
  ],
  rewards: {
    exp: 5000,
    gold: 3000,
    items: [
      { name: '初级经验药水', count: 2, icon: '🧪' },
      { name: '突破石', count: 1, icon: '💎' },
    ],
  },
  actions: generateMockActions(),
};

function generateMockActions(): BattleAction[] {
  const actions: any[] = [];
  for (let i = 1; i <= 12; i++) {
    actions.push({
      turn: i,
      actionType: 'skill',
      sourceId: 'p1',
      sourceName: '烈焰战士',
      targetIds: ['e1'],
      targetNames: ['暗影骑士'],
      skillName: '烈焰斩',
      damage: 3500,
      isCrit: i % 3 === 0,
      log: `第${i}回合：烈焰战士对暗影骑士使用烈焰斩，造成3500点伤害${i % 3 === 0 ? '（暴击！）' : ''}`,
    });
    actions.push({
      turn: i,
      actionType: 'skill',
      sourceId: 'e1',
      sourceName: '暗影骑士',
      targetIds: ['p1'],
      targetNames: ['烈焰战士'],
      skillName: '暗影突刺',
      damage: 2200,
      isCrit: false,
      log: `第${i}回合：暗影骑士对烈焰战士使用暗影突刺，造成2200点伤害`,
    });
  }
  return actions;
}

const elementColors: Record<string, string> = {
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  earth: 'bg-amber-700',
  wind: 'bg-green-500',
  light: 'bg-yellow-400',
  dark: 'bg-indigo-600',
};

const elementIcons: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  wind: '🌪️',
  light: '☀️',
  dark: '🌙',
};

function BattlePage() {
  const navigate = useNavigate();
  const { battleId } = useParams<{ battleId: string }>();

  const [loading, setLoading] = useState(true);
  const [battleData, setBattleData] = useState<any>(null);
  const [expandedTurn, setExpandedTurn] = useState<number | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBattleData(mockBattleData);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [battleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  const isWin = battleData.result === BattleResult.WIN;

  const turns = Array.from(new Set(battleData.actions.map((a: any) => a.turn)));
  const displayTurns = showAllLogs ? turns : turns.slice(0, 5);

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
          战斗结果
        </h1>
      </div>

      <div className="p-4 space-y-4">
        <div className={`text-center py-8 rounded-2xl ${
          isWin
            ? 'bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent'
            : 'bg-gradient-to-b from-red-500/20 via-red-500/10 to-transparent'
        }`}>
          <div className={`text-6xl mb-3 ${isWin ? 'animate-bounce' : 'animate-pulse'}`}>
            {isWin ? '🏆' : '💔'}
          </div>
          <h2 className={`text-4xl font-bold mb-2 ${
            isWin
              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent'
              : 'text-red-400'
          }`}>
            {isWin ? '胜利！' : '失败...'}
          </h2>
          <p className="text-slate-400">
            战斗回合：{battleData.totalTurns}回合
          </p>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-4 text-center">⚔️ 战力对比</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <div className="text-blue-400 font-bold text-sm mb-1">我方</div>
              <div className="text-yellow-400 text-xl font-bold">
                {formatNumber(battleData.playerPower)}
              </div>
            </div>
            <div className="text-slate-500 text-2xl">VS</div>
            <div className="flex-1 text-center">
              <div className="text-red-400 font-bold text-sm mb-1">敌方</div>
              <div className="text-yellow-400 text-xl font-bold">
                {formatNumber(battleData.enemyPower)}
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
              style={{
                width: `${(battleData.playerPower / (battleData.playerPower + battleData.enemyPower)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-3">🛡️ 我方阵容</h3>
          <div className="grid grid-cols-4 gap-2">
            {battleData.playerTeam.map((unit: any) => (
              <UnitCard key={unit.id} unit={unit} side="player" />
            ))}
          </div>
        </div>

        <div className="game-card p-4">
          <h3 className="text-white font-bold mb-3">👹 敌方阵容</h3>
          <div className="grid grid-cols-4 gap-2">
            {battleData.enemyTeam.map((unit: any) => (
              <UnitCard key={unit.id} unit={unit} side="enemy" />
            ))}
          </div>
        </div>

        {isWin && (
          <div className="game-card p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">🎁</span>
              战斗奖励
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-yellow-400 font-bold text-lg">+{formatNumber(battleData.rewards.exp)}</div>
                <div className="text-slate-500 text-xs">经验</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-1">🪙</div>
                <div className="text-yellow-400 font-bold text-lg">+{formatNumber(battleData.rewards.gold)}</div>
                <div className="text-slate-500 text-xs">金币</div>
              </div>
            </div>

            {battleData.rewards.items.length > 0 && (
              <div>
                <h4 className="text-slate-400 text-sm mb-2">物品奖励</h4>
                <div className="grid grid-cols-4 gap-2">
                  {battleData.rewards.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-900/50 rounded-lg p-2 text-center"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-white text-xs truncate">{item.name}</div>
                      <div className="text-green-400 text-xs">×{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="game-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="text-lg">📜</span>
              战斗战报
            </h3>
            <button
              onClick={() => setShowAllLogs(!showAllLogs)}
              className="text-indigo-400 text-sm hover:text-indigo-300"
            >
              {showAllLogs ? '收起' : '展开全部'}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-auto">
            {displayTurns.map((turn) => {
              const turnActions = battleData.actions.filter((a: any) => a.turn === turn);
              const isExpanded = expandedTurn === turn;

              return (
                <div
                  key={turn}
                  className="bg-slate-900/50 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/50"
                    onClick={() => setExpandedTurn(isExpanded ? null : turn)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">第 {turn} 回合</span>
                      <span className="text-slate-500 text-sm">
                        ({turnActions.length}个动作)
                      </span>
                    </div>
                    <span className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-700/50">
                      {turnActions.map((action: any, idx: number) => (
                        <div
                          key={idx}
                          className="py-2 border-b border-slate-700/30 last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-slate-600 text-xs mt-0.5">
                              {idx + 1}.
                            </span>
                            <div className="flex-1">
                              <p className="text-slate-300 text-sm leading-relaxed">
                                {action.log}
                              </p>
                              {action.damage && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    action.isCrit
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-orange-500/20 text-orange-400'
                                  }`}>
                                    伤害: -{formatNumber(action.damage)}
                                  </span>
                                  {action.isCrit && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                      暴击！
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {!showAllLogs && turns.length > 5 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllLogs(true)}
                  className="text-slate-500 text-sm hover:text-slate-400"
                >
                  还有 {turns.length - 5} 回合记录，点击查看更多
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate('/stage')}
            className="py-4 game-btn-secondary"
          >
            🏠 返回
          </button>
          <button
            onClick={() => window.location.reload()}
            className="py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all active:scale-95"
          >
            🔄 再来一局
          </button>
        </div>
      </div>
    </div>
  );
}

function UnitCard({ unit, side }: { unit: any; side: 'player' | 'enemy' }) {
  return (
    <div className={`relative rounded-lg overflow-hidden ${
      side === 'player' ? 'ring-1 ring-blue-500/30' : 'ring-1 ring-red-500/30'
    }`}>
      <div className="aspect-square bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center">
        {unit.avatar ? (
          <img src={unit.avatar} alt={unit.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{elementIcons[unit.element] || '👤'}</span>
        )}
      </div>
      <div className={`absolute top-1 left-1 w-5 h-5 rounded-full ${elementColors[unit.element]} flex items-center justify-center text-xs`}>
        {elementIcons[unit.element]}
      </div>
      <div className="bg-black/60 p-1">
        <p className="text-white text-xs truncate text-center">{unit.name}</p>
        <div className="flex items-center justify-center gap-1 text-xs">
          <span className="text-slate-400">Lv.{unit.level}</span>
        </div>
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

export default BattlePage;
