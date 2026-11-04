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

/** Quita acentos y pasa a minusculas (para busquedas). */
export function normalizeText(text: string) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Convierte un telefono venezolano escrito de cualquier forma a formato internacional (58...). */
export function whatsappNumber(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = '58' + digits.slice(1);
  return digits;
}

/** Link de WhatsApp con mensaje precargado para pedir un producto. */
export function buildProductWhatsAppURL(
  productName: string,
  price: number,
  rawNumber: string,
  productUrl?: string
): string {
  const num = whatsappNumber(rawNumber) || '5804140000000';
  const msg =
    `Hola Accesorios Hanna, me interesa este producto:\n` +
    `*${productName}* - ${formatPrice(price)}\n` +
    (productUrl ? `${productUrl}\n` : '') +
    `¿Esta disponible?`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
