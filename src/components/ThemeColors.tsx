'use client';
import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { buildPrimaryScale } from '@/lib/color';

/**
 * Aplica el color principal elegido en /admin a toda la tienda.
 * Sobrescribe las variables --p-50..900 del :root, de las que depende
 * la paleta "primary" de Tailwind (botones, enlaces, iconos, etc.).
 * Se monta una sola vez en el Layout.
 */
export function ThemeColors() {
  const primaryColor = useSiteSettings((s) => s.settings.primaryColor);

  useEffect(() => {
    const scale = buildPrimaryScale(primaryColor);
    if (!scale) return;
    const root = document.documentElement;
    for (const [step, value] of Object.entries(scale)) {
      root.style.setProperty(`--p-${step}`, value);
    }
  }, [primaryColor]);

  return null;
}
