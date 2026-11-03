import type { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase-server';

const BASE =
  process.env.NEXT_PUBLIC_APP_URL || 'https://tienda-relojes-henna.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/pagos-envios`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/login`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('status', 'active')
      .limit(1000);
    const productRoutes: MetadataRoute.Sitemap = (data || []).map((p) => ({
      url: `${BASE}/producto/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    // Si la base de datos no responde, al menos entregar las rutas fijas
    return staticRoutes;
  }
}
