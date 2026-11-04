import { NextResponse } from 'next/server';

// Tasa oficial del BCV consultada en el SERVIDOR.
// Asi el navegador no depende de CORS ni de que las APIs
// externas respondan a los visitantes.

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 8000;

interface TasaResult {
  ok: boolean;
  rate?: number;
  source?: string;
  updatedAt?: string | null;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function toRate(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Fuente 1: dolarapi - tasa oficial BCV (endpoint singular)
async function fromDolarApiOficial(): Promise<TasaResult> {
  const data = (await fetchJson('https://ve.dolarapi.com/v1/dolares/oficial')) as Record<string, unknown>;
  const rate = toRate(data.promedio ?? data.venta);
  if (!rate) throw new Error('Respuesta sin tasa valida');
  return {
    ok: true,
    rate,
    source: 'BCV via dolarapi',
    updatedAt: (data.fechaActualizacion as string) ?? null,
  };
}

// Fuente 2: dolarapi - lista completa (respaldo por si cambia el endpoint)
async function fromDolarApiLista(): Promise<TasaResult> {
  const data = (await fetchJson('https://ve.dolarapi.com/v1/dolares')) as Array<Record<string, unknown>>;
  const oficial = Array.isArray(data) ? data.find((d) => d.fuente === 'oficial') : null;
  const rate = toRate(oficial?.promedio ?? oficial?.venta);
  if (!rate) throw new Error('Respuesta sin tasa oficial');
  return {
    ok: true,
    rate,
    source: 'BCV via dolarapi',
    updatedAt: (oficial?.fechaActualizacion as string) ?? null,
  };
}

// Fuente 3: pydolarve (respaldo por si vuelve a estar disponible)
async function fromPyDolarVe(): Promise<TasaResult> {
  const data = (await fetchJson('https://pydolarve.org/api/v2/tipo-cambio')) as Record<string, unknown>;
  const monitors = data.monitors as Record<string, { price?: number }> | undefined;
  const rate = toRate(monitors?.bcv?.price);
  if (!rate) throw new Error('Respuesta sin tasa BCV');
  return {
    ok: true,
    rate,
    source: 'BCV via pydolarve',
    updatedAt: (data.datetime as string) ?? null,
  };
}

const SOURCES = [fromDolarApiOficial, fromDolarApiLista, fromPyDolarVe];

export async function GET() {
  for (const source of SOURCES) {
    try {
      const result = await source();
      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch {
      // Probar con la siguiente fuente
    }
  }
  return NextResponse.json(
    { ok: false, error: 'No se pudo obtener la tasa del BCV' },
    { status: 502, headers: { 'Cache-Control': 'no-store' } }
  );
}
