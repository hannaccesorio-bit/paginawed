-- MIGRATION: Agregar tallas y colores a productos existentes
-- Ejecuta esto en Supabase > SQL Editor si ya ejecutaste el setup.sql anterior

-- Agregar columnas sizes y colors si no existen
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';

-- Actualizar productos existentes con tallas y colores de ejemplo
UPDATE products SET 
  sizes = ARRAY['S', 'M', 'L', 'XL'],
  colors = ARRAY['Negro', 'Dorado', 'Plata']
WHERE sizes = '{}' OR sizes IS NULL;

-- Verificar
SELECT name, sizes, colors FROM products;
