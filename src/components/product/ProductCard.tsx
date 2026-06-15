'use client';
import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;
  const imageUrl = product.images?.[0]?.url || '';

  return (
    <div className="group relative">
      <Link href={`/producto/${product.id}`}>
        <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-3">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="267" fill="%23f5f5f5"%3E%3Crect width="200" height="267"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3EReloj%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      </Link>

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {hasDiscount && <Badge variant="danger">-{discount}%</Badge>}
      </div>

      <button className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
        <Heart className="h-4 w-4 text-neutral-600" />
      </button>

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

      <Button
        className="w-full mt-3"
        size="sm"
        onClick={() => addItem(product)}
      >
        <ShoppingBag className="h-4 w-4" />
        Agregar al Carrito
      </Button>
    </div>
  );
}