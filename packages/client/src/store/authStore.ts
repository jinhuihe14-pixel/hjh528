import { create } from 'zustand';
import axios from 'axios';
import { Player, PlayerResource } from '@game/shared';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  player: Player | null;
  resources: PlayerResource | null;
  login: (username: string, password: string, serverId: string) => Promise<void>;
  register: (username: string, password: string, nickname: string, serverId: string) => Promise<void>;
  logout: () => void;
  setPlayer: (player: Player) => void;
  setResources: (resources: PlayerResource) => void;
  fetchPlayerInfo: () => Promise<void>;
}

const TOKEN_KEY = 'game_token';
const PLAYER_KEY = 'game_player';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  token: null,
  player: null,
  resources: null,

  login: async (username: string, password: string, serverId: string) => {
    const response = await axios.post('/api/auth/login', {
      username,
      password,
      serverId,
    });
    const { token, player } = response.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ isAuthenticated: true, token, player });
  },

  register: async (username: string, password: string, nickname: string, serverId: string) => {
    const response = await axios.post('/api/auth/register', {
      username,
      password,
      nickname,
      serverId,
    });
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PLAYER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    set({ isAuthenticated: false, token: null, player: null, resources: null });
  },

  setPlayer: (player: Player) => {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
    set({ player });
  },

  setResources: (resources: PlayerResource) => {
    set({ resources });
  },

  fetchPlayerInfo: async () => {
    try {
      const [playerRes, resourcesRes] = await Promise.all([
        axios.get('/api/players/info'),
        axios.get('/api/players/resources'),
      ]);
      set({
        player: playerRes.data.data,
        resources: resourcesRes.data.data,
      });
      localStorage.setItem(PLAYER_KEY, JSON.stringify(playerRes.data.data));
    } catch (error) {
      console.error('Failed to fetch player info:', error);
    }
  },
}));

export function initAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const playerStr = localStorage.getItem(PLAYER_KEY);
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const player = playerStr ? JSON.parse(playerStr) : null;
    useAuthStore.setState({
      isAuthenticated: true,
      token,
      player,
    });
  }
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
