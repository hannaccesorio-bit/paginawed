'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Product, Department, Category } from '@/types';
import { normalizeText } from '@/lib/utils';

const sortOptions = [
  { id: 'featured', label: 'Destacados' },
  { id: 'price-asc', label: 'Menor Precio' },
  { id: 'price-desc', label: 'Mayor Precio' },
  { id: 'newest', label: 'Mas Recientes' },
];

export default function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'todos';
  const initialDept = searchParams.get('department') || '';
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeDept, setActiveDept] = useState(initialDept);
  const [sortBy, setSortBy] = useState('featured');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [prodsRes, depsRes, catsRes] = await Promise.all([
      supabase.from('products').select('*').eq('status', 'active'),
      supabase.from('departments').select('*').eq('active', true).order('sort_order'),
      supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    ]);
    if (prodsRes.data) setProducts(prodsRes.data as Product[]);
    if (depsRes.data) setDepartments(depsRes.data as Department[]);
    if (catsRes.data) setCategories(catsRes.data as Category[]);
    setLoading(false);
  };

  const allCategories = useMemo(() => {
    const cats: { id: string; label: string; department_id: string | null }[] = [{ id: 'todos', label: 'Todos', department_id: null }];
    categories.forEach(c => {
      cats.push({ id: c.id, label: c.name, department_id: c.department_id });
    });
    return cats;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeDept) {
      const dept = departments.find(d => d.slug === activeDept);
      if (dept) filtered = filtered.filter(p => p.department_id === dept.id);
    }

    if (activeCategory !== 'todos') {
      const cat = categories.find(c => c.id === activeCategory || c.slug === activeCategory);
      if (cat) filtered = filtered.filter(p => p.category_id === cat.id);
    }

    const q = normalizeText(query.trim());
    if (q) {
      filtered = filtered.filter(p =>
        normalizeText(p.name).includes(q) ||
        normalizeText(p.short_description || '').includes(q) ||
        normalizeText(p.description || '').includes(q) ||
        (p.tags || []).some(t => normalizeText(t).includes(q)) ||
        normalizeText(p.sku || '').includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }

    return filtered;
  }, [products, activeCategory, activeDept, sortBy, query, departments, categories]);

  const deptFilters = departments.map(d => ({ id: d.slug, label: d.name }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Catalogo</h1>
          <p className="text-neutral-500 text-sm mt-1">{filteredProducts.length} productos disponibles</p>
        </div>
        <div className="flex items-center gap-4">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar reloj, cadena, color, marca..."
          className="w-full h-11 pl-10 pr-10 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar busqueda"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Department filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={!activeDept ? 'primary' : 'outline'} size="sm" onClick={() => { setActiveDept(''); setActiveCategory('todos'); }}>
          Todos
        </Button>
        {deptFilters.map(d => (
          <Button key={d.id} variant={activeDept === d.id ? 'primary' : 'outline'} size="sm"
            onClick={() => { setActiveDept(d.id); setActiveCategory('todos'); }}>
            {d.label}
          </Button>
        ))}
      </div>

      {/* Category filters */}
      {activeDept && (
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.filter(c => !c.department_id || c.department_id === departments.find(d => d.slug === activeDept)?.id).map(c => (
            <Button key={c.id} variant={activeCategory === c.id ? 'primary' : 'outline'} size="sm"
              onClick={() => setActiveCategory(c.id)}>
              {c.label}
            </Button>
          ))}
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            {loading ? 'Cargando productos...' : 'No encontramos nada con esa busqueda'}
          </h2>
          {!loading && (
            <>
              <p className="text-neutral-500 text-sm mb-6">
                Prueba con otra palabra o revisa todos los productos.
              </p>
              <Button variant="outline" onClick={() => { setQuery(''); setActiveDept(''); setActiveCategory('todos'); }}>
                Ver todo el catalogo
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
