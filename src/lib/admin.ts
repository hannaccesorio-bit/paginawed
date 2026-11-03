/**
 * Control de acceso al panel de administración.
 *
 * Los correos autorizados se configuran en la variable de entorno
 * NEXT_PUBLIC_ADMIN_EMAILS (separados por coma). Si no está definida,
 * se usa el correo de la tienda por defecto.
 *
 * IMPORTANTE: esta comprobación en el cliente es de conveniencia (UX).
 * La protección REAL está en las políticas RLS de Supabase:
 * ejecuta supabase/security-fix.sql para que solo los correos de la
 * tabla admin_emails puedan escribir productos, banners, etc.
 */

const DEFAULT_ADMIN_EMAILS = 'hannaccesorio@gmail.com';

export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
