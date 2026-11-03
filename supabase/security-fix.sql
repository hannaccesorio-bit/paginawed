-- ============================================================
-- ACCESORIOS HANNA - FIX DE SEGURIDAD (RLS)
-- ============================================================
-- PROBLEMA QUE CORRIGE:
--   El setup original permitía que CUALQUIER usuario autenticado
--   (cualquier persona que se registre) cree, edite y BORRE
--   productos, categorías, departamentos, banners y archivos.
--   Política anterior: FOR ALL USING (true)
--
-- QUÉ HACE ESTE FIX:
--   1. Crea la tabla admin_emails con los correos autorizados.
--   2. Crea la función is_admin() que verifica el correo logueado.
--   3. Elimina las políticas peligrosas "Allow all for authenticated".
--   4. La lectura del catálogo sigue siendo PÚBLICA (la tienda funciona igual).
--   5. Solo los correos de admin_emails pueden crear/editar/eliminar.
--
-- CÓMO USARLO:
--   1. Abre Supabase > SQL Editor > New Query
--   2. Cambia 'hannaccesorio@gmail.com' por el correo con el que
--      entras al panel y ejecuta TODO este script.
--   3. Listo: la tienda pública sigue igual y solo tú administras.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de correos administradores (sin políticas publicas:
--    solo se gestiona desde el Dashboard con la service_role)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- >>> CAMBIA ESTE CORREO POR EL TUYO (el que usas en /login) <<<
INSERT INTO public.admin_emails (email)
VALUES ('hannaccesorio@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Funcion is_admin(): verdadera solo si el correo logueado
--    esta en admin_emails. SECURITY DEFINER para que la funcion
--    pueda leer la tabla aunque esta no tenga politicas publicas.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ------------------------------------------------------------
-- 3. Quitar las politicas peligrosas del setup original
--    ("Allow all for authenticated" = escritura para todos)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.departments;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.categories;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.banners;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.products;

-- ------------------------------------------------------------
-- 4. Politicas nuevas por tabla:
--    - Lectura publica (el catalogo sigue funcionando igual)
--    - Escritura SOLO para administradores
-- ------------------------------------------------------------
CREATE POLICY "Public read departments" ON public.departments
  FOR SELECT USING (true);
CREATE POLICY "Admin write departments" ON public.departments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public read banners" ON public.banners
  FOR SELECT USING (true);
CREATE POLICY "Admin write banners" ON public.banners
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 5. Storage del bucket 'products':
--    - Lectura publica de imagenes (igual que antes)
--    - Subir / renombrar / borrar SOLO administradores
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;

CREATE POLICY "Admin upload products" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "Admin update products" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'products' AND public.is_admin())
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "Admin delete products" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND public.is_admin());

-- Nota: la politica de lectura publica del bucket
-- ("Allow public read access" / "Public read access") se queda igual.

-- ============================================================
-- VERIFICACION (opcional): deberia devolver tus politicas nuevas
-- ============================================================
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public' ORDER BY tablename;
