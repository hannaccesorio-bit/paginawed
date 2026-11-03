'use client';
import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase';

export interface SiteSettings {
  // Contacto
  phone1: string;
  phone2: string;
  email: string;
  whatsapp: string;

  // Ubicacion
  address: string;
  city: string;
  state: string;
  country: string;
  mapUrl: string;

  // Horarios
  hoursWeek: string;
  hoursSaturday: string;
  hoursSunday: string;

  // Redes sociales
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;

  // Mision y Vision
  mission: string;
  vision: string;

  // Colores de marca
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Banner Promo inferior
  promoTitle: string;
  promoSubtitle: string;
  promoButtonText: string;
  promoButtonLink: string;
  promoBgColor: string;
}

interface SiteSettingsState {
  settings: SiteSettings;
  updateSettings: (partial: Partial<SiteSettings>) => void;
}

const defaultSettings: SiteSettings = {
  phone1: '+58 414 000 0000',
  phone2: '',
  email: 'hannaccesorio@gmail.com',
  whatsapp: '+58 414 000 0000',
  address: 'Av. Urdaneta, Caracas',
  city: 'Caracas',
  state: 'Distrito Capital',
  country: 'Venezuela',
  mapUrl: '',
  hoursWeek: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
  hoursSaturday: 'Sabado: 9:00 AM - 2:00 PM',
  hoursSunday: 'Domingo: Cerrado',
  facebook: '',
  instagram: '',
  tiktok: '',
  twitter: '',
  youtube: '',
  mission: 'Ofrecer a nuestros clientes relojes y accesorios de la mas alta calidad, con un servicio al cliente excepcionales y precios competitivos.',
  vision: 'Ser la tienda de relojes y accesorios de referencia en Venezuela, reconocida por la calidad de nuestros productos y la satisfaccion de nuestros clientes.',
  primaryColor: '#e0650f',
  secondaryColor: '#1e40af',
  accentColor: '#166534',
  promoTitle: 'Envio Gratis en Compras +$50.00',
  promoSubtitle: 'Aprovecha nuestra promocion por tiempo limitado. Envio sin costo a toda Venezuela.',
  promoButtonText: 'Comprar Ahora',
  promoButtonLink: '/catalogo',
  promoBgColor: '#e0650f',
};

export const SITE_SETTINGS_TABLE = 'site_settings';

export const useSiteSettings = create<SiteSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (partial) => {
        set((state) => {
          const merged = { ...state.settings, ...partial };
          // Guardar tambien en la nube (si hay sesion de administrador y la
          // tabla site_settings existe; si no, queda solo en este dispositivo).
          (async () => {
            try {
              const supabase = createClient();
              const { data } = await supabase.auth.getSession();
              if (!data?.session?.user) return;
              await supabase
                .from(SITE_SETTINGS_TABLE)
                .upsert({ id: 1, data: merged, updated_at: new Date().toISOString() });
            } catch {
              // sin sesion o tabla inexistente: se conserva solo lo local
            }
          })();
          return { settings: merged };
        });
      },
    }),
    { name: 'site-settings' }
  )
);

/**
 * Montar una sola vez: descarga la configuracion guardada en la nube
 * (si existe) para que la tienda se vea igual en cualquier dispositivo.
 * Si la tabla todavia no existe, sigue funcionando con lo local.
 */
export function SiteSettingsCloudSync() {
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .select('data')
          .eq('id', 1)
          .single();
        if (error || !data?.data) return;
        const cloud = data.data as Partial<SiteSettings>;
        if (cloud && typeof cloud === 'object' && Object.keys(cloud).length > 0) {
          useSiteSettings.setState((state) => ({
            settings: { ...state.settings, ...cloud },
          }));
        }
      } catch {
        // tabla inexistente o sin conexion: continuar con lo local
      }
    })();
  }, []);
  return null;
}
