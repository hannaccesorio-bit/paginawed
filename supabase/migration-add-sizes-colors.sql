-- MIGRATION: Agregar tallas y colores a productos
-- Ejecuta esto en Supabase > SQL Editor

-- Agregar columnas sizes y colors si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
    ALTER TABLE products ADD COLUMN sizes text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
    ALTER TABLE products ADD COLUMN colors text[] DEFAULT '{}';
  END IF;
END $$;

-- Verificar que las columnas existen
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('sizes', 'colors');
