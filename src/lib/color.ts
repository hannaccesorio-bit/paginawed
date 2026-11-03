/**
 * Utilidades de color para el tema de la tienda.
 *
 * La paleta "primary" de Tailwind esta definida con variables CSS
 * (ver tailwind.config.ts y globals.css). Esto permite que el color
 * elegido en /admin se aplique a TODA la tienda sin recompilar.
 */

export type PrimaryScale = Record<
  '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  string
>;

/** Convierte un color hex (#rrggbb) a tripletas "r g b" para CSS. Devuelve null si es invalido. */
export function hexToTriplet(hex: string): string | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

/** Mezcla dos colores RGB (t = 0 devuelve c1, t = 1 devuelve c2). */
function mix(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

/**
 * Genera la escala completa 50-900 a partir del color principal (que
 * actua como tono 600, el que usan los botones). Los tonos claros se
 * mezclan con blanco y los oscuros con negro, igual que lo hace
 * Tailwind con sus paletas.
 */
export function buildPrimaryScale(hex: string): PrimaryScale | null {
  const triplet = hexToTriplet(hex);
  if (!triplet) return null;
  const [r, g, b] = triplet.split(' ').map(Number) as [number, number, number];
  const base: [number, number, number] = [r, g, b];
  const t = (c: [number, number, number]) => c.join(' ');
  return {
    '50': t(mix(base, WHITE, 0.92)),
    '100': t(mix(base, WHITE, 0.85)),
    '200': t(mix(base, WHITE, 0.72)),
    '300': t(mix(base, WHITE, 0.55)),
    '400': t(mix(base, WHITE, 0.35)),
    '500': t(mix(base, WHITE, 0.15)),
    '600': t(base),
    '700': t(mix(base, BLACK, 0.18)),
    '800': t(mix(base, BLACK, 0.32)),
    '900': t(mix(base, BLACK, 0.45)),
  };
}

/** Paleta de colores predefinidos que se ofrecen en /admin. */
export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Violeta suave', hex: '#8b5cf6' },
  { name: 'Lavanda', hex: '#a78bfa' },
  { name: 'Violeta intenso', hex: '#7c3aed' },
  { name: 'Morado', hex: '#9333ea' },
  { name: 'Fucsia', hex: '#d946ef' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Azul cielo', hex: '#3b82f6' },
  { name: 'Azul marino', hex: '#1e40af' },
  { name: 'Turquesa', hex: '#14b8a6' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Dorado', hex: '#d97706' },
  { name: 'Naranja (original)', hex: '#e0650f' },
];
