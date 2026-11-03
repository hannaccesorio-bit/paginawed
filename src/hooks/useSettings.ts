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
        // 1) A traves de nuestra propia API del servidor (sin CORS ni bloqueos)
        try {
          const res = await fetch('/api/tasa-bcv', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const rate = Number(data?.rate);
            if (data?.ok && rate > 0) {
              set({ exchangeRate: rate, lastUpdated: data.updatedAt || new Date().toISOString() });
              return true;
            }
          }
        } catch {
          // Continuar con el respaldo directo
        }
        // 2) Respaldo directo a dolarapi (ruta oficial corregida)
        try {
          const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' });
          const data = await res.json();
          const rate = parseFloat(data.promedio ?? data.venta);
          if (rate > 0) {
            set({ exchangeRate: rate, lastUpdated: data.fechaActualizacion || new Date().toISOString() });
            return true;
          }
        } catch {}
        return false;
      },
    }),
    { name: 'store-settings' }
  )
);
