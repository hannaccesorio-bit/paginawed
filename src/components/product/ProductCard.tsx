'use client';
import Link from 'next/link';
import { ShoppingBag, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/types';
import { formatPrice, buildProductWhatsAppURL } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const favIds = useFavorites((s) => s.ids);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const { settings } = useSiteSettings();

  const isFavorite = favIds.includes(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;
  const imageUrl = product.images?.[0]?.url || '';

  // Inventario: 0 o menos = agotado; 1 a 5 = ultimas unidades
  const qty = product.inventory_quantity ?? 0;
  const soldOut = qty <= 0;
  const lowStock = !soldOut && qty <= 5;

  const handleWhatsApp = () => {
    const url = buildProductWhatsAppURL(
      product.name,
      product.price,
      settings.whatsapp,
      typeof window !== 'undefined' ? `${window.location.origin}/producto/${product.id}` : undefined
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative">
      <Link href={`/producto/${product.id}`} aria-label={product.name}>
        <div className={`aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-3 ${soldOut ? 'opacity-60' : ''}`}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="267" fill="%23f5f5f5"%3E%3Crect width="200" height="267"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3EReloj%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      </Link>

      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
        {hasDiscount && <Badge variant="danger">-{discount}%</Badge>}
        {soldOut && <Badge variant="secondary">Agotado</Badge>}
        {lowStock && <Badge variant="warning">¡Últimas unidades!</Badge>}
      </div>

      <button
        type="button"
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        onClick={() => toggleFavorite(product.id)}
        className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm transition-all md:opacity-0 md:group-hover:opacity-100 ${
          isFavorite ? 'opacity-100 text-red-500' : 'text-neutral-600 hover:text-red-500'
        }`}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {soldOut && (
        <div className="absolute inset-x-0 top-[35%] flex justify-center pointer-events-none">
          <span className="bg-neutral-900/80 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            Agotado
          </span>
        </div>
      )}

      <Link href={`/producto/${product.id}`}>
        <h3 className="font-medium text-sm text-neutral-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
      </Link>

      <div className="flex items-center gap-2">
        <span className="font-bold text-neutral-900">{formatPrice(product.price)}</span>
        {hasDiscount && (
          <span className="text-sm text-neutral-400 line-through">{formatPrice(product.compare_at_price!)}</span>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          className="flex-1"
          size="sm"
          disabled={soldOut}
          onClick={() => addItem(product)}
        >
          <ShoppingBag className="h-4 w-4" />
          {soldOut ? 'Agotado' : 'Agregar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Pedir por WhatsApp"
          className="px-3 border-green-600 text-green-700 hover:bg-green-50"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
