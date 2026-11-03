'use client';
import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteSettingsCloudSync } from '@/hooks/useSiteSettings';
import { useSettings } from '@/hooks/useSettings';

const RATE_CHECK_KEY = 'bcv-rate-checked-at';
const RATE_CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12 horas

export function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Refresca la tasa del BCV automaticamente, maximo una vez cada 12h por dispositivo
    try {
      const last = Number(localStorage.getItem(RATE_CHECK_KEY) || 0);
      if (Date.now() - last < RATE_CHECK_INTERVAL) return;
      localStorage.setItem(RATE_CHECK_KEY, String(Date.now()));
      useSettings.getState().fetchBCVRate();
    } catch {
      // Si localStorage falla, continuar sin bloquear la pagina
    }
  }, []);

  return (
    <AuthProvider>
      <SiteSettingsCloudSync />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}