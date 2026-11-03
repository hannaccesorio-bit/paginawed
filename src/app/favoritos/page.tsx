'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { useFavorites } from '@/hooks/useFavorites';
import { Product } from '@/types';

export default function FavoritosPage() {
  const favIds = useFavorites((s) => s.ids);
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si la clienta quita un favorito desde esta pagina, sacarlo de la vista
  useEffect(() => {
    setProducts((prev) => prev.filter((p) => favIds.includes(p.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favIds]);

  const loadFavorites = async () => {
    setLoading(true);
    const ids = useFavorites.getState().ids;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', ids)
      .eq('status', 'active');
    const list = (data as Product[]) || [];
    // Mantener el orden en que la clienta guardo los favoritos
    list.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    setProducts(list);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
          Mis Favoritos
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {products.length > 0 ? `${products.length} productos guardados en este dispositivo` : 'Guarda tus productos tocando el corazoncito'}
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-neutral-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            {loading ? 'Cargando...' : 'Aun no tienes favoritos'}
          </h2>
          {!loading && (
            <>
              <p className="text-neutral-500 text-sm mb-6">
                Cuando veas un producto que te guste, toca el corazoncito para guardarlo aqui.
              </p>
              <Link href="/catalogo">
                <Button>Ver Catalogo</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
