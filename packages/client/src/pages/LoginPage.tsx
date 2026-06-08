import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type TabType = 'login' | 'register';

const servers = [
  { id: 's1', name: '1服 - 创世之地' },
  { id: 's2', name: '2服 - 风暴之巅' },
  { id: 's3', name: '3服 - 暗影森林' },
];

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [serverId, setServerId] = useState('s1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(username, password, serverId);
        navigate('/home');
      } else {
        await register(username, password, nickname, serverId);
        setActiveTab('login');
        setError('注册成功，请登录');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
            幻域战纪
          </h1>
          <p className="text-slate-400 text-sm">开启你的冒险之旅</p>
        </div>

        <div className="game-card p-6">
          <div className="flex mb-6 bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              注册
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="game-input"
                placeholder="请输入用户名"
                required
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="game-input"
                  placeholder="请输入昵称"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="game-input"
                placeholder="请输入密码"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">选择服务器</label>
              <select
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                className="game-input appearance-none cursor-pointer"
              >
                {servers.map((server) => (
                  <option key={server.id} value={server.id} className="bg-slate-800">
                    {server.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full game-btn-primary py-3 text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  处理中...
                </span>
              ) : (
                activeTab === 'login' ? '立即登录' : '立即注册'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-center text-slate-400 text-xs">
              {activeTab === 'login' ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-indigo-400 hover:text-indigo-300 ml-1 transition-colors"
              >
                {activeTab === 'login' ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
