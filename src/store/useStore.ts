import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coin, PortfolioItem } from '../types/crypto';

interface StoreState {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  favoriteCoins: string[];
  portfolio: PortfolioItem[];
  toggleFavorite: (coinId: string) => void;
  addToPortfolio: (coin: Coin, quantity: number, buyPrice: number) => void;
  removeFromPortfolio: (id: string) => void;
  updatePortfolioItem: (id: string, quantity: number, buyPrice: number) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      darkMode: false,
      setDarkMode: (darkMode) => set({ darkMode }),
      favoriteCoins: [],
      portfolio: [],
      toggleFavorite: (coinId) =>
        set((state) => ({
          favoriteCoins: state.favoriteCoins.includes(coinId)
            ? state.favoriteCoins.filter((id) => id !== coinId)
            : [...state.favoriteCoins, coinId],
        })),
      addToPortfolio: (coin, quantity, buyPrice) =>
        set((state) => ({
          portfolio: [
            ...state.portfolio,
            {
              id: `${coin.id}-${Date.now()}`,
              coin,
              quantity,
              buyPrice,
            },
          ],
        })),
      removeFromPortfolio: (id) =>
        set((state) => ({
          portfolio: state.portfolio.filter((item) => item.id !== id),
        })),
      updatePortfolioItem: (id, quantity, buyPrice) =>
        set((state) => ({
          portfolio: state.portfolio.map((item) =>
            item.id === id ? { ...item, quantity, buyPrice } : item
          ),
        })),
    }),
    {
      name: 'crypto-tracker-storage',
    }
  )
); 