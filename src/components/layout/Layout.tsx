'use client';
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthProvider } from '@/contexts/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
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