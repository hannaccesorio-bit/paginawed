-- ============================================
-- TIENDA HANNA - Setup completo de base de datos
-- Copia todo esto y pegalo en Supabase > SQL Editor > New Query
-- ============================================

-- 1. TABLA: departamentos
CREATE TABLE IF NOT EXISTS departments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. TABLA: categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. TABLA: banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link_url text,
  button_text text DEFAULT 'Comprar Ahora',
  bg_color text DEFAULT '#c2410c',
  text_color text DEFAULT '#ffffff',
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. TABLA: products (reemplaza la anterior si existe)
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(12,2),
  cost_price numeric(12,2),
  sku text,
  barcode text,
  inventory_quantity integer DEFAULT 0,
  weight numeric(8,2),
  images jsonb DEFAULT '[]'::jsonb,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('draft','active','archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Habilitar RLS pero permitir todo (para tienda interna)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies: permitir todo (lectura y escritura) para usuarios autenticados
CREATE POLICY "Allow all for authenticated" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON banners FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON products FOR ALL USING (true);

-- Policies: permitir lectura publica
CREATE POLICY "Allow public read" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);

-- 6. Insertar departamentos por defecto
INSERT INTO departments (name, slug, description, sort_order) VALUES
  ('Hombre', 'hombre', 'Relojes y accesorios para hombre', 1),
  ('Mujer', 'mujer', 'Relojes y accesorios para mujer', 2),
  ('Accesorios', 'accesorios', 'Cadenas, pulseras, anillos y mas', 3)
ON CONFLICT (slug) DO NOTHING;

-- 7. Insertar categorias por defecto
INSERT INTO categories (name, slug, description, department_id, sort_order) VALUES
  ('Relojes', 'relojes', 'Relojes de todos los estilos',
    (SELECT id FROM departments WHERE slug = 'hombre'), 1),
  ('Relojes Deportivos', 'relojes-deportivos', 'Relojes para actividad fisica',
    (SELECT id FROM departments WHERE slug = 'hombre'), 2),
  ('Relojes Elegantes', 'relojes-elegantes', 'Relojes formales y elegantes',
    (SELECT id FROM departments WHERE slug = 'mujer'), 1),
  ('Smartwatch', 'smartwatch', 'Relojes inteligentes',
    (SELECT id FROM departments WHERE slug = 'hombre'), 3),
  ('Cadenas', 'cadenas', 'Cadenas de acero y plata',
    (SELECT id FROM departments WHERE slug = 'accesorios'), 1),
  ('Pulseras', 'pulseras', 'Pulseras de cuero y metal',
    (SELECT id FROM departments WHERE slug = 'accesorios'), 2),
  ('Anillos', 'anillos', 'Anillos de plata y oro',
    (SELECT id FROM departments WHERE slug = 'accesorios'), 3)
ON CONFLICT (slug) DO NOTHING;

