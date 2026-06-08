import { useAuthStore } from '../store/authStore';

function ResourceBar() {
  const player = useAuthStore((state) => state.player);
  const resources = useAuthStore((state) => state.resources);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {player?.nickname?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-white font-medium text-sm">{player?.nickname || '玩家'}</div>
            <div className="text-slate-400 text-xs">Lv.{player?.level || 1}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="text-lg">🪙</span>
            <span className="text-sm font-medium">
              {formatNumber(resources?.gold || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <span className="text-lg">💎</span>
            <span className="text-sm font-medium">
              {formatNumber(resources?.diamond || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-green-400">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium">
              {resources?.stamina || 0}
            </span>
          </div>
        </div>
      </div>
    </header>
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

export default ResourceBar;
