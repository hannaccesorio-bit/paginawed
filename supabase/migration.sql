-- PASO 1: Agregar columnas sizes y colors
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';

-- PASO 2: Agregar tallas y colores a productos existentes
UPDATE products SET sizes = ARRAY['S','M','L','XL'], colors = ARRAY['Dorado','Plata','Negro'] WHERE slug = 'reloj-clasico-dorado';
UPDATE products SET sizes = ARRAY['M','L','XL'], colors = ARRAY['Negro','Gris','Azul'] WHERE slug = 'reloj-deportivo-negro';
UPDATE products SET sizes = ARRAY['S','M','L'], colors = ARRAY['Blanco','Rosa','Dorado'] WHERE slug = 'reloj-elegante-mujer';
UPDATE products SET sizes = ARRAY['40cm','45cm','50cm'], colors = ARRAY['Plata','Dorado','Negro'] WHERE slug = 'cadena-acero-premium';
UPDATE products SET sizes = ARRAY['S','M','L'], colors = ARRAY['Marron','Negro','Cafe'] WHERE slug = 'pulsera-cuero-artesanal';
UPDATE products SET sizes = ARRAY['40mm','44mm'], colors = ARRAY['Negro','Plata','Azul'] WHERE slug = 'reloj-smart-watch';
UPDATE products SET sizes = ARRAY['6','7','8','9','10'], colors = ARRAY['Plata','Oro','Rosado'] WHERE slug = 'anillo-plata-925';
UPDATE products SET sizes = ARRAY['S','M','L'], colors = ARRAY['Rosa Gold','Dorado','Plata'] WHERE slug = 'reloj-mujer-rosa-gold';

-- Verificar
SELECT name, sizes, colors FROM products;
