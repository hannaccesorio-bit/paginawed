import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase-server';
import ProductContent from './content';

type Props = {
  params: Promise<{ id: string }>;
};

interface ProductMetaRow {
  name: string;
  short_description: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  images: { url: string }[] | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('products')
      .select('name, short_description, description, seo_title, seo_description, images, price')
      .eq('id', id)
      .single();
    if (!data) {
      return { title: 'Producto no encontrado' };
    }
    const row = data as unknown as ProductMetaRow;
    const title = row.seo_title || row.name;
    const description =
      row.seo_description ||
      row.short_description ||
      (row.description || '').slice(0, 160) ||
      'Relojes y accesorios de moda. Accesorios Hanna.';
    const image = row.images?.[0]?.url;
    return {
      title,
      description,
      alternates: { canonical: `/producto/${id}` },
      openGraph: {
        title,
        description,
        type: 'website',
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: 'Producto' };
  }
}

export default function ProductPage() {
  return <ProductContent />;
}
