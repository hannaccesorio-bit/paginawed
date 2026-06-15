'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/lib/products';

const featuredProducts = products.slice(0, 4);

const categories = [
  {
    id: 'hombre',
    name: 'Hombre',
    image: '/categories/hombre.jpg',
    href: '/catalogo?category=hombre',
  },
  {
    id: 'mujer',
    name: 'Mujer',
    image: '/categories/mujer.jpg',
    href: '/catalogo?category=mujer',
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    image: '/categories/accesorios.jpg',
    href: '/catalogo?category=accesorios',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Encuentra tu estilo con
              <span className="text-primary-600"> Accesorios Hanna</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Descubre nuestra coleccion de relojes y accesorios de las mejores marcas.
              Calidad, elegancia y estilo para cada ocasion.
            </p>
            <div className="flex gap-4">
              <Link href="/catalogo">
                <Button size="lg">
                  Ver Catalogo
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/catalogo?category=nuevos">
                <Button variant="outline" size="lg">
                  Nuevos Ingresos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Categorias</h2>
          <Link href="/catalogo" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={category.href}>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23f5f5f5"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="20" fill="%23999" text-anchor="middle" dy=".3em"%3E${category.name}%3C/text%3E%3C/svg%3E`;
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-neutral-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Productos Destacados</h2>
          <Link href="/catalogo" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-primary-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Envio Gratis en Compras +$150.000
            </h2>
            <p className="text-white/80 mb-6">
              Aprovecha nuestra promocion por tiempo limitado. Envio sin costo a toda Colombia.
            </p>
            <Link href="/catalogo">
              <Button variant="secondary" size="lg">
                Comprar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}