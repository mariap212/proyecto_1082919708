import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, AuthSession } from './auth';
import type { Role } from './types';

type RouteCtx = { params?: Promise<Record<string, string>> | Record<string, string> };

/**
 * Envuelve un Route Handler exigiendo sesión y un rol permitido.
 * Si no hay sesión → 401. Si el rol no está autorizado → 403.
 * (RN-08: solo admin gestiona usuarios, etc.)
 */
export function withRole(
  allowed: Role[],
  handler: (
    req: NextRequest,
    session: AuthSession,
    ctx: { params: Record<string, string> }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: RouteCtx): Promise<NextResponse> => {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (!allowed.includes(session.role as Role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    let resolvedParams: Record<string, string> = {};
    const raw = ctx?.params;
    if (raw) {
      resolvedParams =
        typeof (raw as Promise<unknown>).then === 'function'
          ? await (raw as Promise<Record<string, string>>)
          : (raw as Record<string, string>);
    }

    return handler(req, session, { params: resolvedParams });
  };
}

export async function requireSession(): Promise<AuthSession | NextResponse> {
  const s = await getAuthSession();
  if (!s) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  return s;
}
