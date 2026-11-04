'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Heart, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductGrid } from '@/components/product/ProductGrid';
import { formatPrice, buildProductWhatsAppURL } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Product } from '@/types';

export default function ProductContent() {
  const params = useParams();
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const favIds = useFavorites((s) => s.ids);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const { settings } = useSiteSettings();

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    setLoading(true);
    setQuantity(1);
    setSelectedImage(0);
    setRelated([]);
    const { data } = await supabase.from('products').select('*').eq('id', params.id).single();
    setProduct(data as Product | null);
    setLoading(false);
    loadRelated(data as Product | null);
  };

  const loadRelated = async (current: Product | null) => {
    if (!current) return;
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .neq('id', current.id)
      .limit(4);
    if (current.category_id) {
      query = query.eq('category_id', current.category_id);
    } else if (current.department_id) {
      query = query.eq('department_id', current.department_id);
    }
    const { data } = await query;
    const list = ((data as Product[]) || []).filter((p) => p.id !== current.id).slice(0, 4);
    setRelated(list);
  };

  const isFavorite = product ? favIds.includes(product.id) : false;

  const handleWhatsApp = () => {
    if (!product) return;
    const url = buildProductWhatsAppURL(
      product.name,
      product.price,
      settings.whatsapp,
      typeof window !== 'undefined' ? `${window.location.origin}/producto/${product.id}` : undefined
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Producto no encontrado</h1>
        <Link href="/catalogo">
          <Button>Volver al Catalogo</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.map(i => i.url) || [];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  // Inventario: 0 o menos = agotado; 1 a 5 = ultimas unidades
  const qty = product.inventory_quantity ?? 0;
  const soldOut = qty <= 0;
  const lowStock = !soldOut && qty <= 5;
  const maxQty = soldOut ? 1 : Math.max(1, Math.min(qty, 99));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/catalogo" className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver al Catalogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <div className={`aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-4 ${soldOut ? 'opacity-60' : ''}`}>
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
          <div className="flex gap-2 mb-2">
            {hasDiscount && <Badge variant="danger">-{discount}%</Badge>}
            {soldOut && <Badge variant="secondary">Agotado</Badge>}
            {lowStock && <Badge variant="warning">¡Últimas unidades! ({qty})</Badge>}
          </div>

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

          {!soldOut && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-neutral-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-neutral-50 transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className="p-3 hover:bg-neutral-50 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {qty > 0 && qty <= 20 && (
                <span className="text-xs text-neutral-400">Solo {qty} disponibles</span>
              )}
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <Button
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={() => addItem(product, quantity)}
            >
              <ShoppingBag className="h-5 w-5" />
              {soldOut ? 'Agotado' : 'Agregar al Carrito'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className={`px-4 ${isFavorite ? 'border-red-300 text-red-500 bg-red-50' : ''}`}
              onClick={() => toggleFavorite(product.id)}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full mb-8 border-green-600 text-green-700 hover:bg-green-50"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-5 w-5" />
            {soldOut ? 'Preguntar por este producto' : 'Pedir por WhatsApp'}
          </Button>

          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium">Envío Gratis</p>
                <p className="text-xs text-neutral-500">En compras +$50. <Link href="/pagos-envios" className="text-primary-600 hover:underline">Ver pagos y envios</Link></p>
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

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">También te puede gustar</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
