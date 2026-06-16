import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  exchangeRate: number;
  lastUpdated: string | null;
  setExchangeRate: (rate: number) => void;
  fetchBCVRate: () => Promise<boolean>;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      exchangeRate: 36.50,
      lastUpdated: null,

      setExchangeRate: (rate: number) => {
        set({ exchangeRate: rate, lastUpdated: new Date().toISOString() });
      },

      fetchBCVRate: async () => {
        try {
          const res = await fetch('https://pydolarve.org/api/v1/dollar', { cache: 'no-store' });
          const data = await res.json();
          if (data && data.dollar && data.dollar.price) {
            const rate = parseFloat(data.dollar.price);
            if (rate > 0) {
              set({ exchangeRate: rate, lastUpdated: new Date().toISOString() });
              return true;
            }
          }
        } catch {
          // Intentar con otra API
          try {
            const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficiales', { cache: 'no-store' });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const rate = parseFloat(data[0].promedio || data[0].venta);
              if (rate > 0) {
                set({ exchangeRate: rate, lastUpdated: new Date().toISOString() });
                return true;
              }
            }
          } catch {}
        }
        return false;
      },
    }),
    { name: 'store-settings' }
  )
);
