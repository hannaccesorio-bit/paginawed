import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Layout } from '@/components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Accesorios Hanna - Tienda de Relojes y Accesorios',
  description: 'Tu tienda de confianza en relojes y accesorios de moda.',
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