import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Layout } from '@/components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://tienda-relojes-henna.vercel.app'
  ),
  title: {
    default: 'Accesorios Hanna - Tienda de Relojes y Accesorios',
    template: '%s | Accesorios Hanna',
  },
  description:
    'Relojes y accesorios de moda en Venezuela. Paga con Pago Movil, Zelle o Binance y recibe en todo el pais.',
  keywords: [
    'relojes',
    'accesorios',
    'relojes hombre',
    'relojes mujer',
    'Venezuela',
    'Caracas',
    'cadenas',
    'pulseras',
    'anillos',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    siteName: 'Accesorios Hanna',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
