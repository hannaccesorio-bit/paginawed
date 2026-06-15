'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/catalogo?category=hombre', label: 'Hombre' },
  { href: '/catalogo?category=mujer', label: 'Mujer' },
  { href: '/catalogo?category=accesorios', label: 'Accesorios' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useCart((s) => s.getTotalItems());
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl text-primary-600 tracking-tight">
              ACCESORIOS HANNA
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={signOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link href="/carrito">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-600 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}