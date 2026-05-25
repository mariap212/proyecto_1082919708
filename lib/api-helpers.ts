import { NextResponse } from 'next/server';

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

interface ErrorWithDetail {
  message: string;
  status?: number;
  detail?: unknown;
}

export function fail(error: unknown, fallbackStatus = 400): NextResponse {
  const e = error as ErrorWithDetail;
  const message = e?.message ?? 'Error desconocido';
  const status = e?.status ?? fallbackStatus;
  const detail = e?.detail;
  console.error('[api]', message, detail ?? '');
  return NextResponse.json(detail ? { error: message, detail } : { error: message }, { status });
}

export async function readJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error('JSON inválido en el body');
  }
}
