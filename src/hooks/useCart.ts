import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, variantId) => {
        const existingItem = get().getItem(product.id, variantId);
        if (existingItem) {
          get().updateQuantity(existingItem.id, existingItem.quantity + quantity);
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variantId || 'default'}-${Date.now()}`,
            product_id: product.id,
            product,
            quantity,
            variant_id: variantId || null,
            added_at: new Date().toISOString(),
          };
          set({ items: [...get().items, newItem] });
        }
        get().openCart();
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      getItem: (productId, variantId) =>
        get().items.find(
          (item) => item.product_id === productId && item.variant_id === variantId
        ),
    }),
    { name: 'cart-storage' }
  )
);