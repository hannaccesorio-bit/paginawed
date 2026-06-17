import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useSiteSettings = create<SiteSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },
    }),
    { name: 'site-settings' }
  )
);