-- 8. Insertar 3 banners por defecto
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, bg_color, sort_order) VALUES
  ('Nueva Coleccion 2026', 'Descubre los ultimos estilos en relojes', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200&h=500&fit=crop', '/catalogo', 'Ver Coleccion', '#c2410c', 1),
  ('Envio Gratis', 'En compras superiores a $150.000', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&h=500&fit=crop', '/catalogo', 'Comprar Ahora', '#1e40af', 2),
  ('Descuentos de Temporada', 'Hasta 40% de descuento en seleccionados', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&h=500&fit=crop', '/catalogo', 'Ver Ofertas', '#166534', 3)
ON CONFLICT DO NOTHING;

-- 9. Insertar productos de ejemplo
INSERT INTO products (name, slug, description, short_description, price, compare_at_price, sku, inventory_quantity, images, category_id, department_id, tags, featured, status) VALUES
  ('Reloj Clasico Dorado', 'reloj-clasico-dorado', 'Reloj clasico con correa de acero inoxidable y esfera dorada', 'Reloj clasico dorado', 189900, 249900, 'RCD-001', 50,
    '[{"id":"img-1","url":"https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=533&fit=crop","alt":"Reloj Clasico Dorado","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'relojes' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'hombre' LIMIT 1),
    ARRAY['reloj','hombre','dorado'], true, 'active'),
  ('Reloj Deportivo Negro', 'reloj-deportivo-negro', 'Reloj deportivo con GPS y monitor de ritmo cardiaco', 'Reloj deportivo con GPS', 229900, 299900, 'RDN-002', 30,
    '[{"id":"img-2","url":"https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=400&h=533&fit=crop","alt":"Reloj Deportivo Negro","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'relojes-deportivos' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'hombre' LIMIT 1),
    ARRAY['reloj','hombre','deportivo'], true, 'active'),
  ('Reloj Elegante Mujer', 'reloj-elegante-mujer', 'Reloj elegante con pulsera de ceramica y cristales Swarovski', 'Reloj elegante con cristales', 349900, NULL, 'REM-003', 20,
    '[{"id":"img-3","url":"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=533&fit=crop","alt":"Reloj Elegante Mujer","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'relojes-elegantes' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'mujer' LIMIT 1),
    ARRAY['reloj','mujer','elegante'], true, 'active'),
  ('Cadena de Acero Premium', 'cadena-acero-premium', 'Cadena de acero inoxidable con banio de plata', 'Cadena de acero inoxidable', 89900, 119900, 'CAP-004', 40,
    '[{"id":"img-4","url":"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=533&fit=crop","alt":"Cadena de Acero Premium","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'cadenas' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'accesorios' LIMIT 1),
    ARRAY['cadena','accesorio','acero'], false, 'active'),
  ('Pulsera de Cuero Artesanal', 'pulsera-cuero-artesanal', 'Pulsera de cuero genuino con cierre de acero', 'Pulsera de cuero genuino', 59900, NULL, 'PCA-005', 60,
    '[{"id":"img-5","url":"https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=533&fit=crop","alt":"Pulsera de Cuero Artesanal","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'pulseras' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'accesorios' LIMIT 1),
    ARRAY['pulsera','accesorio','cuero'], false, 'active'),
  ('Reloj Smart Watch', 'reloj-smart-watch', 'Smartwatch con pantalla AMOLED, GPS y resistencia al agua IP68', 'Smartwatch con pantalla AMOLED', 459900, 549900, 'RSW-006', 25,
    '[{"id":"img-6","url":"https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=533&fit=crop","alt":"Reloj Smart Watch","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'smartwatch' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'hombre' LIMIT 1),
    ARRAY['smartwatch','hombre','tecnologia'], true, 'active'),
  ('Anillo de Plata 925', 'anillo-plata-925', 'Anillo de plata 925 con cristal Swarovski', 'Anillo de plata 925', 129900, NULL, 'AP9-007', 35,
    '[{"id":"img-7","url":"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=533&fit=crop","alt":"Anillo de Plata 925","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'anillos' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'accesorios' LIMIT 1),
    ARRAY['anillo','accesorio','plata'], false, 'active'),
  ('Reloj Mujer Rosa Gold', 'reloj-mujer-rosa-gold', 'Reloj con correa de malla y caja en color rosa gold', 'Reloj en color rosa gold', 279900, 329900, 'RMG-008', 28,
    '[{"id":"img-8","url":"https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400&h=533&fit=crop","alt":"Reloj Mujer Rosa Gold","position":0}]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'relojes-elegantes' LIMIT 1),
    (SELECT id FROM departments WHERE slug = 'mujer' LIMIT 1),
    ARRAY['reloj','mujer','rosa-gold'], true, 'active')
ON CONFLICT (slug) DO NOTHING;

-- 10. Crear bucket de storage para imagenes
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Storage policy: permitir upload a usuarios autenticados
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products');
