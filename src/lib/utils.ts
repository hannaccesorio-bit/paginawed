import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPriceBS(price: number, rate?: number) {
  const bs = price * (rate || 36.50);
  return `Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getExchangeRate(): number {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('store-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.state?.exchangeRate || 36.50;
      }
    } catch {}
  }
  return 36.50;
}

export function formatDate(date: string | Date, locale = 'es-VE') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
