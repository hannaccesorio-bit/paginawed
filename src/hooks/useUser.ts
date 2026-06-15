import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Address, WishlistItem } from '@/types';
import { createClient } from '@/lib/supabase';

interface UserState {
  user: User | null;
  addresses: Address[];
  wishlist: WishlistItem[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateAddress: (id: string, data: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string, type: 'shipping' | 'billing') => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      wishlist: [],
      isLoading: false,

      setUser: (user) => set({ user }),

      updateProfile: async (data) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user.id);

        if (!error) {
          set({ user: { ...get().user!, ...data } });
        }
      },

      addAddress: async (address) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: newAddress, error } = await supabase
          .from('addresses')
          .insert({ ...address, user_id: user.id })
          .select()
          .single();

        if (!error && newAddress) {
          set({ addresses: [...get().addresses, newAddress] });
        }
      },

      updateAddress: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase
          .from('addresses')
          .update(data)
          .eq('id', id);

        if (!error) {
          set({
            addresses: get().addresses.map((a) =>
              a.id === id ? { ...a, ...data } : a
            ),
          });
        }
      },

      deleteAddress: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('addresses').delete().eq('id', id);
        if (!error) {
          set({ addresses: get().addresses.filter((a) => a.id !== id) });
        }
      },

      setDefaultAddress: async (id, type) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', type);

        await supabase.from('addresses').update({ is_default: true }).eq('id', id);

        set({
          addresses: get().addresses.map((a) =>
            a.id === id ? { ...a, is_default: true } : a.type === type ? { ...a, is_default: false } : a
          ),
        });
      },

      addToWishlist: async (productId) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId })
          .select()
          .single();

        if (!error && data) {
          set({ wishlist: [...get().wishlist, data] });
        }
      },

      removeFromWishlist: async (productId) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (!error) {
          set({ wishlist: get().wishlist.filter((w) => w.product_id !== productId) });
        }
      },

      isInWishlist: (productId) =>
        get().wishlist.some((w) => w.product_id === productId),

      fetchWishlist: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('wishlist')
          .select('*, products(*)')
          .eq('user_id', user.id);

        if (data) set({ wishlist: data });
      },

      fetchAddresses: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (data) set({ addresses: data });
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, addresses: [], wishlist: [] });
      },
    }),
    { name: 'user-storage', partialize: (state) => ({ user: state.user }) }
  )
);