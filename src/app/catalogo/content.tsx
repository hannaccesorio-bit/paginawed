'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Product, Department, Category } from '@/types';

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
      const dept = departments.find(d => d.id === c.department_id);
      cats.push({ id: c.id, label: c.name, department_id: c.department_id });
    });
    return cats;
  }, [categories, departments]);

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

    switch (sortBy) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }

    return filtered;
  }, [products, activeCategory, activeDept, sortBy, departments, categories]);

  const deptFilters = departments.map(d => ({ id: d.slug, label: d.name }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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

      <ProductGrid products={filteredProducts} />
    </div>
  );
}
