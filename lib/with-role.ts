import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, AuthSession } from './auth';
import type { Role } from './types';

/**
 * Envuelve un Route Handler exigiendo sesión y un rol permitido.
 * Sin sesión → 401. Rol no autorizado → 403.
 *
 * Next.js 15: params siempre llega como Promise (resuelve a {} si la
 * ruta no tiene segmentos dinámicos).
 */
export function withRole<P extends Record<string, string> = Record<string, string>>(
  allowed: Role[],
  handler: (
    req: NextRequest,
    session: AuthSession,
    ctx: { params: P }
  ) => Promise<NextResponse>
) {
  return async function (
    req: NextRequest,
    ctx: { params: Promise<P> }
  ): Promise<NextResponse> {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (!allowed.includes(session.role as Role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const params = ctx?.params ? await ctx.params : ({} as P);
    return handler(req, session, { params });
  };
}

export async function requireSession(): Promise<AuthSession | NextResponse> {
  const s = await getAuthSession();
  if (!s) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  return s;
}
