'use client';
import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const getSubtotal = useCart((s) => s.getSubtotal);
  const getTotalItems = useCart((s) => s.getTotalItems);

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const shipping = subtotal >= 150000 ? 0 : 15000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-neutral-500 mb-6">Agrega productos para comenzar tu compra.</p>
        <Link href="/catalogo">
          <Button>Ver Catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Carrito de Compras</h1>
        <span className="text-neutral-500">{totalItems} productos</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imageUrl = item.product.images?.[0]?.url || '';
            return (
              <div key={item.id} className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
                <div className="w-24 h-32 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="128" fill="%23f5f5f5"%3E%3Crect width="96" height="128"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="10" fill="%23999" text-anchor="middle" dy=".3em"%3EReloj%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 truncate">{item.product.name}</h3>
                  <p className="font-bold text-neutral-900 mt-2">{formatPrice(item.product.price)}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-neutral-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-neutral-50 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-neutral-50 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-neutral-50 rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-neutral-900 mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Envío</span>
                <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg">
              Proceder al Pago
            </Button>
            <Link href="/catalogo" className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-600 hover:text-primary-600">
              <ArrowLeft className="h-4 w-4" />
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}