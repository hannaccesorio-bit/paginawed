# Mejoras aplicadas — Accesorios Hanna (paginawed)

Revisión de seguridad y actualización del catálogo. **No se cambió ningún
diseño, página ni funcionalidad visible**: la tienda se ve y funciona igual.
Todas las páginas compilan (`npm run build` ✓) y responden 200
(Inicio, Catálogo, Carrito, Login, Producto, Admin).

---

## 1. Problema crítico corregido: cualquier usuario podía borrar tu catálogo

**Antes:** en `supabase/setup.sql`, las políticas de seguridad de la base de
datos eran `FOR ALL USING (true)` para cualquier usuario autenticado. Además,
el panel `/admin` solo preguntaba "¿hay sesión iniciada?" sin verificar quién.
Como Supabase permite que cualquiera se registre por la API pública, cualquier
persona podía entrar a `/admin` y **crear, editar o eliminar productos,
categorías y banners**, y borrar imágenes del bucket.

**Ahora:**

- `supabase/security-fix.sql` (archivo nuevo, listo para ejecutar):
  - Crea la tabla `admin_emails` con los correos autorizados.
  - Crea la función `is_admin()` que reconoce tu correo al entrar.
  - Elimina las políticas peligrosas y crea otras nuevas:
    - **Lectura pública** del catálogo (la tienda sigue funcionando igual).
    - **Escritura solo para administradores** en
      `products`, `categories`, `departments` y `banners`.
    - Subir/renombrar/borrar imágenes del bucket `products` **solo admin**.
- `supabase/setup.sql` quedó corregido por si se vuelve a ejecutar desde cero.
- El panel `/admin` ahora **verifica que la sesión sea del administrador**
  (`src/lib/admin.ts` + `AuthContext` + `Header`). Un usuario cualquiera es
  redirigido a la tienda.

### ⚠️ PASO OBLIGATORIO (1 minuto, no rompe nada)

1. Abre **Supabase → SQL Editor → New Query**.
2. Copia **todo** `supabase/security-fix.sql`.
3. **Cambia** `'hannaccesorio@gmail.com'` por el correo con el que entras a
   `/login` (aparece 1 vez, marcado con `>>> CAMBIA ESTE CORREO <<<`).
4. Ejecuta. Listo: la tienda pública no cambia; solo tú administras.
5. (Recomendado) En **Authentication → Sign In / Providers**, desactiva
   *"Allow new users to sign up"* para que nadie cree cuentas nuevas.

Para añadir otro administrador en el futuro:
`INSERT INTO admin_emails (email) VALUES ('otro@correo.com');`

Si usas un correo distinto al de la tienda para el login, define también
en tu `.env.local` / hosting:
`NEXT_PUBLIC_ADMIN_EMAILS=tu-correo@gmail.com`

---

## 2. Vulnerabilidades de dependencias corregidas (8 → 0 en tu código)

Auditoría `npm audit` **antes**: 2 críticas, 5 altas, 1 moderada.
**Después** (dependencias que usa tu código): **0 vulnerabilidades**.

| Paquete | Antes | Ahora | Corrige |
|---|---|---|---|
| next | 15.3.3 | **15.5.28** | 14 CVEs críticos/altos: RCE en optimización de imágenes, cache poisoning, SSRF, DoS en Server Actions, etc. |
| dompurify | <3.4.17 | **3.4.17** | XSS (7 advisories críticos) |
| zod | 3.23.8 | **4.6.7** | Agotamiento de memoria al validar (high) |
| sharp | 0.33.3 | **0.35.5** | 4 CVEs de libvips/libheif/librsvg (high) |
| nanoid | 3.3.7 | **3.3.20** | Bucles infinitos con generadores inseguros (high) |
| postcss | 8.4.x | **8.5.32** | Lectura arbitraria de archivos vía sourceMappingURL (high) |
| qs | 6.12 | **6.17.1** | DoS (moderate) |
| source-map-js | <1.2.2 | **1.2.2** | DoS por event-loop (high) |
| tailwindcss, typescript, eslint, zustand, @supabase/supabase-js… | — | últimas de su rango | mantenimiento |

Verificado con `npm run build` después de actualizar: compila sin errores y
todas las rutas generan correctamente.

**Nota:** `npm audit` aún lista 1 aviso de `postcss` *interna* de Next.js
(copiada dentro del propio `next`). El arreglo oficial es migrar a **Next 16**,
que es un cambio mayor — se dejó pendiente para no arriesgar nada. Es una
herramienta de compilación, no una pieza expuesta del sitio.

**Dato útil:** `stripe`, `@stripe/stripe-js`, `@tanstack/react-query`,
`react-hook-form`, `@hookform/resolvers`, `date-fns`, `zod` y `@supabase/ssr`
están instalados pero **ninguno se usa en el código**. Se actualizaron los
vulnerables (zod); si quieres una instalación más ligera, puedes eliminarlos
de `package.json` sin que la tienda cambie en nada.

---

