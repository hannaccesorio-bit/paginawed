'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, FileText, MessageCircle, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/hooks/useCart';
import { formatPrice, formatPriceBS, getExchangeRate } from '@/lib/utils';
import { generateInvoicePDF, downloadPDF, generateWhatsAppMessage, generateWhatsAppURL, CustomerData } from '@/lib/invoice';

export default function CartPage() {
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const updateItemExtras = useCart((s) => s.updateItemExtras);
  const clearCart = useCart((s) => s.clearCart);
  const getSubtotal = useCart((s) => s.getSubtotal);
  const getTotalItems = useCart((s) => s.getTotalItems);

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState<CustomerData>({
    name: '', cedula: '', email: '', phone: '', address: '', city: '', department: '', company: '', shipping_company: '', notes: '',
  });

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;
  const currentRate = getExchangeRate();

  const updateField = (field: keyof CustomerData, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = () => {
    const num = `AH-${Date.now().toString().slice(-6)}`;
    setOrderNumber(num);

    const doc = generateInvoicePDF(items, customer, num, subtotal, shipping, total);
    downloadPDF(doc, num);

    const whatsappMsg = generateWhatsAppMessage(items, customer, num, total);
    window.open(generateWhatsAppURL(whatsappMsg), '_blank');

    const emailSubject = encodeURIComponent(`Pedido #${num} - Accesorios Hanna`);
    const emailBody = encodeURIComponent(
      `Hola,\n\nAdjunto mi pedido #${num}.\n\n` +
      `DATOS:\nNombre: ${customer.name}\nCedula/RIF: ${customer.cedula}\n` +
      `Direccion: ${customer.address}, ${customer.city}\n` +
      `Telefono: ${customer.phone}\nEmail: ${customer.email}\n\n` +
      `PRODUCTOS:\n${items.map(i => {
        let extras = '';
        if ((i as any).selected_size) extras += ` [Talla: ${(i as any).selected_size}]`;
        if ((i as any).selected_color) extras += ` [Color: ${(i as any).selected_color}]`;
        return `- ${i.product.name}${extras} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`;
      }).join('\n')}\n\n` +
      `TOTAL: ${formatPrice(total)} (${formatPriceBS(total)})\n\n` +
      `${customer.notes ? 'Notas: ' + customer.notes : ''}`
    );
    window.open(`mailto:hannaccesorio@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');

    setOrderComplete(true);
  };

  if (orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Pedido #{orderNumber} Recibido!</h1>
        <p className="text-neutral-500 mb-2">Se descargo la factura PDF y se abrieron WhatsApp y correo.</p>
        <div className="flex gap-3 justify-center mt-4">
          <Link href="/catalogo"><Button onClick={() => { clearCart(); setOrderComplete(false); }}>Seguir Comprando</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Tu carrito esta vacio</h1>
        <p className="text-neutral-500 mb-6">Agrega productos para comenzar tu compra.</p>
        <Link href="/catalogo"><Button>Ver Catalogo</Button></Link>
      </div>
    );
  }

  const isValid = customer.name && customer.cedula && customer.email && customer.phone && customer.address && customer.city;

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
            const sizes = item.product.sizes || [];
            const colors = item.product.colors || [];
            return (
              <div key={item.id} className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
                <div className="w-24 h-32 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="128" fill="%23f5f5f5"%3E%3Crect width="96" height="128"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="10" fill="%23999" text-anchor="middle" dy=".3em"%3EImg%3C/text%3E%3C/svg%3E'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 truncate">{item.product.name}</h3>
                  <p className="font-bold text-neutral-900 mt-1">{formatPrice(item.product.price)}</p>
                  <p className="text-xs text-neutral-400">{formatPriceBS(item.product.price)}</p>

                  {/* Size selector */}
                  {sizes.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-neutral-500 mr-2">Talla:</span>
                      <div className="flex gap-1 flex-wrap">
                        {sizes.map(s => (
                          <button key={s} onClick={() => updateItemExtras(item.id, 'selected_size', s)}
                            className={`px-2 py-0.5 text-xs rounded border ${(item as any).selected_size === s ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-300 text-neutral-600 hover:border-primary-400'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color selector */}
                  {colors.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-neutral-500 mr-2">Color:</span>
                      <div className="flex gap-1 flex-wrap">
                        {colors.map(c => (
                          <button key={c} onClick={() => updateItemExtras(item.id, 'selected_color', c)}
                            className={`px-2 py-0.5 text-xs rounded border ${(item as any).selected_color === c ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-300 text-neutral-600 hover:border-primary-400'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-neutral-300 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-neutral-50"><Minus className="h-3 w-3" /></button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-neutral-50"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-neutral-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}

          {showCheckout && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 mt-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Datos de Envio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre completo *</label>
                  <input type="text" value={customer.name} onChange={e => updateField('name', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Cedula o RIF *</label>
                  <input type="text" value={customer.cedula} onChange={e => updateField('cedula', e.target.value)} placeholder="Ej: V-12345678"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Correo electronico *</label>
                  <input type="email" value={customer.email} onChange={e => updateField('email', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Telefono *</label>
                  <input type="tel" value={customer.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Ej: 0414 123 4567"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Direccion *</label>
                  <input type="text" value={customer.address} onChange={e => updateField('address', e.target.value)} placeholder="Av. Urdaneta, Caracas"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ciudad *</label>
                  <input type="text" value={customer.city} onChange={e => updateField('city', e.target.value)} placeholder="Caracas"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Estado / Municipio</label>
                  <input type="text" value={customer.department} onChange={e => updateField('department', e.target.value)} placeholder="Miranda"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Empresa</label>
                  <input type="text" value={customer.company} onChange={e => updateField('company', e.target.value)} placeholder="Opcional"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Empresa de envio</label>
                  <input type="text" value={customer.shipping_company} onChange={e => updateField('shipping_company', e.target.value)} placeholder="Ej: Zoom, MRW, Tealca"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Notas del pedido</label>
                  <textarea value={customer.notes} onChange={e => updateField('notes', e.target.value)} rows={2} placeholder="Instrucciones especiales..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleCheckout} size="lg" disabled={!isValid} className="flex-1">
                  <FileText className="h-5 w-5" />
                  Enviar Pedido (PDF + WhatsApp + Correo)
                </Button>
              </div>
              <p className="text-xs text-neutral-400 text-center mt-3">
                Se descargara la factura PDF, se abrira WhatsApp y se enviara el correo a hannaccesorio@gmail.com
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-neutral-50 rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-neutral-900 mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal ({totalItems} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Envio</span>
                <span>{shipping === 0 ? <Badge variant="success">Gratis</Badge> : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-primary-600">Envio gratis en compras superiores a $50.00</p>
              )}
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total USD</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>Total BS</span>
                  <span>{formatPriceBS(total)}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">Tasa: 1 USD = {currentRate} BS</p>
              </div>
            </div>

            {!showCheckout ? (
              <Button className="w-full mt-6" size="lg" onClick={() => setShowCheckout(true)}>
                <ShoppingBag className="h-5 w-5" />
                Proceder al Pedido
              </Button>
            ) : (
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600"><FileText className="h-4 w-4" /> PDF se descargara</div>
                <div className="flex items-center gap-2 text-sm text-green-600"><MessageCircle className="h-4 w-4" /> WhatsApp se abrira</div>
                <div className="flex items-center gap-2 text-sm text-green-600"><Mail className="h-4 w-4" /> Correo se enviara</div>
              </div>
            )}

            <Link href="/catalogo" className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-600 hover:text-primary-600">
              <ArrowLeft className="h-4 w-4" /> Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
