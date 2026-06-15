'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/Button';

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'hombre', label: 'Hombre' },
  { id: 'mujer', label: 'Mujer' },
  { id: 'accesorios', label: 'Accesorios' },
];

const sortOptions = [
  { id: 'featured', label: 'Destacados' },
  { id: 'price-asc', label: 'Menor Precio' },
  { id: 'price-desc', label: 'Mayor Precio' },
];

export default function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'todos';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === 'todos'
      ? products
      : products.filter(p => p.category_id === activeCategory);

    switch (sortBy) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return filtered;
  }, [activeCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Catalogo</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {filteredProducts.length} productos disponibles
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      <ProductGrid products={filteredProducts} />
    </div>
  );
}