## 3. Cabeceras HTTP de seguridad (nuevo en `next.config.mjs`)

- `X-Content-Type-Options: nosniff` — evita ejecución de archivos subidos disfrazados.
- `X-Frame-Options: SAMEORIGIN` — impide que otras webs embeban la tuya (clickjacking).
- `Referrer-Policy: strict-origin-when-cross-origin` — no filtra URLs internas.
- `Permissions-Policy` — desactiva cámara/micrófono/ubicación/pagos en el navegador.
- `Strict-Transport-Security` — fuerza HTTPS 2 años (activa cuando uses dominio propio).

---

## 4. Otras correcciones menores

- `carrito/page.tsx`: los `window.open` de WhatsApp y correo ahora usan
  `noopener,noreferrer` (evita *reverse tabnabbing*).
- `.gitignore`: ahora cubre **todas** las variantes de `.env*` (antes solo
  `.env` y `.env.local`; un `.env.production` con claves se habría subido).
- `.env.example`: nueva variable `NEXT_PUBLIC_ADMIN_EMAILS` documentada.

---

## 5. Recomendaciones futuras (no aplicadas para no cambiar nada)

1. **Migrar a Next 16** cuando tengas tiempo: corrige el último aviso interno.
2. Los ajustes del panel (colores, teléfono, misión…) se guardan en el
   **navegador del administrador** (zustand/localStorage), no en la base de
   datos: los visitantes no los ven y si cambias de PC se pierden. Migrarlos a
   una tabla `site_settings` en Supabase los haría globales.
3. La tasa BCV se consulta desde el navegador a APIs de terceros sin validar;
   ideal moverla a un endpoint propio y validar la respuesta con zod.
4. Subir la longitud mínima de contraseña de 6 a 8+ en los formularios
   (también configurable en Supabase Auth).
5. Añadir `next lint` con reglas de seguridad y Dependabot en GitHub.

---

### Resumen de archivos modificados

| Archivo | Cambio |
|---|---|
| `supabase/security-fix.sql` | **NUEVO** — corre el RLS inseguro (ejecutar en Supabase) |
| `supabase/setup.sql` | Políticas corregidas para instalaciones desde cero |
| `src/lib/admin.ts` | **NUEVO** — lista de correos administradores |
| `src/contexts/AuthContext.tsx` | Expone `isAdmin` (aditivo, no rompe nada) |
| `src/app/admin/page.tsx` | Solo el admin entra al panel |
| `src/components/layout/Header.tsx` | Botón de panel solo para admin |
| `src/app/carrito/page.tsx` | `noopener,noreferrer` en ventana de pedido |
| `next.config.mjs` | Cabeceras de seguridad HTTP |
| `package.json` + `package-lock.json` | Dependencias actualizadas y sin CVEs |
| `.gitignore`, `.env.example` | Protección de variables de entorno |

---

## Mejoras v2 - Funciones nuevas para vender mas (nov 2026)

| # | Mejora | Donde |
|---|---|---|
| 1 | Favoritos reales: el corazoncito guarda productos en el dispositivo, pagina `/favoritos` y contador en el header | `src/hooks/useFavorites.ts`, `/favoritos`, `Header.tsx` |
| 2 | Buscador en el catalogo (nombre, descripcion, etiquetas y SKU; ignora acentos) | `src/app/catalogo/content.tsx` |
| 3 | Avisos de inventario: "Agotado" (bloquea compra) y "Ultimas unidades" (1-5) en tarjeta y ficha | `ProductCard.tsx`, `producto/[id]/content.tsx` |
| 4 | Boton "Pedir por WhatsApp" en cada producto con mensaje precargado (usa el numero de Configuracion) | `ProductCard.tsx`, `producto/[id]/content.tsx`, `lib/utils.ts` |
| 5 | SEO: metadata OpenGraph por producto (foto + nombre al compartir por WhatsApp), `sitemap.xml` y `robots.txt` | `producto/[id]/page.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| 6 | Pagina "Pagos y Envios" (Pago Movil, Zelle, Binance, Zoom/MRW/Tealca) enlazada en el footer | `/pagos-envios` |
| 7 | Configuracion de la tienda en la nube: tabla `site_settings` (leer `supabase/site-settings.sql`); funciona igual aunque no se ejecute el SQL | `src/hooks/useSiteSettings.ts` |
| 8 | "Tambien te puede gustar": productos relacionados por categoria en cada ficha | `producto/[id]/content.tsx` |
| 9 | Panel: tarjeta "Agotados" y valor real del inventario (precio x unidades) | `src/app/admin/page.tsx` |
| 10 | Limpieza: se retiro Stripe (no aplica en Venezuela) y se corrigio el filtro Hombre/Mujer/Accesorios del menu | `package.json`, `Header.tsx` |

**Pendiente opcional:** ejecutar `supabase/site-settings.sql` en Supabase > SQL Editor para activar
la configuracion en la nube (la tienda funciona igual sin ejecutarlo). En una proxima version:
migrar a Next 16 y validar la tasa BCV con zod.
