import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getUser, updateUser } from '@/lib/services/user-service';
import type { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async (_req, _s, { params }) => {
  try {
    const u = await getUser(params.id);
    if (!u) return fail(new Error('No encontrado'), 404);
    const { password_hash: _ph, ...safe } = u;
    return ok(safe);
  } catch (e) {
    return fail(e);
  }
});

export const PATCH = withRole(['admin'], async (req: NextRequest, _s, { params }) => {
  try {
    const body = await readJson<{ name?: string; role?: Role; is_active?: boolean; password?: string }>(req);
    const u = await updateUser(params.id, body);
    const { password_hash: _ph, ...safe } = u;
    return ok(safe);
  } catch (e) {
    return fail(e);
  }
});
