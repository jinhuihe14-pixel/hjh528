import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/cards', icon: '🃏', label: '卡牌' },
  { path: '/lineup', icon: '⚔️', label: '阵容' },
  { path: '/stage', icon: '🗺️', label: '副本' },
  { path: '/activities', icon: '🎁', label: '活动' },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              isActive(item.path)
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-2xl mb-0.5">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
