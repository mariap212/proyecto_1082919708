'use client';

/**
 * Cliente fetch para el browser. Asume que el server retorna
 * { data } en éxito y { error, detail? } en error.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  return handle<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'DELETE', credentials: 'include' });
  return handle<T>(res);
}

async function handle<T>(res: Response): Promise<T> {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : { error: await res.text() };
  if (!res.ok) {
    const err = new Error(payload.error ?? `HTTP ${res.status}`) as Error & { detail?: unknown; status?: number };
    err.detail = payload.detail;
    err.status = res.status;
    throw err;
  }
  return payload.data as T;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' });
}
