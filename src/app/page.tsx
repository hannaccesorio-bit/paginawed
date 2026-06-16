'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { createClient } from '@/lib/supabase';
import { Product, Banner, Department } from '@/types';

export default function HomePage() {
  const supabase = createClient();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const loadData = async () => {
    setLoading(true);
    const [prodsRes, depsRes, bansRes] = await Promise.all([
      supabase.from('products').select('*').eq('featured', true).eq('status', 'active').limit(4),
      supabase.from('departments').select('*').eq('active', true).order('sort_order'),
      supabase.from('banners').select('*').eq('active', true).order('sort_order'),
    ]);
    if (prodsRes.data) setFeaturedProducts(prodsRes.data as Product[]);
    if (depsRes.data) setDepartments(depsRes.data as Department[]);
    if (bansRes.data) setBanners(bansRes.data as Banner[]);
    setLoading(false);
  };

  const prevBanner = useCallback(() => {
    setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const nextBanner = useCallback(() => {
    setCurrentBanner(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  const departmentImages: Record<string, string> = {
    hombre: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=400&fit=crop',
    mujer: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=400&fit=crop',
    accesorios: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop',
  };

  return (
    <div>
      {/* BANNER CAROUSEL */}
      {banners.length > 0 && (
        <section className="relative overflow-hidden">
          <div className="relative h-[300px] md:h-[450px]">
            {banners.map((banner, i) => (
              <div key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ${i === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="w-full h-full relative">
                  <img src={banner.image_url} alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='500' fill='${encodeURIComponent(banner.bg_color)}'%3E%3Crect width='1200' height='500'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='48' fill='white' text-anchor='middle' dy='.3em'%3E${banner.title}%3C/text%3E%3C/svg%3E`;
                    }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${banner.bg_color}dd, ${banner.bg_color}44)` }} />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="max-w-xl">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: banner.text_color }}>{banner.title}</h2>
                        {banner.subtitle && <p className="text-lg md:text-xl mb-6 opacity-90" style={{ color: banner.text_color }}>{banner.subtitle}</p>}
                        {banner.link_url && (
                          <Link href={banner.link_url}>
                            <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100">{banner.button_text || 'Ver Mas'}</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Carousel Controls */}
          {banners.length > 1 && (
            <>
              <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all">
                <ChevronLeft className="h-5 w-5 text-neutral-700" />
              </button>
              <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all">
                <ChevronRight className="h-5 w-5 text-neutral-700" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)}
                    className={`w-3 h-3 rounded-full transition-all ${i === currentBanner ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'}`} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Hero (fallback if no banners) */}
      {banners.length === 0 && !loading && (
        <section className="relative bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Encuentra tu estilo con
                <span className="text-primary-600"> Accesorios Hanna</span>
              </h1>
              <p className="text-lg text-neutral-600 mb-8">
                Descubre nuestra coleccion de relojes y accesorios de las mejores marcas.
              </p>
              <div className="flex gap-4">
                <Link href="/catalogo"><Button size="lg">Ver Catalogo <ArrowRight className="h-5 w-5" /></Button></Link>
                <Link href="/catalogo?category=nuevos"><Button variant="outline" size="lg">Nuevos Ingresos</Button></Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Departments */}
      {departments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Departamentos</h2>
            <Link href="/catalogo" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Ver todos</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Link key={dept.id} href={`/catalogo?department=${dept.slug}`}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                  <img src={departmentImages[dept.slug] || dept.image_url || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%23f5f5f5'%3E%3Crect width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3E${dept.name}%3C/text%3E%3C/svg%3E`}
                    alt={dept.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold text-lg">{dept.name}</h3>
                    {dept.description && <p className="text-white/80 text-sm">{dept.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-neutral-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Productos Destacados</h2>
            <Link href="/catalogo" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-primary-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Envio Gratis en Compras +$150.000</h2>
            <p className="text-white/80 mb-6">Aprovecha nuestra promocion por tiempo limitado. Envio sin costo a toda Colombia.</p>
            <Link href="/catalogo"><Button variant="secondary" size="lg">Comprar Ahora</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
