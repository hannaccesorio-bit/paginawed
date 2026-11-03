'use client';
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteSettingsCloudSync } from '@/hooks/useSiteSettings';

export function Layout({ children }: { children: ReactNode }) {
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