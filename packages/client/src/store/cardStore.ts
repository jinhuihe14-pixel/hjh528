import { create } from 'zustand';
import axios from 'axios';
import { CardWithTemplate, CardTemplate, PlayerLineup } from '@game/shared';

interface CardState {
  templates: CardTemplate[];
  playerCards: CardWithTemplate[];
  lineup: (string | null)[];
  currentCard: CardWithTemplate | null;
  loading: boolean;
  fetchTemplates: (params?: any) => Promise<void>;
  fetchPlayerCards: (params?: any) => Promise<void>;
  fetchLineup: () => Promise<void>;
  setLineup: (lineupData: { position: number; cardId: string | null }[]) => Promise<void>;
  setCurrentCard: (card: CardWithTemplate | null) => void;
  upgradeCard: (cardId: string, targetLevel: number) => Promise<void>;
  breakthroughCard: (cardId: string, costCardIds: string[]) => Promise<void>;
}

export const useCardStore = create<CardState>((set, get) => ({
  templates: [],
  playerCards: [],
  lineup: [null, null, null, null, null, null],
  currentCard: null,
  loading: false,

  fetchTemplates: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/cards/templates', { params });
      set({ templates: response.data.data.list });
    } catch (error) {
      console.error('Failed to fetch card templates:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchPlayerCards: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/cards', { params });
      set({ playerCards: response.data.data.list });
    } catch (error) {
      console.error('Failed to fetch player cards:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchLineup: async () => {
    try {
      const response = await axios.get('/api/cards/lineup');
      const data = response.data.data;
      const lineup = Array(6).fill(null);
      if (data && data.cards) {
        data.cards.forEach((item: any) => {
          if (item && item.position !== undefined) {
            lineup[item.position] = item.cardId || item.id;
          }
        });
      }
      set({ lineup });
    } catch (error) {
      console.error('Failed to fetch lineup:', error);
    }
  },

  setLineup: async (lineupData) => {
    try {
      const cards = lineupData.map(item => ({
        position: item.position,
        cardId: item.cardId,
      }));
      await axios.post('/api/cards/lineup', { cards });
      await get().fetchLineup();
    } catch (error) {
      console.error('Failed to set lineup:', error);
      throw error;
    }
  },

  setCurrentCard: (card) => {
    set({ currentCard: card });
  },

  upgradeCard: async (cardId: string, targetLevel: number) => {
    try {
      await axios.post('/api/cards/upgrade', { cardId, targetLevel });
      await get().fetchPlayerCards();
    } catch (error) {
      console.error('Failed to upgrade card:', error);
      throw error;
    }
  },

  breakthroughCard: async (cardId: string, costCardIds: string[]) => {
    try {
      await axios.post('/api/cards/breakthrough', { cardId, costCardIds });
      await get().fetchPlayerCards();
    } catch (error) {
      console.error('Failed to breakthrough card:', error);
      throw error;
    }
  },
}));
