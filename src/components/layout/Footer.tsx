import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function Footer() {
  const { settings } = useSiteSettings();
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4">ACCESORIOS HANNA</h3>
            <p className="text-sm text-neutral-400">
              Tu tienda de confianza en relojes y accesorios de moda.
            </p>
            <div className="flex gap-4 mt-4">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Catalogo</Link></li>
              <li><Link href="/catalogo?department=hombre" className="hover:text-white transition-colors">Hombre</Link></li>
              <li><Link href="/catalogo?department=mujer" className="hover:text-white transition-colors">Mujer</Link></li>
              <li><Link href="/catalogo?department=accesorios" className="hover:text-white transition-colors">Accesorios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Horarios</h4>
            <ul className="space-y-2 text-sm">
              <li>{settings.hoursWeek}</li>
              <li>{settings.hoursSaturday}</li>
              <li>{settings.hoursSunday}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{settings.phone1}</span>
              </li>
              {settings.phone2 && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{settings.phone2}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{settings.address}, {settings.city}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Accesorios Hanna. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
