import type { Metadata } from 'next';
import Link from 'next/link';
import { Smartphone, Landmark, DollarSign, Coins, Truck, Store, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Pagos y Envios',
  description:
    'Metodos de pago (Pago Movil, transferencia, Zelle, Binance) y opciones de envio a toda Venezuela. Accesorios Hanna.',
};

const paymentMethods = [
  {
    icon: Smartphone,
    title: 'Pago Movil',
    description: 'Aceptamos Pago Movil de los principales bancos. Envia tu comprobante por WhatsApp y preparamos tu pedido de inmediato.',
  },
  {
    icon: Landmark,
    title: 'Transferencia en Bolivares',
    description: 'Transferencia bancaria en Bs. a la tasa BCV vigente del dia. Los datos de cuenta se envian al confirmar tu pedido.',
  },
  {
    icon: DollarSign,
    title: 'Zelle (Dolares)',
    description: 'Pagos en divisas por Zelle. Ideal si prefieres pagar exactamente el precio en dolares publicado.',
  },
  {
    icon: Coins,
    title: 'Binance / USDT',
    description: 'Tambien aceptamos criptomonedas (USDT) por Binance. Pregunta por la wallet al hacer tu pedido.',
  },
];

const shippingOptions = [
  {
    icon: Truck,
    title: 'Envio nacional (Zoom, MRW, Tealca, Domesa)',
    description: 'Enviamos a todos los estados de Venezuela. El costo depende del peso y la zona; lo confirmamos por WhatsApp antes de pagar.',
  },
  {
    icon: Store,
    title: 'Entrega personal en Caracas',
    description: 'Coordinamos un punto de entrega comodo y seguro dentro de Caracas, sin costo adicional.',
  },
  {
    icon: Clock,
    title: 'Envio gratis en compras +$50',
    description: 'En pedidos superiores a $50 el envio nacional va por nuestra cuenta. Aplica a todo el catalogo.',
  },
];

export default function PagosEnviosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Pagos y Envios</h1>
        <p className="text-neutral-500 mt-2 max-w-2xl mx-auto">
          Todo lo que necesitas saber para comprar con confianza. Si te queda alguna duda,
          escribenos por WhatsApp y te respondemos en minutos.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary-600" />
        Formas de pago
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {paymentMethods.map((m) => (
          <div key={m.title} className="bg-white border border-neutral-200 rounded-xl p-5 flex gap-4">
            <div className="p-2 bg-primary-50 rounded-lg h-fit">
              <m.icon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">{m.title}</h3>
              <p className="text-sm text-neutral-500">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-12 text-sm text-neutral-600">
        <p>
          <strong className="text-neutral-900">Sobre la tasa de cambio:</strong> los precios en
          bolivares se calculan con la tasa BCV vigente del dia de tu pago. El monto exacto en Bs.
          se confirma por WhatsApp antes de que transfieras, para que no haya sorpresas.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary-600" />
        Envios y entregas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {shippingOptions.map((s) => (
          <div key={s.title} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="p-2 bg-primary-50 rounded-lg w-fit mb-3">
              <s.icon className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">{s.title}</h3>
            <p className="text-sm text-neutral-500">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">¿Listo para comprar?</h3>
            <p className="text-sm text-neutral-500">
              Elige tus productos, completa el pedido y te contactamos por WhatsApp con los datos de pago.
            </p>
          </div>
        </div>
        <Link href="/catalogo">
          <Button>Ir al Catalogo</Button>
        </Link>
      </div>
    </div>
  );
}
