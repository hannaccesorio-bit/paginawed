-- ============================================
-- SITE SETTINGS: configuracion de la tienda en la nube
-- Ejecutar en Supabase > SQL Editor
-- Permite que el nombre de la empresa, telefonos, redes,
-- tasa promocional etc. se guarden en la base de datos
-- y se vean igual desde cualquier dispositivo.
-- ============================================

-- Tabla de una sola fila (id siempre 1)
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Seguridad: todos pueden LEER la configuracion,
-- pero solo el administrador puede ESCRIBIRLA.
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated" ON site_settings;
DROP POLICY IF EXISTS "Public read" ON site_settings;
DROP POLICY IF EXISTS "Admin write" ON site_settings;

CREATE POLICY "Public read" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin write" ON site_settings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fila inicial vacia (los valores por defecto vienen de la aplicacion)
INSERT INTO site_settings (id, data) VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
