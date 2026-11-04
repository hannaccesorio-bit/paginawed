'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const IDLE_LIMIT_MS = 5 * 60 * 1000; // cerrar sesion tras 5 min sin actividad
const WARNING_MS = 30 * 1000; // avisar 30 s antes
const TICK_MS = 1000;

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

/**
 * Proteccion de sesion del panel /admin:
 *  1. Cierra la sesion automaticamente en cuanto se sale del panel
 *     (cualquier navegacion fuera de /admin).
 *  2. Cierra la sesion tras 5 minutos sin actividad, avisando 30 s antes
 *     con un mensaje que permite seguir conectado con un clic.
 *
 * Se monta una sola vez dentro del panel, solo cuando hay un
 * administrador con sesion iniciada. No afecta al resto de la tienda.
 */
export default function AdminSessionGuard() {
  const { signOut } = useAuth();
  const router = useRouter();

  const lastActivity = useRef(Date.now());
  const signedOut = useRef(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const doSignOut = useCallback(
    async (reason: 'leave' | 'idle') => {
      if (signedOut.current) return;
      signedOut.current = true;
      setWarning(false);
      if (reason === 'idle') {
        // Para que la pantalla de login muestre el motivo.
        try {
          sessionStorage.setItem('logout-reason', 'inactividad');
        } catch {
          /* almacenamiento no disponible: continuar */
        }
      }
      try {
        await signOut();
      } catch {
        /* la sesion ya no existe: continuar */
      }
      if (reason === 'idle') router.replace('/login');
    },
    [signOut, router]
  );

  // 1) Salir del panel => cerrar la sesion al instante.
  //    La limpieza (unmount) ocurre al navegar fuera de /admin.
  //    El pequeno delay evita cerrar la sesion con el doble montaje
  //    que React hace en desarrollo; en produccion no afecta.
  useEffect(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    return () => {
      leaveTimer.current = setTimeout(() => {
        void doSignOut('leave');
      }, 50);
    };
  }, [doSignOut]);

  // 2) Inactividad: reiniciar el contador con cualquier interaccion y
  //    mostrar el aviso 30 s antes de cerrar la sesion.
  useEffect(() => {
    const markActivity = () => {
      lastActivity.current = Date.now();
    };
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, markActivity, { passive: true });
    }

    const tick = window.setInterval(() => {
      const remaining = IDLE_LIMIT_MS - (Date.now() - lastActivity.current);
      if (remaining <= 0) {
        void doSignOut('idle');
      } else if (remaining <= WARNING_MS) {
        setWarning(true);
        setSecondsLeft(Math.max(1, Math.ceil(remaining / 1000)));
      } else {
        setWarning(false);
      }
    }, TICK_MS);

    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, markActivity);
      }
      window.clearInterval(tick);
    };
  }, [doSignOut]);

  if (!warning) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Aviso de inactividad"
    >
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-sm w-full p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">&iquest;Sigues ahi?</h2>
        <p className="text-sm text-neutral-600 mt-2">
          Por seguridad, tu sesion se cerrara en{' '}
          <span className="font-bold text-neutral-900">{secondsLeft}</span>{' '}
          segundos por inactividad.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            onClick={() => {
              lastActivity.current = Date.now();
              setWarning(false);
            }}
          >
            Seguir conectado
          </Button>
          <Button variant="outline" onClick={() => void doSignOut('idle')}>
            Cerrar sesion ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
