import { create } from 'zustand';
import { fetchMarkets, Market } from './api';

interface MarketsState {
  markets: Market[];
  status: 'idle' | 'loading' | 'success' | 'error' | 'refreshing';
  error: string | null;
  sortBy: 'biggest_mover' | 'volume' | 'end_date';
  setSortBy: (sort: 'biggest_mover' | 'volume' | 'end_date') => void;
  loadMarkets: (isRefresh?: boolean) => Promise<void>;
}

export const useMarketsStore = create<MarketsState>((set, get) => ({
  markets: [],
  status: 'idle',
  error: null,
  sortBy: 'biggest_mover',
  
  setSortBy: (sort) => {
    set({ sortBy: sort });
  },
  
  loadMarkets: async (isRefresh = false) => {
    set({ status: isRefresh ? 'refreshing' : 'loading', error: null });
    try {
      const data = await fetchMarkets();
      set({ markets: data, status: 'success' });
    } catch (e: any) {
      set({ status: 'error', error: e.message || 'Failed to fetch markets' });
    }
  }
}));


