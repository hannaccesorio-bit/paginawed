import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

/**
 * Favoritos guardados en el dispositivo del visitante (localStorage).
 * No requiere cuenta: cualquier clienta puede guardar sus productos.
 */
export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        })),
      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'hanna-favorites' }
  )
);
