'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Heart, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProductById, formatPrice } from '@/lib/products';
import { useCart } from '@/hooks/useCart';

export default function ProductPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Producto no encontrado</h1>
        <Link href="/catalogo">
          <Button>Volver al Catálogo</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.map(i => i.url) || [];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/catalogo" className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver al Catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-4">
            <img
              src={images[selectedImage] || ''}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="533" fill="%23f5f5f5"%3E%3Crect width="400" height="533"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="16" fill="%23999" text-anchor="middle" dy=".3em"%3EReloj%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {hasDiscount && <Badge variant="danger" className="mb-2">-{discount}%</Badge>}

          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-neutral-900">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-lg text-neutral-400 line-through">{formatPrice(product.compare_at_price!)}</span>
            )}
          </div>

          {product.description && (
            <p className="text-neutral-600 mb-6">{product.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-neutral-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-neutral-50 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-neutral-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => addItem(product, quantity)}
            >
              <ShoppingBag className="h-5 w-5" />
              Agregar al Carrito
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium">Envío Gratis</p>
                <p className="text-xs text-neutral-500">En compras +$150.000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium">Garantía de 1 Año</p>
                <p className="text-xs text-neutral-500">En todos nuestros productos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium">Devolución Gratis</p>
                <p className="text-xs text-neutral-500">Dentro de los primeros 30 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}